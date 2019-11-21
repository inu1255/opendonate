<template>
	<div class="views-post-list">
		<div class="flex">
			<i-drawer style="width:330px;">
				<div class="tar" style="padding:1em;">
					<i-button class="green" @click="addPost()">新建</i-button>
				</div>
				<el-tree ref="tree" node-key="id" :props="{label:'title',isLeaf:'_leaf'}" :load="getChildren" lazy draggable :allow-drop="allowDrop" @node-drop="drop" @node-click="click">
					<div slot-scope="{node,data}" class="treenode">
						<span class="title">{{data.title||'无名'}}</span>
						<i-icon name="add" class="right-icon" @click.stop="addPost(data)"></i-icon>
						<i-icon name="del" class="right-icon" @click.stop="delPost(data)"></i-icon>
					</div>
				</el-tree>
			</i-drawer>
			<div class="content">
				<el-breadcrumb separator="/">
					<el-breadcrumb-item :to="`/post`">首页</el-breadcrumb-item>
					<el-breadcrumb-item v-for="item in breadcrumbs" :to="`/post/${item.id}`">{{item.title}}</el-breadcrumb-item>
				</el-breadcrumb>
				<el-avatar :src="$user.get(post.create_id).avatar"></el-avatar>
				{{$user.get(post.create_id).name}}
				创建于：<i-date :value="post.create_at"></i-date>
				<i-render :value="post.content||''" disabled></i-render>
				<i-list ref="list" :query="query">
					<div slot-scope="{item}" @click="view_post_id=item.id" class="post-item">
						<div class="flex">
							<img :src="$user.get(item.head_id||item.create_id).avatar" alt="">
							<div class="header">
								<h5>{{item.title}}</h5>
								<div class="brief">
									<i-date :value="item.create_at"></i-date>
									<span class="ml1" :style="{color:item.finish_at?'green':'red'}">{{item.finish_at>0?'已完成':'进行中'}}</span>
									<span class="ml1">耗时: {{(item.cost/3600e3).toFixed(2)}}小时</span>
								</div>
							</div>
							<div class="tools">
								<i-icon @click.stop="record(item)" :name="item._icon"></i-icon>
							</div>
						</div>
						<!-- <div class="title">{{item.title}}</div> -->
					</div>
				</i-list>
			</div>
		</div>
		<i-modal :open.sync="body">
			<PostEdit :post="body" @cancel="body=false" @save="add"></PostEdit>
		</i-modal>
		<i-modal :open.sync="view_post_id">
			<PostEdit :id="view_post_id" @cancel="view_post_id=false" @save="finish"></PostEdit>
		</i-modal>
	</div>
</template>
<script>
import PostEdit from '../subview/PostEdit'

export default {
	name: "PostList",
	data() {
		return {
			body: false,
			tree: {
				id: 0,
				children: [],
			},
			umap: {},
			dragnode: null,
			post: { content: '' },
			breadcrumbs: [],
			view_post_id: 0,
		}
	},
	watch: {
		"$route.params.id": {
			immediate: true,
			handler() {
				this.open(this.tree.id = this.$route.params.id || 0)
			}
		}
	},
	methods: {
		async open(id) {
			if (id) {
				let ret = await this.$get('post/get', { id });
				this.post = ret.post;
				this.breadcrumbs = ret.breadcrumbs;
			}
		},
		async query(query) {
			let data = await this.$get('post/list', query)
			data.list.forEach(x => {
				x._icon = 'play';
				x._start = 0;
				x._end = 0;
				x._recording = false;
			})
			return data;
		},
		allowDrop(draggingNode, dropNode, type) {
			return type == 'inner'
		},
		async getChildren(node, resolve) {
			let data = node.data;
			let ret = await this.$get('post/list', { pid: data ? data.id : 0, type: 0, pageSize: 50 }, { loading: false })
			for (let post of ret.list) {
				this.pmap[post.id] = post;
				post._leaf = !post.child_cnt
			}
			this.$user.addcache(ret.users)
			resolve(ret.list)
		},
		addPost(pnode) {
			if (pnode) this.body = { pid: pnode.id }
			else this.body = {};
		},
		async delPost(node) {
			await this.$get('post/del', { id: node.id });
			this.$refs.tree.remove(node.id)
		},
		async add(data) {
			await this.$post('post/add', data);
			var p = this.pmap[data.pid]
			this.getChildren({ data: p }, list =>
				this.$refs.tree.updateKeyChildren(data.pid, list)
			)
			if (p) p.child_cnt++;
			this.body = false;
		},
		click(data, node, vm) {
			this.$router.push({ path: '/post/' + data.id })
		},
		async drop(draggingNode, dropNode, type) {
			if (type == "inner") {
				await this.$post('post/add', { id: draggingNode.data.id, pid: dropNode.data.id });
				var fp = this.pmap[draggingNode.data.pid]
				if (fp)
					fp.child_cnt--;
				dropNode.data.child_cnt++;
			}
		},
		async finish() {
			await this.$post('post/add', { id: this.view_post_id, finish_at: Date.now() });
			this.view_post_id = 0;
		},
		async record(item) {
			console.log(item.id)
			if (this.prev && this.prev.id != item.id && !await this.record(this.prev))
				return false;
			this.prev = item;
			if (!item._start) {
				item._icon = 'stop';
				item._start = Date.now()
				utils.stopClose('请先暂停工作');
				return true;
			}
			if (!item._recording) {
				if (!item._end) item._end = Date.now();
				item._recording = true
				return await this.$post('post/time_add', {
					post_id: item.id,
					start_at: item._start,
					end_at: item._end,
				}).then(() => {
					item._recording = false
					item.cost += item._end - item._start
					item._start = item._end = 0;
					item._icon = 'play';
					this.prev = null;
					this.$toast.success('记录成功')
					utils.stopClose();
					return true;
				}, () => {
					item._recording = false
					item._icon = 'refresh';
					return false;
				})
			}
			return false;
		}
	},
	mounted() {
		this.pmap = {};
		this.pmap[0] = this.tree;
	},
	components: {
		PostEdit,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-post-list {
	> .tar {
		padding: 1em;
		border-bottom: 1px solid #ccc;
	}
	> .flex {
		> .content {
			flex: 1;
			padding: 1em;
		}
	}
	.treenode {
		display: flex;
		width: 100%;
		padding-right: 0.3em;
		line-height: 1.2em;
		> .title {
			flex: 1;
		}
		> .right-icon {
			display: none;
			margin-left: 0.5em;
			.magic-color(@blue, #888);
		}
		&:hover {
			> .right-icon {
				display: inline-block;
			}
		}
	}
	.form {
		min-width: 60vw;
		padding: 1em;
		background: #fff;
	}
	.post-item {
		padding: 0.5em 1em;
		border-bottom: 1px solid #ccc;
		> .flex {
			margin-bottom: 0.5em;
		}
		img {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			border: 1px solid #888;
		}
		.header {
			flex: 1;
			padding: 0 1em;
			> h5 {
				font-size: 15px;
				margin: 4px 0 0;
				color: #333;
			}
			> .brief {
				color: #888;
				font-size: 13px;
			}
		}
		.tools {
			font-size: 21px;
			line-height: 2.2;
			width: 21px;
			> i {
				cursor: pointer;
			}
		}
		> .title {
			color: #333;
		}
	}
}
</style>
