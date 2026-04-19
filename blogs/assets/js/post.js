const postShell = document.getElementById("postShell");
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

async function loadPost() {
    if (!slug) {
        renderMissing();
        return;
    }

    try {
        const response = await fetch("data/posts.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Unable to load posts");
        }

        const posts = await response.json();
        const post = posts.find(item => item.slug === slug);

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

    postShell.innerHTML = `
        <p class="eyebrow">${post.category || "General"}</p>
        <h1>${post.title}</h1>
        <p class="post-meta">
            <span>${new Date(post.date).toLocaleDateString()}</span>
            <span>${post.readTime || "3 min read"}</span>
            <span>By ${post.author || "IndiBargain"}</span>
        </p>
        <div class="post-content">${post.content.replace(/\n/g, "<br><br>")}</div>
        <p><a href="index.html">← Back to all articles</a></p>
    `;
}

function renderMissing() {
    postShell.innerHTML = `
        <h1>Post not found</h1>
        <p>The article you are looking for is not available.</p>
        <p><a href="index.html">← Back to all articles</a></p>
    `;
}

function renderError() {
    postShell.innerHTML = `
        <h1>Something went wrong</h1>
        <p>Unable to load this article right now.</p>
        <p><a href="index.html">← Back to all articles</a></p>
    `;
}

loadPost();
