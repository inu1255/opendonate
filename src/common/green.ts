import { Router, RequestHandler } from "express";
import fs = require("fs");
import path = require("path");
import { devLogger } from "../common/log";
import * as config from "../common/config";
import utils = require("../common/utils");
import { Fields, Files } from "formidable";

declare module "express-serve-static-core" {
    interface Request {
        fields: Fields;
        files: Files;
    }
    interface Response {
        err: (no: number, msg?: string) => void;
        ok: (data: any) => void;
        no: number; // 返回码
        _sent: boolean; // 是否已经返回
    }
}

export interface GreenCheck {
    M: string;
    R: string;
    no: number;
}

function instanceOfCheckExp(obj: any): obj is GreenCheck {
    return obj && obj["R"] != null;
}

type GreenChecks = string | GreenCheck | Array<string | GreenCheck> | { [msg: string]: string };
type GreenMethod = "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch" | "move" | "copy" | "link" | "unlink" | "wrapped";

export interface GreenParam {
    lbl?: string; // 参数名
    rem?: string; // 参数注释
    need?: boolean | string | string[]; // 是否必传
    def?: any; // 默认值
    reg?: string; // 正则表达式
    type?: "int" | "float" | "number" | "json" | "array" | "str" | "file"; // 参数类型
    enum?: Array<any>; // 参数枚举值
    opts?: Array<any>; // 参数对应含义
    len?: [number, number] | number; // 长度限制 [6,32] 6 [0,100]
    range?: [number, number] | number; // 范围限制 [6,32] 6 [0,100]
}

export interface GreenApi {
    name: string; // 接口名称
    rem?: string; // 接口说明
    url: string; // 接口路径
    alias: string | string[]; // 接口路径别名
    method: GreenMethod | GreenMethod[]; // 接口方法
    freq: number; // 每个IP多少毫秒之内只能调用一次
    additional: boolean; // 允许额外的参数
    params: { [key: string]: GreenParam }; // 接口参数
    pretreat: string; // 预处理
    grant: GreenChecks; // 权限
    check: GreenChecks; // 参数检查
    error: { [key: string]: string }; // 错误类型
    ret: any; // 返回值类型
}

function walkFiles(dir: string, fn: (filename: string) => void) {
    const files = fs.readdirSync(dir);
    for (let filename of files) {
        filename = path.join(dir, filename);
        let stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            walkFiles(filename, fn);
        } else {
            fn(filename);
        }
    }
}

/**
 * 从body中清除字段
 * @param keys 字段列表
 */
function paramClean(keys: string[]): RequestHandler {
    const km = {};
    for (let k of keys) {
        km[k] = true;
    }
    return function(req, res, next) {
        for (let k in req.body) {
            if (!km[k]) {
                delete req.body[k];
            }
        }
        next();
    };
}

/**
 * 生成参数验证函数
 * @param k 参数key
 * @param param
 */
