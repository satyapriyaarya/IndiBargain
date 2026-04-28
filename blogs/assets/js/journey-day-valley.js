const journeyPost = document.getElementById("journeyPost");

let journeyItemsCache = null;

async function fetchJourneyData() {
    const candidates = [
        "../../../data/valley-of-flowers-journey.json",
        "/blogs/data/valley-of-flowers-journey.json",
        "/data/valley-of-flowers-journey.json"
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
            .replace(/^journey\/valley-of-flowers\/day\//i, "")
            .replace(/^journey\/day\//i, "")
            .replace(/^day\//i, "")
            .trim();
    }

    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get("slug");
    if (querySlug) {
        return querySlug;
    }

    const pathname = window.location.pathname || "";
    const match = pathname.match(/\/journey\/valley-of-flowers\/(?:day|day\.html)\/?([^/?#]*)/i);
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

function toReadablePlaceName(entry) {
    const fallback = "this location";
    if (!entry || !entry.sourceUrl) {
        return fallback;
    }

    try {
        const parsed = new URL(entry.sourceUrl);
        const raw = decodeURIComponent((parsed.pathname || "").split("/").pop() || "");
        if (!raw) {
            return fallback;
        }

        return raw
            .replace(/_/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    } catch (error) {
        return fallback;
    }
}

function getTravelEssentials(entry) {
    const haystack = `${entry && entry.slug ? entry.slug : ""} ${entry && entry.title ? entry.title : ""} ${entry && entry.content ? entry.content : ""} ${entry && entry.sourceUrl ? entry.sourceUrl : ""}`.toLowerCase();
    const placeName = toReadablePlaceName(entry);
    const mapQuery = entry && (entry.title || entry.slug) ? `${entry.title || entry.slug}, India` : `${placeName}, India`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

    const isValley = /valley-of-flowers|hemkund|ghangaria|joshimath|govindghat/.test(haystack);

    if (isValley) {
        return {
            howToReach: "The standard route is Haridwar/Rishikesh to Joshimath/Govindghat, then trek segments to Ghangaria and beyond.",
            whatToEat: "High-energy simple meals: dal-rice, paratha, eggs, dry fruits, and hydration salts.",
            whereToEat: "Route dhabas on road days and lodge dining points in Ghangaria for trek-day convenience.",
            whatToBuy: "Poncho, trek pole, rain cover, basic medicine kit, and waterproof pouches before entering higher sections.",
            interesting: "A second valley visit often improves both flower viewing and photography compared to a single rushed entry.",
            mapLink,
            placeName
        };
    }

    return {
        howToReach: "Use the nearest major airport or railhead and keep a 3-4 hour local transfer buffer on active sightseeing days.",
        whatToEat: "Prefer one local signature meal and one simple high-energy meal for better travel pacing.",
        whereToEat: "Choose highly rated local spots close to your route instead of cross-city detours during peak hours.",
        whatToBuy: "Focus on one or two authentic regional products from verified shops.",
        interesting: "Plan one sunrise block and one sunset block for better photography and pacing.",
        mapLink,
        placeName
    };
}

function renderTravelEssentials(entry) {
    const essentials = getTravelEssentials(entry);

    return `
        <hr>
        <h2>Travel Essentials</h2>
        <p><strong>How to Reach:</strong> ${essentials.howToReach}</p>
        <p><strong>Google Map:</strong> <a href="${essentials.mapLink}" target="_blank" rel="noopener">Open ${essentials.placeName} on Google Maps ↗</a></p>
        <p><strong>What to Eat:</strong> ${essentials.whatToEat}</p>
        <p><strong>Where to Eat:</strong> ${essentials.whereToEat}</p>
        <p><strong>What to Buy:</strong> ${essentials.whatToBuy}</p>
        <p><strong>Interesting Tip:</strong> ${essentials.interesting}</p>
    `;
}

function renderEntry(entry, index, total, items) {
    document.title = `${entry.title || entry.day} · IndiBargain Blog`;

    const prev = index > 0 ? items[index - 1] : null;
    const next = index < total - 1 ? items[index + 1] : null;

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
        <div class="post-content">${toHtml(entry.content)}${renderTravelEssentials(entry)}</div>
        <p class="post-source"><a href="${entry.sourceUrl}" target="_blank" rel="noopener">Reference link ↗</a></p>
        <div class="journey-nav">
            ${prev ? `<a href="/blogs/journey/valley-of-flowers/day/#${encodeURIComponent(prev.slug)}">← ${prev.day}</a>` : "<span></span>"}
            <a href="/blogs/journey/valley-of-flowers/index.html">All parts</a>
            ${next ? `<a href="/blogs/journey/valley-of-flowers/day/#${encodeURIComponent(next.slug)}">${next.day} →</a>` : "<span></span>"}
        </div>
    `;
}

function renderMissing() {
    journeyPost.innerHTML = `
        <h1>Journey part not found</h1>
        <p>The requested part is not available.</p>
        <p><a href="/blogs/journey/valley-of-flowers/index.html">← Back to all parts</a></p>
    `;
}

function renderError() {
    journeyPost.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this journey part right now.</p>
        <p><a href="/blogs/journey/valley-of-flowers/index.html">← Back to all parts</a></p>
    `;
}

loadEntry();
