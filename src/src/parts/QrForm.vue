<template>
	<mu-dialog class="parts-qr-form" :title="title" width="360" :open="Boolean(open)" @update:open="close">
		<mu-form :model="body" label-position="top">
			<mu-form-item prop="price" label="金额">
				<mu-text-field v-model="body.price" type="number" v-focus></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="alipay" label="支付宝">
				<mu-text-field v-model="body.alipay" @paste="paste"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="wechat" label="微信">
				<mu-text-field v-model="body.wechat" type="file"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="api" label="发货接口">
				<mu-text-field v-model="body.api"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="cer" label="密钥">
				<mu-text-field v-model="body.cer"></mu-text-field>
			</mu-form-item>
			<mu-form-item prop="back" label="回跳网址">
				<mu-text-field v-model="body.back"></mu-text-field>
			</mu-form-item>
		</mu-form>
		<mu-button slot="actions" flat @click="close">取消</mu-button>
		<mu-button slot="actions" flat color="primary" @click="onSubmit" :disabled="disabled">确定</mu-button>
	</mu-dialog>
</template>
<script>
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from "vuex-class";
import utils from '../common/utils';

@Component()
export default class QrForm extends Vue {
	@Prop({ required: true }) open;
	body = {}
	get title() {
		return (this.body.id ? '修改' : '添加') + '节点'
	}
	@Watch('open')
	onOpen() {
		if (this.open)
			this.body = Object.assign({}, this.open)
	}
	close() {
		this.$emit('update:open', false)
	}
	@utils.loading('disabled')
	async onSubmit() {
		let form = utils.clearKeys(this.body, this.open);
		if (!Object.keys(form).length) return this.$toast.message('什么也没有做 -.-')
		let data
		if (this.open.id) {
			form.id = this.open.id
			data = await this.$post('orders/qr_add', form)
		} else {
			data = await this.$post('orders/qr_add', form)
		}
		this.$emit('change', data, this.open.id)
		this.close()
	}
	paste(e) {
		console.log(e)
	}
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-qr-form {
}
</style>
