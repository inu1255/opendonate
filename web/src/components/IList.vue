<template>
	<div :style="{height:$size.md?'auto':height}" class="i-list">
		<i-pull-to :bottomLoadMethod="hasMore&&query?loadMore:null" :topLoadMethod="query&&reload">
			<template slot="top-block" slot-scope="{state,stateText}">
				<div class="pull tac">
					<i class="i" :class="topIcon[state]"></i>
					{{ stateText }}
				</div>
			</template>
			<div v-if="!v_list.length"></div>
			<template v-else v-for="(item,i) in v_list">
				<slot :item="item" :index="i"></slot>
			</template>
			<slot name="append"></slot>
			<template slot="bottom-block" slot-scope="{state,stateText}">
				<div class="pull tac">
					<i class="i" :class="bottomIcon[state]"></i>
					{{ stateText }}
				</div>
			</template>
		</i-pull-to>
	</div>
</template>
<script>
import IPullTo from './IPullTo';
export default {
	name: "IList",
	props: {
		data: Array,
		pageSize: { type: Number, default: 10 },
		query: Function,
	},
	data() {
		return {
			i_list: [],
			i_page: 0,
			i_total: 0,
			height: null,
			topIcon: {
				pull: 'i-up flip',
				trigger: 'i-up',
				loading: 'i-loading',
				'loaded-done': 'i-ok',
			},
			bottomIcon: {
				pull: 'i-up',
				trigger: 'i-up flip',
				loading: 'i-loading',
				'loaded-done': 'i-ok',
			},
			hasMore: false,
		}
	},
	computed: {
		v_list() {
			if (this.query)
				return this.i_list;
			return this.data
		},
		v_total() {
			if (this.query) return this.i_total;
			return this.data.length;
		}
	},
	methods: {
		async search(page) {
			if (page == null) page = this.i_page;
			let { total, list } = await this.query({ page })
			this.i_total = total
			if (page == 0) { // 大屏翻页 || 下拉刷新
				this.i_list = list
			} else { // 小屏加载更多
				this.i_list = this.i_list.concat(list)
			}
			if (typeof total === "number")
				this.hasMore = (page + 1) * this.pageSize < this.i_total
			else
				this.hasMore = this.i_list.length
			if (page == 0)
				this.$el.querySelector('.scroll-container').scrollTop = 0
		},
		reload() {
			return this.search(0)
		},
		loadMore() {
			return this.search(this.i_page + 1)
		},
	},
	mounted() {
		this.height = window.innerHeight - this.$el.getBoundingClientRect().top + "px"
		this.search(0)
	},
	components: {
		IPullTo,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-list {
	> .footer {
		padding: 1em 0;
		text-align: center;
	}
	> .loadmore {
	}
}
</style>
