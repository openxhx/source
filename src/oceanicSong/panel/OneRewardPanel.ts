namespace oceanicSong {
    export class OneRewardPanel extends ui.oceanicSong.panel.OncePanelUI {
        constructor() {
            super();
            this.sideClose = false;
        }

        public showReward(treeInfo: pb.IdrawReward) {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClick);
            let xlsInfo = xls.get(xls.godTree).get(treeInfo.id);
            if (xlsInfo.type == 1 || xlsInfo.type == 2) {
                this.playAni();
            }
            else {
                this.boxKing.visible = false;
                this.imgBgAni.visible = false;
                this.boxMain.visible = true;
                this.aniKing.paused();
            }
            let itemInfo = parseReward(treeInfo);
            if (itemInfo) {
                let name = itemInfo.reward.name.replace(/\（|\(/g, "︵").replace(/\）|\)/g, "︶");
                let num = itemInfo.reward.num;
                this.imgBg.skin = `unpack/spirittree/${xlsInfo.type}.png`;
                this.mcItemImg.skin = itemInfo.reward.iconUrl;
                this.txtName.text = name + (num > 1 ? `x\n${num}` : '');
                //分解
                if (itemInfo.decomp) {
                    this.txtDecomp.text = `重复获得分解为${itemInfo.decomp.name} x${itemInfo.decomp.num}`;
                }
                else {
                    this.txtDecomp.text = '';
                }
            }
        }
        popupOver() {

        }
        private async playAni() {
            this.boxKing.visible = true;
            this.imgBgAni.visible = false;
            this.boxMain.visible = false;
            await this.waitAniLabel();
            this.boxMain.visible = true;
            this.imgBgAni.visible = true;
            await this.waitAniOver();
            this.boxKing.visible = false;

            // if(clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitShowOneRewardPanel"){
            //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            // }
        }

        private waitAniLabel() {
            return new Promise((ok) => {
                this.ani1.play(0, false);
                this.aniKing.play(0, false);
                this.ani1.once(Laya.Event.LABEL, this, ok);
            })
        }

        private waitAniOver() {
            return new Promise((ok) => {
                this.ani1.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private onClick() {
            if (this.boxKing.visible) {
                this.boxKing.visible = false;
                this.boxMain.visible = true;
                this.imgBgAni.visible = true;
            }
            else {
                clientCore.DialogMgr.ins.close(this, false);
                // if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickCloseOneRewardPanel"){
                //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                // }
            }
        }

        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}