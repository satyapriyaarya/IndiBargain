const journeyGrid = document.getElementById("journeyGrid");

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function cleanText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .replace(/\u00a0/g, " ")
        .trim();
}

function sanitizeCardTitle(entry) {
    const fallback = entry?.day || "Journey";
    const raw = cleanText(entry?.title || fallback);

    if (!raw) {
        return fallback;
    }

    return cleanText(raw.replace(/^Bike\s*Trip\s*To\s*Leh\s*Ladakh\s*\|\s*/i, ""));
}

function sanitizeCardExcerpt(entry, title) {
    const fallback = "Travel entry";
    const raw = cleanText(entry?.excerpt || entry?.content || "");
    if (!raw) {
        return fallback;
    }

    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cleaned = cleanText(
        raw
            .replace(/^Bike\s*Trip\s*To\s*Leh\s*Ladakh\s*\|\s*/i, "")
            .replace(new RegExp("^" + escapedTitle + "\\s*", "i"), "")
            .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/gi, "")
            .replace(/^लेह\s*[^\s]*\s*यात्रा\s*\d{4}\s*-\s*\d{1,2}\s*[^\s]+\s*-\s*[^.।!?:]{1,90}\s+/i, "")
            .replace(/^लेह\s*लद्दाख़\s*यात्रा\s*(?:\d{4}\s*-\s*)?\d{1,2}\s*[A-Za-z\u0900-\u097F]+\s*-\s*[^.।!?:]{1,90}\s+/i, "")
            .replace(/\bNo\s+similar\s+posts\b/gi, "")
            .replace(/\bNewer\s+Post\b/gi, "")
            .replace(/\bOlder\s+Post\b/gi, "")
            .replace(/लेह\s*लद्दाख़\s*यात्रा\s*का\s*सम्पूर्ण\s*वृतांत[\s\S]*$/i, "")
    );

    if (!cleaned) {
        return fallback;
    }

    return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}...` : cleaned;
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
    try {
        const items = await fetchJourneyData();
        renderJourney(items);
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
        .map((entry, index) => {
            const href = `/journey/day/#${encodeURIComponent(entry.slug)}`;
            const title = sanitizeCardTitle(entry);
            const excerpt = sanitizeCardExcerpt(entry, title);
            const day = cleanText(entry.day || `Day ${index + 1}`);
            const dateText = new Date(entry.date).toLocaleDateString();

            return `
            <article class="post-card" data-link="${href}" style="cursor: pointer;">
                ${entry.coverImage ? `<img class="journey-cover" src="${escapeHtml(entry.coverImage)}" alt="${escapeHtml(title)}">` : ""}
                <p class="eyebrow">${escapeHtml(day)}</p>
                <h2>${escapeHtml(title)}</h2>
                <p>${escapeHtml(excerpt)}</p>
                <p class="post-meta">
                    <span>${escapeHtml(dateText)}</span>
                    <span>Part ${index + 1} / ${items.length}</span>
                </p>
                <p><a href="${href}">Read this part →</a></p>
            </article>
        `;
        })
        .join("");

    // Add click event listeners to entire cards
    document.querySelectorAll('.post-card[data-link]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking on a link (to allow link behavior)
            if (e.target.tagName === 'A') return;
            window.location.href = card.getAttribute('data-link');
        });
    });
}

loadJourney();
