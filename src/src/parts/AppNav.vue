<template>
	<mu-appbar class="app-title"  color="blueGrey900">
		<mu-button v-if="!md" @click="toggleDrawer" icon slot="left">
			<mu-icon value="menu"></mu-icon>
		</mu-button>
		<router-link to="/" tag="span" class="btn">盆儿支付</router-link>
		<mu-menu slot="right">
			<mu-button @click="logout" flat>注销</mu-button>
		</mu-menu>
	</mu-appbar>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class AppNav extends Vue {
	@Prop() md
	@Action('toggleDrawer') toggleDrawer
	@Action('logout') logout
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-app-nav {
}
</style>
