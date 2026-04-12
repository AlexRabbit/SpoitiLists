/**
 * SpoitiLists — SpotiFLAC extension (Spotify Web API + PKCE).
 * https://github.com/Lucky/SpoitiLists · https://spotiflac.zarz.moe/docs
 */

var EXT_ID = "spoiti-lists";
var settings = {};

var SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "user-read-email"
].join(" ");

var AUTH_URL = "https://accounts.spotify.com/authorize";
var TOKEN_URL = "https://accounts.spotify.com/api/token";
var API_BASE = "https://api.spotify.com/v1";

function initialize(config) {
  settings = config || {};
  tryExchangePendingCode();
  return true;
}

function cleanup() {}

function getClientId() {
  return (settings.client_id && String(settings.client_id).trim()) || "";
}

function getRedirectUri() {
  var u = settings.redirect_uri;
  if (u && String(u).trim()) return String(u).trim();
  return "spotiflac://callback";
}

function tryExchangePendingCode() {
  var clientId = getClientId();
  if (!clientId) return;
  var code = auth.getAuthCode();
  if (!code) return;
  var tokens = auth.getTokens();
  if (tokens && tokens.access_token && !tokens.is_expired) {
    auth.setAuthCode("");
    return;
  }
  var ex = auth.exchangeCodeWithPKCE({
    tokenUrl: TOKEN_URL,
    clientId: clientId,
    redirectUri: getRedirectUri(),
    code: code
  });
  if (ex && ex.success) {
    auth.setAuthCode("");
  }
}

function ensureAccessToken() {
  var clientId = getClientId();
  if (!clientId) return false;

  tryExchangePendingCode();

  var t = auth.getTokens();
  if (t && t.access_token && !t.is_expired) return true;

  var rt = t && t.refresh_token ? t.refresh_token : "";
  if (!rt) return false;

  var body =
    "grant_type=refresh_token" +
    "&refresh_token=" +
    encodeURIComponent(rt) +
    "&client_id=" +
    encodeURIComponent(clientId);

  var resp = http.post(TOKEN_URL, body, {
    "Content-Type": "application/x-www-form-urlencoded"
  });
  if (!resp || !resp.ok) {
    auth.clearAuth();
    return false;
  }
  var data = JSON.parse(resp.body);
  if (!data.access_token) {
    auth.clearAuth();
    return false;
  }
  auth.setAuthCode({
    access_token: data.access_token,
    refresh_token: data.refresh_token || rt,
    expires_in: data.expires_in || 3600
  });
  return true;
}

function spotifyGet(path) {
  if (!ensureAccessToken()) return { ok: false, status: 401, body: "{}" };
  var t = auth.getTokens();
  var url = path.indexOf("http") === 0 ? path : API_BASE + path;
  var r = http.get(url, { Authorization: "Bearer " + t.access_token });
  if (r.status === 401) {
    if (ensureAccessToken()) {
      t = auth.getTokens();
      r = http.get(url, { Authorization: "Bearer " + t.access_token });
    }
  }
  return r;
}

function pickImage(images) {
  if (!images || !images.length) return "";
  return images[0].url || "";
}

function mapTrack(t) {
  if (!t || !t.id) return null;
  var artists = (t.artists || [])
    .map(function (a) {
      return a.name;
    })
    .join(", ");
  var album = t.album || {};
  return {
    id: t.id,
    name: t.name,
    artists: artists,
    album_name: album.name || "",
    album_artist: artists,
    duration_ms: t.duration_ms || 0,
    cover_url: pickImage(album.images),
    track_number: t.track_number || 0,
    disc_number: t.disc_number || 0,
    release_date: album.release_date || "",
    isrc: (t.external_ids && t.external_ids.isrc) || "",
    spotify_id: t.id,
    provider_id: EXT_ID
  };
}

function searchTracks(query, limit) {
  if (!ensureAccessToken()) return [];
  var lim = limit || 20;
  var path =
    "/search?q=" +
    encodeURIComponent(query) +
    "&type=track&limit=" +
    encodeURIComponent(String(Math.min(lim, 50)));
  var r = spotifyGet(path);
  if (!r.ok) return [];
  var data = JSON.parse(r.body);
  var items = (data.tracks && data.tracks.items) || [];
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var m = mapTrack(items[i]);
    if (m) out.push(m);
  }
  return out;
}

