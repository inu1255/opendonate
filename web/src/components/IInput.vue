<template>
	<div :title="label+msg" class="i-input" :class="{msg,flex,clear:clear&&value}">
		<span v-if="label" class="label">{{label}}</span>
		<input :value="value" :placeholder="placeholder" :type="type" @input="oninput($event,'input')" @change="oninput($event,'change')">
		<i-icon v-show="clear&&value" @click="onclear" name="close"></i-icon>
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IInput",
	props: {
		type: String,
		value: {},
		placeholder: String,
		min: Number,
		max: Number,
		label: { type: String, default: '' },
		clear: Boolean,
		flex: Boolean, // 整行输入
		// TODO:
		counter: Number, // 限制和显示长度
		required: Boolean, // 必填
	},
	data() {
		return {
			msg: '', // 错误信息
		}
	},
	computed: {

	},
	methods: {
		onclear() {
			this.$emit('input', '')
			this.$emit('change', '')
			this.$el.querySelector('input').focus()
		},
		oninput(e, type) {
			this.msg = '';
			if (this.min != null && e.target.value < this.min)
				this.msg = `不能小于${this.min}`
			if (this.max != null && e.target.value > this.max)
				this.msg = `不能大于${this.max}`
			this.$emit(type, e.target.value)
		}
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-input {
	position: relative;
	display: inline-block;
	font-size: 0.9rem;
	+ .i-radio,
	+ .i-input {
		margin-left: 0.8em;
	}
	&.flex {
		display: flex;
		align-items: center;
		width: 100%;
		+ .i-radio,
		+ .i-input {
			margin-left: 0;
			margin-top: 0.8em;
		}
	}
	&.msg {
		border: 1px solid #f00;
	}
	> .label {
		color: #999;
		display: inline-block;
		margin-right: 0.8em;
	}
	> input {
		flex: 1;
		border: none;
		border-bottom: 1px solid #ccc;
	}
	&.clear {
		input {
			padding-right: 1.4em;
		}
		input[type="number"] {
			width: 7.5em;
		}
	}
	> .i-close {
		color: #888;
		display: none;
		position: absolute;
		right: 0.2em;
		cursor: pointer;
	}
	&:hover > .i-close,
	> input:focus + .i-close {
		display: inline-block;
	}
}
</style>
