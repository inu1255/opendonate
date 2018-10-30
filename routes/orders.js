const db = require("../common/db");
const config = require("../common/config");
const logger = require("../common/log").getLogger();
const utils = require('../common/utils');
const lib = require('../lib');
const axios = require('axios').default;

/**
 * @param {{session:{user:User}}} req
 */
exports.qrAdd = async function(req, res) {
    // gparam "../api/orders/qr_add.json"
    /**
     * @typedef {object} qr_add_body
     * @property {number} [id] 收款码ID
     * @property {number} [price] 价格(分)
     * @property {string} [alipay] 支付宝 二维码链接
     * @property {string} [alipay_url] 支付宝 支付链接
     * @property {string} [wechat] 微信 二维码链接
     */
    /** @type {qr_add_body} */
    let body = req.body;
    let user = req.session.user;
    if (body.id) {
        let qrcode = await db.select('qrcode').where({ id: body.id, create_id: user.id }).first();
        if (!qrcode) return 404;
        let data = utils.clearKeys(body, qrcode);
        if (!Object.keys(data).length) return data;
        await db.update('qrcode', data).where({ id: body.id });
        return data;
    } else {
        try {
            body.create_id = user.id;
            body.id = await db.insert('qrcode', body).id();
        } catch (err) {
            if (err.errno == 1062) // 价格重复
                return 405;
            throw err;
        }
        return body;
    }
};

/**
 * @param {{session:{user:User}}} req
 */
exports.qrList = async function(req, res) {
    // gparam "../api/orders/qr_list.json"
    /**
     * @typedef {object} qr_list_body
     * @property {number} [uID] 用户ID
     */
    /** @type {qr_list_body} */
    let body = req.body;
    let user = req.session.user;
    let list = await db.select('qrcode').where({ create_id: body.uID });
    return { list };
};

/**
 * @param {{session:{user:User}}} req
 */
exports.qrApi = async function(req, res) {
    // gparam "../api/orders/qr_api.json"
    /**
     * @typedef {object} qr_api_body
     * @property {string} [api] http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign
     * @property {string} [cer] 签名
     * @property {string} [back] 支付后跳转链接
     */
    /** @type {qr_api_body} */
    let body = req.body;
    let user = req.session.user;
    await db.update('qrcode', body).where({ create_id: user.id });
};

/**
 * @param {{session:{user:User}}} req
 */
exports.appAdd = async function(req, res) {
    // gparam "../api/orders/app_add.json"
    /**
     * @typedef {object} app_add_body
     * @property {number} [id] 项目ID
     * @property {string} [title] 项目名称
     * @property {string} [url] http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign
     * @property {string} [cer] 签名
     * @property {string} [back] 支付后跳转链接
     */
    /** @type {app_add_body} */
    let body = req.body;
    let user = req.session.user;
    if (body.id) {
        let app = await db.select('app').where({ id: body.id, create_id: user.id }).first();
        if (!app) return 404;
        let data = utils.clearKeys(body, app);
        if (!Object.keys(data).length) return data;
        await db.update('app', data).where({ id: body.id });
        return data;
    } else {
        body.url = body.url || '';
        body.cer = body.cer || '';
        body.back = body.back || '';
        body.create_id = user.id;
        try {
            body.id = await db.insert('app', body).id();
        } catch (err) {
            if (err.errno == 1062)
                return 406;
            throw err;
        }
        return body;
    }
};

/**
 * @param {{session:{user:User}}} req
 */
exports.appList = async function(req, res) {
    // gparam "../api/orders/app_list.json"
    /**
     * @typedef {object} app_list_body
     * @property {number} [uID] 用户ID
     */
    /** @type {app_list_body} */
    let body = req.body;
    let user = req.session.user;
    let list = await db.select('app').where({ create_id: body.uID });
    return { list };
};

/**
 * @param {{session:{user:User}}} req
 */
exports.appDel = async function(req, res) {
    // gparam "../api/orders/app_del.json"
    /**
     * @typedef {object} app_del_body
     * @property {number} [id] 项目ID
     */
    /** @type {app_del_body} */
    let body = req.body;
    let user = req.session.user;
    let has = await db.select('donate').where({ app_id: body.id }).first();
    if (has) return 405;
    let pack = await db.delete('app').where({ id: body.id, create_id: user.id });
    if (!pack.affectedRows) return 404;
};

/**
 * @param {{session:{user:User}}} req
 */
exports.appDemo = async function(req, res) {
    // gparam "../api/orders/app_demo.json"
    /**
     * @typedef {object} app_demo_body
     */
    /** @type {app_demo_body} */
    let body = req.body;
    let user = req.session.user;
    let data = { title: '捐赠Demo', url: '', cer: '', back: '', create_id: user.id };
    try {
        let id = await db.insert('app', data).id();
        data.url = req.protocol + '://' + req.headers['host'] + `/api/donate/add?app_id=${id}`;
        data.cer = utils.md5(config.secret + id);
        data.back = req.protocol + '://' + req.headers['host'] + `/donate/${id}?page=1`;
        await db.update('app', data).where({ id });
        data.id = id;
        return data;
    } catch (err) {
        if (err.errno == 1062)
            return 405;
        throw err;
    }
};

/**
 * @param {{session:{user:User}}} req
 */
