<template>
	<div class="views-user-list">
		<div class="tar">
			<i-button class="blue" @click="onAdd">添加</i-button>
			<i-button class="green" @click="$refs.table.search()" style="margin-left:3rem;">搜索</i-button>
		</div>
		<hr>
		<i-table ref="table" :query="query" :headers="headers">
			<td slot="tools" slot-scope="{item}">
				<i-button @click="qrcode(item)">邀请</i-button>
				<i-button @click="send_dialog=item">测试</i-button>
				<i-button @click="del(item)">删除</i-button>
			</td>
		</i-table>
		<i-modal :open.sync="add_dialog">
			<div class="form-dialog">
				<i-input flex v-model="body.name" label="推送任务名称" :counter="32" :rules="[v=>v.length<=32||'长度最多32']" autofocus></i-input>
				<i-input flex v-model="body.token" label="推送密钥" :counter="32" :rules="[v=>v.length<=32||'长度最多32']"></i-input>
				<div class="tar" style="margin-top: 1rem;">
					<i-button class="blue depth-1" @click="submit">确定</i-button>
				</div>
			</div>
		</i-modal>
		<i-modal :open.sync="send_dialog">
			<div class="form-dialog">
				<i-input flex v-model="sendData.text" label="推送内容" :counter="256" :rules="[v=>v.length<=256||'长度最多256']" autofocus></i-input>
				<i-input flex v-model="sendData.url" label="推送链接" :counter="512" :rules="[v=>v.length<=512||'长度最多512']"></i-input>
				<div class="tar" style="margin-top: 1rem;">
					<i-button class="blue depth-1" @click="send(send_dialog)">确定</i-button>
				</div>
			</div>
		</i-modal>
	</div>
</template>
<script>
export default {
	data() {
		return {
			s: {

			},
			add_dialog: false,
			send_dialog: false,
			body: { name: '', token: '' },
			sendData: { text: '', url: '' },
		}
	},
	computed: {
		headers() {
			return [{
				key: "id",
				title: "#",
			}, {
				key: "name",
				title: "推送标题",
			}, {
				key: "token",
				title: "密钥",
			}, {
				key: "cnt",
				title: "用户数量",
			}, {
				key: "tools",
				title: '操作',
			}]
		}
	},
	methods: {
		query(query) {
			return this.$get('channel/list', query)
		},
		onAdd() {
			delete this.body.id;
			this.body.token = utils.randomString(32);
			this.add_dialog = true;
		},
		onEdit(item) {
			this.body = Object.assign({}, item);
			this.add_dialog = true;
		},
		async del(item) {
			await this.$get('channel/del', { id: item.id })
			this.$toast.success('删除成功');
			this.$refs.table.search();
		},
		async submit() {
			let data = await this.$post('channel/add', this.body);
			this.$refs.table.search();
			this.add_dialog = false;
		},
		async qrcode(item) {
			let now = Date.now()
			if (!item.expire_at || item.expire_at < now) {
				let ret = await this.$get('channel/invite', { id: item.id })
				item.qrcode = ret.url;
				item.expire_at = now + 300e3;
			}
			utils.previewImage([{ src: item.qrcode, name: `扫码接收【${item.name}】通知` }])
		},
		async send(item) {
			let ret = await this.$get('channel/push', Object.assign({ id: item.id + ':' + item.token }, this.sendData))
			this.send_dialog = false;
			this.$toast.success(`推送${ret.n}人`)
		}
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-user-list {
	padding: 1rem;
	max-width: 50rem;
	margin: 0 auto;
}
</style>
