namespace diningCarSell {
    class MachineInfo {
        /**机器id */
        id: number;
        /**机器数量 */
        cnt: number;
        /**输入产出 */
        in_out: xls.pair[];
        /**制作时间 */
        makeTime: number;
        /**制作数量 */
        makeCnt: number;
        /**当前持有的产物数量 */
        curCnt: number;
    }

    export class DiningCarSellModule extends ui.diningCarSell.DiningCarSellModuleUI {
        private _gameRuning: boolean;
        /**经营时间 */
        private time: number;
        /**最大顾客数量 */
        private customerCnt: number;
        /**顾客等待时间 */
        private customerTime: number[];
        /**顾客cd */
        private customerCdInfo: number;
        /**持有的机器数据 */
        private machinesInfo: util.HashMap<MachineInfo>;
        /**动画 */
        private animation: util.HashMap<clientCore.Bone>;
        /**是否第一次打开 */
        private isFirst: boolean;
        constructor() {
            super();
        }

        init(data: { custom: { maxCnt: number, waitTime: number[], time: number, customerCd: number }, machines: MachineInfo[] }) {
            this.time = data.custom.time;
            this.labTime.text = "倒计时：" + this.time + "秒";
            this.customerCnt = data.custom.maxCnt;
            this.customerTime = data.custom.waitTime;
            this.customerCdInfo = this.customerCd = data.custom.customerCd;
            this.creatMachine(data.machines);
            this.addPreLoad(xls.load(xls.diningCarFood));
            this.addPreLoad(xls.load(xls.diningCarMachine));
            this.addPreLoad(xls.load(xls.diningCarMaterials));
            this.curHold = new Laya.Image();
            this.curHold.visible = false;
            this.addChild(this.curHold);
            this.curHold.anchorX = this.curHold.anchorY = 0.5;
        }

        async onPreloadOver() {
            core.SoundManager.instance.playBgm('res/music/bgm/lalaLand.mp3');
            this.animation = new util.HashMap();
            this.creatCustomers();
            this.getMyNpc();
            this.initFood();
            this.initView();
            let msg = await clientCore.MedalManager.getMedal([MedalConst.DINING_CAR_FIRST]);
            this.isFirst = msg[0].value == 0;
            if (this.isFirst) {
                clientCore.ModuleManager.open("diningCarRule.DiningCarRuleModule", 1);
                clientCore.MedalManager.setMedal([{ id: MedalConst.DINING_CAR_FIRST, value: 1 }]);
            } else {
                this.startGame();
            }
            // clientCore.Logger.sendLog('2021年1月22日活动', '【活跃】花仙早餐车', '打开活动面板');
        }
        private startGame() {
            net.sendAndWait(new pb.cs_breakfast_car_do_business()).then(() => {
                this._gameRuning = true;
                this.creatCustomer();
            });
        }

        private initView() {
            this.labScore.text = "本次营业额：0";
            let arr = [3, 4, 5, 6, 11, 12, 13, 14];
            for (let i = 0; i < arr.length; i++) {
                this["boxLoad" + arr[i]].visible = false;
                if (arr[i] != 14) this["imgPlus" + arr[i]].visible = false;
                let info = this.machinesInfo.get(arr[i]);
                for (let j = 0; j < this["machine" + arr[i]].numChildren; j++) {
                    this["machine" + arr[i]].getChildAt(j).visible = j < info.curCnt;
                }
            }
            arr = [1, 2, 7, 15];
            for (let i = 0; i < arr.length; i++) {
                this["boxLoad" + arr[i]].visible = false;
            }
            this.imgMilk.visible = this.imgCoffee.visible = false;
        }

        private initFood() {
            this.imgTarget.visible = this.imgCoffee.visible = this.imgMilk.visible = false;
            this.imgTarget.dataSource = "";
            this.imgCoffee.dataSource = "";
            this.imgMilk.dataSource = "";
            this.machine14.dataSource = 0;
        }

        private creatMachine(info: MachineInfo[]) {
            this.machine15.visible = false;
            this.machinesInfo = new util.HashMap();
            for (let i: number = 0; i < info.length; i++) {
                this.machinesInfo.add(info[i].id, info[i]);
                if (info[i].id == 7 && info[i].cnt == 2) {//搅拌机两个
                    this.machine15.visible = true;
                    this.machinesInfo.add(15, info[i]);
                }
            }
        }

