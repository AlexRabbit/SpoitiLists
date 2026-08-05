

Si esto te fue útil, considera darle una estrella al repositorio ⭐
⭐Esto aún está en desarrollo, SpotiFLAC todavía tiene un problema con OAuth.⭐
# SpoitiLists — una extensión para SpotiFLAC

**SpoitiLists** es una extensión gratuita para **[SpotiFLAC Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)**. Muestra **tus listas de reproducción reales de Spotify** y **tus canciones guardadas (que te gustan)** dentro del feed de **Home** de SpotiFLAC. Cuando **abres una playlist** en la aplicación, carga la **lista de canciones actual** desde Spotify, por lo que las nuevas canciones que agregues en Spotify aparecerán la próxima vez que abras esa lista (SpotiFLAC puede almacenar en caché la pantalla de Home durante unos minutos).

Este proyecto **no** está desarrollado por Spotify ni por el equipo de SpotiFLAC. Utiliza la **Web API** oficial de Spotify y **OAuth** (inicias sesión con tu cuenta de Spotify).

---

## Instalar SpoitiLists en SpotiFLAC (forma más fácil: enlace de la Store)

SpotiFLAC puede cargar extensiones desde un **registro JSON** en GitHub.

1. Abre **SpotiFLAC** → pestaña **Store**.
2. Cuando te pida una **Extension Repository URL**, pega este enlace **raw** de `registry.json`:

   `https://raw.githubusercontent.com/AlexRabbit/SpoitiLists/refs/heads/main/registry.json`


3. Busca **SpoitiLists** en la lista e **instálalo**.
4. Ve a **Settings → Extensions**, toca **SpoitiLists** y sigue la **Parte B** a continuación para conectar Spotify.

---

## Parte A — Configuración del desarrollador de Spotify (solo la primera vez)

Debes crear una pequeña "app" en el sitio de desarrolladores de Spotify. **No** estás publicando una app en la Play Store; esto es solo para obtener un **API Client ID**.

