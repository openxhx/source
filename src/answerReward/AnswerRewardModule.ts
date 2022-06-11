namespace answerReward {
    /**
     * 心有灵夕-奖励兑换
     */
    export class AnswerRewardModule extends ui.answerReward.AnswerRewardModuleUI {
        private _status: number;
        private _all: xls.eventExchange[];
        private _page: number;

        constructor() {
            super();
        }

        init(): void {
            this.imgMan.visible = clientCore.LocalInfo.sex == 2;
            this.imgWoman.visible = clientCore.LocalInfo.sex == 1;
            this.list.renderHandler = new Laya.Handler(this, this.itemRender, null, false);
            this.list.mouseHandler = new Laya.Handler(this, this.itemMouse, null, false);

            this.addPreLoad(xls.load(xls.eventExchange));
            // this.addPreLoad(this.getRewardInfo());
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btn_1, Laya.Event.CLICK, this, this.onReward, [1]);
            BC.addEvent(this, this.btn_2, Laya.Event.CLICK, this, this.onReward, [2]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.updatePage, [1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.updatePage, [2]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._all.length = 0;
            this._all = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        onPreloadOver(): void {
            this._all = _.filter(xls.get(xls.eventExchange).getValues(), (element: xls.eventExchange) => {
                return element.type == 60;
            });
            // this.updateView(this._status == 2 ? 2 : 1);
            this.updateView(2);
            clientCore.UIManager.showCoinBox();
            clientCore.UIManager.setMoneyIds([9900059]);
        }

        private getRewardInfo(): Promise<void> {
            return net.sendAndWait(new pb.cs_get_map_game_reward_info()).then((msg: pb.sc_get_map_game_reward_info) => {
                this._status = msg.freeStatus;
            })
        }

        private updateView(status: number): void {
            this.boxReward.visible = status == 1;
            this.boxExchange.visible = status == 2;
            let array: xls.eventExchange[];
            if (status == 1) {
                array = _.slice(this._all, 0, 2);
                for (let i: number = 0; i < 2; i++) {
                    let element: xls.eventExchange = array[i];
                    let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? element.femaleProperty[0] : element.maleProperty[0];
                    this['cloth_' + (i + 1)].skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                }
            } else {
                this._page = -1;
                this.updatePage(2);
            }
        }

        private onReward(index: number): void {
            if (this._status == 0) {
                alert.showFWords('小花仙，还不满足领取条件哦~');
                return;
            }
            let data: xls.eventExchange = _.slice(this._all, 0, 2)[index - 1];
            net.sendAndWait(new pb.cs_common_exchange({
                activityId: data.type,
                exchangeId: data.id
            })).then((msg: pb.sc_common_exchange) => {
                alert.showReward(msg.item);
                this._status = 2;
                this.updateView(2);
                util.RedPoint.reqRedPointRefresh(14301);
            })
        }

        private itemRender(item: ui.answerReward.ExchangeItemUI, index: number): void {
            let data: xls.eventExchange = this.list.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            clientCore.GlobalConfig.setRewardUI(item.rewardView, {id: reward.v1, cnt: reward.v2, showName: false});
            item.costTxt.changeText(`x${data.cost[0].v2}`);
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(data.cost[0].v1);
            item.imgHas.visible = (item.getChildByName('exchange') as component.HuaButton).disabled = data.repeat == 0 && clientCore.ItemsInfo.checkHaveItem(reward.v1);
        }

        private itemMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let data: xls.eventExchange = this.list.array[index];
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            if (e.target.name == 'exchange') {
                if (clientCore.ItemsInfo.checkHaveItem(reward.v1) && data.repeat == 0) return;
                let cost: xls.pair = data.cost[0];
                if (clientCore.ItemsInfo.getItemNum(cost.v1) < cost.v2) {
                    alert.showFWords(`小花仙，你的${clientCore.ItemsInfo.getItemName(cost.v1)}数量不足哦！`);
                    return;
                }
                net.sendAndWait(new pb.cs_common_exchange({
                    activityId: data.type,
                    exchangeId: data.id
                })).then((msg: pb.sc_common_exchange) => {
                    alert.showReward(msg.item);
                    this.list.changeItem(index, data);
                })
            } else {
                clientCore.ToolTip.showTips(e.target, {id: reward.v1});
            }
        }

        private updatePage(type: number): void {
            let array: xls.eventExchange[] = this._all;
            let page: number = type == 1 ? Math.max(0, this._page - 1) : Math.min(this._page + 1, Math.floor(array.length / 8));
            if (page == this._page) return;
            let start: number = page * 8;
            let end: number = Math.min(start + 8, array.length);
            this.list.array = _.slice(array, start, end);
            this._page = page;
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110467);
        }
    }
}