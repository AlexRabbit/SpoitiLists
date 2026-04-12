If this helped you, consider starring the repo ⭐

# SpoitiLists — an addon for SpotiFLAC

**Repository:** [github.com/AlexRabbit/SpoitiLists](https://github.com/AlexRabbit/SpoitiLists)

**SpoitiLists** is a free extension for **[SpotiFLAC Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)**. It shows **your real Spotify playlists** and **your saved (liked) songs** inside SpotiFLAC’s **Home** feed. When you **open a playlist** in the app, it loads the **current track list** from Spotify, so new songs you add on Spotify show up the next time you open that playlist (SpotiFLAC may cache the Home screen for a few minutes).

This project is **not** made by Spotify or the SpotiFLAC team. It uses Spotify’s official **Web API** and **OAuth** (you log in with your Spotify account).

---

## GitHub “About” description (copy-paste)

Paste this into your repository **About** field on GitHub:

```
SpoitiLists — SpotiFLAC Mobile addon: your Spotify playlists & saved tracks in the app (OAuth). Not affiliated with Spotify or SpotiFLAC.
```

(Same text is in `REPO_ABOUT.txt`.)

---

## What you need before you start

1. An **Android phone** with **SpotiFLAC Mobile** installed ([releases](https://github.com/zarzet/SpotiFLAC-Mobile/releases)).
2. A **Spotify account** (free or Premium).
3. A **GitHub account** only if you are **installing from this repo’s Store link** below. If you install the `.spotiflac-ext` file manually, GitHub is optional.

---

## Install SpoitiLists in SpotiFLAC (easiest: Store link)

SpotiFLAC can load extensions from a **registry JSON** on GitHub.

1. Open **SpotiFLAC** → **Store** tab.
2. When it asks for an **Extension Repository URL**, paste the **raw** `registry.json` link. Either of these is the same file (use whichever SpotiFLAC accepts):

   - `https://raw.githubusercontent.com/AlexRabbit/SpoitiLists/main/registry.json`
   - `https://raw.githubusercontent.com/AlexRabbit/SpoitiLists/refs/heads/main/registry.json`

   (GitHub’s **Raw** button may show the second form; both are valid.)

3. Find **SpoitiLists** in the list and **install** it.
4. Go to **Settings → Extensions**, tap **SpoitiLists**, and follow **Part B** below to connect Spotify.

If you **fork** this repo, set `download_url` in `registry.json` to your fork’s raw `extensions/spoiti-lists.spotiflac-ext` URL, then use **your** `registry.json` raw link in the Store.

---

## Part A — Spotify Developer setup (first time only)

You must create a small “app” in Spotify’s developer site. You are **not** publishing an app to the Play Store; this is only for an **API Client ID**.

1. On a computer or phone browser, go to:  
   [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in with your **Spotify** account.
3. Click **Create app**.
4. Fill in:
   - **App name:** anything, e.g. `SpoitiLists`
   - **App description:** e.g. `Personal SpotiFLAC extension`
   - **Redirect URI:** click **Add**, type exactly:  
     `spotiflac://callback`  
     (If SpotiFLAC’s docs or settings say a different URI, use **that** exact string instead.)
   - **Which API/SDKs are you planning to use?** choose **Web API**.
5. Save. Open the app → **Settings**.
6. Copy the **Client ID** (long text). **Do not** put your **Client Secret** into SpoitiLists; this extension uses **PKCE** and does not need the secret.

---

## Part B — Connect SpoitiLists inside SpotiFLAC

1. Open **SpotiFLAC** → **Settings** → **Extensions** → **SpoitiLists**.
2. Paste your **Spotify Client ID** into **Spotify Client ID**.
3. Leave **Redirect URI** as `spotiflac://callback` unless you changed it in Spotify’s dashboard (both places must **match exactly**).
4. Tap **1. Connect to Spotify** → your browser opens → log in to Spotify → **Agree**.
5. When you return to SpotiFLAC, open **SpoitiLists** settings again and tap **2. Finish login**.
6. You should see a success message. If not, try **Connect** again, complete the browser step, then **Finish login** again.

---

## Where to see your playlists in SpotiFLAC

- Open the **Home** tab. With SpoitiLists enabled, you should see sections like **Your playlists** and **Saved tracks**.
- Tap a **playlist** to open it; the song list is loaded from Spotify when you open it.
- If you added songs on Spotify and don’t see them yet: **go back** and **open the playlist again**. The Home row can update after a **short cache** (often a few minutes).

---

## Optional: install the file without the Store

1. Download **`extensions/spoiti-lists.spotiflac-ext`** from this repo (raw or ZIP of the repo).
2. SpotiFLAC → **Settings** → **Extensions** → install **.spotiflac-ext** (as described in SpotiFLAC’s own help).

---

## For developers: rebuild the extension package

From the repo root:

- **Windows:**  
  `powershell -ExecutionPolicy Bypass -File scripts/package.ps1`
- **macOS / Linux:**  
  `chmod +x scripts/package.sh && ./scripts/package.sh`

This creates `spoiti-lists.spotiflac-ext` and copies it to **`extensions/spoiti-lists.spotiflac-ext`** (the path used in `registry.json` for GitHub raw hosting).

After changing `manifest.json` or `index.js`, rebuild, commit, and push so the Store URL stays up to date.

---

## Push this project to GitHub (first time)

1. Create a **new repository** on GitHub named **`SpoitiLists`** (e.g. under **`AlexRabbit`**).
2. On your PC, in this folder:

```bash
git init
git add .
git commit -m "Initial release: SpoitiLists SpotiFLAC extension"
git branch -M main
git remote add origin https://github.com/AlexRabbit/SpoitiLists.git
git push -u origin main
```

If you rename the repo or change your GitHub username, update **`registry.json`**, **`manifest.json` `homepage`**, and links in **`README.md`** to match.

---

## Docs and credits

- [SpotiFLAC Extension Development Guide](https://spotiflac.zarz.moe/docs)
- [SpotiFLAC Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)

License: **MIT** — see `LICENSE`.
