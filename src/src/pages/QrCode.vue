<template>
	<div class="pages-qr-code">
		<br>
		<div style="text-align: right;">
			<span>http://perpay.inu1255.cn/pay?u={{user.id}}&price=(金额,单位:分)&type=(0:支付宝 1:微信 不传:用户选择)</span>
			<mu-button @click="api=defaultApi" color="primary">统一修改</mu-button>
			<mu-button @click="body={}" color="secondary">添加</mu-button>
			<mu-button @click="refresh" color="primary">刷新</mu-button>
		</div>
		<br>
		<mu-paper :z-depth="1">
			<mu-data-table :loading="loading" :columns="columns" :data="table_data" :sort.sync="sort">
				<template slot-scope="{row, $index}">
					<td>{{row.price?row.price:'不设'}}</td>
					<td>
						<mu-menu placement="bottom" open-on-hover>
							<mu-icon v-if="row.alipay" color="green" value="check"></mu-icon>
							<mu-paper :z-index="1" slot="content">
								<img width="240" :src="row.alipay" alt="">
							</mu-paper>
						</mu-menu>
					</td>
					<td>
						<mu-menu placement="bottom" open-on-hover>
							<mu-icon v-if="row.wechat" color="green" value="check"></mu-icon>
							<mu-paper :z-index="1" slot="content">
								<img width="240" :src="row.wechat" alt="">
							</mu-paper>
						</mu-menu>
					</td>
					<td>{{row.api}}</td>
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
								<mu-list-item @click="delQr(row, $index)" button>
									<mu-list-item-title>删除</mu-list-item-title>
								</mu-list-item>
							</mu-list>
						</mu-menu>
					</td>
				</template>
			</mu-data-table>
		</mu-paper>
		<i-form width="480" :params="columns" :open.sync="body" :submit="onAdd"></i-form>
		<i-form width="480" :params="columns.filter(x=>['api','cer','back'].indexOf(x.name)>=0)" :open.sync="api" :submit="onApi" title="统一修改"></i-form>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class QrCode extends Vue {
	@State(state => state.user.user) user
	list = []
	columns = [{
		title: '金额(元)',
		name: 'price',
		width: 88,
		type: 'number',
		sortable: true,
		min: 0,
	}, {
		title: '支付宝',
		name: 'alipay',
		width: 64,
		type: 'qr',
		qrname: 'alipay_url'
	}, {
		title: '微信',
		name: 'wechat',
		width: 64,
		type: 'qr'
	}, {
		title: '发货接口',
		name: 'api',
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
	get defaultApi() {
		let data = {}
		for (let item of this.list) {
			if (item.api) {
				data.api = item.api
				break
			}
		}
		for (let item of this.list) {
			if (item.cer) {
				data.cer = item.cer
				break
			}
		}
		for (let item of this.list) {
			if (item.back) {
				data.back = item.back
				break
			}
		}
		return data
	}

	@utils.loading()
	async refresh() {
		let { list } = await this.$get('orders/qr_list')
		for (let item of list) {
			this.format(item)
		}
		this.list = list
	}
	async format(item) {
		if (item.price) item.price /= 100
	}
	async onApi(data) {
		await this.$post('orders/qr_api', data, { loading: true })
		for (let item of this.list) {
			item.api = data.api
			item.cer = data.cer
			item.back = data.back
		}
	}
	async onAdd(data) {
		if (data.price < 0) throw this.$toast.error('金额不能小于0')
		if (data.price) data.price = Math.floor(data.price * 100)
		if (data.id) {
			data = await this.$post('orders/qr_add', data)
			this.format(data)
			this.list.splice(this.list.indexOf(this.body), 1, Object.assign({}, this.body, data))
		} else {
			data = await this.$post('orders/qr_add', data)
			this.format(data)
			this.list.push(data)
		}
	}
	async delQr(row, i) {
		let ret = await this.$confirm('确定要删除吗？')
		if (ret.result) {
			await this.$get('orders/qr_del', { id: row.id }, { loading: true })
			this.list.splice(i, 1)
		}
	}
	payQr(row) {
		window.open(`/pay?u=${this.user.id}&price=${Math.floor(row.price * 100)}`)
	}
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-qr-code {
}
</style>
