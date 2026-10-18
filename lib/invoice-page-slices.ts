/** Preserve displayed rows/paragraphs where they fit on an A4 page. */
export function invoicePageSlices(height:number,pageHeight:number,blocks:Array<{top:number;bottom:number}>) {
 const slices:Array<{top:number;height:number}>=[];let top=0;
 while(top<height-.5){
  let end=Math.min(height,top+pageHeight);
  for(const block of [...blocks].sort((a,b)=>a.top-b.top)){
   if(block.top>top+1&&block.top<end&&block.bottom>end&&block.bottom-block.top<=pageHeight){end=block.top;break;}
  }
  if(end<=top+1)end=Math.min(height,top+pageHeight);
  slices.push({top,height:end-top});top=end;
 }
 return slices;
}
