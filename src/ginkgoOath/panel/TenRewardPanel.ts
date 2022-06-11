namespace ginkgoOath {
    export class TenRewardPanel extends ui.ginkgoOath.panel.TenPanelUI {
        private _reward: ui.ginkgoOath.render.TenItemRenderUI[];
        private _showOneCaller: any;
        private _showOneCall: Function;
        private _animateing: boolean
        constructor() {
            super();
            this._reward = [];
        }

        public showReward(info: pb.IdrawReward[], caller: any, call: Function) {
            this._animateing = true;
            this._showOneCaller = caller;
            this._showOneCall = call;
            this.aniWind.visible = false;
            this.zi.visible = false;
            this.imgBg.width = Laya.stage.width;
            this.clearReward();
            this.ani1.once(Laya.Event.COMPLETE, this, () => {
                this.showRewardList(info);
                this.aniWind.visible = true;
                this.zi.visible = true;
                this.zi.play(0, false, true);
                this.aniWind.play(0, false, true);
            });
            this.sideClose = false;
            this.ani1.play(0, false);
        }

        private async showRewardList(infos: pb.IdrawReward[]) {
            for (let i = 0; i < infos.length; i++) {
                let itemInfo = parseReward(infos[i]);
                let mc = new ui.luckyDrawActivity.render.TenItemRenderUI();
                let row = Math.floor(i / 5);
                let col = i % 5;
                this._reward.push(mc);
                if (itemInfo.godTreeType == 1 || itemInfo.godTreeType == 2 || itemInfo.godTreeType == 5) {
                    clientCore.ToolTip.hideTips();
                    await this._showOneCall.call(this._showOneCaller, infos[i]);
                }
                if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                    clientCore.ToolTip.hideTips();
                    await alert.showDrawClothReward(itemInfo.reward.id);
                }
                mc.pos(col * 170, row * 125);
                this.boxCon.addChild(mc);
                this.setRewardUI(mc, itemInfo);
                await this.waitRewardAni(mc);
                clientCore.ToolTip.addTips(mc, { id: itemInfo.decomp ? itemInfo.decomp.id : itemInfo.reward.id });
            }
            this.sideClose = true;
        }

        _onClose() {
            super._onClose();
            this.event(Laya.Event.COMPLETE);
        }

        private waitRewardAni(mc: ui.luckyDrawActivity.render.TenItemRenderUI) {
            return new Promise((ok) => {
                mc.ani1.once(Laya.Event.LABEL, this, ok);
                mc.ani1.play(0, false);
            })

        }

        private setRewardUI(mc: ui.luckyDrawActivity.render.TenItemRenderUI, info: RewardInfo) {
            if (info.decomp) {
                let s = xls.get(xls.characterId).has(info.decomp.id) ? 0.4 : 0.5;
                mc.img.scale(s, s);
                mc.img.skin = info.decomp.iconUrl;
                mc.txtName.text = '分解:' + info.decomp.name;
                mc.txtNum.value = info.decomp.num.toString();
                mc.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.decomp.id);
            }
            else {
                let s = xls.get(xls.characterId).has(info.reward.id) ? 0.4 : 0.5;
                mc.img.scale(s, s);
                mc.img.skin = info.reward.iconUrl;
                mc.txtName.text = info.reward.name;
                mc.txtNum.value = info.reward.num.toString();
                mc.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.reward.id);
            }
        }

        private clearReward() {
            for (const mc of this._reward) {
                mc.removeSelf();
                clientCore.ToolTip.removeTips(mc);
            }
            this._reward.slice(0, this._reward.length);
        }


        destroy() {
            this.clearReward();
            super.destroy();
        }
    }
}