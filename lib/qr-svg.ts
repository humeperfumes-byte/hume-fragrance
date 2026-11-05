import qrcode from "qrcode-generator";

// Reference style: black square modules, rounded finder frames, white background.
// Keep four full modules of quiet zone and do not mask any encoded data.
export function makeQrSvg(value: string): string {
  const qr = qrcode(0, "H");
  qr.addData(value, "Byte");
  qr.make();
  const count = qr.getModuleCount();
  const cell = 10;
  const margin = cell * 4;
  const size = count * cell + margin * 2;
  const foreground = "#000000";
  const eyes = [[0, 0], [0, count - 7], [count - 7, 0]];
  const paths: string[] = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      const finder = eyes.some(([r, c]) => row >= r && row < r + 7 && col >= c && col < c + 7);
      if (!finder && qr.isDark(row, col)) {
        const x = margin + col * cell + 0.7;
        const y = margin + row * cell + 0.7;
        paths.push(`M${x},${y}h8.6v8.6h-8.6z`);
      }
    }
  }
  const finders = eyes.map(([row, col]) => {
    const x = margin + col * cell;
    const y = margin + row * cell;
    return `<rect x="${x}" y="${y}" width="70" height="70" rx="16" fill="${foreground}"/><rect x="${x + 10}" y="${y + 10}" width="50" height="50" rx="7" fill="white"/><rect x="${x + 20}" y="${y + 20}" width="30" height="30" rx="5" fill="${foreground}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="white"/><path d="${paths.join("")}" fill="${foreground}"/>${finders}</svg>`;
}
