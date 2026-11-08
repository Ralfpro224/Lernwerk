# Bestätigte HTTP-Endpunkte

Alle Einträge unten haben einen beobachteten HTTP-Aufruf oder einen erfolgreichen öffentlichen Test. Zeichenfolgen wie `/../server-apis-db2/apis/...` in den Projektmodulen sind **logische RPC-Pfade**; sie sind keine eigenständigen HTTP-Pfade. Die tatsächliche Login-Anfrage verwendet `/` mit dem Query-Parameter `p` [N4, S3]. Nachweise: [EVIDENCE.md](EVIDENCE.md).

| Dienst | Methode und Pfad | Eingabe | Beobachtete Antwort | Nachweis |
| --- | --- | --- | --- | --- |
| `https://anton.app` | `GET /` bzw. `GET /en_us/` | keine | 200 HTML | S1, N1 |
| `https://content.anton.app` | `GET /ping` | Beim App-Start optional `cached` | 200 JSON mit `status` | N1, N2 |
| `https://content.anton.app` | `GET /files/` | `fileId`; optional `etag` im Browser beobachtet | 200, abhängig von `fileId` JSON, Text oder Bild | N1, N3, N6 |
| `https://content.anton.app` | `HEAD /files/` | `fileId` | 200 mit Metadaten-Headern für das getestete Projektarchiv | N1, N3 |
| `https://a-apis-db.anton.app` | `POST /?p=login/step1/step1` | JSON-RPC-Umschlag mit logischem `path` und `params.value` | 200 JSON; Login-Ergebnis mit optionalem `authToken` | N4, S3: `pages/start/login/01_step1/submit/submit.ls`, `lib/util/pllsCall/{send/send,calcUrl/calc}.ls` |
| `https://apis-db-logger-s-lb-2.anton.app` | `GET /apisLogger/subscribe/` | Query-Parameter `path`, `params[logId]`, `params[filter][name]`, `params[inserted]`, `params[readOnly]`; bei Kontoabonnement zusätzlich `params[authToken]` | 200 JSON mit Ereignisliste und Synchronisationsfeldern | N5, S4: `lib/getEvents/{getEvents,calcUrl/calc}.ls` |

`content-2.anton.app` wurde als zweiter Content-Host bei `/files/` und `/ping` beobachtet [N1]. S4 nennt zusätzlich `apis-db-logger-s-lb-1.anton.app` als alternative Logger-Adresse; beobachtet wurde nur `-2` [N5]. S3 wählt den Daten-API-Host aus mehreren Präfixen; nur `a-apis-db.anton.app` ist hier als Login-Host bestätigt [N4].

## Nicht als HTTP-Endpunkte aufgenommen

In S3 stehen weitere logische Namen für Konten, Schulen und Inhalte. Ohne einen beobachteten Aufruf bleiben sie Code-Kandidaten. Daher fehlen sie bewusst in [openapi.yaml](../openapi.yaml) und im Client.
