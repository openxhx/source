namespace springMoon {
    export class ExchangePanel extends ui.springMoon.panel.ExchangePanelUI {
        constructor() {
            super();
            this.init();
            this.sideClose = false;
        }

        init() {
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.eList.vScrollBarSkin = '';
            this.eList.renderHandler = new Laya.Handler(this, this.eListRender, null, false);
            this.eList.mouseHandler = new Laya.Handler(this, this.eListMouse, null, false);
            this.eList.array = _.filter(xls.get(xls.commonAward).getValues(), (element: xls.commonAward) => { return element.type == 137 });
            this.boxScroll.visible = this.eList.array.length > 8;
            this.eList.scrollTo(0);
        }

        show() {
            clientCore.Logger.sendLog('2021年4月2日活动', '【主活动】仲春之月', '打开奖励兑换面板');
            clientCore.UIManager.setMoneyIds([9900138]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this, false);
        }

        private onScroll() {
            let scroll = this.eList.scrollBar;
            let per = (this.boxScroll.height - this.imgScroll.height);
            this.imgScroll.y = per * scroll.value / scroll.max;
        }
        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this, false);
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.eList.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110305);
        }
        private eListRender(item: ui.springMoon.item.ExchangeItemUI, index: number): void {
            let data: xls.commonAward = this.eList.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            let has: boolean = clientCore.LocalInfo.checkHaveCloth(reward.v1);
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
                    net.sendAndWait(new pb.cs_mid_feastial_get_award({ idx: data.id })).then((msg: pb.sc_mid_feastial_get_award) => {
                        alert.showReward(msg.itms);
                        this.eList.changeItem(index, data);
                        util.RedPoint.reqRedPointRefresh(25401);
                    })
                } else {
                    clientCore.ToolTip.showTips(e.target, { id: reward.v1 });
                }
            }
        }
    }
}