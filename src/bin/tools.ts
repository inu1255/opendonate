import { argv } from 'yargs';
import * as readline from 'readline';
import db from '../common/db';
import * as fs from 'fs-extra'
import * as path from 'path';
import * as utils from '../common/utils';
import * as config from '../common/config';

declare module "express-serve-static-core" {
    interface Request {
        ua: string;
    }
}

var cmdStr = "npx ts-node tools.ts -q";
function arg(label: string, key?: string, def?: string): Promise<string> {
    return new Promise(function(resolve, reject) {
        let v = argv[key];
        if (v == null) v = def;
        if (argv.q && v != null) { // 安静模式，不询问参数
            v = (v || "") + "";
            cmdStr += ` --${key}=${JSON.stringify(v)}`;
            return resolve(v);
        }
        let rd = readline.createInterface(process.stdin, process.stdout);
        rd.question(`${label}:${v == null ? `` : `(默认: ${v})`}\n`, function(value) {
            v = (value || v || "") + "";
            cmdStr += ` --${key}=${JSON.stringify(v)}`;
            resolve(v);
            rd.close();
        });
    }).then((x: string) => x.trim());
}

function log() {
    if (!cmdStr) return;
    console.log("======================");
    console.log(cmdStr);
    console.log("======================");
    cmdStr = "";
}

let cmds = [];
cmds.push({
    name: "订单补漏",
    async handler() {
        let begin = await arg('开始时间', 'begin', '0');
    }
})

async function main() {
    for (let i = 0; i < cmds.length; i++) {
        var row = cmds[i];
        console.log(`${i + 1}: ${row.name}`);
    }
    console.log('-----------------------');
    let i = await arg('请选择功能(输入对应数字)', 'e');
    var cmd = cmds[+i - 1];
    if (!cmd) throw '功能不存在';
    await cmd.handler();
    log()
}

main.apply(null, argv._).then(function() {
    console.log("end");
    process.exit();
}).catch(function(err) {
    console.log(err);
    console.log("err end");
    process.exit();
});
