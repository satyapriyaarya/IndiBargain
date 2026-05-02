const journeyPost = document.getElementById("journeyPost");

let journeyItemsCache = null;

async function fetchJourneyData() {
    const candidates = [
        "../../../data/assam-journey.json",
        "/blogs/data/assam-journey.json",
        "/data/assam-journey.json"
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
            .replace(/^journey\/assam\/day\//i, "")
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
    const match = pathname.match(/\/journey\/assam\/(?:day|day\.html)\/?([^/?#]*)/i);
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

    return {
        howToReach: "Lokpriya Gopinath Bordoloi International Airport (Guwahati) is the main hub with connections to Delhi, Kolkata, Mumbai, and Bangalore. NH27 connects Guwahati to Kaziranga (190 km, 4-5 hours by road). Majuli is accessed via Jorhat and the Neamati Ghat ferry. Sivasagar is 380 km from Guwahati on NH715 — all intercity movement should start early due to single-lane highway stretches.",
        whatToEat: "Assamese thali: rice, dal, masor tenga (fish in sour tomato or elephant apple gravy), khar (alkaline-cooked vegetables), pitika (mashed preparations with mustard oil), bamboo shoot sabzi, and black sesame chutney. Joha rice (short-grain aromatic variety) is distinctive to Assam. In Majuli: traditional Mising tribe preparations including smoked pork and fermented fish dishes.",
        whereToEat: "Guwahati: Paradise Restaurant near Fancy Bazaar for classic Assamese fish dishes, local dhabas on AT Road for quick thalis. Kaziranga: resort dining or small roadside restaurants in Kohora for fresh river fish. Majuli: homestay meals cooked fresh are the best food experience in the entire route — request local preparations in advance.",
        whatToBuy: "Assam CTC and orthodox loose-leaf tea from verified estate outlets (Kaziranga area has several). Handloom products: muga silk (natural golden silk, unique to Assam), gamocha (traditional cotton towel with woven red border), mekhela chador (two-piece traditional women's garment from Sualkuchi weavers). Bamboo and cane crafts from Majuli artisans. Organic rice products from roadside cooperative stalls.",
        interesting: "The Majuli ferry crossing from Neamati Ghat is itself a cultural experience: the boat simultaneously carries vehicles, cycles, goats, crates of produce, and passengers across the Brahmaputra. Stand on the upper deck for a full view of the river's scale — in certain seasons the water stretches beyond visible horizon in both directions.",
        gettingAround: "Guwahati: Ola/Uber available and reliable within the city. Kaziranga to Majuli: hire a private car with driver from Kaziranga (5-6 hours total including ferry waiting). Majuli: rent a bicycle (INR 100-150/day) or moped — the island is flat and roads are manageable. Sivasagar: local autos and shared tempos connect major historical sites. Always confirm road and ferry conditions the evening before each transit.",
        photographyTips: "Kaziranga morning safari: use 200-400mm focal length for rhino and elephant shots; pre-sunrise entry gives the best soft diffused light. Majuli mask-making workshops allow close-up documentary photography of the entire craft process — get permission first. Brahmaputra river shots at dusk from Guwahati's Uzan Bazaar ghats. The Joysagar Tank in Sivasagar reflects the Sivasagar Dol temple at sunrise.",
        bestTime: "October to April is the best window. November-February is peak for Kaziranga: coolest temperatures, dry forest floor, clearest animal sightings. Majuli is best November-March when river levels are low and island roads are dry. Avoid June-September monsoon when Kaziranga partially floods and Majuli ferry schedules become unpredictable. Bihu festival (mid-April) adds cultural depth if timed.",
        budgetGuide: "Budget per day (shared, mid-range): accommodation INR 1,000-2,500, meals INR 400-900, local transport INR 500-1,200, safari fee INR 700-1,500. Total daily range: INR 2,600-6,100. An 8-day Assam trip runs INR 21,000-49,000 per person. Kaziranga resort packages (including safari) are often better value than booking separately.",
        safetyNotes: "Carry malaria prevention measures if visiting forest zones during monsoon transition months. Respect all safari rules strictly at Kaziranga — vehicles have been charged by rhinos in documented incidents near the western range. Keep ferry schedule flexibility for Majuli as river conditions change rapidly. Carry sufficient cash as ATMs are sparse beyond Guwahati and Jorhat.",
        mapLink,
        placeName
    };
}

function renderTravelEssentials(entry, collapsed) {
    const essentials = getTravelEssentials(entry);

    const essentialsBody = `
        <p><strong>How to Reach:</strong> ${essentials.howToReach}</p>
        <p><strong>Google Map:</strong> <a href="${essentials.mapLink}" target="_blank" rel="noopener">Open ${essentials.placeName} on Google Maps ↗</a></p>
        <p><strong>Getting Around:</strong> ${essentials.gettingAround}</p>
        <p><strong>What to Eat:</strong> ${essentials.whatToEat}</p>
        <p><strong>Where to Eat:</strong> ${essentials.whereToEat}</p>
        <p><strong>What to Buy:</strong> ${essentials.whatToBuy}</p>
        <p><strong>Photography Tips:</strong> ${essentials.photographyTips}</p>
        <p><strong>Best Time to Visit:</strong> ${essentials.bestTime}</p>
        <p><strong>Budget Guide:</strong> ${essentials.budgetGuide}</p>
        <p><strong>Interesting Tip:</strong> ${essentials.interesting}</p>
        <p><strong>Safety Notes:</strong> ${essentials.safetyNotes}</p>
    `;

    if (collapsed) {
        return `
            <hr>
            <details class="travel-essentials-collapsed">
                <summary>Travel Essentials</summary>
                <div class="travel-essentials-content">${essentialsBody}</div>
            </details>
        `;
    }

    return `
        <hr>
        <h2>Travel Essentials</h2>${essentialsBody}
    `;
}

async function resolveGalleryImages(entry) {
    const cache = window.__galleryImageCache = window.__galleryImageCache || {};
    if (!Array.isArray(entry?.images) || entry.images.length === 0) {
        return [];
    }

    const cacheKey = `${entry.sourceUrl}`;
    if (cache[cacheKey]) {
        return cache[cacheKey];
    }

    try {
        const parsed = new URL(entry.sourceUrl);
        const title = decodeURIComponent((parsed.pathname || "").split("/").pop() || "");
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.items) && data.items.length > 0) {
                const images = data.items.slice(0, 2).map(item => item.srcset?.[0]?.src || item.src).filter(Boolean);
                if (images.length > 0) {
                    cache[cacheKey] = images;
                    return images;
                }
            }
        }
    } catch (error) {
    }

    cache[cacheKey] = entry.images || [];
    return entry.images;
}

async function renderGalleryAsync(entry) {
    if (!Array.isArray(entry?.images) || entry.images.length === 0) {
        return "";
    }

    const resolvedImages = await resolveGalleryImages(entry);
    if (resolvedImages.length === 0) {
        return "";
    }

    return `<div class="journey-gallery">${resolvedImages.map((src, i) => `<img src="${src}" alt="${entry.title || entry.day} photo ${i + 1}" loading="lazy">`).join("")}</div>`;
}

async function renderEntryAsync(entry, index, total, items) {
    document.title = `${entry.title || entry.day} · IndiBargain Blog`;

    const prev = index > 0 ? items[index - 1] : null;
    const next = index < total - 1 ? items[index + 1] : null;

    const gallery = await renderGalleryAsync(entry);

    journeyPost.innerHTML = `
        <p class="eyebrow">${entry.day}</p>
        <h1>${entry.title || entry.day}</h1>
        <p class="post-meta">
            <span>${new Date(entry.date).toLocaleDateString()}</span>
            <span>Part ${index + 1} / ${total}</span>
        </p>
        ${gallery}
        <div class="post-content">${toHtml(entry.content)}${renderTravelEssentials(entry, index !== 0)}</div>
        <p class="post-source"><a href="${entry.sourceUrl}" target="_blank" rel="noopener">Reference link ↗</a></p>
        <div class="journey-nav">
            ${prev ? `<a href="/blogs/journey/assam/day/#${encodeURIComponent(prev.slug)}">← ${prev.day}</a>` : "<span></span>"}
            <a href="/blogs/journey/assam/index.html">All parts</a>
            ${next ? `<a href="/blogs/journey/assam/day/#${encodeURIComponent(next.slug)}">${next.day} →</a>` : "<span></span>"}
        </div>
    `;
}

function renderEntry(entry, index, total, items) {
    renderEntryAsync(entry, index, total, items).catch(error => {
        console.error("Error rendering entry:", error);
        renderError();
    });
}

function renderMissing() {
    journeyPost.innerHTML = `
        <h1>Journey part not found</h1>
        <p>The requested part is not available.</p>
        <p><a href="/blogs/journey/assam/index.html">← Back to all parts</a></p>
    `;
}

function renderError() {
    journeyPost.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this journey part right now.</p>
        <p><a href="/blogs/journey/assam/index.html">← Back to all parts</a></p>
    `;
}

loadEntry();
