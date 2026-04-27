const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

const repoRoot = path.resolve(__dirname, "..", "..");
const journeyJsonPath = path.join(repoRoot, "blogs", "data", "leh-ladakh-journey.json");
const outputDir = path.join(repoRoot, "blogs", "assets", "img", "journey");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getExtFromUrl(urlString) {
  try {
    const url = new URL(urlString);
    const ext = path.extname(url.pathname).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {}
  return ".jpg";
}

function fileNameForUrl(urlString) {
  const hash = crypto.createHash("sha1").update(urlString).digest("hex");
  return `${hash}${getExtFromUrl(urlString)}`;
}

function download(urlString, targetPath, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlString, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects > 5) {
          reject(new Error(`Too many redirects: ${urlString}`));
          return;
        }
        const nextUrl = new URL(res.headers.location, urlString).toString();
        res.resume();
        download(nextUrl, targetPath, redirects + 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${urlString}`));
        return;
      }

      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close(() => resolve());
      });
      fileStream.on("error", (err) => reject(err));
    });

    req.on("error", (err) => reject(err));
  });
}

function collectGoogleUrls(data) {
  const urls = new Set();
  const contentHtmlRegex = /https:\/\/blogger\.googleusercontent\.com\/img\/[^\s"'<>]+/g;

  for (const item of data) {
    if (item && typeof item.coverImage === "string" && item.coverImage.includes("blogger.googleusercontent.com")) {
      urls.add(item.coverImage);
    }

    if (item && Array.isArray(item.images)) {
      for (const imageUrl of item.images) {
        if (typeof imageUrl === "string" && imageUrl.includes("blogger.googleusercontent.com")) {
          urls.add(imageUrl);
        }
      }
    }

    if (item && typeof item.contentHtml === "string") {
      const matches = item.contentHtml.match(contentHtmlRegex) || [];
      for (const match of matches) {
        urls.add(match);
      }
    }
  }

  return [...urls];
}

function replaceInValue(value, replacements) {
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of replacements) {
      if (next.includes(from)) {
        next = next.split(from).join(to);
      }
    }
    return next;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceInValue(item, replacements));
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = replaceInValue(val, replacements);
    }
    return out;
  }

  return value;
}

async function main() {
  ensureDir(outputDir);

  const raw = fs.readFileSync(journeyJsonPath, "utf8");
  const safeRaw = raw.replace(/^\uFEFF/, "");
  const data = JSON.parse(safeRaw);

  const urls = collectGoogleUrls(data);
  console.log(`Found ${urls.length} unique googleusercontent URLs`);

  const replacements = new Map();
  let downloaded = 0;

  for (let i = 0; i < urls.length; i++) {
    const originalUrl = urls[i];
    const fileName = fileNameForUrl(originalUrl);
    const filePath = path.join(outputDir, fileName);
    const publicPath = `/blogs/assets/img/journey/${fileName}`;

    if (!fs.existsSync(filePath)) {
      try {
        await download(originalUrl, filePath);
        downloaded += 1;
      } catch (error) {
        console.error(`Failed to download: ${originalUrl}`);
        console.error(error.message);
        continue;
      }
    }

    replacements.set(originalUrl, publicPath);

    if ((i + 1) % 25 === 0 || i + 1 === urls.length) {
      console.log(`Processed ${i + 1}/${urls.length}`);
    }
  }

  const updated = replaceInValue(data, replacements);
  fs.writeFileSync(journeyJsonPath, `${JSON.stringify(updated, null, 4)}\n`, "utf8");

  console.log(`Downloaded ${downloaded} new files`);
  console.log(`Replaced ${replacements.size} URL mappings`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
