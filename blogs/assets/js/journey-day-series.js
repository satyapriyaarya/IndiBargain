const journeyPost = document.getElementById("journeyPost");
const seriesConfig = window.JOURNEY_SERIES_CONFIG || {};
let journeyItemsCache = null;

function getConfigValue(key, fallback) {
    return typeof seriesConfig[key] === "string" && seriesConfig[key].trim() ? seriesConfig[key].trim() : fallback;
}

async function fetchJourneyData() {
    const dataFile = getConfigValue("dataFile", "");
    if (!dataFile) {
        throw new Error("Missing journey data file");
    }

    const candidates = [
        `/blogs/data/${dataFile}`,
        `/data/${dataFile}`,
        `../../../data/${dataFile}`
    ];

    for (const path of candidates) {
        try {
            const response = await fetch(path, { cache: "no-store" });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
        }
    }

    throw new Error("Unable to load journey data");
}

function normalizeSlug(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\.html$/i, "")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

function getRequestedSlug() {
    const rawHash = (window.location.hash || "").replace(/^#/, "").trim();
    if (rawHash) {
        const hashValue = decodeURIComponent(rawHash);
        const hashParams = new URLSearchParams(hashValue.replace(/^\?/, ""));
        const hashSlug = hashParams.get("slug");
        if (hashSlug) {
            return hashSlug;
        }

        return hashValue
            .replace(/^\/+/, "")
            .replace(/^day\//i, "")
            .trim();
    }

    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get("slug");
    if (querySlug) {
        return querySlug;
    }

    const pathname = window.location.pathname || "";
    const match = pathname.match(/\/day\/?([^/?#]*)/i);
    if (match && match[1]) {
        return match[1];
    }

    return "";
}

function resolveIndex(items, requestedSlug) {
    const normalizedRequested = normalizeSlug(decodeURIComponent(requestedSlug || ""));

    const slugIndexMap = new Map();
    items.forEach((item, position) => {
        const key = normalizeSlug(item && item.slug);
        if (key && !slugIndexMap.has(key)) {
            slugIndexMap.set(key, position);
        }
    });

    let index = -1;
    if (normalizedRequested) {
        if (slugIndexMap.has(normalizedRequested)) {
            index = slugIndexMap.get(normalizedRequested);
        }

        if (index === -1) {
            for (const [key, position] of slugIndexMap.entries()) {
                if (key.startsWith(normalizedRequested) || normalizedRequested.startsWith(key)) {
                    index = position;
                    break;
                }
            }
        }

        if (index === -1) {
            index = items.findIndex(item => normalizeSlug(item.day) === normalizedRequested);
        }
    }

    return index === -1 ? 0 : index;
}

function renderCurrentSelection() {
    if (!Array.isArray(journeyItemsCache) || journeyItemsCache.length === 0) {
        renderMissing();
        return;
    }

    const requestedSlug = getRequestedSlug();
    const index = resolveIndex(journeyItemsCache, requestedSlug);
    renderEntry(journeyItemsCache[index], index, journeyItemsCache.length, journeyItemsCache);
}

async function loadEntry() {
    try {
        const items = await fetchJourneyData();
        if (!Array.isArray(items) || items.length === 0) {
            renderMissing();
            return;
        }

        journeyItemsCache = items;
        renderCurrentSelection();
    } catch (error) {
        renderError();
    }
}

window.addEventListener("hashchange", () => {
    renderCurrentSelection();
});

window.addEventListener("popstate", () => {
    renderCurrentSelection();
});

function toHtml(text) {
    return (text || "").replace(/\r?\n\r?\n/g, "<br><br>").replace(/\r?\n/g, "<br>");
}

function renderEntry(entry, index, total, items) {
    document.title = `${entry.title || entry.day} · IndiBargain Blog`;

    const prev = index > 0 ? items[index - 1] : null;
    const next = index < total - 1 ? items[index + 1] : null;
    const basePath = getConfigValue("basePath", "/blogs/journey");

    const gallery = Array.isArray(entry.images) && entry.images.length
        ? `<div class="journey-gallery">${entry.images.map((src, i) => `<img src="${src}" alt="${entry.title || entry.day} photo ${i + 1}" loading="lazy">`).join("")}</div>`
        : "";

    journeyPost.innerHTML = `
        <p class="eyebrow">${entry.day}</p>
        <h1>${entry.title || entry.day}</h1>
        <p class="post-meta">
            <span>${new Date(entry.date).toLocaleDateString()}</span>
            <span>Part ${index + 1} / ${total}</span>
        </p>
        ${gallery}
        <div class="post-content">${toHtml(entry.content)}</div>
        <p class="post-source"><a href="${entry.sourceUrl}" target="_blank" rel="noopener">Reference link ↗</a></p>
        <div class="journey-nav">
            ${prev ? `<a href="${basePath}/day/#${encodeURIComponent(prev.slug)}">← ${prev.day}</a>` : "<span></span>"}
            <a href="${basePath}/index.html">All parts</a>
            ${next ? `<a href="${basePath}/day/#${encodeURIComponent(next.slug)}">${next.day} →</a>` : "<span></span>"}
        </div>
    `;
}

function renderMissing() {
    const basePath = getConfigValue("basePath", "/blogs/journey");
    journeyPost.innerHTML = `
        <h1>Journey part not found</h1>
        <p>The requested part is not available.</p>
        <p><a href="${basePath}/index.html">← Back to all parts</a></p>
    `;
}

function renderError() {
    const basePath = getConfigValue("basePath", "/blogs/journey");
    journeyPost.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this journey part right now.</p>
        <p><a href="${basePath}/index.html">← Back to all parts</a></p>
    `;
}

loadEntry();
