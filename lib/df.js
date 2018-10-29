const Define = require('../common/db/define');
const argv = require('yargs').argv;
const db = require('../common/db');

let df = new Define();
// 用户表
df.table('user', [
    df.unsigned('id').notNull().auto_increment(),
    df.varchar('account', 32).comment('账号'),
    df.varchar('email', 64).comment('邮箱'),
    df.varchar('tel', 11).comment('手机号'),
    df.varchar('passwd', 32).comment('密码'),
    df.varchar('name', 32).comment('用户名'),
    df.varchar('avatar', 1024).comment('头像'),
    df.varchar('profile', 255).comment('简介'),
    df.int('sex').default(0).comment('性别:0-未知 1-男 2:女'),
    df.bigint('birth_at').default(0).comment('生日'),
    df.varchar('role', 32).default('').comment('角色'),
    df.int('money').default(100).comment('总币数'),
    df.int('mCost').default(0).comment('已使用币数'),
    df.unsigned('invite_id').default(0).comment('邀请人'),
    df.bigint('create_at').notNull().comment('注册时间'),
    df.primary('id'),
    df.unique('account'),
    df.unique('email'),
    df.unique('tel')
]).auto_increment(1024);

// 验证码表
df.table('verify', [
    df.unsigned('id').notNull().auto_increment(),
    df.varchar('title', 64).comment('验证码标识'),
    df.varchar('code', 16).comment('验证码'),
    df.int('rest').default('10').comment('剩余次数'),
    df.bigint('update_at').notNull().default(0).comment('更新时间'),
    df.primary('id')
]);

// 文件表
df.table('file', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('create_id').comment('上传者'),
    df.varchar('name', 128).comment('文件名'),
    df.varchar('ext', 32).comment('文件后缀名'),
    df.varchar('md5', 32).comment('文件md5码'),
    df.bigint('create_at').notNull().comment('上传时间'),
    df.primary('id'),
    df.unique('md5'),
    df.foreign('create_id').references('user', 'id')
]);

df.table('qrcode', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('create_id').notNull().comment('创建用户ID'),
    df.int('price').notNull().comment('金额 0:手输 >0:固定金额'),
    df.varchar('alipay', 256).default('').comment('支付宝 二维码链接'),
    df.varchar('alipay_url', 128).default('').comment('支付宝 支付链接'),
    df.varchar('wechat', 256).default('').comment('微信 二维码链接'),
    df.varchar('api', 256).notNull().comment('自动发货接口- http://xxx.com?foo=bar'),
    df.varchar('cer', 32).notNull().comment('签名字符串'),
    df.varchar('back', 256).default('').comment('支付后返回链接'),
    df.primary('id'),
    df.unique('create_id,price')
]);
// qrcode生成付款链接 -> 用户生成orders -> 通知商家 -> 支付 -> [用户点击已经付款] -> 商家反馈已经付款 -> 调用发货接口 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign

df.table('orders', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('user_id').notNull().comment('收款方ID(冗余)'),
    df.unsigned('qr_id').notNull().comment('二维码ID'),
    df.int('type').notNull().comment('二维码类型 0-支付宝 1-微信'),
    df.bigint('create_at').notNull().comment('订单创建时间'),
    df.int('state').notNull().default(0).comment('状态: 0:待审核 1:支付失败 2:支付成功'),
    df.bigint('pay_at').default(0).comment('用户说自己已经付款了'),
    df.varchar('ext', 2048).default('').comment('商户自定义参数'),
    df.int('ret').notNull().default(0).comment('发货状态: 0:待发货 1:发货失败 2:发货成功 3:手动发货'),
    df.varchar('msg', 256).default('').comment('报错信息'),
    df.int('price').notNull().comment('金额 0:手输 >0:固定金额(冗余)'),
    df.varchar('ip', 64).comment('订单创建IP'),
    df.varchar('ua', 256).default('').comment('订单创建客户端'),
    df.primary('id'),
    df.index('qr_id'),
    df.index('user_id')
]);

df.table('donate', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('user_id').notNull().comment('收款方ID'),
    df.varchar('email', 64).comment('捐赠者邮箱'),
    df.int('price').notNull().comment('金额 0:手输 >0:固定金额'),
    df.bigint('create_at').notNull().comment('捐赠时间(确认收款时间)'),
    df.varchar('remark', 64).default('').comment('备注'),
    df.primary('id')
]);

exports.df = df;
exports.merge = async function() {
    if (argv.table) return await df.tables[argv.table].merge(db, true);
    return await df.merge(db, true);
};
exports.table = async function() {
    let tables = [];
    if (argv.table) {
        tables.push({ name: argv.table, sqls: await df.tables[argv.table].merge(db) });
    } else {
        tables = await df.merge(db);
    }
    for (let item of tables) {
        console.log('表格:', item.name);
        for (let sql of item.sqls) {
            console.log(sql);
        }
    }
};
exports.params = async function() {
    if (argv.table) {
        let params = df.tables[argv.table].params();
        console.log(JSON.stringify(params, null, 4));
    } else {
        console.log('需要指定table');
    }
};
exports.ts = async function() {
    if (argv.table) {
        let str = df.tables[argv.table].typescript();
        console.log(str);
    } else {
        console.log('需要指定table');
    }
};

async function main() {
    if (exports[argv._[0]]) {
        await exports[argv._[0]]();
    } else {
        console.log('未知指令:', argv._[0]);
    }
}

if (require.main == module) {
    main(process.argv[2]).then(function() {
        process.exit();
    }).catch(function(err) {
        console.log(err);
        console.log("err end");
        process.exit(1);
    });
}