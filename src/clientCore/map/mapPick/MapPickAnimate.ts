namespace clientCore {
    /**
     * 家族地图
     */
    export class MapPickAnimate {
        private static animteTmp:Laya.Templet;
        constructor(){

        }
        public static async loadBgAnimate(){
            return new Promise((suc) => {
                this.animteTmp = new Laya.Templet();
                this.animteTmp.once(Laya.Event.COMPLETE, this, () => {
                    suc();
                });
                this.animteTmp.loadAni("res/animate/mcPick/pickup.sk");
            })
        }
        public static createAnimate():Laya.Skeleton{
            let ske = new Laya.Skeleton();
            ske = this.animteTmp.buildArmature(0);
            ske.play(0,true);
            return ske;
        }
    }
}