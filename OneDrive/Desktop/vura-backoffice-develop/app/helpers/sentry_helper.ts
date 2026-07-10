import app from "@adonisjs/core/services/app";
import { Sentry } from "@rlanz/sentry";

type sentryType = 'contact_support' | 'payment_error' | 'order_error' | 'ai_error'

export function captureSentryContactSupportError(error: any, user?: { email?: string, username?: string }, type: sentryType = 'contact_support') {
    if (app.inDev) {
        console.error(error)
        return
    }

    if (!app.inProduction) return

    Sentry.captureException(error, { tags: { type }, user })
}

