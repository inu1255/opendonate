<template>
	<v-container class="views-qr-code">
		<v-data-table dense class="elevation-1" :items="data.list" :options="data.options" @update:options="data.update($event)" :headers="headers" :server-items-length="data.total" :loading="data.loading" hide-default-footer>
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
									<img v-on="on" :src="row.alipay" alt="支付宝" width="60">
								</template>
								<img width="250" :src="row.alipay" alt="">
							</v-tooltip>
						</td>
						<td>
							<v-tooltip v-if="row.wechat" bottom right>
								<template v-slot:activator="{ on }">
									<img v-on="on" :src="row.wechat" alt="微信" width="60">
								</template>
								<img width="250" :src="row.wechat" alt="">
							</v-tooltip>
						</td>
					</tr>
				</tbody>
			</template>
			<template v-slot:footer v-if="$size.sm&&data.totalPage>1">
				<v-divider></v-divider>
				<i-page class="pa-2" circle :value="data.options.page-1" @input="data.options.page=$event+1" :total="data.total"></i-page>
			</template>
		</v-data-table>
		<v-btn v-if="!$size.sm" class="mt-2" block text :loading="data.loading" @click="data.loadmore()">加载更多</v-btn>
		<v-dialog v-model="dialog" width="700" persistent>
			<v-card>
				<v-card-title>
					<span v-if="total">导入中...{{dialog_list.length}}/{{total}}</span>
					<span v-else>导入</span>
					<v-spacer></v-spacer>
					<v-btn color="primary" @click="pick" :loading="dialog_list.length<total">文件导入</v-btn>
				</v-card-title>
				<v-card-text>
					<i-drop @drop="onFile" files>
						请检查若二维码自动裁剪有问题，请点击二维码图片手动裁剪
						<v-row v-if="total<1" align="center" style="height:70vh">
							<v-col class="tac">拖动二维码到此导入</v-col>
						</v-row>
						<v-data-table v-else :headers="dialog_headers" :items="dialog_list" disable-pagination hide-default-footer fixed-header height="70vh">
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
										<td><img :src="item.u2" @click="clip=item" width="72"></td>
										<td>
											<v-text-field :value="item.price&&item.price/100" @input="item.price=$event*100" hint="0:代表不设额度" placeholder="0:不设额度"></v-text-field>
										</td>
										<td>
											<v-select v-model="item.type" :items="dialog_types"></v-select>
										</td>
										<td>
											<v-btn icon @click="dialog_list.splice(i,1),total--">
												<v-icon>mdi-delete</v-icon>
											</v-btn>
										</td>
									</tr>
								</tbody>
							</template>
						</v-data-table>
					</i-drop>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="dialog=false" color="grey">取消</v-btn>
					<v-btn text @click="submit" color="primary">确定</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog :value="clip" width="85vh" persistent>
			<keep-alive>
				<v-card v-if="clip">
					<div style="height:80vh;">
						<i-image-crop ref="crop" :url="clip.u1" :ratio="1"></i-image-crop>
					</div>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="clip=false" color="grey">取消</v-btn>
						<v-btn text @click="clip.u2=$refs.crop.crop().toDataURL(),clip=false" color="primary">确定</v-btn>
					</v-card-actions>
				</v-card>
			</keep-alive>
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
			dialog_list: [],
			dialog_headers: ['原图', '二维码', '金额(元)', '类型', '操作'].map(text => ({ text })),
			dialog_types: utils.opts(['支付宝', '微信']),
			total: 0,
			clip: false,
		}
	},
	computed: {

	},
	watch: {
	},
	methods: {
		async query(body) {
			let { list, total } = await this.$get('qrcode/list', Object.assign({account:this.$user.info.account}, body))
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
			this.dialog_list = [];
			this.total = 0;
			this.dialog = true;
		},
		async pick() {
			let files = await utils.pick('image', true)
			if (!files.length) return;
			this.onFile(files)
		},
		async onFile(files) {
			this.total += files.length;
			for (let i = 0; this.dialog && i < files.length; i++) {
				// 先识别二维码（快）
				let file = files[i];
				let s = await qrcode.readFile(file)
				if (!s.length) {
					this.$toast.error(`${file.name} 导入失败`)
					continue;
				}
				// 识别价格
				let m;
				let { lines } = await Tesseract.recognize(file)
				let price = ''
				console.log(lines)
				for (let line of lines) {
					if (m = /¥\s*([\d\.]+)/.exec(line.text)) {
						price = parseFloat(m[1]) * 100
						break;
					}
				}
				// 切出二维码
				let url = s[0];
				let img = await utils.loadImage(URL.createObjectURL(file));
				let u2
				let type = +url.startsWith('wxp://');
				if (img.width / img.height > 0.75) u2 = utils.crop(img, 0, 0, img.width, img.height)
				else if (type) { // 1080x1481
					if (price) u2 = utils.crop(img, 272 / 1080 * img.width, 373 / 1481 * img.height, 807 / 1080 * img.width, 909 / 1481 * img.height)
					else u2 = utils.crop(img, 272 / 1080 * img.width, 295 / 1481 * img.height, 807 / 1080 * img.width, 828 / 1481 * img.height)
				}
				else // 1080x1638
					u2 = utils.crop(img, 214 / 1080 * img.width, 556 / 1638 * img.height, 864 / 1080 * img.width, 1205 / 1638 * img.height)
				let u1 = URL.createObjectURL(file);
				u2 = u2.toDataURL()
				let item = { url, type, u1, u2, price, }
				this.dialog_list.push(item)
			}
		},
		submit() {
			this.$with(async () => {
				for (let item of this.dialog_list) {
					console.log(item.price, (item.price >= 0))
					if (typeof item.price != "number" || item.price < 0)
						return ivue.toast.error('价格需要大于等于0')
				}
				for (let item of this.dialog_list) {
					let id = this.map[item.price];
					let form = new FormData()
					form.append('f', await utils.toBlob(utils.toCanvas(await utils.loadImage(item.u2))))
					let { name } = await this.$post('file/upload', form);
					let body = { id, price: item.price }
					if (item.type == 1) {
						body.wechat = '/tmp/' + name;
					} else {
						body.alipay = '/tmp/' + name;
						body.alipay_url = item.url;
					}
					let ret = await this.$post('qrcode/add', body)
					this.map[item.price] = ret.id;
				}
				this.data.search(0)
				this.dialog = false;
			})
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
