namespace runningTurkey {
    /**
     * 2022.3.25
     * 找回庆典装饰
     * runningTurkey.RunningTurkeyModule
     */
    export class RunningTurkeyModule extends ui.runningTurkey.RunningTurkeyModuleUI {
        // private exchangePanel: RunningTurkeyExchangePanel;
        init(d: number) {
            this.labCoin.text = d + "";
        }
        onPreloadOver() {
            // clientCore.Logger.sendLog('2021年8月20日活动', '【主活动】抓住小阿飘', '打开主活动面板');

            this.labSelf.text = clientCore.TurkeyInfoManeger.ins.selfCount + "/" + 10;
            this.labFriend.text = (20 - clientCore.TurkeyInfoManeger.ins.doneFriendsIds.length) + "/" + 20;
            // this.btnShow.visible = suitInfo0.allGet && suitInfo0.allGet && clientCore.TurkeyInfoManeger.ins.selfCount > 0;
            // this.btnChange.fontSkin = clientCore.TurkeyInfoManeger.ins.show ? "runningTurkey/l_p2_quzhu.png" : "runningTurkey/l_p2_zhaohui.png";
            // if (!this.btnChange.visible && !clientCore.TurkeyInfoManeger.ins.show) {
            //     this.changeTurkeyShow();
            // }
        }

        /**试穿套装 */
        // private previewSuit(id: number) {
        //     clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
        // }

        /**兑换界面 */
        // private showExchange() {
        //     clientCore.UIManager.setMoneyIds([this.coinId]);
        //     clientCore.UIManager.showCoinBox();
        //     clientCore.DialogMgr.ins.open(this.exchangePanel);
        //     BC.addOnceEvent(this, this.exchangePanel, Laya.Event.CLOSE, this, this.freshCoin);
        // }

        // private freshCoin() {
        //     this.labCoin.text = clientCore.ItemsInfo.getItemNum(this.coinId) + "";
        // }

        // private changeTurkeyShow() {
        //     if (clientCore.TurkeyInfoManeger.ins.show) {
        //         clientCore.Logger.sendLog('2021年8月20日活动', '【主活动】抓住小阿飘', '点击驱逐阿飘');
        //     } else {
        //         clientCore.Logger.sendLog('2021年8月20日活动', '【主活动】抓住小阿飘', '点击召回阿飘');
        //     }
        //     let value = clientCore.TurkeyInfoManeger.ins.show ? 1 : 0;
        //     clientCore.MedalManager.setMedal([{ id: MedalConst.RUNNING_TURKEY_IN_OUT, value: value }]);
        //     clientCore.TurkeyInfoManeger.ins.show = null;
        //     this.btnChange.fontSkin = clientCore.TurkeyInfoManeger.ins.show ? "runningTurkey/l_p2_quzhu.png" : "runningTurkey/l_p2_zhaohui.png";
        // }

        /**开始寻找 */
        private findDecorate() {
            this.destroy();
            if (!clientCore.MapInfo.isSelfHome) {
                clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
            }
        }

        /**打开主活动界面 */
        private goEventPanel() {
            this.destroy();
            clientCore.ModuleManager.open("anniversary2022.Anniversary2022Module");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnCatch, Laya.Event.CLICK, this, this.findDecorate);
            BC.addEvent(this, this.btnGoEvent, Laya.Event.CLICK, this, this.goEventPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            // this.exchangePanel?.destroy();
            // this.exchangePanel = null;
            super.destroy();
        }
    }
}