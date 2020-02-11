/**
 * Created Date: 2017-09-29 15:01:20
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
import db from "../common/db";
import { sendCode } from "../common/email";
import { appLogger } from "../common/log";
import * as config from "../common/config";
import * as utils from "../common/utils";
import * as lib from "../lib";
import Axios from "axios";

export async function list(req: ExpressRequest, res: ExpressResponse) {
    // gparam "../../api/user/list.json" --ts
    interface ListBody {
    }

    let body: ListBody = req.body
    let user = req.session.user;
    if (!user.teams.length) return [];
    let uIDs = [],
        tIDs = [];
    let ctMap = {},
        ttMap = {};
    let teams = [];
    for (let team of user.teams) {
        uIDs.push(team.create_id);
        tIDs.push(team.id);
        team = Object.assign({ users: [] }, team);
        ctMap[team.create_id] = team;
        ttMap[team.id] = team;
        teams.push(team);
    }
    var rows = await db.execSQL(`select id,name,avatar from user where id in (?)`, [uIDs]);
    for (let user of rows) {
        ctMap[user.id].users.push(user);
    }
    var rows = await db.execSQL(`select id,name,avatar,team_id,job,pow,state from user inner join team_user on team_id in (?) and user.id=team_user.user_id`, [tIDs]);
    for (let user of rows) {
        ttMap[user.team_id].users.push(user);
        delete user.team_id;
    }
    return teams;
}

export async function login(req: ExpressRequest, res: ExpressResponse) {
    const body = req.body;
    const user = await db
        .select("user")
        .where("account", body.title)
        .orWhere("email", body.title)
        .orWhere("tel", body.title)
        .first();
    if (!user) {
        return 404; // 用户不存在
    }
    if (user.passwd != body.passwd) {
        return 405; // 密码错误
    }
    let openwx = req.session.openwx;
    if (openwx) {
        user.openid = openwx.openid;
        if (!user.name) user.name = openwx.nickname
        if (!user.avatar) user.avatar = openwx.headimgurl;
        if (!user.city) user.city = openwx.city;
        if (!user.country) user.country = openwx.country;
        if (!user.province) user.province = openwx.province;
        if (!user.sex) user.sex = openwx.sex;
        delete req.session.openwx;
    }
    user.login_at = +new Date();
    await db.update('user', user).where({ id: user.id })
    return await lib.getUserInfo(req, user);
}

export function logout(req: ExpressRequest, res: ExpressResponse) {
    delete req.session.user;
}

/**
 * 用户注册后，后续工作
 * @param user
 */
export async function afterRegist(user) { }

export async function _register(body: apar.UserRegisterBody) {
    var data: db.User = {
        account: body.account,
        passwd: body.passwd,
        name: body.name || "某用户" + utils.randomNumber(4),
        create_at: +new Date()
    };
    if (body.title) {
        if (/^1\d{10}$/.test(body.title)) {
            // 手机注册
            data.tel = body.title;
        } else {
            // 邮箱注册
            data.email = body.title;
            data.avatar = `https://cn.gravatar.com/avatar/${utils.md5(body.title)}?s=64&d=identicon&r=PG`;
        }
    }
    let title = body.title;
    if (config.routes.invite == 1 && !body.invite) throw 410;
    if (config.routes.invite != 0 && body.invite) {
        let invite_id = parseInt(body.invite, 10) || 0;
        let invitor = await db.select("user", "money").where("id", invite_id).first();
        if (invitor) {
            invitor.money += config.routes.inviteMoney0;
            data.money = config.routes.inviteMoney1;
            data.mCost = 0;
            data.invite_id = invite_id;
            let pack = await db.execSQL([
                title ? db.update("verify", { rest: -1 }).where("title", title) : null,
                db.update("user", invitor).where("id", invite_id),
                db.insert("user", data)
            ]);
            data.id = pack[pack.length - 1].insertId;
            lib.sessUpdate(body.invite);
        } else {
            throw 409;
        }
    } else {
        data.money = config.routes.money;
        let pack = await db.execSQL([
            title ? db.update("verify", { rest: -1 }).where("title", title) : null,
            db.insert("user", data)
        ]);
        data.id = pack.insertId || pack[pack.length - 1].insertId;
    }
    return data;
}

