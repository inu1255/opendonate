import { createHash, BinaryLike, HexBase64Latin1Encoding } from "crypto";
import * as http from "http";
import * as https from "https";
import { parse } from "url";
import { IncomingForm } from "formidable";
import { stringify } from "querystring";
import { RequestHandler, Request, Response } from "express";
import { Duplex, Stream } from "stream";
import * as child_process from "child_process";
import { readFileSync, writeFile } from "fs";
import * as path from "path";
import * as fs from "fs";
const _lock = {};

interface CrossMiddleOption {
    filter?: (origin: string) => boolean; // 过滤条件，允许哪些域名跨域
    allowCredentials?: boolean; // 允许cookie跨域
    allowHeaders?: string[]; // 允许跨域的headers
}

/**
 * 跨域中间件
 */
export function crossMiddle(config?: CrossMiddleOption): RequestHandler {
    config = Object.assign({ allowCredentials: true }, config);
    return function(req, res, next) {
        const origin = req.headers["origin"];
        if (origin && (!config.filter || (typeof origin === "string" ? config.filter(origin) : origin.reduce((ok, o) => ok || config.filter(o), false)))) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            if (config.allowCredentials) res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers", ["content-type"].concat(config.allowHeaders).join(","));
        }
        next();
    };
}

/**
 * 代理中间件，通过header指定代理目标
 * @param name 代理头
 */
export function proxyMiddle(name: string): RequestHandler {
    return function(req, res, next) {
        let proxyTo = req.headers[name];
        if (proxyTo && req.method != "OPTIONS") {
            delete req.headers[name];
            proxy(req, res, { proxyTo: proxyTo instanceof Array ? proxyTo[0] : proxyTo });
        } else next();
    };
}

/**
 * 代理到
 * @param proxyTo 代理URL
 */
export function proxyToMiddle(proxyTo): RequestHandler {
    return function(req, res, next) {
        proxy(req, res, { manual: true, proxyTo })
            .then(function(proxy_res) {
                if (proxy_res.statusCode === 404) {
                    res._sent = false;
                    next();
                } else {
                    res.writeHead(proxy_res.statusCode, proxy_res.statusMessage, proxy_res.headers);
                    proxy_res.pipe(res);
                }
            })
            .catch(next);
    };
}

/**
 * multipart解析中间件
 * @param dir 上传文件临时目录
 */
export function multipartMiddle(dir: string): RequestHandler {
    let form = new IncomingForm();
    form.uploadDir = dir;
    form.keepExtensions = true; //保留后缀
    form.multiples = true; //支持多文件上传
    form.hash = "md5";
    return function(req, res, next) {
        if (/multipart\/form-data;\s*boundary/i.test(req.headers["content-type"])) {
            form.parse(req, function(err, fields, files) {
                req.fields = fields;
                req.files = files;
                next();
            });
        } else {
            next();
        }
    };
}

/**
 * 检查端口是否占用
 * @param {number} port 端口
 */
export function probe(port: number) {
    return new Promise(function(resolve) {
        var server = require("net")
            .createServer()
            .listen(port);
        var timeoutRef = setTimeout(function() {
            resolve(true);
        }, 2000);

        server.on("listening", function() {
            clearTimeout(timeoutRef);

            if (server) server.close();
            resolve(false);
        });

        server.on("error", function(err) {
            clearTimeout(timeoutRef);

            var result = false;
            if (err.code === "EADDRINUSE") result = true;
            resolve(result);
        });
    });
}

export function format(format: string, t?: number | Date) {
    if (typeof t === "number") {
        if (t < 1e12) t *= 1e3;
        t = new Date(t);
    } else if (!t) {
        t = new Date()
    }
    let year = t.getFullYear().toString();
    var month = (t.getMonth() + 1).toString();
    if (month.length < 2) month = "0" + month;
    var date = t.getDate().toString();
    if (date.length < 2) date = "0" + date;
    var hours = t.getHours().toString();
    if (hours.length < 2) hours = "0" + hours;
    var mintues = t.getMinutes().toString();
    if (mintues.length < 2) mintues = "0" + mintues;
    var seconds = t.getSeconds().toString();
    if (seconds.length < 2) seconds = "0" + seconds;
    return format
        .replace(/YYYY/g, year)
        .replace(/YY/g, year.toString().slice(2))
        .replace(/MM/g, month)
        .replace(/DD/g, date)
        .replace(/hh/g, hours)
        .replace(/mm/g, mintues)
        .replace(/ss/g, seconds);
}

