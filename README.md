
# IndiBargain

A modern, Indian-themed static site built with React and Vite, showing Memes, Facts, and Recipes from public APIs.

## Features
- Beautiful Indian color palette and theme
- Trending Memes, Fun Facts, and Popular Recipes
- Responsive, Material UI design
- No backend required (static site)

## Local Development

1. **Install dependencies:**
	```sh
	npm install
	```
2. **Start the dev server:**
	```sh
	npm run dev
	```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Live Site

Once deployed, your site will be available at:

👉 https://satyapriyaarya.github.io/IndiBargain/

## Deploy to GitHub Pages

1. **Set the `base` in `vite.config.js`**
	- Edit `vite.config.js` and set:
	  ```js
	  export default defineConfig({
		 base: '/YOUR_REPO_NAME/',
		 // ...
	  })
	  ```
	- Replace `YOUR_REPO_NAME` with your actual repo name.

2. **Add the deploy script:**
	- In `package.json`, add:
	  ```json
	  "scripts": {
		 // ...existing scripts
		 "predeploy": "npm run build",
		 "deploy": "gh-pages -d dist"
	  }
	  ```
	- Install the deploy tool:
	  ```sh
	  npm install --save-dev gh-pages
	  ```

3. **Build and deploy:**
	```sh
	npm run deploy
	```

4. **Set GitHub Pages source:**
	- In your repo settings, set GitHub Pages source to `gh-pages` branch.

## Notes
- All content is fetched from public APIs at runtime.
- If you see CORS or API errors, try again or check your network.

---

Made with ❤️ for India!
