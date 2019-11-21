<template>
	<v-container class="fill-height" fluid>
		<v-row align="center" justify="center">
			<v-col cols="12" sm="8" md="4">
				<v-card :elevation="3">
					<v-toolbar color="primary" dark flat>
						<v-toolbar-title>盆儿支付·个人收款平台</v-toolbar-title>
						<v-spacer />
						<v-tooltip right>
							<template v-slot:activator="{ on }">
								<v-btn icon v-on="on" to="/">
									<v-icon>mdi-home</v-icon>
								</v-btn>
							</template>
							<span>回到首页</span>
						</v-tooltip>
					</v-toolbar>
					<v-card-text class="pb-0">
						<v-form ref="form" v-model="valid" lazy-validation>
							<v-text-field v-model="body.title" :rules="$rules.email(true)" label="邮箱" required autofucus></v-text-field>
							<v-text-field v-model="body.passwd" :rules="$rules.passwd(true)" label="密码" required :type="show_pwd?'text':'password'" :counter="32" hint="至少6个字符" :append-icon="show_pwd?'mdi-eye':'mdi-eye-off'" @click:append="show_pwd=!show_pwd"></v-text-field>
							<v-checkbox v-model="is_reg" label="注册一个新用户"></v-checkbox>
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-btn color="primary" block @click="submit">
							登录
						</v-btn>
					</v-card-actions>
					<v-card-actions>
						<v-btn color="grey darken-1" text block>忘记密码？</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>
<script>
export default {
	name: "Login",
	data() {
		return {
			body: {
				title: '',
				passwd: '',
			},
			is_reg: false,
			valid: false,
			show_pwd: false,
		}
	},
	computed: {

	},
	methods: {
		async submit() {
			await this.$user.login(this.body)
			this.$router.replace(this.$route.query.f || '/')
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
.views-login {
	margin: auto;
	margin-top: 5rem;
	max-width: 15rem;
	border: 1px solid #ccc;
	padding: 1rem;
	.depth;
	> .i-group {
		margin-bottom: 0.3rem;
	}
}
</style>
