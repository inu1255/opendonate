<template>
	<div class="subview-post-edit">
		<div class="flex-center p1">
			标题: <el-input style="width:240px;" size="mini" v-model="body.title" placeholder="标题"></el-input>　
			<el-select class="ml1" style="width:84px;" size="mini" v-model="body.type" placeholder="类型">
				<el-option v-for="(item,idx) in options" :key="idx" :label="item" :value="idx">
				</el-option>
			</el-select>
		</div>
		<i-editor ref="editor" :value="body.content" :toURL="toURL">
			<clear></clear>
			<split></split>

			<align-left></align-left>
			<align-center></align-center>
			<align-right></align-right>
			<indent></indent>
			<unindent></unindent>
			<order-list></order-list>
			<unorder-list></unorder-list>
			<block-quote></block-quote>
			<split></split>

			<bold></bold>
			<italic></italic>
			<underline></underline>
			<strike-through></strike-through>
			<split></split>

			<heading></heading>
			<font-name></font-name>
			<font-size></font-size>
			<font-color></font-color>
			<back-color></back-color>
			<split></split>
			<emoji></emoji>
		</i-editor>
		<div class="tar">
			<i-button class="red" @click="$emit('cancel')">取消</i-button>
			<i-button class="green" @click="save">保存</i-button>
		</div>
	</div>
</template>
<script>
import {
	IEditor,
	Clear,
	Split,
	// 段落样式
	AlignLeft,
	AlignCenter,
	AlignRight,
	Indent,
	Unindent,
	OrderList,
	UnorderList,
	BlockQuote,
	// 字体样式
	Bold,
	Italic,
	Underline,
	StrikeThrough,
	Supscript,
	Subscript,
	Horizontal,
	// 颜色样式
	Heading,
	FontName,
	FontSize,
	FontColor,
	BackColor,
	// 其它
	CreateLink,
	InsertImage,
	Emoji
} from '../components/IEditor'

function newPost() {
	return {
		pid: 0,
		type: 1,
		title: '',
		content: ''
	}
}

export default {
	name: "PostEdit",
	props: {
		id: Number, // 帖子ID
		post: {}, // 帖子
	},
	data() {
		return {
			body: {},
			options: ["节点", "任务"]
		}
	},
	watch: {
		id: {
			immediate: true,
			handler() {
				if (this.id) this.open(this.id)
			}
		},
		post: {
			immediate: true,
			handler() {
				if (this.post) this.body = Object.assign(newPost(), this.post)
			}
		},
	},
	computed: {

	},
	methods: {
		async open(id) {
			let ret = await utils.http.get('post/get', { id })
			this.body = ret.post;
		},
		async toURL(file) {
			let form = new FormData()
			form.append('f', file)
			let { url } = await this.$post('file/upload', form)
			return url
		},
		save() {
			let body = this.body
			body.content = this.$refs.editor.getData();
			this.$emit('save', body)
		}
	},
	mounted() {

	},
	components: {
		IEditor,
		Clear,
		Split,
		// 段落样式
		AlignLeft,
		AlignCenter,
		AlignRight,
		Indent,
		Unindent,
		OrderList,
		UnorderList,
		BlockQuote,
		// 字体样式
		Bold,
		Italic,
		Underline,
		StrikeThrough,
		Supscript,
		Subscript,
		Horizontal,
		// 颜色样式
		Heading,
		FontName,
		FontSize,
		FontColor,
		BackColor,
		// 其它
		CreateLink,
		InsertImage,
		Emoji
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.subview-post-edit {
	background: #fff;
	height: 90vh;
	display: flex;
	flex-direction: column;
	> .i-editor {
		flex: 1;
		padding: 0 1em;
		> .i-editor-content {
			width: 736px;
		}
	}
	> .tar,
	> .title {
		padding: 0.5em 1em;
	}
}
</style>
