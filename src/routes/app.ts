import db from "../common/db";
import { appLogger } from "../common/log";
import * as utils from "../common/utils";
import * as cofs from "fs-extra";

export async function add(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppAddBody = req.body
    let user = req.session.user;
    if (body.id) {
        let sql = db.select<db.App>('app').where({ id: body.id })
        if (user.lvl > 0) sql.where({ account: user.account })
        let old = await sql.first();
        if (!old) return 404;
        utils.clearKeys(body, old)
        if (utils.isEmpty(body)) return body
        await db.update('app', body).where({ id: old.id })
        return body
    }
    let data: db.App = Object.assign({
        account: user.account,
        appname: body.appname,
    }, body)
    data.id = await db.insert('app', data).id()
    return data
}
export async function del(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppDelBody = req.body
    let user = req.session.user;
    let sql = db.delete('app').where({ id: body.id })
    if (user.lvl > 0) sql.where({ account: user.account })
    let pac = await sql
    return { n: pac.affectedRows }
}
export async function list(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppListBody = req.body
    let user = req.session.user;
    let sql = db.select('app', 'id,account,appname,title,url,cer,back');
    if (body.id != null) {
        sql.where('id=?', [body.id]);
    }
    if (body.account != null) {
        sql.where('account=?', [body.account]);
    }
    if (body.title != null) {
        sql.where('title like ?', ['%' + body.title + '%']);
    }
    if (body.url != null) {
        sql.where('url like ?', ['%' + body.url + '%']);
    }
    if (body.cer != null) {
        sql.where('cer like ?', ['%' + body.cer + '%']);
    }
    if (body.back != null) {
        sql.where('back like ?', ['%' + body.back + '%']);
    }
    if (body.sortBy) {
        if (body.desc) sql.orderBy(body.sortBy + " desc");
        else sql.orderBy(body.sortBy);
    }
    sql.limit(body.page * body.pageSize, body.pageSize);
    let data = await sql.page();
    return data
}

export async function get(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppGetBody = req.body
    let user = req.session.user;
    let data = await db.select('app,user', 'app.id,app.title,user.name create_name').where('app.account=user.account and app.account=? and app.appname=?', [body.account, body.appname]).first();
    if (!data) return 404;
    return data;
}