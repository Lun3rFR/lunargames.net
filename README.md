# Lunar Games website

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
index.html        Lunar Games start page (featured game + list of all games)
rearmour.html     Rearmour page: wordmark, main-menu screen, account login/sign-up, server status, news
css/style.css     all styling (colors are the variables at the top)
js/games.js       THE LIST OF GAMES on the start page. Edit this to add or rename games
js/home.js        draws the game cards from games.js
js/rearmour.js    Rearmour page behavior (menu, tips, login, server light)
js/config.js      address of your game server (REARMOUR_API)
CNAME             tells GitHub Pages the domain is lunargame.net
```

The Rearmour page is `rearmour.html` (lowercase, no spaces), so its address is
`https://lunargame.net/rearmour.html`. Spaces and capitals in file names cause broken links on GitHub.

## Put it online with GitHub Pages

1. Create a GitHub repository and upload everything in this folder to its root (not the folder itself).
2. Repo Settings > Pages > publish from the `main` branch, root folder.
3. In Pages, set the custom domain to `lunargame.net`. At the place where your domain's DNS lives, add the records
   GitHub's Pages documentation lists for a custom domain, then tick "Enforce HTTPS" once it's available.
4. Repos on a free account are public, and so is the site. Never put the server's `data/` folder, `secret.key`
   or admin key in this repo.

## Connect it to the game server

`js/config.js` points at `https://api.lunargame.net`. That address must reach the Go server (put Caddy in front of
it for HTTPS, as in the server README). Start the server with the site's address allowed:

```
./gameserver -cors-origin https://lunargame.net,https://www.lunargame.net ...
```

(That is already the default.) Until the server is running, the Rearmour page shows "Offline right now" and login
says it can't reach the server; the rest of the page works. To turn the account box's server calls off, set
`window.REARMOUR_API = ""`.

## Customizing

- New game card: add an entry to `js/games.js`.
- Colors: edit the variables at the top of `css/style.css`. The Rearmour page overrides a few under `body.rearmour`.
- Menu tiles on the Rearmour page are the `<button class="tile">` blocks in `rearmour.html`. Right now they show a
  "coming soon" message because the game isn't downloadable yet; point them at real links when it is.
- All artwork is original (a simple shield and crescent drawn in SVG). Keep it that way: use your own logo, art and
  names, not Rec Room's.
