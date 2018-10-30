<template>
	<div class="pages-orders">
		<br>
		<div style="padding: 12px;">
			<i-date-range ref="date" @change="refresh()" :type.sync="query.r" max="now" all></i-date-range>
		</div>
		<div class="tar">
			<mu-select label="支付方式" v-model="query.type" style="width:8em;margin-right:1em;">
				<mu-option label="全部" :value="null"></mu-option>
				<mu-option v-for="(opt,i) in payType" :key="i" :label="opt" :value="i"></mu-option>
			</mu-select>
			<mu-select label="支付状态" v-model="query.state" style="width:8em;margin-right:1em;">
				<mu-option label="全部" :value="null"></mu-option>
				<mu-option v-for="(opt,i) in stateType" :key="i" :label="opt" :value="i"></mu-option>
			</mu-select>
			<mu-select label="发货状态" v-model="query.ret" style="width:8em;margin-right:1em;">
				<mu-option label="全部" :value="null"></mu-option>
				<mu-option v-for="(opt,i) in sendType" :key="i" :label="opt" :value="i"></mu-option>
			</mu-select>
			<mu-button @click="refresh" color="primary">搜索</mu-button>
		</div>
		<div>最多显示1000条</div>
		<mu-paper :z-depth="1">
			<mu-data-table :loading="loading" :columns="columns" :data="table_data" :sort.sync="sort">
				<template slot-scope="{row}">
					<td>{{row.id}}</td>
					<td>{{row.ip}}</td>
					<td><span :title="row.ua">{{row.os}}</span></td>
					<td>{{row.app.title}}</td>
					<td>{{payType[row.type]}}</td>
					<td>{{row.price?row.price:'不设'}}</td>
					<td>
						<i-date :value="row.create_at" :digits="1"></i-date>
					</td>
					<td>
						<span v-if="row.pay_at">
							{{row.pay_at-row.create_at|diff}}后
						</span>
					</td>
					<td>{{stateType[row.state||0]}}</td>
					<td>{{row.state==2?sendType[row.ret||0]:''}}</td>
					<td>{{row.ext}}</td>
					<td>
						<mu-menu cover placement="bottom-end">
							<mu-icon value="more_vert"></mu-icon>
							<mu-list slot="content">
								<mu-list-item v-show="!row.app_id" @click="onOk(row,2)" button>
									<mu-list-item-title>确认</mu-list-item-title>
								</mu-list-item>
								<mu-list-item v-show="!row.app_id" @click="onOk(row,2,1)" button>
									<mu-list-item-title>已发货</mu-list-item-title>
								</mu-list-item>
								<mu-list-item v-show="row.app_id" @click="onOk(row,2,1)" button>
									<mu-list-item-title>确认并发货</mu-list-item-title>
								</mu-list-item>
								<mu-list-item @click="onOk(row,1)" button>
									<mu-list-item-title>支付失败</mu-list-item-title>
								</mu-list-item>
							</mu-list>
						</mu-menu>
					</td>
				</template>
			</mu-data-table>
		</mu-paper>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class Orders extends Vue {
	loading = false
	query = utils.query({ type: null, state: 0, ret: null, r: 'day' }, true)
	payType = ['支付宝', '微信']
	stateType = ['待审核', '支付失败', '支付成功']
	sendType = ['待发货', '发货失败', '发货成功', '手动发货']
	columns = [{
		title: 'ID',
		name: 'id',
		width: 64,
	}, {
		title: 'IP',
		name: 'ip',
		width: 128
	}, {
		title: '客户端',
		name: 'ua',
		sortable: true,
		width: 84
	}, {
		title: '项目名称',
		name: 'title',
		sortable: true,
		width: 128
	}, {
		title: '支付方式',
		name: 'type',
		sortable: true,
		width: 84
	}, {
		title: '价格',
		name: 'price',
		sortable: true,
		width: 64
	}, {
		title: '创建时间',
		name: 'create_at',
		sortable: true,
		width: 96
	}, {
		title: '已支付',
		name: 'pay_at',
		sortable: true,
		width: 84
	}, {
		title: '状态',
		name: 'state',
		width: 84
	}, {
		title: '发货',
		name: 'ret',
		width: 84
	}, {
		title: '附加信息',
		name: 'ext'
	}, {
		title: '操作',
		name: 'tools',
		width: 48,
	},]
	list = []
	sort = { name: 'create_at', order: 'desc' }
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
		if (item.price) item.price /= 100
		item.os = utils.os(item.ua)
	}
	async onOk(row, state, send) {
		if (send && row.app_id && row.ret > 1) {
			let { result } = await this.$message.confirm('该订单已发货成功，确定要再次发货?')
			if (!result) return
		}
		let ret = await this.$post('orders/set', { id: row.id, state, send }, { loading: true })
		if (ret.msg) this.$message.alert(JSON.stringify(ret.msg), '发货接口报错')
		else this.$message.alert('发货成功')
		if (ret.ret) row.ret = ret.ret
		row.state = state
	}
	@utils.loading()
	async refresh() {
		let { min, max } = this.$refs.date.getRange()
		let data = utils.clearNull({
			type: this.query.type,
			state: this.query.state,
			ret: this.query.ret,
			create_max: max,
			create_min: min
		})
		let { list, apps } = await this.$get('orders/search', data)
		utils.leftJoin(list, apps, 'app')
		console.log(list)
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
.pages-orders {
}
</style>
