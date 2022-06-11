namespace spirittree {
    /**
     * spirittree.AdsPanel
     */
    export class AdsPanel extends ui.spirittree.ads.AdsPanelUI {
        constructor() {
            super();
            this.img_1.visible = clientCore.LocalInfo.sex == 1;
            this.img_2.visible = clientCore.LocalInfo.sex == 2;

        }
        show() {
            this.imgGou.visible = false;
            // this.fullScreen = true;
            clientCore.DialogMgr.ins.open(this);
        }
        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.boxNotShow, Laya.Event.CLICK, this, this.onNotShowClick);
            // BC.addEvent(this,this.imgTry_0,Laya.Event.CLICK,this,this.onTryClick,[0]);
            // BC.addEvent(this,this.imgTry_1,Laya.Event.CLICK,this,this.onTryClick,[1]);
        }
        onTryClick(num:number,e:Laya.Event){
            e.stopPropagation();
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", [2100184,2100183][num]);
        }
        private onNotShowClick(e:Laya.Event) {
            e.stopPropagation();
            this.imgGou.visible = !this.imgGou.visible;
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.SPIRIT_TREE_ADS2_SHOW, value: this.imgGou.visible ? 1 : 0 }]);
        }
        onCloseClick() {
            clientCore.DialogMgr.ins.close(this);
        }
        destroy(){
            BC.removeEvent(this);
            super.destroy();
        }
    }
}