function paramCheck(k: string, param: GreenParam): RequestHandler {
    let { need, def, enum: enu, type: typ, opts } = param;
    if (need || def || param.len || param.range || param.reg || enu || typ || opts) {
        let lbl = param.lbl || param.rem;
        const name = lbl || k;
        let len = param.len ? (Array.isArray(param.len) ? param.len : [param.len]) : null;
        let range = param.range ? (Array.isArray(param.range) ? param.range : [param.range]) : null;
        let reg: RegExp;
        if (param.reg) {
            try {
                reg = new RegExp(param.reg);
            } catch (error) {
                devLogger.error(`parse param.${k}.reg error: ${error}`);
            }
        }

        function checkFn(body: { [x: string]: any }) {
            let value = body[k];
            if (def != null && value == null) {
                body[k] = def;
                return;
            }
            if (value == null || value === "") {
                if (need instanceof Array) {
                    for (let i = 0; i < need.length; i++) {
                        if (body[need[i]] == null)
                            return `${name}是必填项`;
                    }
                }
                else if (typeof need === "string" ? body[need] == null : need)
                    return `${name}是必填项`;
            } else {
                if (typ && value != null) {
                    switch (typ) {
                        case "int":
                            if (value == 'true') value = 1;
                            else if (value == 'false') value = 0;
                            value = +value;
                            if (isNaN(value)) return `${name}必须是整数`;
                            body[k] = Math.floor(value);
                            break;
                        case "float":
                            value = +value;
                            if (isNaN(value)) return `${name}必须是数字`;
                            body[k] = value;
                            break;
                        case "array":
                            if (typeof value !== "object") {
                                try {
                                    value = body[k] = JSON.parse(value);
                                } catch (error) {
                                    return `${name}类型必须是array`;
                                }
                            }
                            if (!(value instanceof Array)) return `${name}必须是数组`;
                            break;
                        case "str":
                            if (value && typeof value !== "string") {
                                body[k] = JSON.stringify(value);
                            }
                            break;
                        case "json":
                            if (typeof value !== "object") {
                                try {
                                    value = body[k] = JSON.parse(value);
                                } catch (error) {
                                    return `${name}类型必须是json`;
                                }
                            }
                            break;
                        case "file":
                            if (value.constructor.name != "File") {
                                return `${name}类型必须是file`;
                            }
                            break;
                        case "number":
                            if (typeof value !== typ) return `${name}类型必须是${typ}`;
                    }
                }
                if (len && value != null) {
                    if (value.length < len[0]) {
                        return `${name}长度需大于${len[0]}`;
                    }
                    if (len[1] > 0 && value.length > len[1]) {
                        return `${name}长度需小于${len[1]}`;
                    }
                }
                if (range && value != null) {
                    if (value < range[0]) {
                        return `${name}需大于${range[0]}`;
                    }
                    if (typeof range[1] === "number" && value > range[1]) {
                        return `${name}需小于${range[1]}`;
                    }
                }
                if (reg && !reg.test(value)) {
                    return `${name}格式不正确`;
                }
                if (enu && enu.indexOf(body[k]) < 0) {
                    return `${name}的值不能为${value}`;
                }
                if (opts && (value < 0 || value > opts.length)) {
                    return `${name}的值不在[0,${opts.length}]中`;
                }
            }
        }
        return function(req, res, next) {
            let msg = checkFn(req.body);
            if (msg) return res.err(400, msg);
            next();
        };
    }
}

/**
 * 生成预处理函数
 * @param condition 条件表达式 $U: 登录用户 $S: 当前会话 $B: POST参数
 */
function pretreatMake(condition: string): RequestHandler {
    condition = condition.replace(/{([USB])}/g, "$$$1").replace(/{}/g, "$$B");
    return function(req, res, next) {
        try {
            new Function("$B", "$U", "$S", `${condition}`)(req.body, req.session.user, req.session);
        } catch (error) {
            devLogger.error(`(${condition})`, error);
            return res.err(500, "预处理失败");
        }
        next();
    };
}

/**
 * 生成条件检查函数
 * @param condition 条件表达式 $U: 登录用户 $S: 当前会话 $B: POST参数
 * @param msg 错误信息
 */
function conditionCheck(condition: string, msg: string, no: number): RequestHandler {
    condition = condition.replace(/{([USB])}/g, "$$$1").replace(/{}/g, "$$B");
    return function(req, res, next) {
        if (condition == "$U" && !req.session.user) {
            return res.err(401);
        }
        try {
            if (!new Function("$B", "$U", "$S", `return (${condition})`)(req.body, req.session.user, req.session)) {
                return res.err(no, msg);
            }
        } catch (error) {
            devLogger.error(`(${condition})`, error);
            return res.err(no, msg);
        }
        next();
    };
}

/**
 * 生成检查中间件
 * @param check 检查规则
 * @param no 返回码
 */
function conditionChecks(check: GreenChecks, no: number): RequestHandler[] {
    let checks = [];
    if (check instanceof Array) {
        for (let item of check) {
            if (instanceOfCheckExp(item)) {
                checks.push(conditionCheck(item.R, item.M, item.no || no));
            } else {
                checks.push(conditionCheck(item, "", no));
            }
        }
    } else if (instanceOfCheckExp(check)) {
        checks.push(conditionCheck(check.R, check.M, check.no || no));
    } else if (typeof check === "string") {
        checks.push(conditionCheck(check, "", no));
    } else if (typeof check === "object") {
        for (let k in check) {
            let v = check[k];
            checks.push(conditionCheck(k, v, no));
        }
    }
    return checks;
}

