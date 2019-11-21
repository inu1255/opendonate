<template>
	<div class="views-payment-list">
		<div class="tar">
			<i-input inline label="搜索" v-model="s" clear></i-input>
			<i-button class="green" @click="data.search()" style="margin-left:3rem;">搜索</i-button>
		</div>
		<hr>
		<el-table ref="table" :data="data.list" size="mini" style="width: 100%" @sort-change="data.onsort($event)">
			<el-table-column prop="trade_id" label="交易号" width="180">
			</el-table-column>
			<el-table-column prop="title" label="商品名称" width="320">
			</el-table-column>
			<el-table-column prop="pub_share_pre_fee" label="收益" width="72" sortable="column">
				<template slot-scope="{row}">
					<span :style="{color:row.coupon_amount?'red':'green'}">{{row.pub_share_pre_fee}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="pay_amount" label="返利" width="72" sortable="column">
				<template slot-scope="{row}">
					<span :style="{color:row.coupon_amount?'red':'green'}">{{row.pay_amount}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="create_at" label="下单时间" width="140" sortable="column">
				<template slot-scope="{row}">
					<i-date :value="row.create_at" format="YYYY-MM-DD hh:mm"></i-date>
				</template>
			</el-table-column>
			<el-table-column prop="earning_at" label="签收时间" width="140" sortable="column">
				<template slot-scope="{row}">
					<i-date :value="row.earning_at" format="YYYY-MM-DD hh:mm"></i-date>
				</template>
			</el-table-column>
			<el-table-column prop="total_commission_fee" label="状态" width="72">
				<template slot-scope="{row}">
					<span v-if="row.total_commission_fee>0" style="color:green">已结算</span>
					<span v-else-if="row.alipay_total_price>0" style="color:blue">已付款</span>
					<span v-else style="color:red">已失效</span>
				</template>
			</el-table-column>
			<el-table-column prop="uid" label="下单用户" align="center" width="84">
				<template slot-scope="{row}">
					<el-avatar v-if="row.uid" :src="$user.get(row.uid).avatar" :title="$user.get(row.uid).name" @click.native="show(row.uid)"></el-avatar>
					<span v-else>-</span>
				</template>
			</el-table-column>
		</el-table>
		<div class="tac">
			<el-pagination @current-change="data.search($event-1)" :page-size="10" layout="total, prev, pager, next, jumper" :total="data.total">
			</el-pagination>
		</div>
	</div>
</template>
<script>
import UserInfo from './UserInfo';
export default {
	name: "PaymentList",
	data() {
		return {
			s: "",
			data: new utils.DataSource(this.query.bind(this))
		}
	},
	watch: {
		"$route.params.id"() {
			this.data.search(0)
		}
	},
	methods: {
		async query(query) {
			query = Object.assign(query, {
				title: this.s,
				uid: this.$route.params.id,
			})
			let ret = await this.$get('payment/list', query)
			this.$user.addcache(ret.users);
			return ret;
		},
		show(uid) {
			utils.open(UserInfo, uid, {
				submitText: 'Ta的订单',
			}).then(
				() => this.$router.push(`/payment/` + uid),
				() => this.$router.push(`/payment`),
			)
		}
	},
	mounted() {
		this.$refs.table.sort('create_at')
		// this.data.search()
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-payment-list {
	padding: 1rem;
	max-width: 68rem;
	margin: 0 auto;
	> .header {
	}
}
</style>
