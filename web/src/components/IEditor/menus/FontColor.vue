<template>
	<div class="i-editor-menu_foreColor group">
		<span class="btn iconfont icon-font-color" title="字体颜色" :style="{color:color}" @click="foreColor"></span>
		<span class="btn iconfont icon-triangle" @click="show=true"></span>
		<i-popup :aim="$el" pos="left-top" :open.sync="show">
			<sketch-picker :value="color" @input="color=$event.rgba"></sketch-picker>
		</i-popup>
	</div>
</template>
<script>
export default {
	name: "FontColor",
	inject: ['editor'],
	data() {
		return {
			active: false,
			show: false,
			color: '#ff0000'
		}
	},
	watch: {
		color() {
			this.foreColor()
		}
	},
	methods: {
		foreColor() {
			this.editor.foreColor(this.color)
		}
	},
	components: {
		"sketch-picker": VueColor.Sketch,
	}
}
</script>