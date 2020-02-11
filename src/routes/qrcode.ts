import db from "../common/db";
import { appLogger } from "../common/log";
import * as utils from "../common/utils";
import * as cofs from "fs-extra";

export async function add(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.QrcodeAddBody = req.body
    let user = req.session.user;
    if (body.id) {
        let sql = db.select('qrcode').where({ id: body.id })
        if (user.lvl > 0) sql.where({ account: user.account })
        let old = await sql.first();
        if (!old) return 404;
        utils.clearKeys(body, old) as db.Qrcode
        if (utils.isEmpty(body)) return body;
        await db.update('qrcode', body).where({ id: old.id })
        return body;
    }
    let data: db.Qrcode = Object.assign({
        account: user.account,
    }, body)
    try {
        data.id = await db.insert('qrcode', data).id()
    } catch (e) {
        if (e.errno == 1062) // 价格重复
            return 405;
        throw e;
    }
    return data
}
export async function del(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.QrcodeDelBody = req.body
    let user = req.session.user;
    let sql = db.delete('qrcode').where({ id: body.id })
    if (user.lvl > 0) sql.where({ account: user.account })
    let pac = await sql
    return { n: pac.affectedRows }
}
export async function list(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.QrcodeListBody = req.body
    let user = req.session.user;
    let sql = db.select('qrcode', 'id,account,price,alipay,alipay_url,wechat');
    if (body.id != null) {
        sql.where('id=?', [body.id]);
    }
    if (body.account != null) {
        sql.where('account=?', body.account);
    }
    if (body.minPrice != null) {
        sql.where('price>=?', [body.minPrice]);
    }
    if (body.maxPrice != null) {
        sql.where('price<=?', [body.maxPrice]);
    }
    if (body.alipay != null) {
        sql.where('alipay like ?', ['%' + body.alipay + '%']);
    }
    if (body.alipay_url != null) {
        sql.where('alipay_url like ?', ['%' + body.alipay_url + '%']);
    }
    if (body.wechat != null) {
        sql.where('wechat like ?', ['%' + body.wechat + '%']);
    }
    if (body.sortBy) {
        if (body.desc) sql.orderBy(body.sortBy + " desc");
        else sql.orderBy(body.sortBy);
    }
    sql.limit(body.page * body.pageSize, body.pageSize);
    let data = await sql.page();
    return data
}
