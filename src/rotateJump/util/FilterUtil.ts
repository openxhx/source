namespace rotateJump {
    export class FilterUtil {
        private static mGrayFilter: Laya.ColorFilter;
        //创建灰色颜色滤镜
        public static GetGrayFilter(): Laya.ColorFilter {
            if (this.mGrayFilter == null)
                this.mGrayFilter = new Laya.ColorFilter(ColorUtil.grayMatrix);
            return this.mGrayFilter;
        }

        //创建叠加色滤镜
        public static GetAddColorFilter(color: ColorData): Laya.ColorFilter {
            return new Laya.ColorFilter(ColorUtil.blendAddWithBlack(color));
        }
    }
}