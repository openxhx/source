/// <reference path="MapItemBase.ts" />
namespace clientCore {
    export class DecorationMapItem extends MapItemBase {
        public rewardImage: Laya.Image;
        private onAni: boolean;
        private tween1: laya.utils.Tween;
        private tween2: laya.utils.Tween;
        constructor(info: MapItemInfo) {
            super(info);
            if (info.id == 300161) {
                this.showReward();
            }
        }

        private showReward() {
            if (SystemOpenManager.ins.checkActOver(236)) return;
            this.rewardImage = new Laya.Image("commonUI/lan_qiu.png");
            this.addChild(this.rewardImage);
            this.rewardImage.pos(-28, -110);
            this.setAni();
            BC.addEvent(this, this.rewardImage, Laya.Event.MOUSE_DOWN, this, this.getReward);
        }

        public getImgPath(): string {
            return ItemsInfo.getItemUIUrl(this.mapItemInfo.id);
        }

        public checkCanGet(): boolean {
            return !this.onAni;
        }

        public getReward(): void {
            if (parseInt(MapInfo.mapData) == LocalInfo.uid && this.checkCanGet()) {
                net.sendAndWait(new pb.cs_mushroom_mobilozation_harvest({ getTime: this.mapItemInfo.getTime }))
                    .then((data: pb.sc_mushroom_mobilozation_harvest) => {
                        alert.showReward(data.item);
                        MapItemsInfoManager.instance.removeOneMapItem(this.getTime);
                    })
            }
        }

        public refreshRestTime() {
            if (this.mapItemInfo.id != 300161) return;
            if (SystemOpenManager.ins.checkActOver(236)) return;
            let plantTime = MapItemsInfoManager.instance.getGrowDecorationSetTime(this.mapItemInfo.getTime);
            if (plantTime != 0 && ServerManager.curServerTime - plantTime >= 600) {
                this.clearTween();
            }
        }

        private setAni() {
            if (this.onAni) return;
            let plantTime = MapItemsInfoManager.instance.getGrowDecorationSetTime(this.mapItemInfo.getTime);
            if (plantTime != 0 && ServerManager.curServerTime - plantTime >= 600) {
                return;
            }
            this.onAni = true;
            this.onTween1();
        }

        private onTween1() {
            if (this.tween2) Laya.Tween.clear(this.tween2);
            this.tween2 = null;
            this.tween1 = Laya.Tween.to(this.rewardImage, { alpha: 0.3 }, 500, null, Laya.Handler.create(this, this.onTween2));
        }

        private onTween2() {
            Laya.Tween.clear(this.tween1);
            this.tween1 = null;
            this.tween2 = Laya.Tween.to(this.rewardImage, { alpha: 1 }, 500, null, Laya.Handler.create(this, this.onTween1));
        }

        private clearTween(){
            if(!this.onAni) return;
            this.onAni = false;
            if (this.tween1) Laya.Tween.clear(this.tween1);
            if (this.tween2) Laya.Tween.clear(this.tween2);
            this.tween1 = this.tween2 = null;
        }

        public destroy() {
            super.destroy();
            this.clearTween();
            this.rewardImage?.destroy();
            this.rewardImage = null;
            this.removeSelf();
        }
    }
}