namespace operaSide {
    /**
     * operaSide.OperaFightModule
     * 中秋话剧-最后一战
     */
    export class OperaFightModule extends ui.operaSide.OperaFightModuleUI {
        private _rewardPanel: OperaRewardPanel;
        private _taskPanel: OperaTaskPanel;
        private _rankPanel: OperaRankPanel;
        private _btnAni: clientCore.Bone;
        init(d: any) {
            if (d) {
                this.needOpenMod = 'operaSide.OperaMapModule';
            }
            this.addPreLoad(clientCore.OperaManager.instance.loadConfig())
            this.addPreLoad(clientCore.ModuleManager.loadatlas('operaSide/bg'))
            this.addPreLoad(clientCore.ModuleManager.loadatlas('operaSide/rank'))
            this.reqMoraleInfo();
            clientCore.UIManager.setMoneyIds([9900072, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID])
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.btnMorale.alpha = 0;
            this._btnAni = clientCore.BoneMgr.ins.play('res/animate/opera/huodeshiqizhi.sk', 0, true, this);
            this._btnAni.pos(513, 618);
        }

        private reqMoraleInfo() {
            clientCore.OperaSideManager.instance.refreshMoraleNum().then(() => {
                if (!this._closed) {
                    this.updateMorale();
                }
            })
        }

        private updateMorale() {
            let data = clientCore.OperaSideManager.instance.moraleNum;
            if (data.left + data.right == 0) {
                data.left = data.right = 1;
            }
            let progressLeft = data.left;
            let progressRight = data.right;
            this.txtLeft.text = progressLeft.toString();
            this.txtRight.text = progressRight.toString();
            this.imgLeft.width = 900 * progressLeft / (progressLeft + progressRight);
            this.imgRight.width = 900 * progressRight / (progressLeft + progressRight);
            this.imgLight.x = this.imgLeft.x + this.imgLeft.width;
        }

        private onRule() {
            alert.showRuleByID(1073);
        }

        private onMorale() {
            if (clientCore.OperaManager.isFinalFightEnd) {
                alert.showFWords('当前活动已结束')
                return;
            }
            if (clientCore.OperaManager.instance.haveInfo) {
                this.enterTask();
            }
            else {
                clientCore.OperaManager.instance.reqDramaInfo().then(() => {
                    this.enterTask();
                })
            }
        }

        private enterTask() {
            if (clientCore.OperaManager.instance.side == 0) {
                alert.showFWords('请先参与中秋话剧');
                return;
            }
            this._taskPanel = this._taskPanel || new OperaTaskPanel();
            this._taskPanel.show();
            this._taskPanel.on(Laya.Event.CLOSE, this, this.updateMorale);
        }

        private onReward() {
            this._rewardPanel = this._rewardPanel || new OperaRewardPanel();
            this._rewardPanel.show();
        }

        private onRank() {
            this._rankPanel = this._rankPanel || new OperaRankPanel();
            this._rankPanel.show();
        }

        private onClose() {
            this.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnMorale, Laya.Event.CLICK, this, this.onMorale);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onRank);
            Laya.timer.loop(3 * 60000, this, this.reqMoraleInfo);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.reqMoraleInfo);
        }

        destroy() {
            this._btnAni?.dispose();
            clientCore.UIManager.releaseCoinBox();
            this._rewardPanel?.destroy();
            this._rewardPanel = null;
            this._taskPanel?.destroy();
            this._taskPanel = null;
            this._rankPanel?.destroy();
            this._rankPanel = null;
            super.destroy();
        }
    }
}