        /**向平底锅添加食材 */
        private async addMtrPan() {
            let id = this.curHold.dataSource;
            if (this.machine14.dataSource != 0 || id != 2010 || (this.machine14.getChildAt(0) as Laya.Image).visible) {
                this.onCancel();
                return;
            }
            this.machine14.dataSource = 2010;
            this.deleteFood();
            let ani = clientCore.BoneMgr.ins.play(`res/animate/diningCar/egg.sk`, 'egg', false, this.boxAni14);
            this.animation.add(14, ani);
            let time = this.machinesInfo.get(14).makeTime;
            console.log("平底锅制作时间：" + time);
            this.imgMask14.width = 0;
            this.boxLoad14.visible = true;
            Laya.Tween.to(this.imgMask14, { width: 113 }, time * 1000, null, Laya.Handler.create(this, () => {
                this.boxLoad14.visible = false;
                ani.dispose();
                this.animation.remove(14);
                this.machinesInfo.get(14).curCnt++;
                (this.machine14.getChildAt(0) as Laya.Image).visible = true;
                this.machine14.dataSource = 0;
                Laya.Tween.clearAll(this.imgMask14);
            }));
        }

        /**向搅拌机添加食材 */
        private async addMtrStir(index: number) {
            let id = this.curHold.dataSource;
            if (this["machine" + index].dataSource) {
                this.onCancel();
                return;
            }
            if (id != 2007 && id != 2004) {
                this.onCancel();
                return;
            }
            this["machine" + index].dataSource = id;
            this.deleteFood();
            let name = id == 2007 ? `strawberry` : `lettuce`;
            let ani = clientCore.BoneMgr.ins.play(`res/animate/diningCar/${name}.sk`, "mix " + name, false, this["boxAni" + index]);
            this.animation.add(index, ani);
            let time = this.machinesInfo.get(7).makeTime;
            this["imgMask" + index].width = 0;
            this["boxLoad" + index].visible = true;
            console.log("搅拌机制作时间：" + time);
            Laya.Tween.to(this["imgMask" + index], { width: 113 }, time * 1000, null, Laya.Handler.create(this, () => {
                this["boxLoad" + index].visible = false;
                ani.dispose();
                this.animation.remove(index);
                this["machine" + index].skin = id == 2007 ? "diningCarSell/zha_zhi_ji_1.png" : "diningCarSell/zha_zhi_ji_2.png";
                if (id == 2007) this["machine" + index].dataSource = 2001;
                else if (id == 2004) this["machine" + index].dataSource = 2002;
                Laya.Tween.clearAll(this["imgMask" + index]);
            }));
        }

        /**向食物添加食材 */
        private addMtrFood(food: Laya.Image) {
            if (food.dataSource.length >= 3) {
                this.onCancel();
                return;
            }
            let id: number = this.curHold.dataSource;
            if (food.dataSource == "" && id >= 2000) {
                this.onCancel();
                return;
            } if (food.dataSource.length == 1 && id < 2000) {
                this.onCancel();
                return;
            }
            if (id == 2010) {//生鸡蛋不是食材
                this.onCancel();
                return;
            }
            let temp = food.dataSource + id % 1000;
            let target = _.filter(xls.get(xls.diningCarFood).getKeys(), (o) => {
                for (let i: number = 0; i < temp.length; i++) {
                    if (o[i] != temp[i]) return false;
                }
                return true;
            })
            if (target.length > 0) {
                food.dataSource = temp;
                for (let i = temp.length; i < 3; i++) {
                    temp += "0";
                }
                core.SoundManager.instance.playSound('res/sound/stand.ogg');
                food.skin = `res/activity/diningCar/food/${temp}.png`;
                food.visible = true;
                this.deleteFood();
            } else {
                this.onCancel();
            }
        }

        /**取消操作 */
        private onCancel() {
            this.curHold.visible = false;
            this.curHold.dataSource = null;
            if (this.curHoldImg) {
                this.curHoldImg.visible = true;
                this.curHoldImg = null;
            }
        }

