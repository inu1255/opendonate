<template>
	<div class="i-table" :class="{editing}">
		<table>
			<thead>
				<th v-for="head in headers" @click="sortBy(head.key)" @contextmenu.prevent="onmenu($event)">{{head.title||head.key}}</th>
				<th v-for="head in i_calc_headers" @click="!query&&!head.edit&&sortBy(head.key)" @contextmenu.prevent="onmenu($event,head)">
					<input v-if="head.edit" @blur="onblur" :value="head.title+'='+head.formula" type="text">
					<span v-else>{{head.title||head.key}}</span>
				</th>
			</thead>
			<tbody>
				<tr v-if="!v_total">
					<td :colspan="headers.length" style="padding:0;">
						<slot v-if="$scopedSlots['(empty)']" name="(empty)"></slot>
						<div v-else class="i-table-empty">暂无数据</div>
					</td>
				</tr>
				<tr v-else v-for="(row,index) in list" :key="index">
					<template v-for="(col,i) in row">
						<slot v-if="col.slot" :name="col.name" :item="col.item" :index="col.index"></slot>
						<td v-else :class="{calcable:col.calc}" @click="editing&&col.calc&&tofocus(i)">{{col.v}}</td>
					</template>
				</tr>
				<tr v-for="(row,index) in i_calc_rows">
					<td v-for="(col,i) in row.cols" @dblclick="onedit(col,$event)">
						<template v-if="col.calc">
							<input v-if="col.edit" @blur="col.edit=false" @change="calcCols(row,$event.target.value)" :value="row.formula" type="text" placeholder="avg()/max()/min()/count()/sum()">
							<span v-else-if="row.formula">{{col.v}}</span>
							<span v-else class="placeholder">双击编辑公式</span>
						</template>
						<template v-else>
							<input v-if="col.edit" @blur="col.edit=false" v-model.lazy="col.v" type="text">
							<span v-else-if="col.v">{{col.v}}</span>
							<span v-else class="placeholder">双击编辑</span>
						</template>
					</td>
					<td v-for="(col,i) in row.calc_cals" @dblclick="onedit(col,$event)">
						<input v-if="col.edit" @blur="col.edit=false" @change="calcCols(row,$event.target.value)" :value="row.formula" type="text" placeholder="avg()/max()/min()/count()/sum()">
						<span v-else-if="row.formula">{{col.v}}</span>
						<span v-else class="placeholder">双击编辑公式</span>
					</td>
				</tr>
			</tbody>
		</table>
		<i-popup menu :open.async="show_menu">
			<ul>
				<li @click="addCalc()">添加行汇总</li>
				<li v-show="i_head" @click="addCalc(i_head)">修改行汇总</li>
				<li v-show="i_head" @click="delCalc(i_head)">删除行汇总</li>
				<li @click="addColCalc()">添加列汇总</li>
			</ul>
		</i-popup>
		<i-page v-show="v_total>pageSize" :value="i_page" @input="search" :page-size="pageSize" :total="v_total"></i-page>
	</div>
