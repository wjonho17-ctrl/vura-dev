import { reactive } from 'vue'
import { authApi } from '../api/auth'

function getToken() {
  return localStorage.getItem('vsdc_token') || null
}

function getIsAdmin() {
  return localStorage.getItem('vsdc_is_admin') === '1'
}

function buildProfile(user) {
  if (!user) return null
  const name = user.fullName || user.taxPayerName || 'Operator'
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')

  return {
    name,
    role: user.taxPayerName || 'Device Operator',
    initials: initials || 'OP',
    tin: user.tin || '—',
    branch: user.branchName || '—',
    device: user.sdcId || user.serialNo || '—',
    isTrainingMode: user.isTrainingMode || false,
  }
}

const state = reactive({
  token: getToken(),
  isAdmin: getIsAdmin(),
  user: null,
  authLoading: false,
  authError: null,
})

async function refreshUser() {
  if (!state.token || state.isAdmin) {
    state.user = null
    return null
  }

  state.authLoading = true
  try {
    const data = await authApi.userInfo()
    state.user = buildProfile(data)
    return state.user
  } finally {
    state.authLoading = false
  }
}

function extractToken(payload) {
  if (!payload) return null
  return payload?.value || payload?.token?.token || payload?.token || null
}

async function login(email, password, isAdmin = false) {
  state.authLoading = true
  state.authError = null

  try {
    const result = isAdmin
      ? await authApi.loginAdmin(email, password)
      : await authApi.loginUser(email, password)

    const token = extractToken(result)
    if (!token || typeof token !== 'string') {
      throw new Error('Unable to authenticate. Missing token from server.')
    }

    localStorage.setItem('vsdc_token', token)
    localStorage.setItem('vsdc_is_admin', isAdmin ? '1' : '0')

    state.token = token
    state.isAdmin = isAdmin

    if (!isAdmin) {
      await refreshUser()
    } else {
      state.user = null
    }

    return token
  } catch (error) {
    state.authError = error?.message || 'Authentication failed.'
    throw error
  } finally {
    state.authLoading = false
  }
}

function logout() {
  localStorage.removeItem('vsdc_token')
  localStorage.removeItem('vsdc_is_admin')
  state.token = null
  state.user = null
  state.isAdmin = false
  state.authError = null
}

export { state, login, logout, refreshUser }