        /**删除当前食物 */
        private deleteFood() {
            this.curHold.visible = false;
            if (this.curHoldType == 'food') {
                this.curHoldImg.dataSource = "";
                this.curHoldImg.visible = false;
            } else if ([7, 15].includes(this.downMachine)) {
                this["machine" + this.downMachine].skin = "diningCarSell/zha_zhi_ji.png";
                this["machine" + this.downMachine].dataSource = 0;
            } else if ([3, 4, 5, 6, 11, 12, 13, 14].includes(this.downMachine)) {
                this.machinesInfo.get(this.downMachine).curCnt--;
                if (this.downMachine != 14 && this.machinesInfo.get(this.downMachine).curCnt == 0) {
                    this["imgPlus" + this.downMachine].visible = true;
                }
            }
        }
        //#region 交互
        private downMachine: number;
        /**当前持有的物品 */
        private curHold: Laya.Image;
        /**当前持有物品的原图 */
        private curHoldImg: Laya.Image;
        /**当前持有的物品的类型 */
        private curHoldType: 'food' | 'mtr';
        /**点击 */
        private onMouseDown(e: Laya.Event) {
            let arr = [3, 4, 5, 6, 11, 12, 13, 14];
            for (let i = 0; i < arr.length; i++) {
                if (this["machine" + arr[i]].hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                    let info = this.machinesInfo.get(arr[i]);
                    if (info.curCnt > 0) {
                        this.curHold.skin = `res/activity/diningCar/materials/${info.in_out[0].v2}.png`;
                        this.curHold.dataSource = info.in_out[0].v2;
                        let point = this.globalToLocal(new Laya.Point(e.currentTarget.mouseX, e.currentTarget.mouseY));
                        this.curHold.pos(point.x, point.y);
                        this.curHold.visible = true;
                        this.curHoldImg = this["machine" + arr[i]].getChildAt(info.curCnt - 1);
                        this.curHoldImg.visible = false;
                        this.downMachine = arr[i];
                        this.curHoldType = 'mtr';
                        this.addActEvent();
                        return;
                    } else {
                        return;
                    }
                }
            }
            arr = [8, 9, 10];
            for (let i = 0; i < arr.length; i++) {
                if (!this["machine" + arr[i]].visible) continue;
                if (this["machine" + arr[i]].hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                    let info = this.machinesInfo.get(arr[i]);
                    this.curHold.skin = `res/activity/diningCar/materials/${info.in_out[0].v2}.png`;
                    this.curHold.dataSource = info.in_out[0].v2;
                    let point = this.globalToLocal(new Laya.Point(e.currentTarget.mouseX, e.currentTarget.mouseY));
                    this.curHold.pos(point.x, point.y);
                    this.curHold.visible = true;
                    this.curHoldImg = null;
                    this.downMachine = arr[i];
                    this.curHoldType = 'mtr';
                    this.addActEvent();
                    return;
                }
            }
            arr = [7, 15];
            for (let i = 0; i < arr.length; i++) {
                if (!this["machine" + arr[i]].visible) continue;
                if (this["machine" + arr[i]].hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                    if (this["machine" + arr[i]].visible && (this["machine" + arr[i]].dataSource == 2001 || this["machine" + arr[i]].dataSource == 2002)) {
                        this.curHold.skin = `res/activity/diningCar/materials/${this["machine" + arr[i]].dataSource}.png`;
                        this.curHold.dataSource = this["machine" + arr[i]].dataSource;
                        let point = this.globalToLocal(new Laya.Point(e.currentTarget.mouseX, e.currentTarget.mouseY));
                        this.curHold.pos(point.x, point.y);
                        this.curHold.visible = true;
                        this.curHoldImg = null;
                        this.downMachine = arr[i];
                        this.curHoldType = 'mtr';
                        this.addActEvent();
                        return;
                    } else {
                        return;
                    }
                }
            }
            let arrImg = [this.imgTarget, this.imgMilk, this.imgCoffee];
            for (let i = 0; i < arrImg.length; i++) {
                if (arrImg[i].visible && arrImg[i].hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                    this.curHold.skin = arrImg[i].skin;
                    let name = arrImg[i].dataSource;
                    for (let i = name.length; i < 3; i++) {
                        name += "0";
                    }
                    this.curHold.dataSource = parseInt(name);
                    let point = this.globalToLocal(new Laya.Point(e.currentTarget.mouseX, e.currentTarget.mouseY));
                    this.curHold.pos(point.x, point.y);
                    this.curHold.visible = true;
                    this.curHoldImg = arrImg[i];
                    this.curHoldImg.visible = false;
                    this.downMachine = 0;
                    this.curHoldType = 'food';
                    this.addActEvent();
                    return;
                }
            }
        }

