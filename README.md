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
- domain: (req.headers.host) azon domain címe, ahonnan a kérés érkezik TEXT
- url: (req.url) a domain után írott elérési út TEXT
- destIP: Annak a szervernek az ip címe, ahhova a kérést irányítjuk. (localhost vagy külső cím) TEXT
- port: -||- port címe. NUMBER