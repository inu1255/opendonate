declare namespace apar {
interface AppAddBody{
	[key:string]:any;
	id?:number; // id
	title:string; // 项目名称
	url:string; // http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign
	cer:string; // 签名字符串
	back?:string; // 支付后返回链接
}
interface AppDelBody{
	[key:string]:any;
	id:number; // appid
}
interface AppGetBody{
	[key:string]:any;
	id:number; // 项目ID
}
interface AppListBody{
	[key:string]:any;
	id?:number; // id
	create_id?:number; // 创建用户ID
	title?:string; // 项目名称
	url?:string; // http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign
	cer?:string; // 签名字符串
	back?:string; // 支付后返回链接
	page?:number; // 页码 默认:0
	pageSize?:number; // 分页大小 默认:10
	sortBy?:string; // 排序方式
	desc?:number; // 降序
}
interface DonateAddBody{
	[key:string]:any;
	id?:number; // id
	app_id:number; // 项目ID
	email?:string; // 捐赠者邮箱
	price:number; // 0:手输 >0:固定金额
	remark?:string; // 备注
}
interface DonateDelBody{
	[key:string]:any;
	id:number; // donateid
}
interface DonateListBody{
	[key:string]:any;
	id?:number; // id
	app_id?:number; // 项目ID
	email?:string; // 捐赠者邮箱
	minPrice?:number; // 0:手输 >0:固定金额
	maxPrice?:number; // 0:手输 >0:固定金额
	minCreateAt?:number; // 捐赠时间(确认收款时间)
	maxCreateAt?:number; // 捐赠时间(确认收款时间)
	remark?:string; // 备注
	page?:number; // 页码 默认:0
	pageSize?:number; // 分页大小 默认:10
	sortBy?:string; // 排序方式
	desc?:number; // 降序
}
interface FileUploadBody{
	[key:string]:any;
	f?:FormFile; // 文件
}
interface OrdersAddBody{
	[key:string]:any;
	id?:number; // id
	user_id:number; // 收款方ID(冗余)
	qr_id:number; // 二维码ID
	app_id:number; // 项目ID
	type:number; // 二维码类型
	state:number; // 状态
	pay_at?:number; // 用户说自己已经付款了
	ext?:string; // 商户自定义参数
	ret:number; // 发货状态
	msg?:string; // 报错信息
	price:number; // 0:手输 >0:固定金额(冗余)
	ua?:string; // 订单创建客户端
}
interface OrdersCreateBody{
	[key:string]:any;
	aid:number; // 项目ID
	price:number; // 金额(分)
	type?:number; // 支付方式
	ext?:string; // 附加信息
	json?:number; // 是否返回JSON
}
interface OrdersDelBody{
	[key:string]:any;
	id:number; // ordersid
}
interface OrdersGetBody{
	[key:string]:any;
	id?:number; // 订单ID
	t?:string; // 签名
}
interface OrdersIampayBody{
	[key:string]:any;
	id:number; // 订单ID
	token:string; // 签名
}
interface OrdersListBody{
	[key:string]:any;
	id?:number; // id
	user_id?:number; // 收款方ID(冗余)
	qr_id?:number; // 二维码ID
	app_id?:number; // 项目ID
	type?:number; // 二维码类型
	minCreateAt?:number; // 订单创建时间下限
	maxCreateAt?:number; // 订单创建时间上限
	state?:number; // 状态
	minPayAt?:number; // 用户说自己已经付款了
	maxPayAt?:number; // 用户说自己已经付款了
	ext?:string; // 商户自定义参数
	ret?:number; // 发货状态
	msg?:string; // 报错信息
	minPrice?:number; // 0:手输 >0:固定金额(冗余)
	maxPrice?:number; // 0:手输 >0:固定金额(冗余)
	ip?:string; // 订单创建IP
	ua?:string; // 订单创建客户端
	page?:number; // 页码 默认:0
	pageSize?:number; // 分页大小 默认:10
	sortBy?:string; // 排序方式
	desc?:number; // 降序
}
interface OrdersSetBody{
	[key:string]:any;
	id:number; // 订单ID
	state?:number; // 支付状态
	send?:string; // 是否发货
	ext?:string; // 附加信息
}
interface QrcodeAddBody{
	[key:string]:any;
	id?:number; // id
	price:number; // 0:手输 >0:固定金额
	alipay?:string; // 二维码链接
	alipay_url?:string; // 支付链接
	wechat?:string; // 二维码链接
}
interface QrcodeDelBody{
	[key:string]:any;
	id:number; // qrcodeid
}
interface QrcodeListBody{
	[key:string]:any;
	id?:number; // id
	create_id?:number; // 创建用户ID
	minPrice?:number; // 0:手输 >0:固定金额
	maxPrice?:number; // 0:手输 >0:固定金额
	alipay?:string; // 二维码链接
	alipay_url?:string; // 支付链接
	wechat?:string; // 二维码链接
	page?:number; // 页码 默认:0
	pageSize?:number; // 分页大小 默认:10
	sortBy?:string; // 排序方式
	desc?:number; // 降序
}
interface UserAddBody{
	[key:string]:any;
	name?:string; // 姓名
	account?:string; // 账号
	email?:string; // 邮箱
	tel?:string; // 电话号码
	passwd?:string; // 密码
	avatar?:string; // 头像url
	profile?:string; // 个人介绍
	role?:string; // 角色
}
interface UserCodeCheckBody{
	[key:string]:any;
	title:string; // 邮箱/手机
	code:string; // 验证码
}
interface UserCodeSendBody{
	[key:string]:any;
	title:string; // 手机号或邮箱
	code?:string; // 图片验证码
}
interface UserEditBody{
	[key:string]:any;
	id?:number; // 用户ID
	name?:string; // 姓名
	account?:string; // 账号
	email?:string; // 邮箱
	ecode?:string; // 邮箱验证码
	tel?:string; // 电话号码
	tcode?:string; // 手机验证码
	passwd?:string; // 密码
	passwd0?:string; // 旧密码
	avatar?:string; // 头像url
	profile?:string; // 个人介绍
	role?:string; // 角色
	money?:number; // 金币
	sex?:number; // 性别
	birth_at?:number; // 生日
}
interface UserGetBody{
	[key:string]:any;
	id?:string; // 用户ID
}
interface UserListBody{
	[key:string]:any;
}
interface UserLoginBody{
	[key:string]:any;
	title:string; // 账号/邮箱/电话号码
	passwd:string; // 密码
}
interface UserLogoutBody{
	[key:string]:any;
}
interface UserQrLoginBody{
	[key:string]:any;
	token?:string; // 口令
}
interface UserRegisterBody{
	[key:string]:any;
	name?:string; // 用户名
	account?:string; // 账号
	title?:string; // 手机号或邮箱
	passwd:string; // 密码
	code?:string; // 验证码
	invite?:string; // 邀请码
}
interface UserSearchBody{
	[key:string]:any;
	user_id?:number; // 用户ID
	invite_id?:number; // 邀请用户ID
	email?:string; // 邮箱
	account?:string; // 账号
	page?:number; // 页码 默认:0
	pageSize?:number; // 分页大小 默认:10
	sortBy?:string; // 排序方式
	desc?:number; // 降序
}
interface UserWhoamiBody{
	[key:string]:any;
	force?:number; // 是否强制刷新个人信息
}
}