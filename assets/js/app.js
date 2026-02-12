const newsEndpoint = "https://hn.algolia.com/api/v1/search_by_date?query=artificial%20intelligence&tags=story&hitsPerPage=6";
const factEndpoint = "https://uselessfacts.jsph.pl/random.json?language=en";
const contactRecipient = "c2F0eWFwcml5YWFyeWFAZ21haWwuY29t"; // base64 so it isn't visible in markup
const contactEndpoint = `https://formsubmit.co/ajax/${atob(contactRecipient)}`;
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
                summary: item.story_text?.slice(0, 120) || item._highlightResult?.story_text?.value || "Tap for details",
                time: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));
        renderNews(stories.length ? stories : fallbackNews);
    } catch (error) {
        console.warn("Falling back to static news", error);
        renderNews(fallbackNews);
    }
}

function renderNews(items) {
    dom.newsGrid.innerHTML = items.map(item => `
        <article class="card">
            <p class="eyebrow">${item.source}</p>
            <h3>${item.title}</h3>
            <p>${item.summary || ""}</p>
            <a href="${item.url}" target="_blank" rel="noopener">Read source →</a>
            <small class="timestamp">${item.time}</small>
        </article>
    `).join("");
    dom.newsTimestamp.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    updateMetric(dom.metricHeadlines, items.length);
}

async function hydrateArticles() {
    try {
        const response = await fetch("data/articles.json");
        if (!response.ok) throw new Error("Missing articles");
        const articles = await response.json();
        renderArticles(articles);
    } catch (error) {
        console.warn("Loading embedded articles", error);
        renderArticles([
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
        ]);
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
    const source = facts.length ? facts : fallbackFacts;
    renderFacts(source.slice(0, count));
}

function renderFacts(facts) {
    dom.factGrid.innerHTML = facts.map(text => `
        <article class="fact">
            <p>${text}</p>
        </article>
    `).join("");
    updateMetric(dom.metricFacts, facts.length);
}

function hydrateGallery() {
    dom.galleryGrid.innerHTML = galleryShots.map(shot => `
        <figure>
            <img src="${shot.url}" alt="${shot.title}">
            <figcaption>${shot.title} · ${shot.credit}</figcaption>
        </figure>
    `).join("");
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

window.addEventListener("DOMContentLoaded", () => {
    hydrateNews();
    hydrateArticles();
    hydrateFacts();
    hydrateGallery();
    wireInteractions();
});
