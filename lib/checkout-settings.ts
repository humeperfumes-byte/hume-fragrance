/** Product features are configured in code, not deployment environment variables. */
export const CHECKOUT_FEATURES = Object.freeze({
  secureCheckout: true,
  customerOrderLinks: true,
  checkoutResumeLinks: true,
  errorMonitoring: true,
  coinRedemption: false,
});

export const secureCheckoutConfigured = () => CHECKOUT_FEATURES.secureCheckout;
export const errorMonitoringConfigured = () => CHECKOUT_FEATURES.errorMonitoring;
