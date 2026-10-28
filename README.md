# mcrc.ch — MCRC AG

Offizielle Website der Medical Cryo Race Club (MCRC) AG, Zürich: Home, Katalog («The Well Index») und sechs Produktseiten (Coolzoone, Performance Concierge, EnergyLounger, Smart Touch, Hydration-H₂, Human Regenerator).

Statische Site vom Kunden geliefert (Stand Oktober 2026): HTML + CSS + wenig JavaScript, kein Build-Schritt, kein Backend, keine Formulare. Keine Cookies, kein Tracking, keine Drittserver — Fonts und die Physik-Library (matter-js) sind selbst gehostet. Die Concierge-Demo auf der Performance-Concierge-Seite läuft im Demo-Modus (`demo: true`, vorgefertigte Antworten, keine Netzwerk-Calls).

## Struktur

```
index.html, catalogue.html, <produkt>.html   Die 8 Seiten
404.html                                     Fehlerseite (echter 404-Status)
shared.css                                   Styles aller Seiten ausser index (dort inline)
robots.txt, sitemap.xml
assets/img|fonts|js|pdf|concierge-lens/      Bilder, Fonts, Scripts, PDFs, Demo
vercel.json                                  Clean URLs, Redirects, Header (siehe unten)
```

## Hosting (Vercel)

Projekt `mcrc-ch`, verbunden mit diesem Repository: Jeder Push auf `main` deployt automatisch nach Production (mcrc.ch). `vercel.json` setzt um, was die Übergabe-Notiz des Kunden verlangt:

- **Clean URLs**: `/catalogue` wird aus `catalogue.html` serviert; `/slug.html` → `/slug` und `/index.html` → `/` werden permanent umgeleitet (308). Interne Links wurden beim Deployment auf die Clean URLs umgeschrieben.
- **Redirects**: http → https (Vercel automatisch) und `www.mcrc.ch` → `mcrc.ch` (Host-Redirect in vercel.json, 308).
- **Header**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, Content-Security-Policy (`default-src 'self'`, Inline-Styles/-Scripts erlaubt); HSTS setzt Vercel automatisch.
- **Caching**: `/assets/*` ein Jahr immutable (bei Asset-Änderungen neuen Dateinamen bzw. `?v=`-Versionstag verwenden!); HTML, `shared.css`, `robots.txt`, `sitemap.xml` bleiben auf Vercel-Standard (revalidierend). Query-Strings (`?v=…`) bleiben erhalten.
- **404**: `404.html` wird von Vercel für unbekannte Pfade mit echtem 404-Status ausgeliefert.

## Inhalte pflegen

Inhaltliche Fragen: Iulia (Kundin). Die Original-Lieferung des Kunden ist Commit `2dd9909` («Original-Lieferung»); alles Weitere (vercel.json, 404, Clean-URL-Links) liegt in den Folge-Commits. Beim Einspielen neuer Lieferungen: internen Links ggf. wieder auf Clean URLs umschreiben (`href="slug.html"` → `href="/slug"`).
