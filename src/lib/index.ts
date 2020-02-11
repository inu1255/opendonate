import db from "../common/db";
import { code_expire } from "../common/config";
const sess_update = {}; // 用户session变化时间

const USERINFO = ["passwd", "invite_id", "unionid"];

/**
 * 刷新用户session
 * @param user_id 
 */
export function sessUpdate(user_id: number | string) {
    sess_update[user_id] = +new Date();
}

/**
 * 清除用户敏感数据
 */
export function clearUser(user: de.User, keep?: Set<string>) {
    if (!user.invite_code) {
        user.invite_code = user.id.toString(10);
        while (user.invite_code.length < 5)
            user.invite_code = '0' + user.invite_code
    }
    for (let i = 0; i < USERINFO.length; i++) {
        let k = USERINFO[i];
        if (!(keep && keep.has(k)))
            delete user[k]
    }
    return user;
}

/**
 * 过滤用户信息
 */
export async function getUserInfo(req: ExpressRequest, user?: de.User | number) {
    if (!user) user = req.session.user.id;
    if (typeof user === "number")
        user = await db.select<de.User>("user").where("id", user).first();
    if (!user) {
        delete req.session.user;
        return
    }
    user.login_at = Date.now();
    req.session.user = user;
    if (!user.invite_code) {
        user.invite_code = user.id.toString(10);
        while (user.invite_code.length < 5)
            user.invite_code = '0' + user.invite_code
    }
    let data = Object.assign({}, user);
    clearUser(data, new Set(['unionid']));
    return data;
}

/**
 * 更新用户session middle
 * @param req
 * @param user
 */
export function expressSessionUpdate(req: ExpressRequest, res: ExpressResponse, next) {
    let user = req.session.user;
    if (!user) return next();
    let t = sess_update[user.id];
    if (!t) {
        // 如果系统重启，每个未登录的用户都需要更新
        t = sess_update[user.id] = +new Date();
    }
    if (t <= user.login_at) {
        // 如果已经更新
        next();
        return;
    }
    getUserInfo(req).then(e => next(), err => {
        console.error(err);
        next();
    });
}

/**
 * 检查验证码
 * @param title 邮箱/手机
 * @param code 验证码
 */
export async function checkCode(title: string, code: string) {
    const one = await db.select("verify").where("title", title).first();
    if (!one) {
        return 407;
    }
    // 尝试次数过多
    if (one.rest < 1) {
        return 407;
    }
    // 10分钟内有效
    if (one.update_at < new Date().getTime() - code_expire) {
        return 407;
    }
    // 验证码错误
    if (one.code != code) {
        await db.update("verify", { rest: one.rest - 1 }).where("title", title);
        return 406;
    }
}