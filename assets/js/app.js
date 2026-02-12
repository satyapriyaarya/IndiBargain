const newsEndpoint = "https://hn.algolia.com/api/v1/search_by_date?query=artificial%20intelligence&tags=story&hitsPerPage=6";
const articleEndpoint = "https://dev.to/api/articles?tag=ai&per_page=6";
const galleryEndpoint = "https://lexica.art/api/v1/search?q=futuristic%20ai%20city";
const factEndpoint = "https://uselessfacts.jsph.pl/random.json?language=en";
const contactRecipient = "c2F0eWFwcml5YWFyeWFAZ21haWwuY29t"; // base64 so it isn't visible in markup
const contactEndpoint = `https://formsubmit.co/ajax/${atob(contactRecipient)}`;
const cacheTtlMs = 24 * 60 * 60 * 1000; // one day fallback window
const cacheKeys = {
    news: "ib_news_feed",
    articles: "ib_articles",
    facts: "ib_fun_facts",
    gallery: "ib_gallery",
};
const storageAvailable = (() => {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
        return false;
    }
    try {
        const probe = "__ib_cache_probe__";
        window.localStorage.setItem(probe, "1");
        window.localStorage.removeItem(probe);
        return true;
    } catch (error) {
        return false;
    }
})();
const fallbackNews = [
    {
        title: "Open-source copilots hit production",
        source: "IndiBargain desk",
        url: "https://github.com/topics/ai",
        summary: "Community copilots trained on permissive data now compete with closed incumbents across IDEs.",
        time: "Today"
    },
    {
        title: "India greenlights compute clusters",
        source: "Digital India",
        url: "https://www.digitalindia.gov.in/",
        summary: "The new public-private compute corridors promise subsidized GPU time for startups.",
        time: "48 min ago"
    },
    {
        title: "Synthetic media guardrails evolve",
        source: "Policy Watch",
        url: "https://www.meity.gov.in/",
        summary: "Watermark standards now include temporal hashes to survive compression across platforms.",
        time: "2 hr ago"
    },
    {
        title: "Edge AI leaps onto wearables",
        source: "Hardware Daily",
        url: "https://developer.qualcomm.com/",
        summary: "LLM distillation plus on-device caching unlock sub-second inference on consumer bands.",
        time: "4 hr ago"
    }
];

const fallbackFacts = [
    "Training an AI on synthetic data alone amplifies its own blind spots—called the model collapse loop.",
    "Transformer attention was inspired by the idea of letting models decide what to read, not just how.",
    "Some chip fabs now recycle 80% of the ultra-pure water used in AI-grade wafers.",
];

const galleryShots = [
    {
        title: "Textile latent bloom",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
        credit: "Unsplash"
    },
    {
        title: "Neon promptscape",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        credit: "Unsplash"
    },
    {
        title: "Analog glitch",
        url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
        credit: "Unsplash"
    },
    {
        title: "Data bloom",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
        credit: "Unsplash"
    }
];

const dom = {
    newsGrid: document.getElementById("newsGrid"),
    newsTimestamp: document.getElementById("newsTimestamp"),
    articleGrid: document.getElementById("articleGrid"),
    factGrid: document.getElementById("factGrid"),
    galleryGrid: document.getElementById("galleryGrid"),
    metricHeadlines: document.getElementById("metric-headlines"),
    metricArticles: document.getElementById("metric-articles"),
    metricFacts: document.getElementById("metric-facts"),
    notifyDialog: document.getElementById("notifyDialog"),
    contactDialog: document.getElementById("contactDialog"),
    contactForm: document.getElementById("contactForm"),
    contactNotice: document.getElementById("contactNotice"),
    contactSubmit: document.getElementById("contactSubmit"),
};

