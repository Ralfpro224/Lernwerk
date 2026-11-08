# Lernwerk

Lernwerk ist eine eigenständig entwickelte, deutschsprachige Lernplattform. Sie läuft mit Next.js, PostgreSQL und Prisma ohne Verbindung zu ANTON-Servern. Der Vergleich mit ANTON diente ausschließlich der Analyse öffentlich zugänglicher Funktionen und eines freigegebenen Testkontos. Design, Quellcode und neun Beispielaufgaben sind eigene Arbeit.

## Schnellstart mit Docker Compose

Voraussetzung: Docker Engine mit Compose-Plugin auf Debian 13 oder einem anderen Linux-System.

```bash
cp .env.example .env
# DB_PASSWORD, SESSION_SECRET und ADMIN_PASSWORD in .env durch starke Zufallswerte ersetzen.
docker compose up --build -d
docker compose ps
```

Die App ist unter `http://localhost:3000` erreichbar. `app` führt beim Start die Prisma-Migration und einen idempotenten Seed aus. Die Beispielinhalte werden nur bei fehlenden IDs erstellt; bestehende Änderungen bleiben erhalten. Der erste Administrator wird mit `ADMIN_EMAIL` und `ADMIN_PASSWORD` angelegt. Die Datenbank und App binden lokal an `127.0.0.1`; für externen Zugriff einen TLS-Reverse-Proxy davor setzen.

## Lokale Entwicklung

```bash
npm ci
cp .env.example .env
# DB_PASSWORD, DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL und ADMIN_PASSWORD setzen.
docker compose up -d db
npm run db:dev
npm run db:seed
npm run dev
```

`DATABASE_URL` muss bei lokaler Entwicklung `localhost:5432` verwenden. In Compose wird die URL automatisch auf `db:5432` gesetzt. Node.js 22 wird empfohlen.

## Prüfen

```bash
npm run lint
npm test
npm run build
npm run start
npm run test:e2e
```

Playwright verwendet das lokale Chromium unter `/usr/bin/chromium`. Bei einer anderen Installation `playwright.config.ts` anpassen. Die Browser-Tests benötigen einen laufenden Server und die Seed-Datenbank. Sie erzeugen temporäre Testkonten; der Admin-Test nutzt nur den lokalen Lernwerk-Administrator aus `.env`.

## Funktionsumfang

- Registrierung, Anmeldung und serverseitige Sessions mit rollenbasierten Berechtigungen
- Fächer, Klassenstufen, Themen, Lektionen und neun Aufgabenformate
- Serverseitige Antwortprüfung, gespeicherter Fortschritt und einmalige Punkte pro Aufgabe
- Klassen mit Beitrittscodes und Lektionen-Zuweisungen für Lehrkräfte
- Verwaltung von Inhalten, Benutzern, Rollen und Einstellungen samt visuellem Aufgabeneditor
- Responsive Oberfläche sowie REST-API und OpenAPI-Spezifikation

## Dokumentation

- [Funktionsumfang](docs/FEATURES.md), [Nutzeranleitung](docs/USER_GUIDE.md), [Admin-Anleitung](docs/ADMIN_GUIDE.md)
- [Architektur](docs/ARCHITECTURE.md), [Datenbank](docs/DATABASE.md), [eigene API](docs/API.md), [OpenAPI](openapi.yaml)
- [Deployment, Backup und Wiederherstellung](docs/DEPLOYMENT.md)
- [REA-Analyse der Referenz](docs/REVERSE_ENGINEERING.md) mit [Belegen](docs/EVIDENCE.md); die früher dokumentierte, beobachtete ANTON-API liegt getrennt unter [ANTON_API.md](docs/ANTON_API.md)

Der bestehende [TypeScript-Client](src/client.ts) dokumentiert ausschließlich die früher bestätigten ANTON-Aufrufe für autorisierte Forschung. Lernwerk nutzt ihn nicht.
