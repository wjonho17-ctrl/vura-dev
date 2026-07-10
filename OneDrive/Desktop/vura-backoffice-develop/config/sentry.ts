import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@rlanz/sentry'
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export default defineConfig({
  /**
   * Enable or disable Sentry
   */
  enabled: app.inProduction,

  /**
   * The environment Sentry is running in
   */
  environment: app.nodeEnvironment,

  /**
   * The DSN of the project
   */
  dsn: env.get('SENTRY_DSN'),

  /**
   * Additional integrations to use with the Sentry SDK
   * @see https://docs.sentry.io/platforms/javascript/guides/node/configuration/integrations/#available-integrations
   */
  //FIXME: add sentry integrations
  //@ts-ignore
  integrations: [nodeProfilingIntegration()],
  profilesSampleRate: 0.2,

  /**
   * The sample rate of traces to send to Sentry
   * @see https://docs.sentry.io/platforms/javascript/guides/node/configuration/sampling
   */
  tracesSampleRate: 0.2,
  
  // Send structured logs to Sentry
  enableLogs: true,
  // Set sampling rate for profiling - this is evaluated only once per SDK.init call
  profileSessionSampleRate: 1.0,
  // Trace lifecycle automatically enables profiling during active traces
  profileLifecycle: 'trace',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})
