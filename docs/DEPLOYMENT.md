# Self-Hosting auf Debian 13

## Installation

1. Docker Engine und das Docker-Compose-Plugin nach der Debian/Docker-Anleitung installieren.
2. Repository auf den Server kopieren und `.env.example` nach `.env` kopieren. `DB_PASSWORD`, `SESSION_SECRET` (mindestens 32 zufällige Zeichen), `ADMIN_EMAIL` und `ADMIN_PASSWORD` setzen; `.env` mit `chmod 600 .env` schützen. Den ANTON-Testcode hier niemals verwenden.
3. `docker compose up --build -d` starten. Die App wartet auf den PostgreSQL-Healthcheck, wendet Migrationen an und legt Beispielinhalte sowie den ersten Admin an.
4. `docker compose ps` und `curl -fsS http://127.0.0.1:3000/api/health` prüfen. Danach im Browser registrieren und mit dem Admin-Konto die Verwaltung öffnen.

Die Compose-Datei bindet App und Datenbank nur an `127.0.0.1`. Für öffentlichen Betrieb einen Reverse-Proxy wie Caddy oder Nginx mit HTTPS vor `127.0.0.1:3000` setzen. Proxy muss `Host` und `X-Forwarded-Proto` korrekt durchreichen, damit die Origin-Prüfung Schreibzugriffe akzeptiert. Nur HTTPS mit `NODE_ENV=production` verwenden, da Session-Cookies dann `Secure` sind. Für Änderungen am Code: `docker compose up --build -d app`. Migrationen liegen versioniert unter `prisma/migrations`.

## Backup

Das benannte Volume `postgres_data` enthält die dauerhaft gespeicherten Daten. Ein logisches Backup kann ohne DB-Portfreigabe erstellt werden:

```bash
docker compose exec -T db pg_dump -U lernwerk -d lernwerk -Fc > lernwerk-$(date +%F).dump
```

Die Dump-Datei sicher und getrennt vom Server aufbewahren. `.env` separat geschützt sichern. Backups regelmäßig mit einer Test-Wiederherstellung prüfen.

## Wiederherstellung

Für eine neue/leere Installation erst `.env` setzen und `docker compose up -d db` starten. Anschließend:

```bash
cat lernwerk-YYYY-MM-DD.dump | docker compose exec -T db pg_restore -U lernwerk -d lernwerk --clean --if-exists --no-owner
docker compose up -d app
```

Vor Wiederherstellung einer produktiven Datenbank die App stoppen und ein aktuelles Backup erstellen. Nach dem Restore `docker compose exec app npx prisma migrate deploy` ausführen und Healthcheck sowie Anmeldung prüfen. Bei einem Restore in eine bereits belegte Datenbank können abhängige Objekte Warnungen erzeugen; für einen sauberen Restore eine leere Datenbank bevorzugen.

## Betrieb und Grenzen

`docker compose logs --tail=100 app` zeigt Start- und Serverfehler; die Anwendung protokolliert keine Sitzungswerte. Aktualisierungen sollten nach einem Backup erfolgen. Die aktuelle API hat keine Pagination oder Request-Drosselung; vor breitem öffentlichem Betrieb Reverse-Proxy-Limits, Monitoring und Datenschutzaufbewahrung ergänzen.

Der Docker-Build konnte in der Codex-Cloud-Umgebung wegen `no space left on device` während `npm ci` im Container nicht vollständig getestet werden. Der lokale Produktionsbuild, PostgreSQL-Migration, Seed, API-Healthcheck und Browserabläufe wurden ausgeführt. `docker compose config` prüft die Compose-Struktur, ersetzt aber keinen vollständigen Image-Build auf dem Zielserver. Für den Image-Build ausreichend freien Speicher einplanen (mehrere Gigabyte).
