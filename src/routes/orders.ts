import db from "../common/db";
import * as config from "../common/config";
import * as utils from '../common/utils';
import axios from 'axios';

export async function add(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersAddBody = req.body
    let user = req.session.user;
    if (body.id) {
        let sql = db.select('orders').where({ id: body.id })
        let old = await sql.first();
        if (!old) return 404;
        utils.clearKeys(body, old)
        if (utils.isEmpty(body)) return body
        await db.update('orders', body).where({ id: old.id })
        return body
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
    let app = await db.select<db.App>('app').where(`id`, [body.aid]).first();
    if (!app) return 404;
    let qrcode = await db.select<db.Qrcode>('qrcode').where(`create_id=? and (price=? or price=0)`, [app.create_id, body.price]).orderBy('price desc').first();
    if (!qrcode) return 405;
    let types = [qrcode.alipay, qrcode.wechat];
    if (body.type != null && !types[body.type]) return 405;
    let data = {
        qr_id: qrcode.id,
        app_id: app.id,
        type: body.type,
        ext: body.ext,
        ip: req.realip,
        ua: req.ua,
        create_at: +new Date,
        user_id: app.create_id,
        price: body.price,
    } as db.Orders;
    data.id = await db.insert('orders', data).id()
    utils.clearKeys(data, ['ua', 'ip'])
    let token = utils.md5(config.secret + '|' + data.id);
    // 清理5分钟没有支付的订单
    setTimeout(() => db.delete('orders').where('type is null and id=?', [data.id]), 300e3);
    if (body.json) {
        return Object.assign(data, {
            app_name: app.title,
            alipay: qrcode.alipay,
            wechat: qrcode.wechat,
            alipay_url: qrcode.alipay_url,
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
    let order = await db.select('orders', 'id,qr_id,app_id,type,ext,create_at,user_id,price').where({ id: body.id }).first();
    if (!order) return 404;
    let qrcode = await db.select('qrcode', `alipay,wechat,alipay_url`).where({ id: order.qr_id }).first();
    if (!qrcode) return 404;
    Object.assign(order, qrcode);
    let app = await db.select('app', 'title,back').where({ id: order.app_id }).first();
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
    await db.update('orders', { pay_at: +new Date }).where({ id: body.id });
};

export async function set(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.OrdersSetBody = req.body;
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
    let sql = db.select('orders', 'id,user_id,qr_id,app_id,type,create_at,state,pay_at,ext,ret,msg,price,ip,ua');
    if (body.id != null) {
        sql.where('id=?', [body.id]);
    }
    if (body.user_id != null) {
        sql.where('user_id=?', [body.user_id]);
    }
    if (body.qr_id != null) {
        sql.where('qr_id=?', [body.qr_id]);
    }
    if (body.app_id != null) {
        sql.where('app_id=?', [body.app_id]);
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
    if (body.ext != null) {
        sql.where('ext like ?', ['%' + body.ext + '%']);
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
    if (body.sortBy) {
        if (body.desc) sql.orderBy(body.sortBy + " desc");
        else sql.orderBy(body.sortBy);
    }
    sql.limit(body.page * body.pageSize, body.pageSize);
    let { list, total } = await sql.page();
    let aIDs = utils.collect(list, 'app_id')
    let apps = aIDs.length ? await db.select('app', 'id,title,length(url) url').where('id in (?)', [aIDs]) : [];
    return { list, total, apps }
}
