
const appname = "opendonate";
const config = {
    appname,
    title: "开源涓涓",
    apiDir: "api",
    port: 3000,
    mysql: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "123456",
        database: appname,
        connectionLimit: 50,
        supportBigNumbers: true,
        bigNumberStrings: false,
        charset: "utf8mb4"
    },
    email: {
        user: "admin@inu1255.cn",
        pass: ""
    },
    wechat: { // 公众平台
        appid: "",
        secret: "",
    },
    sina: {
        username: "",
        password: ""
    },
    dev: false, // 开发模式
    v: null, // 是否可见
    error: {
        "400": "非法的参数值、格式或类型",
        "401": "您尚未登录",
        "402": "功能尚未实现",
        "403": "没有权限"
    },
    upload: "public/tmp", // 文件上传目录
    secret: Math.floor(Math.random() * 1e8).toString(36), // 加密字串
    code_expire: 600e3, // 验证码过期时间，10分钟
    routes: {
        initRMB: 0.5, // 初始余额
        invite: 2, // [关闭邀请码,必须邀请码,可选邀请码但必须正确]
        inviteMoney0: 1, // 邀请者获得币数
        inviteMoney1: 1, // 被邀请者获得币数
        money: 0, // 不邀请币数
        tel: 1 // 修改手机号需要验证
    },
    msg: {
        tNum: "T170317004608",
        appcode: '4fb83fa01c2f4772be7bf9e080e62ca8',
    },
    github: {
        client_id: '71bf1da5f2f12cd33862',
        client_secret: '',
    }
};

export = config