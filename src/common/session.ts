/**
 * Created Date: 2017-09-27 14:13:07
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as config from "./config";
import { RequestHandler } from "express";
const RedisStore = connectRedis(session);

const sessionMiddleware = session({
    name: "session",
    store: new RedisStore({
        prefix: config.appname + ":"
    }),
    secret: config.secret,
    resave: true,
    saveUninitialized: false,
    cookie: {
        path: "/",
        httpOnly: true,
        secure: false,
        maxAge: 30 * 86400e3,
        signed: false
    }
});

const recoverMiddleWare: RequestHandler = function(req, res, next) {
    var tries = 3;
    sessionMiddleware(req, res, lookupSession);

    function lookupSession(error) {
        if (error) {
            return next(error);
        }
        tries -= 1;
        if (req.session !== undefined) {
            return next();
        }
        if (tries < 0) {
            return next(new Error("oh no"));
        }
        sessionMiddleware(req, res, lookupSession);
    }
};

export default recoverMiddleWare;
