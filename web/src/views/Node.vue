<template>
	<div class="views-node">
		<div class="flex">
			<i-drawer style="width:330px;">
				<div class="tar" style="padding:1em;">
					<i-button class="green" @click="openEdit({type:0},['type'])">新建</i-button>
				</div>
				<el-tree ref="tree" node-key="id" :props="{label:'title',isLeaf:'_leaf'}" :load="getChildren" lazy draggable :allow-drop="allowDrop" @node-drop="drop" @node-click="click">
					<div slot-scope="{node,data}" class="treenode">
						<span class="title">{{data.title||'无名'}}</span>
						<i-icon name="add" class="right-icon" @click.stop="openEdit({pid:data.id})"></i-icon>
						<i-icon name="del" class="right-icon" @click.stop="delPost(data.id)"></i-icon>
					</div>
				</el-tree>
			</i-drawer>
			<div class="content">
				<el-breadcrumb separator="/">
					<el-breadcrumb-item :to="'/node'">首页</el-breadcrumb-item>
					<el-breadcrumb-item v-for="item in breadcrumbs" :to="`/node/${item.id}`">{{item.title}}</el-breadcrumb-item>
				</el-breadcrumb>
				<div v-if="post.id" class="current-node">
					<div class="tar">
						{{$user.get(post.create_id).name}} 创建于：<i-date :value="post.create_at"></i-date>
						<i-icon class="ml1" name="edit" @click="openEdit(post)"></i-icon>
					</div>
					<i-render :value="post.content||''" disabled></i-render>
					<NodePostList :id="post.id" @open="open"></NodePostList>
				</div>
				<WorkingList v-else></WorkingList>
			</div>
		</div>
		<i-modal :open.sync="body">
			<PostEdit :post="body" :hides="hides" @cancel="body=false" @save="add"></PostEdit>
		</i-modal>
	</div>
</template>
<script>
import PostEdit from '../subview/PostEdit'
import NodePostList from '../subview/NodePostList'
import WorkingList from '../subview/WorkingList'

export default {
	name: "Node",
	data() {
		return {
			body: false,
			post: { id: 0, content: '' },
			breadcrumbs: [],
			hides: {},
		}
	},
	watch: {
		"$route.params.id": {
			immediate: true,
			handler() {
				this.open(this.$route.params.id || 0)
			}
		}
	},
	methods: {
		/**
		 * 打开结点
		 */
		async open(id) {
			if (id) {
				let ret = await this.$get('post/get', { id });
				this.post = ret.post;
				this.breadcrumbs = ret.breadcrumbs;
			} else {
				this.post = { id: 0, content: '' };
				this.breadcrumbs = []
			}
		},
		/**
		 * 允许拖动到一个节点下面
		 */
		allowDrop(draggingNode, dropNode, type) {
			return type == 'inner'
		},
		/**
		 * el-tree 获取子节点
		 */
		async getChildren(node, resolve) {
			let data = node.data;
			let ret = await this.$get('post/list', { pid: data ? data.id : 0, type: 0, pageSize: 50 }, { loading: false })
			for (let post of ret.list) {
				post._leaf = !post.child_cnt
			}
			this.$user.addcache(ret.users)
			resolve(ret.list)
		},
		/**
		 * 打开帖子编辑界面
		 */
		openEdit(node, hides) {
			this.body = node || {}
			var tmp = {}
			if (hides) {
				for (let item of hides) {
					tmp[item] = true;
				}
			}
			this.hides = tmp;
		},
		/**
		 * 删除帖子
		 */
		async delPost(id) {
			await this.$get('post/del', { id });
			this.$refs.tree.remove(id)
		},
		/**
		 * 添加/修改帖子
		 */
		async add(data) {
			await this.$post('post/add', data);
			var p = this.pmap[data.pid]
			this.getChildren({ data: p }, list =>
				this.$refs.tree.updateKeyChildren(data.pid, list)
			)
			if (p) p.child_cnt++;
			this.body = false;
		},
		/**
		 * 点击节点
		 */
		click(data, node, vm) {
			this.$router.push({ path: '/node/' + data.id })
		},
		/**
		 * 拖动节点
		 */
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
	},
	mounted() {
	},
	components: {
		PostEdit,
		NodePostList,
		WorkingList,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-node {
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
