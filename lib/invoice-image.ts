/** Render an unscaled, content-height copy without changing the live preview. */
export async function createInvoiceImage(container: HTMLElement): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  await document.fonts.ready;
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;pointer-events:none;";
  const copy = container.cloneNode(true) as HTMLElement;
  copy.classList.remove("print-container");
  for (const [property, value] of Object.entries({ width: "800px", height: "auto", "min-height": "0", "max-height": "none", transform: "none", margin: "0", display: "block", "box-shadow": "none", overflow: "visible", "box-sizing": "border-box" })) copy.style.setProperty(property, value, "important");
  copy.style.setProperty("font-family", "Arial, sans-serif", "important");
  host.appendChild(copy);
  document.body.appendChild(host);
  try {
    await Promise.all(Array.from(copy.querySelectorAll("img")).map(image => image.decode().catch(() => undefined)));
    const height = Math.ceil(copy.getBoundingClientRect().height);
    const blob = await toBlob(copy, { width: 800, height, pixelRatio: 2, backgroundColor: "#ffffff", skipFonts: true });
    if (!blob) throw new Error("Could not render the invoice image");
    return blob;
  } finally { host.remove(); }
}
