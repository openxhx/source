
namespace activity {
    export class LeafPanel extends ActivityBasePanel<ui.activity.panel.LeafPanelUI>{
        private _haveGrowPlan: boolean;
        private _rewardState: number;
        private _rewardStateArr: boolean[];

        init() {
            this.addPreLoad(xls.load(xls.growPlan));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_grow_plan_info()).then((data: pb.sc_get_grow_plan_info) => {
                this._haveGrowPlan = data.hasGrowPlan == 1;
                this._rewardState = data.rewardStatus;
            }));
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        preLoadOver() {
            this.ui.boxBuy.visible = !this._haveGrowPlan
            this.ui.imgHaveBuy.visible = this._haveGrowPlan;
            let xlsInfo = xls.get(xls.growPlan).getValues();
            this._rewardStateArr = [];
            for (let i = 0; i < xlsInfo.length; i++) {
                this._rewardStateArr.push(util.getBit(this._rewardState, i + 1) == 1);
            }
            this.ui.txtPrice.text = '￥' + clientCore.RechargeManager.getShopInfo(13).cost;
            this.ui.list.dataSource = this._rewardStateArr;
            clientCore.Logger.sendLog('付费系统', '神叶养成计划', '打开神叶养成计划界面')
        }

        private async onBuy() {
            clientCore.RechargeManager.pay(13).then((data) => {
                this._haveGrowPlan = true;
                this.ui.boxBuy.visible = !this._haveGrowPlan
                this.ui.imgHaveBuy.visible = this._haveGrowPlan;
                this.ui.list.startIndex = this.ui.list.startIndex;
                alert.showReward(clientCore.GoodsInfo.createArray(data.items));
                util.RedPoint.reqRedPointRefresh(3305);
            }).catch((e) => { })
        }

        private onListRender(cell: ui.activity.render.LeafRenderUI, idx: number) {
            let xlsInfo = xls.get(xls.growPlan).getValues()[idx];
            cell.txtDes.text = '主角达到' + xlsInfo.level + '级';
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.reward.v1);
            cell.fontNum.value = xlsInfo.reward.v2.toString();
            if (!this._haveGrowPlan) {
                cell.imgDes.visible = true;
                cell.imgGet.visible = false;
                cell.btnGet.visible = false;
            }
            else {
                let rewardGet = this._rewardStateArr[idx];
                let canGetReward = !rewardGet && clientCore.LocalInfo.userLv >= xlsInfo.level;
                cell.imgDes.visible = rewardGet || !canGetReward;
                cell.imgGet.visible = rewardGet;
                cell.btnGet.visible = canGetReward;
            }
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(xlsInfo.reward.v1);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == 'btnGet') {
                    net.sendAndWait(new pb.cs_get_grow_plan_reward({ id: idx + 1 })).then((data: pb.sc_get_grow_plan_reward) => {
                        alert.showReward(clientCore.GoodsInfo.createArray([data.item]));
                        this._rewardStateArr[idx] = true;
                        this.ui.list.startIndex = this.ui.list.startIndex;
                        util.RedPoint.reqRedPointRefresh(3305);
                    })
                }
            }
        }

        addEvent() {
            BC.addEvent(this, this.ui.btnBuy, Laya.Event.CLICK, this, this.onBuy);
        }

        removeEvent() {
            BC.removeEvent(this);
        }
    }
}