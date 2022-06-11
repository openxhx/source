namespace coolBeach {
    export class CoolBeachModule extends ui.coolBeach.CoolBeachModuleUI {
        private _model: CoolBeachModel;
        private _setImagePanel: SetImagePanel;
        private _gamePanel: GameRulePanel;
        private _canJoin: boolean;
        init() {
            this._model = CoolBeachModel.instance;
            this.boxSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.boxSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.addPreLoad(this.getEventInfo());
        }

        private getEventInfo() {
            return net.sendAndWait(new pb.cs_cool_beach_show_info()).then((msg: pb.sc_cool_beach_show_info) => {
                this._model.isSetImage = msg.IsSubmit;
                this._model.curCoolPoint = msg.cool;
                this._model.allJudgeCnt = msg.totalDay;
                this._model.judgeTimes = msg.times;
                this._model.isGetJudgeBox = msg.flag;
                this._model.pointReward = msg.isGetReward;
            })
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年8月6日活动', '【活动】清凉沙滩秀', '打开活动面板');
            this._canJoin = false;
            let suitList = [2100271, 2110456, 2110457, 2110459];
            for (let i: number = 0; i < suitList.length; i++) {
                if (clientCore.SuitsInfo.checkHaveSuits(suitList[i])) {
                    this._canJoin = true;
                    return;
                }
            }
        }

        /**前往获取服装 */
        private getSuit(idx: number) {
            clientCore.Logger.sendLog('2021年8月6日活动', '【活动】清凉沙滩秀', '点击任意前往获取按钮');
            this.destroy();
            switch (idx) {
                case 1://指尖魔法2100271
                    clientCore.ModuleManager.open('bigCharge.BigChargeModule', 1);
                    break;
                case 2://熊熊甜品屋套装2110456
                case 4://雪乡祈愿星套装2110457
                    clientCore.ModuleManager.open('bigCharge.BigChargeModule', 0);
                    break;
                case 3://十二夜鬼灯套装2110459
                    clientCore.ModuleManager.open('bigCharge.BigChargeModule', 2);
                    break;
            }
        }

        /**打开形象面板 */
        private submitImage() {
            if (!this._canJoin) {
                alert.showFWords('需要先拥有一套指定服装~');
                return;
            }
            clientCore.Logger.sendLog('2021年8月6日活动', '【活动】清凉沙滩秀', '点击我要参赛');
            if (!this._setImagePanel) this._setImagePanel = new SetImagePanel();
            clientCore.DialogMgr.ins.open(this._setImagePanel);
        }

        /**前往评选 */
        private judgeImage() {
            clientCore.Logger.sendLog('2021年8月6日活动', '【活动】清凉沙滩秀', '点击我要当评委');
            if (!this._gamePanel) this._gamePanel = new GameRulePanel();
            this._gamePanel.initUI();
            clientCore.DialogMgr.ins.open(this._gamePanel, false);
        }

        private async showRule() {
            let panel = new ui.coolBeach.RulePanelUI();
            BC.addOnceEvent(panel, panel.btnClose, Laya.Event.CLICK, clientCore.DialogMgr.ins, clientCore.DialogMgr.ins.close, [panel]);
            clientCore.DialogMgr.ins.open(panel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnJoin, Laya.Event.CLICK, this, this.submitImage);
            BC.addEvent(this, this.btnJudge, Laya.Event.CLICK, this, this.judgeImage);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this['btnGo' + i], Laya.Event.CLICK, this, this.getSuit, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}