export async function register(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.UserRegisterBody = req.body
    let n = [];
    if (body.title) n.push(body.title);
    if (body.account) n.push(body.account);
    var user = await db
        .select("user")
        .where("account in (?) or email in (?) or tel in (?)", [n, n, n])
        .first();
    if (user) return 405;
    if (!req.session.openwx) {
        if (!body.title) return 400;
        const errNo = await lib.checkCode(body.title, body.code);
        if (errNo) {
            return errNo;
        }
    }
    let openwx = req.session.openwx;
    let data = await _register(body);
    if (openwx) await db.update('openwx', { uid: data.id }).where({ openid: openwx.openid })
    afterRegist(data);
    delete req.session.openwx;
    return lib.getUserInfo(req, data);
}

export async function codeSend(req: ExpressRequest, res: ExpressResponse) {
    // gparam "../../api/user/code_send.json" --ts
    interface CodeSendBody {
        title: string; // 手机/邮箱
        code?: string; // 图片验证码
    }

    let body: CodeSendBody = req.body
    const code = utils.randomNumber(6);
    let title = body.title;
    var user = await db
        .select("user")
        .where("account=? or email=? or tel=?", [title, title, title])
        .first();
    if (user) return 407;
    if (/@/.test(body.title)) {
        if (config.dev) {
            appLogger.info("发送邮箱验证码", code);
        } else {
            await sendCode(title, code);
        }
    } else {
        let { data } = await Axios.get('https://ali-sms.showapi.com/sendSms', {
            params: {
                content: JSON.stringify({ code: code }),
                mobile: body.title,
                tNum: config.msg.tNum,
            },
            headers: {
                Authorization: 'APPCODE ' + config.msg.appcode
            },
            validateStatus: () => true
        })
        if (data.showapi_res_code) throw data;
        if (data.showapi_res_body.ret_code > 0) throw data;
    }
    const one = await db.select("verify").where("title", title).first();
    if (one) {
        await db.update("verify", { code, rest: 10, update_at: +new Date() }).where("title", title);
    } else {
        await db.insert("verify", { title, code, update_at: +new Date() });
    }
}

export async function codeCheck(req, res) {
    const body = req.body;
    return await lib.checkCode(body.title, body.code);
}

export function whoami(req, res) {
    if (req.body.force) {
        return lib.getUserInfo(req);
    }
    return lib.getUserInfo(req, req.session.user);
}

export async function add(req: ExpressRequest, res: ExpressResponse) {
    // gparam "../../api/user/add.json" --ts
    interface AddBody {
        name?: string; // 姓名
        account?: string; // 账号
        email?: string; // 邮箱
        tel?: string; // 电话号码
        passwd?: string; // 密码
        avatar?: string; // 头像url
        profile?: string; // 个人介绍
        role?: string; // 角色
    }

    let body: AddBody = req.body
    let n = [];
    if (body.account) n.push(body.account);
    if (body.email) n.push(body.email);
    if (body.tel) n.push(body.tel);
    var user = await db
        .select("user")
        .where("account in (?) or email in (?) or tel in (?)", [n, n, n])
        .first();
    if (user) return 405;
    if (!body.avatar && body.email) body.avatar = `https://cn.gravatar.com/avatar/${utils.md5(body.email)}?s=64&d=identicon&r=PG`;
    let data: db.User = Object.assign({
        create_at: +new Date(),
    }, body);
    data.id = await db.insert("user", body).id();
    afterRegist(body);
    return data;
}

