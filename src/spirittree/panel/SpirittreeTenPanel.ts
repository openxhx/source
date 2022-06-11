
namespace spirittree {
    export class SpirittreeTenPanel extends ui.spirittree.panel.tenPanelUI {
        private _reward: ui.spirittree.render.tenItemRenderUI[];
        private _showOneCaller: any;
        private _showOneCall: Function;
        private _animateing: boolean
        constructor() {
            super();
            this._reward = [];
        }

        public showReward(info: pb.IGodTree[], caller: any, call: Function) {
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

        private async showRewardList(infos: pb.IGodTree[]) {
            for (let i = 0; i < infos.length; i++) {
                let itemInfo = parseReward(infos[i]);
                let mc = new ui.spirittree.render.tenItemRenderUI();
                let row = Math.floor(i / 5);
                let col = i % 5;
                this._reward.push(mc);
                if (itemInfo.godTreeType == 1 || itemInfo.godTreeType == 2 || itemInfo.godTreeType == 5) {
                    clientCore.ToolTip.hideTips();
                    await this._showOneCall.call(this._showOneCaller, infos[i]);
                }
                if (xls.get(xls.itemCloth).has(itemInfo.reward.id)) {
                    clientCore.ToolTip.hideTips();
                    await alert.showDrawClothReward(itemInfo.reward.id, itemInfo.decomp);
                }
                mc.pos(col * 170, row * 125);
                this.boxCon.addChild(mc);
                this.setRewardUI(mc, itemInfo);
                await this.waitRewardAni(mc);
                clientCore.ToolTip.addTips(mc, { id: itemInfo.decomp ? itemInfo.decomp.id : itemInfo.reward.id });
            }
            this.sideClose = true;
        }

        private waitRewardAni(mc: ui.spirittree.render.tenItemRenderUI) {
            return new Promise((ok) => {
                mc.ani1.once(Laya.Event.LABEL, this, ok);
                mc.ani1.play(0, false);
            })

        }

        private setRewardUI(mc: ui.spirittree.render.tenItemRenderUI, info: RewardInfo) {
            if (info.decomp) {
                let s = xls.get(xls.characterId).has(info.decomp.id) ? 0.7 : 0.8;
                mc.mcReward.ico.scale(s, s);
                mc.mcReward.ico.skin = info.decomp.iconUrl;
                mc.mcReward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.decomp.id);
                mc.mcReward.num.value = info.decomp.num.toString();
                mc.mcReward.txtName.text = '分解:' + info.decomp.name;
                mc.mcReward.txtName.visible = true;
            }
            else {
                let s = xls.get(xls.characterId).has(info.reward.id) ? 0.7 : 0.8;
                mc.mcReward.ico.scale(s, s);
                mc.mcReward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.reward.id);
                mc.mcReward.txtName.text = clientCore.ItemsInfo.getItemName(info.reward.id);
                mc.mcReward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.reward.id);
                mc.mcReward.num.value = info.reward.num.toString();
                mc.mcReward.txtName.visible = true;
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
            // clientCore.DialogMgr.ins.close(this);
        }
    }
}