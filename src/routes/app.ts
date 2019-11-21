import db from "../common/db";
import { appLogger } from "../common/log";
import * as utils from "../common/utils";
import * as cofs from "fs-extra";

export async function add(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppAddBody = req.body
    let user = req.session.user;
    if (body.id) {
        let sql = db.select<db.App>('app').where({ id: body.id })
        if (user.lvl > 0) sql.where({ create_id: user.id })
        let old = await sql.first();
        if (!old) return 404;
        utils.clearKeys(body, old)
        if (utils.isEmpty(body)) return body
        await db.update('app', body).where({ id: old.id })
        return body
    }
    let data: db.App = Object.assign({
        create_id: user.id,
    }, body)
    data.id = await db.insert('app', data).id()
    return data
}
export async function del(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppDelBody = req.body
    let user = req.session.user;
    let sql = db.delete('app').where({ id: body.id })
    if (user.lvl > 0) sql.where({ create_id: user.id })
    let pac = await sql
    return { n: pac.affectedRows }
}
export async function list(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.AppListBody = req.body
    let user = req.session.user;
    let sql = db.select('app', 'id,create_id,title,url,cer,back,type');
    if (body.id != null) {
        sql.where('id=?', [body.id]);
    }
    if (body.create_id != null) {
        sql.where('create_id=?', [body.create_id]);
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
    let data = await db.select('app,user', 'app.id,app.title,app.create_id,user.name create_name').where('app.create_id=user.id and app.id=? and app.type=1', [body.id]).first();
    if (!data) return 404;
    return data;
}