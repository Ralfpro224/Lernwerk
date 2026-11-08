# Lernwerk REST-API

Basis-URL: `/api`. Die vollständige maschinenlesbare Beschreibung steht in [openapi.yaml](../openapi.yaml). Alle Mutationen erwarten `Content-Type: application/json` (DELETE ausgenommen). Fehler haben die Form `{ "error": "..." }`; Validierungsfehler können zusätzlich `details` enthalten.

## Authentifizierung

| Methode | Pfad | Bedeutung |
| --- | --- | --- |
| POST | `/auth/register` | Konto mit `email`, `password` (mindestens 10 Zeichen), `displayName` erstellen; setzt Session-Cookie |
| POST | `/auth/login` | Mit `email`, `password` anmelden; setzt Session-Cookie |
| POST | `/auth/logout` | Session beenden |
| GET | `/auth/me` | Aktuelle Sitzung abfragen |

Das Cookie ist HttpOnly, SameSite=Lax und im Produktionsmodus Secure. Der Rohwert wird in der Datenbank nur als HMAC gespeichert. Browser senden das Cookie automatisch. Schreibende Routen prüfen den Origin-Header gegen Host und Protokoll der Anfrage. Fremde Origin-Werte werden mit 403 zurückgewiesen.

## Lernende

| Methode | Pfad | Bedeutung |
| --- | --- | --- |
| GET | `/health` | Gesundheitsstatus |
| GET | `/catalog` | Veröffentlichte Fächer, Themen und Lektionen |
| GET | `/lessons/{id}` | Veröffentlichte Aufgabe ohne Lösungsfeld, optional eigener Fortschritt |
| POST | `/attempts` | `{questionId,response}` prüfen; liefert `correct`, `earned`, `progress` |
| GET | `/progress` | Eigene Lektionen und Gesamtpunkte |
| PATCH | `/profile` | `displayName`, `avatarColor` ändern |
| GET | `/classes` | Eigene Klassen |
| POST | `/classes/join` | Klasse mit `joinCode` beitreten |
| GET | `/classes/{id}` | Berechtigte Klassendetails |
| GET | `/assignments` | Eigene Zuweisungen |

`POST /attempts` speichert jeden Versuch. Punkte werden für eine Aufgabe pro Benutzer höchstens einmal vergeben, auch bei wiederholten richtigen Antworten. Bei nicht angemeldeten Personen liefert der Versuch 401. Die Lösungsdaten stehen ausschließlich serverseitig im Modell `Question.answer`; `GET /lessons/{id}` gibt sie nicht aus.

## Lehrkräfte und Administration

Lehrkräfte dürfen `POST /classes`, `PATCH` und `DELETE /classes/{id}` für ihre eigenen Klassen sowie `POST /assignments` und `DELETE /assignments/{id}` für ihre Klassen verwenden. Administratoren dürfen dies für alle Klassen. Lernende erhalten 403.

| Methode | Pfad | Bedeutung |
| --- | --- | --- |
| GET, POST | `/admin/{entity}` | `subjects`, `topics`, `lessons`, `questions` auflisten oder erstellen |
| PATCH, DELETE | `/admin/{entity}/{id}` | Inhalt ändern oder löschen |
| GET, POST | `/admin/users` | Benutzer auflisten oder erstellen |
| PATCH, DELETE | `/admin/users/{id}` | Benutzer/Rolle ändern oder Konto löschen |
| GET, PUT | `/admin/settings` | Systemeinstellungen lesen oder einen Schlüssel speichern |

Admin-Abfragen liefern auch unveröffentlichte Inhalte. Inhalte erscheinen im öffentlichen Katalog nur, wenn Fach, Thema und Lektion veröffentlicht sind. Fragen werden nur bei eigener Veröffentlichung an Lernende ausgeliefert.

## Beispiel

```ts
const response = await fetch("/api/attempts", {
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ questionId: "seed-q-single", response: "b" }),
});
const result = await response.json();
if (!response.ok) throw new Error(result.error);
console.log(result.correct, result.earned);
```

## Fehler und Grenzen

400 ungültige Eingabe, 401 fehlende/ungültige Sitzung, 403 Rolle oder Origin nicht erlaubt, 404 unbekannter/nicht veröffentlichter Datensatz, 409 Konflikt, 415 anderes Medienformat, 500 interner Fehler. Listen sind derzeit ohne Pagination; für größere Installationen ist diese Ergänzung nötig. WebSockets sind in Lernwerk nicht implementiert.
