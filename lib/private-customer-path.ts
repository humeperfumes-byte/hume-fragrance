export function isPrivateCustomerPath(pathname: string) {
  return /^\/(?:us\/|ca\/|au\/|eu\/|ae\/|sa\/)?(?:order|checkout)\/.+/i.test(pathname);
}
