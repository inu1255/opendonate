<template>
	<v-container class="pages-orders">
		<v-data-table dense class="elevation-1" :items="data.list" :options="data.options" @update:options="data.update($event)" :headers="headers" :server-items-length="data.total" :loading="data.loading" hide-default-footer>
			<template v-slot:top>
				<div class="fl-block pa2">
					<i-radio all label="支付方式" :opts="payType" v-model="query.type"></i-radio>
					<i-radio all label="支付状态" :opts="stateType" v-model="query.state"></i-radio>
					<!-- <i-radio all label="发货状态" :opts="sendType" v-model="query.ret"></i-radio> -->
					<v-btn @click="data.search(0)" color="success">刷新</v-btn>
				</div>
			</template>
			<template v-slot:item.create_at="{item}">
				<i-date :value="item.create_at"></i-date>
			</template>
			<template v-slot:item.pay_at="{item}">
				<i-date :value="item.pay_at==0?0:item.pay_at-item.create_at" def="未支付"></i-date>
			</template>
			<template v-slot:item.type="{item}">
				<span :style="{color:payTypeColor[item.type]}">{{payType[item.type]}}</span>
			</template>
			<template v-slot:item.state="{item}">
				<span :style="{color:stateTypeColor[item.state]}">{{stateType[item.state]}}</span>
			</template>
			<template v-slot:item.tools="{item}">
				<v-btn small @click="onOk(item,2,1)" text color="primary">成功</v-btn>
				<!-- <v-btn small @click="editExt(item)" text color="gray">修改备注</v-btn> -->
				<v-btn small @click="onOk(item,1)" text color="error">失败</v-btn>
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
	data: function () {
		return {
			query: this.$query({
				type: null,
				state: 0,
				ret: null,
				dates: '',
				appname: null,
			}, true),
			now: new Date().toISOString(),
			payType: ['支付宝', '微信'],
			payTypeColor: ['#439EE2', '#52A64D'],
			stateType: ['待审核', '捐赠失败', '捐赠成功'],
			stateTypeColor: ["#000", '#ff6347', '#2cbe4e'],
			sendType: ['待发货', '发货失败', '发货成功', '手动发货'],
			data: new utils.DataSource(this.load).sortBy('id', 1),
			dates: [],
		}
	},
	computed: {
		headers() {
			var headers = [{
				text: "项目",
				value: 'appname',
			}, {
				text: "下单时间",
				value: 'create_at',
			}, {
				text: "支付时间",
				value: 'pay_at',
			}, {
				text: "支付方式",
				value: 'type',
			}, {
				text: "订单状态",
				value: 'state',
			}, {
				text: "IP",
				value: 'ip',
				adm: true,
			}, {
				text: "客户端",
				value: 'ua',
				adm: true,
			}, {
				text: "hook状态",
				value: 'msg',
			}, {
				text: "备注信息",
				value: 'remark',
			}, {
				text: "操作",
				value: 'tools',
			},]
			if (this.query.appname)
				headers = headers.slice(1)
			if (!this.$user.adm())
				headers = headers.filter(x => !x.adm)
			return headers
		},
		table_data() {
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
	},
	watch: {
		"$route.query"() {
			this.data.search(0)
		}
	},
	methods: {
		format(item) {
			if (item.price) item.price /= 100
			item.os = utils.os(item.ua)
		},
		async onOk(row, state, send) {
			if (send && row.app_id && row.ret > 1) {
				let result = await ivue.confirm('该订单已发货成功，确定要再次发货?')
				console.log(result)
				if (!result) return
			}
			let ret = await this.$post('orders/set', { id: row.id, state, send }, { loading: true })
			if (ret.msg) ivue.alert(JSON.stringify(ret.msg), 'hook接口报错')
			if (ret.ret != null) row.ret = ret.ret
			row.state = state
		},
		async editExt(row) {
			let value = await ivue.prompt('修改附加信息')
			if (value) {
				let ret = await this.$post('orders/set', { id: row.id, ext: value }, { loading: true })
				if (ret.msg) ivue.alert(JSON.stringify(ret.msg), '接口报错')
				else ivue.alert('修改成功')
				row.ext = value
			}
		},
		async load(body) {
			let [min, max] = this.query.dates.split('至')
			let data = Object.assign(body, {
				type: this.query.type,
				state: this.query.state,
				ret: this.query.ret,
				appname: this.query.appname,
				minCreateAt: min ? +new Date(min) : null,
				maxCreateAt: max ? +new Date(max) + 86400e3 : null,
			})
			let { total, list } = await this.$get('orders/list', data, { loading: false })
			for (let item of list) {
				this.format(item)
			}
			return { list, total }
		},
		search() {
			this.query.$update();
			this.data.search(0)
		},
	},
	mounted() {
		this.data.search(0)
	}
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.pages-orders {
}
</style>
