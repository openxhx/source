namespace bigCharge {
    /**
     * 夏日抽奖
     */
    export class CoinDrawPanel extends ui.bigCharge.panel.CoinDrawPanelUI {
        private reward:pb.IItem;
        private canStop:boolean;
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.imgTurn.rotation = 0;
            this.btnTurn.visible = true;
        }

        async show() {
            clientCore.Logger.sendLog('2021年7月2日活动', '【付费】暑假大充', '打开夏日抽奖面板');
            this.setUI();
        }

        hide() {
            this.removeSelf();
        }

        private setUI() {
            this.btnTurn.visible = BigChargeModel.instance.costCnt >= 399;
            this.labCnt.text = "剩余次数:" + Math.floor(BigChargeModel.instance.costCnt / 399);
            this.labCost.text = "再消耗" + (399 - (BigChargeModel.instance.costCnt % 399));
        }

        /**抽奖 */
        private draw() {
            this.btnTurn.visible = false;
            this.startRoll();
            net.sendAndWait(new pb.cs_summer_recharge_draw({ stage: 1 })).then((msg: pb.sc_summer_recharge_draw) => {
                this.reward = msg.items[0];
                BigChargeModel.instance.costCnt -= 399;
            })
        }

        private async startRoll(){
            BigChargeModel.instance.canChangePanel = false;
            this.canStop = false;
            Laya.timer.loop(10,this,this.loop);
            await util.TimeUtil.awaitTime(2000);
            this.canStop = true;
        }

        private loop(){
            this.imgTurn.rotation += 10;
            if(this.canStop){
                let rotation = this.imgTurn.rotation % 360;
                if(this.reward.cnt == 8 && rotation > 145 && rotation < 215){
                    this.stop();
                }else if(this.reward.cnt == 108 && (rotation > 325 || rotation < 35)){
                    this.stop();
                }else if(this.reward.cnt == 58 && rotation > 55 && rotation < 125){
                    this.stop();
                }else if(this.reward.cnt == 28 && rotation > 235 && rotation < 305){
                    this.stop();
                }
            }
        }

        private stop(){
            BigChargeModel.instance.canChangePanel = true;
            Laya.timer.clear(this,this.loop);
            this.setUI();
            alert.showReward([this.reward]);
        }

        /**打开夏日回馈 */
        private openOther() {
            EventManager.event('BIG_CHARGE_SHOW_EVENT_PANEL', panelType.freeGift);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1196);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.openOther);
            BC.addEvent(this, this.btnTurn, Laya.Event.CLICK, this, this.draw);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            this.reward = null;
            super.destroy();
        }
    }
}