#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs-extra';
import { GreenApi, GreenCheck } from '../common/green';
import * as utils from '../common/utils';
// console.log(process.argv)
let cmd = process.argv[2]; // 命令
let df_file = 'greenjs.js'; // 定义文件路径
let user = ""; // mysql用户名
let password = ""; // mysql密码
let host = "";
let visiable = false; // 显示sql
let force = false; // 强制操作
let apiDir = ''; // 接口定义目录 user: 会生成user/add.json 等  user/foo 会生成 user/foo_add.json 等
let input = ""; // 输入文件夹
let output = ''; // 输出文件夹
for (let i = 3; i < process.argv.length; i++) {
    let s = process.argv[i];
    let s2 = s.slice(0, 2)
    if (s2 == "-u") {
        user = s.length > 2 ? s.slice(2) : process.argv[++i];
    } else if (s2 == "-p") {
        password = s.length > 2 ? s.slice(2) : process.argv[++i];
    } else if (s2 == "-h") {
        host = s.length > 2 ? s.slice(2) : process.argv[++i];
    } else if (s2 == "-f") {
        df_file = s.length > 2 ? s.slice(2) : process.argv[++i];
    } else if (s == "--force" || s == "-force") {
        force = true;
    } else if (s == "--api" || s == "-api") {
        apiDir = process.argv[++i];
    } else if (!input) {
        input = s;
    } else if (!output) {
        output = s;
    }
}

/**
 * 遍历文件夹
 * @param {string} dir 
 * @param {(filename:string,stat:fs.Stats)=>Promise<boolean>|boolean} fn 
 */
export function walk(dir: string, fn: (filename: string, stat: fs.Stats) => Promise<boolean> | boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function(err, filenames) {
            if (err) reject(err);
            else {
                let task = Promise.resolve(false);
                for (let filename of filenames) {
                    filename = dir + "/" + filename;
                    task = task.then(x => new Promise((resolve, reject) => {
                        fs.stat(filename, function(err, stat) {
                            if (err) reject(err);
                            else if (stat.isDirectory()) {
                                resolve(Promise.resolve(fn(filename, stat)).then(x => x || exports.walk(filename, fn)));
                            } else {
                                resolve(fn(filename, stat));
                            }
                        });
                    }));
                }
                resolve(task);
            }
        });
    });
};

let insomnia = {
    "_type": "export",
    "__export_format": 4,
    "__export_date": "2019-08-30T00:19:23.734Z",
    "__export_source": "insomnia.desktop.app:v6.6.2",
    "resources": []
}


