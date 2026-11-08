# Nachweise und Umfang

Stand: 8. November 2026 (UTC). Untersucht wurden die öffentliche Website und ein vom Auftraggeber ausdrücklich freigegebener Testzugang. In diesem Projekt liegen keine Anmeldedaten, Sitzungswerte, Rohantworten des Kontos oder personenbezogenen Daten.

## Öffentliche Artefakte

| Kürzel | Quelle | Nachweis |
| --- | --- | --- |
| S1 | [`https://anton.app/`](https://anton.app/) | HTTP 200, `text/html`, Header `x-powered-by: Express`. Inline-Skript `client`: SHA-256 `e91c1f3352f4d67c00e66091422de753280b7bfe6fda23c7a42d6d1913b1c603`. Im Skript enthaltenes `package.json` nennt Browserify, LiveScript und Express. |
| S2 | [`app01-engine-start`, Version `latest`](https://content.anton.app/files/?fileId=project/app01-engine-start!master!latest!0) | HTTP 200, `text/plain`; 105.392 Byte, SHA-256 `bee91c4e871c4644175f06f8e2318362f63fa230f0dea8514a463689d9c00edb`. |
| S3 | [`app01`, Version `5002`](https://content.anton.app/files/?fileId=project/app01!master!5002!0) | Öffentliches Projektarchiv, 2.906.112 Byte, SHA-256 `4614ee685b55a10f21d3963008d04fd734b63a2b71d93179bd855773bc43c30a`. Die unten genannten Modulpfade sind Einträge dieses Archivs. |
| S4 | [`logger01`, Version `138`](https://content.anton.app/files/?fileId=project/logger01!master!138!0) | Öffentliches Projektarchiv, 108.729 Byte, SHA-256 `25d27c6803f71a5b1e85c3e71f2380fe0fada0eb642a29a1add3741e389514dd`. |

Die Projektarchive wurden anhand der im Browser geladenen Projektversionen ausgewählt. Ein Abgleich der Login- und Logger-Module im Browser mit den entsprechenden Archiven ergab identische Texte.

## Beobachtete Kommunikation

| Kürzel | Beobachtung | Nachweisart |
| --- | --- | --- |
| N1 | `GET https://anton.app/en_us/` → 200 `text/html`; der Browser rief `GET` auf `/files/?fileId=…`, `GET /ping?cached=…` und `GET /apisLogger/subscribe/` ab. | Unangemeldeter Browserlauf; nur Host, Pfad, Methode, Query-Schlüsselnamen, Status und Medientyp ausgewertet. |
| N2 | `GET https://content.anton.app/ping` → 200 `application/json`, Objekt mit `status`. | Erneuter öffentlicher HTTP-Aufruf. |
| N3 | `GET` und `HEAD` auf `https://content.anton.app/files/?fileId=project/app01-engine-start!master!latest!0` → 200 `text/plain`. | Öffentlicher GET und erneuter HEAD-Aufruf. Weitere im Browser beobachtete `fileId`-Varianten lieferten JSON oder Bilder. |
| N4 | Beim freigegebenen Login: `POST https://a-apis-db.anton.app/?p=login/step1/step1` → 200 `application/json`. Die Antwort hatte die Felder `status`, `loginCode`, `logId`, `authToken`, `displayName`, `avatar`. | Browser-Netzwerkbeobachtung und Resource-Timing; Werte wurden verworfen. Der Zugriff führte zu einer angemeldeten Ansicht. |
| N5 | `GET https://apis-db-logger-s-lb-2.anton.app/apisLogger/subscribe/` → 200 JSON. Beobachtete Query-Schlüssel: `path`, `params[logId]`, `params[filter][name]`, `params[inserted]`, `params[readOnly]`; in der angemeldeten Sitzung zusätzlich `deviceLogId` und `params[authToken]`. | Browser-Netzwerkbeobachtung; alle Query-Werte verworfen. |
| N6 | `GET /files/?fileId=maintenance` → JSON-Felder `maintenanceMessages`, `etag`; `fileId=projectVersions` → `projects` (Zuordnung von Projektnamen zu Zeichenfolgen); `fileId=list/plans` → `created`, `version`, `plans`, `etag`. | Unangemeldete Browserantworten, ausschließlich Feldnamen und JSON-Typen ausgewertet. |

## REA

REA 6.8.0 wurde über `npx -y rea-agents@6.8.0` verwendet:

Die Befehlsprüfung (`--help` und installierte REA-Anleitung) ergab für Web-Ziele insbesondere `list-browser-targets`, `inspect-web-page`, `analyze-web-bundle`, `capture-browser-scenario`, `inspect-web-network-capture`, `export-web-scripts` und `analyze-javascript-application`. Die statische JavaScript-Analyse und die passive Browserinspektion waren nutzbar; die direkte REA-MCP-Toolliste war in dieser laufenden Agentensitzung nicht geladen. Deshalb wurde die installierte CLI verwendet.

- `list-browser-targets` und `inspect-web-page` beobachteten die öffentliche Seite. REA-Evidence `ev_b506dba4dc260fb97bf7a82e23e14d406e62893f9d474356a817269817ff6bb1`.
- `inspect-web-page --include-storage-keys` beobachtete nach Anmeldung ausschließlich Speicherschlüsselnamen. REA-Evidence `ev_834722e1ae505a0a00f8f95eabeded1c6a3b38e69ccf46a0499ace75b0f56b19`.
- `analyze-javascript-application` verarbeitete das aus S1 extrahierte Inline-Skript vollständig (ein Skript, 45.313 AST-Knoten). REA-Evidence `ev_8e0a70c1958acc4fe51ca963cd489274187aaec73a080caa697b0682ee7257c5`.
- Dieselbe REA-Funktion verarbeitete 81 gezielt ausgewählte öffentliche Login-, API- und Logger-Module aus S3/S4 vollständig (81 Dateien, 16.233 AST-Knoten). REA-Evidence `ev_1b5038c83ba83c09c2b08072bcf55c4ef6cec8a90159b2959c35cc5d24564d20`.
- `analyze-web-bundle` erfasste und analysierte das große Inline-Skript nach Erhöhung der pro Skript geltenden Frist auf 120 Sekunden (45.313 AST-Knoten). REA-Evidence `ev_c4e1a7de3413a0dd00fb7dd9662b2e0836c7004c6636f8111cdceaccce252672`. Die Web-Analyse meldete wegen konservativ aufgeweiteter Referenzen weiterhin `partial`; ihr einziger Routen-Kandidat war ein lokaler `path-browserify`-Dateipfad und kein HTTP-Endpunkt.

REA-Syntaxbefunde sind keine Ausführungsnachweise. Die Anwendung lädt weitere Projektmodule dynamisch; die Untersuchung ist keine vollständige Inventur aller Routen. Ein REA-Browser-Szenario schlug mit `execution_failure` fehl. Für konkrete HTTP-Methoden, Status und JSON-Formen wurden deshalb Browser-Netzwerkbeobachtungen und die öffentlichen Artefakte kombiniert.
