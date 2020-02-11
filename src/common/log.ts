"use strict";
/**
 * Created Date: 2017-09-28 21:10:50
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
import { createLogger, format, transports } from "winston";
import * as TransportStream from "winston-transport";
import * as colors from "colors/safe";
import * as expressWinston from "express-winston";
import * as config from "./config";
import 'winston-daily-rotate-file';
import { SPLAT } from "triple-beam";
const { combine, timestamp, errors, colorize, printf } = format;

const timeFormat = timestamp({ format: "YYYY-MM-DD HH:mm:ss" });
const splatFormat = format(function(info) {
    if (info[SPLAT]) {
        info.message += ' ' + info[SPLAT].join(" ");
    }
    return info;
});
const consoleFormat = printf(info => {
    let { level, message, label, timestamp } = info;
    let msg = `${colors.gray(timestamp)} [${colors.cyan(label)}] ${level}: ${message}`;
    if (info.stack) {
        msg += "\n" + colors.gray(info.stack);
    }
    return msg;
});
const consoleTransport = new transports.Console({
    format: combine(colorize({
        all: true, colors: {
            debug: 'gray',
        }
    }), consoleFormat), level: 'debug'
});

function makeLogger(label: string, level: string = undefined) {
    let fileTransport = new transports.DailyRotateFile({
        format: combine(colorize({
            all: true, colors: {
                debug: 'gray',
            },
        }), consoleFormat),
        filename: `log/app-%DATE%.log`,
        level,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '180d'
    });
    let trans: TransportStream[] = [fileTransport];
    trans.push(consoleTransport);
    return createLogger({
        transports: trans,
        defaultMeta: { label },
        format: combine(errors({ stack: true }), splatFormat(), timeFormat)
    });
}

export const appLogger = makeLogger("app", "warn"); // 程序运行中的错误
export const devLogger = makeLogger("dev", "info"); // 开发调试
export const dbLogger = makeLogger("db", "debug"); // 数据库日志
export const taskLogger = makeLogger("task", "info"); // 任务日志
export const console = makeLogger("console"); // 临时日志
global.console.log = function() {
    console.info.apply(console, arguments);
};

const accessFormat = combine(colorize(), printf(info => {
    let { level, message, label, timestamp, meta } = info;
    let uid = meta.uid ? colors.magenta(' ' + meta.uid) : ''
    let no = meta.no;
    let msg = `${colors.gray(timestamp)} [${colors.cyan('access')}] ${level}:${no}${uid} ${message}`;
    if (info.stack) {
        msg += "\n" + colors.gray(info.stack);
    }
    return msg;
}));
export const connectLogger = expressWinston.logger({
    transports: [
        new transports.File({
            filename: `log/access.log`, format: printf(info => {
                let { uid, ip, ua, no } = info.meta;
                let { method, url } = info.meta.req;
                let { statusCode, responseTime } = info.meta.res;
                return JSON.stringify({ uid, ip, ua, method, url, statusCode, no, responseTime, timestamp: info.timestamp });
            }), maxsize: 5242880, maxFiles: 5, level: 'debug'
        }),
        new transports.DailyRotateFile({
            format: accessFormat,
            filename: `log/app-%DATE%.log`,
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '180d'
        }),
        new transports.Console({
            format: accessFormat, level: 'debug'
        }),
    ],
    format: combine(errors({ stack: true }), splatFormat(), timeFormat),
    meta: true,
    msg: "{{req.method}} {{req.url}} {{res.no}} {{res.responseTime}}ms",
    expressFormat: true,
    colorize: true,
    dynamicMeta: function(req, res) {
        var ip = req.ip;
        var ua = req.ua;
        var uid: number;
        var no = res.no;
        if (req.session && req.session.user)
            uid = req.session.user.id;
        return { uid, ip, ua, no }
    },
    // ignoreRoute: function(req, res) {
    //     return false;
    // },
});