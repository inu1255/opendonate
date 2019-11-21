<template>
	<div class="i-list-item" :style="`padding-left:${avatarWidth+padding*2}px;padding-right:${padding}px;`">
		<div class="list-item-avatar" :style="`margin-left:-${avatarWidth+padding}px;`">
			<slot name="avatar"></slot>
		</div>
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IListItem",
	props: {
		padding: { type: Number, default: 10 },
		width: { type: Number },
	},
	data() {
		return {
			avatarWidth: 50,
		}
	},
	computed: {

	},
	methods: {
		refresh() {
			if (this.width)
				this.avatarWidth = this.width
			else {
				let item = this.$el.children[0]
				this.avatarWidth = item.offsetWidth
			}
		}
	},
	mounted() {
		this.refresh()
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-list-item {
	position: relative;
	overflow: hidden;
	.list-item-avatar {
		float: left;
	}
}
</style>
