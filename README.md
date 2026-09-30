# Amer Jweihan Portfolio

A responsive, single-page cybersecurity portfolio. It is a static site: no build step or package installation is needed.

## Files

- `index.html` is the site.
- `assets/` contains the CWSE and CAPT certificate images.
- `.github/workflows/pages.yml` deploys the site to GitHub Pages when changes are pushed to `main`.

The page uses Google Fonts and a hosted Unsplash image, so those visual assets require an internet connection. Certificate images are stored locally in the repository.

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