/**
 * @param {string} query 获取一行用户输入
 * @param {string} def 默认值
 * @returns {Promise<string>}
 */
export function readline(query: string, def: string): Promise<string> {
    const rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        rl.question((query || "") + (def ? `(${def})` : ""), answer => {
            rl.close();
            resolve(answer || def || "");
        });
    });
}

export function streamToBuffer(stream: Stream) {
    return new Promise((resolve, reject) => {
        let buffers = [];
        stream.on("error", reject);
        stream.on("data", data => buffers.push(data));
        stream.on("end", () => resolve(Buffer.concat(buffers)));
    });
}

export function bufferToStream(buffer: Buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 把v转换为mysql可以接收的参数，把对象转换成json字符串
 * @param {any} v 值
 * @returns {String}
 */
export function val(v: any): string {
    if (v === undefined) v = null;
    return v && typeof v === "object" ? JSON.stringify(v) : v;
}

/**
 * 如果args为undefined则返回 def||[]
 * 如果args是一个Array则返回自己
 * 如果不是则返回[args]
 * @param {any} args
 * @param {Array} [def] 默认值
 * @returns {Array}
 */
export function arr<T>(args: T | T[], def?: T[]): T[] {
    if (args instanceof Array) return args;
    return args === undefined ? def || [] : [args];
}

export function clearNull(obj: {
    [x: string]: any
}) {
    let data: {
        [x: string]: any
    } = {};
    for (let k in obj) {
        let v = obj[k];
        if (v != undefined) data[k] = v;
    }
    return data;
}

export function ifnull(v: any, def: any) {
    return v == null ? def : v;
}

/**
 * 深度优先遍历
 * @param tree 遍历目标
 * @param fn 处理函数
 * @param key 孩子键
 * @param parent 父亲节点
 */
export function dfs<T>(tree: Array<T>, fn: (data: T, parent: T, idx: number) => boolean, key?: string, parent?: T) {
    for (var i = 0; i < tree.length; i++) {
        var item = tree[i];
        if (fn(item, parent, i)) continue;
        if (item) dfs(item[key], fn, key, item);
    }
}

/**
 * 孩子优先 深度优先遍历
 * @param tree 遍历目标
 * @param fn 处理函数
 * @param key 孩子键
 * @param parent 父亲节点
 */
export function cf_dfs<T>(tree: Array<T>, fn: (data: T, parent: T, idx: number) => boolean, key?: string, parent?: T) {
    for (var i = 0; i < tree.length; i++) {
        var item = tree[i];
        if (item) dfs(item[key], fn, key, item);
        if (fn(item, parent, i)) continue;
    }
}

interface ICookie {
    name: string;
    value: string;
    domain?: string;
    expires?: number;
    path?: string;
    httponly?: string;
    secure?: string;
    samesite?: string;
    size?: string;
    session?: string;
}

/**
 * 将set-cookie头转换成cookie对象
 * @param cookieStr
 */
export function parseResCookie(cookieStr: string): ICookie {
    const KEYS = {
        name: true,
        value: true,
        domain: true,
        expires: true,
        path: true,
        httponly: true,
        secure: true,
        samesite: true,
        size: true,
        session: true
    };
    let cc = cookieStr.split(";");
    let ss = cc[0].split("=");
    let item: ICookie = {
        name: ss[0],
        value: ss.slice(1).join("="),
        domain: arguments[2]
    };
    for (let row of cc.slice(1)) {
        let ss = row.split("=");
        let name = ss[0].trim().toLowerCase();
        if (KEYS[name]) {
            if (name == "expires") item[name] = isNaN(+ss[1]) ? new Date(ss[1]).getTime() : +ss[1];
            else item[name] = ss[1] ? ss[1].trim() : 1;
        }
    }
    return item;
}

/**
 * 将cookie头转换成cookie对象
 * @param cookieStr
 */
export function parseReqCookie(cookieStr: string): ICookie {
    if (!cookieStr) return;
    let cc = cookieStr.split(";");
    let item: any = {};
    for (let s of cc) {
        let ss = s.split("=");
        if (ss.length > 1) {
            item[ss[0].trim()] = ss[1].trim();
        }
    }
    if (item.name && item.value) return item;
}

/**
 * @param list
 */
export function unique<T>(list: T[]) {
    let set = new Set<T>();
    for (let item of list) {
        set.add(item);
    }
    list = [];
    set.forEach(x => list.push(x));
    return list;
}

/**
 * 修改body, 去掉keys和undefine
 */
export function clearKeys<T>(body: T, keys: string[] | { [key: string]: any }): T {
    if (keys instanceof Array) { // 清除keys中的字段
        for (let key of keys) {
            delete body[key];
        }
    } else { // 清除与keys值相同的字段
        for (let k in body) {
            let v = body[k];
            if (keys[k] == v || v === undefined) delete body[k];
        }
    }
    return body;
}

export function isEmpty(obj) {
    if (!obj) return true;
    let ok = true;
    for (let k in obj) {
        ok = false
        break;
    }
    return ok;
}

export function hash(method: string, s: any, format?: HexBase64Latin1Encoding) {
    var sum = createHash(method);
    var isBuffer = Buffer.isBuffer(s);
    if (!isBuffer && typeof s === 'object') {
        sum.update(JSON.stringify(s), 'utf8');
    } else {
        sum.update(s, isBuffer ? 'ascii' : 'utf8');
    }
    return sum.digest(format || 'hex');
}

export function md5(str: BinaryLike, format?: HexBase64Latin1Encoding) {
    return hash('md5', str, format)
}

export function sha1(str: BinaryLike, format?: HexBase64Latin1Encoding) {
    return hash('sha1', str, format)
}

/**
 * 签名数据,防止篡改
 * @param {string} sec 密码
 * @param {any} body 签名对象
 * @returns {string} base64 string
 */
export function signToken(sec: string, body: any): string {
    let str = JSON.stringify(body);
    body.sign = md5(str + sec);
    return new Buffer(JSON.stringify(body)).toString("base64");
}

/**
 * 校验签名并返回数据,校验失败返回undefined
 * @param {string} sec 密码
 * @param {string} token base64 string
 */
export function checkSign(sec: string, token: string) {
    try {
        let body = JSON.parse(Buffer.from(token, "base64").toString());
        let sign = body.sign;
        delete body.sign;
        let str = JSON.stringify(body);
        if (sign == md5(str + sec)) return body;
    } catch (error) { }
}

interface ProxyOptions {
    proxyTo?: string;
    manual?: boolean;
    cookieDomain?: boolean; // 清除domain
    onData?: (proxy_res: http.IncomingMessage) => Promise<any>;
    onHeader?: (proxy_res: http.IncomingMessage) => Promise<any>;
}

/**
 * @param req
 * @param res
 * @param config
 * @example proxy(req, res)
 * @example proxy(req, function(ret){
 * 		return cofs.writeFile('out', ret.data)
 * })
 */
export function proxy(req: Request, res: Response, config: ProxyOptions): Promise<http.IncomingMessage> {
    config = Object.assign({}, config);
    res._sent = true;
    return new Promise(function(resolve, reject) {
        let proxy_url = parse(req.url || "");
        if (config.proxyTo) {
            let host_url = parse(config.proxyTo);
            if (host_url.protocol) proxy_url.protocol = host_url.protocol;
            proxy_url.hostname = host_url.hostname;
            proxy_url.port = host_url.port;
            if (host_url.path) proxy_url.path = (host_url.path || "").replace(/\/$/, "") + (proxy_url.path || "");
        }
        if (req.headers) delete req.headers["host"];
        let proxy_req = (proxy_url.protocol == "https:" ? https : http).request({
            hostname: proxy_url.hostname,
            port: proxy_url.port,
            path: proxy_url.path,
            method: req.method || "GET",
            headers: req.headers
        },
            function(proxy_res) {
                if (config.onHeader) {
                    // 处理请求头
                    config.onHeader(proxy_res);
                }
                let pms;
                let res_data;
                if (config.onData) {
                    // 处理返回数据
                    pms = streamToBuffer(proxy_res)
                        .then(config.onData)
                        .then(function(data) {
                            res_data = data;
                            return proxy_res;
                        });
                } else {
                    pms = Promise.resolve(proxy_res);
                }
                if (!config.cookieDomain) {
                    // 清除 cooke domain
                    let cookies = proxy_res.headers["set-cookie"];
                    if (cookies) {
                        for (let i = 0; i < cookies.length; i++) {
                            cookies[i] = cookies[i].replace(/domain=[^;]*;/g, "");
                        }
                    }
                }
                if (!config.manual) {
                    // 自动发送数据
                    res.writeHead(proxy_res.statusCode, proxy_res.statusMessage, proxy_res.headers);
                    if (res_data != null) {
                        res.write(res_data);
                        res.end();
                    } else {
                        proxy_res.pipe(res);
                    }
                }
                resolve(pms);
            }
        );
        proxy_req.on("error", reject);
        if (req.readable) {
            req.pipe(proxy_req);
        } else if (req.body) {
            if (typeof req.body === "string" || req.body instanceof Buffer) {
                proxy_req.write(req.body);
            } else if (typeof req.body.pipe === "function") {
                req.body.pipe(proxy_req);
            } else {
                let type = req.headers["content-type"];
                if (/json/.test(type)) {
                    proxy_req.write(JSON.stringify(req.body));
                } else if (/x-www-form-urlencoded/.test(type)) {
                    proxy_req.write(stringify(req.body));
                } else {
                    proxy_req.write(req.body);
                }
            }
            proxy_req.end();
        }
    });
}

/**
 * @param {Request} req
 * @param {Response} res
 * @param {number} update_at 修改时间
 */
export function send304<T>(req: Request, res: Response, update_at: number): boolean {
    let prev = req.headers["if-modified-since"]
    let modtime = prev ? new Date(prev).getTime() : 0;
    if (modtime >= update_at) {
        res._sent = true;
        res.writeHead(304);
        res.end("Not Modified");
        return true;
    }
    return false;
}

/**
 *
 * @param {Response} res
 * @param {number} update_at 修改时间, ms
 * @param {number} [maxAge=0] 缓存时间, ms
 */
export function sendCache(res: Response, update_at: number, maxAge?: number) {
    maxAge = maxAge || 0;
    res.removeHeader("Pragma");
    res.writeHead(200, {
        "last-modified": new Date().toUTCString(),
        "cache-control": "max-age=" + Math.floor(maxAge / 1e3),
        expires: new Date(update_at + maxAge).toUTCString()
    });
}

export function sendFile304(req: Request, res: Response, filename: string, maxAge?: number) {
    return new Promise((resolve, reject) => {
        fs.stat(filename, function(err, stat) {
            let update_at = err ? 0 : stat.mtimeMs;
            if (send304(req, res, update_at))
                return resolve();
            res._sent = true;
            if (err && err.code == 'ENOENT') {
                res.writeHead(404);
                res.end("Not Found");
                return resolve();
            }
            if (err) return reject(err);
            if (/\.(js|txt|json)$/)
                res.setHeader('Content-Type', 'application/json;charset:utf-8;')
            sendCache(res, update_at, maxAge)
            fs.createReadStream(filename).pipe(res).on('close', resolve);
        })
    });
}

/**** 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 ****/
const CHARS = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
const NUMBERS = "0123456789";

/**
 * @param {number} len
 */
export function randomString(len: number) {
    var code = "";
    for (var i = 0; i < len; i++) {
        code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return code;
}

/**
 * @param {number} len
 */
export function randomNumber(len: number) {
    var code = "";
    for (var i = 0; i < len; i++) {
        code += NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length));
    }
    return code;
}

