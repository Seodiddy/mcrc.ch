# mcrc.ch — MCRC AG

Offizielle Website der Medical Cryo Race Club (MCRC) AG, Zürich.

Minimalistischer One-Pager im Swiss International Typographic Style. Statisch, ohne Build-Schritt, ohne Cookies, ohne Tracking — alle Fonts sind lokal eingebettet, es werden keine Drittserver angefragt.

## Struktur

```
index.html            Die gesamte Seite (HTML, CSS und JS inline)
assets/fonts/         Lokal eingebettete Schriften (woff2: Archivo, IBM Plex Mono)
```

## Lokal ansehen

`index.html` direkt im Browser öffnen — es ist kein Server nötig.

## Deployment (Vercel)

Das Projekt ist als statische Site (Framework-Preset «Other», kein Build-Befehl) mit diesem GitHub-Repository verbunden: Jeder Push auf `main` löst automatisch ein Production-Deployment aus.

DNS für `mcrc.ch` beim Registrar:

- `A`-Record `@` auf `76.76.21.21` (Vercel)
- `CNAME` `www` auf `cname.vercel-dns.com`

Alternativ die Vercel-Nameserver verwenden. Die zum Zeitpunkt der Einrichtung gültigen Werte zeigt `vercel domains inspect mcrc.ch` bzw. das Vercel-Dashboard unter Project → Settings → Domains.

## Inhalte pflegen

Alle Texte stehen direkt in `index.html` (durchsuchbar nach Abschnitts-Kommentaren). Portfolio-Einträge sind je eine `<a>`-Zeile in der Portfolio-Liste.
