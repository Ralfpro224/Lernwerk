# API-Wiki

Dieses Wiki beschreibt die am 8. November 2026 bestätigten HTTP-Aufrufe der Web-App. Es ist keine offizielle oder vollständige ANTON-API-Dokumentation. Die Belege und ihre Grenzen stehen in [EVIDENCE.md](EVIDENCE.md).

## Orientierung

- [Endpunkte und Methoden](ENDPOINTS.md)
- [Anmeldung und Tokenbehandlung](AUTH.md)
- [Architektur](ARCHITECTURE.md)
- [JSON-Datenmodelle](DATA_MODELS.md)
- [OpenAPI-Spezifikation der beobachteten Referenz](ANTON_OBSERVED_OPENAPI.yaml)
- [TypeScript-Client](../src/client.ts)

## Öffentliche Abfragen

```bash
curl -fsS 'https://content.anton.app/ping'
curl -fsS 'https://content.anton.app/files/?fileId=project/app01-engine-start!master!latest!0' -o engine-start.pdo
```

`/ping` lieferte ein JSON-Objekt mit `status` [N2]. Die zweite URL stammt direkt aus dem öffentlichen Startskript und lieferte ein versioniertes Textarchiv [S1, S2, N3]. Das Archivformat ist anwendungsspezifisch.

## Autorisierter Login mit dem Client

```ts
import { AntonClient } from "../src/client";

const api = new AntonClient();
const result = await api.loginStep1({
  value: process.env.ANTON_LOGIN_VALUE!,
  deviceLogId: process.env.ANTON_DEVICE_LOG_ID,
});

if (result.status === "ok" && result.authToken && result.logId) {
  // Nur im benötigten Prozessspeicher verwenden; nicht ausgeben.
}
```

Der Login-POST, seine Parameter und die möglichen Antwortfelder sind durch S3/N4 belegt. Eine `deviceLogId` kann der aufrufende Client aus einem eigenen autorisierten Gerätekontext übergeben; diese Bibliothek erzeugt keine Identität. Weitere Login-Schritte, Captcha und Fehlerstatus verarbeitet die Bibliothek nicht automatisch [S3].

## Ereignisse lesen

```ts
const snapshot = await api.subscribeEvents({
  logId: process.env.ANTON_LOG_ID!,
  authToken: process.env.ANTON_AUTH_TOKEN!,
  filter: "subscribeUser",
  inserted: "1970-01-01",
});

console.log(snapshot.totalEvents); // Keine Ereigniswerte oder URLs protokollieren.
```

Der GET-Aufruf und die Query-Schlüsselnamen wurden beobachtet [N5]. Der veröffentlichte Logger-Client setzt `filter.name` und einen Startzeitpunkt [S4: `lib/logRoutines.ls`, `lib/getEvents/getEvents.ls`]. Das Token steht bei dieser Route im URL-Query; Hinweise dazu in [AUTH.md](AUTH.md).
Der TypeScript-Client setzt `params[readOnly]=true` als vorsichtige Clientvorgabe; der konkrete im Browser gesendete Wert wurde nicht als Nachweis gespeichert.

Die Beispiele setzen eine Berechtigung für den jeweiligen Zugang voraus. `curl`-Beispiele greifen ausschließlich auf öffentliche Dateien zu.