async function hydrateNews() {
    try {
        const response = await fetch(newsEndpoint, { cache: "no-store" });
        if (!response.ok) throw new Error("News request failed");
        const payload = await response.json();
        const stories = (payload.hits || [])
            .filter(item => item.title && item.url)
            .slice(0, 4)
            .map(item => ({
                title: item.title,
                source: item.author || "Hacker News",
                url: item.url,
                summary: item.story_text?.slice(0, 140) || item._highlightResult?.story_text?.value || "Tap for details",
                time: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));

        if (!stories.length) throw new Error("No stories returned");

        renderNews(stories);
        saveCache(cacheKeys.news, stories);
    } catch (error) {
        console.warn("Falling back to cached/static news", error);
        const cached = loadCache(cacheKeys.news);
        if (cached?.length) {
            renderNews(cached, "Showing cached pulse (under 24h)");
            return;
        }
        renderNews(fallbackNews, "Using curated backups");
    }
}

function renderNews(items, label) {
    dom.newsGrid.innerHTML = items.map(item => `
        <article class="card">
            <p class="eyebrow">${item.source}</p>
            <h3>${item.title}</h3>
            <p>${item.summary || ""}</p>
            <a href="${item.url}" target="_blank" rel="noopener">Read source →</a>
            <small class="timestamp">${item.time}</small>
        </article>
    `).join("");
    dom.newsTimestamp.textContent = label || `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    updateMetric(dom.metricHeadlines, items.length);
}

async function hydrateArticles() {
    try {
        const response = await fetch(articleEndpoint, { cache: "no-store" });
        if (!response.ok) throw new Error("Articles API failed");
        const payload = await response.json();
        const articles = (payload || [])
            .slice(0, 6)
            .map(item => ({
                title: item.title?.trim() || "AI insight",
                minutes: item.reading_time_minutes || 3,
                summary: item.description?.slice(0, 180) || "Tap through for the full analysis on dev.to.",
                link: item.url || item.canonical_url || "https://dev.to/tag/ai"
            }));

        if (!articles.length) throw new Error("No articles mapped");

        renderArticles(articles);
        saveCache(cacheKeys.articles, articles);
    } catch (error) {
        console.warn("Falling back to cached/backup articles", error);
        const cached = loadCache(cacheKeys.articles);
        if (cached?.length) {
            renderArticles(cached);
            return;
        }
        const backup = await loadArticlesFromFile();
        renderArticles(backup);
    }
}

async function loadArticlesFromFile() {
    try {
        const response = await fetch("data/articles.json", { cache: "reload" });
        if (!response.ok) throw new Error("Missing local article file");
        return await response.json();
    } catch (error) {
        console.warn("Embedded articles missing", error);
        return [
            {
                title: "How small language models win",
                minutes: 3,
                summary: "Distilled 1B-parameter models outrun giant LLMs for embedded, on-device decisions across mobility and retail.",
                link: "https://huggingface.co/blog"
            },
            {
                title: "Cost-to-serve calculator for AI ops",
                minutes: 2,
                summary: "A checklist to keep inference spend predictable using batching, token caps, and quantization tricks.",
                link: "https://www.latent.space/"
            },
            {
                title: "Prompt patterns that never die",
                minutes: 2,
                summary: "Chain-of-density, contrastive prompts, and rubber-duck debugging keep models grounded.",
                link: "https://www.promptingguide.ai/"
            }
        ];
    }
}

function renderArticles(articles) {
    dom.articleGrid.innerHTML = articles.map(article => `
        <article class="card">
            <p class="eyebrow">~${article.minutes} min read</p>
            <h3>${article.title}</h3>
            <p>${article.summary}</p>
            <a href="${article.link}" target="_blank" rel="noopener">Open article →</a>
        </article>
    `).join("");
    updateMetric(dom.metricArticles, articles.length);
}

async function hydrateFacts(count = 3) {
    const facts = [];
    for (let i = 0; i < count; i += 1) {
        try {
            const response = await fetch(`${factEndpoint}&timestamp=${Date.now()}-${i}`, { cache: "no-store" });
            if (!response.ok) throw new Error("Fact fetch failed");
            const payload = await response.json();
            if (payload && payload.text) {
                facts.push(payload.text);
            }
        } catch (error) {
            console.warn("Fact fetch fallback", error);
            break;
        }
    }
    const cachedFacts = loadCache(cacheKeys.facts);
    let pool = [...facts];

    if (facts.length) {
        saveCache(cacheKeys.facts, facts);
    } else if (cachedFacts?.length) {
        pool = [...cachedFacts];
    }

    if (pool.length < count && cachedFacts?.length) {
        pool = pool.concat(cachedFacts);
    }

    if (pool.length < count) {
        pool = pool.concat(fallbackFacts);
    }

    renderFacts(pool.slice(0, count));
}

function renderFacts(facts) {
    dom.factGrid.innerHTML = facts.map(text => `
        <article class="fact">
            <p>${text}</p>
        </article>
    `).join("");
    updateMetric(dom.metricFacts, facts.length);
}

function renderGallery(shots) {
    dom.galleryGrid.innerHTML = shots.map(shot => `
        <figure>
            <img src="${shot.url}" alt="${shot.title}">
            <figcaption>${shot.title} · ${shot.credit}</figcaption>
        </figure>
    `).join("");
}

async function hydrateGallery() {
    try {
        const response = await fetch(galleryEndpoint, { cache: "no-store" });
        if (!response.ok) throw new Error("Gallery API failed");
        const payload = await response.json();
        const shots = (payload.images || [])
            .slice(0, 6)
            .map(image => ({
                title: image.prompt?.split(".")[0]?.slice(0, 40) || "AI concept",
                url: image.src || image.srcSmall || image.srcSmallSquare,
                credit: "Lexica"
            }))
            .filter(item => Boolean(item.url));

        if (!shots.length) throw new Error("No gallery shots mapped");

        renderGallery(shots);
        saveCache(cacheKeys.gallery, shots);
    } catch (error) {
        console.warn("Falling back to cached/static gallery", error);
        const cached = loadCache(cacheKeys.gallery);
        if (cached?.length) {
            renderGallery(cached);
            return;
        }
        renderGallery(galleryShots);
    }
}

function updateMetric(node, value) {
    if (!node) return;
    node.textContent = value.toString().padStart(2, "0");
}

function wireInteractions() {
    document.querySelectorAll('[data-action="refresh-facts"]').forEach(btn => {
        btn.addEventListener("click", () => hydrateFacts());
    });

    document.querySelectorAll('[data-action="surprise"]').forEach(btn => {
        btn.addEventListener("click", async () => {
            await hydrateFacts(1);
        });
    });

    document.querySelectorAll('[data-action="notify"]').forEach(btn => {
        btn.addEventListener("click", () => {
            if (typeof dom.notifyDialog.showModal === "function") {
                dom.notifyDialog.showModal();
            } else {
                alert("Shoot us a DM on GitHub (@satyapriyaarya) and we'll add you manually.");
            }
        });
    });

    dom.notifyDialog?.addEventListener("close", () => {
        if (dom.notifyDialog.returnValue === "submit") {
            alert("Thanks! We'll keep you posted.");
        }
    });

    document.querySelectorAll('[data-action="contact"]').forEach(link => {
        link.addEventListener("click", openContactDialog);
    });

    document.querySelectorAll('[data-close="contact"]').forEach(btn => {
        btn.addEventListener("click", () => closeContactDialog());
    });

    dom.contactForm?.addEventListener("submit", submitContactForm);
    dom.contactDialog?.addEventListener("close", () => {
        clearContactNotice();
        dom.contactForm?.reset();
    });
}

function openContactDialog(event) {
    if (event) event.preventDefault();
    if (typeof dom.contactDialog?.showModal === "function") {
        dom.contactDialog.showModal();
    } else {
        alert("Your browser blocks the contact dialog. Please DM @satyapriyaarya on GitHub instead.");
    }
}

function closeContactDialog() {
    if (dom.contactDialog?.open) {
        dom.contactDialog.close();
    }
    clearContactNotice();
}

function clearContactNotice() {
    if (!dom.contactNotice) return;
    dom.contactNotice.hidden = true;
    dom.contactNotice.textContent = "";
    dom.contactNotice.removeAttribute("data-variant");
}

function setContactNotice(message, variant = "success") {
    if (!dom.contactNotice) return;
    dom.contactNotice.textContent = message;
    dom.contactNotice.dataset.variant = variant;
    dom.contactNotice.hidden = false;
}

function toggleContactLoading(isLoading) {
    if (!dom.contactSubmit) return;
    dom.contactSubmit.disabled = isLoading;
    dom.contactSubmit.textContent = isLoading ? "Sending…" : "Send message";
}

async function submitContactForm(event) {
    event.preventDefault();
    if (!dom.contactForm) return;

    const formData = new FormData(dom.contactForm);
    const payload = Object.fromEntries(formData.entries());
    const validationMessage = validateContactPayload(payload);
    if (validationMessage) {
        setContactNotice(validationMessage, "error");
        return;
    }
    const sanitized = {
        name: payload.name.trim(),
        email: payload.email.trim(),
        message: payload.message.trim(),
        subscribe: payload.subscribe ? "Yes" : "No",
        origin: window.location.href,
    };
    toggleContactLoading(true);
    clearContactNotice();

    try {
        const response = await fetch(contactEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(sanitized),
        });

        if (!response.ok) {
            throw new Error("Contact submission failed");
        }

        setContactNotice("Thanks! We received your note and will reply soon.", "success");
        dom.contactForm.reset();
    } catch (error) {
        console.error(error);
        setContactNotice("Couldn't send right now. Please retry in a minute.", "error");
    } finally {
        toggleContactLoading(false);
    }
}

function validateContactPayload(payload) {
    const name = payload.name?.trim();
    const email = payload.email?.trim();
    const message = payload.message?.trim();

    if (!name || name.length < 2) {
        return "Add your name so we know who is writing.";
    }

    if (!isValidEmail(email)) {
        return "Drop a valid email so we can reply.";
    }

    if (!message || message.length < 20) {
        return "Share a bit more detail (20+ characters).";
    }

    return "";
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}

function saveCache(key, data) {
    if (!storageAvailable) return;
    try {
        const payload = { timestamp: Date.now(), data };
        window.localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
        console.warn("Unable to save cache", error);
    }
}

function loadCache(key) {
    if (!storageAvailable) return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const payload = JSON.parse(raw);
        if (!payload?.data || !payload.timestamp) return null;
        if (Date.now() - payload.timestamp > cacheTtlMs) return null;
        return payload.data;
    } catch (error) {
        console.warn("Unable to read cache", error);
        return null;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    hydrateNews();
    hydrateArticles();
    hydrateFacts();
    hydrateGallery();
    wireInteractions();
});
