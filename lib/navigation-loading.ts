export const NAVIGATION_LOADING_EVENT = "hume:navigation-loading";

export function showNavigationLoadingToast(title = "Opening page") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(NAVIGATION_LOADING_EVENT, {
      detail: { title },
    }),
  );
}
