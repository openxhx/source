namespace moonCake {
    export class DrawResultPanel extends ui.moonCake.panel.DrawResultPanelUI {
        private _reward: ui.moonCake.render.TenItemRenderUI[];
        private _showOneCaller: any;
        private _showOneCall: Function;
        private _animateing: boolean
        private _skip: boolean;
        constructor() {
            super();
            this._reward = [];
        }

        public show(caller: any, call: Function) {
            this._skip = false;
            this._animateing = true;
            this._showOneCaller = caller;
            this._showOneCall = call;
            this.aniBg.play(0, true);
            this.clearReward();
            // this.showRewardList(info);
            // this.sideClose = false;
            clientCore.UIManager.releaseCoinBox();
            BC.addOnceEvent(this, this, Laya.Event.CLICK, this, this.setSkip)
        }

        private setSkip() {
            this._skip = true;
        }

        public async showRewardList(infos: pb.IdrawReward[]) {
            for (let i = 0; i < infos.length; i++) {
                let itemInfo = parseReward(infos[i]);
                let mc = new ui.moonCake.render.TenItemRenderUI();
                let _y = Math.floor(i / 5) * 170;
                let _x = i % 5 * 200;
                if (infos.length == 1) {
                    _x = 360;
                    _y = 110;
                    if (!this._skip) await this.waitOneAni(_x + 60, _y + 53);
                } else {
                    if (!this._skip) await this.waitHuaAni(_x + 60, _y + 53);
                }
                this._reward.push(mc);
                if (itemInfo.godTreeType == 1 || itemInfo.godTreeType == 2 || itemInfo.godTreeType == 5) {
                    clientCore.ToolTip.hideTips();
                    await this._showOneCall.call(this._showOneCaller, infos[i]);
                }
                if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                    clientCore.ToolTip.hideTips();
                    await alert.showDrawClothReward(itemInfo.reward.id);
                }
                mc.pos(_x, _y);
                this.boxCon.addChild(mc);
                this.setRewardUI(mc, itemInfo);
                await this.waitRewardAni(mc);
                clientCore.ToolTip.addTips(mc, { id: itemInfo.decomp ? itemInfo.decomp.id : itemInfo.reward.id });
            }
            BC.addOnceEvent(this, this, Laya.Event.CLICK, this, this.closePanel);
        }

        private closePanel() {
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.UIManager.setMoneyIds([9900077, 9900078, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        _onClose() {
            super._onClose();
            this.event(Laya.Event.COMPLETE);
        }

        private waitOneAni(x: number, y: number) {
            return new Promise((ok) => {
                let ani = clientCore.BoneMgr.ins.play(`unpack/moonCake/gacha.sk`, 'animation1', false, this.boxCon);
                ani.pos(x, y);
                ani.once(Laya.Event.COMPLETE, this, () => {
                    ani.dispose();
                    ani = clientCore.BoneMgr.ins.play(`unpack/moonCake/gacha.sk`, 'animation2', false, this.boxCon);
                    ani.pos(x, y);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                        ani = clientCore.BoneMgr.ins.play(`unpack/moonCake/gacha.sk`, 'animation3', false, this.boxCon);
                        ani.pos(x, y);
                        ani.once(Laya.Event.COMPLETE, this, () => {
                            ani.dispose();
                        })
                        ok();
                    })
                })
            })
        }

        private waitHuaAni(x: number, y: number) {
            return new Promise((ok) => {
                let ani = clientCore.BoneMgr.ins.play(`unpack/moonCake/gacha.sk`, 'animation2', false, this.boxCon);
                ani.pos(x, y);
                ani.once(Laya.Event.COMPLETE, this, () => {
                    ani.dispose();
                    ani = clientCore.BoneMgr.ins.play(`unpack/moonCake/gacha.sk`, 'animation3', false, this.boxCon);
                    ani.pos(x, y);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                    })
                    ok();
                })
            })
        }

        private waitRewardAni(mc: ui.moonCake.render.TenItemRenderUI) {
            return new Promise((ok) => {
                mc.ani1.once(Laya.Event.LABEL, this, ok);
                mc.ani1.play(0, false);
            })
        }

        private setRewardUI(mc: ui.moonCake.render.TenItemRenderUI, info: RewardInfo) {
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