import axios from "axios";
import * as config from './config';

export async function pushNotice(id: string, token: string, text: string, url?: string): Promise<number> {
    let { data } = await axios.get(`https://quan2go.inu1255.cn/api/channel/push?id=${id}:${token}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    return data.data.n;
}

export async function createTemplate() {
    let { data } = await axios.get('https://ali-sms.showapi.com/createTemplate', {
        params: {
            content: `您的验证码是: [code] ，您正在进行身份验证，打死不要告诉别人哦！！`,
            notiPhone: `18782071219`,
            title: '券二狗'
        },
        headers: {
            Authorization: 'APPCODE ' + config.msg.appcode
        },
        validateStatus: () => true
    })
}