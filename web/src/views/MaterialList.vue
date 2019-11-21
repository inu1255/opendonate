<template>
	<div class="views-material-list">
		<div class="tar">
			<i-input inline label="搜索" v-model="s" clear></i-input>
			<i-input inline label="销量下限" v-model="minVolume" type="number"></i-input>
			<i-input inline label="折扣率" v-model="minCouponRate" type="number"></i-input>
			<i-button class="green" @click="$refs.table.search()" style="margin-left:3rem;">搜索</i-button>
			<i-button class="blue" @click="ipt">导入</i-button>
		</div>
		<hr>
		<el-table :data="data.list" size="mini" style="width: 100%" @sort-change="data.onsort($event)">
			<el-table-column prop="id" label="#" width="64">
			</el-table-column>
			<el-table-column prop="pict_url" label="商品图片" width="84">
				<template slot-scope="{row}">
					<img style="width:3rem" :src="row.pict_url" />
				</template>
			</el-table-column>
			<el-table-column prop="title" label="商品名称" width="420"></el-table-column>
			<el-table-column prop="volume" label="销量" width="64">
			</el-table-column>
			<el-table-column prop="user_type" label="来源" width="84" sortable="column">
				<template slot-scope="{row}">
					<span>{{['淘宝', '天猫'][row.user_type]}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="zk_final_price" label="价格" width="72" sortable="column">
				<template slot-scope="{row}">
					¥{{row.zk_final_price}}
				</template>
			</el-table-column>
			<el-table-column prop="coupon_amount" label="券" width="120">
				<template slot-scope="{row}">
					{{`满${row.coupon_start_fee}元减${row.coupon_amount}元`}}
				</template>
			</el-table-column>
			<el-table-column prop="tools" label="操作" align="center" width="84">
				<template slot-scope="{row}">
					<i-button class="green" @click="open(row)">领取</i-button>
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
export default {
	name: "MaterialList",
	data() {
		return {
			s: "",
			minVolume: 500,
			minCouponRate: 0.15,
			data: new utils.DataSource(this.query.bind(this))
		}
	},
	computed: {
		headers() {
			var types = ['淘宝', '天猫'];
			return [{
				key: "id",
				title: "#",
			}, {
				key: "pict_url",
				title: "商品图片",
			}, {
				key: "title",
				title: "标题",
				text: (item) => utils.limit(item.title, 20),
			}, {
				key: "volume",
				title: "销量30",
			}, {
				key: "user_type",
				title: "来源",
				text: (item) => types[item.user_type],
			}, {
				key: "zk_final_price",
				title: "价格",
				text: (item) => '¥' + item.zk_final_price,
			}, {
				key: "coupon_amount",
				title: "券",
				text: (item) => `满${item.coupon_start_fee}元减${item.coupon_amount}元`,
			}, {
				key: "tools",
				title: '操作',
			}]
		}
	},
	methods: {
		query(query) {
			query = Object.assign(query, {
				s: this.s,
				minVolume: this.minVolume,
				minCouponRate: this.minCouponRate,
			})
			return this.$get('material/list', query)
		},
		async ipt() {
			let f = await utils.pick('application/xlsx')
			console.log(f)
			let form = new FormData()
			form.append('f', f)
			await this.$post('material/ipt', form)
			this.$toast.success('导入成功')
			this.$refs.table.search(0)
		},
		open(item) {
			window.open(item.coupon_share_url)
		}
	},
	mounted() {
		this.data.search()
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-material-list {
	padding: 1rem;
	max-width: 64rem;
	margin: 0 auto;
	> .header {
	}
}
</style>
