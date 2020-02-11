declare namespace db {
interface User {
	id?: number, 
	account?: string,  // 账号
	email?: string,  // 邮箱
	tel?: string,  // 手机号
	passwd?: string,  // 密码
	name?: string,  // 用户名
	avatar?: string,  // 头像
	profile?: string,  // 简介
	sex?: number,  // 性别
	birth_at?: number,  // 生日
	lvl?: number,  // 权限
	money?: number,  // 总币数
	mCost?: number,  // 已使用币数
	invite_id?: number,  // 邀请人
	create_at: number,  // 注册时间
	login_at?: number,  // 登录时间
	github_id?: number,  // 关联github的ID
}interface Verify {
	id?: number, 
	title?: string,  // 验证码标识
	code?: string,  // 验证码
	rest?: number,  // 剩余次数
	update_at?: number,  // 更新时间
}interface File {
	id?: number, 
	create_id?: number,  // 上传者
	ip?: string,  // 上传图片的IP
	ua?: string,  // 客户端信息
	name?: string,  // 文件名
	ext?: string,  // 文件后缀名
	create_at: number,  // 上传时间
}interface Qrcode {
	id?: number, 
	account: string,  // 创建用户账号
	price: number,  // 金额 0:手输 >0:固定金额
	alipay?: string,  // 支付宝 二维码链接
	alipay_url?: string,  // 支付宝 支付链接
	wechat?: string,  // 微信 二维码链接
}interface App {
	id?: number, 
	account: string,  // 收款方账号
	appname: string,  // 项目名
	title: string,  // 项目名称
	url?: string,  // 自动发货接口 http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign
	cer?: string,  // 签名字符串
	back?: string,  // 支付后返回链接
	detail?: string,  // 项目介绍
}interface Orders {
	id?: number, 
	account: string,  // 收款方账号
	appname: string,  // 项目名
	type?: number,  // 二维码类型
	create_at: number,  // 订单创建时间
	state?: number,  // 状态
	pay_at?: number,  // 用户说自己已经付款了
	ret?: number,  // 发货状态
	msg?: string,  // 报错信息
	price: number,  // 金额 0:手输 >0:固定金额(冗余)
	ip?: string,  // 订单创建IP
	ua?: string,  // 订单创建客户端
	email?: string,  // 捐赠者邮箱
	remark?: string,  // 备注
}}