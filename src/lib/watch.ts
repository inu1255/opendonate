import * as config from '../common/config';
import * as chokidar from 'chokidar';
import * as utils from '../common/utils';

export interface WatchOptions {
    files: string | string[]; // file, dir, glob, or array
    events: string; // 监听事件，用逗号分隔 add,change,unlink,addDir,unlinkDir,error,ready,raw
    handler: (event: string, path: string) => any;
    delay?: number; // 延时,ms
}

function watch(options: WatchOptions) {
    let wacher = chokidar.watch(options.files);
    let handle: NodeJS.Timeout;
    for (let event of options.events.split(',')) {
        wacher.on(event, function(path) {
            if (handle) clearTimeout(handle);
            if (options.delay) {
                handle = setTimeout(function() {
                    console.log(event, path);
                    options.handler(event, path);
                }, options.delay);
            }
        })
    }
}

if (config.dev) {
    watch({
        files: 'greendb.js',
        events: 'change',
        handler: async function(path) {
            console.log('npm run ts')
            await utils.exec('npm run ts').catch(console.error);
            utils.exec(`osascript -e 'display notification "已生成数据库ts定义" with title "greendb" subtitle "npm run ts"'`)
        },
        delay: 500,
    });
    watch({
        files: config.apiDir,
        events: 'add,unlink,change',
        handler: async function(path) {
            console.log('npm run apar')
            await utils.exec('npm run apar').catch(console.error);
            utils.exec(`osascript -e 'display notification "已生成接口ts定义" with title "greendb" subtitle "npm run apar"'`)
        },
        delay: 500,
    });
}