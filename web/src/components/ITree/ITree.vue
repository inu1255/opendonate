<template>
	<div class="i-tree">
		<i-branch :data="data"></i-branch>
	</div>
</template>
<script>
import IBranch from './IBranch';
export default {
	name: "ITree",
	data: function () {
		return {
			value_: this.value ? [] : null
		};
	},
	props: {
		value: { type: Array }, // 选中目标
		data: { type: Array, required: true }, // 节点树数据
		childKey: { type: String, default: 'children' }, // 孩子在data中的key
		childCnt: { type: String, default: 'child_cnt' }, // 孩子的数量
		childId: { type: String, default: 'id' }, // 节点的唯一标识
		multiple: { type: Boolean }, // 是否允许选中多个
		draggable: { type: [Boolean, Function] }, // 是否允许拖动
		droppable: { type: [Number, Function], }, // drop方式: 0x1-可以拖动到上方 0x2-可以拖动到本身 0x4-可以拖动到下方, droppable(node): number
		droppopen: { type: Number }, // drop over时展开子节点延时
		contentToggle: { type: Boolean }, // 点击内容触发展开/隐藏子节点
		getChildren: { type: Function }, // 传入父节点,获取子节点, 动态加载时需要
		getParent: { type: Function }, // 传入子节点id,获取父节点id, reveal时需要
	},
	provide: function () {
		return {
			'i-tree-root': this,
			'i-tree-value': this.value_,
			'i-tree-input': this.input,
		};
	},
	watch: {
		value: function () {
			if (this.value_ === this.value) return;
			this.value_.length = 0;
			this.value_.push.apply(this.value_, this.value);
		}
	},
	computed: {
		root: function () {
			return this;
		}
	},
	created: function () {
		this.nMap = {}; // id -> branch vm
		this.scrollTop = 0; // 滚动目标
	},
	methods: {
		drag: function (data) { // 拖动开始
			this.i_drag = data;
			this.$emit("drag", data);
		},
		drop: function (type, parent, data, i) { // 拖动结束
			if (type == "bottom") {
				i++;
			}
			this.$emit("drop", { from: this.i_drag, to: data, parent, type, i });
		},
		dropMode: function (data) {
			if (!this.droppable) return false;
			if (typeof this.droppable === "function")
				return this.droppable(data);
			return this.droppable;
		},
		add: function (id, nodes) {
			if (nodes instanceof Array) {
				let data = this.nMap[id];
				if (data) {
					this.$set(data, this.root.childKey, nodes);
					return true;
				}
			}
			return false;
		},
		toggleChecked: function (id) {
			let vm = this.nMap[id];
			if (vm) vm.toggleChecked();
		},
		toggle: function (id) {
			let vm = this.nMap[id];
			if (vm) vm.toggle(true);
		},
		open: function (id) {
			let vm = this.nMap[id];
			if (vm) {
				if (!vm.open) vm.toggle(true);
			}
		},
		close: function (id) {
			let vm = this.nMap[id];
			if (vm) {
				if (vm.open) vm.toggle(true);
			}
		},
		openAll: function (id) {
			for (var k in this.nMap) {
				var vm = this.nMap[k];
				if (!vm.open) vm.toggle(true);
			}
		},
		closeAll: function (id) {
			for (var k in this.nMap) {
				var vm = this.nMap[k];
				if (vm.open) vm.toggle(true);
			}
		},
		_smoothScroll(p, y, smooth) {
			if (!smooth) return Promise.resolve(p.scrollTop = y);
			if (y != null) this.scrollTop = Math.floor(Math.max(Math.min(p.scrollHeight - p.clientHeight, y), 0));
			var that = this;
			return new Promise(function (resolve, reject) {
				function scroll() {
					var d = (that.scrollTop - p.scrollTop) / 10;
					if (Math.abs(d) < 1) return resolve();
					p.scrollTop += d;
					setTimeout(function () { scroll(p, smooth); }, smooth);
				}
				scroll();
			});
		},
		_reveal: function (el, smooth) {
			var rect = el.getBoundingClientRect();
			var p = this.$el;
			while (p && p.scrollHeight <= p.clientHeight) p = p.parentElement;
			if (!p) return;
			var prect = p.getBoundingClientRect();
			var y = rect.y - prect.y + p.scrollTop;
			var c = (p.clientHeight - el.clientHeight) / 2;
			if (c > 0) y -= c;
			return this._smoothScroll(p, y, smooth);
		},
		reveal: function (id, smooth, highlight, ignore) {
			highlight = arguments.length < 3 ? 1e3 : highlight;
			if (!this.getParent) return;
			var that = this;
			var pms = Promise.resolve(this.getParent(id));
			pms = pms.then(function (pid) {
				if (pid) return that.reveal(pid, smooth, false, true);
			});
			pms = pms.then(function () {
				let vm = that.nMap[id];
				if (vm) {
					if (!vm.open) vm.toggle(true);
					if (highlight) {
						vm.i_highlight = true;
						setTimeout(function () { vm.i_highlight = false; }, highlight);
					}
					return new Promise(function (resolve) {
						that.$nextTick(function () {
							that.$nextTick(function () {
								resolve(ignore || that._reveal(vm.$el, smooth));
							});
						});
					});
				}
			});
			return pms;
		},
		close: function (id) {
			let vm = this.nMap[id];
			if (vm) {
				if (vm.i_open) vm.toggle(true);
			}
		},
		input(value) {
			this.$emit('input', value);
		},
	},
	mounted: function () {
		window.tree = this;
	},
	components: {
		IBranch,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
</style>
