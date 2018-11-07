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
					<td v-select>{{row.url}}</td>
					<td>
						<i-hide :value="row.cer" :open.sync="row.open"></i-hide>
					</td>
					<td><a :href="row.back" target="_blank">{{row.back}}</a></td>
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
		<br>
		<b>支付接口: </b><span v-select>http://perpay.inu1255.cn/pay?u={{user&&user.id}}&price=(金额,单位:分)&app=(项目名称)&ext=(自定义参数)&type=(0:支付宝 1:微信 不传:用户选择)</span>
		<b>发货参数: </b>
		<ul>
			<li>id:订单号</li>
			<li>price:订单金额</li>
			<li>ext:自定义参数</li>
			<li>t:请求时间</li>
			<li>sign:签名=md5(id + price + (ext || '') + t + cer)</li>
		</ul>
		<i-form width="480" :params="columns" :open.sync="body" :submit="onAdd"></i-form>
		<mu-dialog width="480" :open.sync="test.app">
			<mu-form :model="test">
				<mu-form-item label="金额(元)">
					<mu-text-field v-model="test.price"></mu-text-field>
				</mu-form-item>
				<mu-form-item label="支付方式">
					<mu-select v-model="test.type">
						<mu-option label="用户选择" value=""></mu-option>
						<mu-option label="支付宝" :value="0"></mu-option>
						<mu-option label="微信" :value="1"></mu-option>
					</mu-select>
				</mu-form-item>
				<mu-form-item label="自定义参数">
					<mu-text-field v-model="test.ext"></mu-text-field>
				</mu-form-item>
			</mu-form>
			点击测试：<br><a class="small" target="_blank" :href="test_url">{{test_url}}</a>
			<mu-button slot="actions" flat @click="test.app=false">取消</mu-button>
			<mu-button slot="actions" flat color="primary" @click="openTest">确定</mu-button>
		</mu-dialog>
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
	test = { app: false, price: 0, ext: '', type: '' }
	get test_url() {
		if (!this.user) return ''
		return `${location.protocol}//${location.host}/pay?u=${this.user.id}&price=${Math.floor(this.test.price * 100)}&app=${this.test.app}&ext=${this.test.ext}&type=${this.test.type}`
	}
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
	openTest() {
		if (this.test_url) window.open(this.test_url)
	}
	async payQr(row) {
		if (/api\/donate\/add\?app_id=\d+$/.test(row.url))
			return window.open(`/donate/${row.id}?page=1&n=1`)
		this.test.app = row.title
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
	format(item) {
		item.open = false
	}
	@Watch('user')
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
