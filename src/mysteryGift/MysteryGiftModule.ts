namespace mysteryGift {
    /**
     * 神秘的礼物
     * 2021.9.24
     * mysteryGift.MysteryGiftModule
     */
    export class MysteryGiftModule extends ui.mysteryGift.MysteryGiftModuleUI {
        private _exchangePanel: MysteryGiftExchangePanel;
        private _ani: clientCore.Bone;
        init() {
            this.suitFemale.visible = clientCore.LocalInfo.sex == 1;
            this.suitMale.visible = clientCore.LocalInfo.sex == 2;
            this.addPreLoad(xls.load(xls.eventExchange));
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年9月24日活动', '【主活动】神秘的礼物', '打开主活动面板');
            this._ani = clientCore.BoneMgr.ins.play("unpack/mysteryGift/home.sk", 0, true, this);
            this._ani.pos(667, 375);
            this.labTimes.text = "今日剩余次数" + (20 - clientCore.MysteryGiftManager.ins.eventTimes) + "/20";
            for (let i: number = 1; i <= 3; i++) {
                this.CheckSuitOpen(i);
            }
        }

        private CheckSuitOpen(idx: number) {
            let month: number = 9;
            let day: number = 24;
            if (idx == 2) {
                day = 30;
            } else if (idx == 3) {
                month = 10;
                day = 7;
            }
            let isOpen = util.TimeUtil.formatTimeStrToSec(`2021-${month}-${day} 00:00:00`) <= clientCore.ServerManager.curServerTime;
            this['btnTry' + idx].visible = isOpen;
            this['di_suit' + idx].skin = isOpen ? "mysteryGift/di_taozhuang.png" : "mysteryGift/di_tip3.png";
            let suitId = idx == 1 ? 2110495 : (idx == 2 ? 2100337 : 2110496);
            this['labSuit' + idx].text = isOpen ? clientCore.SuitsInfo.getSuitInfo(suitId).suitInfo.name : `${month}月${day}日开启`;
        }

        /**
         * 打开兑换面板
         */
        private showExchangePanel(idx: number) {
            let month: number = 9;
            let day: number = 24;
            if (idx == 2) {
                day = 30;
            } else if (idx == 3) {
                month = 10;
                day = 7;
            }
            let isOpen = util.TimeUtil.formatTimeStrToSec(`2021-${month}-${day} 00:00:00`) <= clientCore.ServerManager.curServerTime;
            if (!isOpen) {
                alert.showFWords(`${month}月${day}日开启~`);
                return;
            }
            clientCore.Logger.sendLog('2021年9月24日活动', '【主活动】神秘的礼物', `点击${month}月${day}日版本的服装开启兑换面板`);
            if (!this._exchangePanel) this._exchangePanel = new MysteryGiftExchangePanel();
            this._exchangePanel.ShowPanel(idx);
        }

        /**
         * 试穿套装
         */
        private previewSuit(idx: number) {
            let suitId = idx == 1 ? 2110495 : (idx == 2 ? 2100337 : 2110496);
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        /**
         * 前往交换
         */
        private goExchange() {
            this.destroy();
            clientCore.ModuleManager.open("friends.FriendMainModule");
        }

        /**
         * 前往寻找礼包
         */
        private goFind() {
            clientCore.Logger.sendLog('2021年9月24日活动', '【主活动】神秘的礼物', '点击寻找礼包按钮');
            //国家花园 12
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.MapManager.enterWorldMap(12);
        }

        /**
         * 帮助说明
         */
        private showRule() {
            alert.showRuleByID(1211);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            for (let i = 1; i <= 3; i++) {
                BC.addEvent(this, this['btnExchange' + i], Laya.Event.CLICK, this, this.showExchangePanel, [i]);
                BC.addEvent(this, this['btnTry' + i], Laya.Event.CLICK, this, this.previewSuit, [i]);
            }
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.goExchange);
            BC.addEvent(this, this.btnFind, Laya.Event.CLICK, this, this.goFind);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._ani?.dispose();
            this._exchangePanel?.destroy();
            this._ani = this._exchangePanel = null;
            super.destroy();
        }
    }
}