/**
 * 字串加密
 * @param {String} s
 * @returns {String}
 */
export function Encrypt(s: string): string {
    if (s.length < 2) return s;
    s = new Buffer(encodeURIComponent(s)).toString("base64");
    let s2 = s.substr(s.length - 2);
    s = s.substr(0, s.length - 2);
    let r = Math.floor(Math.random() * s.length);
    let x = r.toString(16);
    return "%" + x.length + s.substr(r) + s.substr(0, r) + x + s2.replace(/=/g, "%");
}

/**
 * 用于解码Encrypt加密的字串
 * @param {String} s
 * @returns {String}
 */
export function Decrypt(s: string): string {
    if (null == s || String != s.constructor) return null;
    if (!s || s[0] != "%") return s;
    let x = parseInt(s.substr(1, 1), 10);
    let s2 = s.substr(-2).replace(/%/g, "=");
    let r = parseInt(s.substr(-2 - x, x), 16);
    let n = s.length - 4 - x;
    s = s.substr(2 + n - r, r) + s.substr(2, n - r) + s2;
    try {
        return decodeURIComponent(new Buffer(s, "base64").toString());
    } catch (e) { }
}

/**
 * @param {string} filename
 * @returns {Promise<sharp.SharpInstance>}
 */
export function qr_decode(filename: string) {
    const sharp = require("sharp");
    let img = sharp(filename);
    return img
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info: { width, height } }) => {
            img.width = width;
            img.height = height;
            img.qr = require("./jsqr/jsQR")(data, width, height);
            return img;
        });
}

