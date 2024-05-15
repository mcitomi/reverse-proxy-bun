import { Database } from "bun:sqlite";
import httpProxy from "http-proxy";
import { port, proxyUpdateKey } from "./config.json";
import type { ProxyMap, ProxyAddEventKeys } from "./types";

const proxy: httpProxy = httpProxy.createProxyServer();
const db: Database = new Database("db.sqlite", { create: true });

var proxyMap: ProxyMap[] = [];

db.run("CREATE TABLE IF NOT EXISTS roots (host TEXT, hostUrl TEXT, target TEXT)");

Bun.serve({
    // development: true,
    port: port,
    fetch(r: Request): Response | Promise<Response> {
        const requestPath: string = new URL(r.url).pathname;

        switch (requestPath) {
            case "/manageProxies":
                return manageProxy(r);

            default:
                return handleRequest(r, requestPath);
        }
    }
});

async function handleRequest(req: Request, path: string) {
    const requested : ProxyMap | undefined = proxyMap.find(x => x.host == req.headers.get("host") && (path.length > 1 ? (x.hostUrl?.startsWith("/") ? x.hostUrl : "/" + x.hostUrl) == path : x.hostUrl == null));
    
    if(!requested) {
        return new Response("Root not found!", {status: 404});
    } else {
        proxy.web(req, res, {target: requested.target});
        return;
    }
}

async function manageProxy(r: Request) {
    try {
        const keys = await r.json() as (ProxyMap & ProxyAddEventKeys);

        if (keys.pass !== proxyUpdateKey) {
            return new Response("mcitomi proxy error! this url not allowed / auth error");
        } else {
            try {
                switch (keys.action) {
                    case "add":
                        if(db.query(`SELECT * FROM roots WHERE host = "${keys.host}" AND target = "${keys.target}" AND hostUrl ${keys.hostUrl ? `= "${keys.hostUrl}"` : "IS NULL"};`).all().length > 0){
                            return new Response("This root already added!");
                        }
                        
                        db.run(`INSERT INTO roots (host, hostUrl, target) VALUES ("${keys.host}", ${keys.hostUrl ? `"${keys.hostUrl}"` : null}, "${keys.target}");`);
                        loadProxyMap();
                        return new Response("Successfully added!");

                    case "remove":
                        if(db.query(`SELECT * FROM roots WHERE host = "${keys.host}" AND target = "${keys.target}" AND hostUrl ${keys.hostUrl ? `= "${keys.hostUrl}"` : "IS NULL"};`).all().length < 1){
                            return new Response("Not found!");
                        }
                        
                        db.run(`DELETE FROM roots WHERE host = "${keys.host}" AND target = "${keys.target}" AND hostUrl ${keys.hostUrl ? `= "${keys.hostUrl}"` : "IS NULL"};`);
                        loadProxyMap();
                        return new Response("Removed!");
                
                    default:
                        return new Response("mcitomi proxy error: invalid action");
                }
            } catch (e: unknown) {
                return new Response("mcitomi proxy error! " + e);
            }
        }
    } catch (e: unknown) {
        return new Response("mcitomi proxy error: Request error");
    }
}

function loadProxyMap() {
    proxyMap = db.query(`SELECT * FROM roots`).all() as ProxyMap[];
}

loadProxyMap();


console.log(`Bun TS proxy server starts on port ${port}`);
