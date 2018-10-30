<template>
	<div class="pages-project">
		<br>
		<div style="text-align: right;">
			<mu-button @click="addDemo" color="indigo">添加Demo</mu-button>
			<mu-button @click="body={}" color="secondary">添加</mu-button>
			<mu-button @click="refresh" color="primary">刷新</mu-button>
		</div>
		<br>
		<mu-paper :z-depth="1">
			<mu-data-table :loading="loading" :columns="columns" :data="table_data" :sort.sync="sort">
				<template slot-scope="{row, $index}">
					<td>{{row.title}}</td>
					<td>{{row.url}}</td>
					<td>{{row.cer}}</td>
					<td>{{row.back}}</td>
					<td>
						<mu-menu cover placement="bottom-end">
							<mu-icon value="more_vert"></mu-icon>
							<mu-list slot="content">
								<mu-list-item @click="payQr(row, $index)" button>
									<mu-list-item-title>测试</mu-list-item-title>
								</mu-list-item>
								<mu-list-item @click="body=row" button>
									<mu-list-item-title>编辑</mu-list-item-title>
								</mu-list-item>
								<mu-list-item @click="delApp(row, $index)" button>
									<mu-list-item-title>删除</mu-list-item-title>
								</mu-list-item>
							</mu-list>
						</mu-menu>
					</td>
				</template>
			</mu-data-table>
		</mu-paper>
		<i-form width="480" :params="columns" :open.sync="body" :submit="onAdd"></i-form>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class Project extends Vue {
	@State(state => state.user.user) user
	list = []
	columns = [{
		title: '项目名称',
		name: 'title',
		width: 128,
		type: 'text',
		sortable: true,
		maxlength: 16,
	}, {
		title: '发货接口',
		name: 'url',
		type: 'text',
		rules: utils.rule('url'),
		maxlength: 256,
	}, {
		title: '密钥',
		name: 'cer',
		type: 'text',
		maxlength: 32,
	}, {
		title: '回跳网址',
		name: 'back',
		type: 'text',
		rules: utils.rule('url'),
		maxlength: 256,
	}, {
		title: '操作',
		name: 'tools',
		width: 48,
	}]
	loading = false
	body = false
	api = false
	sort = { name: 'price', order: 'asc' }
	get table_data() {
		let list = this.list.concat()
		let name = this.sort.name
		if (name) {
			let o = this.sort.order == 'desc' ? -1 : 1
			list.sort((a, b) => {
				let v = a[name] - b[name]
				if (v) return v * o
			})
		}
		return list
	}
	format(item) {

	}
	async payQr(row) {
		window.open(`/donate/${row.id}?page=1&n=1`)
	}
	async onAdd(data) {
		if (data.id) {
			data = await this.$post('orders/app_add', data)
			this.format(data)
			this.list.splice(this.list.indexOf(this.body), 1, Object.assign({}, this.body, data))
		} else {
			data = await this.$post('orders/app_add', data)
			this.format(data)
			this.list.push(data)
		}
	}
	async addDemo() {
		let data = await this.$get('orders/app_demo')
		this.format(data)
		this.list.push(data)
	}
	async delApp(row, i) {
		let ret = await this.$confirm('确定要删除吗？')
		if (ret.result) {
			await this.$get('orders/app_del', { id: row.id }, { loading: true })
			this.list.splice(i, 1)
		}
	}
	@utils.loading()
	async refresh() {
		let { list } = await this.$get('orders/app_list')
		for (let item of list) {
			this.format(item)
		}
		this.list = list
	}
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-project {
}
</style>
