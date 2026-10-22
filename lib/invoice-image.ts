/** Capture the actual preview, including its loaded website fonts and spacing. */
export async function captureInvoicePreview(container: HTMLElement) {
  const {toCanvas,getFontEmbedCSS}=await import('html-to-image');
  await document.fonts.ready;
  const computed=getComputedStyle(container);
  const width=parseFloat(computed.width) || container.offsetWidth;
  const host=document.createElement('div');
  host.setAttribute('aria-hidden','true');
  host.style.cssText=`position:fixed;left:-10000px;top:0;width:${width}px;pointer-events:none;`;
  const copy=container.cloneNode(true) as HTMLElement;
  copy.classList.remove('print-container');
  for(const [property,value] of Object.entries({width:`${width}px`,height:'auto','min-height':computed.minHeight,'max-height':'none',transform:'none',zoom:'1',visibility:'visible',margin:'0',display:'block','box-shadow':'none',overflow:'visible','box-sizing':'border-box','font-family':computed.fontFamily}))copy.style.setProperty(property,value,'important');
  for(const variable of ['--font-sans','--font-serif','--font-mono'])copy.style.setProperty(variable,computed.getPropertyValue(variable));
  host.appendChild(copy);document.body.appendChild(host);
  try {
    await Promise.all(Array.from(copy.querySelectorAll('img')).map(async image=>{await image.decode();if(!image.naturalWidth)throw new Error('The invoice logo could not load. Please retry.');}));
    const bounds=copy.getBoundingClientRect(),height=Math.ceil(bounds.height);
    const protectedBlocks=Array.from(copy.querySelectorAll('tr,p,.break-inside-avoid')).map(element=>{const rect=element.getBoundingClientRect();return {top:rect.top-bounds.top,bottom:rect.bottom-bounds.top};});
    const fontEmbedCSS=await getFontEmbedCSS(copy,{preferredFontFormat:'woff2'});
    const canvas=await toCanvas(copy,{width,height,pixelRatio:2,backgroundColor:'#ffffff',fontEmbedCSS});
    return {canvas,width,height,protectedBlocks};
  } finally {host.remove();}
}

export async function createInvoiceImage(container:HTMLElement):Promise<Blob>{
  const {canvas}=await captureInvoicePreview(container);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not render invoice image')),'image/png'));
}
