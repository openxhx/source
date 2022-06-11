namespace atlas {
	export class AtlasGrid {
		private _width: number = 0;
		private _height: number = 0;
		private _failSize: TexMergeTexSize = new TexMergeTexSize();
		private _rowInfo: Array<TexRowInfo>;
		private _cells: Uint8Array;

		//------------------------------------------------------------------------------
		constructor(width: number = 0, height: number = 0) {
			this._cells = null;
			this._rowInfo = null;
			this._init(width, height);
		}


		//------------------------------------------------------------------
		public addTex(width: number, height: number): MergeFillInfo {
			//调用获得应该放在哪 返回值有三个。。bRet是否成功，nX x位置，nY y位置
			var result: MergeFillInfo = this._get(width, height);
			//判断如果没有找到合适的位置，则直接返回失败
			if (result.ret == false) {
				return result;
			}
			//根据获得的x,y填充
			this._fill(result.x, result.y, width, height, 1);
			//返回是否成功，以及X位置和Y位置
			return result;
		}

		//------------------------------------------------------------------------------
		private _release(): void {
			if (this._cells != null) {
				this._cells = null;
			}
			if (this._rowInfo) {
				this._rowInfo.length = 0;
				this._rowInfo = null;
			}
		}

		//------------------------------------------------------------------------------
		private _init(width: number, height: number): Boolean {
			this._width = width;
			this._height = height;
			this._release();
			if (this._width == 0) return false;
			this._cells = new Uint8Array(this._width * this._height * 3);
			this._rowInfo = new Array<TexRowInfo>(this._height);
			for (var i: number = 0; i < this._height; i++) {
				this._rowInfo[i] = new TexRowInfo();
			}
			this._clear();
			return true;
		}

		//------------------------------------------------------------------
		private _get(width: number, height: number): MergeFillInfo {
			var pFillInfo: MergeFillInfo = new MergeFillInfo();
			if (width >= this._failSize.width && height >= this._failSize.height) {
				return pFillInfo;
			}
			//定义返回的x,y的位置
			var rx: number = -1;
			var ry: number = -1;
			//为了效率先保存临时变量
			var nWidth: number = this._width;
			var nHeight: number = this._height;
			//定义一个变量为了指向 m_pCells
			var pCellBox: Uint8Array = this._cells;

			//遍历查找合适的位置
			for (var y: number = 0; y < nHeight; y++) {
				//如果该行的空白数 小于 要放入的宽度返回
				if (this._rowInfo[y].spaceCount < width) continue;
				for (var x: number = 0; x < nWidth;) {

					var tm: number = (y * nWidth + x) * 3;

					if (pCellBox[tm] != 0 || pCellBox[tm + 1] < width || pCellBox[tm + 2] < height) {
						x += pCellBox[tm + 1];
						continue;
					}
					rx = x;
					ry = y;
					for (var xx: number = 0; xx < width; xx++) {
						if (pCellBox[3 * xx + tm + 2] < height) {
							rx = -1;
							break;
						}
					}
					if (rx < 0) {
						x += pCellBox[tm + 1];
						continue;
					}
					pFillInfo.ret = true;
					pFillInfo.x = rx;
					pFillInfo.y = ry;
					return pFillInfo;
				}
			}
			return pFillInfo;
		}

		//------------------------------------------------------------------
		private _fill(x: number, y: number, w: number, h: number, type: number): void {
			//定义一些临时变量
			var nWidth: number = this._width;
			var nHeghit: number = this._height;
			//代码检查
			this._check((x + w) <= nWidth && (y + h) <= nHeghit);

			//填充
			for (var yy: number = y; yy < (h + y); ++yy) {
				this._check(this._rowInfo[yy].spaceCount >= w);
				this._rowInfo[yy].spaceCount -= w;
				for (var xx: number = 0; xx < w; xx++) {
					var tm: number = (x + yy * nWidth + xx) * 3;
					this._check(this._cells[tm] == 0);
					this._cells[tm] = type;
					this._cells[tm + 1] = w;
					this._cells[tm + 2] = h;
				}
			}
			//调整我左方相邻空白格子的宽度连续信息描述
			if (x > 0) {
				for (yy = 0; yy < h; ++yy) {
					var s: number = 0;
					for (xx = x - 1; xx >= 0; --xx, ++s) {
						if (this._cells[((y + yy) * nWidth + xx) * 3] != 0) break;
					}
					for (xx = s; xx > 0; --xx) {
						this._cells[((y + yy) * nWidth + x - xx) * 3 + 1] = xx;
						this._check(xx > 0);
					}
				}
			}
			//调整我上方相邻空白格子的高度连续信息描述
			if (y > 0) {
				for (xx = x; xx < (x + w); ++xx) {
					s = 0;
					for (yy = y - 1; yy >= 0; --yy, s++) {
						if (this._cells[(xx + yy * nWidth) * 3] != 0) break;
					}
					for (yy = s; yy > 0; --yy) {
						this._cells[(xx + (y - yy) * nWidth) * 3 + 2] = yy;
						this._check(yy > 0);
					}
				}
			}
		}

		private _check(ret: Boolean): void {
			if (ret == false) {
				console.warn("xtexMerger 错误啦");
			}
		}

		//------------------------------------------------------------------
		private _clear(): void {
			for (var y: number = 0; y < this._height; y++) {
				this._rowInfo[y].spaceCount = this._width;
			}
			for (var i: number = 0; i < this._height; i++) {
				for (var j: number = 0; j < this._width; j++) {
					var tm: number = (i * this._width + j) * 3;
					this._cells[tm] = 0;
					this._cells[tm + 1] = this._width - j;
					this._cells[tm + 2] = this._width - i;
				}
			}
			this._failSize.width = this._width + 1;
			this._failSize.height = this._height + 1;
		}
		//------------------------------------------------------------------
	}
}

//------------------------------------------------------------------------------
class TexRowInfo {
	public spaceCount: number;			//此行总空白数
}

//------------------------------------------------------------------------------
class TexMergeTexSize {
	public width: number;
	public height: number;
}
//------------------------------------------------------------------------------