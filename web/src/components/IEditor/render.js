export default {
	props: {
		disabled: Boolean,
		config: { default () { return { msg: 'hello' } } },
		value: String,
	},
	computed: {
		content() {
			var that = this;
			var evt = ["keyup", "keydown", "blur", "paste", "drop", "dragover"].map(x => `@${x}="$emit('${x}',$event)"`).join(' ')
			var res = Vue.compile(`<div class="i-editor-content scrollY" ${evt} ${this.disabled?'':'contenteditable'}>${this.value}</div>`)
			return {
				data() {
					return that.config
				},
				render: res.render,
				staticRenderFns: res.staticRenderFns,
			}
		}
	},
	render(h) {
		return h(this.content)
	},
	methods: {
		/**
		 * @param {Element|NodeList} nodes 
		 */
		disable(nodes) {
			if (!nodes) nodes = this.$el.childNodes;
			if (nodes instanceof NodeList) {
				for (let i = 0; i < nodes.length; i++) {
					let node = nodes[i];
					this.disable(node)
				}
				return;
			}
			if (nodes.__vue__)
				nodes.setAttribute('contenteditable', 'false')
			else if (nodes.childNodes)
				this.disable(nodes.childNodes)
		},
		quot(s) {
			if (s.indexOf('"') < 0) {
				if (!/\W/.test(s)) return s;
				return `"${s}"`
			}
			return `'${s.replace(/'/g, '&apos;')}'`
		},
		getVNode(nodes) {
			if (!nodes) return ''
			let html = ""
			if (nodes instanceof Array) {
				for (let i = 0; i < nodes.length; i++)
					html += this.getVNode(nodes[i])
				return html;
			}
			const node = nodes;
			if (!node.data)
				return node.elm.data;
			var tag = node.tag;
			var attr = ''
			if (node.data.attrs) {
				for (var k in node.data.attrs) {
					var v = node.data.attrs[k]
					if (typeof v === "string")
						attr += ` ${k}=${this.quot(v)}`
					else
						attr += ` :${k}=${this.quot(JSON.stringify(v))}`
				}
			}
			// 生成class
			var classList = node.elm.className.split(/\s+/)
			var cm = {}
			if (node.child) { // 排除下级组件的
				cm = Object.assign({}, node.child._vnode.data.class)
				node.child._vnode.data.staticClass.split(/\s+/).forEach(x => cm[x] = true)
			}
			var cmap
			if (node.data.class) {
				cmap = {}
				for (var k in node.data.class) {
					cmap[k] = classList.indexOf(k) >= 0;
					cm[k] = true;
				}
			}
			var cls = classList.filter(x => !cm[x]).join(' ')
			if (cls) attr += ` class=${this.quot(cls)}`
			if (cmap) attr += ` :class=${this.quot(JSON.stringify(cmap))}`
			// 生成style
			if (node.elm.style.length) {
				var styl = ''
				var smap;
				var sm = {}
				if (node.child)
					sm = Object.assign({}, node.child._vnode.data.staticStyle, node.child._vnode.data.normalizedStyle)
				for (var i = 0; i < node.elm.style.length; i++) {
					var k = node.elm.style[i];
					var v = node.elm.style[k];
					if (v == "initial" || v == sm[k]) continue;
					if (node.data.staticStyle[k] == v) {
						if (!smap) smap = {}
						smap[k] = v;
					} else
						styl += `${k}:${v.replace(/"/g, '&quot;')};`
				}
				if (styl) attr += ` style="${styl}"`
				if (smap) attr += ` :style=${this.quot(JSON.stringify(smap))}`
			}
			var listeners
			if (node.componentOptions) {
				tag = node.componentOptions.tag;
				listeners = Object.assign({}, node.componentOptions.listeners)
				if (node.data.model) {
					attr += ` v-model=${this.quot(node.data.model.expression)}`
					delete listeners.input
				}
			} else {
				listeners = node.data.on;
			}
			if (listeners) {
				for (var k in listeners) {
					var v = listeners[k];
					if (v.fns.name.slice(0, 6) == 'bound ') {
						attr += ` @${k}="${v.fns.name.slice(6)}"`
					} else {
						var s = (v.fns + '')
						var i = s.indexOf('{')
						var v = s.slice(i + 1, -1);
						v = v.replace(/^(\$event\.stopPropagation\(\);|\$event.preventDefault\(\);)+return /, function(keys) {
							keys.split(';').forEach(key => {
								if (key == "$event.stopPropagation()")
									k += '.stop';
								if (key == "$event.preventDefault()")
									k += '.prevent';
							})
							return '';
						})
						if (v.slice(-3) == "$$v") v = v.slice(0, -3) + '$event';
						attr += ` @${k}=${this.quot(v)}`
					}
				}
			}
			html = `<${tag}${attr}>${this.getVNode(node.children)}</${tag}>`
			node.elm.__i__ = { tag, attr, html }
			return html
		},
		/**
		 * 
		 * @param {Element|NodeList} nodes 
		 */
		getChild(nodes) {
			if (!nodes) return ''
			if (nodes instanceof NodeList) {
				let html = '';
				for (var i = 0; i < nodes.length; i++)
					html += this.getChild(nodes[i])
				return html;
			}
			var node = nodes
			if (node.nodeType != 1)
				return node.data;
			if (node.__i__) {
				var res = node.__i__;
				if (node.__vue__) return res.html;
				return `<${res.tag}${res.attr}>${this.getChild(node.childNodes)}</${res.tag}>`
			}
			var tag = node.tagName.toLowerCase();
			var attr = ''
			for (let i = 0; i < node.attributes.length; i++) {
				let row = node.attributes[i];
				if (row.value == true)
					attr += ` ${row.name}`
				else
					attr += ` ${row.name}="${row.value.replace(/"/g, '&quot;')}"`
			}
			return `<${tag}${attr}>${this.getChild(node.childNodes)}</${tag}>`
		},
		getData() {
			// console.log(this.$children[0]._vnode.children)
			this.getVNode(this.$children[0]._vnode.children)
			return this.getChild(this.$el.childNodes);
		},
	},
	mounted() {
		this.disable()
	}
};