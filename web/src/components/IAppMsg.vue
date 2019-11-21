<template>
	<i-modal :open="open" :style="{width:width}">
		<div class="msg-dialog depth-1">
			<h3>{{title}}</h3>
			<i-span copy>{{text}}</i-span>
			<i-input v-if="input" v-model.lazy="value" autofocus></i-input>
			<div class="tar">
				<i-button class="o-gray" v-if="failureText" @click="close('failure')">{{failureText}}</i-button>
				<i-button class="blue" v-if="successText" @click="close('success')">{{successText}}</i-button>
			</div>
		</div>
	</i-modal>
</template>
<script>
import IModal from './IModal';
import ISpan from './ISpan';
import IInput from './IInput';
import IButton from './IButton';

export default {
	name: "IAppMsg",
	props: {
		width: Number,
		failureText: String,
		successText: String,
		title: String,
		text: String,
		input: Boolean,
	},
	data: function () {
		return {
			open: true,
			value: '',
		}
	},
	computed: {

	},
	methods: {
		close(e) {
			this.open = false;
			this.$emit(e, this.value)
		}
	},
	mounted() {

	},
	components: {
		IModal,
		ISpan,
		IInput,
		IButton,
	},
}
</script>