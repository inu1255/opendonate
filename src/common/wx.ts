import { createLocal } from "./utils";
import axios from "axios";
import * as config from "./config";
import * as utils from "./utils";
import { appLogger } from "./log";
const store = createLocal({
    access_token_expired_at: 0,
    access_token: "",
    jsapi_ticket_expired_at: 0,
    jsapi_ticket: "",
}, ".wx_mp_cache");

/**
 * 获取微信公众平台 access_token
 */
export async function getAccessToken(): Promise<string> {
    if (store.access_token_expired_at > +new Date()) return store.access_token;
    let { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wechat.appid}&secret=${config.wechat.secret}`);
    if (data.errcode) throw data;
    store.access_token = data.access_token;
    store.access_token_expired_at = new Date().getTime() + data.expires_in * 1e3;
    if (data.errmsg) appLogger.warn("getAccessToken failed:", data.errmsg);
    return data.access_token;
}
/**
 * 获取微信公众平台 jsapi_ticket
 */
export async function getJsapiTicket(): Promise<string> {
    if (store.jsapi_ticket_expired_at > +new Date()) return store.jsapi_ticket;
    let token = await getAccessToken();
    let { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`);
    if (data.errcode) throw data;
    store.jsapi_ticket = data.ticket;
    store.jsapi_ticket_expired_at = new Date().getTime() + data.expires_in * 1e3;
    return store.jsapi_ticket;
}

interface SignParams {
    nonceStr: string;
    jsapi_ticket: string;
    timestamp: number;
    url: string;
}

/**
 * 签名
 * @param params 待签名参数
 */
export function sign(params: SignParams) {
    var ss = [];
    for (let k in params) {
        let v = params[k];
        ss.push([k, v]);
    }
    ss.sort((a, b) => (a > b ? 1 : -1));
    return utils.sha1(ss.map(x => x[0].toLowerCase() + "=" + x[1]).join("&"));
}

export interface SingData extends SignParams {
    signature: string;
    appId: string;
}

/**
 * 获取jssdk配置
 * @param url
 */
export async function jssdkConfig(url: string): Promise<SingData> {
    let data = {
        nonceStr: utils.randomString(16), // 必填，生成签名的随机串
        jsapi_ticket: await getJsapiTicket(),
        timestamp: Math.floor(+new Date() / 1e3), // 必填，生成签名的时间戳
        url
    };
    let signature = sign(data);
    delete data.jsapi_ticket;
    let appId = config.wechat.appid;
    return Object.assign(data, { signature, appId });
}

interface OAuth2Response {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    openid: string;
    scope: string;
}

/**
 * 通过code换取access_token
 */
export async function oauth2(appid: string, secret: string, code: string): Promise<OAuth2Response> {
    var url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`
    var ret = await axios.get(url)
    return ret.data;
}

export interface SnsUserInfoResponse {
    openid: string;
    nickname: string;
    sex: string;
    province: string;
    city: string;
    country: string;
    headimgurl: string;
    privilege: string[];
    unionid: string;
    language?: string;
}

export async function getUserInfo(access_token: string, openid: string): Promise<SnsUserInfoResponse> {
    var url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`
    var ret = await axios.get(url)
    if (ret.data.errmsg)
        throw { no: ret.data.errcode, msg: ret.data.errmsg }
    return ret.data;
}

export namespace mp {
    interface SendTemplateBody {
        touser: string;
        template_id: string;
        url?: string;
        miniprogram?: Miniprogram;
        data: { [keyword: string]: string };
    }

    interface Miniprogram {
        appid: string;
        pagepath: string;
    }

    interface APIResponse {
        errcode: number;
        errmsg: string;
    }

    interface QRCodeResponse {
        ticket: string;
        expire_seconds: number;
        url: string;
    }


    export async function sendTemplate(body: SendTemplateBody): Promise<APIResponse> {
        let url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=` + await getAccessToken()
        let data = {};
        for (let k in body.data) {
            let v = body.data[k]
            data[k] = { value: v }
        }
        let ret = await axios.post(url, Object.assign(body, { data }))
        return ret.data;
    }

    export function sendNotice(open_id: string, title: string, content: string, url?: string, remark?: string) {
        return sendTemplate({
            touser: open_id,
            template_id: 'nfjZ4oVwIQeIJ1WCStSm0pl63YF7uc0PWcB4xAkZJPg',
            url: url,
            data: {
                first: title,
                keyword1: content,
                keyword2: utils.format('YYYY-MM-DD hh:mm:ss'),
                remark: remark,
            },
        })
    }

    async function send(data: any) {
        let url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=` + await getAccessToken();
        let ret = await axios.post(url, data)
        return ret.data;
    }