/**
 * 将1,2,3转换成1-3
 * @param {number[]} li
 */
export function shortList(li: number[]) {
    let prev = li[0];
    let res = [];
    for (let i = 1; i <= li.length; i++) {
        let item = li[i];
        if (i < li.length && prev + 1 == item) {
            if (res[res.length - 1] != "-") res.push(prev, "-");
        } else {
            res.push(prev, ",");
        }
        prev = item;
    }
    res.pop();
    return res.join("");
}

/**
 * 对函数加锁,只能同时运行其中一个
 */
export function lock<T>(name: string, fn: () => Promise<T>, timeout: number): Promise<T> {
    let cb = function() {
        try {
            if (timeout) return Promise.race([fn(), sleep(timeout)]);
            return fn();
        } catch (error) {
            return Promise.reject(error);
        }
    };
    let pms = _lock[name];
    if (pms) {
        pms = pms.then(cb, function(err) {
            cb();
            return Promise.reject(err);
        });
    } else {
        pms = cb();
    }
    // 清理内存
    pms = pms.then(function(x) {
        if (_lock[name] === pms) delete _lock[name];
        return x;
    }, function(err) {
        if (_lock[name] === pms) delete _lock[name];
        return Promise.reject(err);
    });
    return (_lock[name] = pms);
}

