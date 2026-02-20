import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://2b2933a6937d661456f1651a4c12070e@o4510743534829568.ingest.us.sentry.io/4510743552000000",
    integrations: [Sentry.browserTracingIntegration()],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    
    // Enable source maps
    release: `virtual-library@${process.env.REACT_APP_VERSION || '1.0.0'}`,
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
  });
