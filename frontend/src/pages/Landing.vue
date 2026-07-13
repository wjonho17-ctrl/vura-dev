<template>
  <div class="landing-page">
    <header class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="navbar-brand">
          <BrandMark />
          <span class="brand-name">VSDC Manager</span>
        </router-link>
        <nav class="navbar-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#workflow" class="nav-link">How it works</a>
          <a href="#compliance" class="nav-link">Compliance</a>
          <a href="#pricing" class="nav-link">Pricing</a>
        </nav>
        <div class="navbar-actions">
          <Button
            label="Sign in"
            icon="pi pi-sign-in"
            class="p-button-rounded p-button-text"
            @click="goLogin"
          />
          <Button
            label="Get Started"
            icon="pi pi-arrow-right"
            class="p-button-rounded p-button-primary"
            @click="goDashboard"
          />
        </div>
      </div>
    </header>

    <main class="landing-content">
      <section class="hero">
        <div class="hero-content">
          <Tag
            value="EBM 2.1 Compliant"
            severity="success"
            class="hero-badge"
          />
          <h1 class="hero-title">
            Modern electronic billing<br />and stock management for SMEs
          </h1>
          <p class="hero-description">
            Use a secure, responsive business dashboard built for Rwandan tax compliance,
            branch operations, stock control, customers and receipts.
          </p>
          <div class="hero-actions">
            <Button
              label="Open Dashboard"
              icon="pi pi-arrow-right"
              class="p-button-rounded p-button-lg p-button-primary"
              @click="goDashboard"
            />
            <Button
              label="Learn More"
              icon="pi pi-book"
              class="p-button-rounded p-button-lg p-button-text"
              @click="scrollToFeatures"
            />
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-placeholder">
            <i class="pi pi-chart-bar" />
          </div>
        </div>
      </section>

      <section id="features" class="features-section">
        <div class="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to manage your business efficiently</p>
        </div>
        <div class="features-grid">
          <Card v-for="feature in features" :key="feature.id" class="feature-card">
            <template #header>
              <div class="feature-icon" :style="{ background: feature.color }">
                <i :class="feature.icon" />
              </div>
            </template>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </Card>
        </div>
      </section>

      <section id="compliance" class="compliance-section">
        <Card class="compliance-card">
          <div class="compliance-content">
            <div class="compliance-info">
              <h2>RRA EBM 2.1 Compliant</h2>
              <p>
                Fully compliant with Rwanda's Electronic Billing Machine 2.1 standards.
                All invoices and receipts meet regulatory requirements for tax compliance.
              </p>
              <div class="compliance-features">
                <div class="compliance-item">
                  <i class="pi pi-check" />
                  <span>Secure transaction logging</span>
                </div>
                <div class="compliance-item">
                  <i class="pi pi-check" />
                  <span>Real-time RRA reporting</span>
                </div>
                <div class="compliance-item">
                  <i class="pi pi-check" />
                  <span>Audit trail management</span>
                </div>
                <div class="compliance-item">
                  <i class="pi pi-check" />
                  <span>Encrypted data storage</span>
                </div>
              </div>
            </div>
            <div class="compliance-icon">
              <i class="pi pi-shield" />
            </div>
          </div>
        </Card>
      </section>

      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to modernize your business?</h2>
          <p>Join hundreds of businesses using VSDC Manager for efficient operations</p>
          <Button
            label="Start Free Today"
            icon="pi pi-rocket"
            class="p-button-rounded p-button-lg p-button-primary"
            @click="goDashboard"
          />
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>VSDC Manager</h4>
          <p>Electronic Billing for Rwanda</p>
        </div>
        <div class="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Support</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Compliance</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 VSDC Manager. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BrandMark from '../components/ui/BrandMark.vue'

const router = useRouter()

const features = [
  {
    id: 1,
    icon: 'pi pi-shopping-cart',
    title: 'Billing & Invoicing',
    description: 'Create, track, and manage invoices with automatic RRA compliance and receipt generation.',
    color: '#3b82f6',
  },
  {
    id: 2,
    icon: 'pi pi-box',
    title: 'Stock Management',
    description: 'Real-time inventory tracking, stock transfers, and automated reorder alerts.',
    color: '#22c55e',
  },
  {
    id: 3,
    icon: 'pi pi-users',
    title: 'Customer Management',
    description: 'Organize customer information, track purchases, and manage customer profiles.',
    color: '#f59e0b',
  },
  {
    id: 4,
    icon: 'pi pi-chart-bar',
    title: 'Reporting & Analytics',
    description: 'Comprehensive reports including daily, X, Z, and period reports for business insights.',
    color: '#ec4899',
  },
  {
    id: 5,
    icon: 'pi pi-shield-check',
    title: 'Compliance & Security',
    description: 'Audit trails, secure data encryption, and full RRA EBM 2.1 regulatory compliance.',
    color: '#8b5cf6',
  },
  {
    id: 6,
    icon: 'pi pi-multi-branch',
    title: 'Multi-Branch Operations',
    description: 'Manage multiple branches from one dashboard with centralized reporting and control.',
    color: '#06b6d4',
  },
]

function goLogin() {
  router.push('/login')
}

function goDashboard() {
  router.push('/dashboard')
}

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.navbar {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.125rem;
  white-space: nowrap;
}

.brand-name {
  font-size: 1rem;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.landing-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hero {
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-badge {
  width: fit-content;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: var(--text-color);
}

.hero-description {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-placeholder {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-400) 100%);
  border-radius: 16px;
  font-size: 4rem;
  color: white;
}

.features-section,
.compliance-section,
.cta-section {
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.section-header p {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  border-radius: 12px;
  overflow: hidden;
}

.feature-card :deep(.p-card-header) {
  padding: 0;
}

.feature-icon {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
}

.feature-content {
  padding: 1.5rem;
}

.feature-content h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.feature-content p {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.compliance-section {
  background-color: var(--primary-50);
  border-radius: 16px;
  margin: 2rem auto;
}

.compliance-card {
  border-radius: 12px;
}

.compliance-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 3rem;
}

.compliance-info h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.compliance-info p {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.compliance-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compliance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-color);
  font-weight: 500;
}

.compliance-item i {
  font-size: 1.5rem;
  color: var(--green-500);
}

.compliance-icon {
  font-size: 8rem;
  color: var(--primary-color);
  opacity: 0.2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-400) 100%);
  border-radius: 16px;
  margin: 2rem auto;
  text-align: center;
}

.cta-content {
  padding: 4rem 2rem;
  color: white;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.cta-content p {
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.footer {
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  margin-top: auto;
  padding: 3rem 2rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.footer-section p,
.footer-section a {
  color: var(--text-color-secondary);
  text-decoration: none;
  margin: 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-section a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .navbar-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .navbar-links {
    flex: 1;
    gap: 1rem;
  }

  .hero {
    grid-template-columns: 1fr;
    padding: 4rem 2rem;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .compliance-content {
    grid-template-columns: 1fr;
  }

  .compliance-icon {
    font-size: 4rem;
  }
}

@media (max-width: 640px) {
  .navbar-container {
    padding: 1rem;
  }

  .navbar-links {
    display: none;
  }

  .navbar-actions {
    flex-wrap: wrap;
    width: 100%;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .hero-placeholder {
    height: 300px;
  }
}
</style>
