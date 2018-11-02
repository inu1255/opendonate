<template>
	<div id="app">
		<app-drawer v-if="!solo" :md="md"></app-drawer>
		<div v-if="!solo" class="main" :class="{md:md}" v-resize="resize">
			<app-nav :md="md"></app-nav>
			<mu-container>
				<keep-alive>
					<router-view />
				</keep-alive>
			</mu-container>
		</div>
		<div v-else class="main solo" :class="{md:md}" v-resize="resize">
			<keep-alive>
				<router-view />
			</keep-alive>
		</div>
		<app-login :open="login"></app-login>
		<mu-dialog :title="p?p.name:''" width="360" :open="Boolean(p)">
			<mu-linear-progress mode="determinate" :value="p.percent" :size="15" color="green"></mu-linear-progress>
		</mu-dialog>
	</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import AppDrawer from './parts/AppDrawer.vue'
import AppNav from './parts/AppNav.vue'
import AppLogin from './parts/AppLogin.vue'

export default {
	name: 'App',
	data() {
		return {
			open: false,
			md: true,
			routes: [{
				path: '/poses',
				name: '人数',
				icon: "camera_alt",
			}, {
				path: '/editor',
				name: '编辑',
				icon: "border_color",
			}, {
				path: '/projects',
				name: '项目',
				icon: "apps",
			},]
		}
	},
	computed: {
		...mapState({
			loading: state => state.app.loading,
			p: state => state.app.p,
			l: state => state.app.l,
			solo: state => state.app.solo,
			user: state => state.user.user,
		}),
		login() {
			return this.l && !this.user
		}
	},
	methods: {
		...mapActions(['toggleDrawer']),
		resize() {
			this.md = window.innerWidth > 992
		},
		toggle(v) {
			this.open = v
		},
	},
	mounted() {
		this.resize()
	},
	components: {
		AppDrawer,
		AppNav,
		AppLogin,
	}
}
</script>

<style lang="less">
@import "~@/styles/methods.less";

.app-title {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 101;
  overflow: hidden;
  ~ .container {
    margin-top: 65px;
  }
}
.mu-drawer.is-open ~ .main.md {
  padding-left: 256px;
  > .app-title {
    left: 256px;
  }
}
</style>
