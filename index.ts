import { Database } from "bun:sqlite";
import httpProxy from "http-proxy";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { adminPort, proxyPort, proxyUpdateKey } from "./config.json";
import type { ProxyMap, ProxyAddEventKeys } from "./types";

const proxy: httpProxy = httpProxy.createProxyServer();
const db: Database = new Database("db.sqlite", { create: true });

var proxyMap: ProxyMap[] = [];

db.run("CREATE TABLE IF NOT EXISTS roots (host TEXT, hostUrl TEXT, target TEXT)");

Bun.serve({
    // development: true,
    port: adminPort,
    fetch(r: Request): Response | Promise<Response> {
        return manageProxy(r);
    }
});

createServer((req: IncomingMessage, res: ServerResponse) => {
    handleRequest(req, res, String(req.url));
}).listen(proxyPort);

async function handleRequest(req: IncomingMessage, res: ServerResponse, path: string) {
    // const requested : ProxyMap | undefined = proxyMap.find(x => x.host == req.headers.host && (path.length > 1 ? (x.hostUrl?.startsWith("/") ? x.hostUrl : "/" + x.hostUrl) == path : x.hostUrl == null));
    const requested : ProxyMap | undefined = proxyMap.find(x => x.host == req.headers.host && (x.hostUrl !== null ? x.hostUrl == path.slice(0, x.hostUrl.length) : true));
    
    if(!requested) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('Root not found!');
        res.end();
    } else {
        if(requested.hostUrl){
            req.url = path.slice(requested.hostUrl.length);
        }
        try {
            proxy.web(req, res, {target: requested.target});
            console.log(`[${new Date().toISOString().replace('T', ' ').split('.').shift()}] ${requested.host}${requested.hostUrl ? requested.hostUrl : ''} connected to => ${requested.target}`);
        } catch (error: unknown) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.write('Proxy crashed!');
            res.end();
        }
    }
}

async function manageProxy(r: Request) {
    try {
        let keys = await r.json() as (ProxyMap & ProxyAddEventKeys);

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

console.log(`Bun TS proxy server starts on port ${proxyPort}`);

process.on("uncaughtException", (err: unknown) => {
    console.log(err);
});
  
process.on("unhandledRejection", (err: unknown) => {
    console.log(err);
});
  
process.on("uncaughtExceptionMonitor", (err: unknown) => {
    console.log(err);
});
  
process.on("warning", (err: unknown) => {
    console.log(err);
});
