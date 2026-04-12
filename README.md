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

**Why buttons used to “do nothing”:** SpotiFLAC wrapped extension actions as `{ result: { message: … } }`, while the UI read `message` only at the **top** level — so toasts never appeared. **SpoitiLists 1.0.3** expects a SpotiFLAC build that **flattens** that JSON (see **Part C**), and (for the copyable field) merges **`setting_updates`** into extension settings.

1. Open **SpotiFLAC** → **Settings** → **Extensions** → **SpoitiLists** (install **1.0.3+**).
2. Paste your **Spotify Client ID** into **Spotify Client ID**.
3. Leave **Redirect URI** as `spotiflac://callback` unless you changed it in Spotify’s dashboard (both places must **match exactly**).
4. Tap **1. Connect to Spotify**. The **Spotify login link** field fills with a long URL — **select and copy** it (or use the snackbar hint), open it in **Chrome / Safari**, log in, and tap **Agree**.
5. After approval, Spotify redirects (often `spotiflac://callback?code=…`). If the browser cannot open the app, **copy the `code`** (or the whole callback URL), paste it into **Authorization code**, **save** that field, then tap **2. Finish login**.
6. If the link field is empty, tap **Show last login link again** (avoid tapping **Connect** again unless you want a **new** PKCE attempt).

**Optional — automatic handoff:** If your SpotiFLAC build handles **`spotiflac://callback`**, you may not need to paste a code. That is implemented in the **app**, not only in SpoitiLists.

**Privacy:** Clear **Authorization code** after login if you pasted a code there.

---

## Part C — SpotiFLAC build expected for 1.0.3

For **Connect** to show feedback and fill **Spotify login link**, use a SpotiFLAC Mobile build that includes:

- **Go:** `InvokeAction` flattens the extension’s return object to the top level of the JSON (so `message` / `setting_updates` are visible to Flutter).
- **Flutter:** extension settings screen merges **`setting_updates`** from action results into saved settings, and shows **`oauth_login_url`** as selectable text.

The copy in this repo’s **`SpotiFLAC-Mobile-main`** folder includes those changes; if you use an older store APK, upgrade when the upstream project ships the same fixes, or build from source.

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
