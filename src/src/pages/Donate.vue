<template>
	<div class="pages-donate">
		<i-header v-if="$route.params.id==3" bg="#333">
			<mu-button slot="right" icon>
				<i class="fa fa-github"></i>
			</mu-button>
			<mu-button slot="right" icon>
				<i class="fa fa-github"></i>
			</mu-button>
			<ul>
				<router-link tag="li" to="/">首页</router-link>
				<li @click="body={}">支付体验</li>
				<li @click="refresh">捐赠名单</li>
				<router-link tag="li" to="/wiki">开发教程</router-link>
				<router-link tag="li" to="/qrcode">管理后台</router-link>
			</ul>
		</i-header>
		<mu-container>
			<h3>名称: {{user.name}}</h3>
			<pre v-if="user.profile">介绍：{{user.profile}}</pre>
			<br>
			<mu-paper :z-depth="1">
				<mu-data-table stripe :loading="loading" :columns="columns" :data="list" :sort.sync="sort">
					<template slot-scope="{row}">
						<td class="tac">{{row.email}}</td>
						<td class="tac">{{row.price}}</td>
						<td class="tac">{{row.remark}}</td>
						<td class="tac">
							<i-date :value="row.create_at"></i-date>
						</td>
					</template>
				</mu-data-table>
			</mu-paper>
			<br>
			<mu-flex v-if="total>15" justify-content="center">
				<mu-pagination :total="total" :current.sync="query.page"></mu-pagination>
			</mu-flex>
		</mu-container>
		<i-form :width="480" :params="columns" :open.sync="body" :submit="onDonate"></i-form>
	</div>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class Donate extends Vue {
	query = utils.query({ page: 1, n: 0 }, true)
	columns = [{
		title: '捐赠者邮箱',
		name: 'email',
		align: 'center',
		width: 200,
		label: '您的邮箱',
		type: 'text',
		rules: utils.rule('need', 'email'),
	}, {
		title: '金额(元)',
		name: 'price',
		align: 'center',
		width: 96,
		sortable: true,
		type: 'number',
		min: 0.01,
		rules: utils.rule('need'),
	}, {
		title: '备注',
		name: 'remark',
		align: 'center',
		type: 'text'
	}, {
		title: '捐赠时间',
		name: 'create_at',
		align: 'center',
		width: 96,
		sortable: true,
	}]
	list = []
	total = 0
	user = {}
	sort = {
		name: 'create_at',
		order: 'desc'
	}
	loading = false
	body = false
	@Watch('$route')
	onShow() {
		setTimeout(() => {
			if (this.$route.query.n) this.body = {}
		}, 350);
	}
	created() {
		if (this.query.n) this.body = {}
	}
	onDonate(body) {
		if (body.price < 0.01) return this.$toast.success('感谢您的支持')
		location.href = `http://localhost:8080/pay?u=3&price=${Math.floor(body.price * 100)}&ext=${encodeURIComponent(JSON.stringify({ email: body.email, remark: body.remark }))}`
	}
	format(item) {
		if (item.price) item.price /= 100
	}
	@Watch('page')
	@utils.loading()
	async refresh() {
		let { list, total, user } = await this.$get('donate/list', { uid: this.$route.params.id, offset: Math.max(this.query.page - 1, 0) * 15, sort: this.sort.name, order: this.sort.order })
		for (let item of list) {
			this.format(item)
		}
		this.list = list
		this.total = total
		this.user = user
	}
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.pages-donate {
}
</style>
