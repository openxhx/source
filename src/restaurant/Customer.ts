namespace restaurant {
    export class Customer extends ui.restaurant.render.RestaurantCustomerUI {
        private _bone: clientCore.Bone;
        public id: number;
        public seat: number;
        private foodPos: number;
        private doorPos: number[] = [30, 290];
        private firstPos: number[] = [90, 355];
        private seconedPos: number[] = [210, 450];
        private _model: RestaurantModel;
        private eatCd: number;
        private haveTip: number;
        //桌椅位置
        private seatPos: xls.pair[] = [{ v1: 330, v2: 520 }, { v1: 480, v2: 620 }, { v1: 630, v2: 520 }, { v1: 780, v2: 620 }, { v1: 930, v2: 520 }];
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as RestaurantModel;
        }

        setData(id: number) {
            this.id = id;
            this._bone = clientCore.BoneMgr.ins.play(`res/battle/role/${id}.sk`, 'idle', true, this.role);
            this._bone.pos(60, 240);
            this.pos(-350, this.doorPos[1] - 427);
            this.imgTip.visible = false;
        }

        /**开始执行就餐流程 */
        public async goEat(seat: number) {
            // console.log("角色开始进入：" + seat + "::::" + clientCore.ServerManager.curServerTime);
            await util.TimeUtil.awaitTime(1000);
            if (!this._model) return;
            this._bone.play("move", true);
            this.seat = seat;
            this.visible = true;
            this.enterDoor();
        }

        /**进门 */
        private enterDoor() {
            this._bone.scaleX = -1;
            Laya.Tween.to(this, { x: this.doorPos[0] - 64 }, 2000, null, Laya.Handler.create(this, this.step1));
        }

        /**从门口走到目标座位的转折点 */
        private step1() {
            let tgtPos;
            if (this.seat % 2 == 0) {
                tgtPos = this.seconedPos;
                this.zOrder = 10;
                Laya.Tween.to(this, { x: tgtPos[0] - 64, y: tgtPos[1] - 427 }, 2000, null, Laya.Handler.create(this, this.step2));
            } else {
                tgtPos = this.firstPos;
                this.zOrder = 5;
                Laya.Tween.to(this, { x: tgtPos[0] - 64, y: tgtPos[1] - 427 }, 1000, null, Laya.Handler.create(this, this.step2));
            }
        }

        /**从转折点走向座位 */
        private step2() {
            if (this.seat % 2 == 0) {
                Laya.Tween.to(this, { x: this.seatPos[this.seat - 1].v1 - 64 }, 1300 * this.seat / 2, null, Laya.Handler.create(this, this.callFood));
            } else {
                Laya.Tween.to(this, { x: this.seatPos[this.seat - 1].v1 - 64 }, 1300 * (this.seat + 1) / 2, null, Laya.Handler.create(this, this.callFood));
            }
        }

        /**叫餐 */
        private async callFood() {
            this.y -= 20;
            if (this.seat % 2 == 0) {
                this.zOrder = 9;
            } else {
                this.zOrder = 4;
            }
            this._bone.scaleX = 1;
            this._bone.play("sitdown", false, Laya.Handler.create(this, async () => {
                let foodPos: pb.IDinerFoodPos = this.getEatFood();
                this.foodPos = foodPos.foodPos;
                this.imgIdea.skin = clientCore.ItemsInfo.getItemIconUrl(foodPos.foodId);
                this.imgTip.visible = true;
                await util.TimeUtil.awaitTime(1000);
                if (!this._model) return;
                foodPos.counts--;
                this._model.inNoSeatNum--;
                if (!this._model.onEatPos) this._model.onEatPos = [];
                this._model.onEatPos.push(foodPos.foodPos);
                EventManager.event("CUSTOMER_CALL_FOOD", [this.seat, foodPos.foodId]);
                this.imgTip.visible = false;
                this.eat();
            }));
        }

        /**就餐 */
        private eat() {
            this._bone.play("eat", true);
            net.sendAndWait(new pb.cs_customer_dine_in_restaurant({ seatPos: this.seat, npcId: this.id })).then((msg: pb.sc_customer_dine_in_restaurant) => {
                this.haveTip = msg.tip;
                this.eatCd = msg.endTime - clientCore.ServerManager.curServerTime;
                Laya.timer.loop(1000, this, this.secondLoop);
            });
        }

        /**结账 */
        private pay() {
            net.sendAndWait(new pb.cs_customer_pay_for_restaurant({ seatPos: this.seat, foodPos: this.foodPos })).then((msg: pb.sc_customer_pay_for_restaurant) => {
                this._model.cleanPoint = msg.cleanliness;
                this._model.curPoint = msg.scores;
                this._model.onCleanPointChange();
                this.labPoint.text = clientCore.ItemsInfo.getItemName(msg.items[0].id) + "+" + msg.items[0].cnt;
                if (msg.tidbitId) {
                    clientCore.NpcNewsManager.ins.unreadNews.push(msg.tidbitId);
                    clientCore.NpcNewsManager.ins.totalNews.push(msg.tidbitId);
                }
                let idx = _.findIndex(this._model.onEatPos, (o) => { return o == this.foodPos });
                this._model.onEatPos.splice(idx, 1);
                EventManager.event("CUSTOMER_EAT_OVER", this.seat);
                this.ani1.play(0, false);
                this.eatOver();
            });
        }

        /**检查小费并退场 */
        private eatOver() {
            // console.log("角色结账完成：" + this.seat + "::::" + clientCore.ServerManager.curServerTime);
            if (this.haveTip == 0) {
                this.imgIdea.skin = "restaurant/lihe.png";
                this.imgTip.visible = true;
                BC.addEvent(this, this.imgTip, Laya.Event.CLICK, this, this.getTip);
            }
            this._bone.play("situp", false, Laya.Handler.create(this, this.goOut));
            // this._bone.once(Laya.Event.COMPLETE, this, this.goOut);
        }

        /**退场 */
        private goOut() {
            if (this.seat % 2 == 0) {
                this.zOrder = 10;
            } else {
                this.zOrder = 5;
            }
            this.y += 20;
            this._bone.play("move", true);
            let tgtPos;
            let time = 1000;
            let time1 = 1000;
            if (this.seat % 2 == 0) {
                tgtPos = this.seconedPos;
                time = 1300 * this.seat / 2;
                time1 = 2000;
            } else {
                tgtPos = this.firstPos;
                time = 1300 * (this.seat + 1) / 2;
            }
            Laya.Tween.to(this, { x: tgtPos[0] - 64, y: tgtPos[1] - 427 }, time, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(this, { x: this.doorPos[0] - 64, y: this.doorPos[1] - 427 }, time1, null, Laya.Handler.create(this, () => {
                    Laya.Tween.to(this, { x: -350 }, 1000, null, Laya.Handler.create(this, this.outOver));
                }));
            }));
        }

        /**退场结束，清除数据 */
        private outOver() {
            this.visible = false;
            this._bone.dispose();
            this._bone = null;
            if (!this._model.onWaitNpc) this._model.onWaitNpc = [];
            this._model.onWaitNpc.push({ id: this.id, end: xls.get(xls.diningBase).get(1).npcIntervalTime });
        }

        /**获取小费 */
        private getTip() {
            BC.removeEvent(this, this.imgTip, Laya.Event.CLICK, this, this.getTip);
            net.sendAndWait(new pb.cs_get_customer_tip({ npcId: this.id })).then((msg: pb.sc_get_customer_tip) => {
                this._model.curPoint = msg.scores;
                alert.showReward(msg.items);
                this.imgTip.visible = false;
            });
        }

        private secondLoop() {
            if (this.eatCd > 0) {
                this.eatCd--;
            } else {
                this.eatCd = 0;
                Laya.timer.clear(this, this.secondLoop);
                this.pay();
            }
        }

        private getEatFood() {
            let curFood = this._model.curFood;
            let posArr = [];
            for (let i: number = 0; i < curFood.length; i++) {
                if (curFood[i].foodId > 0 && curFood[i].counts > 0) posArr.push(i);
            }
            let idx = Math.floor(Math.random() * posArr.length);
            return curFood[posArr[idx]];
        }

        destroy() {
            Laya.Tween.clearAll(this);
            Laya.timer.clear(this, this.secondLoop);
            this._bone?.dispose();
            this._bone = null;
            this._model = null;
            super.destroy();
        }
    }
}