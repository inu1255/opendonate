const greendb = require("greendb");

let df = new greendb.TableBuilder();
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
	df.opts('sex', ["未知", "男", "女"]).default(0).comment('性别'),
	df.bigint('birth_at').default(0).comment('生日'),
	df.int('lvl').default(100).comment('权限').update("lvl=if(role='admin',0,100)"),
	df.int('money').default(100).comment('总币数'),
	df.int('mCost').default(0).comment('已使用币数'),
	df.unsigned('invite_id').default(0).comment('邀请人'),
	df.bigint('create_at').notNull().comment('注册时间'),
	df.bigint('login_at').default(0).comment('登录时间'),
	df.primary('id'),
	df.unique('account'),
	df.unique('email'),
	df.unique('tel'),
]).auto_increment(1024);

// 验证码表
df.table('verify', [
	df.unsigned('id').notNull().auto_increment(),
	df.varchar('title', 64).comment('验证码标识'),
	df.varchar('code', 16).comment('验证码'),
	df.int('rest').default('10').comment('剩余次数'),
	df.bigint('update_at').notNull().default(0).comment('更新时间'),
	df.primary('id'),
]);

// 文件表
df.table('file', [
	df.unsigned('id').notNull().auto_increment(),
	df.unsigned('create_id').comment('上传者'),
	df.varchar('ip', 64).comment('上传图片的IP'),
	df.varchar('ua', 256).default('').comment('客户端信息'),
	df.varchar('name', 256).comment('文件名'),
	df.varchar('ext', 32).comment('文件后缀名'),
	df.bigint('create_at').notNull().comment('上传时间'),
	df.primary('id'),
	df.foreign('create_id').references('user', 'id'),
]);

df.table('qrcode', [
	df.unsigned('id').notNull().auto_increment(),
	df.unsigned('create_id').notNull().comment('创建用户ID'),
	df.int('price').notNull().comment('金额 0:手输 >0:固定金额'),
	df.varchar('alipay', 256).default('').comment('支付宝 二维码链接'),
	df.varchar('alipay_url', 128).default('').comment('支付宝 支付链接'),
	df.varchar('wechat', 256).default('').comment('微信 二维码链接'),
	df.primary('id'),
	df.unique('create_id,price'),
]);
// qrcode生成付款链接 -> 用户生成orders -> 通知商家 -> 支付 -> [用户点击已经付款] -> 商家反馈已经付款 -> 调用发货接口 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign

df.table('app', [
	df.unsigned('id').notNull().auto_increment(),
	df.unsigned('create_id').notNull().comment('创建用户ID'),
	df.varchar('title', 16).notNull().comment('项目名称'),
	df.varchar('url', 256).notNull().comment('自动发货接口 http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign'),
	df.varchar('cer', 32).notNull().comment('签名字符串'),
	df.varchar('back', 256).default('').comment('支付后返回链接'),
	df.opts('type', ['自定义', '捐赠']).default(0).comment('项目类型'),
	df.text('detail').comment('项目介绍'),
	df.primary('id'),
	df.unique('create_id,title'),
]);

df.table('orders', [
	df.unsigned('id').notNull().auto_increment(),
	df.unsigned('user_id').notNull().comment('收款方ID(冗余)'),
	df.unsigned('qr_id').notNull().comment('二维码ID'),
	df.unsigned('app_id').notNull().comment('项目ID'),
	df.opts('type', ['支付宝', '微信']).comment('二维码类型'),
	df.bigint('create_at').notNull().comment('订单创建时间'),
	df.opts('state', ["待审核", "支付失败", "支付成功"]).notNull().default(0).comment('状态'),
	df.bigint('pay_at').default(0).comment('用户说自己已经付款了'),
	df.varchar('ext', 2048).default('').comment('商户自定义参数'),
	df.opts('ret', ["待发货", "发货失败", "发货成功", "手动发货"]).notNull().default(0).comment('发货状态'),
	df.varchar('msg', 256).default('').comment('报错信息'),
	df.int('price').notNull().comment('金额 0:手输 >0:固定金额(冗余)'),
	df.varchar('ip', 64).comment('订单创建IP'),
	df.varchar('ua', 256).default('').comment('订单创建客户端'),
	df.primary('id'),
	df.index('qr_id'),
	df.index('user_id'),
]);

df.table('donate', [
	df.unsigned('id').notNull().auto_increment(),
	df.unsigned('app_id').notNull().comment('项目ID'),
	df.varchar('email', 64).comment('捐赠者邮箱'),
	df.int('price').notNull().comment('金额 0:手输 >0:固定金额'),
	df.bigint('create_at').notNull().comment('捐赠时间(确认收款时间)'),
	df.varchar('remark', 64).default('').comment('备注'),
	df.primary('id'),
]);

module.exports = df;