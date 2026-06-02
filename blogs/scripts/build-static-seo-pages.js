const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const BLOGS_DIR = path.join(ROOT, "blogs");
const DATA_DIR = path.join(BLOGS_DIR, "data");
const SITE_URL = "https://indibargain.com";
const DEFAULT_IMAGE = `${SITE_URL}/blogs/assets/img/journey/016fa4f441412ff49bfa4ecb94d2d7f6a42d1b30.jpg`;
const GA_ID = "H4WZS892XR";
const TODAY = new Date().toISOString().slice(0, 10);

const SERIES = [
  { dataFile: "leh-ladakh-journey.json", basePath: "/blogs/journey", dayPath: "/blogs/journey/day", allPartsPath: "/blogs/journey/index.html", rootMirror: true },
  { dataFile: "assam-journey.json", basePath: "/blogs/journey/assam", dayPath: "/blogs/journey/assam/day", allPartsPath: "/blogs/journey/assam/index.html" },
  { dataFile: "city-of-lakes-journey.json", basePath: "/blogs/journey/city-of-lakes", dayPath: "/blogs/journey/city-of-lakes/day", allPartsPath: "/blogs/journey/city-of-lakes/index.html" },
  { dataFile: "goa-journey.json", basePath: "/blogs/journey/goa", dayPath: "/blogs/journey/goa/day", allPartsPath: "/blogs/journey/goa/index.html" },
  { dataFile: "golden-triangle-journey.json", basePath: "/blogs/journey/golden-triangle", dayPath: "/blogs/journey/golden-triangle/day", allPartsPath: "/blogs/journey/golden-triangle/index.html" },
  { dataFile: "jaisalmer-journey.json", basePath: "/blogs/journey/jaisalmer", dayPath: "/blogs/journey/jaisalmer/day", allPartsPath: "/blogs/journey/jaisalmer/index.html" },
  { dataFile: "kerala-backwaters-journey.json", basePath: "/blogs/journey/kerala-backwaters", dayPath: "/blogs/journey/kerala-backwaters/day", allPartsPath: "/blogs/journey/kerala-backwaters/index.html" },
  { dataFile: "pink-city-journey.json", basePath: "/blogs/journey/pink-city", dayPath: "/blogs/journey/pink-city/day", allPartsPath: "/blogs/journey/pink-city/index.html" },
  { dataFile: "rameshwaram-journey.json", basePath: "/blogs/journey/rameshwaram", dayPath: "/blogs/journey/rameshwaram/day", allPartsPath: "/blogs/journey/rameshwaram/index.html" },
  { dataFile: "valley-of-flowers-journey.json", basePath: "/blogs/journey/valley-of-flowers", dayPath: "/blogs/journey/valley-of-flowers/day", allPartsPath: "/blogs/journey/valley-of-flowers/index.html" }
];

