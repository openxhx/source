namespace anniversary2021 {
    /**
     * 缤纷色彩 甜蜜玫瑰
     */
    export class Colorful1Panel extends ui.anniversary2021.panel.Colorful1PanelUI implements IPanel {

        private _model: Anniversary2021Model;
        private _control: Anniversary2021Control;
        private _t: time.GTime;
        ruleId:number = 1137;
        private readonly BG_SHOW_ID: number = 1000097;
        private readonly STAGE_ID: number = 1100063;
        private readonly BUY_TIME: number = util.TimeUtil.formatTimeStrToSec('2021/4/9 08:00:00');
        private readonly SUIT_1: number = 2110333;
        private readonly SUIT_2: number = 2110334;

        init(sign: number): void {
            this.pos(-60, 0);
            this.addEvents();
            this._model = clientCore.CManager.getModel(sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(sign) as Anniversary2021Control;

            //界面更新
            this.updateLimit();
            this.updateReward();
            for (let i: number = 1; i < 3; i++) {
                this['nan_' + i].visible = clientCore.LocalInfo.sex == 2;
                this['nv_' + i].visible = clientCore.LocalInfo.sex == 1;
                this.updateCloth(i);
            }
            // if (this.buy_2.visible) {
            //     let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(2537);
            //     this.buyShowTxt.changeText(cfg.cost[0].v2 + '');
            // }
            if (this.box_1.visible && this.buy_1.visible) {
                let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(2560);
                this.buySuitTxt.changeText(cfg.cost[0].v2 + '');
            }
            if (this.box_2.visible) {
                let base: number = 2561;
                for (let i: number = 0; i < 3; i++) {
                    let id: number = base + i;
                    let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(id);
                    this['price_' + (i + 1)].changeText(cfg.cost[0].v2 + '');
                }
                let type: number = clientCore.FlowerPetInfo.petType;
                this.imgGou.y = type == 3 ? 59 : (type == 0 ? 4 : 32);
            }

            this.imgLimit.visible = false;
            let now: number = clientCore.ServerManager.curServerTime;
            if (this.box_1.visible && now < this.BUY_TIME) {
                this.imgLimit.visible = true;
                this.box_1.visible = false;
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                this._t.start();
            }
        }

        show(parent: Laya.Sprite): void {
            clientCore.Logger.sendLog('2021年4月9日活动', '【付费】小花仙周年庆第四期', '打开夏日微醺面板');
            EventManager.event("ANNIVERSARY2021_SHOW_TIME", "活动时间：4月9日~4月15日");
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
        }

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        dispose(): void {
            this._t?.dispose();
            this._t = null;
            this._model = this._control = null;
            BC.removeEvent(this);
        }

        private onTime(): void {
            let now: number = clientCore.ServerManager.curServerTime;
            if (now >= this.BUY_TIME) {
                this.imgLimit.visible = false;
                this.box_1.visible = true;
                this._t?.dispose();
                this._t = null;
            }
        }

        private addEvents(): void {
            for (let i: number = 1; i < 4; i++) {
                BC.addEvent(this, this['try_' + i], Laya.Event.CLICK, this, this.onTry, [i]);
                BC.addEvent(this, this['buy_' + i], Laya.Event.CLICK, this, this.onBuy, [i]);
            }
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
        }

        private updateLimit(): void {
            this.limitTxt.changeText(`剩余：${this._model.count}`);
            this.buy_1.visible = this._model.count > 0;
        }

        private updateReward(): void {
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(this.BG_SHOW_ID);
            this.btnGet.visible = clientCore.SuitsInfo.checkHaveSuits([this.SUIT_1,this.SUIT_2]) && !has;
        }

        private updateCloth(index: number): void {
            let has: boolean = clientCore.SuitsInfo.checkHaveSuits(this['SUIT_' + index]);
            this['box_' + index].visible = !has;
            this['imgHas_' + index].visible = has;
        }

        private onTry(index: number): void {
            switch (index) {
                case 1:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_1);
                    break;
                case 2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.BG_SHOW_ID, condition: '预言之境背景秀' });
                    break;
                case 3:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_2);
                    break;
                default:
                    break;
            }
        }

        /** 奖励领取*/
        private onGet(): void {
            this._control?.getColorful(2, new Laya.Handler(this, () => {
                this.btnGet.visible = false;
            }));
        }

        private onBuy(index: number): void {
            if (index == 1 && this._model.count <= 0) {
                alert.showFWords('套装已售罄~');
                return;
            }

            let price: number;
            switch (index) {
                case 1:
                    price = parseInt(this.buySuitTxt.text);
                    break;
                case 2:
                    // price = parseInt(this.buyShowTxt.text);
                    break;
                case 3:
                    let type: number = clientCore.FlowerPetInfo.petType;
                    price = type == 3 ? parseInt(this.price_3.text) : (type == 0 ? parseInt(this.price_1.text) : parseInt(this.price_2.text));
                    break;
            }

            alert.showSmall(`是否确认花费灵豆x${price}购买？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        if (index < 3) {
                            this._control?.getColorful(index, new Laya.Handler(this, async (cnt: number) => {
                                if (cnt == -1) {
                                    await this._control.getInfo(this._model);
                                    this.updateLimit();
                                } else {
                                    if (index == 1) {
                                        this._model.count = cnt;
                                        this.updateLimit();
                                        this.updateCloth(1);
                                    }
                                    this.updateReward();
                                }
                            }));
                        } else {
                            let type: number = clientCore.FlowerPetInfo.petType;
                            let id: number = type == 3 ? 2563 : (type == 0 ? 2561 : 2562);
                            this._control?.buy(id, this._model.ACTIVITY_ID, new Laya.Handler(this, () => {
                                this.updateCloth(2);
                                this.updateReward();
                            }));
                        }
                    }]
                }
            })
        }
    }
}