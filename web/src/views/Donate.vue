<template>
	<v-container class="views-donate">
		<v-data-table class="elevation-1" :items="data.list" :options="data.options" @update:options="data.update($event)" :headers="headers" :server-items-length="data.total" :loading="data.loading" hide-default-footer>
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-toolbar-title>{{$route.params.appname}}</v-toolbar-title>
					<a class="lh1 ml-1" :href="`https://github.com/${$route.params.account}/${$route.params.appname}`" target="_blank"><img :src="`https://img.shields.io/github/stars/${$route.params.account}/${$route.params.appname}?style=social`" alt=""></a>
					<a class="lh1 ml-1" :href="`https://github.com/${$route.params.account}/${$route.params.appname}`" target="_blank"><img :src="`https://img.shields.io/github/license/${$route.params.account}/${$route.params.appname}`" alt=""></a>
					<v-spacer></v-spacer>
					<v-btn @click="dialog=true" color="primary">捐赠</v-btn>
					<v-btn @click="data.search(0)" color="success" class="ml-2">刷新</v-btn>
				</v-toolbar>
				<v-card flat v-if="app.detail">
					<v-card-text>
						介绍：{{app.detail}}
					</v-card-text>
				</v-card>
				<v-tabs :value="params.state?0:1" @change="params.state=$event?0:2">
					<v-tab>已确认</v-tab>
					<v-tab>待审核</v-tab>
				</v-tabs>
			</template>
			<template v-slot:item.create_at="{item}">
				<i-date :value="item.create_at"></i-date>
			</template>
			<template v-slot:item.tools="{item}">
				<v-btn color="green" @click="deal(item)" small text>处理</v-btn>
			</template>
			<template v-slot:footer v-if="$size.sm&&data.totalPage>1">
				<v-divider></v-divider>
				<i-page class="pa-2" circle :value="data.options.page-1" @input="data.options.page=$event+1" :total="data.total"></i-page>
			</template>
		</v-data-table>
		<v-btn v-if="!$size.sm" class="mt-2" block text :loading="data.loading" @click="data.loadmore()">加载更多</v-btn>
		<iv-form title="捐赠" v-model="dialog" width="500" @submit="submit">
			<v-flex align-end>
				<v-text-field v-model="body.email" :rules="emailRules" label="邮箱"></v-text-field>
				<v-btn text tile @click="body.email='anonymous'" color="grey">匿名</v-btn>
			</v-flex>
			<v-text-field v-model="body.price" :rules="$rules.price(true)" label="金额" autofucus type="number" min="0.01" step="0.01"></v-text-field>
			<v-textarea v-model="body.remark" label="备注" :counter="64"></v-textarea>
		</iv-form>
	</v-container>
</template>
<script>
import { DataSource } from '../common/utils';

export default {
	data() {
		return {
			headers: [{
				text: '捐赠者邮箱',
				value: 'email',
				align: 'center',
				width: 200,
				label: '您的邮箱',
			}, {
				text: '金额(元)',
				value: 'price',
				align: 'center',
				width: 96,
				sortable: true,
				min: 0.01,
			}, {
				text: '备注',
				value: 'remark',
				align: 'center',
			}, {
				text: '捐赠时间',
				value: 'create_at',
				align: 'center',
				width: 108,
				sortable: true,
			}],
			data: new DataSource(this.query).sortBy('id', 1),
			user: {},
			app: {},
			dialog: false,
			emailRules: [
				v => !!v || `邮箱是必填项`,
				v => !v || /.+@.+\..+/.test(v) || v == 'anonymous' || `邮箱格式不正确`,
			],
			params: {
				state: 2
			},
			body: {
				email: '',
				price: '',
				remark: '',
			},
		}
	},
	watch: {
		page() {
			this.refresh()
		},
		params: {
			deep: true,
			handler() {
				this.data.search(0)
			}
		}
	},
	methods: {
		submit() {
			let { email, price, remark } = this.body
			if (price < 0.01) return this.$toast.success('感谢您的支持')
			price = Math.floor(price * 100)
			let { account, appname } = this.$route.params;
			this.$router.push(`/pay/create?account=${account}&appname=${appname}&price=${price}&email=${email}&remark=${encodeURIComponent(remark)}`)
		},
		format(item) {
			if (item.price) item.price /= 100
		},
		async query(body) {
			let { account, appname } = this.$route.params;
			let { list, total } = await this.$get('orders/list', Object.assign({ account, appname }, this.params, body))
			for (let item of list) {
				this.format(item)
			}
			return { list, total };
		},
	},
	mounted() {
	}
}
</script>
<style lang="less">
.views-donate {
}
</style>
