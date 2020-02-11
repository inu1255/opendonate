<template>
	<v-container>
		<v-data-table class="elevation-1" :items="data.list" :options="data.options" @update:options="data.update($event)" :headers="headers" :server-items-length="data.total" :loading="data.loading" hide-default-footer>
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-toolbar-title>用户管理</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn @click="data.search(0)" color="success" class="ml-2">刷新</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.avatar="{item}">
				<v-avatar size="36"><img :src="item.avatar"></v-avatar>
			</template>
			<template v-slot:item.create_at="{item}">
				<i-date :value="item.create_at"></i-date>
			</template>
			<template v-slot:item.login_at="{item}">
				<i-date :value="item.login_at"></i-date>
			</template>
			<template v-slot:item.get_coupon_at="{item}">
				<i-date :value="item.get_coupon_at"></i-date>
			</template>
			<template v-slot:footer v-if="$size.sm&&data.totalPage>1">
				<v-divider></v-divider>
				<i-page class="pa-2" circle :value="data.options.page-1" @input="data.options.page=$event+1" :total="data.total"></i-page>
			</template>
		</v-data-table>
		<v-btn v-if="!$size.sm" class="mt-2" block text :loading="data.loading" @click="data.loadmore()">加载更多</v-btn>
	</v-container>
</template>
<script>
export default {
	data() {
		return {
			data: new utils.DataSource(this.query),
			headers: [{
				value: "id",
				text: "#",
				sortable: false,
			}, {
				value: "avatar",
				text: "头像",
				sortable: false,
			}, {
				value: "name",
				text: "用户名",
				sortable: false,
			}, {
				value: "money",
				text: "券总数",
			}, {
				value: "rmb",
				text: "总返利",
			}, {
				value: "rmbCost",
				text: "已提现",
			}, {
				value: "create_at",
				text: "注册时间",
			}, {
				value: "login_at",
				text: "登录时间",
			}, {
				value: "get_coupon_at",
				text: "最近领券",
			},]
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
	},
	components: {

	},
}
</script>