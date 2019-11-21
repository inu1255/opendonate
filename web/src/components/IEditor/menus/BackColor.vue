<template>
	<div class="i-editor-menu_backColor group">
		<span class="btn iconfont icon-fill" title="背景颜色" :style="{backgroundColor:color}" @click="backColor"></span>
		<span class="btn iconfont icon-triangle" @click="show=true"></span>
		<i-popup :aim="$el" pos="left-top" :open.sync="show">
			<sketch-picker :value="color" @input="color=$event.rgba"></sketch-picker>
		</i-popup>
	</div>
</template>
<script>
import IPopup from '../../IPopup';
export default {
	name: "BackColor",
	inject: ["editor"],
	data() {
		return {
			active: false,
			show: false,
			color: '#ffff00',
		}
	},
	watch: {
		color() {
			this.backColor()
		}
	},
	methods: {
		backColor() {
			this.editor.execCommand('backColor', this.color)
		}
	},
	components: {
		"sketch-picker": VueColor.Sketch,
		IPopup
	},
}
</script>