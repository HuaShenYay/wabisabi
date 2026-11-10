# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.4 create --template minimal --types jsdoc --no-install portfolio-sveltekit
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Current design

The site uses a minimal warm-paper design, preserving the existing typefaces and dry-ink borders. Header and footer are shared across routes. Background scenes, decorative photos, custom cursors, scroll effects and full-screen page transitions are no longer mounted. Images are used for actual portfolio and article content.

Run `npm run check`, `npm test`, and `npm run build`. Start a production preview and run `npm run test:browser` to verify the home, five categories, reading routes and narrow layouts. `npm run test:navigation` checks immediate browser Back without adding history entries; `npm run test:performance` checks idle rendering and scroll style writes.

Install the browser with `npx playwright install chromium`, or point `WABI_BROWSER_EXECUTABLE` to an existing Chromium executable. `WABI_TEST_URL` selects the preview URL (default port 4173). `WABI_SCREENSHOT_DIR` saves screenshots.

For isolated checks, start a separate preview with `PUBLIC_SANITY_PROJECT_ID=''` on another port and set `WABI_OFFLINE=1` in the checks. This uses local sample content without changing the live CMS configuration. Do not rebuild while a production preview is running.

Historical landscape sources and prompts remain in `artwork/landscape/` as records; current pages do not request those assets. Their standalone generation scripts are retained for reference.

## Languages

The top-right language menu switches between Chinese and English. A server-read language cookie preserves the selection across refreshes and navigation. Switching also works without JavaScript. Interface strings live beside their components via the helpers in `src/lib/i18n.ts`. Chinese pages display the published work copy as written, including any English in the source. The six existing Sanity posts have English translations in `src/lib/server/published-translations.json`. For new or revised posts, use the English title, summary and body fields in Studio.

Run `npm run test:language` against a running preview using the same `WABI_TEST_URL` and `WABI_BROWSER_EXECUTABLE` settings as the browser regression checks.
