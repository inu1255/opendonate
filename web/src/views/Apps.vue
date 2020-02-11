<template>
	<v-container class="views-apps">
		<v-data-table class="elevation-1" show-expand :items="data.list" :options="data.options" @update:options="data.update($event)" :headers="headers" :server-items-length="data.total" :loading="data.loading" hide-default-footer>
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-toolbar-title>{{$route.name}}</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn @click="add()" color="primary">添加</v-btn>
					<v-btn color="success" @click="data.search()" class="ml-2">搜索</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.appname="{item}">
				<a :href="`https://github.com/${$user.info.account}/${item.appname}`" target="_blank">{{item.appname}}</a>
			</template>
			<template v-slot:item.tools="{item}">
				<v-btn v-if="item.url" @click="test(item)" small text color="warning">测试</v-btn>
				<v-btn @click="add(item)" small text>修改</v-btn>
				<v-btn @click="onDel(item)" small text color="error">删除</v-btn>
			</template>
			<template v-slot:expanded-item="{headers,item}">
				<td :colspan="headers.length">
					<v-list dense>
						<v-list-item>
							<v-list-item-content>
								<v-list-item-title>hook接口</v-list-item-title>
								<v-list-item-subtitle>{{item.url}}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
						<v-list-item>
							<v-list-item-content>
								<v-list-item-title>接口密钥</v-list-item-title>
								<v-list-item-subtitle>{{item.cer}}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
						<v-list-item>
							<v-list-item-content>
								<v-list-item-title>回跳网址</v-list-item-title>
								<v-list-item-subtitle>{{item.back}}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
					</v-list>
				</td>
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
import { DataSource } from '../common/utils';

export default {
	data() {
		return {
			data: new DataSource(this.query),
			headers: [{
				text: '项目',
				value: 'title',
			}, {
				text: '项目地址',
				value: 'appname',
			}, {
				text: '操作',
				value: 'tools',
			}],
			showItem: {},
		}
	},
	methods: {
		async query(body) {
			let { list, total } = await this.$get('app/list', Object.assign({account: this.$user.info.account}, body))
			return { list, total };
		},
		async add(value) {
			let body = await ivue.form({
				value,
				params: {
					"title": {
						"lbl": "项目名称",
						"len": [0, 16],
						"need": "id"
					},
					"appname": {
						"lbl": "项目地址",
						"len": [0, 16],
						"need": "id",
						"props": {
							"prefix": `https://github.com/${this.$user.info.account}/`,
						}
					},
					"url": {
						"lbl": "hook接口",
						"rem": "http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign",
						"len": [0, 256]
					},
					"cer": {
						"lbl": "签名字符串",
						"len": [0, 32],
						"need": "id",
						"props": {
							"append-icon": "mdi-refresh"
						},
						"on": {
							"click:append": function () {
								this.cer = utils.randomString(32)
							}
						}
					},
					"back": {
						"lbl": "支付后返回链接",
						"len": [0, 256]
					}
				}
			}).catch(x => 0)
			if (!body) return;
			value && utils.clearKeys(body, value)
			if (utils.isEmpty(body)) return;
			await this.$post('app/add', body);
			await this.data.search(0)
		},
		async test(item) {
			if (item.type == 1)  // 捐赠项目
				return window.open(item.back);
			let body = await ivue.form({
				params: {
					price: {
						lbl: '金额(元)',
						type: 'int',
						need: true,
					},
					type: {
						lbl: '支付方式',
						type: 'int',
						opts: utils.opts(['支付宝', '微信'], '不限'),
					},
					ext: {
						lbl: '附加信息',
						view: 'v-textarea'
					}
				}
			}).catch(x => 0)
			if (!body) return;
			body.aid = item.id;
			window.open(`${location.protocol}//${location.host}/pay/create?` + utils.encodeQuery(body))
		},
		async onDel(item) {
			if (!await ivue.confirm('你确定要删除吗').then(x => true, x => false)) return;
			await this.$get('app/del', { id: item.id })
			this.data.search()
		}
	},
	mounted() {
		this.data.search(0)
	}
}
</script>
<style lang="less">
.views-apps {
}
</style>
