<template>
	<div class="pages-qr-code">
		<br>
		<div style="text-align: right;">
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
					<td>
						<mu-button flat @click="body=row" color="primary">编辑</mu-button>
						<mu-button flat @click="delQr(row, $index)" color="error">删除</mu-button>
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
		type: 'qr',
		qrname: 'alipay_url',
		disabled: true,
	}, {
		title: '微信',
		name: 'wechat',
		type: 'qr'
	}, {
		title: '操作',
		name: 'tools',
		align: 'center'
	}]
	loading = false
	body = false
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
