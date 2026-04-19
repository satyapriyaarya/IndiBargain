const journeyPost = document.getElementById("journeyPost");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

async function loadEntry() {
    if (!slug) {
        renderMissing();
        return;
    }

    try {
        const response = await fetch("../data/leh-ladakh-journey.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Unable to load journey data");
        }
        const items = await response.json();
        const index = items.findIndex(item => item.slug === slug);
        if (index === -1) {
            renderMissing();
            return;
        }
        renderEntry(items[index], index, items.length, items);
    } catch (error) {
        renderError();
    }
}

function toHtml(text) {
    return (text || "").replace(/\r?\n\r?\n/g, "<br><br>").replace(/\r?\n/g, "<br>");
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
        <div class="post-content">${toHtml(entry.content)}</div>
        <p class="post-source"><a href="${entry.sourceUrl}" target="_blank" rel="noopener">View original source ↗</a></p>
        <div class="journey-nav">
            ${prev ? `<a href="day.html?slug=${encodeURIComponent(prev.slug)}">← ${prev.day}</a>` : "<span></span>"}
            <a href="index.html">All parts</a>
            ${next ? `<a href="day.html?slug=${encodeURIComponent(next.slug)}">${next.day} →</a>` : "<span></span>"}
        </div>
    `;
}

function renderMissing() {
    journeyPost.innerHTML = `
        <h1>Journey part not found</h1>
        <p>The requested part is not available.</p>
        <p><a href="index.html">← Back to all parts</a></p>
    `;
}

function renderError() {
    journeyPost.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this journey part right now.</p>
        <p><a href="index.html">← Back to all parts</a></p>
    `;
}

loadEntry();
