namespace util {
    export class DisplayUtil {
        /**
         * 创建一个半透明的sprite
         * @param w  默认舞台宽度
         * @param h  默认舞台高度
         * @param alpha 0.5
         */
        public static createMask(w: number = Laya.stage.width, h: number = Laya.stage.height, alpha: number = 0.5): Laya.Sprite {
            let sp = new Laya.Sprite();
            sp.graphics.drawRect(0, 0, w, h, 0x000000);
            sp.alpha = alpha;
            sp.size(w, h);
            sp.mouseEnabled = true;
            return sp;
        }
        public static setGray(dis: Laya.Sprite): void {
            var colorMatrix = [
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0, 0, 0, 1, 0
            ];
            var colorFlilter: Laya.ColorFilter = new Laya.ColorFilter(colorMatrix);
            // var _matrix = colorFlilter.matrix;
            //修改数组中的值。
            // _matrix[4] = 100;  
            //重置矩阵。
            // colorFlilter.matrix = _matrix;
            dis.filters = [colorFlilter];
        }

        public static setDark(dis: Laya.Sprite): void {
            let m1 = [1, 0, 0, 0, -50, 0, 1, 0, 0, -50, 0, 0, 1, 0, -50, 0, 0, 0, 1, 0];
            let m2 = [0.702755905511811, 0, 0, 0, 18.875, 0, 0.702755905511811, 0, 0, 18.875, 0, 0, 0.702755905511811, 0, 18.875, 0, 0, 0, 1, 0];
            let colorFlilter1: Laya.ColorFilter = new Laya.ColorFilter(m1);
            let colorFlilter2: Laya.ColorFilter = new Laya.ColorFilter(m2);
            dis.filters = [colorFlilter1, colorFlilter2];
        }

        public static darkFilter: Laya.ColorFilter[] = [
            new Laya.ColorFilter([1, 0, 0, 0, -50, 0, 1, 0, 0, -50, 0, 0, 1, 0, -50, 0, 0, 0, 1, 0]),
            new Laya.ColorFilter([0.702755905511811, 0, 0, 0, 18.875, 0, 0.702755905511811, 0, 0, 18.875, 0, 0, 0.702755905511811, 0, 18.875, 0, 0, 0, 1, 0]),
        ]

        public static tweenNum(txt: { text: string }, toNum: number, time: number) {
        }

        //创建连线游戏的滤镜
        private static _linkFilter: Laya.ColorFilter;
        public static GetLinkFilter(): Laya.ColorFilter {
            if (!this._linkFilter) {
                this._linkFilter = new Laya.ColorFilter();
                this._linkFilter.setColor('#CB8F58');
            }
            return this._linkFilter;
        }
    }
}