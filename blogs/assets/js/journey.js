const journeyGrid = document.getElementById("journeyGrid");

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
        .map((entry, index) => `
            <article class="post-card" data-link="/journey/day/#${encodeURIComponent(entry.slug)}" style="cursor: pointer;">
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
