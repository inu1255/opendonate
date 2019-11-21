<template>
	<div class="i-editor-menu_clear" @click="removeFormat">
		<span class="btn iconfont icon-eraser" title="清除格式"></span>
	</div>
</template>
<script>
export default {
	name: "Clear",
	inject: ["editor"],
	methods: {
		removeFormat() {
			this.editor.execCommand('removeFormat')
		}
	}
}
</script>