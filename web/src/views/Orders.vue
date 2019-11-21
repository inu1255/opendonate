<template>
	<v-container class="pages-orders">
		<v-row>
			<v-col cols="4">
				<v-select label="支付方式" v-model="query.type" :items="payType"></v-select>
			</v-col>
			<v-col cols="4">
				<v-select label="支付状态" v-model="query.state" :items="stateType"></v-select>
			</v-col>
			<v-col cols="4">
				<v-select label="发货状态" v-model="query.ret" :items="sendType"></v-select>
			</v-col>
			<v-col cols="8">
				<v-menu ref="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="290px">
					<template v-slot:activator="{ on }">
						<v-text-field :value="query.dates" label="范围" prepend-icon="mdi-calendar-range" readonly v-on="on"></v-text-field>
					</template>
					<v-date-picker v-model="dates" range :max="now" no-title scrollable>
						<v-spacer></v-spacer>
						<v-btn text color="primary" @click="$refs.menu.save(query.dates='')">取消</v-btn>
						<v-btn text color="primary" @click="$refs.menu.save(query.dates=dates.join('至'))">确定</v-btn>
					</v-date-picker>
				</v-menu>
			</v-col>
			<v-col cols="4" class="d-flex align-center justify-end">
				<v-btn @click="search()" color="primary">搜索</v-btn>
			</v-col>
		</v-row>
		<v-data-iterator :items="data.list" :server-items-length="data.total" :loading="data.loading" disable-pagination hide-default-footer>
			<template v-slot:default="{items, isExpanded, expand}">
				<v-row>
					<v-col v-for="row in items" :key="row.id" cols="12" sm="6" md="4" lg="3">
						<v-card>
							<v-toolbar :color="row.ret>1&&row.state!=1?'success':['warning','error','primary'][row.state]" dark flat>
								<v-toolbar-title>{{ `${row.app.title||row.app_id} - ¥${row.price}` }}</v-toolbar-title>
								<v-spacer />
								<v-btn icon @click="v=>expand(row,!isExpanded(row))">
									<v-icon :style="{transform:`rotate(${isExpanded(row)?0:90}deg)`}">mdi-chevron-down</v-icon>
								</v-btn>
							</v-toolbar>
							<v-divider></v-divider>
							<v-list dense>
								<v-list-item>
									<v-list-item-content>下单时间:</v-list-item-content>
									<v-list-item-content class="align-end">
										<i-date :value="row.create_at"></i-date>
									</v-list-item-content>
								</v-list-item>
								<v-list-item>
									<v-list-item-content>支付时间:</v-list-item-content>
									<v-list-item-content class="align-end">
										<i-date v-if="row.pay_at" :value="row.pay_at-row.create_at" def="未支付"></i-date>
									</v-list-item-content>
								</v-list-item>
								<v-list-item>
									<v-list-item-content>支付方式:</v-list-item-content>
									<v-list-item-content class="align-end">{{payType[row.type+1].text}}</v-list-item-content>
								</v-list-item>
								<v-list-item>
									<v-list-item-content>订单状态:</v-list-item-content>
									<v-list-item-content class="align-end">{{stateType[row.state+1].text}}</v-list-item-content>
								</v-list-item>
								<v-list-item v-if="isExpanded(row)">
									<v-list-item-content>IP:</v-list-item-content>
									<v-list-item-content class="align-end">{{ row.ip }}</v-list-item-content>
								</v-list-item>
								<v-list-item v-if="isExpanded(row)">
									<v-list-item-content>客户端:</v-list-item-content>
									<v-list-item-content class="align-end"><span :title="row.ua">{{ row.os }}</span></v-list-item-content>
								</v-list-item>
								<v-list-item>
									<v-list-item-content>发货状态:</v-list-item-content>
									<v-list-item-content class="align-end" :class="{'red--text':row.msg}" @click="row.msg&&$msg.alert(row.msg)">{{sendType[row.ret+1].text}}</v-list-item-content>
								</v-list-item>
								<v-list-item>
									<v-list-item-content>备注信息:</v-list-item-content>
									<v-list-item-content class="align-end" @click="row.ext&&$msg.alert(row.ext)">{{row.ext}}</v-list-item-content>
								</v-list-item>
							</v-list>
							<v-card-actions>
								<v-btn v-show="!row.app_id" @click="onOk(row,2)" text color="primary">确认</v-btn>
								<v-btn v-show="!row.app_id" @click="onOk(row,2,1)" text>已发货</v-btn>
								<v-btn v-show="row.app_id" @click="editExt(row)" text color="gray">修改备注</v-btn>
								<v-btn v-show="row.app_id" @click="onOk(row,2,1)" text color="success">发货</v-btn>
								<v-btn @click="onOk(row,1)" text color="error">支付失败</v-btn>
							</v-card-actions>
						</v-card>
					</v-col>
				</v-row>
			</template>
			<template v-slot:footer>
				<v-btn block text @click="data.loadmore()" :disabled="data.loading||!data.hasMore" :loading="data.loading">{{data.hasMore?'加载更多':'没有更多了'}}</v-btn>
			</template>
		</v-data-iterator>
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
			}, true),
			now: new Date().toISOString(),
			payType: utils.opts(['支付宝', '微信'], true),
			stateType: utils.opts(['待审核', '支付失败', '支付成功'], true),
			sendType: utils.opts(['待发货', '发货失败', '发货成功', '手动发货'], true),
			data: new utils.DataSource(this.load),
			dates: [],
		}
	},
	computed: {
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
			if (ret.msg) ivue.alert(JSON.stringify(ret.msg), '发货接口报错')
			else ivue.alert(send ? '发货成功' : '标记成功');
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
				minCreateAt: min ? +new Date(min) : null,
				maxCreateAt: max ? +new Date(max) + 86400e3 : null,
			})
			let { total, list, apps } = await this.$get('orders/list', data, { loading: false })
			utils.leftJoin(list, apps, 'app')
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