/**
 * @param {string|Buffer} buf
 * @param {number[]|string[]} sheetNames
 * @returns {{data:string[][],name:string}[]}
 */
export function xlsx2json(buf, sheetNames?) {
    const xlsx = require("xlsx");
    let workbook;
    if (typeof buf === "string") workbook = xlsx.readFile(buf);
    else workbook = xlsx.read(buf);
    sheetNames = sheetNames || workbook.SheetNames;
    if (!sheetNames.length) return [];
    if (typeof sheetNames[0] === "number") sheetNames = sheetNames.map(x => workbook.SheetNames[x]);
    console.log(sheetNames);
    return sheetNames.map(name => {
        //解析
        var sheet = workbook.Sheets[name]; //根据工作薄名获取工作薄

		/*
         sheet1['!ref']　获取工作薄的有效范围　'A1:C20'
         XLSX.utils.decode_range 将有效范围转为　range对象
         range: {s: {r:0, c:0}, e: {r:10, 3}}
         */
        var range = xlsx.utils.decode_range(sheet["!ref"]);
        var data = [];
        //循环获取单元格值
        for (var r = range.s.r; r <= range.e.r; ++r) {
            var row = [];
            var empty = true;
            for (var c = range.s.c; c <= range.e.c; ++c) {
                var row_value = "";
                var cell = xlsx.utils.encode_cell({ c, r }); //根据单元格地址获取单元格
                if (sheet[cell]) {
                    empty = false;
                    row_value = sheet[cell].v;
                }
                row.push(row_value);
            }
            if (!empty) data.push(row);
        }
        return { name, data };
    });
}

