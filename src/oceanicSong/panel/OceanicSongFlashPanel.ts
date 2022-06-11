namespace oceanicSong {
    /**
     * 群星闪耀
     */
    export class OceanicSongFlashPanel extends ui.oceanicSong.panel.OceanicSongFlashPanelUI implements IPanel {
        public ruleId: number = 1188;
        private _sign: number;
        private _control: OceanicSongControl;
        private _model: OceanicSongModel;
        private _buyState: Map<string, boolean>;
        private readonly _SUITS_ARR: Array<Array<string>> = [
            ["ftqy_suit_nv_1.png", "ftqy_suit_nv_2.png"],
            ["ftqy_suit_nan_1.png", "ftqy_suit_nan_2.png"]
        ];
        private readonly _suits_try: Array<number> = [
            2110407,
            2110406
        ];

        public init(sign: number): void {
            this._sign = sign;
            this._buyState = new Map();
            this._control = clientCore.CManager.getControl(this._sign) as OceanicSongControl;
            this._model = clientCore.CManager.getModel(this._sign) as OceanicSongModel;
            const sexIndex: number = clientCore.LocalInfo.sex - 1;
            this._control.init1BuyPanel(Laya.Handler.create(this, this.initSurplus));
            this.suit1.skin = `unpack/oceanicSong/${this._SUITS_ARR[sexIndex][0]}`;
            this.suit2.skin = `unpack/oceanicSong/${this._SUITS_ARR[sexIndex][1]}`;
        }
        //获取suit剩余数量
        private initSurplus(msg: pb.sc_ocean_song_panel): void {
            this._model.surplus_suit_num = msg.num;
            this.resetBuyState();
            this.addEvent();
        }


        private getCheckState(suitType: number): boolean {
            if (suitType != 2) {
                const checkArr: Array<number> = this._model.getCheckSuits(suitType, clientCore.LocalInfo.sex);
                return clientCore.SuitsInfo.checkHaveSuits(checkArr);
            } else {
                return clientCore.ItemsInfo.checkHaveItem(this._model.flash_bgshow_id);
            }
        }

        /**
         * 重置购买的状态
         */
        private resetBuyState(): void {
            this.lab_surplus.text = `剩余: ${this._model.surplus_suit_num}`;
            this._buyState.clear();
            if (this.getCheckState(2)) {
                this.state_get_1.visible = this.state_get_2.visible = true;
                this._buyState.set("btn_getOver", true);
                this._buyState.set("btn_buy1", true);
                this._buyState.set("btn_buy2", true);
                this.state_get_3.visible = true;
                this.btn_getOver.visible = false;
                this.btn_buy1.visible = this.btn_buy2.visible = false;
                return;
            }
            this.btn_getOver.visible = this.btn_buy1.visible = this.btn_buy2.visible = true;
            this.state_get_1.visible = this.state_get_2.visible = this.state_get_3.visible = false;
            if (this.getCheckState(0)) {
                this._buyState.set("btn_buy1", true);
                this.state_get_1.visible = true;
                this.btn_buy1.visible = false;
            } else {
                if (this._model.surplus_suit_num <= 0) {
                    this.state_get_1.visible = false;
                    this.btn_buy1.visible = false;
                }
            }
            if (this.getCheckState(1)) {
                this._buyState.set("btn_buy2", true);
                this.state_get_2.visible = true;
                this.btn_buy2.visible = false;
            }
            if (this._buyState.get("btn_buy1") && this._buyState.get("btn_buy2")) {
                this.btn_getOver.gray = false;
                this.btn_getOver.mouseEnabled = true;
            } else {
                this.btn_getOver.gray = true;
                this.btn_getOver.mouseEnabled = false;
            }
        }

        public show(parent: Laya.Sprite): void {
            EventManager.event(EventType.UPDATE_TIME, '活动时间:6月25日~7月8日');
            parent.addChildAt(this, 0);
            clientCore.Logger.sendLog('2021年6月25日活动', '【付费】海洋之歌', '打开粉兔轻语面板');
        }

        public hide(): void {
            this.removeSelf();
        }

        public addEvent(): void {
            BC.addEvent(this, this.btn_buy1, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btn_buy2, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btn_getOver, Laya.Event.CLICK, this, this.onClickHandler);

            //#region 试装
            BC.addEvent(this, this.btn_try1, Laya.Event.CLICK, this, this.trySuitHandler);
            BC.addEvent(this, this.btn_try2, Laya.Event.CLICK, this, this.trySuitHandler);
            BC.addEvent(this, this.btn_try3, Laya.Event.CLICK, this, this.trySuitHandler);
            //#endregion
        }

        public removeEvent(): void {
            BC.removeEvent(this);
        }

        private trySuitHandler(e: Laya.Event): void {
            switch (e.target) {
                case this.btn_try1:
                    this.trySuit(this._suits_try[0]);
                    break;
                case this.btn_try2:
                    this.trySuit(this._suits_try[1]);
                    break;
                case this.btn_try3:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', {
                        id: this._model.flash_bgshow_id,
                        condition: '',
                        limit: ''
                    });
                    break;
            }
        }

        //没有背景show
        private trySuit(suitId: number): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", suitId);
        }

        private buy1ClockCheck(): boolean {
            let now: number = clientCore.ServerManager.curServerTime;//当前的服务器时间
            let buyCouponsStart: number = util.TimeUtil.formatTimeStrToSec("2021-6-25 08:00:00");
            if (now < buyCouponsStart) {
                return false;
            }
            return true;
        }

        private onClickHandler(e: Laya.Event): void {
            const getPrice: (index: number) => xls.pair = (index) => {
                let lv: number = 0;
                if (index != 0) {
                    if (clientCore.FlowerPetInfo.petType >= 1 && clientCore.FlowerPetInfo.petType <= 2) {
                        lv = 1;
                    } else if (clientCore.FlowerPetInfo.petType == 3) {
                        lv = 2;
                    }
                }
                let id: number = this._model._periodIds[index][lv];
                let cfx: xls.eventExchange = xls.get(xls.eventExchange).get(id);
                return cfx.cost[0];
            };
            let da: xls.pair;
            switch (e.target) {
                case this.btn_buy1:
                    if (this._buyState.has("btn_buy1")) return;
                    if (!this.buy1ClockCheck()) {
                        alert.showFWords("购买时间未到!");
                        return;
                    }
                    da = getPrice(0);
                    alert.showSmall(`确定花费${da.v2}${clientCore.ItemsInfo.getItemName(da.v1)}购买粉兔轻语套装吗?`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                this.buy(0);
                            }]
                        }
                    });
                    break;
                case this.btn_buy2:
                    if (this._buyState.has("btn_buy2")) return;
                    da = getPrice(1);
                    alert.showSmall(`确定花费${da.v2}${clientCore.ItemsInfo.getItemName(da.v1)}购买沐仙草套装吗?`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                this.buy(1);
                            }]
                        }
                    });
                    break;
                case this.btn_getOver://2套全部ok,可以领取
                    if (!clientCore.ItemsInfo.checkHaveItem(this._model.flash_bgshow_id)) {
                        this._control.buySuit(3, [], 1, Laya.Handler.create(this, this.onBuyedHandler), 2);//领取最后的奖励 3500051,this._stageId
                    }
                    break;
            }
        }

        //0: 星之耀套装 ,  1: 萌兔晴雨表套装 , 2: 打包
        private buy(type: number): void {
            let index: number = 0;
            if (type != 0) {
                if (clientCore.FlowerPetInfo.petType >= 1 && clientCore.FlowerPetInfo.petType <= 2) {
                    index = 1;
                } else if (clientCore.FlowerPetInfo.petType == 3) {
                    index = 2;
                }
            }
            const period: number = this._model.getPeriod(type, index);
            this._control.buySuit(3, [period], 0, Laya.Handler.create(this, this.onBuyedHandler), type);//this._model.getSuits(period, clientCore.LocalInfo.sex)
        }

        private onBuyedHandler(state: number): void {
            if (state == null) return;//失败
            if (state == 0) {
                this._model.surplus_suit_num--;
                if (this._model.surplus_suit_num < 0) this._model.surplus_suit_num = 0;
            }
            this.resetBuyState();//重新刷新界面
        }

        public dispose(): void {
            this.removeEvent();
            this._control = this._model = null;
            clientCore.UIManager.releaseCoinBox();
            this._buyState.clear();
            this._buyState = null;
        }

    }
}
