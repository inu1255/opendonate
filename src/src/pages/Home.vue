<template>
	<div class="pages-home">
		<i-header fixed bg="#6f8ff0">
			<mu-button slot="right" icon>
				<i class="fa fa-github"></i>
			</mu-button>
			<mu-button slot="right" icon>
				<i class="fa fa-github"></i>
			</mu-button>
			<ul>
				<router-link tag="li" to="/">首页</router-link>
				<router-link tag="li" to="/donate/1?page=0&n=1">支付体验</router-link>
				<router-link tag="li" to="/donate/1">捐赠名单</router-link>
				<router-link tag="li" to="/wiki">开发教程</router-link>
				<router-link tag="li" to="/qrcode">管理后台</router-link>
			</ul>
		</i-header>
		<mu-container style="color: #fff;font-size: 24px;line-height:100vh;">
			<mu-row gutter>
				<mu-col class="tac" span="12" md="6" lg="4">
					上传收款码
				</mu-col>
				<mu-col class="tac" span="12" md="6" lg="4">
					调用收款网页
				</mu-col>
				<mu-col class="tac" span="12" md="6" lg="4">
					确认收款发货
				</mu-col>
			</mu-row>
		</mu-container>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component({ components: {} })
export default class Home extends Vue {
	@State(state => state.user.user) user;
	@Action('logout') logout;

	posts = []
	async refresh() {
		let { posts, users } = await this.$get('post/shares')
		utils.cacheUsers(users)
		for (let item of posts) {
			this.formatPost(item)
		}
		this.posts = posts
	}
	formatPost(post) {
		post.create = utils.getUser(post.create_id)
		post.edit = utils.getUser(post.edit_id)
	}
	login() {
		this.$store.commit('app.l', true)
	}
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-home {
  background-color: #6f8ff0;
}
</style>
