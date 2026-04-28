const postGrid = document.getElementById("postGrid");
const PRIMARY_BLOG_SLUG = "leh-ladakh-15-day-journey";
const PRIMARY_BLOG_IMAGE = "/blogs/assets/img/journey/716a7116dcc4c7691bce3b549effcd5d28e0d079.jpg";

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

    const journeyRoutes = {
        "leh-ladakh-15-day-journey": "journey/index.html",
        "valley-of-flowers-10-day-journey": "journey/valley-of-flowers/index.html",
        "assam-east-india-8-day-itinerary": "journey/assam/index.html",
        "goa-south-india-6-day-journey": "journey/goa/index.html",
        "rameshwaram-south-india-5-day-journey": "journey/rameshwaram/index.html",
        "golden-triangle-7-day-journey": "journey/golden-triangle/index.html",
        "jaisalmer-5-day-desert-journey": "journey/jaisalmer/index.html",
        "udaipur-city-of-lakes-4-day-journey": "journey/city-of-lakes/index.html",
        "jaipur-pink-city-4-day-journey": "journey/pink-city/index.html",
        "kerala-backwaters-6-day-journey": "journey/kerala-backwaters/index.html"
    };

    const sortedPosts = posts
        .slice()
        .sort((a, b) => {
            if (a.slug === PRIMARY_BLOG_SLUG) return -1;
            if (b.slug === PRIMARY_BLOG_SLUG) return 1;
            return new Date(b.date) - new Date(a.date);
        });

    postGrid.innerHTML = sortedPosts
        .map(post => {
            const postHref = journeyRoutes[post.slug]
                ? journeyRoutes[post.slug]
                : `post.html?slug=${encodeURIComponent(post.slug)}`;

            if (post.slug === PRIMARY_BLOG_SLUG) {
                return `
                <article class="post-card featured-primary" data-link="${postHref}" role="link" tabindex="0" style="cursor: pointer;">
                    <img class="featured-cover" src="${PRIMARY_BLOG_IMAGE}" alt="${post.title} cover">
                    <div class="featured-content">
                        <p class="eyebrow">Primary Travel Series</p>
                        <h2>${post.title}</h2>
                        <p>${post.excerpt}</p>
                        <p class="post-meta">
                            <span>${new Date(post.date).toLocaleDateString()}</span>
                            <span>${post.readTime || "3 min read"}</span>
                        </p>
                        <p><a href="${postHref}">Open full series →</a></p>
                    </div>
                </article>
                `;
            }

            return `
            <article class="post-card" data-link="${postHref}" role="link" tabindex="0" style="cursor: pointer;">
                <p class="eyebrow">${post.category || "General"}</p>
                <h2>${post.title}</h2>
                <p>${post.excerpt}</p>
                <p class="post-meta">
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                    <span>${post.readTime || "3 min read"}</span>
                </p>
                <p><a href="${postHref}">Read article →</a></p>
            </article>
            `;
        })
        .join("");

    // Make the full card navigate like the journey cards.
    document.querySelectorAll(".post-card[data-link]").forEach(card => {
        const targetHref = card.getAttribute("data-link");
        if (!targetHref) return;

        card.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            window.location.href = targetHref;
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                window.location.href = targetHref;
            }
        });
    });
}

loadPosts();
