<template>
	<div class="views-mp-cards">
		<router-link :to="`/mp/replys/${mid}`">回复</router-link>
		<router-link :to="`/mp/cards/${mid}`">发卡</router-link>
		<hr>
		<ol style="font-size:.8em;">
			<li>清空后重新导入,全部变成未领取</li>
			<li>导入条目与已存在的卡号重复,密码一样的会忽略,密码不一样的会替换密码并改成未领取</li>
		</ol>
		<div class="tar" style="margin-bottom:1rem;">
			<i-button class="red" @click="clear">清空</i-button>
			<i-button class="green" @click="refresh">刷新</i-button>
			<i-button class="blue" @click="onIpt">导入</i-button>
		</div>
		<i-table :data="list" :headers="headers">
			<td slot="expired_at" slot-scope="{item}">
				<i-date :value="item.expired_at" def="未领取"></i-date>
			</td>
			<td slot="tools" slot-scope="{item}">
				<i-button @click="onEdit(item)">修改</i-button>
				<i-button @click="del(item)" color="#f00">删除</i-button>
			</td>
		</i-table>
	</div>
</template>
<script>
export default {
	name: "MpCards",
	data() {
		return {
			list: [],
		}
	},
	computed: {
		headers() {
			var kinds = ["关键词", "全词", "正则", "表达式", "关注"];
			return [{
				key: 'id',
				title: '#',
			}, {
				key: 'r',
				title: '卡号',
			}, {
				key: 'ans',
				title: '密码',
			}, {
				key: 'expired_at',
				title: '领取时间',
			}, {
				key: 'tools',
				title: '操作',
			}]
		},
		mid() {
			return +this.$route.params.id
		}
	},
	methods: {
		async refresh() {
			var { list } = await this.$get('mp/reply_list', { mid: this.mid, card: 1 })
			for (let item of list) {
				if (item.value.startsWith('[')) item.ans = '【图文】'
				else item.ans = JSON.parse(item.value)
			}
			this.list = list
		},
		async clear() {
			await ivue.confirm('确定要清空吗?')
			let { n } = await this.$get('mp/reply_clear', { mid: this.mid, name: 'card dispenser' })
			this.$toast.success(`清空${n}条`)
			if (n) this.refresh()
		},
		async del(item) {
			await this.$get('mp/reply_del', { id: item.id })
			this.$toast.success('删除成功');
			this.list.splice(this.list.indexOf(item), 1);
		},
		async onIpt() {
			let f = await utils.pick()
			if (!f.name.endsWith('.xlsx')) return this.$toast.error('只能导入xlsx文件')
			let form = new FormData()
			form.append('mid', this.mid)
			form.append('f', f)
			form.append('kind', 5) // 发卡
			let { n, c } = await this.$post('mp/reply_ipt', form)
			let msg = `导入${n}条`
			if (c) {
				msg += `,修改${c}条`
			}
			this.$toast.success(msg)
			if (n) this.refresh()
		},
	},
	mounted() {
		this.refresh();
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-mp-cards {
	padding: 1rem;
	max-width: 60rem;
	margin: 0 auto;
}
</style>
