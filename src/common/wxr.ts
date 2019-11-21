import { RequestHandler, Request, Response } from "express";
import { parseStringPromise } from 'xml2js';

interface WxRobotResponse {
    taker: string;
    content: string;
    type?: number;
}

function send(taker: string, content: string, type: number): WxRobotResponse {
    return { taker, content, type: type == null ? 1 : type }
}

class WxRobot {
    constructor() {

    }
    WxagGameInfo(body: WxagGameInfoBody): WxRobotResponse {
        return
    }
    message(body: MessageBody): WxRobotResponse {
        if (body.isSend) return;
        if (body.type == 1) { // 文本
            return send(body.talker, body.content, body.type)
        }
        if (body.type == 318767153) { // 扫码付款
            // let content = {"msg":{"appmsg":{"$attrs":{"appid":"","sdkver":"0"},"title":"微信支付收款0.01元(朋友到店)","des":"收款金额￥0.01\n汇总今日第2笔收款，共计￥0.02\n备注收款成功，已存入零钱。点击可查看详情","action":"","type":"5","showtype":"1","soundtype":"0","content":"","contentattr":"0","url":"https://payapp.weixin.qq.com/payf2f/jumpf2fbill?timestamp=1571205620&openid=vf3Vvz_8TVF762L8T66q2qs_J1DxcWDS5Q9er28R9aE=","lowurl":"","appattach":{"totallen":"0","attachid":"","fileext":"","cdnthumburl":"","cdnthumbaeskey":"","aeskey":""},"extinfo":"","sourceusername":"","sourcedisplayname":"","mmreader":{"category":{"$attrs":{"type":"0","count":"1"},"name":"微信支付","topnew":{"cover":"","width":"0","height":"0","digest":"收款金额￥0.01\n汇总今日第2笔收款，共计￥0.02\n备注收款成功，已存入零钱。点击可查看详情"},"item":{"itemshowtype":"4","title":"收款到账通知","url":"https://payapp.weixin.qq.com/payf2f/jumpf2fbill?timestamp=1571205620&openid=vf3Vvz_8TVF762L8T66q2qs_J1DxcWDS5Q9er28R9aE=","shorturl":"","longurl":"","pub_time":"1571205620","cover":"","tweetid":"","digest":"收款金额￥0.01\n汇总今日第2笔收款，共计￥0.02\n备注收款成功，已存入零钱。点击可查看详情","fileid":"0","sources":{"source":{"name":"微信支付"}},"styles":{"topColor":"","style":[{"range":"{4,5}","font":"s","color":"#000000"},{"range":"{12,15}","font":"s","color":"#000000"},{"range":"{30,18}","font":"s","color":"#000000"}]},"native_url":"","del_flag":"0","contentattr":"0","play_length":"0","play_url":"","player":"","template_op_type":"1","weapp_username":"gh_fac0ad4c321d@app","weapp_path":"pages/index/index.html","weapp_version":"247","weapp_state":"0","music_source":"0","pic_num":"0","show_complaint_button":"0","vid":"","recommendation":"","pic_urls":"","comment_topic_id":"0","cover_235_1":"","cover_1_1":"","appmsg_like_type":"0","video_width":"0","video_height":"0","is_pay_subscribe":"0"}},"publisher":{"username":"wxzhifu","nickname":"微信支付"},"template_header":{"title":"收款到账通知","title_color":"","pub_time":"1571205620","first_data":"","first_color":"","hide_title_and_time":"0","show_icon_and_display_name":"0","display_name":"","icon_url":"","hide_icon_and_display_name_line":"1","header_jump_url":"","shortcut_icon_url":"","ignore_hide_title_and_time":"1","hide_title":"0","hide_time":"1","pay_style":"1"},"template_detail":{"template_show_type":"1","text_content":{"cover":"","text":"","color":""},"line_content":{"topline":{"key":{"word":"收款金额","color":"#888888","hide_dash_line":"1"},"value":{"word":"￥0.01","color":"#000000","small_text_count":"1"}},"lines":{"line":[{"key":{"word":"汇总","color":"#888888"},"value":{"word":"今日第2笔收款，共计￥0.02","color":"#000000"}},{"key":{"word":"备注","color":"#888888"},"value":{"word":"收款成功，已存入零钱。点击可查看详情","color":"#000000"}}]}},"opitems":{"opitem":{"word":"收款小账本","url":"","icon":"","color":"#000000","weapp_username":"gh_fac0ad4c321d@app","weapp_path":"pages/index/index.html","op_type":"1","weapp_version":"247","weapp_state":"0","hint_word":"","is_rich_text":"0","display_line_number":"0"},"show_type":"1"}},"forbid_forward":"0"},"thumburl":"","template_id":"ey45ZWkUmYUBk_fMgxBLvyaFqVop1rmoWLFd62OXGiU"},"fromusername":"gh_3dfda90e39d6","appinfo":{"version":"0","appname":"微信支付","isforceupdate":"1"}}}
            return;
        }
        delete body.lvbuffer;
        console.log(body)
    }
    AppMessage(body: AppMessageBody): WxRobotResponse {
        return
    }
    SmileyInfo(body: SmileyInfoBody): WxRobotResponse {
        return
	}
    SmileyPanelConfigInfo(body: SmileyPanelConfigInfoBody): WxRobotResponse {
        return
	}
    EmojiSuggestDescInfo(body: EmojiSuggestDescInfoBody): WxRobotResponse {
        return
	}
}

