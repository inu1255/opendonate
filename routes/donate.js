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
     * @property {number} app_id 项目ID
     * @property {number} id 订单ID
     * @property {number} price 金额
     * @property {string} ext 附加信息
     * @property {number} t 请求时间(ms)
     * @property {string} sign 签名
     */
    /** @type {add_body} */
    let body = req.body;
    let user = req.session.user;
    let cer = utils.md5(config.secret + body.app_id);
    let sign = utils.md5(body.id + body.price + (body.ext || '') + body.t + cer);
    if (sign != body.sign) return 404;
    let app = await db.select('app').where({ id: body.app_id }).first();
    if (!app) return 404;
    let ext = {};
    try {
        ext = JSON.parse(body.ext);
    } catch (error) {}
    if (!ext.email) return 405;
    let data = {
        app_id: body.app_id,
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
    let [app] = await db.execSQL(`select id,title,create_id from app where id=?`, [body.app_id]);
    if (!app) return 404;
    let [user] = await db.execSQL(`select email,name,avatar,profile from user where id=?`, [app.create_id]);
    let [list, [{ total }]] = await db.execSQL([
        db.Raw(`select sql_calc_found_rows * from donate where app_id=? order by ${body.sort} ${body.order} limit ?,15`, [body.app_id, body.offset]),
        `select found_rows() as total`
    ]);
    return { app, user: user || {}, list, total };
};