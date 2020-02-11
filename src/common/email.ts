import * as nodemailer from 'nodemailer';
import { devLogger as logger } from "./log";
import * as config from "./config";

const transporter = nodemailer.createTransport({
    pool: true,
    service: "qq",
    auth: config.email,
});

transporter.verify(function(error, success) {
    if (error) {
        logger.warn('邮箱发送系统初始化失败', error);
    } else {
        logger.info('邮箱发送系统初始化成功');
    }
});

function sendMail(message: nodemailer.SendMailOptions) {
    return new Promise(function(resolve, reject) {
        transporter.sendMail(message, function(error, info) {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}

/**
 * 发送验证码
 * @param to 目标邮箱
 * @param code 验证码
 */
export function sendCode(to: string, code: string) {
    const message = {
        from: `${config.title}<admin@inu1255.cn>`,
        to,
        subject: config.title + '验证码',
        html: `<p>您的验证码是[${code}]</p><p>your verification code is [${code}]</p>`
    };
    return sendMail(message)
}

/**
 * 发送邮件
 * @param {string} to xx@xx.com
 * @param {string} title 邮件标题
 * @param {string} html 邮件html
 */
export function sendHtml(to: string, title: string, html: string) {
    const message = {
        from: `${config.title}<admin@inu1255.cn>`,
        to,
        subject: title,
        html
    };
    return sendMail(message)
}