/** Enabled by default; explicit false remains available for controlled rollout. */
export const secureCheckoutConfigured = () => process.env.ENABLE_SECURE_CHECKOUT !== "false";
export const errorMonitoringConfigured = () => process.env.ENABLE_ERROR_MONITORING !== "false";
