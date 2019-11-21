<template>
	<div class="i-radio">
		<span v-if="label" class="label">{{label}}</span>
		<label v-if="all" :class="{active:value==null}">
			<input type="checkbox" :checked="value==null" @click="$emit('input',null)">
			<span>全部</span>
		</label>
		<label v-for="(item,i) in options" :key="i" :class="{active:value==item.value,disabled:item.disabled}">
			<input type="checkbox" :checked="value==item.value" :disabled="item.disabled" @click="!item.disabled&&$emit('input',item.value)">
			<span>{{item.label}}</span>
		</label>
	</div>
</template>
<script>
export default {
	name: "IRadio",
	props: {
		opts: Array,
		enables: Array,
		value: {},
		all: Boolean, // 是否可以选择全部
		label: { type: String, default: '' },
	},
	data() {
		return {

		}
	},
	computed: {
		options() {
			var ss = []
			if (this.opts)
				ss = this.opts.map((x, i) => ({ value: i, label: x }))
			if (this.enables)
				this.enables.forEach((x, i) => ss[i].disabled = !x);
			return ss;
		}
	},
	methods: {

	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-radio {
	width: 100%;
	position: relative;
	display: flex;
	font-size: 0.9rem;
	+ .i-radio,
	+ .i-input {
		margin-top: 0.7rem;
	}
	> .label {
		color: #999;
		display: inline-block;
		margin-right: 0.5rem;
	}
	> .disabled {
		cursor: not-allowed;
		> span {
			opacity: 0.5;
		}
	}
	> label {
		> span {
			font-size: 0.8em;
		}
		&.active {
			> span {
				color: @blue;
			}
		}
	}
}
</style>