export function WechatRobot(): RequestHandler {
    let robot = new WxRobot();
    return function(req, res, next) {
        let key = req.path.replace('/', '')
        if (robot[key]) {
            Promise.resolve(robot[key](req.body.mValues)).then(function(data) {
                res.end(data ? JSON.stringify(data) : '')
            }, function(err) {
                console.log(key, JSON.stringify(req.body, null, 2))
                next()
            })
        } else {
            console.log(key, JSON.stringify(req.body, null, 2))
            next()
        }
    };
}

export interface WxagGameInfoBody {
    AppName: string;	// '跳一跳'
    IconUrl: string;	// 'http://wx.qlogo.cn/mmhead/Q3auHgzwzM5GNaPCYMrxHaFLkh3kTduKFFbPlNmeHdkly2QlZLmtibQ/96'
    RecordId: string;	// '-984062403'
    debugType: number;	// 0
    isSync: boolean;	// false
    UserName: string;	// 'gh_fefa6be65794@app'
    createTime: number;	// 1571204379417
    AppId: string;	// 'wx7c8d593b2c3a7703'
}

export interface MessageBody {
    bizClientMsgId: string;	// ''
    msgId: number;	// 6564
    msgSvrId: number;	// 4514113469668259300
    talker: string;	// 'wxid_6ozfxx3kxcz622' | 'notifymessage'
    content: string;	// '1'
    flag: number;	// 0
    status: number;	// 3
    msgSeq: number;	// 675765206
    createTime: number;	// 1571204952000
    isSend: number;	// 0
    type: number;	// 1
    lvbuffer: number[];	// 
    talkerId: number;	// 610
    bizChatId: number;	// -1
}

export interface AppMessageBody {
    appId: string;	// ""
    source: string;	// "微信支付"
    description: string;	// "收款金额￥0.01\n汇总今日第2笔收款，共计￥0.02\n备注收款成功，已存入零钱。点击可查看详情"
    title: string;	// "微信支付收款0.01元(朋友到店)"
    msgId: number;	// 6567
    type: number;	// 5
}

// Generated by https://quicktype.io

export interface SmileyInfoBody {
    fileName: string;
    key: string;
    eggIndex: number;
    thValue: string;
    position: number;
    qqValue: string;
    twValue: string;
    flag: number;
    cnValue: string;
    enValue: string;
}
// Generated by https://quicktype.io

export interface SmileyPanelConfigInfoBody {
	position: number;
	key:      string;
}
// Generated by https://quicktype.io

export interface EmojiSuggestDescInfoBody {
	groupID: string;
	desc:    string;
}
