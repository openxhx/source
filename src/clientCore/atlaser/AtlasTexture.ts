namespace atlas {
	export class AtlasTexture extends AtlasGrid {

		private _bigTexture: Laya.Texture2D;
		private _w: number;
		private _h: number;
		private _ignoreCache: boolean;

		private static _textureMap: util.HashMap<Uint8Array> = new util.HashMap();

		/**
		 * 创建大图
		 * @param width 
		 * @param height 
		 * @param ignoreCache
		 */
		constructor(width: number, height: number, ignoreCache?: boolean) {
			super(128, 128);
			this._w = width;
			this._h = height;
			this._ignoreCache = ignoreCache;
			this._bigTexture = new Laya.Texture2D(width, height, Laya.BaseTexture.FORMAT_R8G8B8A8, false);
			this._bigTexture.wrapModeU = WebGLRenderingContext.TEXTURE_WRAP_S;
			this._bigTexture.wrapModeV = WebGLRenderingContext.TEXTURE_WRAP_T;
			this._bigTexture.filterMode = Laya.BaseTexture.FILTERMODE_BILINEAR;
			let arr = new Uint8Array(this._w * this._h * 4);
			this._bigTexture.setPixels(arr, 0);
		}

		drawToStage() {
			let img = new Laya.Image();
			img.texture = new Laya.Texture(this._bigTexture);
			Laya.stage.addChild(img);
			window['img'] = img;
		}

		public pushToAtlas(tex: Laya.Texture, offsetX: number, offsetY: number) {
			//重新计算uv
			let oriUV: any = (tex.uv as Array<number>).slice();
			let uv = this.computeUVinAtlasTexture(tex, oriUV, offsetX, offsetY);
			let w = tex.width;
			let h = tex.height;
			let sc = tex.offsetX;
			let sy = tex.offsetY;
			//小图绘制到大图上
			this._bigTexture.setSubPixels(offsetX, offsetY, w, h, this.getPixels(tex, w, h));
			//赋值tex
			tex.setTo(this._bigTexture, uv);
			tex.width = w;
			tex.height = h;
			tex.offsetX = sc;
			tex.offsetY = sy;
		}

		/**
		 * 获取texture某个区域的像素点
		 * @param tex 
		 * @param w 
		 * @param h 
		 */
		private getPixels(tex: Laya.Texture, w: number, h: number): Uint8Array {
			if (this._ignoreCache) return tex.getPixels(0, 0, w, h);
			let key: string = tex.bitmap.url;
			if (!key) return tex.getPixels(0, 0, w, h);
			let uint: Uint8Array;
			if (AtlasTexture._textureMap.has(key)) {
				uint = AtlasTexture._textureMap.get(key);
			}
			else {
				//透明图片的话 直接返回一个透明的unit8array
				if (key.indexOf('library/1.png') > -1) {
					uint = new Uint8Array(4);
					uint.fill(0, 0, uint.length);
				}
				else {
					uint = tex.getPixels(0, 0, w, h);
					AtlasTexture._textureMap.add(key, uint)
				}
			}
			//如果是脸部 强行获取像素
			if (key.indexOf('head') > -1) {
				uint = tex.getPixels(0, 0, w, h);
			}
			return uint;
		}

		//--------------add by chen--------------
		//--------------这里使用分帧合图----------
		public static count: number = 0;
		private _map: { texture: Laya.Texture, ox: number, oy: number, handler: Laya.Handler }[] = [];
		private _start: boolean = false;
		public merge(tex: Laya.Texture, offsetX: number, offsetY: number, handler: Laya.Handler): void {
			AtlasTexture.count++;
			this._map.push({ texture: tex, ox: offsetX, oy: offsetY, handler: handler });
			if (!this._start) {
				this._start = true;
				Laya.timer.frameLoop(2, this, this.onFrame);
			}
		}

		private onFrame(): void {
			let data: { texture: Laya.Texture, ox: number, oy: number, handler: Laya.Handler } = this._map.shift();
			if (this._map.length <= 0) {
				this._start = false;
				Laya.timer.clear(this, this.onFrame);
			}
			if (data) {
				this.pushToAtlas(data.texture, data.ox, data.oy);
				data.handler?.runWith([data.texture, true]);
			}
		}
		//-------------end--------------

		private computeUVinAtlasTexture(texture: Laya.Texture, oriUV: any, offsetX: number, offsetY: number) {
			var _width: number = this._w;
			var _height: number = this._h;
			var u1: number = offsetX / _width, v1: number = offsetY / _height, u2: number = (offsetX + texture.bitmap.width) / _width, v2: number = (offsetY + texture.bitmap.height) / _height;
			var inAltasUVWidth: number = texture.bitmap.width / _width, inAltasUVHeight: number = texture.bitmap.height / _height;
			return [u1 + oriUV[0] * inAltasUVWidth, v1 + oriUV[1] * inAltasUVHeight, u2 - (1 - oriUV[2]) * inAltasUVWidth, v1 + oriUV[3] * inAltasUVHeight, u2 - (1 - oriUV[4]) * inAltasUVWidth, v2 - (1 - oriUV[5]) * inAltasUVHeight, u1 + oriUV[6] * inAltasUVWidth, v2 - (1 - oriUV[7]) * inAltasUVHeight];
		}

		destroy() {
			Laya.timer.clear(this, this.onFrame);
			this._map.length = 0;
			this._bigTexture.destroy();
			this._bigTexture = null;
		}
	}
}