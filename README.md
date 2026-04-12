If this helped you, consider starring the repo ⭐

# SpoitiLists — an addon for SpotiFLAC

**SpoitiLists** is a free extension for **[SpotiFLAC Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)**. It shows **your real Spotify playlists** and **your saved (liked) songs** inside SpotiFLAC’s **Home** feed. When you **open a playlist** in the app, it loads the **current track list** from Spotify, so new songs you add on Spotify show up the next time you open that playlist (SpotiFLAC may cache the Home screen for a few minutes).

This project is **not** made by Spotify or the SpotiFLAC team. It uses Spotify’s official **Web API** and **OAuth** (you log in with your Spotify account).

---

## Install SpoitiLists in SpotiFLAC (easiest: Store link)

SpotiFLAC can load extensions from a **registry JSON** on GitHub.

1. Open **SpotiFLAC** → **Store** tab.
2. When it asks for an **Extension Repository URL**, paste this **raw** `registry.json` link:

   `https://raw.githubusercontent.com/AlexRabbit/SpoitiLists/refs/heads/main/registry.json`


3. Find **SpoitiLists** in the list and **install** it.
4. Go to **Settings → Extensions**, tap **SpoitiLists**, and follow **Part B** below to connect Spotify.

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

This flow is **SpoitiLists-only**: you do **not** need a patched SpotiFLAC build. The app shows a **snackbar** with the long Spotify URL — copy that line into **any browser**, finish Spotify’s consent, then bring the **authorization code** back into SpotiFLAC.

1. Open **SpotiFLAC** → **Settings** → **Extensions** → **SpoitiLists**.
2. Paste your **Spotify Client ID** into **Spotify Client ID**.
3. Leave **Redirect URI** as `spotiflac://callback` unless you changed it in Spotify’s dashboard (both places must **match exactly**).
4. Tap **1. Connect to Spotify**. A message appears with the **full login URL** — **copy the URL line** (scroll the snackbar if needed) and **paste it into Chrome, Safari, or another browser**. Log in and tap **Agree** on Spotify.
5. After approval, Spotify redirects to your redirect URI. Often you will see something like `spotiflac://callback?code=…&state=…` (the browser may say it cannot open the app — that is OK). **Copy the `code` value** from that address bar / error page, **or** paste the **whole callback URL** into **Authorization code** in SpoitiLists settings, tap **Save** / confirm the field, then tap **2. Finish login**.
6. If you lost the snackbar text, tap **Show last login link again** (do **not** tap Connect again unless you want a **new** login attempt, which invalidates the previous PKCE step).

**Optional — automatic handoff:** If your SpotiFLAC build **opens** `spotiflac://callback` and delivers the code to the extension, you can tap **2. Finish login** without pasting anything. That depends on the **SpotiFLAC app**, not on SpoitiLists.

**Privacy:** After a successful login, clear the **Authorization code** field if you pasted a code there (it is only needed once).

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

## Docs and credits

- [SpotiFLAC Extension Development Guide](https://spotiflac.zarz.moe/docs)
- [SpotiFLAC Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)

License: **MIT** — see `LICENSE`.