    export function sendText(openid: string, text: string) {
        if (!text) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "text",
            "text": {
                "content": text
            }
        })
    }

    export function sendImage(openid: string, media_id: string) {
        if (!media_id) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "image",
            "image": {
                media_id
            }
        })
    }

    export function sendVoice(openid: string, media_id: string) {
        if (!media_id) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "voice",
            "voice": {
                media_id
            }
        })
    }

    interface SendVideoBody {
        media_id: string;
        thumb_media_id: string;
        title?: string;
        description?: string;
    }

    export function sendVideo(openid: string, body: SendVideoBody) {
        if (!body) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "video",
            "video": body
        })
    }

    interface SendMusicBody {
        title?: string;
        description?: string;
        musicurl: string;
        hqmusicurl: string;
        thumb_media_id: string;
    }

    export function sendMusic(openid: string, body: SendMusicBody) {
        if (!body) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "music",
            "music": body
        })
    }

    interface Article {
        title: string;
        description: string;
        url: string;
        picurl: string;
    }

    export function sendNews(openid: string, article: Article | string) {
        if (!article) return Promise.resolve()
        if (typeof article === "string")
            return send({
                "touser": openid,
                "msgtype": "mpnews",
                "mpnews": { media_id: article }
            })
        return send({
            "touser": openid,
            "msgtype": "news",
            "news": { articles: [article] }
        })
    }

    interface SendMenuBody {
        head_content: string;
        list: {
            id: string;
            content: string;
        }[];
        tail_content: string;
    }

    export function sendMenu(openid: string, body: SendMenuBody) {
        if (!body) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "msgmenu",
            "msgmenu": body
        })
    }

    export function sendCard(openid: string, card_id: string) {
        if (!card_id) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "wxcard",
            "wxcard": {
                card_id
            }
        })
    }

    interface SendMiniBody {
        title: string;
        appid: string;
        pagepath: string;
        thumb_media_id: string;
    }

    export function sendMini(openid: string, body: SendMiniBody) {
        if (!body) return Promise.resolve()
        return send({
            "touser": openid,
            "msgtype": "miniprogrampage",
            "miniprogrampage": body
        })
    }

    interface UserInfo {
        subscribe: number;
        openid: string;
        nickname: string;
        sex: number;
        language: string;
        city: string;
        province: string;
        country: string;
        headimgurl: string;
        subscribe_time: number;
        unionid: string;
        remark: string;
        groupid: number;
        tagid_list: number[];
        subscribe_scene: string;
        qr_scene: number;
        qr_scene_str: string;
    }

    export const SUBSCRIBE_SCENES = [
        "ADD_SCENE_SEARCH", // 公众号搜索
        "ADD_SCENE_ACCOUNT_MIGRATION", // 公众号迁移
        "ADD_SCENE_PROFILE_CARD", // 名片分享
        "ADD_SCENE_QR_CODE", // 扫描二维码
        "ADD_SCENE_PROFILE_LINK", // 图文页内名称点击
        "ADD_SCENE_PROFILE_ITEM", // 图文页右上角菜单
        "ADD_SCENE_PAID", // 支付后关注
        "ADD_SCENE_OTHERS", // 其他
    ];

    export async function getUserInfo(open_id: string, lang: string = "zh_CN"): Promise<UserInfo> {
        lang = lang || "zh_CN";
        let url = `https://api.weixin.qq.com/cgi-bin/user/info?openid=${open_id}&lang=${lang}&access_token=` + await getAccessToken();
        let ret = await axios.get(url)
        return ret.data;
    }

    interface OpenIDs {
        total: number;
        count: number;
        data: { openid: string[] };
        next_openid: string;
    }

    export async function getOpenIDs(next_openid?: string): Promise<OpenIDs> {
        next_openid = next_openid || ""
        let url = `https://api.weixin.qq.com/cgi-bin/user/get?next_openid=${next_openid}&access_token=` + await getAccessToken();
        let ret = await axios.get(url)
        return ret.data;
    }

    export async function qrcodeCreate(data: number | string, expire_seconds?: number): Promise<QRCodeResponse> {
        if (expire_seconds) expire_seconds = Math.max(Math.min(expire_seconds, 2592000), 0)
        let url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=` + await getAccessToken();
        // 二维码类型，QR_SCENE为临时的整型参数值，QR_STR_SCENE为临时的字符串参数值，QR_LIMIT_SCENE为永久的整型参数值，QR_LIMIT_STR_SCENE为永久的字符串参数值
        let action_name = "QR";
        let scene: { scene_str: string } | { scene_id: number }
        if (!expire_seconds) {
            action_name += "_LIMIT"
        }
        if (typeof data === "string") {
            action_name += "_STR"
            scene = { scene_str: data }
        } else {
            scene = { scene_id: data }
        }
        action_name += "_SCENE"
        let ret = await axios.post(url, { expire_seconds, action_name, action_info: { scene } })
        return ret.data;
    }
}

export namespace micro {

    interface SendTemplateBody {
        touser: string;
        template_id: string;
        page?: string;
        form_id: string; // 表单提交场景下，为 submit 事件带上的 formId；支付场景下，为本次支付的 prepay_id
        data: { [keyword: string]: string };
        emphasis_keyword?: string;
    }

    interface APIResponse {
        errcode: number;
        errmsg: string;
    }

    export async function sendTemplate(body: SendTemplateBody): Promise<APIResponse> {
        let url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=` + await getAccessToken()
        let data = {};
        for (let k in body.data) {
            let v = body.data[k]
            data[k] = { value: v }
        }
        let ret = await axios.post(url, Object.assign(body, { data }))
        return ret.data;
    }

    export function sendNotice(open_id: string, form_id: string, title: string, remark?: string) {
        return sendTemplate({
            touser: open_id,
            template_id: '6N3U2UJ0FbY7JgePcVvVc5Skl3g9edS9Wwk6Egwub5s',
            form_id,
            data: {
                keyword1: title,
                keyword2: remark,
                keyword3: utils.format('YYYY-MM-DD hh:mm:ss'),
            },
            emphasis_keyword: 'keyword1',
        })
    }
}