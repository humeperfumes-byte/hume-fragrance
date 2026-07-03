import fs from "fs";
import path from "path";
import https from "https";

const imagesToDownload = [
  {
    name: "naturals_hero.jpg",
    url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "rose_otto.jpg",
    url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "vetiver.jpg",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "chandan.jpg",
    url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "bela.jpg",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "mehndi.jpg",
    url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "mogra.jpg",
    url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "jasmine_grandiflorum.jpg",
    url: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "kewra.jpg",
    url: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "khus.jpg",
    url: "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=800"
  }
];

const targetDir = path.join(process.cwd(), "public", "images", "naturals");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      fileStream.on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on("error", reject);
  });
}

async function run() {
  console.log("Starting premium botanical images download...");
  for (const img of imagesToDownload) {
    const filePath = path.join(targetDir, img.name);
    console.log(`Downloading ${img.name} from Unsplash...`);
    try {
      await download(img.url, filePath);
      console.log(`Saved ${img.name} successfully.`);
    } catch (err) {
      console.error(`Failed to download ${img.name}:`, err);
    }
  }
  console.log("Download complete.");
}

run();
