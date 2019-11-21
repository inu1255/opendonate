<template>
	<v-container class="views-donate">
		<v-card :elevation="3">
			<v-data-table :headers="headers" :items="data.list" :options="data.options" @update:options="data.update($event)" :server-items-length="data.total" :loading="data.loading">
				<template v-slot:top>
					<v-toolbar flat color="white">
						<v-toolbar-title><b>{{app.title}}</b><small> by </small> {{app.create_name}}</v-toolbar-title>
						<v-spacer></v-spacer>
						<v-btn @click="dialog=true" color="primary">捐赠</v-btn>
					</v-toolbar>
					<pre v-if="app.detail">介绍：{{app.detail}}</pre>
				</template>
				<template v-slot:body="{ items }">
					<tbody>
						<tr v-for="item in items" :key="item.id">
							<td class="tac">{{item.email}}</td>
							<td class="tac">{{item.price}}</td>
							<td class="tac">{{item.remark}}</td>
							<td class="tac">
								<i-date :value="item.create_at"></i-date>
							</td>
						</tr>
					</tbody>
				</template>
			</v-data-table>
		</v-card>
		<iv-form title="捐赠" v-model="dialog" width="500" @submit="submit">
			<v-text-field v-model="body.email" :rules="$rules.email()" label="邮箱"></v-text-field>
			<v-text-field v-model="body.price" :rules="$rules.price(true)" label="金额" autofucus type="number" min="0.01" step="0.01"></v-text-field>
			<v-textarea v-model="body.remark" label="备注" :counter="64"></v-textarea>
		</iv-form>
	</v-container>
</template>
<script>
import { DataSource } from '../common/utils';

export default {
	data() {
		return {
			headers: [{
				text: '捐赠者邮箱',
				value: 'email',
				align: 'center',
				width: 200,
				label: '您的邮箱',
			}, {
				text: '金额(元)',
				value: 'price',
				align: 'center',
				width: 96,
				sortable: true,
				min: 0.01,
			}, {
				text: '备注',
				value: 'remark',
				align: 'center',
			}, {
				text: '捐赠时间',
				value: 'create_at',
				align: 'center',
				width: 108,
				sortable: true,
			}],
			data: new DataSource(this.query),
			user: {},
			app: {},
			dialog: false,
			body: {
				email: '',
				price: '',
				remark: '',
			},
		}
	},
	watch: {
		page() {
			this.refresh()
		}
	},
	methods: {
		submit() {
			let body = this.body;
			if (body.price < 0.01) return this.$toast.success('感谢您的支持')
			let ext = JSON.stringify({ email: body.email, remark: body.remark });
			let id = this.$route.params.id;
			location.href = `${location.protocol}//${location.host}/pay/create?aid=${id}&price=${Math.floor(body.price * 100)}&ext=${encodeURIComponent(ext)}`
		},
		format(item) {
			if (item.price) item.price /= 100
		},
		async query(body) {
			let app_id = this.$route.params.id;
			let { list, total } = await this.$get('donate/list', Object.assign({ app_id }, body))
			for (let item of list) {
				this.format(item)
			}
			return { list, total };
		},
		async refresh() {
			let id = this.$route.params.id;
			this.app = await this.$get('app/get', { id })
		}
	},
	mounted() {
		this.refresh()
	}
}
</script>
<style lang="less">
.views-donate {
}
</style>
