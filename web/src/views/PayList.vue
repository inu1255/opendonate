<template>
	<div class="views-pay-list">
		<i-radio inline all label="支付方式" v-model="mode" :opts='["待处理", "支付宝收款", "微信收款", "支付宝转账"]'></i-radio>
		<span style="font-size:.8rem"><span class="green">绿色</span>代表使用了加倍券</span>
		<div class="tar">
			<i-button class="green" @click="$refs.table.search()" style="margin-left:3rem;">搜索</i-button>
		</div>
		<hr>
		<i-table ref="table" :query="query" :headers="headers">
			<td slot="user.name" slot-scope="{item}">
				<div class="flex-center">
					<img style="width:2rem" :src="item.user.avatar" />
					<span>{{item.user.name}}</span>
				</div>
			</td>
			<td slot="price" slot-scope="{item}">
				<span :class="{green:item.x2}">{{item.x2?item.price*1.2:item.price}}</span>
			</td>
			<td slot="create_at" slot-scope="{item}">
				<i-date :value="item.create_at"></i-date>
			</td>
			<td slot="pay_at" slot-scope="{item}">
				<i-date :value="item.pay_at"></i-date>
			</td>
			<td slot="tools" slot-scope="{item}">
				<i-button class="blue" @click="deal(item)">处理</i-button>
			</td>
		</i-table>
		<i-modal :open.sync="body">
			<div v-if="body" class="form-dialog">
				<i-radio inline label="支付方式" v-model="body.mode" :opts='["待处理", "支付宝收款", "微信收款", "支付宝转账"]' :enables="[1,body.addr.alipay,body.addr.wechat,body.addr.account]"></i-radio>
				<hr>
				<div class="tac" v-if="body.mode==1">
					<img style="width:200px" :src="body.addr.alipay"/>
				</div>
				<div class="tac" v-if="body.mode==2">
					<img style="width:200px" :src="body.addr.wechat"/>
				</div>
				<div v-if="body.mode==3">
					<div>支付宝账号：<i-span title="支付宝账号" copy>{{body.addr.account}}</i-span>
					</div>
					<div>支付宝名称：<i-span title="支付宝名称" copy>{{body.addr.name}}</i-span>
					</div>
				</div>
				<i-input label="备注" v-model="body.remark"></i-input>
				<hr>
				<div class="tar">
					<i-button @click="submit" class="green">确定</i-button>
				</div>
			</div>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "PayList",
	data() {
		return {
			mode: 0,
			body: null,
		}
	},
	computed: {
		headers() {
			var modes = ["待处理", "支付宝收款", "微信收款", "支付宝转账"];
			return [{
				key: "id",
				title: "#",
			}, {
				key: "user.name",
				title: "用户",
			}, {
				key: "price",
				title: "金额",
			}, {
				key: "create_at",
				title: "申请时间",
			}, {
				key: "pay_at",
				title: "支付时间",
			}, {
				key: "mode",
				title: "方式",
				text: (item) => modes[item.mode],
			}, {
				key: "remark",
				title: "备注",
				text: (item) => utils.limit(item.remark, 20),
			}, {
				key: "tools",
				title: '操作',
			}]
		}
	},
	watch: {
		mode() {
			this.$refs.table.search(0)
		}
	},
	methods: {
		query(query) {
			query = Object.assign(query, { more: 1, mode: this.mode < 0 ? null : this.mode })
			return this.$get('pay/request_list', query)
		},
		deal(item) {
			this.item = item;
			this.body = Object.assign({}, item)
		},
		async submit() {
			let { id, mode, remark } = this.body;
			let data = { id, mode, remark };
			await this.$post('pay/request_deal', data);
			data.pay_at = +new Date();
			Object.assign(this.item, data)
			this.$toast.success('修改成功');
			this.body = false;
		},
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-pay-list {
	padding: 1rem;
	max-width: 50rem;
	margin: 0 auto;
}
</style>
