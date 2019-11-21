<template>
	<div class="i-image-crop">
		<div v-show="show" class="crop-box" @touchstart="start($event)" @mousedown="start($event)">
			<img :src="url" @load="load" :style="{left:pos.x+'px',top:pos.y+'px',transform:`rotate(${rotate}deg)${flipY?'rotateX(180deg)':''}${flipX?'rotateY(180deg)':''}`}">
			<div class="point tl" :style="{left:rect.x1+'px',top:rect.y1+'px'}" @mousedown.stop="start($event,'x1','y1')" @touchstart.stop="start($event,'x1','y1')"></div>
			<div class="point tr" :style="{left:rect.x2+'px',top:rect.y1+'px'}" @mousedown.stop="start($event,'x2','y1')" @touchstart.stop="start($event,'x2','y1')"></div>
			<div class="point bl" :style="{left:rect.x1+'px',top:rect.y2+'px'}" @mousedown.stop="start($event,'x1','y2')" @touchstart.stop="start($event,'x1','y2')"></div>
			<div class="point br" :style="{left:rect.x2+'px',top:rect.y2+'px'}" @mousedown.stop="start($event,'x2','y2')" @touchstart.stop="start($event,'x2','y2')"></div>
		</div>
	</div>
</template>
<script>
export default {
	name: "IImageCrop",
	data() {
		return {
			rect: {},
			pos: {},
			show: false,
		}
	},
	props: {
		ratio: { type: Number },
		url: { String },
		rotate: Number,
		flipX: Boolean,
		flipY: Boolean,
		limit: Boolean,
	},
	watch: {
		ratio() {
			if (!this.ratio) return;
			var w = this.size.width;
			var h = this.size.height;
			if (this.ratio < w / h) {
				this.rect.x2 = this.rect.x1 + h * this.ratio;
			} else if (this.ratio == w / h) {
				this.rect.x2 = this.rect.x1 + w;
				this.rect.y2 = this.rect.y1 + h;
			} else {
				this.rect.y2 = this.rect.y1 + w / this.ratio;
			}
			this.renderAll()
		}
	},
	computed: {

	},
	methods: {
		start(e, kx, ky) {
			if (e.touches && e.touches[0]) e = e.touches[0]
			var x = e.clientX
			var y = e.clientY
			this.moving = { x, y, kx, ky }
		},
		move(e) {
			if (!this.moving) return
			if (e.touches && e.touches[0]) e = e.touches[0]
			var { x, y, kx, ky } = this.moving;
			var dx = e.clientX - x
			var dy = e.clientY - y
			this.moveit(dx, dy, kx, ky)
			this.moving.x = e.clientX;
			this.moving.y = e.clientY;
		},
		end(e) {
			this.moving = null;
		},
		moveit(dx, dy, kx, ky) {
			var rect = Object.assign({}, this.rect)
			var w = rect.x2 - rect.x1;
			var h = rect.y2 - rect.y1;
			if (kx && ky) {
				if (this.ratio) {
					if (kx[1] == ky[1]) {
						dy = (dx + dy) / 2
						dx = this.ratio * dy
					} else {
						dy = (dy - dx) / 2
						dx = this.ratio * -dy
					}
				}
				rect[kx] += dx;
				rect[ky] += dy;
			} else {
				rect.x1 += dx;
				rect.y1 += dy;
				rect.x2 += dx;
				rect.y2 += dy;
			}
			if (rect.x1 < 0) rect.x1 = 0;
			if (rect.y1 < 0) rect.y1 = 0;
			if (rect.x2 > this.canvas.width) rect.x2 = this.canvas.width;
			if (rect.y2 > this.canvas.height) rect.y2 = this.canvas.height;
			if (rect.x1 >= rect.x2) rect.x2 = rect.x1 + 1;
			if (rect.y1 >= rect.y2) rect.y2 = rect.y1 + 1;
			if (!kx || !ky) {
				if (dx < 0) rect.x2 = rect.x1 + w;
				else rect.x1 = rect.x2 - w;
				if (dy < 0) rect.y2 = rect.y1 + h;
				else rect.y1 = rect.y2 - h;
			} else if (this.ratio) {
				var ddx = rect[kx] - this.rect[kx]
				var ddy = rect[ky] - this.rect[ky]
				if (ddy != dy || ddx != dx) {
					if (Math.abs(ddx) > this.ratio * Math.abs(ddy)) {
						rect[kx] = this.rect[kx] + ddy * this.ratio;
					} else {
						rect[ky] = this.rect[ky] + ddx / this.ratio;
					}
				}
			}
			this.rect = rect;
			this.size = {
				width: this.rect.x2 - this.rect.x1,
				height: this.rect.y2 - this.rect.y1,
			}
			this.renderAll();
		},
		load(e) {
			var img = e.target;
			var size
			if (this.limit)
				size = { width: img.width, height: img.height }
			else {
				var n = Math.sqrt(img.width * img.width + img.height * img.height)
				size = { width: n, height: n }
			}
			var max = { width: this.$el.clientWidth - 12, height: this.$el.clientHeight - 12 }
			utils.contain(size, max)
			this.scale = this.limit ? size.width / img.width : size.width / n;
			img.width *= this.scale
			img.height *= this.scale
			this.canvas.width = size.width;
			this.canvas.height = size.height;
			this.box.style.width = size.width + 'px'
			this.box.style.height = size.height + 'px'

			this.pos = {
				x: (this.canvas.width - img.width) / 2,
				y: (this.canvas.height - img.height) / 2,
			}
			this.image = img;
			var ratio = this.ratio ? this.ratio : img.width / img.height
			if (ratio > img.width / img.height) {
				this.rect = {
					x1: this.pos.x,
					y1: this.pos.y,
					x2: this.pos.x + img.width,
					y2: this.pos.y + img.width / ratio,
				}
			} else {
				this.rect = {
					x1: this.pos.x,
					y1: this.pos.y,
					x2: this.pos.x + img.height * ratio,
					y2: this.pos.y + img.height,
				}
			}
			this.size = {
				width: this.rect.x2 - this.rect.x1,
				height: this.rect.y2 - this.rect.y1,
			}
			this.show = true;
			this.renderAll()
		},
		getCrop() {
			var { x1, y1, x2, y2 } = this.rect;
			var image = this.image;
			if (this.flipX) image = utils.flipX(image)
			if (this.flipY) image = utils.flipY(image)
			var rotate = (this.rotate % 360 + 360) % 360
			x1 = (x1 - this.pos.x) / this.scale;
			y1 = (y1 - this.pos.y) / this.scale;
			x2 = (x2 - this.pos.x) / this.scale;
			y2 = (y2 - this.pos.y) / this.scale;
			if (rotate) {
				var { x, y, image } = utils.rotate(image, rotate)
				document.body.appendChild(image)
				x1 += x;
				y1 += y;
				x2 += x;
				y2 += y;
			}
			return { x1, y1, x2, y2 }
		},
		crop(color) {
			var { x1, y1, x2, y2 } = this.getCrop()
			return utils.crop(this.image, x1, y1, x2, y2, color)
		},
		download(name) {
			var canvas = this.crop('#fff')
			utils.download(canvas.toDataURL('png'), name || '裁剪.png')
		},
		renderAll() {
			/** @type {CanvasRenderingContext2D} */
			var ctx = this.ctx
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			ctx.fillStyle = "rgba(119, 119, 119, 0.467)"
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
			let { x1, y1, x2, y2 } = this.rect;
			ctx.clearRect(x1, y1, x2 - x1, y2 - y1)
		}
	},
	mounted() {
		var canvas = document.createElement('canvas')
		this.box = this.$el.querySelector('.crop-box')
		this.box.appendChild(canvas)
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d')
		var move = e => this.move(e)
		var end = e => this.end(e)
		var down = e => {
			var n = e.shiftKey ? 10 : 1;
			switch (e.keyCode) {
				case 37:
					this.moveit(-n, 0)
					break;
				case 38:
					this.moveit(0, -n)
					break;
				case 39:
					this.moveit(n, 0)
					break;
				case 40:
					this.moveit(0, n)
					break;
			}
		}
		document.addEventListener('mousemove', move)
		document.addEventListener('mouseup', end)
		document.addEventListener('touchmove', move)
		document.addEventListener('touchend', end)
		document.addEventListener('keydown', down)
		this.$once('hook:beforeDestroy', function () {
			document.removeEventListener('mousemove', move)
			document.removeEventListener('mouseup', end)
			document.removeEventListener('touchmove', move)
			document.removeEventListener('touchend', end)
			document.removeEventListener('keydown', down)
		})
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
@w: 0.625rem;
.i-image-crop {
	width: 100%;
	height: 100%;
	user-select: none;
	padding: @w / 2;
	> .crop-box {
		position: relative;
		margin: auto;
		border: 1px solid #c0c0c0;
		> img {
			position: absolute;
			width: auto;
		}
		> canvas {
			position: absolute;
			top: 0;
			left: 0;
		}
		> .point {
			position: absolute;
			width: @w;
			height: @w;
			transform: translate(-@w / 2, -@w / 2);
			background: @primary;
			z-index: 1;
			&.tl {
				cursor: nw-resize;
			}
			&.tr {
				cursor: ne-resize;
			}
			&.bl {
				cursor: sw-resize;
			}
			&.br {
				cursor: se-resize;
			}
		}
	}
}
</style>
