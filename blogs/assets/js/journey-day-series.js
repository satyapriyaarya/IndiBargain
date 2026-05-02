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

async function resolveCoverImage(entry) {
    const cache = window.__coverImageCache = window.__coverImageCache || {};
    if (!entry || !entry.sourceUrl) {
        return entry?.coverImage || "/blogs/assets/img/journey/placeholder.jpg";
    }

    const key = entry.sourceUrl;
    if (cache[key]) {
        return cache[key];
    }

    try {
        const parsed = new URL(entry.sourceUrl);
        const title = decodeURIComponent((parsed.pathname || "").split("/").pop() || "");
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.thumbnail && data.thumbnail.source) {
                cache[key] = data.thumbnail.source;
                return data.thumbnail.source;
            }
        }
    } catch (error) {
    }

    cache[key] = entry.coverImage || "/blogs/assets/img/journey/placeholder.jpg";
    return cache[key];
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
    const placeName = toReadablePlaceName(entry);
    const mapQuery = entry && (entry.title || entry.slug) ? `${entry.title || entry.slug}, India` : `${placeName}, India`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

    // Use series config to determine which profile to use
    const seriesName = getConfigValue("seriesName", "").toLowerCase();
    const slug = (entry && entry.slug ? entry.slug : "").toLowerCase();
    const sourceUrl = (entry && entry.sourceUrl ? entry.sourceUrl : "").toLowerCase();
    
    // Determine series based on config or entry content
    let series = seriesName;
    if (!series) {
        if (slug.includes("goa") || sourceUrl.includes("goa") || sourceUrl.includes("panaji")) series = "goa";
        else if (slug.includes("rameshwaram") || sourceUrl.includes("rameswaram")) series = "rameshwaram";
        else if (slug.includes("delhi") || slug.includes("agra") || slug.includes("jaipur") || sourceUrl.includes("taj")) series = "golden-triangle";
        else if (slug.includes("jaisalmer") || sourceUrl.includes("jaisalmer")) series = "jaisalmer";
        else if (slug.includes("udaipur") || slug.includes("lake") || sourceUrl.includes("udaipur")) series = "udaipur";
        else if (slug.includes("jaipur") || slug.includes("pink") || sourceUrl.includes("jaipur")) series = "jaipur";
        else if (slug.includes("kochi") || slug.includes("munnar") || slug.includes("kerala") || sourceUrl.includes("kerala")) series = "kerala";
        else if (slug.includes("assam") || slug.includes("kaziranga") || slug.includes("majuli") || sourceUrl.includes("assam")) series = "assam";
        else if (slug.includes("valley") || slug.includes("hemkund") || sourceUrl.includes("valley")) series = "valley";
    }

    const profiles = {
        goa: {
            howToReach: "Nearest major hub is Goa International Airport (Dabolim) or Mopa Airport in North Goa. Madgaon and Thivim are the key railheads; pre-book taxis from the station for hassle-free transfers. Scooter rentals (INR 300-500/day) from Panaji or Candolim are the best way to move independently between beaches and heritage zones.",
            whatToEat: "Goan fish curry rice, prawn balchao, chicken cafreal, poi bread with fillings, crab xacuti, prawn rechad, and bebinca layered dessert. For vegetarians, Goa also has excellent vegetable preparations using local kokum, raw mango, and coconut milk.",
            whereToEat: "Beach shacks in Candolim and Anjuna for fresh seafood by the shore, Panaji old-quarter cafes (like Viva Panjim) for traditional Goan home cooking, and dedicated Goan-cuisine restaurants in Calangute for full-menu exploration.",
            whatToBuy: "Cashew nuts and feni (the local spirit made from cashew apple or coconut), dried seafood, local spice blends, azulejo-inspired ceramic tiles, hand-printed block cotton scarves, and wicker craft from Calangute market.",
            interesting: "Plan one sunrise beach walk (Candolim or Vagator) and one sunset cliff point (Chapora Fort) on separate days for dramatically different coastal moods and lighting conditions.",
            gettingAround: "Scooter is the most flexible option for North Goa; cab aggregators (Goa Miles) work well for day trips to Old Goa or South Goa. State-run Kadamba buses are slow but cheap for inter-town movement. Ferry crossings save significant time at several river crossings between North and South.",
            photographyTips: "Fontainhas lanes are best shot in early morning (7-9 AM) before traffic. Old Goa churches photograph best in the 45 minutes after sunrise. North Goa beach cliffs at Vagator give dramatic wide shots with the river estuary. South Goa beaches work best in late afternoon for long golden shadows on sand.",
            bestTime: "November to February is the prime window: dry weather, cooler temperatures (25-30Â°C), all beaches open, and events like Sunburn Festival (December) and Goa Carnival (February-March). October is quieter and cheaper. Avoid June to September for beach travel; monsoon keeps most shacks closed.",
            budgetGuide: "Budget per person per day (shared, mid-range): accommodation INR 1,000-2,500, meals INR 500-1,000, scooter rental INR 300-500, activities INR 300-700. Total daily average: INR 2,100-4,700. A 6-day Goa trip on this basis costs INR 13,000-28,000 per person.",
            safetyNotes: "Use only GTDC-licensed watersports operators. Carry beach ID at all times. Avoid isolated stretches after dark. Use reef-safe sunscreen on beaches with coral zones. Keep a digital copy of all travel documents."
        },
        rameshwaram: {
            howToReach: "Madurai airport is the most practical gateway (2-3 hours by road/rail to Rameshwaram). Direct trains like the Rameswaram Express run from Chennai and Madurai. The iconic Pamban Bridge is the rail route entry into the island â€” one of India's most scenic rail crossings.",
            whatToEat: "Temple-street tiffin: idli, vada, pongal, dosa with sambar and coconut chutney. Coastal seafood at local restaurants: seer fish fry, crab curry, fresh prawn dishes. Filter coffee is essential after any temple visit. Avoid eating in rush zones directly around temple; move slightly off-street for better quality.",
            whereToEat: "Temple-area vegetarian restaurants for morning meals (Hotel Guru Mess and similar local joints near Ramanathaswamy). Sea-facing small restaurants near the fishing harbour for evening seafood. Avoid tourist-trap pricing by choosing places with mostly local clientele.",
            whatToBuy: "Conch shells and shell crafts (unique to this pilgrimage town), temple rudraksha malas, vibhuti and chandanam in sealed containers, Rameswaram-specific temple prasadam, and small puja items available in rows of dedicated stalls on Car Street.",
            interesting: "Dhanushkodi, the ghost town at the island's tip, reads very differently in early morning light versus midday. The ruins of the church and railway station are dramatically photogenic when mist lingers near the sea channel that separates India from Sri Lanka.",
            gettingAround: "Auto-rickshaws are the best local transport; negotiate fixed rates before boarding. Cycle rentals are available and practical for flat island terrain. For Dhanushkodi, hire a shared 4WD or auto-jeep from the Rameshwaram bus stand end. Pamban road is accessible by private vehicle.",
            photographyTips: "Ramanathaswamy Temple corridors photograph best at 6-8 AM when pilgrims create flowing human compositions in the lit stone passages. Pamban Bridge is best from the rail bridge adjacent viewing area. Dhanushkodi ruins reflect beautifully in tidal pools that form during low tide.",
            bestTime: "October to March is ideal: dry weather, manageable temple crowds, and comfortable coastal exploration. April-May becomes intensely hot (35-40Â°C). Avoid during peak pilgrimage festivals unless you specifically want that experience â€” crowds can triple.",
            budgetGuide: "Budget per day (shared, standard): accommodation INR 600-1,500, meals INR 300-600, local transport INR 200-400, temple donations and entry INR 100-300. Total daily range: INR 1,200-2,800. A 5-day Rameshwaram trip runs INR 6,000-14,000 per person.",
            safetyNotes: "Keep temple dress code ready (clean cotton clothing, feet unshod inside). Do not enter the Theertham bathing areas without a confirmed guide or authorized priest. Sea swimming near Dhanushkodi is not safe; currents are unpredictable."
        },
        "golden-triangle": {
            howToReach: "Start in Delhi (Indira Gandhi International Airport). Delhi-Agra is best covered by Gatimaan Express (100 min) or expressway road (3-4 hours). Agra-Jaipur connects by road via Fatehpur Sikri (4-5 hours). The full triangle loop can also be done in reverse. Pre-book intercity transport to avoid day-of price surges.",
            whatToEat: "Delhi: chhole bhature, paranthas in Chandni Chowk, dahi bhalle, butter chicken at its origin (Moti Mahal). Agra: petha (unique sweet), Mughlai biryani, bedai with puri, agre ka halwa. Jaipur: pyaaz kachori, dal baati churma, laal maas, ghewar dessert, lassi from Old Jaipur.",
            whereToEat: "Old Delhi food lanes (Paranthe Wali Gali, Dariba Kalan) for street food. Joney's Place in Agra for budget-friendly Indian and Western options. LMB (Laxmi Misthan Bhandar) in Jaipur for authentic sweets and Rajasthani thali.",
            whatToBuy: "Delhi: Dilli Haat for curated crafts from across India, Chandni Chowk for textiles and spices. Agra: marble inlay work (pietra dura), leather goods, Mughal miniatures. Jaipur: block-printed fabric, blue pottery, lac bangles, gemstone jewelry from certified dealers.",
            interesting: "Pre-book all monument tickets online (Archaeological Survey of India website) to skip physical queues. Monument days consistently produce better experiences with a 6:30 AM start â€” light is better, queues are shorter, and heat is manageable.",
            gettingAround: "Delhi: Metro is the fastest option; use Nomads app or Ola for intercity cabs. Agra: hire a cycle-rickshaw for the Taj-Fort circuit to avoid parking stress. Jaipur: rent a car with driver for fort circuits; the hills require vehicle access. Between cities: consider the Shatabdi Express for Delhi-Jaipur connection.",
            photographyTips: "Taj Mahal dawn (6-7 AM) has the best soft pink light on white marble. Hawa Mahal exterior shoots best from the cafe rooftop across the street. Jama Masjid in Delhi works best from the top minaret at 3 PM in winter light. Fatehpur Sikri's red sandstone reads best in the golden hour before sunset.",
            bestTime: "October to March is the classic window: comfortable temperatures (12-25Â°C), clear skies, and all attractions open. December-January has cold nights (5-8Â°C in Delhi/Jaipur) but beautiful daytime clarity. April-May is extreme heat (40+Â°C). Monsoon (July-September) keeps monuments busy but less photogenic.",
            budgetGuide: "Budget per day (shared, mid-range): accommodation INR 1,200-3,000, meals INR 500-1,200, local transport INR 400-800, monument entries INR 500-1,500. Total daily range: INR 2,600-6,500. A 7-day Golden Triangle trip runs INR 18,000-45,000 per person.",
            safetyNotes: "Beware of commission-based touts near Agra Fort and Taj who redirect to shops. Never exchange currency at unofficial counters. Keep valuables secured in locked accommodation. In Old Delhi, use authorized cycle-rickshaws and confirm routes before boarding."
        },
        jaisalmer: {
            howToReach: "Jodhpur airport is the nearest functional hub (3.5 hours to Jaisalmer by road). The Jaisalmer-Jodhpur Express is a popular overnight train. From Jaipur, road journey is 6-7 hours. Book desert camp stays and camel/jeep safaris at least 3 days in advance during peak season (November-February).",
            whatToEat: "Ker sangri (desert bean-berry sabzi), dal baati churma, gatte ki sabzi, pyaaz kachori from local sweet shops, mathri with mirchi pickle, rabdi (thickened milk sweet), and laal maas for meat eaters. For desert camp nights, traditional Rajasthani thali is typically included.",
            whereToEat: "Fort-view rooftop restaurants in the city core for evening meals with silhouette views. Midtown Jaisalmer eateries for morning snacks and chai. Desert camp kitchens for dinner â€” the combination of campfire, stars, and Rajasthani cooking is the experience, not just the food.",
            whatToBuy: "Bandhani tie-dye fabric, camel leather bags and belts, mirror-work embroidered textiles, silver jewelry in desert motifs, hand-woven woollen durries, and antique stone carvings from fixed-price government emporium stores for authenticity.",
            interesting: "Spend one hour before sunset on the rampart of Jaisalmer Fort looking inward over the city rather than outward: the warm sandstone town compressed below the fort walls is architecturally unique in all of India.",
            gettingAround: "The city core around the fort is walkable. For Gadisar Lake and havelis, auto-rickshaws are practical. Sam dunes require a hired jeep or organized camp transfer. Kuldhara and Bada Bagh need a private vehicle. No Uber/Ola in Jaisalmer; negotiate auto rates upfront.",
            photographyTips: "Jaisalmer Fort is best photographed in the pre-sunset hour (4:30-5:30 PM) when the golden sandstone glows warmest. Bada Bagh cenotaphs cast dramatic long shadows at sunset. Sam dunes work best in the final 20 minutes before the sun sets â€” the angular light creates dune ridgeline shadows. Night sky photography is exceptional at Sam dunes with no city light pollution.",
            bestTime: "October to February: cool days (20-28Â°C), cold nights (5-10Â°C), all activities available. March is warm but manageable. Avoid April-September: summer temperatures reach 42-48Â°C during day. Desert Festival (held in Jaisalmer in February) adds folk performances, camel races, and turbaning competitions.",
            budgetGuide: "Budget per day (shared, mid-range): accommodation INR 800-2,000, meals INR 400-800, local transport INR 300-600, safari/camp INR 700-2,500. Total daily range: INR 2,200-5,900. A 5-day Jaisalmer trip runs INR 11,000-30,000 per person.",
            safetyNotes: "Carry adequate water during desert excursions â€” dehydration risk is high. Use SPF 50+ sun protection. Never leave organized safari groups in the dunes after dark. Keep cash (ATMs sparse in desert zones). Check camp booking reviews before paying advance deposits."
        },
        udaipur: {
            howToReach: "Udaipur airport (Maharana Pratap Airport) has direct flights from Delhi, Mumbai, and Jaipur. Rail connections via Chetak Express from Jaipur and Ajmer Shatabdi. Old city is 25 minutes from the airport. Choose accommodation near Lal Ghat or Hanuman Ghat for lake views and walkable access to all major sites.",
            whatToEat: "Rajasthani thali featuring dal baati churma, ker sangri, gatte ki sabzi, bajre ki roti, laal maas (meat), and the sweet kadhi of Udaipur. Malai kofta at Ambrai restaurant is a local favourite. Bedai poori for breakfast near Jagdish Temple lanes. Mishri mawa (milk sweet) from old-town sweet shops.",
            whereToEat: "Ambrai Ghat restaurant for lakeside dining with City Palace light reflections. Sunset Terrace and Upre at Lake Pichola Hotel for special meals. Jagdish Temple lane dhaba-style places for quick and cheap lunch. Neel Kamal (Taj Lake Palace) for a once-only indulgent dinner experience.",
            whatToBuy: "Udaipur miniature paintings (Rajput and Mughal style school), handcrafted silver jewelry, block-printed cotton fabric (export quality available at reasonable prices), leather juttis and bags, painted wood toys, and puppet sets from old-city lanes near Jagdish Temple.",
            interesting: "Book a boat ride on Lake Pichola specifically at dusk (45 minutes before sunset) and remain on the lake until 20 minutes after sunset â€” the City Palace and Jag Niwas island palace illumination in twilight is one of the best sustained visual experiences in Rajasthan.",
            gettingAround: "Old city is best explored on foot with comfortable shoes. Electric rickshaws and autos navigate the narrow lanes. Hire a local auto for the full day (INR 600-1,000) to cover Saheliyon ki Bari, Fateh Sagar, and Sajjangarh in one circuit. Sajjangarh (Monsoon Palace) requires a vehicle as it sits on a hilltop.",
            photographyTips: "City Palace reflects dramatically in Lake Pichola from Ambrai Ghat at golden hour. Sajjangarh panoramas work at both sunrise (city emergence from fog) and sunset (city lights). Bagore ki Haveli's inner courtyard has great symmetrical architecture for midday shooting. Fateh Sagar Lake's Nehru Island fountain works best in late afternoon light.",
            bestTime: "September to March: October-March is peak with comfortable temperatures (20-30Â°C). Monsoon (July-September) fills all lakes to full capacity and the Monsoon Palace view is especially stunning â€” this is actually a hidden gem season for photographers. Avoid extreme summer months (April-June) when temperatures hit 38-42Â°C.",
            budgetGuide: "Budget per day (shared, mid-range): accommodation INR 1,000-2,500, meals INR 500-1,200, boat/transport INR 400-800, monument entries INR 300-700. Total daily range: INR 2,200-5,200. A 4-day Udaipur trip runs INR 9,000-21,000 per person.",
            safetyNotes: "Avoid unofficial boat operators for Lake Pichola crossings. Sajjangarh road has sharp curves after dark; use drivers familiar with the route. Keep your photography respectful in active temple spaces."
        },
        jaipur: {
            howToReach: "Jaipur International Airport connects directly with all major Indian cities. Jaipur Junction railway station is the major rail hub with connections to Delhi (Shatabdi Express, 4.5 hours), Agra, Udaipur, and Jodhpur. From Delhi, road via NH48 is 5-6 hours. Pre-book AC tourist cabs for the fort circuit days.",
            whatToEat: "Pyaaz kachori is Jaipur's signature snack â€” eat it hot from Rawat Mishthan Bhandar or Samrat Restaurant. Dal baati churma for a full traditional meal. Laal maas (slow-cooked mutton in red chilli gravy) at Spice Court or Suvarna Mahal. Ghewar (lattice flour sweet) during Teej season. Lassi from Old Jaipur should be thick and served in an earthen matka.",
            whereToEat: "Rawat Mishthan Bhandar (kachori and sweets, morning hours). LMB (Laxmi Misthan Bhandar) on Johari Bazaar for sitaphal ki sabzi and complete Rajasthani thali. 1135 AD inside Amber Fort complex for fort-view dining. Anokhi Cafe near C-Scheme for a lighter modern Indian menu.",
            whatToBuy: "Block-printed cotton fabric (Anokhi, Fab India, or local Sanganer-village producers), blue pottery (look for Kripal Kumbh workshop), lac bangles, gemstone jewelry from Johari Bazaar certified dealers, Sanganeri hand block print dupattas, and mojari (leather slip-on shoes) in embroidered patterns.",
            interesting: "Nahargarh Fort at night (open until 11 PM some days) gives one of the best city-light panoramas in India â€” the entire walled pink city glows in street lamps below while the fort remains in dark stone silhouette above.",
            gettingAround: "Day cabs (INR 800-1,500) are the best option for fort circuits since hill locations are not auto-accessible. Metro is useful for Badi Chaupar to railway station corridor. Autos and cycle-rickshaws work for Old City bazaar navigation. Avoid driving in Old City during market hours (10 AM - 6 PM) â€” lane congestion is severe.",
            photographyTips: "Hawa Mahal exterior is best photographed from the rooftop cafe across the road (not from street level). Amber Fort elephant ride section creates interesting compositions in morning light. Jal Mahal (Water Palace) in Mansagar Lake photographs cleanly in late afternoon with still water reflections. Patrika Gate (Jawahar Circle) is best at 6-8 AM before tourist crowds arrive for portraits.",
            bestTime: "October to March is optimal: comfortable temperatures (15-28Â°C during day), low humidity. January sees Jaipur Literature Festival (one of Asia's largest). Teej Festival (July-August) and Gangaur Festival (March-April) add cultural dimension for interested visitors. Avoid April-June (40-45Â°C daytime heat).",
            budgetGuide: "Budget per day (shared, mid-range): accommodation INR 900-2,200, meals INR 500-1,200, day cab INR 800-1,500 split, monument entries INR 300-900. Total daily range: INR 2,500-5,800. A 4-day Jaipur trip runs INR 10,000-23,000 per person.",
            safetyNotes: "Verify gemstone dealers' GSI certificates before purchasing. Use registered taxis at the airport and station. In Old City bazaars, be alert to bag-snatching in narrow lanes. Drink only sealed water in street food zones. Do not photograph military-adjacent installations near fort areas."
        },
        kerala: {
            howToReach: "Kochi (Cochin International Airport) is the best entry point with connections to all major cities. Munnar is 130 km (4 hours) by road via ghat sections. Thekkady (Periyar) is 190 km from Kochi (4-5 hours). Alleppey (Alappuzha) is 1.5 hours from Kochi. Pre-book houseboat stays at least one week in advance for peak season.",
            whatToEat: "Appam with vegetable stew or egg curry, Kerala fish curry with raw mango, karimeen (pearl spot fish) pollichathu (wrapped and grilled in banana leaf), puttu with kadala curry, banana chips, payasam (rice/lentil dessert). In Munnar: fresh tea-infused dishes and local mountain honey. Thekkady: spice-infused dishes using fresh cardamom, pepper, and vanilla.",
            whereToEat: "Fort Kochi: Kashi Art Cafe for breakfast, Dal Roti for Kerala-North hybrid cuisine, Oceanos for fresh seafood. Munnar: rooftop restaurants near town center for mountain views. Alleppey: houseboat meals are usually freshly prepared on board; request specific Kerala dishes when booking.",
            whatToBuy: "Munnar tea from factory outlets (buy loose-leaf, not packaged). Thekkady spice shops: buy whole spices (vanilla pods, cardamom, star anise, cinnamon sticks) directly from growers. Kerala banana chips (freshest in Thrissur area but available everywhere). Ayurvedic products from certified Kerala Ayurveda shops. Kasavu sarees (gold-border cotton) from state emporia.",
            interesting: "Houseboat food in Alleppey improves significantly if you brief the cook before departure: request fresh local fish, traditional preparations, and ask to skip pre-packaged items â€” most boathouses accommodate this with same-day sourcing.",
            gettingAround: "Kochi: autos, Ola/Uber, and city buses. Munnar and Thekkady: hire local cars with drivers (necessary for tea estate and hill circuit). Alleppey backwaters: houseboat for overnight, country boats and small ferries for shorter day routes. Kerala State Road Transport Corporation buses connect all towns for budget travellers.",
            photographyTips: "Chinese fishing nets in Fort Kochi work best at dawn (6-7 AM) when fishermen are actively operating the nets. Munnar tea gardens photograph best in early morning fog (October-January). Alleppey backwater canal shots at golden hour capture the reflection of palms on still water. Periyar Lake in Thekkady at sunrise shows wildlife at water's edge before boat crowds arrive.",
            bestTime: "September to March is the main tourist window. October-November is ideal after monsoon: lakes are full, tea gardens are green, backwaters are calm. December-January is peak season. June-August is monsoon: most outdoor activities limited, but the landscape is extraordinarily lush and crowd-free for photography. Onam Festival (August-September) adds cultural richness.",
            budgetGuide: "Budget per day (shared, mid-range): accommodation INR 1,200-3,000, meals INR 600-1,200, local transport INR 400-900, activities INR 400-1,000. Houseboat: INR 4,000-10,000 per night for a standard double-bedroom boat. A 6-day Kerala trip runs INR 20,000-45,000 per person.",
            safetyNotes: "Ghat road driving between Kochi and Munnar: avoid night driving on hairpin sections. Use houseboat companies with valid DTPC (Department of Tourism, Kerala) registration. Apply mosquito repellent in backwater zones, especially evenings. Keep prescription medication accessible in hilly zones far from pharmacies."
        },
        assam: {
            howToReach: "Lokpriya Gopinath Bordoloi International Airport (Guwahati) is the main hub with connections to Delhi, Kolkata, Mumbai, and Bangalore. NH27 connects Guwahati to Kaziranga (190 km, 4-5 hours by road). Majuli is accessed via Jorhat and the Neamati Ghat ferry. Sivasagar is 380 km from Guwahati on NH715.",
            whatToEat: "Assamese thali: rice, dal, masor tenga (fish in sour tomato or elephant apple gravy), khar (alkaline-cooked vegetables), pitika (mashed preparations with mustard oil), bamboo shoot sabzi, and black sesame chutney. Joha rice (short-grain aromatic variety) is distinctive to Assam. In Majuli: traditional Mising tribe food including smoked pork preparations and fermented fish dishes.",
            whereToEat: "Guwahati: Paradise Restaurant near Fancy Bazaar for classic Assamese fish dishes, local dhabas on AT Road for quick thalis. Kaziranga: resort dining or the small roadside restaurants in Kohora for fresh river fish. Majuli: homestay meals cooked fresh are the best food experience in the entire route.",
            whatToBuy: "Assam CTC and orthodox tea from verified estate outlets. Handloom products: muga silk (natural golden silk from Sualkuchi), gamocha (traditional cotton towel with woven red border), mekhela chador (two-piece traditional women's garment from Sualkuchi weavers). Bamboo and cane crafts from Majuli artisans. Organic rice products from roadside cooperative stalls.",
            interesting: "The Majuli ferry crossing from Neamati Ghat is itself an experience: the boat carries vehicles, cycles, goats, produce, and passengers simultaneously. Go on the upper deck for a complete view of the Brahmaputra's width â€” at certain seasons it stretches beyond visible horizon.",
            gettingAround: "Guwahati: Ola/Uber available and effective within the city. Kaziranga to Majuli: hire a private car with driver from Kaziranga (5-6 hours total including ferry). Majuli: rent a bicycle (INR 100-150/day) or moped â€” the island is flat and roads are manageable. Sivasagar: local autos and shared tempos connect major historical sites.",
            photographyTips: "Kaziranga safari: use longest available focal length (200-400mm) for rhino and elephant shots; early morning safari gives best light. Majuli mask-making workshops: close-up documentary photography of the artisan's hands and paint process. Brahmaputra river shots work best from the Sivasagar Joysagar Tank (largest artificial tank in India) at sunset.",
            bestTime: "October to April is the best window. November-February is peak for Kaziranga (coolest temperatures, dry forest, clearest views). Majuli is best November-March when river levels are low and island roads are dry. Avoid June-September monsoon when Kaziranga partially floods and Majuli ferries are unpredictable.",
            budgetGuide: "Budget per day (shared, mid-range): accommodation INR 1,000-2,500, meals INR 400-900, local transport INR 500-1,200, safari INR 700-1,500. Total daily range: INR 2,600-6,100. An 8-day Assam trip runs INR 21,000-49,000 per person.",
            safetyNotes: "Carry malaria prevention measures if visiting forest zones. Respect all safari rules strictly at Kaziranga â€” vehicles have been charged by rhinos in documented incidents. Keep ferry schedule flexibility for Majuli as river conditions change rapidly. Carry sufficient cash as ATMs are sparse beyond Guwahati."
        },
        valley: {
            howToReach: "Rishikesh (240 km from Delhi via NH58) or Haridwar are the starting points. Rishikesh to Joshimath is 253 km (7-9 hours by road). From Joshimath, go 25 km to Govindghat. Trek starts at Pulna (2 km beyond Govindghat by shared taxi). No vehicle access beyond Pulna; 14 km trek to Ghangaria from Pulna.",
            whatToEat: "Trek fuel: high-carb, easy-digest meals. Dal-rice, rajma-chawal, and aloo paratha are the staples on route. At Ghangaria lodges, cooked meals are available in basic form. Carry: roasted makhana, trail mix with almonds and raisins, glucose biscuits, electrolyte sachets, and instant oat packets for early starts.",
            whereToEat: "Route dhabas at Devprayag, Rudraprayag, and Pipalkoti for hot meals during road transit. Pulna has small tea stalls for chai before the trek starts. Ghangaria has lodges with attached kitchens â€” food quality varies, so choose busy places with turnover. Avoid undercooked meals at altitude.",
            whatToBuy: "Gear before trek: buy trek poles, rain ponchos, waterproof bag covers, and quick-dry socks in Rishikesh (cheaper than at trail). Valley of Flowers National Park entry fee: INR 150 per person per day (Indian), INR 600 per day (foreign national). Hemkund Sahib entry is free. Carry small denomination notes for dhabas and porters.",
            interesting: "The Valley of Flowers hosts over 600 species of wild alpine flowers including Brahmakamal, Blue Poppy, Cobra Lily, and Himalayan Balsam. Flowering peak is typically mid-July to mid-August. Each week within this window brings different species to dominance.",
            gettingAround: "Delhi to Rishikesh: Volvo buses (6-7 hours, INR 400-600) or train to Haridwar then cab. Rishikesh to Govindghat: shared taxis/cabs, departing Rishikesh by 5 AM for Govindghat arrival by 2 PM. Pulna to Ghangaria: 13-14 km trek (4-6 hours at steady pace) or mule hire (INR 1,200-2,000).",
            photographyTips: "Valley of Flowers: shoot in cloud-break windows (often 8-10 AM before afternoon cloud build-up) for soft natural light. Wide-angle lens for the valley floor panorama, macro for individual flower close-ups. Hemkund Lake at noon has the clearest sky reflection. Bring a polarising filter for high-altitude sky shots.",
            bestTime: "Mid-July to mid-August: maximum flower variety and bloom density. Second half of August into September: fewer tourists, later-season flowers like Brahmakamal. Early July: snow still present, some flowers just emerging. October onwards: trail closure for the season. Do not plan the valley visit before June 1 or after October 15.",
            budgetGuide: "Budget per person for 10-day Valley of Flowers trip: Delhi-Rishikesh transport INR 600-1,200, accommodation along route INR 4,000-8,000 (8 nights), meals INR 3,000-5,000, park entry fees INR 1,200-1,800, porter/mule if needed INR 1,500-3,000. Total: INR 10,300-19,000 per person.",
            safetyNotes: "Never trek solo beyond Pulna. Altitude sickness (AMS) risk increases above Ghangaria (3,048 m) â€” descend if you develop persistent headache, nausea, or confusion. Carry Diamox only if prescribed. Avoid valley entry after noon. Flash floods can occur without warning on the trek route after rain."
        }
    };

    const selectedProfile = profiles[series];
    
    if (selectedProfile) {
        return {
            ...selectedProfile,
            mapLink,
            placeName
        };
    }

    // Generic fallback (includes all fields now)
    return {
        howToReach: "Use the nearest major airport or railhead and keep a 3-4 hour local transfer buffer on active sightseeing days.",
        whatToEat: "Prefer one local signature meal and one simple high-energy meal for better travel pacing.",
        whereToEat: "Choose highly rated local spots close to your route instead of cross-city detours during peak hours.",
        whatToBuy: "Focus on one or two authentic regional products from verified shops to avoid rushed last-minute buying.",
        interesting: "Early start plus one planned sunset block usually creates the best balance of logistics and experience.",
        gettingAround: "Use local transport wisely and avoid over-booking your schedule to enjoy spontaneous discoveries.",
        photographyTips: "Golden hour gives the best light. Scout locations in daylight before sunset shooting.",
        bestTime: "October to March is optimal for most Indian destinations. Check local weather patterns before booking.",
        budgetGuide: "Budget 40-50% for accommodation, 30-35% for meals, 15-20% for transport, and 5-10% for activities and shopping.",
        safetyNotes: "Keep copies of important documents, stay aware of local customs, and inform someone of your daily itinerary.",
        mapLink,
        placeName
    };
}
function renderTravelEssentials(entry, collapsed) {
    const essentials = getTravelEssentials(entry);

    const essentialsBody = `
        <p><strong>How to Reach:</strong> ${essentials.howToReach}</p>
        <p><strong>Google Map:</strong> <a href="${essentials.mapLink}" target="_blank" rel="noopener">Open ${essentials.placeName} on Google Maps â†—</a></p>
        <p><strong>Getting Around:</strong> ${essentials.gettingAround || ""}</p>
        <p><strong>What to Eat:</strong> ${essentials.whatToEat}</p>
        <p><strong>Where to Eat:</strong> ${essentials.whereToEat}</p>
        <p><strong>What to Buy:</strong> ${essentials.whatToBuy}</p>
        <p><strong>Photography Tips:</strong> ${essentials.photographyTips || ""}</p>
        <p><strong>Best Time to Visit:</strong> ${essentials.bestTime || ""}</p>
        <p><strong>Budget Guide:</strong> ${essentials.budgetGuide || ""}</p>
        <p><strong>Interesting Tip:</strong> ${essentials.interesting}</p>
        <p><strong>Safety Notes:</strong> ${essentials.safetyNotes || ""}</p>
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

async function renderEntryAsync(entry, index, total, items) {
    document.title = `${entry.title || entry.day} Â· IndiBargain Blog`;

    const prev = index > 0 ? items[index - 1] : null;
    const next = index < total - 1 ? items[index + 1] : null;
    const basePath = getConfigValue("basePath", "/blogs/journey");

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
        <p class="post-source"><a href="${entry.sourceUrl}" target="_blank" rel="noopener">Reference link â†—</a></p>
        <div class="journey-nav">
            ${prev ? `<a href="${basePath}/day/#${encodeURIComponent(prev.slug)}">â† ${prev.day}</a>` : "<span></span>"}
            <a href="${basePath}/index.html">All parts</a>
            ${next ? `<a href="${basePath}/day/#${encodeURIComponent(next.slug)}">${next.day} â†’</a>` : "<span></span>"}
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
    const basePath = getConfigValue("basePath", "/blogs/journey");
    journeyPost.innerHTML = `
        <h1>Journey part not found</h1>
        <p>The requested part is not available.</p>
        <p><a href="${basePath}/index.html">â† Back to all parts</a></p>
    `;
}

function renderError() {
    const basePath = getConfigValue("basePath", "/blogs/journey");
    journeyPost.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this journey part right now.</p>
        <p><a href="${basePath}/index.html">â† Back to all parts</a></p>
    `;
}

loadEntry();