const JOURNEY_SLUG_TO_SERIES = {
  "leh-ladakh-15-day-journey": "/blogs/journey/index.html",
  "valley-of-flowers-10-day-journey": "/blogs/journey/valley-of-flowers/index.html",
  "assam-east-india-8-day-itinerary": "/blogs/journey/assam/index.html",
  "goa-south-india-6-day-journey": "/blogs/journey/goa/index.html",
  "rameshwaram-south-india-5-day-journey": "/blogs/journey/rameshwaram/index.html",
  "golden-triangle-7-day-journey": "/blogs/journey/golden-triangle/index.html",
  "jaisalmer-5-day-desert-journey": "/blogs/journey/jaisalmer/index.html",
  "udaipur-city-of-lakes-4-day-journey": "/blogs/journey/city-of-lakes/index.html",
  "jaipur-pink-city-4-day-journey": "/blogs/journey/pink-city/index.html",
  "kerala-backwaters-6-day-journey": "/blogs/journey/kerala-backwaters/index.html"
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

function stripHtml(text) {
  return String(text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function htmlEscape(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absImage(image) {
  if (!image) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function fullUrl(p) {
  return `${SITE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\/+$/, "");
}

function getDescription(entry) {
  const raw = entry.excerpt || entry.content || stripHtml(entry.contentHtml || "");
  const cleaned = stripHtml(raw);
  return cleaned.slice(0, 155) || "India travel guide and practical trip planning details.";
}

function analyticsScript() {
  return `    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', '${GA_ID}');\n    </script>`;
}

function pageShell({ title, description, canonicalPath, ogType, ogImage, bodyHtml, keywords }) {
  const canonical = fullUrl(canonicalPath);
  const safeTitle = htmlEscape(title);
  const safeDesc = htmlEscape(description);
  const safeKeywords = htmlEscape(keywords || "India travel blog, India itinerary, destination guide India");
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>${safeTitle}</title>\n    <meta name="description" content="${safeDesc}">\n    <meta name="keywords" content="${safeKeywords}">\n    <meta name="robots" content="index, follow">\n    <link rel="canonical" href="${canonical}">\n    <meta property="og:type" content="${ogType}">\n    <meta property="og:title" content="${safeTitle}">\n    <meta property="og:description" content="${safeDesc}">\n    <meta property="og:url" content="${canonical}">\n    <meta property="og:site_name" content="IndiBargain">\n    <meta property="og:image" content="${ogImage}">\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="${safeTitle}">\n    <meta name="twitter:description" content="${safeDesc}">\n    <meta name="twitter:image" content="${ogImage}">\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">\n    <link rel="stylesheet" href="/blogs/assets/css/blog.css?v=20260602seo2">\n${analyticsScript()}\n</head>\n<body>\n    <header class="blog-header">\n        <a class="brand" href="/">IndiBargain</a>\n        <nav aria-label="Blog navigation">\n            <a href="/blogs/index.html" aria-current="page" class="active">Travel Blogs</a>\n            <a href="/json-utils/index.html">JSON Utils</a>\n            <a href="/time-utils/index.html">Time Utils</a>\n        </nav>\n    </header>\n\n    <main class="container">\n${bodyHtml}\n    </main>\n\n    <footer class="blog-footer">\n        <p>© IndiBargain</p>\n    </footer>\n</body>\n</html>\n`;
}

function renderPostStatic(post) {
  const urlPath = `/blogs/post/${post.slug}/`;
  const description = getDescription(post);
  const title = `${post.title} | IndiBargain Travel Blog`;
  const ogImage = absImage(post.coverImage || "");
  const linked = (post.content || "")
    .replace(/\n/g, "<br><br>")
    .replace(/journey\/index\.html/g, '<a href="/blogs/journey/index.html">journey/index.html</a>');

  const seriesLink = JOURNEY_SLUG_TO_SERIES[post.slug]
    ? `<p><a href="${JOURNEY_SLUG_TO_SERIES[post.slug]}">Open full journey series →</a></p>`
    : "";

  const body = `        <article class="post-shell">\n            <p class="eyebrow">${htmlEscape(post.category || "Travel")}</p>\n            <h1>${htmlEscape(post.title)}</h1>\n            <p class="post-meta">\n                <span>${new Date(post.date).toLocaleDateString("en-CA")}</span>\n                <span>${htmlEscape(post.readTime || "3 min read")}</span>\n                <span>By ${htmlEscape(post.author || "IndiBargain")}</span>\n            </p>\n            ${post.coverImage ? `<img class="post-cover" src="${htmlEscape(post.coverImage)}" alt="${htmlEscape(post.title)} cover" loading="lazy">` : ""}\n            <div class="post-content">${linked}</div>\n            ${seriesLink}\n            <p><a href="/blogs/index.html">← Back to all articles</a></p>\n        </article>`;

  return { path: urlPath, html: pageShell({ title, description, canonicalPath: urlPath, ogType: "article", ogImage, bodyHtml: body, keywords: `${post.title}, India travel blog, destination guide India, travel itinerary India` }) };
}

function linkLocalJourney(contentHtml, currentPath, bySource) {
  if (!contentHtml) return "";
  return String(contentHtml).replace(/href="([^"]+)"/gi, (match, href) => {
    try {
      const u = new URL(href, SITE_URL);
      const key = normalize(u.href);
      if (bySource.has(key) && bySource.get(key) !== currentPath) {
        return `href="${bySource.get(key)}"`;
      }
    } catch (error) {
    }
    return match;
  });
}

function renderJourneyDay(entry, options) {
  const { dayPath, allPartsPath, prevPath, nextPath, total, index, bySource } = options;
  const slugPath = `${dayPath}/${entry.slug}/`;
  const description = getDescription(entry);
  const title = `${entry.title || entry.day} | IndiBargain Travel Blog`;
  const ogImage = absImage((entry.images && entry.images[0]) || entry.coverImage || "");
  const content = entry.contentHtml
    ? linkLocalJourney(entry.contentHtml, slugPath, bySource)
    : htmlEscape(entry.content || "").replace(/\r?\n\r?\n/g, "<br><br>").replace(/\r?\n/g, "<br>");

  const body = `        <article class="post-shell">\n            <p class="eyebrow">${htmlEscape(entry.day || `Part ${index + 1}`)}</p>\n            <h1>${htmlEscape(entry.title || entry.day || `Part ${index + 1}`)}</h1>\n            <p class="post-meta">\n                <span>${new Date(entry.date).toLocaleDateString("en-CA")}</span>\n                <span>Part ${index + 1} / ${total}</span>\n            </p>\n            ${entry.images && entry.images.length ? `<div class="journey-gallery">${entry.images.slice(0, 4).map((src, i) => `<img src="${htmlEscape(src)}" alt="${htmlEscape(entry.title || entry.day)} photo ${i + 1}" loading="lazy">`).join("")}</div>` : ""}\n            <div class="post-content">${content}</div>\n            ${entry.sourceUrl ? `<p class="post-source"><a href="${htmlEscape(entry.sourceUrl)}" target="_blank" rel="noopener">Reference source ↗</a></p>` : ""}\n            <div class="journey-nav">\n                ${prevPath ? `<a href="${prevPath}">← Previous part</a>` : "<span></span>"}\n                <a href="${allPartsPath}">All parts</a>\n                ${nextPath ? `<a href="${nextPath}">Next part →</a>` : "<span></span>"}\n            </div>\n        </article>`;

  return { path: slugPath, html: pageShell({ title, description, canonicalPath: slugPath, ogType: "article", ogImage, bodyHtml: body, keywords: `${entry.title || entry.day}, India travel itinerary, journey day guide, IndiBargain` }) };
}

function toDiskPath(urlPath) {
  const clean = urlPath.replace(/^\//, "");
  return path.join(ROOT, clean, "index.html");
}

function ensureTrailingSlash(urlPath) {
  return urlPath.endsWith("/") ? urlPath : `${urlPath}/`;
}

function urlEntry(u) {
  return {
    loc: fullUrl(u),
    lastmod: TODAY,
    changefreq: u.includes("/day/") || u.includes("/post/") ? "weekly" : "daily",
    priority: u === "/" ? "1.0" : u.includes("/blogs/") ? "0.8" : "0.7"
  };
}

function writeUrlSet(fileName, entries) {
  const xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...entries.map((entry) => `  <url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`),
    "</urlset>",
    ""
  ].join("\n");

  writeFile(path.join(ROOT, fileName), xml);
}

function writeSitemapIndex(fileName, childSitemaps) {
  const xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...childSitemaps.map((name) => `  <sitemap><loc>${fullUrl(`/${name}`)}</loc><lastmod>${TODAY}</lastmod></sitemap>`),
    "</sitemapindex>",
    ""
  ].join("\n");

  writeFile(path.join(ROOT, fileName), xml);
}

function build() {
  const generatedUrls = new Set();

  const posts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "posts.json"), "utf8"));
  for (const post of posts) {
    const page = renderPostStatic(post);
    writeFile(toDiskPath(page.path), page.html);
    generatedUrls.add(ensureTrailingSlash(page.path));
  }

  for (const series of SERIES) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, series.dataFile), "utf8"));
    if (!Array.isArray(items) || items.length === 0) continue;

    const bySource = new Map();
    for (const item of items) {
      if (item && item.sourceUrl && item.slug) {
        bySource.set(normalize(item.sourceUrl), `${series.dayPath}/${item.slug}/`);
      }
    }

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (!item || !item.slug) continue;

      const prevPath = i > 0 ? `${series.dayPath}/${items[i - 1].slug}/` : "";
      const nextPath = i < items.length - 1 ? `${series.dayPath}/${items[i + 1].slug}/` : "";

      const page = renderJourneyDay(item, {
        dayPath: series.dayPath,
        allPartsPath: series.allPartsPath,
        prevPath,
        nextPath,
        total: items.length,
        index: i,
        bySource
      });

      writeFile(toDiskPath(page.path), page.html);
      generatedUrls.add(ensureTrailingSlash(page.path));

      if (series.rootMirror) {
        const mirrorPath = `/journey/day/${item.slug}/`;
        const mirrorHtml = page.html
          .replaceAll(`${SITE_URL}${page.path}`, `${SITE_URL}${mirrorPath}`)
          .replaceAll(`href="${page.path}"`, `href="${mirrorPath}"`)
          .replaceAll(`href="${prevPath}"`, prevPath ? `href="/journey/day/${items[i - 1].slug}/"` : "href=\"\"")
          .replaceAll(`href="${nextPath}"`, nextPath ? `href="/journey/day/${items[i + 1].slug}/"` : "href=\"\"")
          .replaceAll(`href="${series.allPartsPath}"`, "href=\"/journey/index.html\"");

        writeFile(toDiskPath(mirrorPath), mirrorHtml);
        generatedUrls.add(ensureTrailingSlash(mirrorPath));
      }
    }
  }

  const staticCore = [
    "/",
    "/blogs/",
    "/blogs/post/",
    "/blogs/journey/",
    "/blogs/journey/day/",
    "/blogs/journey/assam/",
    "/blogs/journey/assam/day/",
    "/blogs/journey/city-of-lakes/",
    "/blogs/journey/city-of-lakes/day/",
    "/blogs/journey/goa/",
    "/blogs/journey/goa/day/",
    "/blogs/journey/golden-triangle/",
    "/blogs/journey/golden-triangle/day/",
    "/blogs/journey/jaisalmer/",
    "/blogs/journey/jaisalmer/day/",
    "/blogs/journey/kerala-backwaters/",
    "/blogs/journey/kerala-backwaters/day/",
    "/blogs/journey/pink-city/",
    "/blogs/journey/pink-city/day/",
    "/blogs/journey/rameshwaram/",
    "/blogs/journey/rameshwaram/day/",
    "/blogs/journey/valley-of-flowers/",
    "/blogs/journey/valley-of-flowers/day/",
    "/journey/",
    "/journey/day/",
    "/json-utils/",
    "/time-utils/"
  ];

  const allUrls = Array.from(new Set([...staticCore.map(ensureTrailingSlash), ...generatedUrls])).sort();

  const postsUrls = allUrls.filter((u) => u.startsWith("/blogs/post/"));
  const journeyDayUrls = allUrls.filter((u) => u.includes("/day/"));
  const utilitiesUrls = allUrls.filter((u) => ["/json-utils/", "/time-utils/"].includes(u));

  const coreUrls = allUrls.filter((u) =>
    !postsUrls.includes(u) &&
    !journeyDayUrls.includes(u) &&
    !utilitiesUrls.includes(u)
  );

  const sitemapFiles = [
    "sitemap-core.xml",
    "sitemap-posts.xml",
    "sitemap-journey-days.xml",
    "sitemap-utilities.xml"
  ];

  writeUrlSet("sitemap-core.xml", coreUrls.map(urlEntry));
  writeUrlSet("sitemap-posts.xml", postsUrls.map(urlEntry));
  writeUrlSet("sitemap-journey-days.xml", journeyDayUrls.map(urlEntry));
  writeUrlSet("sitemap-utilities.xml", utilitiesUrls.map(urlEntry));
  writeSitemapIndex("sitemap.xml", sitemapFiles);

  console.log(`Generated ${generatedUrls.size} static content URLs and ${sitemapFiles.length} section sitemaps with index.`);
}

build();