function customSearch(query) {
  if (!ensureAccessToken()) return [];
  var path =
    "/search?q=" +
    encodeURIComponent(query) +
    "&type=track,album,playlist,artist&limit=20";
  var r = spotifyGet(path);
  if (!r.ok) return [];
  var data = JSON.parse(r.body);
  var out = [];

  var tracks = (data.tracks && data.tracks.items) || [];
  for (var ti = 0; ti < tracks.length; ti++) {
    var tr = mapTrack(tracks[ti]);
    if (tr) out.push(tr);
  }

  var albums = (data.albums && data.albums.items) || [];
  for (var ai = 0; ai < albums.length; ai++) {
    var al = albums[ai];
    var alArt = (al.artists || [])
      .map(function (a) {
        return a.name;
      })
      .join(", ");
    out.push({
      id: al.id,
      name: al.name,
      artists: alArt,
      album_name: al.name,
      album_type: al.album_type || "album",
      release_date: al.release_date || "",
      cover_url: pickImage(albums[ai].images),
      item_type: "album",
      provider_id: EXT_ID
    });
  }

  var playlists = (data.playlists && data.playlists.items) || [];
  for (var pi = 0; pi < playlists.length; pi++) {
    var pl = playlists[pi];
    var owner = (pl.owner && pl.owner.display_name) || "Playlist";
    out.push({
      id: pl.id,
      name: pl.name,
      artists: owner,
      album_name: pl.name,
      album_type: "playlist",
      description: pl.description || "",
      cover_url: pickImage(pl.images),
      item_type: "playlist",
      provider_id: EXT_ID
    });
  }

  var artists = (data.artists && data.artists.items) || [];
  for (var ri = 0; ri < artists.length; ri++) {
    var ar = artists[ri];
    out.push({
      id: ar.id,
      name: ar.name,
      artists: ar.name,
      cover_url: pickImage(ar.images),
      item_type: "artist",
      provider_id: EXT_ID
    });
  }

  return out;
}

function fetchAllPaginated(initialPath) {
  var all = [];
  var next = initialPath;
  while (next) {
    var r = spotifyGet(next);
    if (!r.ok) break;
    var data = JSON.parse(r.body);
    var items = data.items || [];
    for (var i = 0; i < items.length; i++) all.push(items[i]);
    next = data.next || null;
  }
  return all;
}

function getAlbum(albumId) {
  var r = spotifyGet("/albums/" + encodeURIComponent(albumId));
  if (!r.ok) throw new Error("album fetch failed");
  var al = JSON.parse(r.body);
  var alArt = (al.artists || [])
    .map(function (a) {
      return a.name;
    })
    .join(", ");
  var tracks = fetchAllPaginated(
    "/albums/" + encodeURIComponent(albumId) + "/tracks?limit=50"
  );
  var mapped = [];
  for (var i = 0; i < tracks.length; i++) {
    var tr = tracks[i];
    var full = mapTrack(tr);
    if (!full) continue;
    if (!full.cover_url) full.cover_url = pickImage(al.images);
    mapped.push(full);
  }
  return {
    id: albumId,
    name: al.name,
    artists: alArt,
    cover_url: pickImage(al.images),
    release_date: al.release_date || "",
    total_tracks: al.total_tracks || mapped.length,
    album_type: al.album_type || "album",
    tracks: mapped,
    provider_id: EXT_ID
  };
}

function getPlaylist(playlistId) {
  var r = spotifyGet("/playlists/" + encodeURIComponent(playlistId));
  if (!r.ok) throw new Error("playlist fetch failed");
  var pl = JSON.parse(r.body);
  var owner = (pl.owner && pl.owner.display_name) || "";
  var rawItems = fetchAllPaginated(
    "/playlists/" + encodeURIComponent(playlistId) + "/tracks?limit=50"
  );
  var mapped = [];
  for (var i = 0; i < rawItems.length; i++) {
    var row = rawItems[i];
    var tr = row.track;
    var m = mapTrack(tr);
    if (m) mapped.push(m);
  }
  return {
    id: playlistId,
    name: pl.name,
    owner: owner,
    cover_url: pickImage(pl.images),
    total_tracks: mapped.length,
    tracks: mapped,
    provider_id: EXT_ID
  };
}

function getArtist(artistId) {
  var r = spotifyGet("/artists/" + encodeURIComponent(artistId));
  if (!r.ok) throw new Error("artist fetch failed");
  var ar = JSON.parse(r.body);
  var r2 = spotifyGet(
    "/artists/" + encodeURIComponent(artistId) + "/albums?include_groups=album,single&limit=50"
  );
  var albums = [];
  if (r2.ok) {
    var ad = JSON.parse(r2.body);
    var items = ad.items || [];
    for (var i = 0; i < items.length; i++) {
      var al = items[i];
      var alArt = (al.artists || [])
        .map(function (a) {
          return a.name;
        })
        .join(", ");
      albums.push({
        id: al.id,
        name: al.name,
        artists: alArt,
        cover_url: pickImage(al.images),
        release_date: al.release_date || "",
        total_tracks: al.total_tracks || 0,
        album_type: al.album_type || "album",
        provider_id: EXT_ID
      });
    }
  }
  return {
    id: artistId,
    name: ar.name,
    image_url: pickImage(ar.images),
    albums: albums,
    provider_id: EXT_ID
  };
}

function getTimeGreeting() {
  try {
    var lt = gobackend.getLocalTime();
    var h = typeof lt.hour === "number" ? lt.hour : 12;
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    if (h >= 17 && h < 21) return "Good evening";
    return "Good night";
  } catch (e) {
    return "Hello";
  }
}