        private addActEvent() {
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }

        /**拖动 */
        private onMouseMove(e: Laya.Event) {
            let point = this.globalToLocal(new Laya.Point(e.currentTarget.mouseX, e.currentTarget.mouseY));
            this.curHold.pos(point.x, point.y);
        }

        /**移出范围了 */
        private onMouseOut() {
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            this.onCancel();
        }

        /**释放 */
        private onMouseUp(e: Laya.Event) {
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_OUT, this, this.onMouseOut);
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            if (this.curHoldType == 'food' && e.currentTarget.mouseY < 340) {
                //检查顾客
                if (this.checkCustomer(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                    this.deleteFood();
                    return;
                } else {
                    this.onCancel();
                    return;
                }
            } else if (this.curHoldType == 'mtr') {
                //检查料理台
                if (this.imgTarget.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                    this.addMtrFood(this.imgTarget);
                    return;
                };
                if ([3, 5].includes(this.downMachine)) {//草莓和生菜可以打酱
                    if (this.machine7.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                        this.addMtrStir(7);
                        return;
                    } else if (this.machine15.visible && this.machine15.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                        this.addMtrStir(15);
                        return;
                    }
                }
                if ([8, 9, 10].includes(this.downMachine)) {//奶油、糖、巧克力可以做饮料
                    //检查两种饮料
                    if (this.imgMilk.visible && this.imgMilk.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                        this.addMtrFood(this.imgMilk);
                        return;
                    } else if (this.imgCoffee.visible && this.imgCoffee.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                        this.addMtrFood(this.imgCoffee);
                        return;
                    } else {
                        this.onCancel();
                        return;
                    }
                }
                if (this.downMachine == 4 && this.machine14.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {//鸡蛋检查平底锅
                    this.addMtrPan();
                    return;
                }
            }
            //检查垃圾箱
            if (this.imgDelete.hitTestPoint(e.currentTarget.mouseX, e.currentTarget.mouseY)) {
                this.deleteFood();
                return;
            }
            this.onCancel();
        }

        /**检查顾客 */
        private checkCustomer(x: number, y: number) {
            if (!this.curCustom) return false;
            for (let i: number = 0; i < 3; i++) {
                if (!this.curCustom.get(i)?.visible) continue;
                if (this.curCustom.get(i).hitTestPoint(x, y) && this.curCustom.get(i).giveFood(this.curHold.dataSource) >= 0) {
                    return true;
                }
            }
            return false;
        }


        //#endregion

        private onPause() {
            alert.showSmall('退出后不能获得任何奖励，确认退出吗？', { callBack: { caller: this, funArr: [this.sureClose, this.continue] } });
        }

        private sureClose() {
            this._gameRuning = false;
            clientCore.ToolTip.gotoMod(227);
        }

        private continue() {
            this._gameRuning = true;
        }

        /**每秒刷新 */
        private onTimer() {
            if (this._gameRuning) {
                this.time -= 1;
                this.labTime.text = "倒计时：" + this.time + "秒";
                if (this.time == 0) {
                    this.gameOver();
                }
                if (this.waitNext) {
                    this.customerCd -= 1;
                    if (this.customerCd <= 0) {
                        this.creatCustomer();
                    }
                }
                for (let i: number = 0; i < this.onWaitNpc.length;) {
                    if (this.onWaitNpc[i].end <= 1) {
                        this.canUseNpc.push(this.onWaitNpc[i].id);
                        this.onWaitNpc.splice(i, 1);
                    } else {
                        this.onWaitNpc[i].end--;
                        i++;
                    }
                }
            }
        }

        /**经营结束 */
        private async gameOver() {
            this._gameRuning = false;
            BC.removeEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            net.sendAndWait(new pb.cs_breakfast_car_turnover_settlement()).then((data: pb.sc_breakfast_car_turnover_settlement) => {
                if (data.items.length == 0) {
                    alert.showFWords('经营结束，本次未获得奖励~');
                    this.sureClose();
                    return;
                }
                alert.showReward(clientCore.GoodsInfo.createArray(data.items), '', {
                    vipAddPercent: 0, callBack: {
                        caller: this, funArr: [() => {
                            this.sureClose();
                        }]
                    }
                });
            });
        }

        /**补充材料 */
        private addMtr(id: number) {
            this["imgPlus" + id].visible = false;
            let info = this.machinesInfo.get(id);
            if (info.curCnt > 0) return;
            this["imgPlus" + id].visible = false;
            let time = info.makeTime;
            this["imgMask" + id].width = 0;
            this["boxLoad" + id].visible = true;
            console.log(`机器id:${id}的制作时间：${time}`);
            Laya.Tween.to(this["imgMask" + id], { width: 113 }, time * 1000, null, Laya.Handler.create(this, () => {
                info.curCnt = info.makeCnt;
                this["boxLoad" + id].visible = false;
                for (let i = 0; i < info.curCnt; i++) {
                    this["machine" + id].getChildAt(i).visible = true;
                }
                Laya.Tween.clearAll(this["imgMask" + id]);
            }));
        }

        /**制作牛奶 */
        private async creatMilk() {
            if (this.imgMilk.visible) return;
            if (this.imgMilk.dataSource != "") return;
            this.imgMilk.dataSource = "4";
            this.imgMilk.skin = `res/activity/diningCar/food/400.png`;
            let ani = clientCore.BoneMgr.ins.play(`res/animate/diningCar/milk.sk`, 'milk', false, this.boxAni1);
            this.animation.add(1, ani);
            let time = this.machinesInfo.get(1).makeTime;
            this.imgMask1.width = 0;
            this.boxLoad1.visible = true;
            console.log("牛奶制作时间：" + time);
            Laya.Tween.to(this.imgMask1, { width: 113 }, time * 1000, null, Laya.Handler.create(this, () => {
                this.boxLoad1.visible = false;
                ani.dispose();
                this.animation.remove(1);
                this.imgMilk.visible = true;
                Laya.Tween.clearAll(this.imgMask1);
            }));
        }

        /**制作咖啡 */
        private async creatCoffee() {
            if (this.imgCoffee.visible) return;
            if (this.imgCoffee.dataSource != "") return;
            this.imgCoffee.dataSource = "5";
            this.imgCoffee.skin = `res/activity/diningCar/food/500.png`;
            let ani = clientCore.BoneMgr.ins.play(`res/animate/diningCar/coffee.sk`, 'coffee', false, this.boxAni2);
            this.animation.add(2, ani);
            let time = this.machinesInfo.get(2).makeTime;
            this.imgMask2.width = 0;
            this.boxLoad2.visible = true;
            console.log("咖啡制作时间：" + time);
            Laya.Tween.to(this.imgMask2, { width: 113 }, time * 1000, null, Laya.Handler.create(this, () => {
                this.boxLoad2.visible = false;
                ani.dispose();
                this.animation.remove(2);
                this.imgCoffee.visible = true;
                Laya.Tween.clearAll(this.imgMask2);
            }));
        }

        //#region 顾客相关
        private curCustom: util.HashMap<Customer>;
        private finishCnt: number = 0;
        private waitNext: boolean = false;
        private customerCd: number;
        private curCoin: number = 0;
        /**等候cd的npc */
        public onWaitNpc: { id: number, end: number }[];
        /**可入场npc */
        public canUseNpc: number[];
        /**生成一个顾客 */
        private creatCustomer() {
            if (this.finishCnt >= this.customerCnt) return;
            if (!this.waitNext) this.waitNext = true;
            if (this.customerCd > 0) return;
            this.waitNext = false;
            this.customerCd = this.customerCdInfo;
            let pos = this.getCanUsePos();
            if (pos < 0) return;
            let customer = this.curCustom.get(pos);
            net.sendAndWait(new pb.cs_breakfast_car_guest_order_food({ pos: pos })).then((msg: pb.sc_breakfast_car_guest_order_food) => {
                customer.endTime = msg.endTime;
                customer.needFood = msg.food;
                customer.waitTime = this.customerTime[msg.food.length - 1];
                customer.show();
                this.finishCnt = msg.guests;
                this.creatCustomer();
            });
        }

        /**获取一个空位 */
        private getCanUsePos() {
            let limit = this.finishCnt >= 4 ? 3 : 2;
            for (let i: number = 0; i < limit; i++) {
                if (!this.curCustom.get(i).visible) {
                    return i;
                }
            }
            return -1;
        }

        /**预设所有顾客 */
        private creatCustomers() {
            this.curCustom = new util.HashMap();
            for (let i: number = 0; i < 3; i++) {
                let customer: Customer = new Customer();
                this.addChildAt(customer, 0);
                customer.visible = false;
                customer.setNpc(this.getNextNpc());
                customer.pos(i * 325 + 300, 100);
                customer.posIdx = i;
                this.curCustom.add(i, customer);
            }
        }

        /**是否还有在等餐的顾客 */
        private isFinish() {
            for (let i: number = 0; i < 3; i++) {
                if (this.curCustom.get(i).visible) {
                    return false;
                }
            }
            return true;
        }

        /**获得营业额 */
        private getCoin(num: number, pos: number, npc: number) {
            this.curCustom.get(pos).setNpc(this.getNextNpc());
            this.onWaitNpc.push({ id: npc, end: 5 });
            this.curCoin += num;
            this.labScore.text = "本次营业额：" + this.curCoin;
            if (this.isFinish() && this.finishCnt >= this.customerCnt) {
                this.gameOver();
                return;
            } else if (this.finishCnt < this.customerCnt) {
                this.creatCustomer();
            }
        }

        /**获取所有npc */
        private getMyNpc() {
            this.canUseNpc = [];
            this.onWaitNpc = [];
            for (let i = 1410001; i <= 1410016; i++) {
                this.canUseNpc.push(i);
            }
        }

        /**获取预备入场的npc 返回的是npcid*/
        public getNextNpc(): number {
            if (!this.canUseNpc) this.getMyNpc();
            if (this.canUseNpc.length > 0) {
                let idx = Math.floor(Math.random() * this.canUseNpc.length);
                let npc = this.canUseNpc[idx];
                this.canUseNpc.splice(idx, 1);
                return npc;
            }
            return 0;
        }


        //#endregion

        addEventListeners() {
            let arr = [3, 4, 5, 6, 11, 12, 13];
            for (let i = 0; i < arr.length; i++) {
                BC.addEvent(this, this["imgPlus" + arr[i]], Laya.Event.CLICK, this, this.addMtr, [arr[i]]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onPause);
            BC.addEvent(this, this.machine1, Laya.Event.CLICK, this, this.creatMilk);
            BC.addEvent(this, this.machine2, Laya.Event.CLICK, this, this.creatCoffee);
            BC.addEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            EventManager.on("DININGCAR_GET_COIN", this, this.getCoin);
            EventManager.on("DINING_CAR_SELL_START", this, this.startGame);
            EventManager.on("DINING_CAR_RULE_CLOSE", this, this.startGame);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("DININGCAR_GET_COIN", this, this.getCoin);
            EventManager.off("DINING_CAR_SELL_START", this, this.startGame);
            EventManager.off("DINING_CAR_RULE_CLOSE", this, this.startGame);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            core.SoundManager.instance.recover();
            let arr = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15];
            for (let i = 0; i < arr.length; i++) {
                Laya.Tween.clearAll(this["imgMask" + arr[i]]);
            }
            for (let i: number = 0; i < this.animation.length; i++) {
                this.animation.getValues()[i].dispose();
            }
            for (let i: number = 0; i < this.curCustom.length; i++) {
                this.curCustom.getValues()[i]?.destroy();
            }
            this.curCustom.clear();
            this.animation.clear();
            this.machinesInfo.clear();
            this.curHold?.destroy();
            this.curHold = null;
            super.destroy();
        }
    }
}