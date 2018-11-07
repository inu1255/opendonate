<template>
	<mu-drawer :open="md||show" @update:open="toggleDrawer" :docked="md">
		<!-- 个人信息 -->
		<mu-card style="width: 100%; max-width: 375px; margin: 0 auto;">
			<mu-card-header v-if="user" :title="user.name" :sub-title="user.money-user.mCost+' S币'">
				<mu-avatar class="btn" color="teal" slot="avatar">
					<router-link tag="span" to="/user_edit">
						<img v-if="user.avatar" :src="user.avatar" :alt="user.id">
						<span v-else>{{user.account.slice(0,1)}}</span>
					</router-link>
				</mu-avatar>
			</mu-card-header>
			<mu-button v-else flat style="width: 100%;">登录</mu-button>
		</mu-card>
		<mu-divider></mu-divider>
		<mu-list>
			<mu-list-item v-for="route in routes" :key="route.name" :to="route.path" button>
				<mu-list-item-action v-if="route.icon">
					<i :class="'i i-'+route.icon" style="font-size:24px;"></i>
				</mu-list-item-action>
				<mu-list-item-title>{{route.name}}</mu-list-item-title>
			</mu-list-item>
		</mu-list>
	</mu-drawer>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from "vuex-class";
import utils from '../common/utils';
import routes from '../router/routes.js';

@Component()
export default class AppDrawer extends Vue {
	@State(state => state.user.user) user
	@State(state => state.app.loading) loading
	@State(state => state.app.show) show
	@Getter('isAdmin') isAdmin
	@Prop() md
	get routes() {
		let list = routes.filter(x => x.meta.menu)
		if (!this.isAdmin) list = list.filter(x => !x.meta.adm)
		return list.map(({ name, path, icon }) => ({ name, icon, path: path.split('/').slice(0, 2).join('/') }))
	}
	@Action('toggleDrawer') toggleDrawer
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-app-drawer {
}
</style>
