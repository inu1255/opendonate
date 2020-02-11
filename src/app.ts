import * as cofs from "fs-extra";
import * as formidable from 'formidable'
import { Request, Response } from "express-serve-static-core";
import * as express from "express";
import { json, urlencoded } from "body-parser";
import { apiBuilder } from "./common/green";
import session from "./common/session";
import { connectLogger } from "./common/log";
import * as config from "./common/config";
import * as lib from "./lib";
import * as utils from "./common/utils";
import * as path from "path";
import * as compression from "compression";
import './lib/watch';
import './lib/tasks';
const app = express();

declare global {
    namespace Express {
        interface SessionData {
            user: de.User;
        }
    }
    type FormFile = formidable.File;
    type ExpressRequest = Request;
    type ExpressResponse = Response;
}

declare module "express-serve-static-core" {
    interface Request {
        ua: string;
    }
}

app.set('trust proxy', 'loopback') 
if (config.dev) { // 如果是调试模式，则允许跨域
    app.use(utils.crossMiddle());
} else {
    app.use(utils.crossMiddle({ filter: origin => origin.endsWith("inu1255.cn") || /192.168/.test(origin) }));
}
if (config.dev) {
    app.use(/\.|^$/, utils.proxyToMiddle({ proxyTo: "http://localhost:8080" }));
} else {
    app.use(compression());
}
app.use(express.static("public"));
app.use(json({ limit: "5mb" }));
app.use(urlencoded({ extended: false, limit: "5mb" }));
app.use(connectLogger);
app.use(utils.multipartMiddle(config.upload));
app.use(session);
app.use(lib.expressSessionUpdate);
app.use(function(req, res, next) {
    req.ua = req.headers["user-agent"] || "";
    if (req.ua.length > 256) req.ua = req.ua.slice(0, 256);
    next();
});
app.use(apiBuilder("/api").walk("./api", path.join(__dirname, "./routes")).build());

app.get("*", function(req, res, next) {
    if (req.path.indexOf('.') < 0)
        res.sendFile(path.join(process.cwd(), "public/index.html"));
    else next()
});

app.listen(config.port, async function() {
    await cofs.mkdirs("public/pic/");
    await cofs.mkdirs("public/tmp/");
    console.log("Listening on http://localhost:" + config.port);
});
