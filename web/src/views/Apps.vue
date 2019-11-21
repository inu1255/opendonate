<template>
	<v-container class="views-apps">
		<v-flex>
			<v-spacer></v-spacer>
			<v-btn @click="add()" color="primary">添加</v-btn>
		</v-flex>
		<v-data-iterator :items="data.list" :server-items-length="data.total" :loading="data.loading" disable-pagination hide-default-footer>
			<template v-slot:default="{items, isExpanded, expand}">
				<v-row>
					<v-col v-for="row in items" :key="row.id" cols="12" md="6" lg="4">
						<v-card>
							<v-toolbar :color="['success','primary'][row.type]" dark flat>
								<v-toolbar-title>{{ `${row.title}` }}</v-toolbar-title>
								<v-spacer />
								<v-btn icon @click="v=>expand(row,!isExpanded(row))">
									<v-icon>{{isExpanded(row)?'mdi-eye':'mdi-eye-off'}}</v-icon>
								</v-btn>
							</v-toolbar>
							<v-divider></v-divider>
							<v-list dense>
								<v-list-item>
									<v-list-item-content>
										<v-list-item-title>发货接口</v-list-item-title>
										<v-list-item-subtitle>{{row.url}}</v-list-item-subtitle>
									</v-list-item-content>
								</v-list-item>
								<v-list-item v-if="isExpanded(row)">
									<v-list-item-content>
										<v-list-item-title>密钥</v-list-item-title>
										<v-list-item-subtitle>{{row.cer}}</v-list-item-subtitle>
									</v-list-item-content>
								</v-list-item>
								<v-list-item>
									<v-list-item-content>
										<v-list-item-title>回跳网址</v-list-item-title>
										<v-list-item-subtitle>{{row.back}}</v-list-item-subtitle>
									</v-list-item-content>
								</v-list-item>
							</v-list>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn @click="test(row)" text color="warning">测试</v-btn>
								<v-btn @click="add(row)" text>修改</v-btn>
								<v-btn @click="onDel(row)" text color="error">删除</v-btn>
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
import { DataSource } from '../common/utils';

export default {
	data() {
		return {
			data: new DataSource(this.query),
		}
	},
	methods: {
		async query(body) {
			let { list, total } = await this.$get('app/list', Object.assign({}, body))
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
					"url": {
						"lbl": "自动发货接口",
						"rem": "http://xxx.com?foo=bar 收到请求格式 http://xxx.com?foo=bar&ext=xxx&r=xxx&s=sign",
						"len": [0, 256],
						"need": "id"
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
