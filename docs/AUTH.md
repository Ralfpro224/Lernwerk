# Anmeldung und Zugriff

Der untersuchte Login-Dialog nimmt einen Login-Code, eine E-Mail-Adresse, eine Telefonnummer oder einen Benutzernamen entgegen. Der Client übergibt den eingegebenen Wert als `params.value` und `checkCaptcha: true` im JSON-Umschlag eines `POST /?p=login/step1/step1` [S3: `pages/start/login/01_step1/submit/submit.ls`, `lib/util/pllsCall/send/send.ls`; N4].

Im autorisierten Test lieferte die Antwort unter anderem `logId` und `authToken`; die Anwendung wechselte anschließend in eine angemeldete Ansicht [N4]. Je nach Konto kann der Client weitere Anmeldeschritte anzeigen. Die Antwort ist deshalb nicht für alle Eingabearten gleich [S3: `pages/start/login/01_step1/submit/onCompleted/onCompleted.ls`].

Der öffentliche Clientcode setzt bei weiteren RPC-Aufrufen, falls `useAuthToken` aktiv ist, das Token als Feld `authToken` im JSON-Body; `logId` und `deviceLogId` sind getrennte Kontextfelder [S3: `lib/util/pllsCall/send/send.ls`]. Das Logger-Abonnement überträgt das Token dagegen im Query-Parameter `params[authToken]` [S4: `lib/getEvents/getEvents.ls`; N5]. URL-Protokolle können solche Werte enthalten. Der TypeScript-Client protokolliert keine URLs oder Antwortinhalte und speichert Tokens nicht dauerhaft.

Bei der Anmeldung wurde **„No, don't save“** gewählt. REA beobachtete danach Speicherschlüsselnamen wie `users`, `useAuthToken` und `deviceRememberUser`, aber keine Werte [REA-Evidence in EVIDENCE.md]. Das ist kein Nachweis, dass der Dienst ausschließlich diese Speichermechanismen verwendet. Cookie-basierte Authentifizierung wurde hier nicht bestätigt.

## Client-Nutzung

1. Einen ausdrücklich autorisierten Login-Wert und eine eigene `deviceLogId` an `loginStep1` übergeben.
2. Ein erhaltenes `authToken` nur im benötigten Prozessspeicher halten.
3. Für das bestätigte Logger-Abonnement `logId` und `authToken` übergeben. Da der beobachtete Dienst das Token im URL-Query erwartet, keine URL oder Browser-History damit aufzeichnen.
4. Bei Sitzungsende Referenzen auf Token und Antwortobjekte verwerfen.

Der Client führt keine Umgehung von Login-, Captcha- oder Rechteprüfungen durch. Ein `403` oder ein fachlicher Fehlerstatus wird an den Aufrufer zurückgegeben [S3: `lib/util/pllsCall/onLoaded/onLoaded.ls`].
