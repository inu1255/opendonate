import router from '../router';

let userAgent = window.navigator.userAgent.toLowerCase();
let utils = {
    env: {
        ua: userAgent,
        wx: /micromessenger/.test(userAgent),
        mb: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent),
    }, // userAgent
    os(ua) {
        ua = ua || userAgent;
        let oss = {
            微信: /micromessenger/i,
            WP: /windows phone/i,
            Mac: /os x/i,
            Android: /Android/i,
            Linux: /linux/i,
            iPhone: /\(iPhone.*os (\d+)[._](\d+)/i,
            iPad: /\(iPad.*os (\d+)[._](\d+)/i,
            iOS: /ios/i,
            ChromeOS: /cros/i,
            Windows10: /windows nt 10\.0/i,
            Windows8: /windows nt 6\.[23]/i,
            Windows7: /windows nt 6\.1/i,
            WindowsVista: /windows nt 6\.0/i,
            Windows2003: /windows nt 5\.2/i,
            WindowsXP: /windows nt 5\.1/i,
            Windows2000: /windows nt 5\.0/i,
            Windows: /windows nt/i,
            Wii: /wii/i,
            PS3: /playstation 3/i,
            PSP: /playstation portable/i,
            Bada: /Bada\/(\d+)\.(\d+)/i,
            Curl: /curl\/(\d+)\.(\d+)\.(\d+)/i
        };
        for (let k in oss) {
            let v = oss[k];
            if (v.test(ua)) return k;
        }
        return '未知';
    },
    replace(data) {
        let query = {};
        for (let k in data) {
            let v = data[k];
            query[k] = encodeURIComponent(typeof v === "string" ? v : JSON.stringify(v));
        }
        router.replace({ query });
    },
    /**
     * 单向绑定query参数
     * @template T
     * @param {T} params 
     * @param {boolean} [auto] 是否自动更新query
     * @returns {T}
     */
    query(params, auto) {
        let data = {};
        let flag = false;
        let timeout;
        let query = Object.assign({}, router.currentRoute.query);
        for (let k in params) {
            let value = params[k];
            Object.defineProperty(data, k, {
                configurable: true,
                enumerable: true,
                get() {
                    let tmp = query[k];
                    try {
                        tmp = decodeURIComponent(tmp);
                        tmp = JSON.parse(tmp);
                    } catch (err) {}
                    return tmp;
                },
                set(v) {
                    let tmp = encodeURIComponent(typeof v === "string" ? v : JSON.stringify(v));
                    if (query[k] != tmp) {
                        query[k] = tmp;
                        if (auto) {
                            if (timeout) clearTimeout(timeout);
                            timeout = setTimeout(function() {
                                router.replace({ query });
                            });
                        }
                    }
                }
            });
            let tmp = query[k];
            if (tmp == null) {
                query[k] = encodeURIComponent(typeof value === "string" ? value : JSON.stringify(value));
                flag = true;
            } else {
                query[k] = tmp;
            }
        }
        if (auto && flag) router.replace({ query });
        return data;
    },
    /**
     * node 是否是 parent 的后代
     * @param {HTMLElement} node 
     * @param {HTMLElement} parent 
     */
    hasParent(node, parent) {
        while (node) {
            if (node.parentElement == parent) return true;
            node = node.parentElement;
        }
        return false;
    },
    /**
     * 获取文件
     * @param {string} accept 'image/png'
     * @param {boolean} multiple 
     * @returns {Promise<File|FileList>}
     */
    pick(accept, multiple) {
        return new Promise((resolve, reject) => {
            let input = document.createElement('input');
            input.type = 'file';
            input.multiple = multiple;
            input.accept = accept || '*';
            input.onchange = function(e) {
                resolve(multiple ? e.target.files : e.target.files[0]);
            };
            input.click();
        });
    },
    /**
     * 清除空数据，用于发起请求
     * @param {any} value 
     */
    clearNull(value) {
        if (value instanceof Date)
            return value.getTime();
        if (typeof value === "object" && !(value instanceof Array)) {
            let data = {};
            for (let k in value) {
                if (value[k] != null) {
                    data[k] = utils.clearNull(value[k]);
                }
            }
            return data;
        }
        return value;
    },
    /**
     * 复制一个去掉keys的body对象
     * @param {Object} body 
     * @param {string[]|{}} keys 
     */
    clearKeys(body, keys) {
        let data = {};
        if (keys instanceof Array) { // 清除keys中的字段
            Object.assign(data, body);
            for (let key of keys) {
                delete data[key];
            }
        } else { // 清除与keys值相同的字段
            for (let k in body) {
                let v = body[k];
                if (keys[k] != v)
                    data[k] = v;
            }
        }
        return data;
    },
    /**
     * 深度优先遍历
     * @param {any} data 
     * @param {{(node:any,ctx:{key:string,parent:this})=>boolean}} fn 
     * @param {string} key 
     * @param {{key:string,parent:this,node:any}} ctx 
     */
    dfs(data, fn, key, ctx) {
        if (!data) return;
        ctx = ctx || {};
        if (data instanceof Array) {
            for (var i = 0; i < data.length; i++)
                utils.dfs(data[i], fn, key, { key: i, parent: ctx.parent });
            return;
        }
        ctx.node = data;
        if (fn(data, ctx)) return;
        if (key) utils.dfs(data[key], fn, key, { key: key, parent: ctx });
        else if (typeof data === "object")
            for (var k in data)
                utils.dfs(data[k], fn, key, { key: k, parent: ctx });
    },
    /**
     * 是否邮箱
     * @param {string} val 
     */
    isEmail(val) {
        return /^[\w-]+@[\w-]+(.[\w-]+)+$/.test(val);
    },
    /**
     * 是否手机
     * @param {string} val 
     */
    isTel(val) {
        return /^1\d{10}$/.test(val);
    },
    isUrl(val) {
        return /^https?:\/\/[^\.]+\.[^\.]+/.test(val);
    },
    /**
     * 验证规则
     */
    RULES: {
        need: { validate: val => val, message: '必须填写' },
        tel: { validate: val => !val || utils.isTel(val), message: '手机格式不正确' },
        email: { validate: val => !val || utils.isEmail(val), message: '邮箱格式不正确' },
        passwd: { validate: val => val.length >= 6 && val.length <= 32, message: '密码长度大于6小于32' },
        url: { validate: val => !val || utils.isUrl(val), message: '网址格式不正确' },
    },
    /**
     * 构建验证规则
     * @param  {...string} args 
     * @return {{validate:(val:any)=>boolean,message:string}[]}
     */
    rule() {
        let s = [];
        for (let i = 0; i < arguments.length; i++) {
            let r = utils.RULES[arguments[i]];
            if (r instanceof Array) s.push.apply(s, r);
            else if (r) s.push(r);
        }
        return s;
    },
    loading(name = 'loading') {
        return function(target, key, descriptor) {
            const method = descriptor.value;
            descriptor.value = function() {
                if (this[name]) return;
                this[name] = true;
                let ret = method.apply(this, arguments);
                if (ret && typeof ret.then === "function") {
                    return ret.then(data => {
                        this[name] = false;
                        return data;
                    }, err => {
                        this[name] = false;
                        return Promise.reject(err);
                    });
                }
                return ret;
            };
            return descriptor;
        };
    },
    POW_VISIBLE: 0x01, //节点可见
    POW_READ: 0x02, //查看
    POW_DOWN: 0x04, //附件下载
    POW_REPLY: 0x08, //回复
    POW_POST: 0x10, //发布
    POW_CHANGE: 0x20, //修改
    POW_ADD: 0x40, //创建子节点
    POW_EDIT: 0x80, //修改权限
    POW_ADM: 0x100, // 管理(删除节点+设定用户对本节点的权限)
    POW2READ: 0x03, //查看及以下
    POW2DOWN: 0x07, //下载及以下
    POW2REPLY: 0x0F, //回复及以下
    POW2POST: 0x1F, //发布及以下
    POW2CHANGE: 0x3F, //修改及以下
    POW2ADD: 0x7F, //创建及以下
    POW2EDIT: 0xFF, //修改及以下
    POW2ADM: 0x1FF, //管理及以下
    POW_ALL: 0x1FF, //所有权限
    powLabel(pow) {
        let s = [];
        if (pow & utils.POW_VISIBLE) s.push("可见");
        if (pow & utils.POW_READ) s.push("查看");
        if (pow & utils.POW_DOWN) s.push("下载");
        if (pow & utils.POW_REPLY) s.push("回复");
        if (pow & utils.POW_POST) s.push("发布");
        if (pow & utils.POW_CHANGE) s.push("编辑");
        if (pow & utils.POW_ADD) s.push("创建");
        if (pow & utils.POW_EDIT) s.push("修改");
        if (pow & utils.POW_ADM) s.push("管理");
        return s.join("+");
    },
    powKeys(pow) {
        let s = [];
        if (pow & utils.POW_VISIBLE) s.push(utils.POW_VISIBLE);
        if (pow & utils.POW_READ) s.push(utils.POW_READ);
        if (pow & utils.POW_DOWN) s.push(utils.POW_DOWN);
        if (pow & utils.POW_REPLY) s.push(utils.POW_REPLY);
        if (pow & utils.POW_POST) s.push(utils.POW_POST);
        if (pow & utils.POW_CHANGE) s.push(utils.POW_CHANGE);
        if (pow & utils.POW_ADD) s.push(utils.POW_ADD);
        if (pow & utils.POW_EDIT) s.push(utils.POW_EDIT);
        if (pow & utils.POW_ADM) s.push(utils.POW_ADM);
        return s;
    },
    teamState: [, "申请中", "已拒绝", "团员"],
    nodeType: [{ icon: 'folder', name: '禁用' }, { icon: 'folder', name: '可用' }, { icon: 'folder_shared', name: '禁用且共享' }, { icon: 'folder_shared', name: '共享' }],
    postType: {
        10: { icon: 'mode_comment', name: '闲聊' },
        20: { icon: 'attach_file', name: '资料' },
        100: { icon: 'details', name: '其他' },
        150: { icon: 'highlight', name: '定义' },
        160: { icon: 'border_color', name: '设计' },
        210: { icon: 'trending_up', name: '调整' },
        220: { icon: 'loyalty', name: '实现' },
        230: { icon: 'touch_app', name: '测试' },
        240: { icon: 'bug_report', name: 'bug' },
    },
    getPostTypes() {
        let options = [];
        for (let k in utils.postType) {
            let v = utils.postType[k];
            options.push({ label: v.name, value: +k, icon: v.icon });
        }
        return options;
    },
    uMap: {},
    getUser(id) {
        return utils.uMap[id] || {};
    },
    cacheUsers(users) {
        for (let user of users) {
            utils.uMap[user.id] = user;
        }
    }
};

utils.powName = [
    [utils.POW_VISIBLE, "可见"],
    [utils.POW_READ, "查看"],
    [utils.POW_DOWN, "下载"],
    [utils.POW_REPLY, "回复"],
    [utils.POW_POST, "发布"],
    [utils.POW_CHANGE, "编辑"],
    [utils.POW_ADD, "创建"],
    [utils.POW_EDIT, "修改"],
    [utils.POW_ADM, "管理"],
];
export default utils;