/**
 * 生成 接口失败时返回数据的函数
 * @param error 错误码对应的错误信息
 */
function makeSendErr(error: { [x: string]: string }) {
    error = Object.assign({}, config.error, error);
    return function(no: number, msg: string) {
        this._sent = true;
        this.json({ no, msg: msg || error[no] || "未知错误" });
    };
}

/**
 * 生成 接口成功时返回数据的函数
 * @param api
 */
function makeSendOk(api: GreenApi, filename?: string) {
    if (api)
        return function(data) {
            this._sent = true;
            if (typeof data === "number") return this.err(data);
            if (!data || !data.no) data = { no: 200, data };
            this.no = data.no;
            this.json(data);
            if (!api.ret)
                console.log(JSON.stringify(data, null, 2));
            if (0 && config.dev && api.ret) {
                let errors = utils.expect(data, api.ret);
                if (errors.length) {
                    devLogger.error(`数据与定义不一致: ${filename}`);
                    for (let err of errors) {
                        devLogger.warn(err);
                    }
                    console.log(JSON.stringify(data, null, 2));
                }
            }
        };
    return function(data) {
        this._sent = true;
        if (typeof data === "number") return this.err(data);
        if (!data || !data.no) data = { no: 200, data };
        this.no = data.no;
        this.json(data);
    };
}

/**
 * 从文件中获取接口定义
 * @param filename 接口定义文件名
 */
function readApi(filename: string): GreenApi {
    let text = fs.readFileSync(filename, "utf8");
    let data;
    try {
        data = new Function('return ' + text)();
    } catch (error) {
        devLogger.warn("api定义错误", filename);
        return;
    }
    if (!data.name) {
        devLogger.warn("api定义缺少name", filename);
        return;
    }
    if (!data.method) {
        devLogger.warn("api定义缺少method", filename);
        return;
    }
    if (data.method == "*") data.method = "all";
    else data.method = data.method.toLowerCase();
    return data;
}

/**
 * 通过api.json文件获取对应的 接口实现函数
 * @param filename 模块路径
 * @param fnKey 函数键
 */
function getHander(filename: string, fnKey: string): RequestHandler {
    var handler: RequestHandler;
    try {
        let mod = require(filename);
        // console.log(Object.keys(mod), key);
        if (mod && typeof mod[fnKey] === "function") handler = mod[fnKey].bind(mod);
    } catch (error) {
        devLogger.error(error);
    }
    return handler;
}

