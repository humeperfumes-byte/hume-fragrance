// Historical product names must keep resolving after display-name edits.
export const PRODUCT_ROUTE_ALIASES: Record<string, string> = {
  "hume-hugo-boss-inspired-by-hugo-boss-hugo-man": "hugo-boss",
  "hume-althair-inspired-by-parfums-de-marly-altha-r": "althair",
  "hume-althair-inspired-by-pdm-althair": "althair",
  "hume-aqua-inspired-by-giorgio-armani-acqua-di-gio-profondo": "acqua-di-gio-profondo",
  "hume-deep-ocean-inspired-by-giorgio-armani-acqua-di-gio-profondo": "acqua-di-gio-profondo",
  "hume-y-intense-inspired-by-yves-saint-laurent-ysl-y-edp": "ysl-y-edp",
  "hume-y-edp-inspired-by-yves-saint-laurent-ysl-y-edp": "ysl-y-edp",
  "hume-your-intense-inspired-by-emporio-armani-emporio-armani-stronger-with-you-intensely": "stronger-with-you-intensely",
  "hume-nomade-noir-inspired-by-louis-vuitton-ombre-nomade": "ombre-nomade",
  "hume-infinite-vision-inspired-by-louis-vuitton-imagination": "lv-imagination",
  "hume-leather-eclipse-inspired-by-tom-ford-ombre-leather": "ombre-leather",
  "hume-bleu-intense-inspired-by-chanel-bleu-de-chanel": "bleu-de-chanel",
};

// Keep the ID with existing reviews as the canonical record; preserve the
// duplicate row for historical carts/orders rather than deleting it.
export const PRODUCT_ID_ALIASES: Record<string, string> = {
  "tom-ford-oud-wood": "oud-wood",
};
