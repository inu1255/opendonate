<template>
	<mavon-editor :value='value' @change="$emit('input',$event)" ref=md :toolbars="toolbars" :boxShadow="false" :toolbarsFlag="!disabled" :subfield="!disabled" :default-open="disabled?'preview':'edit'" @imgAdd="imgAdd" @imgDel="imgDel" />
</template>
<script>
export default {
	name: "Markdown",
	props: {
		value: String,
	},
	data() {
		return {
			toolbars: {
				bold: true, // 粗体
				italic: true, // 斜体
				header: true, // 标题
				underline: true, // 下划线
				strikethrough: true, // 中划线
				mark: true, // 标记
				superscript: true, // 上角标
				subscript: true, // 下角标
				quote: true, // 引用
				ol: true, // 有序列表
				ul: true, // 无序列表
				link: true, // 链接
				imagelink: true, // 图片链接
				code: true, // code
				table: true, // 表格
				fullscreen: false, // 全屏编辑
				readmodel: false, // 沉浸式阅读
				htmlcode: false, // 展示html源码
				help: true, // 帮助
				/* 1.3.5 */
				undo: false, // 上一步
				redo: false, // 下一步
				trash: false, // 清空
				save: false, // 保存（触发events中的save事件）
				/* 1.4.2 */
				navigation: true, // 导航目录
				/* 2.1.8 */
				alignleft: true, // 左对齐
				aligncenter: true, // 居中
				alignright: true, // 右对齐
				/* 2.2.1 */
				subfield: true, // 单双栏模式
				preview: true, // 预览
			}
		}
	},
	computed: {
		disabled() {
			return !this.$listeners.input
		}
	},
	methods: {
		imgAdd(filename, file) {
			console.log(filename, file)
		},
		imgDel(filename) {
			console.log(filename)
		},
	},
	mounted() {

	},
	components: {
	},
}
</script>