const blogsEndpoint = "/blogs/data/posts.json";

const dom = {
    featuredGrid: document.getElementById("featuredGrid"),
};

async function loadBlogPosts() {
    try {
        const response = await fetch(blogsEndpoint, { cache: "no-store" });
        if (!response.ok) throw new Error("Blog API failed");
        const posts = await response.json();
        renderFeaturedPosts(posts.slice(0, 3));
    } catch (error) {
        console.warn("Failed to load blog posts", error);
        dom.featuredGrid.innerHTML = `<p>Could not load featured articles. Visit <a href="/blogs/index.html">our blog</a> for all posts.</p>`;
    }
}

function renderFeaturedPosts(posts) {
    dom.featuredGrid.innerHTML = posts.map(post => `
        <article class="card">
            <p class="eyebrow">${post.category}</p>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                <small class="timestamp">${post.readTime}</small>
                <a href="/blogs/post.html?slug=${encodeURIComponent(post.slug)}" style="color: var(--accent); text-decoration: none; font-weight: 600;">Read →</a>
            </div>
        </article>
    `).join("");
}

// Load featured posts on page load
loadBlogPosts();
