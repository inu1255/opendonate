<template>
	<!-- 一个节点下的帖子列表 -->
	<div class="subview-node-post-list">
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
			<el-table-column label="计划" width="128" class-name="clk">
				<template slot-scope="{row}">
					<i-rate class="dense" :value="(row.rate||0)/100" @click.stop="openPlan(row)">
						{{row.rate||0}}%　{{$user.get(row.head_id).name}}
					</i-rate><br />
					<i-date class="dense" :value="row.plan_at" color></i-date>
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
		<i-modal :open.sync="plan_dialog">
			<div style="width:330px;background:#fff;" class="p3">
				<el-date-picker v-model="post.plan_at" type="date" placeholder="计划日期">
				</el-date-picker>
				<br>
				<span>进度</span>
				<el-slider v-model="post.rate"></el-slider>
				<hr>
				<div class="tar">
					<i-button @click="plan_dialog=false" class="gray">取消</i-button>
					<i-button @click="save" class="green">保存</i-button>
				</div>
			</div>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "NodePostList",
	props: {
		id: { type: Number, required: true },
	},
	data() {
		return {
			data: new utils.DataSource(this.query.bind(this)),
			post: {},
			plan_dialog: false,
		}
	},
	watch: {
		id: {
			immediate: true,
			handler() {
				if (this.id) this.data.search(0);
			}
		}
	},
	computed: {

	},
	methods: {
		async query(query) {
			query.pid = this.id;
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
			if (column.label == '计划') {
				this.openPlan(row)
			} else if (row.type)
				window.open('/post/' + row.id)
			else
				this.$emit('open', row.id)
		},
		openPlan(row) {
			this.edit = row;
			this.post = Object.assign({}, row);
			this.plan_dialog = true;
		},
		async save() {
			this.post.head_id = this.$user.id;
			this.post.plan_at = this.post.plan_at.getTime();
			await this.$post('post/add', this.post)
			Object.assign(this.edit, this.post)
			this.plan_dialog = false;
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
.subview-node-post-list {
}
</style>
