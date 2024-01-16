import { Database } from "bun:sqlite";
import http from "http";
import httpProxy from "http-proxy";
import { port } from "./config.json";

const proxy : httpProxy = httpProxy.createProxyServer();
const db : Database = new Database("db.sqlite", { create: true });

db.run("CREATE TABLE IF NOT EXISTS roots (domain TEXT, url TEXT, destIP TEXT, port NUMBER)");

const server = http.createServer((req, res) => {
    console.log(req.headers.host, req.url);
    
});

server.listen(port);
console.log(`Bun TS proxy server starton on port ${port}`);
