namespace onsenRyokanExchange {
    /**
     * 温泉会馆奖励兑换
     * 2021.3.19
     * onsenRyokanExchange.OnsenRyokanExchangeModule
     */
    export class OnsenRyokanExchangeModule extends ui.onsenRyokanExchange.OnsenRyokanExchangeModuleUI {
        constructor() {
            super();
        }

        init() {
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.eList.vScrollBarSkin = '';
            this.eList.renderHandler = new Laya.Handler(this, this.eListRender, null, false);
            this.eList.mouseHandler = new Laya.Handler(this, this.eListMouse, null, false);
            this.addPreLoad(xls.load(xls.commonAward));
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年3月19日活动', '【主活动】温泉会馆', '打开奖励兑换面板');
            clientCore.UIManager.setMoneyIds([9900142, 9900143]);
            clientCore.UIManager.showCoinBox();
            this.eList.vScrollBarSkin = "";
            this.onTab(0);
        }

        private onScroll() {
            let scroll = this.eList.scrollBar;
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
        }
        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.destroy();
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btn_0, Laya.Event.CLICK, this, this.onTab, [0]);
            BC.addEvent(this, this.btn_1, Laya.Event.CLICK, this, this.onTab, [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.eList.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.onTab, [this.ani1.index]);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.onTab);
        }
        private onTab(index: number): void {
            this.ani1.index = index;
            if (index == 0) {
                this.eList.array = _.filter(xls.get(xls.commonAward).getValues(), (element: xls.commonAward) => { return element.type == 132 && element.id <= 467; });
                // this.labName.text = "蔷薇之夜套装";
                // this.imgNv.skin = "unpack/onsenRyokanExchange/3659.png";
                // this.imgNan.skin = "unpack/onsenRyokanExchange/3660.png";
            } else {
                this.eList.array = _.filter(xls.get(xls.commonAward).getValues(), (element: xls.commonAward) => { return element.type == 132 && element.id >= 468; });
                // this.labName.text = "深海庆典套装";
                // this.imgNv.skin = "unpack/onsenRyokanExchange/3947.png";
                // this.imgNan.skin = "unpack/onsenRyokanExchange/3948.png";
            }
            this.boxScroll.visible = this.eList.array.length > 8;
            this.eList.scrollTo(0);
        }
        private onTry(): void {
            let suitId = 2110570;
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", suitId);
        }
        private eListRender(item: ui.awakeSpring.item.ExchangeItemUI, index: number): void {
            let data: xls.commonAward = this.eList.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            clientCore.GlobalConfig.setRewardUI(item.vReward, { id: reward.v1, cnt: reward.v2, showName: false });
            item.numTxt.changeText(`x${data.num.v2}`);
            item.imgHas.visible = has;
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.num.v1);
            item.btnExchange.disabled = has || !clientCore.ItemsInfo.checkItemsEnough([{ itemID: data.num.v1, itemNum: data.num.v2 }]);
        }
        private eListMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.commonAward = this.eList.array[index];
                let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
                if (e.target instanceof component.HuaButton) {
                    net.sendAndWait(new pb.cs_get_hot_spring_rewards({ id: data.id })).then((msg: pb.sc_get_hot_spring_rewards) => {
                        alert.showReward(msg.items);
                        this.eList.changeItem(index, data);
                        if (this.ani1.index == 0) {
                            util.RedPoint.reqRedPointRefresh(24501);
                        } else {
                            util.RedPoint.reqRedPointRefresh(24502);
                        }
                    })
                } else {
                    clientCore.ToolTip.showTips(e.target, { id: reward.v1 });
                }
            }
        }
    }
}