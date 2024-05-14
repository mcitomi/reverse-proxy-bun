import { Database } from "bun:sqlite";
import httpProxy from "http-proxy";
import { port } from "./config.json";
// import type {  ProxyMap } from "./index";
type ProxyMap = {
    host: string;
    hostUrl: string | null;
    target: string;
}

const proxy: httpProxy = httpProxy.createProxyServer();
const db: Database = new Database("db.sqlite", { create: true });

var proxyMap : ProxyMap[] = [];

db.run("CREATE TABLE IF NOT EXISTS roots (host TEXT, hostUrl TEXT, target TEXT)");

Bun.serve({
    development: true,
    port : port,
    fetch(r : Request) : Response | Promise<Response> {
        dbUpdate(r)
        
        return new Response("asd");
    }
});


function updateMap() {
    proxyMap = db.query("SELECT * FROM roots").all() as ProxyMap[];
}

async function dbUpdate(r: Request) {
    console.log(r.method);
    
    try {
        console.log(await r.text());
    } catch (error) {
        console.log(error);
        
    }
    
    
}
console.log(`Bun TS proxy server starton on port ${port}`);
