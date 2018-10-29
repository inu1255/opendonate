const db = require("../common/db");
const config = require("../common/config");
const logger = require("../common/log").getLogger();
const utils = require('../common/utils');
const lib = require('../lib');
const axios = require('axios').default;

/**
 * @param {{session:{user:User}}} req
 */
exports.add = async function(req, res) {
    // gparam "../api/donate/add.json"
    /**
     * @typedef {object} add_body
     * @property {number} id 订单ID
     * @property {number} price 金额
     * @property {string} ext 附加信息
     * @property {number} t 请求时间(ms)
     * @property {string} sign 签名
     */
    /** @type {add_body} */
    let body = req.body;
    let user = req.session.user;
    let sign = utils.md5(body.id + body.price + (body.ext || '') + body.t + '1255');
    if (sign != body.sign) throw '签名错误';
    let qrcode = await db.select('qrcode').where(`id=(select qr_id from orders where id=?)`, [body.id]).first();
    let ext = {};
    try {
        ext = JSON.parse(body.ext);
    } catch (error) {}
    if (!ext.email) return 404;
    let data = {
        user_id: qrcode.create_id,
        email: ext.email,
        price: body.price,
        create_at: +new Date(),
        remark: ext.remark,
    };
    data.id = await db.insert('donate', data);
    return data;
};

/**
 * @param {{session:{user:User}}} req
 */
exports.list = async function(req, res) {
    // gparam "../api/donate/list.json"
    /**
     * @typedef {object} list_body
     * @property {number} uid 用户ID
     * @property {number} [offset] 偏移
     * @property {string} [sort] 排序
     * @property {string} [order] 排序升降
     */
    /** @type {list_body} */
    let body = req.body;
    let [user] = await db.execSQL(`select name,avatar,profile from user where id=?`, [body.uid]);
    let [list, [{ total }]] = await db.execSQL([
        db.Raw(`select sql_calc_found_rows * from donate where user_id=? order by ${body.sort} ${body.order} limit ?,15`, [body.uid, body.offset]),
        `select found_rows() as total`
    ]);
    return { user, list, total };
};