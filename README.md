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

Adatbázis (és request) felépítés:
- host: (req.headers.host) azon domain címe, ahonnan a kérés érkezik `String`
- hostUrl: (req.url) a domain után írott elérési út `String`/`null` (ha van | opcionális)
- target: Annak a szervernek az ip címe és portja, egyéb aloldala, ahhova a kérést irányítjuk. (pl: 'http://localhost:8080') `String`

Példa post request raw body data:
```
{
    "pass" : "password",
    "host" : "test.localhost:8080",
    "hostUrl" : null, | "/page"
    "target" : "http://localhost:8888",
    "action" : "add"
}
```
Actions: `add` `remove`

!Fontos! hogy pontosan ilyen formátumban adjuk meg az adatokat. (target előtt http, host csak a domaint tartalmazza)