/** Searchable invoice names: invoice date, export/save time in IST, buyer, brand. */
export function invoiceFilename(customerName: string, invoiceDate: string, now = new Date()) {
  const time = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now).replace(/:/g,'-');
  const customer = customerName.normalize('NFC').replace(/[<>:"/\\|?*\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().replace(/[. ]+$/g,'').slice(0,120) || 'Customer';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(invoiceDate) ? invoiceDate : new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  return `${date} ${time} ${customer} HUME Fragrance`;
}