let cmds = {
    async insomnia() {
        let dir = input;
        if (!output) return `greenjs insomnia apidir name`
        if (!output.startsWith('/')) output = '/opt/html/' + output
        let wrkID = path.basename(output);
        let wrk = 'wrk_' + wrkID;
        let fld_api = "fld_" + wrkID;
        insomnia.resources.push({
            "_id": wrk,
            "description": "",
            "name": wrkID,
            "_type": "workspace"
        }, {
                "_id": "env_" + wrkID,
                "color": "green",
                "data": { "base_url": "http://localhost:3000" },
                "dataPropertyOrder": { "&": ["base_url"] },
                "name": "默认环境变量",
                "parentId": wrk,
                "_type": "environment"
            }, {
                "_id": fld_api,
                "description": "",
                "environment": {},
                "environmentPropertyOrder": null,
                "name": "api",
                "parentId": wrk,
                "_type": "request_group"
            });
        await walk(dir, async function(filename, stat) {
            let url = filename.slice(dir.length)
            if (url[0] != '/') url = '/' + url;
            if (stat.isFile() && filename.endsWith('.json')) {
                url = url.slice(0, -5)
                let define: GreenApi
                try {
                    define = eval('(' + await fs.readFile(filename, 'utf8') + ')')
                } catch (e) {
                    console.error(filename, e);
                    return;
                }
                let api = {
                    "_id": "req_" + wrkID + url,
                    "parentId": fld_api,
                    "authentication": {},
                    "body": {
                        "mimeType": "application/x-www-form-urlencoded",
                        "params": []
                    },
                    "description": "",
                    "headers": [{ "name": "Content-Type", "value": "application/x-www-form-urlencoded" }],
                    "method": "POST",
                    "name": "",
                    "parameters": [],
                    "url": "",
                    "_type": "request"
                }
                api.url = '{{ base_url  }}' + url;
                api.name = url;
                api.method = (define.method + '').toLowerCase() == 'get' ? 'GET' : 'POST';
                api.description = '# ' + define.name + '\n';
                if (define.rem) api.description += '\n' + define.rem + '\n';
                if (define.params) {
                    api.description = '## 参数\n';
                    api.description += `|参数名|参数类型|默认值|限制|必填|说明|\n`
                    api.description += `|-|-|-|-|-|-|\n`
                    let params = (define.method + '').toLowerCase() == 'get' ? api.parameters : api.body.params;
                    for (let k in define.params) {
                        let v = define.params[k]
                        params.push({
                            name: k,
                            value: v.def || '',
                            disabled: !v.need,
                        });
                        var limit = ''
                        if (v.enum) limit += ' 枚举:`' + JSON.stringify(v.enum) + '`';
                        if (v.range) limit += ' 范围:`' + (typeof v.range == "string" ? v.range : JSON.stringify(v.range)) + '`'
                        if (v.len) limit += (v.type == 'file' ? '大小`' : ' 长度:`') + (typeof v.len == "string" ? v.len : JSON.stringify(v.len)) + '`'
                        if (v.reg) limit += ' 正则:`' + v.reg + '`';
                        api.description += `|${k}|${v.type || ''}|${v.def || ''}|${limit}|${v.need ? '*' : ''}|${(v.lbl || '') + (v.rem || '')}|\n`
                    }
                    api.description += '\n'
                }
                if (define.grant) {
                    api.description += '## 权限\n';
                    api.description += '``` javascript\n'
                    api.description += define.grant;
                    api.description += '```\n'
                }
                if (define.pretreat) {
                    api.description += '## 预处理\n';
                    api.description += '``` javascript\n'
                    api.description += define.pretreat;
                    api.description += '```\n'
                }
                if (define.check) {
                    api.description += '## 参数检查\n';
                    api.description += `|规则|说明|返回值|\n`
                    api.description += `|-|-|\n`
                    for (let check of utils.arr(define.check as any) as GreenCheck[]) {
                        if (typeof check === "string") {
                            check = { R: check, M: '', no: 400 }
                        }
                        api.description += `|${check.R.replace(/\|/g, '&#x7c;')}|${check.M}|${check.no || 400}|\n`
                    }
                    api.description += '\n'
                }
                if (define.error) {
                    api.description += '## 错误代码\n';
                    api.description += `|返回值|错误原因|\n`
                    api.description += `|-|-|\n`
                    for (let k in define.error) {
                        let v = define.error[k]
                        api.description += `|${k}|${v}|\n`
                    }
                    api.description += '\n'
                }
                if (define.ret) {
                    api.description += '## 示例返回\n';
                    if (define.ret.no) {
                        api.description += '``` javascript\n'
                        api.description += JSON.stringify(define.ret, null, 2);
                        api.description += '```\n'
                    } else {
                        for (let k in define.ret) {
                            let v = define.ret[k]
                            api.description += `### ${k}\n`;
                            api.description += '``` javascript\n'
                            api.description += JSON.stringify(v, null, 2);
                            api.description += '```\n'
                        }
                    }
                }
                insomnia.resources.push(api);
            }
            return false;
        })
        await fs.writeJSON((output || 'insomnia') + '.json', insomnia)
        console.log(`https://insomnia.rest/run/?label=${wrkID}&uri=${encodeURIComponent(`http://localhost/${wrkID}.json`)}`)
    },
    async apar() {
        let dir = input;
        let s = 'declare namespace apar {\n';
        const TYPES = {
            "number": "number",
            "int": "number",
            "float": "number",
            "json": "any",
            "array": "any[]",
            "file": "FormFile",
        };
        await walk(dir, async function(filename, stat) {
            if (stat.isFile() && filename.endsWith('.json')) {
                let url = filename.slice(dir.length)
                if (url[0] == '/') url = url.slice(1);
                url = url.slice(0, -5)
                let define: GreenApi = eval('(' + await fs.readFile(filename, 'utf8') + ')');
                s += `interface ${utils.CamelCase(url.replace(/\//g, '_'))}Body{\n\t[key:string]:any;\n`
                for (let key in define.params) {
                    let param = define.params[key]
                    let type: string;
                    if (param.enum) type = typeof param.enum[0];
                    else if (param.opts) type = "number";
                    else type = TYPES[param.type] || "string";
                    let def = param.def == null ? "" : " 默认:" + param.def;
                    if (!param.need) {
                        key = `${key}?`;
                    }
                    s += `\t${key}:${type}; // ${param.rem || param.lbl}${def}\n`;
                }
                s += `}\n`;
            }
            return false;
        })
        s += '}'
        await fs.writeFile((output || 'typings/apar/index.d.ts'), s)
    },
    usage() {
        console.log(`usage:
    生成接口调试配置
        greenjs insomnia apidir
    生成接口参数定义
        greenjs apar apidir
		`)
    }
}

cmds[cmd] ? cmds[cmd]() : cmds.usage();