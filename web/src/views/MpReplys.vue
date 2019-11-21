<template>
	<div class="views-mp-replys">
		<router-link :to="`/mp/replys/${mid}`">回复</router-link>
		<router-link :to="`/mp/cards/${mid}`">发卡</router-link>
		<hr>
		<i-table :data="list" :headers="headers">
			<td slot="expired_at" slot-scope="{item}">
				<i-date :value="item.expired_at"></i-date>
			</td>
			<td slot="tools" slot-scope="{item}">
				<i-button @click="onEdit(item)">修改</i-button>
				<i-button @click="del(item)" color="#f00">删除</i-button>
			</td>
		</i-table>
		<div class="tar">
			<i-button class="green" @click="refresh">刷新</i-button>
			<i-button class="blue" @click="onAdd">添加</i-button>
		</div>
		<i-modal :open.sync="add_dialog">
			<div class="form-dialog">
				<i-input flex v-model="body.name" label="规则名称" :counter="32" :rules="[v=>v.length<=32||'长度最多32']" autofocus></i-input>
				<i-radio flex v-model="body.kind" :opts="['关键词','全词','正则','表达式','关注']" label="规则类型"></i-radio>
				<i-input v-if="body.kind!=4" flex v-model="body.r" label="关键词" :counter="256"></i-input>
				<i-input flex v-model="body.idx" label="优先级" placeholder="数值越大越优先"></i-input>
				<i-input @click="dateOpen=true" flex v-model="body.expired_at" label="过期时间" placeholder="2019-01-01" type="datetime" readonly>
					<i-button class="green" @click="body.expired_at=''">不过期</i-button>
				</i-input>
				<i-radio flex v-model="replyType" label="回复类型" :opts="['文字','图文']"></i-radio>
				<i-input v-if="replyType==0" flex v-model="text" label="规则回复内容" required></i-input>
				<div style="margin-top: .5rem;" v-else column>
					<i-input flex v-model="article.title" label="标题" required></i-input>
					<i-input flex v-model="article.description" label="描述" required></i-input>
					<i-input flex v-model="article.picurl" label="图片链接" required></i-input>
					<i-input flex v-model="article.url" label="跳转链接" required></i-input>
				</div>
				<div class="tar" style="margin-top: 1rem;">
					<i-button class="blue depth-1" @click="submit">确定</i-button>
				</div>
			</div>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "MpReplys",
	data() {
		return {
			list: [],
			body: { kind: 0, name: '', r: '', idx: 0, value: '' },
			text: '', // 普通回复消息
			article: { // 图文消息
				title: '',
				description: '',
				picurl: '',
				url: ''
			},
			add_dialog: false,
			replyType: 0,
			dateOpen: false,
		}
	},
	computed: {
		headers() {
			var kinds = ["关键词", "全词", "正则", "表达式", "关注"];
			return [{
				key: 'id',
				title: '#',
			}, {
				key: 'name',
				title: '规则名称',
			}, {
				key: 'kind',
				title: '规则类型',
				text: (item) => kinds[item.kind]
			}, {
				key: 'r',
				title: '关键词',
			}, {
				key: 'ans',
				title: '回复',
			}, {
				key: 'expired_at',
				title: '过期时间',
			}, {
				key: 'idx',
				title: '优先级',
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
			var { list } = await this.$get('mp/reply_list', { mid: this.mid })
			for (let item of list) {
				if (item.value.startsWith('[')) item.ans = '【图文】'
				else item.ans = JSON.parse(item.value)
			}
			this.list = list
		},
		onAdd() {
			delete this.body.id;
			this.add_dialog = true;
		},
		onEdit(item) {
			this.edit = item;
			this.body = Object.assign({}, item);
			console.log(item)
			this.replyType = +item.value.startsWith('[')
			if (this.replyType) {
				this.article = JSON.parse(item.value)[0]
			} else {
				this.text = JSON.parse(item.value)
			}
			this.add_dialog = true;
		},
		async del(item) {
			await this.$get('mp/reply_del', { id: item.id })
			this.$toast.success('删除成功');
			this.list.splice(this.list.indexOf(item), 1);
		},
		async submit() {
			this.body.mid = this.mid;
			if (this.replyType) this.body.value = JSON.stringify([this.article])
			else this.body.value = JSON.stringify(this.text);
			let data = await this.$post('mp/reply_add', this.body);
			if (this.body.id) {
				Object.assign(this.edit, this.body);
				this.$toast.success('修改成功');
			} else {
				if (data.value instanceof Array) data.value = JSON.stringify(data.value)
				if (data.value.startsWith('[')) data.ans = '【图文】'
				else data.ans = JSON.parse(data.value)
				this.list.push(data)
				this.$toast.success('添加成功');
			}
			console.log(data)
			this.add_dialog = false;
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
.views-mp-replys {
	padding: 1rem;
	max-width: 60rem;
	margin: 0 auto;
}
</style>
