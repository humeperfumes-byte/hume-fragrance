export const CUSTOMER_ACCOUNT_STORAGE_KEY = "hume_customer_account_v1";
export const CHECKOUT_DETAILS_STORAGE_KEY = "hume_checkout_details_v1";
export const CHECKOUT_SESSION_STORAGE_KEY = "hume_checkout_session_id";
export const CART_SESSION_STORAGE_KEY = "hume_cart_session_id";

export type CustomerAccountDetails = {
  fullName?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
};

export type StoredCustomerAccount = {
  sessionId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  loggedInAt: string;
  updatedAt: string;
};

function cleaned(value?: string) {
  return value?.trim() || "";
}

function hasLoginIdentity(details: CustomerAccountDetails) {
  return (
    cleaned(details.fullName).length > 1 &&
    cleaned(details.phone).replace(/\D/g, "").length >= 10
  );
}

export function getStoredCheckoutSessionId(storage: Storage) {
  return (
    storage.getItem(CHECKOUT_SESSION_STORAGE_KEY) ||
    storage.getItem(CART_SESSION_STORAGE_KEY) ||
    ""
  );
}

export function readStoredCustomerAccount(storage: Storage) {
  try {
    const raw = storage.getItem(CUSTOMER_ACCOUNT_STORAGE_KEY);
    if (!raw) return null;
    const account = JSON.parse(raw) as StoredCustomerAccount;
    if (!account?.sessionId || !account.fullName || !account.phone) return null;
    return account;
  } catch {
    return null;
  }
}

export function readStoredCheckoutDetails(storage: Storage) {
  try {
    const raw = storage.getItem(CHECKOUT_DETAILS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CustomerAccountDetails;
  } catch {
    return null;
  }
}

export function persistCustomerAccountFromCheckout(
  storage: Storage,
  sessionId: string,
  details: CustomerAccountDetails,
) {
  if (!sessionId || !hasLoginIdentity(details)) return null;

  const existing = readStoredCustomerAccount(storage);
  const now = new Date().toISOString();
  const account: StoredCustomerAccount = {
    sessionId,
    fullName: cleaned(details.fullName),
    phone: cleaned(details.phone),
    alternatePhone: cleaned(details.alternatePhone) || undefined,
    email: cleaned(details.email) || undefined,
    addressLine1: cleaned(details.addressLine1) || undefined,
    addressLine2: cleaned(details.addressLine2) || undefined,
    city: cleaned(details.city) || undefined,
    state: cleaned(details.state) || undefined,
    pincode: cleaned(details.pincode) || undefined,
    notes: cleaned(details.notes) || undefined,
    loggedInAt: existing?.loggedInAt || now,
    updatedAt: now,
  };

  storage.setItem(CUSTOMER_ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  storage.setItem(CHECKOUT_SESSION_STORAGE_KEY, sessionId);
  storage.setItem(CART_SESSION_STORAGE_KEY, sessionId);
  return account;
}

export function clearStoredCustomerAccount(storage: Storage) {
  storage.removeItem(CUSTOMER_ACCOUNT_STORAGE_KEY);
}
