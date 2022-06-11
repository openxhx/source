namespace rainbow{
    /**
     * 春节活动
     */
    export class RainbowNewModule extends RainbowModule{
        init(data: number):void{
            super.init(data);
            this.imgTitle.skin = 'rainbow/wd_1.png'
        }
    }
}