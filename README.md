# bun_proxy

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

A port állítható a config.json fileban.
Adatbázis felépítés:
- host: (req.headers.host) azon domain címe, ahonnan a kérés érkezik TEXT
- hostUrl: (req.url) a domain után írott elérési út TEXT (ha van | opcionális)
- target: Annak a szervernek az ip címe és portja, egyéb aloldala, ahhova a kérést irányítjuk. (pl: 'http://localhost:8080') TEXT