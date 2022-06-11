namespace sunAndLove2 {
    export class SunTenPanel extends ui.sunAndLove2.panel.SunTenPanelUI {
        private _reward: ui.spirittree.render.tenItemRenderUI[];
        constructor() {
            super();
            this._reward = [];
        }

        public showReward(info: pb.IdrawReward[]) {
            clientCore.DialogMgr.ins.open(this, false);
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
                let itemInfo = this.parseReward(infos[i]);
                let mc = new ui.spirittree.render.tenItemRenderUI();
                let row = Math.floor(i / 5);
                let col = i % 5;
                this._reward.push(mc);
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


        private parseReward(info: pb.IGodTree): RewardInfo {
            let rtn = new RewardInfo();
            let xlsInfo = xls.get(xls.godTree).get(info.id);
            if (!xlsInfo)
                alert.showSmall(`id:${info.id}在godTree表中找不到`);
            rtn.godTreeType = xlsInfo.type;
            rtn.reward = new ItemInfo();
            rtn.reward = this.pairToItemInfo(info.id, clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale);
            //分解逻辑处理
            if (info.flag == 1) {
                rtn.decomp = this.pairToItemInfo(info.id, xlsInfo.repeatReward);
            }
            return rtn;
        }

        private pairToItemInfo(godTreeid: number, pair: xls.pair) {
            let obj = new ItemInfo();
            obj.id = pair.v1;
            obj.name = clientCore.ItemsInfo.getItemName(obj.id);
            obj.iconUrl = clientCore.ItemsInfo.getItemIconUrl(obj.id);
            obj.num = pair.v2;
            return obj;
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

    class ItemInfo {
        id: number;
        iconUrl: string;
        name: string;
        num: number;
    }
    class RewardInfo {
        godTreeType: number;
        reward: ItemInfo;
        decomp?: ItemInfo;
    }
}