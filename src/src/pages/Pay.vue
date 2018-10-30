<template>
	<div class="pages-pay" :class="size">
		<mu-container>
			<mu-paper class="pay" :z-depth="2">
				<div class="title">
					<router-link to="/">盆儿收银台</router-link> 收款方：{{order.user_name}}
				</div>
				<div class="content">
					<img v-show="query.type==1" style="height:34px;" src="@/assets/wechat.png">
					<div class="detail">扫一扫付款（元）</div>
					<div v-if="order.price||query.price" class="money">{{((order.price||query.price)/100).toFixed(2)}}</div>
					<br v-else>
					<mu-paper class="qrcode" :z-depth="1">
						<img :src="order.url" alt="加载失败">
						<div v-show="query.type==0" class="step btn" @click="step=!step">
							<img v-show="!step" src="https://t.alipayobjects.com/images/rmsweb/T13CpgXf8mXXXXXXXX.png">
							<img v-show="step" src="https://t.alipayobjects.com/images/rmsweb/T1ASFgXdtnXXXXXXXX.png">
						</div>
						<div class="explain">
							<img src="https://t.alipayobjects.com/images/T1bdtfXfdiXXXXXXXX.png" class="fl" width="38" height="38" style="padding:5px;">
							<div>打开手机{{payType}}</div>
							<div>扫一扫继续付款</div>
						</div>
						<div v-show="s<=0" class="mask">
							二维码已过期
						</div>
					</mu-paper>
					<div v-if="query.type==0&&env.wx" class="wechat-way">
						请长按二维码保存至手机后，打开支付宝<br />使用“扫一扫”，点击右上角“相册”选择刚保存的二维码进行支付
					</div>
					<div v-else-if="query.type==0&&env.mb" class="wechat-way">
						<mu-button :to="order.alipay_url" color="indigo">一键启动支付宝APP支付</mu-button>
					</div>
					<a v-else-if="query.type==0" href="https://mobile.alipay.com/index.htm" style="line-height:3;font-size:12px;" target="_blank">首次使用请下载手机支付宝</a>
					<div v-else-if="query.type==1&&env.wx" class="wechat-way">
						请长按二维码选择“识别图中二维码”进行支付
					</div>
					<div v-else-if="query.type==1&&env.mb" class="wechat-way">
						请长按二维码保存图片至手机后，打开微信<br />使用“扫一扫”，点击右上角“相册”选择刚保存的二维码进行支付
					</div>
					<div v-show="s>0" class="timeout">
						请于 {{minute}}分{{second}}秒 内完成支付
					</div>
				</div>
				<mu-divider></mu-divider>
				<div class="footer">
					<mu-button flat color="primary" @click="iampay" :disabled="s<=0||s>110">{{btnTxt}}</mu-button>
				</div>
			</mu-paper>
		</mu-container>
		<mu-dialog title="选择支付方式" :open="needType" :overlay-opacity="0.9" overlay-color="#fff">
			<mu-row gutter>
				<mu-col sm="12" md="6">
					<mu-ripple @click="setType(0)" style="padding:5px;" class="btn">
						<img style="height:34px;" src="@/assets/alipay.png">
					</mu-ripple>
				</mu-col>
				<mu-col sm="12" md="6">
					<mu-ripple @click="setType(1)" style="padding:5px;" class="btn">
						<img style="height:34px;" src="@/assets/wechat.png">
					</mu-ripple>
				</mu-col>
			</mu-row>
		</mu-dialog>
	</div>
</template>
<script>
import Vue from 'vue'
import { ColMixin } from '../components/mixin.js'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component({ mixins: [ColMixin] })
export default class Pay extends Vue {
	query = utils.query({
		u: 3, // 用户ID
		price: 0, // 支付金额
		ext: '', // 附加信息
		type: '', // 支付方式
		app: '',
		id: '',
		t: '',
	})
	step = 0
	s = 0
	order = {}
	env = utils.env
	get btnTxt() {
		if (this.s > 110) return '等待支付...'
		if (this.s > 0) return '确认已支付'
		return '二维码失效'
	}
	get payType() {
		return ['支付宝', '微信'][this.query.type]
	}
	get minute() {
		return (Math.floor(this.s / 60) + 100).toString().slice(1)
	}
	get second() {
		return (this.s % 60 + 100).toString().slice(1)
	}
	get needType() {
		return !this.query.id && [0, 1].indexOf(this.query.type) < 0
	}
	async iampay() {
		await this.$get('orders/iampay', { id: this.query.id, token: this.$route.query.t }, { loading: true })
		await this.$alert('', '您的订单已收到\n商家确认后会在2小时内发货')
		if (this.order.back) location.href = this.order.back
	}
	setType(t) {
		this.query.type = t
		this.refresh()
	}
	async refresh() {
		if (this.needType) return this.$router.replace({ query: '' })
		let order
		if (this.query.id) {
			order = await this.$get('orders/get', { id: this.query.id, t: this.query.t }, { loading: true })
		} else {
			let data = {
				user_id: this.query.u,
				price: this.query.price,
				title: this.query.title,
				type: this.query.type,
				app: this.query.app,
				ext: this.query.ext,
			}
			order = await this.$post('orders/add', data, { loading: true })
			this.query.id = order.id
			this.query.token = order.token
			utils.replace({ id: order.id, t: order.token })
		}
		this.s = Math.floor((order.create_at + 120e3 - new Date()) / 1e3)
		this.order = order
	}
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
@import "~@/styles/methods.less";
.pages-pay {
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
      height: 480px;
      //   height: ~"calc(100vh - 120px)";
      text-align: center;
      .wechat-way {
        margin: 18px 5px;
        color: #fc6a42;
      }
      .detail {
        font-size: 14px;
        color: #999;
        margin-bottom: 0.3em;
      }
      .money {
        font-size: 30px;
        color: #d44d44;
        font-weight: 700;
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
