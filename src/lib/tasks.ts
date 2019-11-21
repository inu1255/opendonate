import { taskLogger } from "../common/log";
// const store = utils.createLocal({
// }, '.materail_crawer');

const isMain = require.main == module;
function addTask(name: string, ms: number, fn: Function) {
    if (isMain) return;
    var call = async function() {
        var beg = +new Date();
        var time_used = 0;
        var err;
        try {
            await fn();
        } catch (e) {
            err = e;
            taskLogger.error(e);
        }
        var cost = time_used = +new Date() - beg;
        if (err) taskLogger.error(`结束任务: [${name}] 用时${cost}ms`);
        else if (cost > 30e3) taskLogger.info(`结束任务: [${name}] 用时${cost}ms`);
        setTimeout(call, Math.max(ms - time_used, 1e3));
    }
    call();
}
