namespace awakeSpring {
    /**
     * 复苏之春
     * awakeSpring.AwakeSpringModule
     * 2021.3.5
     */
    export class AwakeSpringModule extends ui.awakeSpring.AwakeSpringModuleUI {
        private _model: AwakeSpringModel;
        private _control: AwakeSpringControl;

        private _maxRainCnt: number;
        private _curRainCnt: number;
        private _rainCd: number;

        private buyPanel: AwakeSpringBuyPanel;
        private exchangePanel: AwakeSpringExchangePanel;

        private onListen: boolean;

        private _ani: clientCore.Bone;
        init() {
            this.sign = clientCore.CManager.regSign(new AwakeSpringModel(), new AwakeSpringControl());
            this._model = clientCore.CManager.getModel(this.sign) as AwakeSpringModel;
            this._control = clientCore.CManager.getControl(this.sign) as AwakeSpringControl;
            this._maxRainCnt = clientCore.FlowerPetInfo.petType > 0 ? 60 : 45;
            this.addPreLoad(this._control.getInfo());
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(res.load("res/animate/awakeSpring/rain.png"));
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年3月5日活动', '【主活动】复苏之春', '打开活动面板');
            this._ani = clientCore.BoneMgr.ins.play("res/animate/awakeSpring/rain.sk", 0, true, this);
            this._ani.pos(667, 750);
            this.labAweakCnt.text = "" + (this._model.MAX_FIND_CNT - this._model.findTimes);
            this._curRainCnt = Math.floor((clientCore.ServerManager.curServerTime - this._model.rainTime) / 600);
            if (this._curRainCnt >= this._maxRainCnt) {
                this._curRainCnt = this._maxRainCnt;
                this.labTime.text = "已达上限";
                this._rainCd = 600;
            } else {
                this._rainCd = 600 - (clientCore.ServerManager.curServerTime - this._model.rainTime) % 600;
                this.labTime.text = util.TimeUtil.formatSecToStr(this._rainCd, true);
                Laya.timer.loop(1000, this, this.onTime);
                this.onListen = true;
            }
            this.imgRed.visible = this._curRainCnt >= 30;
            this.labRainCnt.text = "x" + this._curRainCnt;
            this.boxWait.visible = this._curRainCnt == 0;
            this.boxGet.visible = !this.boxWait.visible;
            this.boxTime.y = this.boxWait.visible ? 540 : 610;
        }

        private onRainBack() {
            if (!this.onListen) {
                this._rainCd = 600;
                this.labTime.text = util.TimeUtil.formatSecToStr(this._rainCd, true);
                Laya.timer.loop(1000, this, this.onTime);
                this.onListen = true;
            }
            if (clientCore.ServerManager.curServerTime < this._model.rainTime) clientCore.ServerManager.curServerTime = this._model.rainTime;
            this._curRainCnt = Math.floor((clientCore.ServerManager.curServerTime - this._model.rainTime) / 600);
            this.imgRed.visible = this._curRainCnt >= 30;
            this.labRainCnt.text = "x" + this._curRainCnt;
            this.boxWait.visible = this._curRainCnt == 0;
            this.boxGet.visible = !this.boxWait.visible;
            this.boxTime.y = this.boxWait.visible ? 540 : 610;
            clientCore.AwakeSpringManager.ins.onRainBack(this._model.rainTime);
        }

        private onDetail() {
            clientCore.Logger.sendLog('2021年3月5日活动', '【主活动】复苏之春', '打开规则面板');
            alert.showRuleByID(1131);
        }

        /**前往唤醒 */
        private goawake() {
            clientCore.Logger.sendLog('2021年3月5日活动', '【主活动】复苏之春', '点击前往唤醒按钮');
            this.destroy();
            clientCore.ModuleManager.open("worldMap.WorldMapModule");
        }

        /**召唤春雷|商店 */
        private openShop() {
            clientCore.Logger.sendLog('2021年3月5日活动', '【主活动】复苏之春', '打开召唤雷雨面板');
            if (!this.buyPanel) this.buyPanel = new AwakeSpringBuyPanel(this._model.buyTimes);
            this.buyPanel.show();
        }

        /**奖励兑换 */
        private openExchange() {
            clientCore.Logger.sendLog('2021年3月5日活动', '【主活动】复苏之春', '打开奖励兑换面板');
            if (!this.exchangePanel) this.exchangePanel = new AwakeSpringExchangePanel();
            this.exchangePanel.show(this.sign);
        }

        /**收获春雨 */
        private getRain() {
            this._control.getRain(Laya.Handler.create(this, this.onRainBack));
        }

        private onTime() {
            this._rainCd--;
            if (this._rainCd == 0) {
                this._curRainCnt++;
                this.labRainCnt.text = "x" + this._curRainCnt;
                this.boxWait.visible = false;
                this.boxGet.visible = true;
                this.boxTime.y = 610;
                this._rainCd = 600;
                this.imgRed.visible = this._curRainCnt >= 30;
                if (this._curRainCnt >= this._maxRainCnt) {
                    this._curRainCnt = this._maxRainCnt;
                    this.labTime.text = "当前已达上限";
                    Laya.timer.clear(this, this.onTime);
                    this.onListen = false;
                    return;
                }
            }
            this.labTime.text = util.TimeUtil.formatSecToStr(this._rainCd, true);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnAweak, Laya.Event.CLICK, this, this.goawake);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openShop);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.openExchange);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getRain);

        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTime);
        }

        destroy() {
            super.destroy();
            this._ani.dispose();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}