1. En el navegador de una computadora o teléfono, ve a:  
   [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de **Spotify**.
3. Haz clic en **Create app**.
4. Completa los siguientes campos:
   - **App name:** lo que sea, por ejemplo `SpoitiLists`
   - **App description:** por ejemplo `Personal SpotiFLAC extension`
   - **Redirect URI:** haz clic en **Add**, escribe exactamente:  
     `spotiflac://callback`  
     (Si la documentación o configuración de SpotiFLAC indica un URI diferente, usa **esa** cadena exacta en su lugar.)
   - **Which API/SDKs are you planning to use?** selecciona **Web API**.
5. Guarda. Abre la app → **Settings**.
6. Copia el **Client ID** (texto largo). **No** ingreses tu **Client Secret** en SpoitiLists; esta extensión utiliza **PKCE** y no necesita el secreto.

---

## Parte B — Conectar SpoitiLists dentro de SpotiFLAC

**¿Por qué los botones antes "no hacían nada"?** SpotiFLAC envolvía las acciones de la extensión como `{ result: { message: … } }`, mientras que la interfaz leía `message` solo en el nivel **superior**; por eso las notificaciones (toasts) nunca aparecían. **SpoitiLists 1.1.1+** espera una compilación de SpotiFLAC que **aplane** ese JSON (ver **Parte C**), y (para el campo copiable) fusione **`setting_updates`** en la configuración de la extensión.

**Versiones / Instalaciones desde la Store:** SpotiFLAC rechaza una instalación cuando la **versión del paquete coincide** con la ya instalada (`Extension is already at version …`).

**La Store muestra una versión nueva pero Settings muestra una antigua:** La Store lee **`registry.json`**; la versión instalada proviene del **`manifest.json` dentro del archivo `.spotiflac-ext`**. Si actualizas `manifest.json` / `registry.json` pero **olvidas reconstruir y confirmar** `extensions/spoiti-lists.spotiflac-ext` y `extensions/SpotiLists.spotiflac-ext`, GitHub seguirá sirviendo un **zip antiguo**: los usuarios seguirán recibiendo la versión antigua. Después de cada incremento de versión, ejecuta **`scripts/package.sh`** o **`scripts/package.ps1`**, luego **confirma y envía (push) ambos archivos de extensión** junto con los archivos JSON. El CI de este repositorio verifica que coincidan.

**La Store muestra “Failed to install SpoitiLists”:** SpotiFLAC descarga el archivo desde **`download_url`** en `registry.json` (ver `extension_store.go` → `downloadExtension`). Si esa URL devuelve **404** (archivo faltante en GitHub, rama incorrecta o **mayúsculas/minúsculas incorrectas** en la ruta), la instalación falla con un mensaje genérico. **Solución:** confirma y envía (push) **`extensions/spoiti-lists.spotiflac-ext`** (y/o `extensions/SpotiLists.spotiflac-ext`) a la rama **`main`**, luego abre la URL raw en un navegador: debes ver una **descarga**, no “404: Not Found”. El registro usa el nombre de archivo en minúsculas para evitar problemas de mayúsculas/minúsculas. Después de hacer push, haz pull para actualizar en la Store de la app (o borra la caché de la Store en SpotiFLAC si sigue fallando).

1. Abre **SpotiFLAC** → **Settings** → **Extensions** → **SpoitiLists** (instala **1.1.1+**).
2. Pega tu **Spotify Client ID** en el campo **Spotify Client ID**.
3. Deja **Redirect URI** como `spotiflac://callback` a menos que lo hayas cambiado en el panel de Spotify (ambos lugares deben **coincidir exactamente**).
4. Toca **1. Connect to Spotify**. El campo **Spotify login link** se llena con una URL larga: **selecciona y copia** (o usa la sugerencia del snackbar), ábrela en **Chrome / Safari**, inicia sesión y toca **Agree**.
5. Tras la aprobación, Spotify redirige (a menudo `spotiflac://callback?code=…`). Si el navegador no puede abrir la app, **copia el `code`** (o toda la URL de callback), pégalo en **Authorization code**, **guarda** ese campo y luego toca **2. Finish login**.
6. Si el campo de enlace está vacío, toca **Show last login link again** (evita tocar **Connect** nuevamente a menos que quieras un **nuevo** intento de PKCE).

**Opcional — transferencia automática:** Si tu compilación de SpotiFLAC maneja **`spotiflac://callback`**, es posible que no necesites pegar un código. Esto está implementado en la **app**, no solo en SpoitiLists.

**Privacidad:** Borra **Authorization code** después de iniciar sesión si pegaste un código allí.

---

## Parte C — Compilación de SpotiFLAC esperada para 1.1.x

Para que **Connect** muestre retroalimentación y complete **Spotify login link**, utiliza una compilación de SpotiFLAC Mobile que incluya:

- **Go:** `InvokeAction` aplana el objeto de retorno de la extensión al nivel superior del JSON (para que `message` / `setting_updates` sean visibles para Flutter).
- **Flutter:** la pantalla de configuración de extensiones fusiona **`setting_updates`** de los resultados de las acciones en la configuración guardada, y muestra **`oauth_login_url`** como texto seleccionable.

La copia en la carpeta **`SpotiFLAC-Mobile-main`** de este repositorio incluye esos cambios; si usas un APK antiguo de la Store, actualízalo cuando el proyecto principal lance las mismas correcciones, o compila desde el código fuente.

---

## Dónde ver tus playlists en SpotiFLAC

- Abre la pestaña **Home**. Con SpoitiLists habilitado, deberías ver secciones como **Your playlists** y **Saved tracks**.
- Toca una **playlist** para abrirla; la lista de canciones se carga desde Spotify al abrirla.
- Si agregaste canciones en Spotify y aún no las ves: **retrocede** y **abre la playlist nuevamente**. La fila de Home puede actualizarse después de una **pequeña caché** (generalmente unos minutos).

---

## Opcional: instalar el archivo sin usar la Store

1. Descarga **`extensions/spoiti-lists.spotiflac-ext`** de este repositorio (raw o ZIP). **`extensions/SpotiLists.spotiflac-ext`** son los mismos bytes si prefieres ese nombre para instalación lateral (sideloading).
2. SpotiFLAC → **Settings** → **Extensions** → instala **.spotiflac-ext** (tal como se describe en la ayuda de SpotiFLAC).

---

## Para desarrolladores: reconstruir el paquete de la extensión

Desde la raíz del repositorio:

- **Windows:**  
  `powershell -ExecutionPolicy Bypass -File scripts/package.ps1`
- **macOS / Linux:**  
  `chmod +x scripts/package.sh && ./scripts/package.sh`

Esto crea **`SpotiLists.spotiflac-ext`** en la raíz del repositorio y lo copia a **`extensions/spoiti-lists.spotiflac-ext`** (`download_url` de la Store — **confirma y envía (push) este archivo** para que la Store pueda instalarlo) y **`extensions/SpotiLists.spotiflac-ext`** (mismo paquete, nombre amigable).

Después de modificar `manifest.json` o `index.js`, reconstruye, confirma y envía (push) para que la URL de la Store se mantenga actualizada.

---

## Documentación y créditos

- [SpotiFLAC Extension Development Guide](https://spotiflac.zarz.moe/docs)
- [SpotiFLAC Mobile](https://github.com/zarzet/SpotiFLAC-Mobile)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)

Licencia: **MIT** — ver `LICENSE`.