</template>
<script>
import IPage from './IPage';
export default {
	name: "ITable",
	props: {
		headers: { type: Array, required: true },
		data: Array,
		pageSize: { type: Number, default: 10 },
		query: Function,
	},
	data() {
		return {
			i_list: [],
			i_page: 0,
			i_total: 0,
			i_sort: null,
			i_desc: 0,
			i_head: false, // 右键点击的表头
			show_menu: false,
			editing: false,
			i_calc_headers: [],
			i_calc_rows: [],
		}
	},
	watch: {
		i_calc_headers: {
			deep: true,
			handler() {
				for (var row of this.i_calc_rows) {
					row.calc_cals = this.i_calc_headers.map((x, i) => {
						return { edit: false, v: this.calcCol(row.formula, i + this.headers.length) }
					})
				}
			}
		}
	},
	computed: {
		list() {
			if (this.query)
				return this.c_list
			var start = this.i_page * this.pageSize;
			var list = this.c_list
			if (this.i_sort) {
				var idx = -1;
				for (var i = 0; i < this.headers.length; i++) {
					var row = this.headers[i];
					if (row.key == this.i_sort) {
						idx = i;
						break;
					}
				}
				if (idx < 0) {
					for (var i = 0; i < this.i_calc_headers.length; i++) {
						var row = this.headers[i];
						if (row.key == this.i_sort) {
							idx = this.headers.length + i;
							break;
						}
					}
				}
				if (idx >= 0) {
					list.sort((a, b) => {
						if (a[idx] == b[idx]) return 0;
						return a[idx] > b[idx] ? 1 : -1;
					})
				}
			}
			list = list.slice(start, start + this.pageSize)
			return list;
		},
		c_list() {
			return this.calcList(this.query ? this.i_list : this.data)
		},
		v_total() {
			if (this.query) return this.i_total;
			return this.data.length;
		}
	},
	methods: {
		read(item, key) {
			key.split('.').forEach(k => item = item[k])
			return item;
		},
		async search(i) {
			if (i == null) i = this.i_page;
			if (this.query) {
				var { total, list } = await this.query({ page: i, sortBy: this.i_sort, desc: this.i_desc });
				this.i_total = total;
				this.i_list = list;
			}
			this.i_page = i;
		},
		sortBy(key) {
			if (this.i_sort == key) {
				if (this.i_desc) {
					this.i_desc = 0;
					this.i_sort = null;
				} else {
					this.i_desc = 1;
				}
			} else {
				this.i_desc = 0;
				this.i_sort = key;
			}
			if (this.query)
				this.search()
		},
		calcList(list) {
			return list.map((item, index) => {
				var row = []
				this.headers.forEach((head, i) => {
					if (this.$scopedSlots[head.key]) {
						var x = {}
						x.slot = true
						x.name = head.key;
						x.item = item;
						x.index = index;
						row.push(x)
					} else if (head.text) {
						row.push({
							calc: head.calc,
							v: head.text(item),
						})
					} else {
						row.push({
							calc: head.calc,
							v: this.read(item, head.key),
						})
					}
				})
				this.i_calc_headers.forEach((head, i) => {
					row.push({
						v: this.calcRow(row, head.formula)
					})
				})
				return row;
			})
		},
		onmenu(e, head) {
			this.i_head = head;
			this.show_menu = e;
			if (head) {
				head.input = e.target.firstChild
			}
		},
		addCalc(head) {
			if (head) {
				head.edit = true
				this.editing = head
			} else {
				this.i_calc_headers.push(this.editing = { key: 'calc#' + ++this.i_calc_id, title: '计算指标' + this.i_calc_id, formula: '', edit: true })
			}
			this.show_menu = false;
			this.$nextTick(() => {
				var input = this.$el.querySelector('th>input')
				input && input.focus();
			})
		},
		delCalc(head) {
			var i = this.i_calc_headers.indexOf(head)
			if (i >= 0) this.i_calc_headers.splice(i, 1)
			this.show_menu = false;
		},
		updateRawFumula(el) {
			var ss = el.value.split('=')
			this.editing.title = ss[0]
			this.editing.formula = ss.slice(1).join('=')
		},
		onblur(e) {
			if (!this.editing) return
			this.i_input = e.target;
			this.timeout = setTimeout(() => {
				if (this.i_input) {
					this.updateRawFumula(this.i_input);
					this.i_input = false;
					this.editing.edit = false;
					this.editing = false;
				}
			}, 300)
		},
		tofocus(i) {
			if (this.editing) {
				if (this.i_input) {
					var formula = this.i_input.value;
					var start = this.i_input.selectionStart;
					var end = this.i_input.selectionEnd;
					this.i_input.value = formula.slice(0, start) + String.fromCharCode(65 + i) + formula.slice(end);
					this.i_input.focus()
					this.i_input.selectionStart = this.i_input.selectionEnd = start + 1;
					this.updateRawFumula(this.i_input);
					clearTimeout(this.timeout)
				} else {
					this.editing.formula += String.fromCharCode(65 + i)
				}
			}
		},
		calcRow(row, formula) {
			if (!formula) return ''
			var params = {
				max: Math.max,
				min: Math.min,
				sum: function () {
					return Array.from(arguments).reduce((a, b) => a + b, 0)
				},
				count: function () {
					return arguments.length;
				},
				avg: function () {
					return params.sum(arguments) / params.count(arguments)
				},
			}
			row.forEach((col, i) => {
				params[String.fromCharCode(65 + i)] = col.v
			})
			var p = [null]
			var a = []
			for (var k in params) {
				var v = params[k]
				if(!isNaN(v)) v = +v;
				p.push(k);
				a.push(v);
			}
			p.push('return ' + formula)
			try {
				var f = new (Function.prototype.bind.apply(Function, p))
				return f.apply(this, a)
			} catch (e) {
				console.log(`公式错误: ${formula}`)
			}
			return ''
		},
		onedit(col, e) {
			col.edit = true;
			this.$nextTick(() => {
				var input = e.target.parentElement.querySelector('input')
				input && input.focus()
			})
		},
		addColCalc() {
			var row = {
				formula: '',
				cols: [],
			}
			row.cols = this.headers.map(x => {
				return {
					edit: false,
					calc: x.calc,
					v: '',
				}
			})
			row.calc_cals = this.i_calc_headers.map(x => {
				return { edit: false, v: '' }
			})
			this.i_calc_rows.push(row)
			this.show_menu = false;
		},
		calcCol(formula, i) {
			if (!formula) return ''
			var args = this.c_list.map(x => x[i] && x[i].v)
			var params = {
				max: function () {
					if (args.length < 2) return args[0]
					return args.reduce((a, b) => a < b ? b : a)
				},
				min: function () {
					if (args.length < 2) return args[0]
					return args.reduce((a, b) => a > b ? b : a)
				},
				sum: function () {
					return args.reduce((a, b) => a + parseFloat(b) || 0, 0)
				},
				count: function () {
					return args.length;
				},
				avg: function () {
					return params.sum() / params.count()
				},
			}
			var p = [null]
			var a = []
			for (var k in params) {
				var v = params[k]
				p.push(k);
				a.push(v);
			}
			p.push('return ' + formula)
			try {
				var f = new (Function.prototype.bind.apply(Function, p))
				return f.apply(this, a)
			} catch (e) {
				console.log(`公式错误: ${formula}`)
			}
			return ''
		},
		calcCols(row, formula) {
			if (formula) row.formula = formula;
			formula = row.formula
			row.cols.forEach((item, i) => {
				if (item.calc) item.v = this.calcCol(formula, i)
			})
			row.calc_cals.forEach((item, i) => {
				item.v = this.calcCol(formula, this.headers.length + i)
			})
		}
	},
	mounted() {
		this.i_calc_id = 0
		if (this.query)
			this.search(this.i_page);
	},
	components: {
		IPage,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-table {
	> .i-popup {
		font-size: 13px;
	}
	&.editing {
		user-select: none;
		> table {
			> tbody {
				> tr {
					> td.calcable {
						background: #dcf3bd;
						cursor: pointer;
					}
				}
			}
		}
	}
	> table {
		border-collapse: collapse;
		width: 100%;
		border: 1px solid #c6c6c6;
		margin-bottom: 1.25rem;
		> thead {
			th {
				border-collapse: collapse;
				border-right: 1px solid #c6c6c6;
				border-bottom: 1px solid #c6c6c6;
				background-color: #ddeeff;
				padding: 0.313rem 0.563rem;
				font-size: 0.875rem;
				font-weight: normal;
				text-align: center;
				cursor: pointer;
			}
		}
		> tbody {
			> tr {
				> td {
					border-collapse: collapse;
					border-right: 1px solid #c6c6c6;
					border-bottom: 1px solid #c6c6c6;
					padding: 0.313rem 0.563rem;
					font-size: 0.75rem;
					font-weight: normal;
					text-align: center;
					word-break: break-all;
				}
				&:nth-child(odd) {
					background-color: #fff;
				}
				&:nth-child(even) {
					background-color: #f8f8f8;
				}
				&:hover {
					background-color: #eee;
				}
			}
		}
	}
	.i-table-empty {
		padding: 4rem 0;
		background-color: #fff;
	}
	.placeholder {
		color: #666;
	}
}
</style>
