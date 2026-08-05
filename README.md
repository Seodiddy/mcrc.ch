# mcrc.ch — MCRC AG

Offizielle Website der Medical Cryo Race Club (MCRC) AG, Zürich.

Minimalistischer One-Pager im Swiss International Typographic Style. Statisch, ohne Build-Schritt, ohne Cookies, ohne Tracking — alle Fonts sind lokal eingebettet, es werden keine Drittserver angefragt.

## Struktur

```
index.html            Die gesamte Seite (HTML, CSS und JS inline)
assets/fonts/         Lokal eingebettete Schriften (woff2: Archivo, IBM Plex Mono)
CNAME                 Custom Domain für GitHub Pages (mcrc.ch)
.nojekyll             Deaktiviert Jekyll-Processing auf GitHub Pages
```

## Lokal ansehen

`index.html` direkt im Browser öffnen — es ist kein Server nötig.

## Deployment (GitHub Pages)

1. Inhalt dieses Ordners in das Repository `Seodiddy/mcrc.ch` pushen (Branch `main`).
2. In den Repo-Einstellungen unter **Pages**: Source „Deploy from a branch", Branch `main`, Ordner `/ (root)`.
3. DNS für `mcrc.ch` beim Registrar auf GitHub Pages zeigen lassen:
   - `A`-Records auf `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - optional `www` als `CNAME` auf `seodiddy.github.io`
4. In den Pages-Einstellungen „Enforce HTTPS" aktivieren, sobald das Zertifikat ausgestellt ist.

## Inhalte pflegen

Alle Texte stehen direkt in `index.html` (durchsuchbar nach Abschnitts-Kommentaren). Portfolio-Einträge sind je eine `<a>`-Zeile in der Portfolio-Liste.
