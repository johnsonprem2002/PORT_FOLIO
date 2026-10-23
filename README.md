# Johnson Prem B — Mechanical Design Portfolio

A responsive portfolio website for Johnson Prem B, featuring 17 CAD and design projects, interactive project filters, project detail overlays, experience, skills, academic projects, certifications, and a downloadable resume.

## Included
- `index.html` — website content and layout
- `style.css` — responsive styling and motion effects
- `script.js` — project filters, project detail modal, navigation, and ambient background
- `assets/` — project images and `Johnson-Prem-B-Resume.pdf`

## Preview locally
Open `index.html` in a browser. For a local server, run:

```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Deploy to GitHub Pages
1. Create a GitHub repository (for example, `mechanical-design-portfolio`).
2. Upload the contents of this folder to the repository root. Keep the `assets` folder beside `index.html`.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait for GitHub Pages to publish the site. The resume download link is served from `assets/Johnson-Prem-B-Resume.pdf`.


### Hero and galaxy updates
- Added the supplied CAD software collage as the hero image.
- Hero image gently floats and tilts with cursor movement.
- Galaxy canvas remains fixed in one viewport location while stars twinkle subtly; it does not follow the cursor or scroll.
