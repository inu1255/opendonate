<template>
	<div class="views-user-list">
		<div class="tar">
			<i-button class="green" @click="$refs.table.search()" style="margin-left:3rem;">搜索</i-button>
		</div>
		<hr>
		<el-table :data="data.list" size="mini" style="width: 100%" @sort-change="data.onsort($event)">
			<el-table-column prop="id" label="#" width="64">
			</el-table-column>
			<el-table-column prop="avatar" label="头像" align="center" width="84">
				<template slot-scope="{row}">
					<el-avatar :src="row.avatar" :title="row.name"></el-avatar>
				</template>
			</el-table-column>
			<el-table-column prop="name" label="用户名" width="150">
			</el-table-column>
			<el-table-column prop="money" label="券总数" width="96" sortable="column">
			</el-table-column>
			<el-table-column prop="rmb" label="总返利" width="96" sortable="column">
			</el-table-column>
			<el-table-column prop="rmbCost" label="已提现" width="96" sortable="column">
			</el-table-column>
			<el-table-column prop="create_at" label="注册时间" width="100" sortable="column">
				<template slot-scope="{row}">
					<i-date :value="row.create_at"></i-date>
				</template>
			</el-table-column>
			<el-table-column prop="login_at" label="登录时间" width="100" sortable="column">
				<template slot-scope="{row}">
					<i-date :value="row.login_at"></i-date>
				</template>
			</el-table-column>
			<el-table-column prop="get_coupon_at" label="最近领券" width="100" sortable="column">
				<template slot-scope="{row}">
					<i-date :value="row.get_coupon_at"></i-date>
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
	data() {
		return {
			s: {

			},
			data: new utils.DataSource(this.query.bind(this))
		}
	},
	computed: {
	},
	methods: {
		query(query) {
			return this.$get('user/search', query)
		},
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
.views-user-list {
	padding: 1rem;
	max-width: 56rem;
	margin: 0 auto;
}
</style>
