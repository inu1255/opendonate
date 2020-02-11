<template>
	<v-container v-if="order" class="views-pay">
		<v-card class="pay" :elevation="2">
			<v-card-title>
				收款方：<a :href="`https://github.com/${order.account}/${order.appname}`" target="_blank"><b>{{order.account}}/{{order.appname}}</b></a>
			</v-card-title>
			<v-card-text v-if="s<=0" class="content">
				订单已超期
			</v-card-text>
			<v-card-text v-else class="content">
				<img v-show="type==1" style="height:34px;" src="@/assets/wechat.png">
				<div class="detail" v-if="type!=null">扫一扫付款(元)</div>
				<div class="detail" v-else>请选择支付方式</div>
				<div v-if="order.price" class="money">{{(order.price/100).toFixed(2)}}</div>
				<br v-else>
				<v-card v-show="type!=null" class="qrcode" :elevation="1">
					<img :src="orderUrl" alt="加载失败">
					<div v-show="type==0" class="step btn" @click="step=!step">
						<img v-show="!step" src="https://t.alipayobjects.com/images/rmsweb/T13CpgXf8mXXXXXXXX.png">
						<img v-show="step" src="https://t.alipayobjects.com/images/rmsweb/T1ASFgXdtnXXXXXXXX.png">
					</div>
					<div v-if="type==0" class="explain">
						<img src="https://t.alipayobjects.com/images/T1bdtfXfdiXXXXXXXX.png" class="fl" width="38" height="38" style="padding:5px;">
						<template v-if="env.iswx">
							<div>打开手机{{payType}}</div>
							<div>扫一扫继续付款</div>
						</template>
						<template v-else-if="env.ismb">
							<div>打开手机{{payType}}</div>
							<div>扫一扫继续付款</div>
						</template>
						<template v-else>
							<div>打开手机{{payType}}</div>
							<div>扫一扫继续付款</div>
						</template>
					</div>
					<div v-else class="explain">
						<img src="https://t.alipayobjects.com/images/T1bdtfXfdiXXXXXXXX.png" class="fl" width="38" height="38" style="padding:5px;">
						<template v-if="env.iswx">
							<div>请长按二维码</div>
							<div>选择“识别图中二维码”</div>
						</template>
						<template v-else-if="env.ismb">
							<div>打开手机{{payType}}</div>
							<div>扫一扫继续付款</div>
						</template>
						<template v-else>
							<div>打开手机{{payType}}</div>
							<div>扫一扫继续付款</div>
						</template>
					</div>
					<div v-show="s<=0" class="mask">
						二维码已过期
					</div>
				</v-card>
				<div v-if="type==0&&env.iswx" class="my-4">
					请长按二维码保存至手机后，打开支付宝<br />使用“扫一扫”，点击右上角“相册”选择刚保存的二维码进行支付
				</div>
				<div v-else-if="type==0&&env.ismb" class="my-4">
					<v-btn @click="openAlipay()" color="blue" dark>一键启动支付宝APP支付</v-btn>
				</div>
				<a v-else-if="type==0" href="https://mobile.alipay.com/index.htm" style="line-height:3;font-size:12px;" target="_blank">首次使用请下载手机支付宝</a>
				<div v-else-if="type==1&&env.ismb&&!env.iswx" class="my-4">
					请长按二维码保存图片至手机后，打开微信<br />使用“扫一扫”，点击右上角“相册”选择刚保存的二维码进行支付
				</div>
				<div v-show="s>0&&type!=null" class="mt-4">
					请于 {{minute}}分{{second}}秒 内完成支付
				</div>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions class="footer">
				<v-spacer></v-spacer>
				<v-btn text color="primary" @click="iampay" :disabled="s<=0||s>wait">{{btnTxt}}</v-btn>
			</v-card-actions>
		</v-card>
		<v-dialog :value="needType" width="360" persistent>
			<v-card>
				<v-card-title v-if="env.iswx">推荐用微信支付</v-card-title>
				<v-card-title v-else-if="env.ismb">推荐用支付宝支付</v-card-title>
				<v-card-title v-else>选择支付方式</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" @click="setType(0)">支付宝</v-btn>
					<v-btn color="success" @click="setType(1)">微信支付</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>
<script>
import { ua } from '../common/utils';

