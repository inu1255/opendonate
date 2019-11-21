<template>
	<div class="views-app-version-list">
		<div class="tar">
			<i-button class="green" @click="$refs.table.search()">搜索</i-button>
			<i-button class="blue" @click="onAdd">新版本</i-button>
		</div>
		<hr>
		<i-table ref="table" :query="query" :headers="headers">
			<td slot="avatar" slot-scope="{item}">
				<i-img width="2rem" :src="item.avatar" />
			</td>
			<td slot="create_at" slot-scope="{item}">
				<i-date :value="item.create_at"></i-date>
			</td>
			<td slot="login_at" slot-scope="{item}">
				<i-date :value="item.login_at" def="未记录"></i-date>
			</td>
			<td slot="tools" slot-scope="{item}">
				<i-button @click="onEdit(item)">修改</i-button>
				<i-button @click="del(item)" color="#f00">删除</i-button>
			</td>
		</i-table>
		<i-modal :open.sync="add_dialog">
			<div class="form-dialog">
				<i-input flex label="版本号" v-model="body.version" required></i-input>
				<i-input flex label="介绍" v-model="body.description"></i-input>
				<div class="tar" style="margin-top: 1rem;">
					<i-button class="blue depth-1" @click="submit">确定</i-button>
				</div>
			</div>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "AppVersionList",
	data() {
		return {
			body: {
				version: '',
				description: '',
			},
			add_dialog: false,
		}
	},
	computed: {
		headers() {
			return [{
				key: 'id',
				title: '#',
			}, {
				key: 'version',
				title: '版本号',
			}, {
				key: 'description',
				title: '介绍',
			}, {
				key: 'tools',
				title: '操作',
				sortable: false,
			}]
		}
	},
	methods: {
		query(query) {
			query.sortBy = 'id'
			query.desc = 1;
			return this.$get('app/version_list', query)
		},
		onEdit(item) {
			this.edit = item;
			this.body = Object.assign({}, item);
			this.add_dialog = true;
		},
		onAdd() {
			this.add_dialog = true;
		},
		async del(item) {
			await this.$get('app/version_del', { id: item.id })
			this.$refs.table.search()
		},
		async submit() {
			let data = await this.$post('app/version_add', this.body);
			if (this.body.id) {
				Object.assign(this.edit, this.body);
				this.$toast.success('修改成功');
			} else {
				this.$refs.table.search()
				this.$toast.success('发布成功');
			}
			this.add_dialog = false;
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
.views-app-version-list {
	padding: 1rem;
	max-width: 50rem;
	margin: 0 auto;
}
</style>
