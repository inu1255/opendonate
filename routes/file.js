const cofs = require("../common/cofs");
const config = require("../common/config");
const SinaBed = require('../common/sina');
const db = require("../common/db");
const path = require('path');
const utils = require('../common/utils');

exports.list = async function(req, res) {
    let user = req.session.user;
    let list = await db.execSQL(`select id,name,md5 from file where create_id=?`, [user.id]);
    list.forEach((item, i) => {
        item.url = `http://ww1.sinaimg.cn/mw690/${item.md5}`;
        delete item.md5;
    });
    return list;
};

exports.readdir = function(req, res) {
    const body = req.body;
    return cofs.readDir(body.dir);
};

exports.readfile = function(req, res) {
    const body = req.body;
    return cofs.readfile(body.file);
};

/**
 * @param {{session:{user:User}}} req
 */
exports.image = async function(req, res) {
    // gparam "../api/file/image.json"
    /**
     * @typedef {object} image_body
     * @property {string} f 图片
     * @property {string} [qr] 是否二维码
     * @property {string} [username] 新浪账号
     * @property {string} [passwd] 新浪密码
     */
    /** @type {image_body} */
    let body = req.body;
    let user = req.session.user;
    if (!body.f.type.startsWith('image/')) return 405;
    let rect, data, buffer;
    if (body.qr) {
        let img = await utils.qr_decode(body.f.path);
        if (img.qr) {
            data = img.qr.data;
            let location = img.qr.location;
            let left = Math.floor(Math.min(location.topLeftCorner.x, location.bottomLeftCorner.x));
            let right = Math.floor(Math.max(location.topRightCorner.x, location.bottomRightCorner.x));
            let width = right - left;
            let top = Math.floor(Math.min(location.topLeftCorner.y, location.topRightCorner.y));
            let bottom = Math.floor(Math.max(location.bottomRightCorner.y, location.bottomLeftCorner.y));
            let height = bottom - top;
            rect = { left, top, width, height };
        } else if (body.qr > 1) return 406;
        if (body.qr > 2) { // 裁剪二维码
            buffer = await img.extract(rect).toFormat('png').toBuffer({ resolveWithObject: false });
        }
    }
    let sina = new SinaBed(body.username || config.sina.username, body.passwd || config.sina.password);
    buffer = buffer || await cofs.readFile(body.f.path);
    cofs.rm(body.f.path);
    // let md5 = await sina.upload(buffer.toString('base64'));
    let url = 'https://ws1.sinaimg.cn/mw690/bfdf4e9fgy1fwlq41mby8j20i40i0mzk';//`https://ws1.sinaimg.cn/mw690/${md5}`;
    return { url, rect, data };
};

/**
 * @param {{session:{user:User}}} req
 */
exports.upload = async function(req, res) {
    // gparam "../api/file/upload.json"
    /**
     * @typedef {object} upload_body
     * @property {string} [f] 文件
     */
    /** @type {upload_body} */
    let body = req.body;
    let user = req.session.user;
    let filename = body.f.hash + path.extname(body.f.path);
    let dir = `upload/${user?user.id:0}/`;
    await cofs.mkdirs(dir);
    await cofs.mv(body.f.path, dir + filename);
    return filename;
};