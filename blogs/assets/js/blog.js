const postGrid = document.getElementById("postGrid");
const languageSelector = document.getElementById("languageSelector");
const currentLanguageLabel = document.getElementById("currentLanguageLabel");
const heroPrimaryLink = document.getElementById("heroPrimaryLink");

const BLOG_LANGUAGE_KEY = "ib_blog_lang";
const SUPPORTED_LANGUAGES = ["en", "hi"];

const languageMeta = {
    en: {
        name: "English",
        readLabel: "Read article →",
        emptyMessage: "No English posts published yet.",
        heroHref: "journey/index.html",
        heroText: "Read: Bike Trip To Leh Ladakh (15-part series) →"
    },
    hi: {
        name: "हिंदी",
        readLabel: "पूरा लेख पढ़ें →",
        emptyMessage: "अभी कोई हिंदी लेख उपलब्ध नहीं है।",
        heroHref: "journey/index.html",
        heroText: "हिंदी में पढ़ें: Leh Ladakh यात्रा (15 भाग) →"
    }
};

function getSelectedLanguage() {
    const params = new URLSearchParams(window.location.search);
    const queryLanguage = (params.get("lang") || "").trim().toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(queryLanguage)) {
        localStorage.setItem(BLOG_LANGUAGE_KEY, queryLanguage);
        return queryLanguage;
    }

    const savedLanguage = (localStorage.getItem(BLOG_LANGUAGE_KEY) || "").trim().toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
        return savedLanguage;
    }

    return "en";
}

function setSelectedLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        return;
    }

    localStorage.setItem(BLOG_LANGUAGE_KEY, language);
    updateLanguageUI(language);
    loadPosts();
}

function updateLanguageUI(language) {
    if (languageSelector) {
        languageSelector.querySelectorAll("[data-lang]").forEach((button) => {
            button.classList.toggle("active", button.dataset.lang === language);
            button.setAttribute("aria-pressed", button.dataset.lang === language ? "true" : "false");
        });
    }

    if (currentLanguageLabel) {
        const label = languageMeta[language] ? languageMeta[language].name : language;
        currentLanguageLabel.textContent = `Showing ${label} posts`;
    }

    if (heroPrimaryLink && languageMeta[language]) {
        heroPrimaryLink.setAttribute("href", languageMeta[language].heroHref);
        heroPrimaryLink.textContent = languageMeta[language].heroText;
    }
}

if (languageSelector) {
    languageSelector.addEventListener("click", (event) => {
        const target = event.target.closest("[data-lang]");
        if (!target) {
            return;
        }

        setSelectedLanguage(target.dataset.lang);
    });
}

async function loadPosts() {
    try {
        const response = await fetch("data/posts.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Unable to load posts");
        }
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        postGrid.innerHTML = `<article class="post-card"><p>Could not load posts right now.</p></article>`;
    }
}

function renderPosts(posts) {
    if (!Array.isArray(posts) || posts.length === 0) {
        postGrid.innerHTML = `<article class="post-card"><p>No posts published yet.</p></article>`;
        return;
    }

    const selectedLanguage = getSelectedLanguage();
    updateLanguageUI(selectedLanguage);

    const filteredPosts = posts.filter((post) => {
        const language = (post.language || "en").toLowerCase();
        return language === selectedLanguage;
    });

    if (filteredPosts.length === 0) {
        const message = languageMeta[selectedLanguage]
            ? languageMeta[selectedLanguage].emptyMessage
            : "No posts found for the selected language.";

        postGrid.innerHTML = `<article class="post-card"><p>${message}</p></article>`;
        return;
    }

    postGrid.innerHTML = filteredPosts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => {
            const postHref = post.slug === "leh-ladakh-15-day-journey"
                ? "journey/index.html"
                : `post.html?slug=${encodeURIComponent(post.slug)}`;

            const cardLanguage = (post.language || "en").toLowerCase() === "hi" ? "हिंदी" : "English";
            const readLabel = languageMeta[selectedLanguage]
                ? languageMeta[selectedLanguage].readLabel
                : "Read article →";

            return `
            <article class="post-card">
                <p class="eyebrow">${post.category || "General"}</p>
                <h2>${post.title}</h2>
                <p>${post.excerpt}</p>
                <p class="post-meta">
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                    <span>${post.readTime || "3 min read"}</span>
                    <span>${cardLanguage}</span>
                </p>
                <p><a href="${postHref}">${readLabel}</a></p>
            </article>
        `;
        })
        .join("");
}

loadPosts();
