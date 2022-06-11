namespace callPlayer {
    export class CallPlayerModule extends ui.callPlayer.CallPlayerModuleUI {
        private _model: CallPlayerModel;
        private _control: CallPlayerControl;

        private writePanel: CallPlayerPanel;
        private rewardPanel: CallRewardPanel;
        init(data: any) {
            this.sign = clientCore.CManager.regSign(new CallPlayerModel(), new CallPlayerControl());
            this._model = clientCore.CManager.getModel(this.sign) as CallPlayerModel;
            this._control = clientCore.CManager.getControl(this.sign) as CallPlayerControl;
            this._control._model = this._model;
            this.writePanel = new CallPlayerPanel(this.sign);
            this.rewardPanel = new CallRewardPanel();
            this.addPreLoad(xls.load(xls.continueLogin));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.suits));
            this.addPreLoad(this.getEventInfo());
            this.imgFemaleLixys.visible = this.imgFemaleCxsg.visible = clientCore.LocalInfo.sex == 1;
            this.imgMaleLlxys.visible = this.imgMaleCxsg.visible = clientCore.LocalInfo.sex == 2;
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年8月14日活动', '【老玩家召回】守望忆拾光', '打开活动面板');
            this.updataThreeDayUI();
            this.updataBackerUI();
            this.updataCallUI();
        }

        private async getEventInfo() {
            let info = await this._control.getPlayerStatue();
            this._model.isBacker = info.flag != 0;
            this._model.haveInvite = info.isWriteUid != 0;
            this._model.curActive = info.activeValue;
            let callInfo = await this._control.getInvited();
            this._model.invitedId = callInfo.uid;
            let rewardInfo = await this._control.reqThreeDayInfo();
            this._model._maxDay = rewardInfo.days.length;
            this._model._curDay = this._model._maxDay + 1;
            for (let i = 0; i < rewardInfo.days.length; i++) {
                if (rewardInfo.days[i] == 0) {
                    this._model._curDay = i + 1;
                    break;
                }
            }
            this._model.isCallReward = clientCore.SuitsInfo.getSuitInfo(this._model.callSuit).allGet;
            this._model.isActReward = clientCore.SuitsInfo.getSuitInfo(this._model.activeSuit).allGet;
        }

        /**设置三日奖励UI */
        private talkStr: string[] = ["欢迎回家！", "我们都在等你！", "我们要一直一直在一起哦！"]
        private updataThreeDayUI() {
            this.imgLusha.visible = this._model._maxDay == 1;
            this.imgAidewen.visible = this._model._maxDay == 2;
            this.imgFenni.visible = this._model._maxDay == 3;
            this.imgDayBg.visible = this.btnDayReward.visible = this._model._curDay <= 3;
            if (this._model._curDay <= 3) {
                let config = xls.get(xls.continueLogin).get(this._model._curDay);
                let reward = clientCore.LocalInfo.sex == 1 ? config.reward : config.rewardMale;
                this.imgDayReward.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            }
            if (this._model._maxDay < 3 && this._model._curDay > this._model._maxDay) {
                this.labTalk.text = "明天也有人在等你哦~";
                this.btnDayReward.fontSkin = "commonBtn/s_y_back tomorrow.png";
            } else {
                this.labTalk.text = this.talkStr[this._model._maxDay - 1];
                this.btnDayReward.fontSkin = "commonBtn/s_y_Reward.png";
            }
        }

        /**设置回流玩家UI */
        private updataBackerUI() {
            this.btnActiveReward.visible = this.btnPlayCall.visible = this.btnSuitCall.visible = this._model.isBacker;
            this.labCurActValue.text = this._model.curActive.toString();
            this.imgActGot.visible = this._model.isActReward && this._model.isBacker;
            if (this._model.isBacker) {
                this.btnActiveReward.visible = this._model.curActive >= 1100 && !this._model.isActReward;
                this.btnPlayCall.visible = !this._model.haveInvite;
                this.btnSuitCall.x = (this.btnActiveReward.visible || this.btnPlayCall.visible) ? 110 : 220;
                if (this.btnPlayCall.visible) {
                    this.btnActiveReward.pos(220, 630);
                } else {
                    this.btnActiveReward.pos(330, 700);
                }
            }
        }

        /**设置召回相关UI */
        private updataCallUI() {
            this.imgCallGot.visible = this._model.isCallReward;
            this.btnGetCallReward.visible = this._model.invitedId.length >= 3 && !this._model.isCallReward;
            this.labCurCall.text = "已成功召唤好友：" + this._model.invitedId.length + "/3";
            this.labCurCall.visible = !this.btnGetCallReward.visible;
        }

        /**试穿套装 */
        private previewSuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1049);
        }

        /**领取活跃奖励 */
        private async getActReward() {
            let msg = await this._control.getReward(3);
            let arr: pb.IItem[] = [];
            for (let j: number = 0; j < msg.item.length; j++) {
                if (xls.get(xls.suits).get(msg.item[j].id)) {
                    let cloths = clientCore.SuitsInfo.getSuitInfo(msg.item[j].id).clothes;
                    for (let i: number = 0; i < cloths.length; i++) {
                        let item = new pb.Item();
                        item.id = cloths[i];
                        item.cnt = 1;
                        arr.push(item);
                    }
                } else {
                    arr.push(msg.item[j]);
                }
            }
            util.RedPoint.reqRedPointRefresh(13402);
            alert.showReward(arr);
            this._model.isActReward = true;
            this.updataBackerUI();
        }

        /**领取三日登录奖励 */
        private async getDayReward() {
            if (this._model._curDay > this._model._maxDay) return;
            let msg = await this._control.getThreeDayReward(this._model._curDay);
            if (msg) {
                this._model._curDay++;
                this.updataThreeDayUI();
            }
            util.RedPoint.reqRedPointRefresh(13403);
        }

        /**领取召回奖励 */
        private async getCallReward() {
            let msg = await this._control.getReward(2);
            let arr: pb.IItem[] = [];
            for (let j: number = 0; j < msg.item.length; j++) {
                if (xls.get(xls.suits).get(msg.item[j].id)) {
                    let cloths = clientCore.SuitsInfo.getSuitInfo(msg.item[j].id).clothes;
                    for (let i: number = 0; i < cloths.length; i++) {
                        let item = new pb.Item();
                        item.id = cloths[i];
                        item.cnt = 1;
                        arr.push(item);
                    }
                } else {
                    arr.push(msg.item[j]);
                }
            }
            util.RedPoint.reqRedPointRefresh(13401);
            alert.showReward(arr);
            this._model.isCallReward = true;
            this.updataCallUI();
        }

        /**打开填写id面板 */
        private openWritePanel() {
            clientCore.DialogMgr.ins.open(this.writePanel);
            clientCore.Logger.sendLog('2020年8月14日活动', '【老玩家召回】守望忆拾光', '打开拾光邀请面板');
        }

        /**打开购买套装面板 */
        private openSuitBuy() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("callSuit.CallSuitModule", null, { openWhenClose: "callPlayer.CallPlayerModule" });
        }

        /**展示召回的套装外奖励 */
        private showRewardDetails() {
            this.rewardPanel.showInfo();
            clientCore.DialogMgr.ins.open(this.rewardPanel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnActiveReward, Laya.Event.CLICK, this, this.getActReward);
            BC.addEvent(this, this.btnDayReward, Laya.Event.CLICK, this, this.getDayReward);
            BC.addEvent(this, this.btnGetCallReward, Laya.Event.CLICK, this, this.getCallReward);
            BC.addEvent(this, this.btnPlayCall, Laya.Event.CLICK, this, this.openWritePanel);
            BC.addEvent(this, this.btnSuitCall, Laya.Event.CLICK, this, this.openSuitBuy);
            BC.addEvent(this, this.imgDetails, Laya.Event.CLICK, this, this.showRewardDetails);
            BC.addEvent(this, this.btnTyrCxsg, Laya.Event.CLICK, this, this.previewSuit, [this._model.callSuit]);
            BC.addEvent(this, this.btnTyrLlxys, Laya.Event.CLICK, this, this.previewSuit, [this._model.activeSuit]);
            EventManager.on("ID_WRITE_BACK", this, this.updataBackerUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("ID_WRITE_BACK", this, this.updataBackerUI);
        }

        destroy() {
            this.writePanel?.destroy();
            this.rewardPanel?.destroy();
            clientCore.CManager.unRegSign(this.sign);
            this.writePanel = this.rewardPanel = this._model = this._control = null;
            super.destroy();
        }
    }
}