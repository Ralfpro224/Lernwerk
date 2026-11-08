# REA-Analyse der Referenz ANTON.app

Stand: 8. November 2026. Untersuchungsumfang: öffentlich ausgelieferte Web-Ressourcen und eine vom Auftraggeber freigegebene Testsitzung. Die Analyse diente der Planung von Lernwerk. ANTON-Inhalte, Sitzungsdaten und Zugangscode sind nicht Teil des Projekts.

## REA-Version und Funktionen

Die installierte CLI `npx -y rea-agents@6.8.0 --help` nennt für Web-Analysen `list-browser-targets`, `inspect-web-page`, `analyze-web-bundle`, `capture-browser-scenario`, `inspect-web-network-capture`, `export-web-scripts` und `analyze-javascript-application`. Verwendet wurden passive Browserinspektion und statische Analyse öffentlicher Skripte. Die direkte REA-MCP-Werkzeugliste war in dieser Agentensitzung nicht geladen. Ein REA-Browser-Szenario meldete `execution_failure`; Methoden und Antwortformen wurden zusätzlich mit passiver Netzwerkbeobachtung belegt. Details und Hashes stehen in [EVIDENCE.md](EVIDENCE.md).

Zusätzliche REA-Browserbeobachtungen dieser Phase: öffentliche Seite `ev_c871b0cb55ac370269a8daa5334aa97dad8cc17995706247c0a658e87c535ad3`, freigegebene angemeldete Übungsansicht `ev_6c618e73a19aa7f7edaad5d0c3628c58bb4a68809f2845bfe9678ac51db97c05`. Die Evidence-IDs verweisen auf lokale REA-Ergebnisse, nicht auf eine öffentliche API.

## Funktionsinventar

| Bereich | Beobachtung | Nachweis und Implementierungsentscheidung |
| --- | --- | --- |
| Startseite | Öffentliche Startseite und Login-Einstieg sichtbar | REA-Ansicht und S1; Lernwerk nutzt eigene Startseite |
| Anmeldung | Code-Eingabe, danach angemeldete Ansicht | N4 und freigegebener Testzugang; Lernwerk nutzt eigene E-Mail/Passwort-Sessions |
| Navigation/Dashboard | Fächer, Gruppen, Spiele, Lernhistorie und Einstellungen in der Testansicht sichtbar | REA-Ansicht der Testsitzung; Lernwerk hat Fächer, Klassen, Fortschritt, Belohnungen und Profil |
| Fächer/Themen/Klassenstufen | Navigation Fach → Klassenstufe → Thema → Übung beobachtet | REA-Ansicht der Testsitzung; eigenes hierarchisches Inhaltsmodell |
| Übungen | Eine autorisierte Übungsansicht untersucht; konkrete Formate nicht vollständig inventarisiert | REA-Ansicht; neun eigene Formate nach Auftrag entworfen |
| Fortschritt/Belohnungen | Lernhistorie im Menü sichtbar; genaue Punkteregeln nicht bestätigt | REA-Ansicht; eigene einmalige Punktevergabe und Fortschrittslogik |
| Profil/Einstellungen | Einstellungen im angemeldeten Menü sichtbar | REA-Ansicht; eigenes Profil und Farbeinstellungen |
| Lehrer/Klassen/Admin | Für den freigegebenen Testaccount nicht zugänglich | Keine Aussage über Referenz-Implementierung; Lernwerk-Alternativen eigenständig |
| Responsive/Ladezustände/Fehler | Öffentliche und angemeldete Ansichten inspiziert, jedoch kein vollständiger Geräte-/Fehlerkatalog | Lernwerk hat eigene mobile Navigation, Lade- und Fehlerzustände |

## Bestätigte technische Architektur

Die öffentliche Startseite lieferte HTML mit Express-Header und einem Browserify-Bundle mit LiveScript-Modulen [S1]. Versionsgebundene Projektarchive kamen von `content.anton.app` [S2–S4]. Das beobachtete Login war ein JSON-RPC-artiger POST an `a-apis-db.anton.app/?p=login/step1/step1`, nicht Teil eines nachgewiesenen REST-Pfadbaums [N4]. Ein separater Logger lieferte Ereignisse über `GET /apisLogger/subscribe/` [N5]. Ein WebSocket-Pfad ist im öffentlichen Code sichtbar, aber keine konkrete Verbindung/Nachricht wurde bestätigt [S4]. Die technischen Einzelheiten stehen in [ANTON_ARCHITECTURE.md](ANTON_ARCHITECTURE.md), [ENDPOINTS.md](ENDPOINTS.md), [DATA_MODELS.md](DATA_MODELS.md) und [AUTH.md](AUTH.md).

## Trennung von Beobachtung und Annahme

Nur die in [EVIDENCE.md](EVIDENCE.md) mit S-/N-Kürzel belegten HTTP-Pfade gelten als bestätigt. Im Skript sichtbare logische Operationen wurden nicht zu Endpunkten hochgestuft. Lehrerfunktionen, konkrete Aufgabenformate, Belohnungsregeln, Caching-Semantik und WebSocket-Nachrichten blieben offen. Lernwerk implementiert hierfür eigenständige, plausible Lösungen; seine REST-Routen sind [separat dokumentiert](API.md). Die frühere OpenAPI-Datei der beobachteten Referenz ist unter [ANTON_OBSERVED_OPENAPI.yaml](ANTON_OBSERVED_OPENAPI.yaml) archiviert.
