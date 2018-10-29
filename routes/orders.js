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
     * @property {string} [api] http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign
     * @property {string} [cer] 签名
     * @property {string} [back] 支付后跳转链接
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
            body.api = body.api || '';
            body.cer = body.cer || '';
            body.back = body.back || '';
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
exports.add = async function(req, res) {
    // gparam "../api/orders/add.json"
    /**
     * @typedef {object} add_body
     * @property {number} user_id 用户ID
     * @property {number} price 金额(分)
     * @property {number} type 支付方式
     * @property {string} [ext] 附加信息
     */
    /** @type {add_body} */
    let body = req.body;
    let user = req.session.user;
    let [qrcode] = await db.execSQL(`select q.*,u.name from qrcode as q left join user as u on q.create_id=u.id where q.create_id=? and (q.price=? or q.price=0) order by q.price desc`, [body.user_id, body.price]);
    if (!qrcode) return 404;
    let types = [qrcode.alipay, qrcode.wechat];
    if (!types[body.type]) return 405;
    let data = {
        qr_id: qrcode.id,
        type: body.type,
        ext: body.ext,
        ip: req.ip,
        ua: req.ua,
        create_at: +new Date,
        user_id: qrcode.create_id,
        price: body.price,
    };
    data.id = await db.insert('orders', data).id();
    data.user_name = qrcode.name;
    data.url = types[data.type];
    data.alipay_url = qrcode.alipay_url;
    data.back = qrcode.back;
    data.token = utils.md5('i37n' + data.id);
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
    let user = req.session.user;
    if (body.t != utils.md5('i37n' + body.id))
        return 404;
    let order = await db.select(
        'orders as o left join qrcode as q on o.qr_id=q.id left join user as u on q.create_id=u.id',
        `o.create_at,o.type,o.ext,if(o.type=0,q.alipay,q.wechat) as url,q.alipay_url,q.back,u.name as user_name,o.price`
    ).where({ 'o.id': body.id }).first();
    if (!order) return 404;

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
    if (body.token != utils.md5('i37n' + body.id))
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
    let sql = db.select('orders as o left join qrcode as q on o.qr_id=q.id', 'o.id,o.ip,o.ua,o.create_at,o.state,o.pay_at,o.ext,o.type,o.price,o.ret,q.api').limit(1000);
    if (body.uID) {
        sql.where('o.user_id', body.uID);
    }
    if (body.type != null) {
        sql.where('o.type', body.type);
    }
    if (body.state != null) {
        sql.where('o.state', body.state);
    }
    if (body.ret != null) {
        sql.where('o.ret', body.ret);
    }
    if (body.create_min) {
        sql.where('o.create_at', '>=', body.create_min);
    }
    if (body.create_max) {
        sql.where('o.create_at', '<=', body.create_max);
    }
    let list = await sql;
    return { list };
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
     */
    /** @type {set_body} */
    let body = req.body;
    let user = req.session.user;
    let order = await db.select('orders as o left join qrcode as q on o.qr_id=q.id', 'o.id,o.price,o.state,o.ret,o.ext,q.api,q.cer').where({ 'o.id': body.id, 'q.create_id': user.id }).first();
    if (!order) return 404;
    if (body.send) {
        if (order.api) {
            let t = +new Date;
            let sign = utils.md5(order.id + order.price + (order.ext || '') + t + order.cer);
            try {
                let ret = await axios.post(order.api, { id: order.id, price: order.price, ext: order.ext, t, sign });
                if (ret.data.no == 200) body.ret = 2;
                else {
                    body.ret = 1;
                    body.msg = ret.data;
                }
            } catch (err) {
                body.msg = err + '';
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