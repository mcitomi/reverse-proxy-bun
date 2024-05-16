# bun_proxy

To install dependencies:
```bash
bun install
```

To run:
```bash
bun run index.ts
```

DB structure:
- host: (req.headers.host) azon domain címe, ahonnan a kérés érkezik `TEXT`
- hostUrl: (req.url) a domain után írott elérési út `TEXT`/`NULL`
- target: Annak a szervernek az ip címe és portja, egyéb aloldala, ahhova a kérést irányítjuk. (pl: 'http://localhost:8080') `TEXT`

Example post request raw body data:
```
{
    "pass" : "<yourpassword>",
    "host" : "sub.example.com",
    "hostUrl" : null, | "/page"
    "target" : "http://localhost:8888",
    "action" : "add"
}
```
Actions: `add` `remove`

!Fontos! hogy pontosan ilyen formátumban adjuk meg az adatokat. (target előtt http, host csak a domaint tartalmazza)