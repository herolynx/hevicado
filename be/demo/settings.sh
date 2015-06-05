db.settings.drop();

db.settings.insert(
 {
    "type": "emails.lost-password",
    "lang": "pl",
    "title": "Hevicado - zmiana hasła",
    "body": "\
Nowe tymczasowe hasło zostało wygenerowane dla Ciebie. \n\
\n\
Hasło: %s \n\
\n\
Hasło może być użyte tylko raz. \n\
Po zalogowaniu, zmień swoje obecne hasło w ustawieniach użytkownika. \n\
\n\
Jeśli nie zgłaszałeś straconego hasła, zignoruj ten e-mail. \n\
\n\
Z poważaniem, \n\
Hevicado \n\
"
 }
);
