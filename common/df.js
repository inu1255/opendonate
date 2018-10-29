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

// 团队表
df.table('team', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('create_id').comment('创建者'),
    df.varchar('name', 16).notNull().comment('团队名'),
    df.varchar('jobs', 2048).notNull().comment('岗位清单，默认:"管理,产品,开发,测试,内容,运维,客服,销售"'),
    df.varchar('q', 128).comment('问题,加入团队需要回答'),
    df.varchar('a', 32).comment('答案,加入团队问题的答案'),
    df.int('audit').default(0).comment('是否需要审核'),
    df.int('cnt').default(1).comment('团队人数'),
    df.primary('id'),
    df.unique('name'),
    df.foreign('create_id').references('user', 'id')
]);
// 更新 团队人数
// update team set cnt=1+(select count(*) from team_user where team_id=id and state=3)

// 团队用户表
df.table('team_user', [
    df.unsigned('team_id').notNull().comment('团队ID'),
    df.unsigned('user_id').notNull().comment('用户ID'),
    df.varchar('job', 16).comment('职位'),
    df.int('pow').notNull().default(3).comment('权限：0x02-可查看 0x20-可修改'),
    df.int('state').notNull().comment('状态: 0:黑名单 1:申请中 2:拒绝加入 2:正式成员'),
    df.text('ext').comment('{a:申请问题答案}'),
    df.bigint('create_at').notNull().comment('创建时间'),
    df.primary('team_id,user_id'),
    df.foreign('team_id').references('team', 'id'),
    df.foreign('user_id').references('user', 'id')
]);

// 节点
df.table('node', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('create_id').comment('创建者'),
    df.unsigned('parent_id').comment('父结点'),
    df.unsigned('edit_id').comment('最近修改人'),
    df.varchar('path', 128).notNull().default('/').comment('路径(不含自身)：/1/2/34/'),
    df.int('state').notNull().default(3).comment('状态:0x01-可写 0x02客人可见'),
    df.varchar('title', 16).notNull().comment('标题'),
    df.int('taskSum').notNull().default(0).comment('本节点子任务总数'),
    df.int('taskOk').notNull().default(0).comment('本节点已完成任务数'),
    df.int('percent').notNull().default(0).comment('本节点完成度[0,100]'),
    df.bigint('create_at').notNull().comment('创建时间'),
    df.bigint('update_at').notNull().default(0).comment('更新时间（节点直属帖子变化(发布、修改、删除、回复、主题移入、主题移出)，初始同创建时间）'),
    df.bigint('subChg_at').notNull().default(0).comment('子树最近修改时间（子树节点中nTChg最大的一个,0表示没有子节点)'),
    df.bigint('subDel_at').notNull().default(0).comment('最近删除/移走后代节点的时间'),
    df.bigint('plan_at').notNull().default(0).comment('计划完成时间'),
    df.bigint('minPlan_at').notNull().default(0).comment('子树中未完成的主题中的计划时间最早的一个'),
    df.primary('id'),
    df.unique('title'),
    df.index('path'),
    df.foreign('parent_id').references('node', 'id'),
    df.foreign('create_id').references('user', 'id')
]);

// 节点用户关联
df.table('node_user', [
    df.unsigned('node_id').notNull().comment('节点ID'),
    df.unsigned('user_id').notNull().comment('用户ID'),
    df.bigint('visit_at').notNull().default(0).comment('最近打开时间（此用户获取了节点帖子）'),
    df.int('pow').comment('权限：0x01-可见 0x02-查看 0x04-下载 0x08-回复 0x10-发布 0x20-修改 0x40-管理 0x100=删除 null-继承父结点权限'),
    df.varchar('loc', 138).notNull().comment('定位路径(包含自身node_id)：/1/2/34/,为了复杂的检索'),
    df.primary('node_id, user_id'),
    df.foreign('node_id').references('node', 'id'),
    df.foreign('user_id').references('user', 'id')
]);

// 帖子
df.table('post', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('create_id').comment('创建者'),
    df.int('type').notNull().default(10).comment('类别(10=闲聊 20=资料 100=其他非代码类任务 150=定义 160=设计 210=改进 220=新功能 230=测试 240=bug)'),
    df.int('top').notNull().default(0).comment('置顶序号'),
    df.unsigned('node_id').notNull().comment('关联节点ID'),
    df.varchar('title', 48).notNull().comment('标题'),
    df.bigint('create_at').notNull().comment('创建时间'),
    df.bigint('update_at').notNull().comment('最近修改时间'),
    df.unsigned('edit_id').notNull().comment('最近修改人id(任何修改，包括移动)'),
    df.bigint('reply_at').notNull().default(0).comment('最近被回复时间'),
    df.unsigned('head_id').notNull().default(0).comment('负责人ID,0表示不是任务，无需负责人'),
    df.bigint('plan_at').notNull().default(0).comment('计划完成时间,创建人填写，负责人改写'),
    df.int('percent').notNull().default(0).comment('进度,[0,100]，负责人改写'),
    df.int('attCnt').notNull().default(0).comment('附件数量'),
    df.text('content').charset('utf8mb4').comment('帖子内容'),
    df.primary('id'),
    df.index('node_id'),
    df.foreign('node_id').references('node', 'id'),
    df.foreign('create_id').references('user', 'id'),
    df.foreign('edit_id').references('user', 'id')
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

// 主题－用户访问
df.table('post_user', [
    df.unsigned('post_id').notNull().comment('帖子ID'),
    df.unsigned('user_id').notNull().comment('用户ID'),
    df.bigint('open_at').notNull().default(0).comment('最近打开时间（此用户获取了帖子）'),
    df.bigint('called_at').notNull().default(0).comment('最近被@时间'),
    df.bigint('follow_at').notNull().default(0).comment('关注时间,0表示未关注'),
    df.primary('post_id,user_id'),
    df.foreign('post_id').references('post', 'id'),
    df.foreign('user_id').references('user', 'id')
]);

// 回复帖子
df.table('reply', [
    df.unsigned('id').notNull().auto_increment(),
    df.unsigned('post_id').notNull().comment('关联主题帖子ID'),
    df.unsigned('reply_id').comment('所回复的回复帖子ID'),
    df.unsigned('create_id').notNull().comment('发布用户ID'),
    df.unsigned('edit_id').notNull().comment('最近修改人id'),
    df.bigint('create_at').notNull().comment('创建时间'),
    df.bigint('update_at').notNull().comment('最近修改时间'),
    df.text('content').charset('utf8mb4').comment('回复内容'),
    df.primary('id'),
    df.index('post_id'),
    df.foreign('create_id').references('user', 'id'),
    df.foreign('edit_id').references('user', 'id'),
    df.foreign('post_id').references('post', 'id')
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