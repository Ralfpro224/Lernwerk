# Administration und Lehrbereich

Der erste Administrator wird beim Seed aus `ADMIN_EMAIL` und `ADMIN_PASSWORD` angelegt. In **Verwaltung** kannst du Benutzer mit Rollen anlegen, Rollen ändern, Fächer, Themen, Lektionen und Aufgaben erstellen, veröffentlichen und löschen sowie Systemeinstellungen speichern.

## Inhalt veröffentlichen

1. Lege ein Fach mit eindeutigem URL-Kürzel an und aktiviere **Veröffentlicht**.
2. Lege ein Thema mit Fach und Klassenstufe an; veröffentliche es.
3. Lege eine Lektion im Thema an; veröffentliche sie.
4. Erstelle im visuellen Aufgaben-Editor Aufgaben. Prüfe Konfiguration, Lösung und Punkte und veröffentliche jede fertige Aufgabe.
5. Öffne den Katalog in einem Lernkonto, um die Darstellung zu prüfen. Lösungen werden an Lernkonten nicht ausgeliefert.

Alle vier Ebenen müssen veröffentlicht sein. Ein gelöschtes Fach entfernt abhängige Themen, Lektionen und Aufgaben. Bestehende Fortschrittsdaten zu gelöschten Lektionen entfallen durch die Datenbankbeziehungen.

## Lehrkräfte und Klassen

Admins vergeben die Rolle `TEACHER` in der Benutzerverwaltung. Lehrkräfte öffnen **Lehrbereich** oder **Klassen**, erstellen eine Klasse und teilen den generierten Beitrittscode ausschließlich mit ihren Lernenden. Anschließend können sie veröffentlichte Lektionen zuweisen und Fälligkeiten setzen. Lehrkräfte verwalten nur eigene Klassen; Admins alle Klassen. Lernende sehen ihre Klassenzugehörigkeit und Zuweisungen, aber keine E-Mail-Adressen anderer Mitglieder und keinen Beitrittscode im Klassendetail.

Bei Änderung eines Passworts über die Admin-API werden bestehende Sitzungen der betroffenen Person gelöscht. Das eigene Admin-Konto kann nicht über die Oberfläche gelöscht oder herabgestuft werden.
