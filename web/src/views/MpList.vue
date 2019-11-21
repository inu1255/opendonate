<template>
	<div class="views-mp-list">
		<i-table :data="list" :headers="headers">
			<td slot="tools" slot-scope="{item}">
				<i-button @click="onEdit(item)">修改</i-button>
				<i-button @click="$router.push('/mp/replys/'+item.id)">设置回复</i-button>
				<i-button @click="del(item)" color="#f00">删除</i-button>
			</td>
		</i-table>
		<div class="tar">
			<i-button class="green" @click="refresh">刷新</i-button>
			<i-button class="blue" @click="onAdd">添加</i-button>
		</div>
		<i-modal :open.sync="add_dialog">
			<div class="form-dialog">
				<i-input flex v-model="body.title" label="项目名称" required :counter="32" autofocus></i-input>
				<i-input flex v-model="body.token" label="token" required></i-input>
				<i-input flex v-model="body.appid" label="appid" required></i-input>
				<i-input flex v-model="body.secret" label="secret" required></i-input>
				<i-input flex v-model="body.encodingAESKey" label="encodingAESKey" placeholder="明文模式请不要输入"></i-input>
				<i-radio flex v-model="body.checkSignature" label="checkSignature" :opts="['不检查','检查']"></i-radio>
				<i-input flex v-model="body.rebate" label="返利比例" placeholder="返利比例,如: 0.5元"></i-input>
				<i-radio flex v-model="body.rebateCoupon" label="有券也返利" :opts="['不返','返']"></i-radio>
				<i-input flex v-model="body.nick" label="昵称" placeholder="如:二狗"></i-input>
				<i-input flex v-model="body.tuling" label="图灵机器人apiKey"></i-input>
				<div class="tar" style="margin-top: 1rem;">
					<i-button class="blue depth-1" @click="submit">确定</i-button>
				</div>
			</div>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "MpList",
	data() {
		return {
			list: [],
			body: {},
			add_dialog: false,
		}
	},
	computed: {
		headers() {
			return [{
				key: 'id',
				title: '#',
			}, {
				key: 'title',
				title: '项目名称',
			}, {
				key: 'nick',
				title: '昵称',
			}, {
				key: 'rebate',
				title: '返利比例',
			}, {
				key: 'rebateCoupon',
				title: '有券返利',
				text: (item) => item.rebateCoupon ? '返' : '不返',
			}, {
				key: 'tools',
				title: '操作',
				sortable: false,
			}]
		}
	},
	methods: {
		async refresh() {
			let { list } = await this.$post('mp/list')
			this.list = list
		},
		onAdd() {
			delete this.body.id;
			this.add_dialog = true;
		},
		onEdit(item) {
			this.edit = item;
			this.body = Object.assign({}, item);
			this.add_dialog = true;
		},
		async del(item) {
			let data = await this.$get('mp/del', { id: item.id })
			console.log(data)
			this.$toast.success('删除成功');
			this.list.splice(this.list.indexOf(item), 1);
		},
		async submit() {
			let data = await this.$post('mp/add', this.body);
			if (this.body.id) {
				Object.assign(this.edit, this.body);
				this.$toast.success('修改成功');
			} else {
				this.list.push(data)
				this.$toast.success('添加成功');
			}
			console.log(data)
			this.add_dialog = false;
		},
	},
	mounted() {
		this.refresh();
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-mp-list {
	padding: 1rem;
	max-width: 50rem;
	margin: 0 auto;
}
</style>
