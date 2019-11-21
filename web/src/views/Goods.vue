<template>
	<div class="views-goods">
		<div class="search">
			<i-input v-model="s" flex placeholder="搜索或粘贴宝贝标题">
				<i-button class="blue" @click="$refs.list.search(0)">搜索</i-button>
			</i-input>
		</div>
		<i-list ref="list" :query="refresh">
			<i-list-item slot-scope="{item}" class="pt-2" :width="width" @click.native="copy(item)">
				<img :src="item.pict_url" :style="{width:width+'px',height:width+'px'}" slot="avatar">
				<div>
					<h4>{{item.title.slice(0,32)}}</h4>
					<div>
						<img src="https://gw.alicdn.com/tps/TB10U2vKFXXXXa3XXXXXXXXXXXX-36-36.png" style="width:18px;">
						<span style="margin-left:.5em;">天猫</span>
					</div>
					<div>原价：{{item.zk_final_price}}元</div>
					<div>
						<span class="coupon">
							减{{item.coupon_amount}}元
						</span>
						<small class="fr">销量{{item.volume}}</small>
					</div>
				</div>
			</i-list-item>
		</i-list>
	</div>
</template>
<script>
export default {
	name: "Goods",
	data() {
		return {
			s: '',
		}
	},
	computed: {
		width() {
			return this.$size.width * 0.3;
		}
	},
	methods: {
		refresh(query) {
			query.s = this.s
			return this.$get('material/list', query)
		},
		async copy(item) {
			if (!item.coupon_word) {
				let data = await this.$get("material/get_coupon", { mid: item.id });
				item.coupon_word = data.coupon_word;
			}
			if (utils.copy(item.coupon_word))
				await this.$toast.success(`已复制淘口令`);
			else
				await ivue.alert(item.coupon_word, `点击复制淘口令`)
		}
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-goods {
	max-width: 50rem;
	margin: 0 auto;
	font-size: 0.9rem;
	.search {
		background: #fff;
		padding: 10px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1;
		+ * {
			margin-top: 45px;
		}
	}
	h4 {
		margin: 0;
		margin-bottom: 0.5rem;
	}
	.coupon {
		margin-right: 5px;
		font-size: 15px;
		background: #ec5428;
		color: #fff;
		padding: 3px 5px;
		border-radius: 7px;
	}
}
</style>
