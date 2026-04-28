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

    return {
        howToReach: "Rishikesh (240 km from Delhi via NH58) or Haridwar are the standard starting points. Rishikesh to Joshimath is 253 km (7-9 hours by road with multiple ghat sections). From Joshimath, go 25 km to Govindghat. Trek starts at Pulna (2 km beyond Govindghat by shared taxi or on foot). Pulna to Ghangaria is 13-14 km (4-6 hours at steady pace).",
        whatToEat: "High-carb, easy-digest trek meals: dal-rice, rajma-chawal, aloo paratha, and egg preparations at Ghangaria lodges. Carry: roasted makhana, trail mix (almonds + raisins), glucose biscuits, electrolyte sachets, and instant oat packets for pre-dawn starts. Avoid heavy or oily food during active trek days.",
        whereToEat: "Route dhabas at Devprayag, Rudraprayag, and Pipalkoti for hot meals during road transit. Tea stalls at Pulna before trek start. Ghangaria lodges with attached kitchens for cooked meals — choose busy establishments with fresh turnover. Avoid undercooked food at altitude as digestion is already under stress.",
        whatToBuy: "Essential gear before entering the trek: waterproof poncho (INR 150-400), trek poles (rentable at Govindghat for INR 50-100/day), quick-dry socks, and blister plasters. Valley of Flowers National Park entry fee: INR 150/day (Indian), INR 600/day (foreign national). Hemkund Sahib entry is free. Carry small denomination cash for dhabas and porters.",
        interesting: "The Valley of Flowers hosts over 600 species of wild alpine flowers. Flowering peak is mid-July to mid-August. Each week within this window brings a different species to dominance — a second visit one week after the first shows a noticeably different floral landscape, making the double-entry strategy genuinely worthwhile.",
        gettingAround: "Delhi to Rishikesh: Volvo buses (6-7 hours, INR 400-600) or train to Haridwar then cab. Rishikesh to Govindghat: shared taxis depart at 5 AM for best timing. Pulna to Ghangaria: 13-14 km on foot or mule hire (INR 1,200-2,000 one way). Mules cannot carry people through the steep valley internal sections. No motorized vehicle access beyond Pulna.",
        photographyTips: "Shoot in cloud-break windows (often 8-10 AM before afternoon cloud build-up) for soft natural light without harsh shadows. Wide-angle lens for valley floor panoramas, 50mm+ macro for individual flower close-ups. Hemkund Lake at noon has the clearest sky reflection when sun is directly overhead. Bring a polarising filter to control glare on snow patches and water surfaces at high altitude.",
        bestTime: "Mid-July to mid-August: maximum flower variety and bloom density. Second half of August into September: fewer tourists, late-season flowers including Brahmakamal (the state flower of Uttarakhand). Early July: snow still present on upper sections, some flowers just emerging. Trail opens officially June 1 and closes October 15 — plan within this window only.",
        budgetGuide: "Per-person budget for a 10-day Valley of Flowers circuit: Delhi-Rishikesh transport INR 600-1,200, accommodation (8 nights across route) INR 4,000-8,000, meals INR 3,000-5,000, park entry fees INR 1,200-1,800, porter or mule if needed INR 1,500-3,000. Total: INR 10,300-19,000 per person.",
        safetyNotes: "Never trek solo beyond Pulna — always maintain buddy-group system. Altitude sickness (AMS) risk increases above Ghangaria at 3,048 m; descend immediately if you develop persistent headache, nausea, or confusion. Do not take Diamox without a prescription. Avoid valley entry after noon to ensure daylight for safe return. Flash floods can occur without warning on the trek route during and after rain.",
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