/**
 * @param {string} command
 * @param {{ encoding: BufferEncoding } & ExecOptions} [options]
 * @returns {Promise<{stdout:string,stderr:string}>}
 */
export function exec(command: string, options?: { encoding: BufferEncoding } & child_process.ExecOptions): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        child_process.exec(command, options, function(err, stdout, stderr) {
            if (err) return reject(err);
            resolve({ stdout, stderr });
        });
    });
}

/**
 * @returns {Promise<String>}
 */
export function stdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        let filename = require("yargs").argv._;
        let fs = require("fs");
        if (filename && fs.existsSync(filename)) {
            fs.readFile(filename, "utf8", function(err, data) {
                if (err) reject(err);
                else resolve(data);
            });
        } else {
            process.stdin.setEncoding("utf8");
            let stdin = "";
            process.stdin.on("readable", () => {
                var chunk = process.stdin.read();
                if (chunk) stdin += chunk;
            });
            process.stdin.on("end", () => {
                resolve(stdin);
            });
        }
    });
}

/**
 *
 * @param {string} v1
 * @param {string} v2
 */
export function compareVersion(v1: string, v2: string) {
    let s1 = v1.split(".").map(x => parseFloat(x));
    let s2 = v2.split(".").map(x => parseFloat(x));
    let n = Math.max(s1.length, s2.length);
    for (let i = 0; i < n; i++) {
        if (s1.length <= i) return -1;
        if (s2.length <= i) return 1;
        if (s1[i] < s2[i]) return -1;
        if (s1[i] > s2[i]) return 1;
    }
    return 0;
}

/**
 * 检查value是否与boBe一致
 * @param {*} value
 * @param {*} toBe
 * @param {{nullable:(path:string)=>boolean,extrable:(path:string)=>boolean}} [ctx]
 * @param {string} [path]
 * @returns {string[]}
 */
export function expect(value: any, toBe: any, ctx?: { nullable?: (path: string) => boolean; extrable?: (path: string) => boolean }, path?: string) {
    path = path || "ret";
    ctx = ctx || {};
    let nullable = ctx.nullable;
    let extrable = ctx.extrable;
    if (toBe === value) return [];
    if (toBe == null) {
        if (toBe === null) return [];
        if (extrable && extrable(path)) return [];
        return [`extra: ${value && value.constructor.name} @ ${path}`];
    }
    if (value == null) {
        if (nullable && nullable(path)) return [];
        return [`expect: ${toBe.constructor.name} | actual: ${value} @ ${path}`];
    }
    let errors = [];
    if (toBe instanceof Array) {
        if (!(value instanceof Array)) return [`expect: Array | actual: ${value && value.constructor.name} @ ${path}`];
        if (toBe.length) {
            for (let i = 0; i < 1; i++) {
                errors.push(...expect(value[i], toBe[0], ctx, path + "[" + i + "]"));
            }
        }
        return errors;
    }
    if (typeof toBe === "object") {
        if (typeof value != "object") return [`expect: Object | actual: ${value && value.constructor.name} @ ${path}`];
        let map = {};
        for (let k in toBe) {
            map[k] = true;
            errors.push(...expect(value[k], toBe[k], ctx, path + "." + k));
        }
        for (let k in value) {
            if (map[k]) continue;
            errors.push(...expect(value[k], undefined, ctx, path + "." + k));
        }
        return errors;
    }
    if (value.constructor.name != toBe.constructor.name) return [`expect: ${toBe.constructor.name} | actual: ${value && value.constructor.name} @ ${path}`];
    return [];
}

/**
 * 创建本地文件存储
 */
