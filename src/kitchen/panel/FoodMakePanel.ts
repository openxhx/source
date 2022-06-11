namespace kitchen {
    export class FoodMakePanel extends ui.kitchen.panel.FoodMakePanelUI {
        private foodId: number;
        private guoIdx: number;
        private max: number;
        private _model: KitchenModel;
        private cost: xls.pair[];
        constructor(sign: number) {
            super();
            this.sideClose = true;
            this.listMtr.vScrollBarSkin = "";
            this.listMtr.renderHandler = new Laya.Handler(this, this.listRender);
            this.listMtr.selectEnable = true;
            this.listMtr.selectHandler = new Laya.Handler(this, this.listSelect);
            this._model = clientCore.CManager.getModel(sign) as KitchenModel;
            this.labCount.restrict = "0-9";
        }

        show(foodId: number, guoIdx: number) {
            this.foodId = foodId;
            this.guoIdx = guoIdx;
            this.labCount.text = "1";
            this.max = 0;
            let xlsData = xls.get(xls.diningRecipe).get(foodId);
            this.labName.text = xlsData.name;
            this.cost = JSON.parse(JSON.stringify(xlsData.material));
            this.icon.skin = clientCore.ItemsInfo.getItemUIUrl(foodId);
            this.labEffect.text = "美味币：+" + xlsData.award;
            let serverData = this._model.serverFoodInfo.get(foodId);
            this.labTime.text = "单个烹饪用时:" + util.TimeUtil.formatSecToStr(xlsData.time);
            this.labExp.text = "熟练度:" + this.getLevelDes(serverData.counts);
            this.labHave.text = clientCore.ItemsInfo.getItemNum(foodId).toString();
            this.listMtr.array = this.cost;
            for (let i: number = 0; i < xlsData.material.length; i++) {
                let haveNum = clientCore.ItemsInfo.getItemNum(xlsData.material[i].v1);
                let num = Math.floor(haveNum / xlsData.material[i].v2);
                if (i == 0 || this.max > num) this.max = num;
            }
            let xlsMax = xls.get(xls.diningBase).get(1).cookMax;
            if (this.max > xlsMax) this.max = xlsMax;
            if (this.max > 1) this.labCount.text = "" + this.max;
            this.onCountChange();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }

        private onCountChange() {
            let xlsData = xls.get(xls.diningRecipe).get(this.foodId);
            for (let i: number = 0; i < this.cost.length; i++) {
                this.cost[i].v2 = xlsData.material[i].v2 * Number(this.labCount.text);
            }
            this.listMtr.refresh();
            let serverData = this._model.serverFoodInfo.get(this.foodId);
            let off = this.getOff(serverData.counts);
            let time = xlsData.time * Number(this.labCount.text);
            time -= Math.floor(time * off / 100);
            this.labTotalTime.text = "总时长:" + util.TimeUtil.formatSecToStr(time) + "(熟练度减少" + off + "%)";
        }

        private getLevelDes(num: number) {
            let config = xls.get(xls.diningRecipe).get(this.foodId).proficiency;
            if (num <= config[0].v1) return "生疏(" + num + "/" + config[0].v1 + ")";
            else if (num <= config[1].v1) return "熟练(" + num + "/" + config[1].v1 + ")";
            else if (num < config[2].v1) return "精湛(" + num + "/" + config[2].v1 + ")";
            else return "大师(" + num + "/" + config[2].v1 + ")";
        }

        private getOff(num: number) {
            let config = xls.get(xls.diningRecipe).get(this.foodId).proficiency;
            let off = 0;
            if (num <= config[0].v1) off = 0;
            else if (num <= config[1].v1) off = config[0].v2;
            else if (num < config[2].v1) off = config[1].v2;
            else off = config[2].v2;
            return off;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
            let have = clientCore.ItemsInfo.getItemNum(reward.v1);
            item.num.value = this.getNumToAbc(have, reward.v2) + "/" + reward.v2;
            item.num.visible = true;
        }

        private getNumToAbc(has: number, need: number) {
            let arr: string[];
            if (has >= need) {
                arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
            } else {
                arr = ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
            }
            let str = has.toString();
            let res = "";
            for (let i: number = 0; i < str.length; i++) {
                res += arr[Number(str[i])];
            }
            return res;
        }

        private listSelect(index: number) {
            if (index == -1) return;
            let reward: xls.pair = this.listMtr.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.listMtr.cells[index], { id: reward.v1 });
            };
            this.listMtr.selectedIndex = -1;
        }

        /**改变数量 */
        private changeCount(flag: number) {
            let target = 1;
            if (flag == 0) {
                target = xls.get(xls.diningBase).get(1).cookMax;
            } else {
                target = Number(this.labCount.text) + flag;
            }
            if (target < 1 || target > xls.get(xls.diningBase).get(1).cookMax || Number(this.labCount.text) == target) return;
            this.labCount.text = "" + target;
            this.onCountChange();
        }

        /**点击确认 */
        private sureClick() {
            var arr:number[] = [3700026 , 3700027 , 3700028 , 3700029];
            if(arr.indexOf(this.foodId) !=-1 && Number(this.labCount.text) > clientCore.ItemsInfo.getItemNum(9900310)){
                alert.showFWords("桃木不足~");
                return;
            }
            if (Number(this.labCount.text) > this.max) {
                alert.mtrNotEnough(this.cost, Laya.Handler.create(this, this.trueMake));
                return;
            } else {
                this.trueMake();
            }
        }

        private trueMake() {
            net.sendAndWait(new pb.cs_cooking_food_in_kitchen({ id: this.foodId, wokPos: this.guoIdx, counts: Number(this.labCount.text) })).then((msg: pb.sc_cooking_food_in_kitchen) => {
                let local = _.find(this._model.serverWokInfo, (o) => { return o.wokPos == msg.wokInfo.wokPos });
                local.id = msg.wokInfo.id;
                local.beginTime = msg.wokInfo.beginTime;
                local.endTime = msg.wokInfo.endTime;
                local.oneTime = msg.wokInfo.oneTime;
                local.total = msg.wokInfo.total;
                EventManager.event("REFRESH_WOK_INFO", this.guoIdx);
                clientCore.DialogMgr.ins.close(this);
                if (msg.fReduceTime > 0) {
                    alert.showFWords(`${this._model.fHelp.nick}的帮助下本次烹饪缩短了${util.TimeUtil.formatRemain(msg.fReduceTime)}`);
                }
            });
        }

        private checkCount() {
            if (Number(this.labCount.text) > xls.get(xls.diningBase).get(1).cookMax) {
                this.labCount.text = xls.get(xls.diningBase).get(1).cookMax.toString();
            }
            if (Number(this.labCount.text) < 1) {
                this.labCount.text = "1";
            }
            this.onCountChange();
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnSub, Laya.Event.CLICK, this, this.changeCount, [-1]);
            BC.addEvent(this, this.btnPlus, Laya.Event.CLICK, this, this.changeCount, [1]);
            BC.addEvent(this, this.btnMax, Laya.Event.CLICK, this, this.changeCount, [0]);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureClick);
            BC.addEvent(this, this.labCount, Laya.Event.INPUT, this, this.checkCount);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this.cost = null;
            super.destroy();
        }
    }
}