export default {
	data() {
		return {
			step: 0,
			s: 0,
			order: null,
			env: ua,
			choose_type: null,
			wait: 0,
		}
	},
	watch: {
		choose_type() {
			this.wait = this.s - 5;
		}
	},
	computed: {
		btnTxt() {
			if (this.s > this.wait) return '等待支付...'
			if (this.s > 0) return '确认已支付'
			return '订单已失效'
		},
		minute() {
			return (Math.floor(this.s / 60) + 100).toString().slice(1)
		},
		second() {
			return (this.s % 60 + 100).toString().slice(1)
		},
		query() {
			return this.$route.query;
		},
		id() {
			return parseInt(this.$route.params.id);
		},
		type() {
			return this.query.type || this.choose_type;
		},
		payType() {
			if (ua.iswx && this.type == 0) {
				require('../common/iswx');
			}
			return ['支付宝', '微信'][this.type]
		},
		needType() {
			return this.order && this.s > 0 && [0, 1].indexOf(this.type) < 0
		},
		orderUrl() {
			let order = this.order;
			return [order.alipay, order.wechat][this.type];
		},
	},
	methods: {
		async iampay() {
			let id = this.id;
			await this.$get('orders/iampay', { id, token: this.query.token, type: this.type })
			await ivue.alert('您的捐赠已提交\n作者确认后会显示在捐赠名单上')
			if (this.order.back) window.open(this.order.back)
			let { account, appname } = this.order
			this.$router.go(-1)
		},
		setType(t) {
			this.choose_type = t
		},
		async openAlipay() {
			if (utils.copy(this.order.price / 100))
				await this.$toast.success('已复制金额，正在跳转...')
			window.open(this.order.alipay_url)
		},
		async refresh() {
			let order
			let id = this.id;
			let query = this.query;
			if (id) {
				try {
					order = await this.$get('orders/get', { id, t: query.token })
				} catch (e) {
					if (e.no == 404) {
						alert('订单不存在')
						window.open("about:blank", "_self").close()
					} else throw e
				}
			} else {
				let { account, appname, price, email, remark } = query
				let data = {
					account, appname, price, email, remark,
					type: this.type,
					json: 1,
				}
				order = await this.$post('orders/create', data)
				this.$router.replace('/pay/' + order.id + '?token=' + order.token)
			}
			if (order) {
				this.s = Math.floor((order.create_at + 300e3 - Date.now()) / 1e3)
				this.wait = this.s - 5;
			}
			this.order = order;
		},
	},
	mounted() {
		this.refresh()
		let hander = setInterval(() => {
			if (this.s >= 0) this.s--
		}, 1e3)
		this.$once('hook:beforeDestroy', function () {
			clearInterval(hander)
		})
	}
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-pay {
	&.md {
		margin: 10vh 0;
		> .container {
			padding-right: 8px;
			padding-left: 8px;
		}
	}
	> .container {
		padding-right: 0;
		padding-left: 0;
	}
	.pay {
		> .title {
			position: relative;
			z-index: 0;
			height: 60px;
			line-height: 60px;
			padding: 0 15px;
			border-bottom: 1px solid #d4d4d4;
			border-radius: 8px 8px 0 0;
			box-shadow: rgba(0, 0, 0, 0.06) 0 1px 7px;
			background: #f3f3f3;
			background: -webkit-linear-gradient(#fbfbfb, #ececec);
			background: linear-gradient(#fbfbfb, #ececec);
			font-size: 18px;
			color: #333;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		> .content {
			padding: 30px 0;
			overflow: hidden;
			//   height: ~"calc(100vh - 120px)";
			text-align: center;
			.detail {
				font-size: 14px;
				color: #999;
				margin-bottom: 0.3em;
			}
			.money {
				font-size: 30px;
				color: #d44d44;
				font-weight: 700;
				margin: 8px;
			}
			.qrcode {
				position: relative;
				padding: 5px;
				width: 178px;
				height: 227px;
				margin: auto;
				> img {
					width: 168px;
					height: 168px;
				}
				> .step {
					position: absolute;
					left: 100%;
					top: -48px;
				}
				> .explain {
					padding-top: 5px;
					font-size: 13px;
					font-weight: 400;
				}
			}
			.mask {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(222, 222, 222, 0.95);
				line-height: 227px;
				font-size: 16px;
			}
		}
		> .footer {
			text-align: right;
			padding: 12px 15px;
		}
	}
}
</style>
