namespace simpleJumpGame {
    export class FlowerItem extends ui.simpleJumpGame.item.FlowerPlatformUI {
        public flowerType: number = 0;
        public flowerNum: number = 0;
        private curCake: number = 0;
        constructor() {
            super();
        }

        public show(type: number) {
            this.flowerType = type;
            for (let i = 0; i < 6; i++) {
                this["box_" + i].visible = false;
                this["platform_" + i].visible = false;
            }
            this.curCake = 0;
            this.imgReward.visible = false;
            if (type > 0 && Math.random() < 0.3) {
                this.curCake = Math.floor(Math.random() * 6) + 1;
                this.imgReward.skin = clientCore.ItemsInfo.getItemIconUrl(9900226 + this.curCake);
                this.imgReward.visible = true;
            }
            this["box_" + this.flowerType].visible = true;
            /** 平台红条，不用了就隐藏 ，不能删，因为要用这个平台的宽度*/
            // this["platform_"+this.flowerType].visible = true;
        }

        public get width(): number {
            return this["platform_" + this.flowerType].width;
        }

        hasBox() {
            return this.curCake;
        }

        getRewardBox() {
            this.imgReward.visible = false;
            // Laya.Tween.to(this.imgReward,{y:this.imgReward.y - 70,scaleX:1.5,scaleY:1.5},500,Laya.Ease.linearIn,new Laya.Handler(this,()=>{
            //     this.imgReward.visible = false;
            // }));
        }
    }
}