# Datenbank

PostgreSQL 17 speichert alle Lernwerk-Daten. Das Schema steht in [prisma/schema.prisma](../prisma/schema.prisma), die erste Migration in `prisma/migrations/20261108151510_init/`. Prisma darf mit `npm run db:migrate` bestehende Installationen auf den dokumentierten Stand bringen.

| Tabelle/Modell | Zweck | Wichtige Beziehung |
| --- | --- | --- |
| User, Session | Konto, Rolle, Passwort-Hash, Sitzungs-Hash | Session → User |
| Subject, Topic, Lesson, Question | Veröffentlichbare Lerninhalte | Hierarchie Fach → Thema (Klassenstufe) → Lektion → Aufgabe |
| Attempt, LessonProgress, RewardEntry | Antwortverlauf, Ergebnis, Punkte | pro Nutzer; RewardEntry eindeutig je Nutzer/Aufgabe |
| Classroom, ClassMember, Assignment | Lehrkraft, Mitglieder, Zuweisungen | Assignment verbindet Klasse und Lektion |
| SiteSetting | Admin-Einstellungen als JSON | Schlüssel eindeutig |

`Question.config` enthält die zur Darstellung nötigen Optionen, `Question.answer` nur die serverseitige Lösung. `Attempt.response` speichert die vom Nutzer eingereichte JSON-Antwort. `LessonProgress` ist durch `(userId, lessonId)` eindeutig. Die Vergabe eines `RewardEntry` pro `(userId, questionId)` verhindert doppelte Punkte auch bei wiederholten Antworten. Löschen eines Fachs löscht abhängige Themen und Lektionen; das sollte im Adminbereich bewusst erfolgen.

Der Seed in `prisma/seed.ts` legt drei Fächer, neun eigene Beispielaufgaben und den ersten Administrator an. Er ist idempotent und überschreibt vorhandene Datensätze nicht. Zugangsdaten kommen ausschließlich aus Umgebungsvariablen.
