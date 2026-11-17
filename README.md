# Project Eye Opener

Standalone, responsive static recreation of https://www.project-eyeopener.org/, captured on 17 November 2026. Intended repository: `udiz-lab-projects/project-eyeopener`.

The deployable site is in `public/`. It contains ordinary HTML, CSS, images, animated GIFs, PDFs, and MP4s. No Wix runtime, database, package installation, external fonts, or build service is required to serve it. Contact links open the visitor's email application.

## Preview and edit

Requires Node.js (already available in this environment):

```powershell
node serve.mjs
```

Open http://127.0.0.1:4173/. Stop the server with Ctrl+C.

- Edit page text in `content.json`.
- Edit layout and page composition in `build.mjs`.
- Edit styling in `styles.css`.
- Run `node build.mjs`, then `node validate.mjs`, and reload the preview.
- Commit both source and regenerated `public/` files. The deployment uploads `public/` directly.

All ten original page paths are retained, including `ophthamology` (the original misspelling) and both recent-findings pages. Relative URLs work on a GitHub project URL or a custom domain. Research navigation is a native, keyboard-accessible disclosure. The long research text is shown in full instead of requiring Wix's Read More controls.

## Publish with GitHub Pages

Use a dedicated public repository under `udiz-lab-projects` for free GitHub Pages hosting. A private repository requires a GitHub plan that includes private-repository Pages.

After authenticating the GitHub CLI, from this folder:

```powershell
git init -b main
git add .
git commit -m "Recreate Project Eye Opener as a standalone static website"
gh repo create udiz-lab-projects/project-eyeopener --public --source . --remote origin
gh api --method POST repos/udiz-lab-projects/project-eyeopener/pages -f build_type=workflow
git push -u origin main
```

The included `.github/workflows/pages.yml` publishes `public/` on pushes to `main`. Alternatively enable **Settings → Pages → Source → GitHub Actions** in the repository before pushing. Inspect the Actions deployment and verify the live site before considering publication complete.

Expected project address after successful deployment: https://udiz-lab-projects.github.io/project-eyeopener/ (not yet published).

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Keep the existing domain

After reviewing the deployed site, configure `www.project-eyeopener.org` in GitHub Pages, verify domain ownership, and update the appropriate DNS records at the domain's DNS provider. Add a `public/CNAME` file containing the custom domain before deploying that change. The domain registration remains a separate recurring cost even when hosting is free. Do not remove the Wix site or change DNS until the replacement has been verified.

Official instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Migration record and review items

- Ten pages, 23 team profiles, 26 publication entries with 25 distinct local PDFs, 96 image assets, and three local MP4 demonstrations.
- The layout preserves the original identity, logo, mission, content, and photographs while adapting spacing, navigation, and grids to mobile screens. It is a recreation, not a pixel-exact Wix export.
- Original page HTML and URL-to-file manifests are in `archive/`, excluded from Git. Import utilities are retained for provenance; re-importing will overwrite imported content.
- The original shape-integration section has an empty `VideoPlayer` container with no playable URL exposed in the downloaded page or rendered DOM. Its prose and figures are retained. Supply the original video to restore that fourth demonstration.
- Research counts, dates, affiliations, and scientific claims are preserved from the original site; differing historical counts on different pages have not been editorially reconciled.
- The source site links two different older Zohary publication entries to the same PDF. This original link mapping is preserved and should be reviewed by the owner.
- Internal links, local media references, and PDF signatures are checked by `node validate.mjs`. External publisher links remain external and are not guaranteed by this check.

Content and media remain the property of their respective owners. No new license is assigned by this migration.
