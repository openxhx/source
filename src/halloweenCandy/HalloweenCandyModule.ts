namespace halloweenCandy {
    /**
    * 万圣节讨糖主活动
    * halloweenCandy.HalloweenCandyModule
    * 2021.10.29
    */
    export class HalloweenCandyModule extends ui.halloweenCandy.HalloweenCandyModuleUI {
        private ruleID: number = 1216;//规则
        private pumpkinPie: number = 9900258;
        private ExchangePanel: HalloweenCandyExchangePanel;
        private GiftPanel: HalloweenCandyGiftPanel;
        private answerID: number;
        private skeleton: clientCore.Bone;
        private now: number = clientCore.ServerManager.curServerTime;//当前服务器时间
        private times: number = util.TimeUtil.formatTimeStrToSec("2021-11-05 00:00:00");

        init() {
            this.addPreLoad(this.getInfo());
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.miniAnswer));
        }

        onPreloadOver() {
            this.initUI();
            Laya.timer.loop(5000, this, this.getInfo);
            clientCore.Logger.sendLog('2021年10月29日活动', '【活动】南瓜节讨糖大赛', '打开活动主面板');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.onGift);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
            BC.addEvent(this, this.btnShine, Laya.Event.CLICK, this, this.onShine);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.onShop);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            for (let i = 0; i <= 2; i++) {
                BC.addEvent(this, this['btnDoor' + i], Laya.Event.CLICK, this, this.onDoor, [i]);
                for (let j = 0; j <= 2; j++) {
                    BC.addEvent(this, this['btnChoose' + i + j], Laya.Event.CLICK, this, this.onAnswer, [i, j]);
                }
            }

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            Laya.timer.clear(this, this.getInfo);
            this.skeleton?.dispose();
            this.GiftPanel?.destroy();
            this.ExchangePanel?.destroy();
            this.skeleton = this.GiftPanel = this.ExchangePanel = null;
            super.destroy();
        }
        /**获取面板信息 */
        private getInfo() {
            return net.sendAndWait(new pb.cs_halloween_candy_megagame_info()).then((data: pb.sc_halloween_candy_megagame_info) => {
                HalloweenCandyModel.instance.serverInfo = data;
                this.lab1.text = `全服讨糖次数：${data.allTime}`;
                this.lab2.text = `个人讨糖次数：${data.ownTime}`;
                this.lab0.text = `${clientCore.ItemsInfo.getItemNum(this.pumpkinPie)}`;
            })
        }
        /**规则按钮 */
        private onRule(): void {
            alert.showRuleByID(this.ruleID)
        }
        /**礼包按钮 */
        private onGift(): void {
            this.GiftPanel = this.GiftPanel || new HalloweenCandyGiftPanel();
            this.GiftPanel.show();
        }
        /**前往获得按钮 */
        private onGo(): void {
            clientCore.ToolTip.showTips(this.btnGo, { id: 9900258 });
            clientCore.Logger.sendLog('2021年10月29日活动', '【活动】南瓜节讨糖大赛', '点击南瓜派的前往获得');
        }
        /**糖果商店按钮 */
        private onShop(): void {
            this.destroy();
            clientCore.ModuleManager.open("halloweenShop.HalloweenShopModule");
        }
        /**闪耀变身按钮 */
        private onShine(): void {
            this.destroy();
            clientCore.ModuleManager.open("twinkleTransfg.TwinkleTransfgModule");
        }
        /**兑换奖励按钮 */
        private onExchange(): void {
            this.ExchangePanel = this.ExchangePanel || new HalloweenCandyExchangePanel();
            this.ExchangePanel.show();
        }

        private initUI(): void {
            for (let i = 0; i <= 2; i++) {
                this['openDoor' + i].visible = false;
                this['answerNPC' + i].visible = false;
                this['answerLab' + i].visible = false;
                this['answerImg' + i].visible = false;
                this['answer' + i].visible = false;
            }
        }

        private onAnswer(nums: number, num: number) {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_mini_answer({ chose: num + 1, activity: 201, id: this.answerID })).then((data: pb.sc_mini_answer) => {
                this['answer' + nums].visible = true;
                this['openDoor' + nums].visible = false;
                this.skeleton?.dispose();
                this.skeleton = clientCore.BoneMgr.ins.play('res/animate/halloweenCandy/effect.sk', 0, false, this['answer' + nums]);
                this.skeleton.pos(41, 226);
                this.skeleton.once(Laya.Event.COMPLETE, this, async function () {
                    this['answerLab' + nums].visible = true;
                    this['answerImg' + nums].visible = true;
                    this['answerNPC' + nums].visible = true;
                    this['answerNPC' + nums].skin = `halloweenCandy/${this.answerID - 215}.png`;
                    if (data.tf == 1) {
                        this['answerLab' + nums].skin = 'halloweenCandy/dui.png'
                    } else {
                        this['answerLab' + nums].skin = 'halloweenCandy/budui.png'
                    }
                    this.skeleton?.dispose();
                    this.skeleton = null;
                    await util.TimeUtil.awaitTime(1700);
                    this.mouseEnabled = true;
                    alert.showReward(data.item);
                    this.btnClose.visible = true;
                    this.btnGift.visible = true;
                    this.btnGo.visible = true;
                    this.btnShine.visible = true;
                    this.btnShop.visible = true;
                    this.btnRule.visible = true;
                    this.btnExchange.visible = true;
                    this['answerNPC' + nums].visible = false;
                    this['answerLab' + nums].visible = false;
                    this['answerImg' + nums].visible = false;
                    this['answer' + nums].visible = false;
                    for (let i = 0; i <= 2; i++) {
                        this['btnDoor' + i].visible = true;
                    }
                });
            });
        }

        private onDoor(num: number) {
            if (clientCore.ItemsInfo.getItemNum(9900258) >= 40) {
                clientCore.Logger.sendLog('2021年10月29日活动', '【活动】南瓜节讨糖大赛', '点击敲门');
                if (this.now >= this.times) {
                    this.answerID = Math.floor(Math.random() * 10 + 226);
                }
                else {
                    this.answerID = Math.floor(Math.random() * 10 + 216);
                }
                let data = xls.get(xls.miniAnswer).get(this.answerID);
                this.btnClose.visible = false;
                this.btnGift.visible = false;
                this.btnGo.visible = false;
                this.btnShine.visible = false;
                this.btnShop.visible = false;
                this.btnRule.visible = false;
                this.btnExchange.visible = false;
                for (let i = 0; i <= 2; i++) {
                    this['btnDoor' + i].visible = false;
                }
                this['openDoor' + num].visible = true;
                this['NPC' + num].skin = `halloweenCandy/${this.answerID - 215}.png`;
                for (let i = 0; i <= 2; i++) {
                    this['lab' + num + i].text = `${data[`answer_` + (i + 1)]}`;
                }
            }
            else {
                alert.showSmall("南瓜派不足");
            }

        }
    }
}