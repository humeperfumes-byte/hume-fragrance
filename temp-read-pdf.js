const fs = require('fs');
const pdf = require('pdf-parse');
const p = 'C:/Users/athen/Downloads/report.pdf';
const data = fs.readFileSync(p);
pdf(data).then(r => {
  console.log(r.text);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