class ApiBuilder {
    private router: Router;
    private mountpath: string;
    constructor(mountpath?: string) {
        this.mountpath = mountpath;
        this.router = Router();
    }
    walk(apiDir: string, routeDir: string) {
        if (apiDir.startsWith(".")) apiDir = path.join(apiDir);
        if (routeDir.startsWith(".")) routeDir = path.join(routeDir);
        walkFiles(apiDir, filename => {
            if (filename.endsWith(".json")) {
                const data = readApi(filename);
                if (!data) return;
                // /person/login
                let modulePath = filename.slice(apiDir.length, -5);
                // ["","person","login"]
                let ss = modulePath.split(path.sep);
                // login
                let key = ss[ss.length - 1].replace(/[-_]\w/g, a => a[1].toUpperCase());
                // "/person"
                modulePath = ss.slice(0, ss.length - 1).join("/");
                // api/person
                modulePath = path.join(routeDir, modulePath);
                if (!/^(\.|\/)/.test(routeDir)) modulePath = "./" + modulePath;
                if (!data.url) data.url = filename.slice(apiDir.length, -5).replace(/\\/g, "/");
                this.routeApi(data, getHander(modulePath, key), filename);
            }
        });
        return this;
    }
	/**
	 * 通过json接口文件生成接口并路由
	 * @param api api定义
	 * @param handler 接口实现函数
	 * @param filename 接口定义文件
	 */
    routeApi(data: GreenApi, handler: RequestHandler, filename?: string) {
        let methods = data.method instanceof Array ? data.method : data.method.split("|");
        for (let m of methods) {
            if (["get", "head", "post", "put", "delete", "connect", "options", "trace", "patch", "move", "copy", "link", "unlink", "wrapped"].indexOf(m) < 0) {
                devLogger.warn("api定义不支持的method", filename, m);
                return;
            }
        }
        // 接口定义没问题
        // 构造参数检查函数
        let checks: RequestHandler[] = [];
        if (data.freq) {
            // 访问频率控制
            let ipMap = {};
            checks.push(function(req, res, next) {
                var now = Date.now();
                var prev = ipMap[req.ip];
                if (prev && prev + data.freq > now) return res.err(500, "操作太频繁");
                ipMap[req.ip] = now;
                next();
            });
        }
        if (data.params) {
            // 清除接口定义中不存在的参数
            if (!data.additional)
                checks.push(paramClean(Object.keys(data.params)));
            // 参数检查
            for (let k in data.params) {
                let v = data.params[k];
                let checkFn = paramCheck(k, v);
                if (checkFn) {
                    checks.push(checkFn);
                }
            }
        }
        if (data.grant) {
            // 权限检查
            checks.push(...conditionChecks(data.grant, 403));
        }
        if (data.pretreat) {
            // 预处理
            checks.push(pretreatMake(data.pretreat));
        }
        if (data.check) {
            // check检查
            checks.push(...conditionChecks(data.check, 400));
        }
        const sendErr = makeSendErr(data.error);
        const sendOk = makeSendOk(config.dev ? data : null, filename);
        // 构造接口实现函数
        let uri = data.url;
        if (!handler) {
            devLogger.warn("define", data.method, uri, "---> Mock数据");
            handler = function(req, res) {
                console.log(data.ret);
                res._sent = true;
                res.json(data.ret || { no: 200 });
            };
        }
        let args: Array<string | RequestHandler> = [this.mountpath ? this.mountpath + uri : uri];
        // 初始化
        args.push(function(req, res, next) {
            res.err = sendErr;
            res.ok = sendOk;
            req.body = Object.assign({}, req.params, req.query, req.body, req.fields, req.files);
            next();
        });
        // 参数、权限检查
        for (let fn of checks) {
            args.push(fn);
        }
        // 开始路由
        args.push(function(req, res, next) {
            let ret;
            try {
                if (handler.constructor.name === "GeneratorFunction") {
                    ret = require('co')(handler(req, res, next));
                } else {
                    ret = handler(req, res, next);
                }
            } catch (err) {
                devLogger.error(err);
                if (!res.finished && !res._sent) {
                    if (config.dev) res.err(500, err + "");
                    else res.err(500, "系统错误");
                }
                return;
            }
            // 返回 promise 则 then
            if (ret && typeof ret.then === "function") {
                ret.then(
                    function(data) {
                        if (!res.finished && !res._sent) res.ok(data);
                    },
                    function(err) {
                        if (typeof err === "number")
                            return res.err(err);
                        devLogger.error(err);
                        if (!res.finished && !res._sent) {
                            if (config.dev) res.err(500, err + "");
                            else res.err(500, "系统错误");
                        }
                    }
                );
            } else if (!res.finished && !res._sent) res.ok(ret);
        });
        for (let method of methods) {
            devLogger.debug("define", method, args[0]);
            this.router[method].apply(this.router, args);
            if (data.alias) {
                for (let uri_alias of utils.arr(data.alias)) {
                    if (!uri_alias.startsWith('/')) {
                        uri_alias = path.join(uri, uri_alias);
                        uri_alias = this.mountpath ? this.mountpath + uri_alias : uri_alias
                    }
                    args[0] = uri_alias;
                    devLogger.debug("define", method, args[0]);
                    this.router[method].apply(this.router, args);
                }
            }
        }
        return this;
    }
    build() {
        return this.router;
    }
}

export function apiBuilder(mountpath: string) {
    return new ApiBuilder(mountpath);
}