function getHomeFeed() {
  if (!getClientId()) {
    return {
      success: false,
      error: "Set your Spotify Client ID in extension settings."
    };
  }
  if (!ensureAccessToken()) {
    return {
      success: false,
      error: "Not signed in. Use Connect, then Finish login."
    };
  }

  var sections = [];

  var playlists = fetchAllPaginated("/me/playlists?limit=50");
  var plItems = [];
  for (var i = 0; i < playlists.length; i++) {
    var p = playlists[i];
    plItems.push({
      id: p.id,
      uri: p.uri,
      type: "playlist",
      name: p.name,
      description: (p.description || "").replace(/<[^>]+>/g, ""),
      cover_url: pickImage(p.images),
      artists: (p.owner && p.owner.display_name) || "",
      provider_id: EXT_ID
    });
  }
  sections.push({
    uri: "me:playlists",
    title: "Your playlists",
    items: plItems
  });

  var saved = fetchAllPaginated("/me/tracks?limit=50");
  var trItems = [];
  for (var j = 0; j < Math.min(saved.length, 50); j++) {
    var st = saved[j].track;
    var mt = mapTrack(st);
    if (!mt) continue;
    trItems.push({
      id: mt.id,
      uri: st.uri,
      type: "track",
      name: mt.name,
      artists: mt.artists,
      cover_url: mt.cover_url,
      album_id: st.album && st.album.id,
      album_name: st.album && st.album.name,
      provider_id: EXT_ID
    });
  }
  sections.push({
    uri: "me:tracks",
    title: "Saved tracks",
    items: trItems
  });

  return {
    success: true,
    greeting: getTimeGreeting(),
    sections: sections
  };
}

function parseSpotifyOpenUrl(url) {
  try {
    var path = String(url).split("?")[0];
    var m = path.match(
      /open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/
    );
    if (!m) return null;
    return { type: m[1], id: m[2] };
  } catch (e) {
    return null;
  }
}

function handleUrl(url) {
  if (!ensureAccessToken()) {
    return { type: "error", name: "Sign in required", cover_url: "" };
  }
  var p = parseSpotifyOpenUrl(url);
  if (!p) return { type: "error", name: "Unsupported Spotify URL", cover_url: "" };

  if (p.type === "track") {
    var r = spotifyGet("/tracks/" + encodeURIComponent(p.id));
    if (!r.ok) return { type: "error", name: "Track not found", cover_url: "" };
    var t = mapTrack(JSON.parse(r.body));
    return { type: "track", track: t };
  }
  if (p.type === "album") {
    var al = getAlbum(p.id);
    return {
      type: "album",
      name: al.name,
      cover_url: al.cover_url,
      tracks: al.tracks,
      album: { id: al.id, name: al.name }
    };
  }
  if (p.type === "playlist") {
    var pl = getPlaylist(p.id);
    return {
      type: "playlist",
      name: pl.name,
      cover_url: pl.cover_url,
      tracks: pl.tracks
    };
  }
  if (p.type === "artist") {
    return { type: "artist", artist: getArtist(p.id) };
  }
  return { type: "error", name: "Unsupported", cover_url: "" };
}

function connectSpotify() {
  var clientId = getClientId();
  if (!clientId) {
    return { success: false, error: "Set Spotify Client ID first." };
  }
  var redir = getRedirectUri();
  var pk = auth.startOAuthWithPKCE({
    authUrl: AUTH_URL,
    clientId: clientId,
    redirectUri: redir,
    scope: SCOPES
  });
  if (!pk.success) {
    return { success: false, error: pk.error || "PKCE failed" };
  }
  var open = auth.openAuthUrl(pk.authUrl, redir);
  if (!open.success) {
    return { success: false, error: open.error || "Could not open browser" };
  }
  return {
    success: true,
    message: "Browser opened. After you approve, return here and tap Finish login."
  };
}

function completeSpotifyLogin() {
  var clientId = getClientId();
  if (!clientId) {
    return { success: false, error: "Set Spotify Client ID first." };
  }
  var code = auth.getAuthCode();
  if (!code) {
    return {
      success: false,
      error: "No authorization code yet. Connect again or return to the app from the browser."
    };
  }
  var ex = auth.exchangeCodeWithPKCE({
    tokenUrl: TOKEN_URL,
    clientId: clientId,
    redirectUri: getRedirectUri(),
    code: code
  });
  if (!ex.success) {
    return {
      success: false,
      error: (ex.error_description || ex.error || "Token exchange failed").toString()
    };
  }
  auth.setAuthCode("");
  return { success: true, message: "Spotify connected." };
}

function disconnectSpotify() {
  auth.clearAuth();
  return { success: true, message: "Disconnected." };
}

registerExtension({
  initialize: initialize,
  cleanup: cleanup,
  searchTracks: searchTracks,
  customSearch: customSearch,
  getAlbum: getAlbum,
  getPlaylist: getPlaylist,
  getArtist: getArtist,
  getHomeFeed: getHomeFeed,
  handleUrl: handleUrl,
  connectSpotify: connectSpotify,
  completeSpotifyLogin: completeSpotifyLogin,
  disconnectSpotify: disconnectSpotify
});
