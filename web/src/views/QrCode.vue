<template>
	<v-container class="views-qr-code">
		<v-data-table class="elevation-1" :items="data.list" :options="data.options" @update:options="data.update($event)" :headers="headers" :server-items-length="data.total" :loading="data.loading">
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-toolbar-title>我的二维码</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-btn @click="ipt()" color="primary">导入</v-btn>
					<v-btn @click="data.search(0)" color="success" class="ml-2">刷新</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:body="{items}">
				<tbody>
					<tr v-for="row in items" :key="row.id" @click="edit(row)">
						<td>{{row.price?`¥${row.price/100}`:`不设金额`}}</td>
						<td>
							<v-tooltip v-if="row.alipay" bottom right>
								<template v-slot:activator="{ on }">
									<v-chip v-on="on" class="mr-2" text-color="white" color="blue">支付宝</v-chip>
								</template>
								<img width="250" :src="row.alipay" alt="">
							</v-tooltip>
						</td>
						<td>
							<v-tooltip v-if="row.wechat" bottom right>
								<template v-slot:activator="{ on }">
									<v-chip v-on="on" class="mr-2" text-color="white" color="green">微信</v-chip>
								</template>
								<img width="250" :src="row.wechat" alt="">
							</v-tooltip>
						</td>
					</tr>
				</tbody>
			</template>
		</v-data-table>
		<v-dialog v-model="dialog" width="600" persistent>
			<v-card>
				<v-card-title>导入二维码</v-card-title>
				<v-card-text>
					<v-data-table :loading="loading" :headers="dialog_headers" :items="dialog_list" disable-pagination hide-default-footer fixed-header height="800">
						<template v-slot:body="{items}">
							<tbody>
								<tr v-for="(item,i) in items" :key="i">
									<td>
										<v-tooltip v-if="item.u1" bottom right>
											<template v-slot:activator="{ on }">
												<img v-on="on" :src="item.u1" width="72">
											</template>
											<img width="250" :src="item.u1" alt="">
										</v-tooltip>
									</td>
									<td><img :src="item.u2" width="72"></td>
									<td>
										<v-text-field v-model="item.price" hint="单位(分)"></v-text-field>
									</td>
									<td>
										<v-select v-model="item.type" :items="dialog_types"></v-select>
									</td>
									<td>
										<v-btn icon @click="dialog_list.splice(i,1)">
											<v-icon>mdi-delete</v-icon>
										</v-btn>
									</td>
								</tr>
							</tbody>
						</template>
					</v-data-table>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="dialog=false" color="grey">取消</v-btn>
					<v-btn text @click="submit" color="primary">确定</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>
<script>
import * as qrcode from '../common/qrcode'

export default {
	name: "QrCode",
	data() {
		return {
			data: new utils.DataSource(this.query),
			headers: [{
				text: '金额',
				value: 'price',
			}, {
				text: '支付宝',
				value: 'price',
				sortable: false,
			}, {
				text: '微信',
				value: 'price',
				sortable: false,
			},],
			dialog: false,
			loading: false,
			dialog_list: [],
			dialog_headers: ['原图', '二维码', '金额', '类型', '操作'].map(text => ({ text })),
			dialog_types: utils.opts(['支付宝', '微信']),
		}
	},
	computed: {

	},
	methods: {
		async query(body) {
			let { list, total } = await this.$get('qrcode/list', Object.assign({}, body))
			for (let i = 0; i < list.length; i++) {
				let row = list[i];
				this.map[row.price] = row.id;
			}
			return { list, total };
		},
		async edit(row) {
			let price = await ivue.prompt('修改金额', { value: row.price / 100 })
			price *= 100;
			await this.$post('qrcode/add', { id: row.id, price });
			row.price = price;
			ivue.toast.success('修改成功')
		},
		ipt() {
			this.$loading(async () => {
				let list = []
				this.dialog_list = list;
				let files = await utils.pick('image', true)
				console.log(files)
				if (!files.length) return;
				this.dialog = true;
				for (let i = 0; i < files.length; i++) {
					let file = files[i];
					let s = await qrcode.readFile(file)
					if (!s.length) return;
					let url = s[0];
					let img = await utils.loadImage(URL.createObjectURL(file));
					let u2
					let type = +url.startsWith('wxp://');
					if (type) u2 = utils.crop(img, 272, 373, 807, 909)
					else u2 = utils.crop(img, 214, 556, 864, 1205)
					let item = {
						file,
						f2: u2 && await utils.toBlob(u2),
						url,
						type,
						u1: URL.createObjectURL(file),
						u2: u2.toDataURL(),
					}
					let m;
					let { lines } = await Tesseract.recognize(file)
					for (let line of lines) {
						if (m = /¥([\d\.]+)/.exec(line.text)) {
							item.price = parseFloat(m[1]) * 100
							break;
						}
					}
					list.push(item)
				}
			})
		},
		async submit() {
			for (let item of this.dialog_list) {
				if (!(item.price >= 0)) return ivue.toast.error('价格需要大于等于0')
			}
			this.dialog = false;
			for (let item of this.dialog_list) {
				let id = this.map[item.price];
				let form = new FormData()
				form.append('f', item.f2 || item.file)
				let { name } = await this.$post('file/upload', form);
				let body = { id, price: item.price }
				if (item.type == 1) {
					body.wechat = '/tmp/' + name;
				} else {
					body.alipay = '/tmp/' + name;
					body.alipay_url = item.url;
				}
				await this.$post('qrcode/add', body)
			}
			this.data.search(0)
		}
	},
	mounted() {
		this.map = {}
	},
	components: {
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-qr-code {
}
</style>
