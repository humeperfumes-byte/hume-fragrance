import {captureInvoicePreview} from './invoice-image';
import {invoicePageSlices} from './invoice-page-slices';

/** Embed the preview itself: no substitute font, extra text, rules or page labels. */
export async function downloadInvoicePreview(container:HTMLElement,filename:string) {
 const [{jsPDF},preview]=await Promise.all([import('jspdf'),captureInvoicePreview(container)]);
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 const pageWidth=pdf.internal.pageSize.getWidth(),pageHeight=pdf.internal.pageSize.getHeight();
 const slices=invoicePageSlices(preview.height,preview.width*pageHeight/pageWidth,preview.protectedBlocks);
 const scale=preview.canvas.width/preview.width;
 for(let index=0;index<slices.length;index++){
  const slice=slices[index];if(index)pdf.addPage();
  const canvas=document.createElement('canvas');canvas.width=preview.canvas.width;canvas.height=Math.max(1,Math.round(slice.height*scale));
  const context=canvas.getContext('2d');if(!context)throw new Error('Your browser could not prepare the invoice PDF.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(preview.canvas,0,Math.round(slice.top*scale),preview.canvas.width,canvas.height,0,0,canvas.width,canvas.height);
  pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,pageWidth,slice.height*pageWidth/preview.width,undefined,'FAST');
  canvas.width=0;canvas.height=0;
 }
 pdf.setProperties({title:filename,author:'HUME Fragrance'});
 await pdf.save(filename,{returnPromise:true});
}