exports.add = async function(req, res) {
    // gparam "../api/orders/add.json"
    /**
     * @typedef {object} add_body
     * @property {number} user_id 用户ID
     * @property {number} price 金额(分)
     * @property {number} type 支付方式
     * @property {string} [app] 项目名称
     * @property {string} [ext] 附加信息
     */
    /** @type {add_body} */
    let body = req.body;
    let user = req.session.user;
    let create = await db.select('user', 'name').where({ id: body.user_id }).first();
    if (!create) return 404;
    let qrcode = await db.select('qrcode').where(`create_id=? and (price=? or price=0)`, [body.user_id, body.price]).orderBy('price desc').first();
    if (!qrcode) return 404;
    let app = await db.select('app').where(`create_id=? and title=?`, [body.user_id, body.app]).first();
    app = app || { id: 0 };
    let types = [qrcode.alipay, qrcode.wechat];
    if (!types[body.type]) return 405;
    let data = {
        qr_id: qrcode.id,
        app_id: app.id,
        type: body.type,
        ext: body.ext,
        ip: req.ip,
        ua: req.ua,
        create_at: +new Date,
        user_id: body.user_id,
        price: body.price,
    };
    data.id = await db.insert('orders', data).id();
    data.user_name = create.name;
    data.url = types[data.type];
    data.alipay_url = qrcode.alipay_url;
    data.back = app.back;
    data.token = utils.md5(config.secret + data.id);
    return data;
};

/**
 * @param {{session:{user:User}}} req
 */
exports.get = async function(req, res) {
    // gparam "../api/orders/get.json"
    /**
     * @typedef {object} get_body
     * @property {number} [id] 订单ID
     * @property {string} [t] 签名
     */
    /** @type {get_body} */
    let body = req.body;
    if (body.t != utils.md5(config.secret + body.id))
        return 404;
    let order = await db.select('orders', 'create_at,type,price,qr_id,user_id,app_id').where({ id: body.id }).first();
    if (!order) return 404;
    let qrcode = await db.select('qrcode', `${['alipay','wechat'][order.type]} as url,alipay_url`).where({ id: order.qr_id }).first();
    Object.assign(order, qrcode);
    let receive = await db.select('user', 'name').where({ id: order.user_id }).first();
    Object.assign(order, receive);
    let app = await db.select('app', 'back').where({ id: order.app_id }).first();
    Object.assign(order, app);
    return order;
};

/**
 * @param {{session:{user:User}}} req
 */
exports.iampay = async function(req, res) {
    // gparam "../api/orders/iampay.json"
    /**
     * @typedef {object} iampay_body
     * @property {number} id 订单ID
     * @property {string} token 签名
     */
    /** @type {iampay_body} */
    let body = req.body;
    let user = req.session.user;
    if (body.token != utils.md5(config.secret + body.id))
        return 404;
    await db.update('orders', { pay_at: +new Date }).where({ id: body.id });
};

/**
 * @param {{session:{user:User}}} req
 */
exports.search = async function(req, res) {
    // gparam "../api/orders/search.json"
    /**
     * @typedef {object} search_body
     * @property {number} [uID] 用户ID
     * @property {number} [type] 支付方式
     * @property {number} [state] 支付状态
     * @property {number} [ret] 发货状态
     * @property {number} [create_min] 下单时间下限
     * @property {number} [create_max] 下单时间上限
     */
    /** @type {search_body} */
    let body = req.body;
    let user = req.session.user;
    let sql = db.select('orders', 'id,ip,ua,create_at,state,pay_at,ext,type,price,ret,app_id').limit(1000);
    if (body.uID) {
        sql.where('user_id', body.uID);
    }
    if (body.type != null) {
        sql.where('type', body.type);
    }
    if (body.state != null) {
        sql.where('state', body.state);
    }
    if (body.ret != null) {
        sql.where('ret', body.ret);
    }
    if (body.create_min) {
        sql.where('create_at', '>=', body.create_min);
    }
    if (body.create_max) {
        sql.where('create_at', '<=', body.create_max);
    }
    let list = await sql;
    let aMap = {};
    for (let item of list) {
        aMap[item.app_id] = true;
    }
    let aIDs = Object.keys(aMap);
    let apps = await db.select('app', 'id,title').where('id', 'in', aIDs);
    return { list, apps };
};

/**
 * @param {{session:{user:User}}} req
 */
exports.set = async function(req, res) {
    // gparam "../api/orders/set.json"
    /**
     * @typedef {object} set_body
     * @property {number} id 订单ID
     * @property {number} state 支付状态
     * @property {string} [send] 是否发货
     * @property {string} [ext] 附加信息
     */
    /** @type {set_body} */
    let body = req.body;
    let user = req.session.user;
    let order = await db.select('orders', 'id,price,state,ret,ext,app_id').where({ id: body.id, user_id: user.id }).first();
    if (!order) return 404;
    let app = await db.select('app', 'url,cer').where({ id: order.app_id }).first();
    app = app || {};
    if (body.send) {
        if (app.url) {
            let t = +new Date;
            let ext = body.ext || order.ext;
            let sign = utils.md5(order.id + order.price + (ext || '') + t + app.cer);
            try {
                console.log(app.url);
                let ret = await axios.post(app.url, { id: order.id, price: order.price, ext, t, sign });
                if (ret.data.no == 200) body.ret = 2;
                else {
                    body.ret = 1;
                    body.msg = ret.data;
                }
            } catch (err) {
                body.msg = err + '';
                // console.log(err);
                body.ret = 1;
            }
        } else {
            // 标记为手动发货
            body.ret = 3;
        }
        delete body.send;
    }
    let data = utils.clearKeys(body, order);
    if (Object.keys(data).length)
        await db.update('orders', data).where({ id: body.id });
    return body;
};