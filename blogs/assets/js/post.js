const postShell = document.getElementById("postShell");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const SITE_URL = "https://indibargain.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/blogs/assets/img/journey/016fa4f441412ff49bfa4ecb94d2d7f6a42d1b30.jpg`;
const JOURNEY_SERIES_ROUTES = {
    "leh-ladakh-15-day-journey": "/blogs/journey/index.html",
    "valley-of-flowers-10-day-journey": "/blogs/journey/valley-of-flowers/index.html",
    "assam-east-india-8-day-itinerary": "/blogs/journey/assam/index.html",
    "goa-south-india-6-day-journey": "/blogs/journey/goa/index.html",
    "rameshwaram-south-india-5-day-journey": "/blogs/journey/rameshwaram/index.html",
    "golden-triangle-7-day-journey": "/blogs/journey/golden-triangle/index.html",
    "jaisalmer-5-day-desert-journey": "/blogs/journey/jaisalmer/index.html",
    "udaipur-city-of-lakes-4-day-journey": "/blogs/journey/city-of-lakes/index.html",
    "jaipur-pink-city-4-day-journey": "/blogs/journey/pink-city/index.html",
    "kerala-backwaters-6-day-journey": "/blogs/journey/kerala-backwaters/index.html"
};

if (slug && JOURNEY_SERIES_ROUTES[slug]) {
    window.location.replace(JOURNEY_SERIES_ROUTES[slug]);
}

function upsertMeta(attribute, key, value) {
    if (!value) {
        return;
    }

    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute("content", value);
}

function setCanonical(url) {
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", url);
}

function toDescription(text) {
    return String(text || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 155);
}

function applyPostSeo(post) {
    const title = `${post.title} | IndiBargain Travel Blog`;
    const description = toDescription(post.excerpt || post.content || "Read travel insights and practical itineraries.") || "Read travel insights and practical itineraries.";
    const postUrl = `${SITE_URL}/blogs/post/?slug=${encodeURIComponent(post.slug || "")}`;

    document.title = title;
    setCanonical(postUrl);

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", `${post.title || "India travel"}, India travel blog, destination guide India, travel itinerary India`);
    upsertMeta("name", "robots", "index, follow");

    upsertMeta("property", "og:type", "article");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", postUrl);
    upsertMeta("property", "og:site_name", "IndiBargain");
    upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
}

async function loadPost() {
    try {
        const response = await fetch("data/posts.json", { cache: "default" });
        if (!response.ok) {
            throw new Error("Unable to load posts");
        }

        const posts = await response.json();
        const sortedPosts = Array.isArray(posts)
            ? [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];

        const post = slug
            ? sortedPosts.find(item => item.slug === slug)
            : sortedPosts[0];

        if (!post) {
            renderMissing();
            return;
        }

        renderPost(post);
    } catch (error) {
        renderError();
    }
}

function renderPost(post) {
    applyPostSeo(post);
    const linkedContent = (post.content || "")
        .replace(/journey\/index\.html/g, '<a href="/blogs/journey/index.html">journey/index.html</a>')
        .replace(/\n/g, "<br><br>");

    postShell.innerHTML = `
        <p class="eyebrow">${post.category || "General"}</p>
        <h1>${post.title}</h1>
        <p class="post-meta">
            <span>${new Date(post.date).toLocaleDateString()}</span>
            <span>${post.readTime || "3 min read"}</span>
            <span>By ${post.author || "IndiBargain"}</span>
        </p>
        <div class="post-content">${linkedContent}</div>
        <p><a href="index.html">← Back to all articles</a></p>
    `;
}

function renderMissing() {
    document.title = "Post Not Found | IndiBargain Blogs";
    setCanonical(`${SITE_URL}/blogs/post/`);
    upsertMeta("name", "robots", "noindex, follow");
    postShell.innerHTML = `
        <h1>Post not found</h1>
        <p>The article you are looking for is not available.</p>
        <p><a href="index.html">← Back to all articles</a></p>
    `;
}

function renderError() {
    document.title = "Post Unavailable | IndiBargain Blogs";
    upsertMeta("name", "robots", "noindex, follow");
    postShell.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this article right now.</p>
        <p><a href="index.html">← Back to all articles</a></p>
    `;
}

if (!(slug && JOURNEY_SERIES_ROUTES[slug])) {
    loadPost();
}
