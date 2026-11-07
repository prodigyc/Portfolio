# Amer Jweihan Portfolio

A responsive, single-page cybersecurity portfolio. It is a static site: no build step or package installation is needed.

## Files

- `index.html` is the site.
- `assets/` contains the CWSE and CAPT certificate images.
- `.github/workflows/pages.yml` deploys the site to GitHub Pages when changes are pushed to `main`.

The page uses Google Fonts, a hosted Unsplash image, and Glisse v0.5.0's stylesheet (jsDelivr) and React components (version-pinned ESM via esm.sh), so those visual assets and component dependencies require an internet connection. Certificate images are stored locally in the repository.

The header uses Glisse's `.lg-glass` surface, and Glisse `Button` components power the project filters and hero actions. React and Glisse load directly in the browser; no package installation or build step is required. See [0kzh/glisse](https://github.com/0kzh/glisse) for the library and its MIT license.

The visual direction pairs an editorial personal introduction with a working-terminal visual, code-like navigation, and a subtle grid. Its warm beige canvas balances orange details with golden-yellow highlights, while the terminal retains a dark contrast surface. The portfolio highlights Amer's interest in ethical hacking and authorized security labs alongside digital forensics and secure systems.

## Publish with GitHub Pages

1. Create a **public** repository on GitHub. Do not initialize it with a README or other files.
2. In this folder, commit and push the site:

   ```powershell
   git add .
   git commit -m "Add portfolio site"
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages** and set the source to **GitHub Actions**.
4. Open the **Actions** tab and wait for “Deploy portfolio to GitHub Pages” to finish. GitHub will show the public site URL in the deployment details.

Future pushes to `main` redeploy the site automatically.