export async function edit(req: ExpressRequest, res: ExpressResponse) {
    // gparam "../../api/user/edit.json" --ts
    interface EditBody {
        id?: number; // 用户ID
        name?: string; // 姓名
        account?: string; // 账号
        email?: string; // 邮箱
        ecode?: string; // 邮箱验证码
        tel?: string; // 电话号码
        tcode?: string; // 手机验证码
        passwd?: string; // 密码
        passwd0?: string; // 旧密码
        avatar?: string; // 头像url
        profile?: string; // 个人介绍
        role?: string; // 角色
        money?: number; // 金币
        sex?: number; // 性别
        birth_at?: number; // 生日
    }

    let body: EditBody = req.body
    let user = req.session.user;
    let aim: db.User;
    if (user.id != body.id) aim = req.session.user;
    else
        aim = await db.select("user").where({ id: body.id }).first();
    let data = utils.clearKeys(Object.assign({}, body), ["passwd0", "ecode", "tcode"]);
    utils.clearKeys(data, aim);
    let n = [];
    if (body.account) n.push(body.account);
    if (body.email) n.push(body.email);
    if (body.tel) n.push(body.tel);
    if (n.length) { // 查重
        aim = await db
            .select("user")
            .where("account in (?) or email in (?) or tel in (?)", [n, n, n])
            .first();
        if (aim) return 405;
    }
    if (Object.keys(data).length <= 0) return;
    if (data.passwd) {
        if (user.lvl > 0) {
            if (body.passwd0) { // 用旧密码改
                if (body.passwd0 != aim.passwd) return 405;
            } else if (body.ecode) { // 通过邮箱改
                let errNo = await lib.checkCode(aim.email, body.ecode);
                if (errNo) return errNo;
            } else if (body.tcode) { // 通过手机改
                let errNo = await lib.checkCode(aim.tel, body.tcode);
                if (errNo) return errNo;
            } else {
                return 405;
            }
        }
    }
    if (data.email) {
        if (user.lvl > 0) {
            let errNo = await lib.checkCode(data.email, body.ecode);
            if (errNo) return errNo;
        }

        if (!data.avatar) data.avatar = `https://cn.gravatar.com/avatar/${utils.md5(data.email)}?s=64&d=identicon&r=PG`;
    }
    if (data.tel) {
        if (user.lvl > 0 && config.routes.tel) {
            let errNo = await lib.checkCode(data.tel, body.tcode);
            if (errNo) return errNo;
        }
    }
    await db.update("user", data).where("id", body.id);
    if (user.id == body.id) // 修改自己信息
        Object.assign(user, data);
}

export async function search(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.UserSearchBody = req.body
    let user = req.session.user;
    let sql = db.select("user");
    if (body.user_id) {
        sql.where({ id: body.user_id });
    }
    if (body.email) {
        sql.where({ email: body.email });
    }
    if (body.account) {
        sql.where({ account: body.account });
    }
    if (body.invite_id) {
        sql.where({ invite_id: body.invite_id });
    }
    if (body.sortBy) {
        if (body.desc) sql.orderBy(`${body.sortBy} desc`);
        else sql.orderBy(body.sortBy);
    }
    sql.limit(body.page * body.pageSize, body.pageSize);
    let { list, total } = await sql.page();
    list.forEach(x => lib.clearUser(x));
    return { list, total };
}

export async function get(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.UserGetBody = req.body
    let user = req.session.user;
    let data = await db.select('user').where({ id: body.id }).first();
    if (!data) return 404;
    return lib.clearUser(data);
}

db.insertNotExist("user", {
    name: "管理员",
    avatar: "https://cn.gravatar.com/avatar/ab898e14a3dd6b89debe79f7440a2be4?s=64&d=identicon&r=PG",
    account: "inu1255",
    passwd: "199337",
    lvl: 0,
    create_at: +new Date()
}).where("lvl", 0).then(_ => 0);
