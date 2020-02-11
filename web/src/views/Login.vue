<template>
	<v-container class="fill-height" fluid>
		<v-row align="center" justify="center" no-gutters>
			<v-col cols="12" sm="8" md="4">
				<v-card :elevation="3">
					<v-toolbar color="primary" dark flat>
						<v-toolbar-title>{{$config.description||$config.name}}</v-toolbar-title>
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
							<v-text-field v-model="body.account" @keypress.enter="submit" :rules="$rules.account(true)" label="账号" required autofucus></v-text-field>
							<v-text-field v-model="body.passwd" @keypress.enter="submit" :rules="$rules.passwd(true)" label="密码" required :type="show_pwd?'text':'password'" :counter="32" hint="至少6个字符" :append-icon="show_pwd?'mdi-eye':'mdi-eye-off'" @click:append="show_pwd=!show_pwd"></v-text-field>
							<v-text-field v-if="is_reg" v-model="body.title" :rules="$rules.email(true)" label="邮箱"></v-text-field>
							<v-flex v-if="is_reg" align-end>
								<v-text-field v-model="body.code" :rules="$rules.need('验证码')" label="验证码"></v-text-field>
								<v-btn text class="mb-6" @click="sendCode(body.title)" :loading="sending" :disabled="!!(!body.title||sending||timeout)">{{timeout?timeout+'秒':'验证码'}}</v-btn>
							</v-flex>
							<!-- <div class="tar">
								<a @click="is_reg=!is_reg">{{is_reg?'已有账号?去登录':'没有账号?去注册'}}</a>
							</div> -->
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-btn color="primary" block @click="submit">{{is_reg?'注册':'登录'}}</v-btn>
					</v-card-actions>
					<v-card-actions class="justify-center">
						<v-btn v-if="$config.github" @click="github" icon>
							<v-icon>mdi-github-circle</v-icon>
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
				account: '', // 账号
				title: '',
				passwd: '',
				code: '',
			},
			is_reg: false,
			valid: false,
			show_pwd: false,
			sending: false,
			timeout: 0,
		}
	},
	computed: {
	},
	methods: {
		async submit() {
			if (!this.$refs.form.validate()) return;
			if (this.is_reg) {
				await this.$user.register(this.body);
			} else {
				let title = this.body.account;
				let passwd = this.body.passwd;
				await this.$user.login({ title, passwd })
			}
			this.$router.replace(this.$route.query.f || '/')
		},
		sendCode(title) {
			console.log(title)
			this.$with('sending', async () => {
				await this.$get('user/code_send', { title })
				this.timeout = 60;
			})
		},
		github() {
			utils.githubLogin();
		},
	},
	mounted() {
		var handle = setInterval(() => {
			if (this.timeout > 0) this.timeout--;
		}, 1e3)
		this.$once('hook:beforeDestroy', () => {
			clearInterval(handle);
		})
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
