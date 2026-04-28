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

    const profiles = [
        {
            test: /goa|candolim|calangute|panaji|fontainhas|dudhsagar/,
            value: {
                howToReach: "Nearest major hub is Goa International Airport (Dabolim) or Mopa Airport. Intercity buses and Madgaon/Thivim railheads are practical for budget routes.",
                whatToEat: "Goan fish curry rice, prawn balchao, cafreal, poi with local fillings, and bebinca dessert.",
                whereToEat: "Beach shacks in Candolim/Anjuna for seafood and Panaji old quarter cafes for local fusion plates.",
                whatToBuy: "Cashews, local spice mixes, feni (where legal and preferred), and handmade azulejo-style souvenirs.",
                interesting: "Plan one sunrise beach and one sunset cliff point on the same day for very different coastal moods."
            }
        },
        {
            test: /rameshwaram|rameswaram|dhanushkodi|pamban/,
            value: {
                howToReach: "Madurai is the most practical gateway airport; from there use rail or road to Rameshwaram. Keep a buffer for temple queues.",
                whatToEat: "Simple South Indian meals, filter coffee, coastal seafood options, and temple-street tiffin staples.",
                whereToEat: "Temple-area vegetarian restaurants in the morning and sea-facing local eateries for dinner.",
                whatToBuy: "Shell crafts, temple souvenirs, and small puja items from trusted shops around the main temple roads.",
                interesting: "Dhanushkodi roads are best covered in softer morning or evening light for cleaner coastal photographs."
            }
        },
        {
            test: /golden-triangle|delhi|agra|jaipur|taj|amber/,
            value: {
                howToReach: "Start in Delhi (air/rail) and use expressway rail/road segments for Delhi-Agra-Jaipur transfers with fixed daily windows.",
                whatToEat: "Delhi street classics, Agra petha and Mughlai dishes, Jaipur thalis and local kachori combinations.",
                whereToEat: "Old Delhi food lanes, Agra fort-side restaurants, and Jaipur market-area heritage cafes.",
                whatToBuy: "Marble inlay replicas (Agra), blue pottery/textiles (Jaipur), and curated handicrafts from government emporiums.",
                interesting: "Monument days work best with sunrise starts and a strict two-major-site cap to avoid itinerary fatigue."
            }
        },
        {
            test: /jaisalmer|sam|thar|kuldhara/,
            value: {
                howToReach: "Jaisalmer is reachable by rail/road from Jodhpur and Jaipur corridors. Desert excursions should be pre-booked in season.",
                whatToEat: "Ker sangri, dal bati, gatte dishes, and simple camp-style Rajasthani dinners.",
                whereToEat: "Fort-view rooftops in city core and verified desert camps for evening cultural dining.",
                whatToBuy: "Mirror-work textiles, leather goods, and hand-crafted desert decor from fixed-price trusted stores.",
                interesting: "Carry a light scarf and closed shoes for dunes; sand and wind can change quickly at sunset."
            }
        },
        {
            test: /udaipur|city-of-lakes|pichola|sajjangarh/,
            value: {
                howToReach: "Udaipur airport and rail station both connect well; choose old-city stays for walkability or lake-side stays for views.",
                whatToEat: "Rajasthani thali, laal maas (if preferred), and light lakeside cafe meals for evening blocks.",
                whereToEat: "Old-city rooftops near Lake Pichola and heritage lane cafes around Jagdish Temple side.",
                whatToBuy: "Miniature paintings, handcrafted juttis, local textiles, and silver artifacts from known stores.",
                interesting: "Lake-facing spots change dramatically by hour; sunset and post-sunset windows both are worth planning."
            }
        },
        {
            test: /pink-city|jaipur|hawa-mahal|johari/,
            value: {
                howToReach: "Jaipur has strong air, rail, and road connectivity. Use one day cab for fort circuits to reduce transit switching.",
                whatToEat: "Pyaaz kachori, dal bati churma, ghewar, and curated Rajasthani thali options.",
                whereToEat: "Old-city outlets for classic snacks and modern cafes around MI Road/C-Scheme for evening meals.",
                whatToBuy: "Block prints, lac bangles, blue pottery, gemstone jewelry (certified stores only).",
                interesting: "Do forts in the morning and bazaar lanes in the evening to avoid heat and traffic spikes."
            }
        },
        {
            test: /kerala|kochi|munnar|thekkady|alleppey|alappuzha/,
            value: {
                howToReach: "Kochi is the best anchor hub; hill and backwater segments need realistic road buffers between destinations.",
                whatToEat: "Appam-stew combinations, Kerala fish curry, puttu options, and banana-based local snacks.",
                whereToEat: "Fort Kochi heritage cafes, Munnar mountain-view restaurants, and Alleppey canal-side seafood points.",
                whatToBuy: "Tea, spices, banana chips, and ayurvedic products from trusted certified outlets.",
                interesting: "Backwater houseboat stays are best paired with one low-activity day for proper rest and visual storytelling."
            }
        },
        {
            test: /assam|guwahati|kaziranga|majuli|sivasagar/,
            value: {
                howToReach: "Guwahati is the primary gateway; intercity movement works best by early road departure with weather/ferry buffers.",
                whatToEat: "Assamese thali, tenga fish, smoked meat variants, and black rice desserts where available.",
                whereToEat: "Local Assamese kitchens in Guwahati and homestay-style meals in Majuli for authentic flavors.",
                whatToBuy: "Assam tea, handloom gamocha pieces, bamboo crafts, and locally made organic products.",
                interesting: "Keep at least one buffer half-day in Assam circuits due to ferry and monsoon-driven schedule changes."
            }
        },
        {
            test: /valley-of-flowers|hemkund|ghangaria|joshimath/,
            value: {
                howToReach: "Rishikesh-Haridwar to Joshimath-Govindghat is the standard approach. Start early and keep monsoon delay buffer each day.",
                whatToEat: "Simple high-energy meals: dal-rice, paratha, tea, dry fruits, and hydration salts on trek days.",
                whereToEat: "Route dhabas for transit and basic lodges at Ghangaria for trek-day nutrition and quick service.",
                whatToBuy: "Rain cover gear, trek poles, energy snacks, and waterproof pouches before entering core trek sections.",
                interesting: "Two separate valley entries often give better landscape and flower photography than one rushed visit."
            }
        }
    ];

    const matched = profiles.find(item => item.test.test(haystack));

    if (matched) {
        return {
            ...matched.value,
            mapLink,
            placeName
        };
    }

    return {
        howToReach: "Use the nearest major airport or railhead and keep a 3-4 hour local transfer buffer on active sightseeing days.",
        whatToEat: "Prefer one local signature meal and one simple high-energy meal for better travel pacing.",
        whereToEat: "Choose highly rated local spots close to your route instead of cross-city detours during peak hours.",
        whatToBuy: "Focus on one or two authentic regional products from verified shops to avoid rushed last-minute buying.",
        interesting: "Early start plus one planned sunset block usually creates the best balance of logistics and experience.",
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
        <div class="post-content">${toHtml(entry.content)}${renderTravelEssentials(entry)}</div>
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
