const journeyGrid = document.getElementById("journeyGrid");

async function loadJourney() {
    try {
        const response = await fetch("../data/leh-ladakh-journey.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Unable to load journey data");
        }
        const items = await response.json();
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
            <article class="post-card">
                ${entry.coverImage ? `<img class="journey-cover" src="${entry.coverImage}" alt="${entry.title || entry.day}">` : ""}
                <p class="eyebrow">${entry.day}</p>
                <h2>${entry.title || entry.day}</h2>
                <p>${entry.excerpt || "Travel entry"}</p>
                <p class="post-meta">
                    <span>${new Date(entry.date).toLocaleDateString()}</span>
                    <span>Part ${index + 1} / ${items.length}</span>
                </p>
                <p><a href="/journey/day#${encodeURIComponent(entry.slug)}">Read this part →</a></p>
            </article>
        `)
        .join("");
}

loadJourney();
