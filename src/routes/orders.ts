import db from "../common/db";
import * as config from "../common/config";
import * as utils from '../common/utils';
import axios from 'axios';
import * as cofs from 'fs-extra'

export async function add(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersAddBody = req.body
    let user = req.session.user;
    if (body.id) {
        let sql = db.select<db.Orders>('orders').where({ id: body.id })
        let old = await sql.first();
        if (!old) return 404;
        let data = utils.clearKeys(body, old)
        if (utils.isEmpty(body)) return data
        await db.update('orders', data).where({ id: old.id })
        return data
    }
    let data: db.Orders = Object.assign({
        create_at: Date.now(),
    }, body)
    data.id = await db.insert('orders', data).id()
    return data
};

export async function create(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersCreateBody = req.body;
    let user = req.session.user;
    let { account, appname } = body
    let qrcode = await db.select<db.Qrcode>('qrcode').where(`account=? and (price=? or price=0)`, [account, body.price]).orderBy('price desc').first();
    if (!qrcode) return 405;
    let { alipay, wechat, alipay_url } = qrcode
    let types = [alipay, wechat];
    if (body.type != null && !types[body.type]) return 405;
    let data: db.Orders = {
        account: body.account,
        appname: body.appname,
        type: body.type,
        price: body.price,
        email: body.email,
        remark: body.remark,
        ip: req.ip,
        ua: req.ua,
        create_at: +new Date,
    }
    data.id = await db.insert('orders', data).id()
    let token = utils.md5(config.secret + '|' + data.id);
    if (body.json) {
        utils.clearKeys(data, ['ua', 'ip'])
        let app: db.App = await db.select('app').where({ account, appname }).first()
        if (app == null) app = { account, appname, title: appname, url: "", cer: "" }
        return Object.assign(data, {
            alipay, wechat, alipay_url,
            app_name: app.title,
            back: app.back,
            token,
        });
    }
    res._sent = true;
    res.writeHead(302, 'Found', {
        Location: '/pay/' + data.id + '?token=' + token,
    });
}

export async function get(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersGetBody = req.body;
    if (body.t != utils.md5(config.secret + '|' + body.id))
        return 404;
    let order = await db.select('orders', 'id,account,appname,type,remark,create_at,price').where({ id: body.id }).first();
    if (!order) return 404;
    let qrcode = await db.select<db.Qrcode>('qrcode').where(`account=? and (price=? or price=0)`, [order.account, order.price]).orderBy('price desc').first();
    if (!qrcode) return 404;
    Object.assign(order, qrcode);
    let { account, appname } = order;
    let app = await db.select('app', 'title,back').where({ account, appname }).first();
    if (!app) return 405;
    order.app_name = app.title;
    order.back = app.back;
    order.token = body.t;
    return order;
};

export async function iampay(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersIampayBody = req.body;
    let user = req.session.user;
    if (body.token != utils.md5(config.secret + '|' + body.id))
        return 404;
    await db.update('orders', { pay_at: +new Date, type: body.type }).where({ id: body.id });
};

export async function set(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersSetBody = req.body;
    let user = req.session.user;
    let order = await db.select('orders', 'id,price,state,ret,appname,email,remark,account,appname').where({ id: body.id, account: user.account }).first();
    if (!order) return 404;
    let { account, appname, email } = order
    let app = await db.select('app', 'url,cer').where({ account, appname }).first();
    app = app || {};
    if (body.send) {
        if (app.url) {
            let t = Date.now();
            let remark = body.remark || order.remark;
            let sign = utils.md5(order.id + order.price + appname + email + (remark || '') + t + app.cer);
            try {
                let ret = await axios.post(app.url, { id: order.id, price: order.price, appname, email, remark, t, sign });
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
    utils.clearKeys(body, order);
    if (utils.isEmpty(body))
        return body;
    await db.update('orders', body).where({ id: order.id });
    return body;
}

export async function del(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersDelBody = req.body
    let user = req.session.user;
    let sql = db.delete('orders').where({ id: body.id })
    let pac = await sql
    return { n: pac.affectedRows }
}

export async function list(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersListBody = req.body
    let user = req.session.user;
    let sql = db.select('orders', 'id,appname,email,remark,type,create_at,state,pay_at,ret,msg,price,ip,ua');
    if (body.id != null) {
        sql.where('id=?', [body.id]);
    }
    if (body.account != null) {
        sql.where('account=?', body.account);
    }
    if (body.appname != null) {
        sql.where('appname=?', body.appname);
    }
    if (body.type != null) {
        sql.where('type=?', [body.type]);
    }
    if (body.minCreateAt != null) {
        sql.where('create_at>=?', [body.minCreateAt]);
    }
    if (body.maxCreateAt != null) {
        sql.where('create_at<=?', [body.maxCreateAt]);
    }
    if (body.state != null) {
        sql.where('state=?', [body.state]);
    }
    if (body.minPayAt != null) {
        sql.where('pay_at>=?', [body.minPayAt]);
    }
    if (body.maxPayAt != null) {
        sql.where('pay_at<=?', [body.maxPayAt]);
    }
    if (body.ret != null) {
        sql.where('ret=?', [body.ret]);
    }
    if (body.msg != null) {
        sql.where('msg like ?', ['%' + body.msg + '%']);
    }
    if (body.minPrice != null) {
        sql.where('price>=?', [body.minPrice]);
    }
    if (body.maxPrice != null) {
        sql.where('price<=?', [body.maxPrice]);
    }
    if (body.ip != null) {
        sql.where('ip like ?', ['%' + body.ip + '%']);
    }
    if (body.ua != null) {
        sql.where('ua like ?', ['%' + body.ua + '%']);
    }
    if (body.email != null) {
        sql.where('email like ?', ['%' + body.email + '%']);
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
}
