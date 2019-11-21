import db from "../common/db";
import * as config from "../common/config";
import { appLogger } from "../common/log";
import * as utils from '../common/utils';
import * as lib from '../lib';

export async function add(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.DonateAddBody = req.body
    let user = req.session.user;
    if (body.id) {
        let sql = db.select('donate').where({ id: body.id })
        let old = await sql.first();
        if (!old) return 404;
        utils.clearKeys(body, old)
        if (utils.isEmpty(body)) return body
        await db.update('donate', body).where({ id: old.id })
        return body
    }
    let old = await db.select('donate').where({ id: body.price }).first();
    if (old) {
        utils.clearKeys(body, old)
        if (utils.isEmpty(body)) return body
        await db.update('donate', body).where({ id: old.id })
        return body
    }
    let data: db.Donate = Object.assign({
        create_at: Date.now(),
    }, body)
    data.id = await db.insert('donate', data).id()
    return data
};

export async function list(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.DonateListBody = req.body
    let user = req.session.user;
    let sql = db.select('donate', 'id,app_id,email,price,create_at,remark');
    if (body.id != null) {
        sql.where('id=?', [body.id]);
    }
    if (body.app_id != null) {
        sql.where('app_id=?', [body.app_id]);
    }
    if (body.email != null) {
        sql.where('email like ?', ['%' + body.email + '%']);
    }
    if (body.minPrice != null) {
        sql.where('price>=?', [body.minPrice]);
    }
    if (body.maxPrice != null) {
        sql.where('price<=?', [body.maxPrice]);
    }
    if (body.minCreateAt != null) {
        sql.where('create_at>=?', [body.minCreateAt]);
    }
    if (body.maxCreateAt != null) {
        sql.where('create_at<=?', [body.maxCreateAt]);
    }
    if (body.remark != null) {
        sql.where('remark like ?', ['%' + body.remark + '%']);
    }
    if (body.sortBy) {
        if (body.desc) sql.orderBy(body.sortBy + " desc");
        else sql.orderBy(body.sortBy);
    }
    sql.limit(body.page * body.pageSize, body.pageSize);
    let data = await sql.page();
    return data
}; export async function del(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.DonateDelBody = req.body
    let user = req.session.user;
    let sql = db.delete('donate').where({ id: body.id })
    let pac = await sql
    return { n: pac.affectedRows }
}
