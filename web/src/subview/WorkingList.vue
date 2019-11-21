<template>
	<!-- 一个节点下的帖子列表 -->
	<div class="subview-working-list">
		<el-table :data="data.list" style="width: 100%" @row-click="rowClick">
			<el-table-column label="类型" width="48">
				<template slot-scope="{row}">
					<i v-if="row.type==0" class="el-icon-folder"></i>
					<i v-else-if="row.type==1" class="el-icon-collection-tag
"></i>
					<i v-else class="el-icon-document"></i>
				</template>
			</el-table-column>
			<el-table-column label="名称" prop="title"></el-table-column>
			<el-table-column label="创建" width="96">
				<template slot-scope="{row}">
					<span class="dense">{{$user.get(row.create_id).name}}</span><br />
					<i-date class="dense" :value="row.create_at"></i-date>
				</template>
			</el-table-column>
			<el-table-column label="计划" width="96">
				<template slot-scope="{row}">
					<i-rate class="dense" :value="row.rate||0">
						{{row.rate||0}}%　{{$user.get(row.head_id).name}}
					</i-rate><br />
					<i-date class="dense" :value="row.plan_at"></i-date>
				</template>
			</el-table-column>
			<el-table-column label="修改" width="96">
				<template slot-scope="{row}">
					<span class="dense">{{$user.get(row.edit_id).name}}</span><br />
					<i-date class="dense" :value="row.update_at"></i-date>
				</template>
			</el-table-column>
			<el-table-column label="回复" width="96">
				<template slot-scope="{row}">
					<i-date :value="row.reply_at"></i-date>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
export default {
	name: "NodePostList",
	props: {
	},
	data() {
		return {
			data: new utils.DataSource(this.query.bind(this)),
		}
	},
	watch: {
		id() {
			this.data.search(0);
		}
	},
	computed: {

	},
	methods: {
		async query(query) {
			query.head_id = this.$user.info.id;
			let data = await this.$get('post/list', query)
			data.list.forEach(x => {
				x._icon = 'play';
				x._start = 0;
				x._end = 0;
				x._recording = false;
			})
			return data;
		},
		rowClick(row, column, event) {
			if (row.type)
				window.open('/post/' + row.id)
			else
				this.$emit('open', row.id)
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
.subview-working-list {
}
</style>
