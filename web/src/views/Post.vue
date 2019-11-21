<template>
	<div class="views-post">
		<div class="content">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item :to="`/node`">首页</el-breadcrumb-item>
				<el-breadcrumb-item v-for="item in breadcrumbs" :to="`/node/${item.id}`">{{item.title}}</el-breadcrumb-item>
			</el-breadcrumb>
			<hr>
			<div class="flex">
				<el-avatar :src="$user.get(post.create_id).avatar"></el-avatar>
				<span class="ml1">{{$user.get(post.create_id).name}}</span>
				<span class="ml1">创建于：</span>
				<i-date :value="post.create_at"></i-date>
				<div style="flex:1" class="tar">
					<i-icon class="ml1" :name="post._icon" @click="record(post)"></i-icon>
					<i-date v-show="timing" :value="timing"></i-date>
					<i-icon class="ml1" name="edit" @click="openEdit(post)"></i-icon>
				</div>
			</div>
			<hr>
			<i-render :value="post.content||''" disabled></i-render>
		</div>
		<i-modal :open.sync="body">
			<PostEdit :post="body" :hides="hides" @cancel="body=false" @save="add"></PostEdit>
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
			hides: {},
			post: { content: '' },
			breadcrumbs: [],
			timing: 0,
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
		async open(id) {
			if (id) {
				let ret = await this.$get('post/get', { id, with_user: 1 });
				this.$user.addcache(ret.users);
				ret.post._icon = 'play';
				ret.post._start = 0;
				ret.post._end = 0;
				ret.post._recording = false;
				this.post = ret.post;
				this.breadcrumbs = ret.breadcrumbs;
			}
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
		async delPost(node) {
			await this.$get('post/del', { id: node.id });
			this.$router.replace('/node/' + node.pid)
		},
		async add(data) {
			await this.$post('post/add', data);
			Object.assign(this.post, data)
			this.body = false;
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
				this.timing = 0;
				this.handle = setInterval(() => {
					this.timing++;
				}, 1e3);
				return true;
			}
			if (!item._recording) {
				if (!item._end) {
					item._end = Date.now();
					clearInterval(this.handle);
					this.handle = 0;
				}
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
					this.timing = 0;
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
	},
	components: {
		PostEdit,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-post {
	> .tar {
		padding: 1em;
		border-bottom: 1px solid #ccc;
	}
	> .content {
		.depth;
		box-sizing: border-box;
		min-height: 100vh;
		max-width: 736px;
		margin: auto;
		padding: 1em;
	}
}
</style>
