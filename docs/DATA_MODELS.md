# Beobachtete JSON-Datenmodelle

Die Typen beruhen auf Antwortformen aus dem Browser und auf den angegebenen öffentlichen Clientmodulen. Optionale Felder sind nur dann als erforderlich markiert, wenn die Beobachtung das trägt. Einzelne Antwortwerte und Kontodaten wurden nicht gespeichert. Quellenkürzel stehen in [EVIDENCE.md](EVIDENCE.md).

## `LoginStep1Request` [S3, N4]

```ts
interface LoginStep1Request {
  path: "/../server-apis-db2/apis/login/step1/step1";
  params: { value: string; checkCaptcha: boolean };
  deviceLogId?: string;
  isDebug?: boolean;
  useAuthToken?: boolean;
}
```

Der in S3 gezeigte allgemeine RPC-Umschlag besitzt weitere optionale Felder (`queryInfo`, `logId`, `dbMode`, `authToken`). Ihre konkreten Werte wurden für den Login nicht veröffentlicht. Der HTTP-Query-Wert ist `p=login/step1/step1` [S3: `lib/util/pllsCall/calcUrl/calc.ls`; N4].

## `LoginStep1Response` [N4, S3]

```ts
interface LoginStep1Response {
  status: string;
  loginCode?: string;
  logId?: string;
  authToken?: string;
  displayName?: string;
  avatar?: {
    body?: object;
    head?: object;
    legs?: object;
    shadow?: object;
    version?: number;
  };
}
```

Die gelisteten Felder waren in **einer** erfolgreichen Antwort vorhanden. S3 zeigt weitere Zweige bei anderen Login-Ergebnissen, etwa einen zusätzlichen Schritt oder Captcha [S3: `pages/start/login/01_step1/submit/onCompleted/onCompleted.ls`, `lib/util/pllsCall/onLoaded/onLoaded.ls`].

## Content [N2, N6]

| `fileId` oder Route | Beobachtete Form |
| --- | --- |
| `/ping` | `{ status: string }` |
| `maintenance` | `{ maintenanceMessages: unknown[], etag: string }` |
| `projectVersions` | `{ projects: Record<string, string> }` |
| `list/plans` | `{ created: string, version: number, plans: object[], etag: string }` |

Die Elemente von `maintenanceMessages` waren im beobachteten Ergebnis leer. Für `plans` wurden Feldnamen wie `project`, `fileId`, `etag`, `title` und `grades` gesehen; die tiefen Typen wurden nicht sicher bestimmt und sind in OpenAPI offen gehalten [N6].

## `LoggerSubscribeResponse` [N5, S4]

```ts
interface LoggerSubscribeResponse {
  error?: boolean;
  log?: string;
  inserted?: string;
  filter?: string;
  totalEvents?: number;
  maxInserted?: string;
  events?: object[];
  isInSync?: boolean;
  authToken?: string;
}
```

Die beobachtete Antwort enthielt Ereignisse mit Metadatenfeldern. Ihre Werte können personenbezogen sein und gehören nicht in Beispiele oder Logs. `authToken` ist im Logger-Code als mögliches Antwortfeld belegt, wurde aber nicht als ausgegebener Wert dokumentiert [S4: `lib/getEvents/getEvents.ls`].
