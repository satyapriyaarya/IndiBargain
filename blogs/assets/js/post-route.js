const postShell = document.getElementById("postShell");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const JOURNEY_SERIES_SLUG = "leh-ladakh-15-day-journey";

if (slug === JOURNEY_SERIES_SLUG) {
    window.location.replace("/blogs/journey/index.html");
}

async function loadPost() {
    try {
        const response = await fetch("../data/posts.json", { cache: "no-store" });
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
    document.title = `${post.title} · IndiBargain Blog`;
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
        <p><a href="../index.html">← Back to all articles</a></p>
    `;
}

function renderMissing() {
    postShell.innerHTML = `
        <h1>Post not found</h1>
        <p>The article you are looking for is not available.</p>
        <p><a href="../index.html">← Back to all articles</a></p>
    `;
}

function renderError() {
    postShell.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this article right now.</p>
        <p><a href="../index.html">← Back to all articles</a></p>
    `;
}

if (slug !== JOURNEY_SERIES_SLUG) {
    loadPost();
}
