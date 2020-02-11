const prod = process.env.NODE_ENV == 'production';
module.exports = {
	// publicPath: prod ? '//inu1255.gitee.io/quan2go/' : '/',
	outputDir: undefined,
	assetsDir: 'static',
	runtimeCompiler: undefined,
	productionSourceMap: !prod,
	parallel: undefined,
	css: undefined,
	devServer: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				ws: true,
				changeOrigin: true
			},
			'/tmp': {
				target: 'http://localhost:3000',
			}
		}
	},
	configureWebpack: config => {
		config.externals = {
			'vue': 'Vue',
			'vue-router': 'VueRouter',
			'vuetify': 'Vuetify',
		};
		// delete config.optimization.splitChunks
		// config.entry['i-table'] = './src/components/index.js'
		// console.log(config)
		// config.module.rules.push({
		// 	test: /\/codecs\/.*\.js$/,
		// 	loader: 'exports-loader'
		// }, {
		// 	test: /\/codecs\/.*\.wasm$/,
		// 	type: 'javascript/auto',
		// 	loader: 'file-loader',
		// 	options: {
		// 		name: '[name].[hash:5].[ext]',
		// 	},
		// });
		// config.module.rules[12].exclude.push(/\/codecs\//);
		// console.log(config.module.rules[13]);
	}
};