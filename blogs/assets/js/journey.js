const journeyGrid = document.getElementById("journeyGrid");

const BLOG_LANGUAGE_KEY = "ib_blog_lang";

function getSelectedLanguage() {
    const queryLanguage = (new URLSearchParams(window.location.search).get("lang") || "").trim().toLowerCase();
    if (queryLanguage === "en" || queryLanguage === "hi") {
        localStorage.setItem(BLOG_LANGUAGE_KEY, queryLanguage);
        return queryLanguage;
    }

    const savedLanguage = (localStorage.getItem(BLOG_LANGUAGE_KEY) || "").trim().toLowerCase();
    return savedLanguage === "hi" ? "hi" : "en";
}

function renderLanguageGate() {
    journeyGrid.innerHTML = `
        <article class="post-card">
            <h2>This series is currently available in Hindi</h2>
            <p>Please switch language to Hindi to view this journey.</p>
            <p><a href="#" id="switchToHindi">Switch to Hindi →</a></p>
        </article>
    `;

    const switchLink = document.getElementById("switchToHindi");
    if (switchLink) {
        switchLink.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.setItem(BLOG_LANGUAGE_KEY, "hi");
            window.location.reload();
        });
    }
}

async function fetchJourneyData() {
    const candidates = [
        "../data/leh-ladakh-journey.json",
        "/blogs/data/leh-ladakh-journey.json",
        "/data/leh-ladakh-journey.json"
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

async function loadJourney() {
    const selectedLanguage = getSelectedLanguage();
    if (selectedLanguage !== "hi") {
        renderLanguageGate();
        return;
    }

    try {
        const items = await fetchJourneyData();
        const hindiItems = Array.isArray(items)
            ? items.filter((entry) => (entry.language || "hi").toLowerCase() === "hi")
            : [];
        renderJourney(hindiItems);
    } catch (error) {
        journeyGrid.innerHTML = `<article class="post-card"><p>Could not load journey right now.</p></article>`;
    }
}

function renderJourney(items) {
    if (!Array.isArray(items) || items.length === 0) {
        journeyGrid.innerHTML = `<article class="post-card"><p>No journey entries found.</p></article>`;
        return;
    }

    journeyGrid.innerHTML = items
        .map((entry, index) => `
            <article class="post-card">
                ${entry.coverImage ? `<img class="journey-cover" src="${entry.coverImage}" alt="${entry.title || entry.day}">` : ""}
                <p class="eyebrow">${entry.day}</p>
                <h2>${entry.title || entry.day}</h2>
                <p>${entry.excerpt || "Travel entry"}</p>
                <p class="post-meta">
                    <span>${new Date(entry.date).toLocaleDateString()}</span>
                    <span>Part ${index + 1} / ${items.length}</span>
                </p>
                <p><a href="/journey/day/#${encodeURIComponent(entry.slug)}">Read this part →</a></p>
            </article>
        `)
        .join("");
}

loadJourney();