export function createLocal<T extends object>(def: T, filename: string): T {
    def = Object.assign({}, def);
    filename = path.join("config", filename);
    try {
        def = Object.assign(def, JSON.parse(readFileSync(filename, "utf8")));
    } catch (error) { }
    let pms = Promise.resolve();
    let timeout: number;
    return new Proxy(def, {
        get(target, p) {
            return target[p];
        },
        set(target, p, value) {
            if (target[p] === value) return value;
            target[p] = value;
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                pms = pms.then(_ => new Promise(resolve => writeFile(filename, JSON.stringify(target, null, 2), resolve as any)));
            });
            return value;
        }
    });
}

export function first<T>(s: T | T[]): T {
    return s instanceof Array ? s[0] : s;
}

export function CamelCase(name: String) {
    return name.replace(/^(\w)|_(\w)/g, (x0, x1, x2) => (x1 || x2).toUpperCase());
}

export function camelCase(name: String) {
    return name.replace(/_(\w)/g, (x0, x1) => x1.toUpperCase());
}

export function collect(list: any[], keys: string | string[]): any[] {
    var set = new Set();
    for (let i = 0; i < list.length; i++) {
        let row = list[i];
        for (let key of arr(keys)) {
            if (row[key] != null) set.add(row[key])
        }
    }
    var out = []
    set.forEach(function(v) {
        out.push(v)
    })
    return out;
}

export function leftJoin(a: any[], b: any[], addKey: string, aKey: string, bKey: string) {
    var map = new Map();
    for (let item of b) {
        map.set(item[bKey], item)
    }
    for (let item of a) {
        item[addKey] = map.get(item[aKey]);
    }
    return map;
}

/**
 * 
 * @param text 文本
 * @param s 目标字符串
 * @param i 开始位置
 * @param pars 被以下符号对包围时不算
 */
export function findNext(text: string, s: string, i?: number, pars?: { [left: string]: string }, ) {
    if (!pars) pars = {
        '"': '"\\',
        "'": "'\\",
        "`": "`\\",
        "{": "}",
        "(": ")",
        "[": "]",
    };
    var stack = []
    while (i < text.length) {
        var p = stack[stack.length - 1]
        var c = text[i]
        if (p) {
            if (c == p[0])
                stack.pop();
            else if (p[1])
                c == p[1] && i++;
            else {
                var v = pars[c]
                if (v) stack.push(v)
            }
        } else {
            if (text.slice(i).startsWith(s))
                break;
            var v = pars[c]
            if (v) stack.push(v)
        }
        i++;
    }
    return i;
}


/**
 * 限制并发
 */
export class AsyncLimit {
    limit: number;
    running: Function[];
    queue: Function[];
    pms: Promise<void>;
    private resolve: (value?: any) => void;
    private reject: (reason?: any) => void;
    constructor(limit: number) {
        this.limit = limit;
        this.running = []
        this.queue = []
        this.pms = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
	/**
	 * 限制并发并执行函数
	 */
    push(fn: Function) {
        if (this.running.length < this.limit) {
            let pms = fn();
            this.running.push(pms);
            pms.then(() => {
                let idx = this.running.indexOf(pms)
                this.running.splice(idx, 1)
                if (this.queue.length) this.push(this.queue.shift());
                else if (!this.running.length) this.resolve();
            }, this.reject);
        } else this.queue.push(fn);
    }
    then(onfulfilled: (value: void) => void | PromiseLike<void>, onrejected: (reason: any) => PromiseLike<never>) {
        return this.pms.then(onfulfilled, onrejected)
    }
    catch(onrejected: (reason: any) => PromiseLike<never>) {
        return this.pms.catch(onrejected)
    }
    finally(onfinally: () => void) {
        return this.pms.finally(onfinally)
    }
}

export function userHome(id: number) {
    var s = id.toString(16)
    var n = Math.max(Math.ceil(s.length / 3), 2) * 3;
    if (s.length < n) s = '0'.repeat(n - s.length) + s;
    var i = 0;
    var a = [];
    while (i < s.length) {
        a.push(s.slice(i, i + 3));
        i += 3;
    }
    return a.join('/');
}