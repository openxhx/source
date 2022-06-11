namespace restaurant {
    export class RestaurantModule extends ui.restaurant.RestaurantModuleUI {
        private _model: RestaurantModel;
        private _control: RestaurantControl;
        //子面板
        private detailPanel: RestaurantDetailPanel;
        private newsPanel: RestaurantNewsPanel;
        private upfoodPanel: RestaurantUpfoodPanel;
        private sharePanel: RestaurantSharePanel;
        private rulePanel: RestaurantRulePanel;
        //就餐数据
        private usedSeat: number[];
        private tWaitNpc: Customer;
        private npcPool: Customer[];
        /**离线奖励*/
        private offReward: pb.IItem[];
        //动画
        private aniShare: clientCore.Bone;
        //桌椅位置
        private seatPos: xls.pair[] = [{ v1: 330, v2: 520 }, { v1: 480, v2: 620 }, { v1: 630, v2: 520 }, { v1: 780, v2: 620 }, { v1: 930, v2: 520 }];
        private tableLock: util.HashMap<ui.restaurant.render.LockItemUI>;
        //第一次打开
        private firshOpen: number;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new RestaurantModel(), new RestaurantControl());
            this._control = clientCore.CManager.getControl(this.sign) as RestaurantControl;
            this._model = clientCore.CManager.getModel(this.sign) as RestaurantModel;
            this.addPreLoad(xls.load(xls.diningLevelUp));
            this.addPreLoad(xls.load(xls.diningBase));
            this.addPreLoad(xls.load(xls.diningDecoration));
            this.addPreLoad(xls.load(xls.diningHearsay));
            this.addPreLoad(xls.load(xls.diningRecipe));
            this.addPreLoad(this.getBaseInfo());
            this.addPreLoad(res.load("res/animate/restaurant/ui.png"));
            this.detailPanel = new RestaurantDetailPanel(this.sign);
            this.newsPanel = new RestaurantNewsPanel();
            this.upfoodPanel = new RestaurantUpfoodPanel(this.sign);
            this.sharePanel = new RestaurantSharePanel(this.sign);
            this.rulePanel = new RestaurantRulePanel();
            this.listFood.renderHandler = new Laya.Handler(this, this.foodRender);
            this.listFood.mouseHandler = new Laya.Handler(this, this.foodClick);
        }

        /**获取餐厅数据 */
        private async getBaseInfo() {
            let msg = await this._control.enterRestaurant();
            this._model.curFood = msg.fPos;
            this._model.curLevel = msg.level;
            this._model.curPoint = msg.scores;
            this._model.curCreatNum = msg.cookbooks;
            this._model.curMakeNum = msg.cookingCnt;
            this._model.cleanPoint = msg.cleanliness;
            this._model.curShareCntN = msg.nCnt;
            this._model.curShareCntH = msg.hCnt;
            this._model.shareEndTimeN = msg.nTime;
            this._model.shareEndTimeH = msg.hTime;
            this.offReward = msg.items;
            clientCore.NpcNewsManager.ins.totalNews = clientCore.NpcNewsManager.ins.totalNews.concat(msg.tidbitIds);
            clientCore.NpcNewsManager.ins.unreadNews = clientCore.NpcNewsManager.ins.unreadNews.concat(msg.tidbitIds);
            if (msg.theme == 0) {
                this._model.curSkin = 4400001;
            } else {
                this._model.curSkin = msg.theme;
            }
            let skin = await this._control.getSkin();
            this._model.haveSkin = skin.themes;
            let medal = await clientCore.MedalManager.getMedal([MedalConst.RESTAURANT_FIRST_OPEN]);
            this.firshOpen = medal[0].value;
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年9月18日活动', '花灵餐厅', '进入餐厅');
            this.sharePanel.init();
            this.usedSeat = [];
            this.npcPool = [];
            this.listFood.array = [1, 2, 3, 4, 5];
            this._model.getMyNpc();
            this._model.onShareChange();
            this._model.curCleanCd = this._model.getCleanCd();
            this.setLevelUI();
            this.setGarbage();
            this.setSkinUI();
            this.setTableLock();
            if (this._model.shareEndTimeH > clientCore.ServerManager.curServerTime || this._model.shareEndTimeN > clientCore.ServerManager.curServerTime)
                this.showShareAni();
            Laya.timer.loop(1000, this, this.secondDo);
            this.showOffReward();
            this.judgeStatus();
        }

        popupOver() {
            if (this.firshOpen == 0) {
                this.showRule();
                clientCore.MedalManager.setMedal([{ id: MedalConst.RESTAURANT_FIRST_OPEN, value: 1 }]);
            }
        }

        async showOffReward() {
            await util.TimeUtil.awaitTime(1000);
            if (this.offReward && this.offReward.length > 0) alert.showReward(this.offReward);
            this.offReward = null;
        }

        /**秒级刷新 */
        private secondDo() {
            if (this._model.curInCd == 1) {
                this._model.curInCd = 0;
                this.customerIn();
            } else if (this._model.curInCd > 1) {
                this._model.curInCd--;
            }

            for (let i: number = 0; i < this._model.onWaitNpc.length;) {
                if (this._model.onWaitNpc[i].end <= 1) {
                    this._model.canUseNpc.push(this._model.onWaitNpc.splice(i, 1)[0].id);
                    if (!this.tWaitNpc) {
                        this.getWaitNpc();
                        this.customerIn();
                    }
                } else {
                    this._model.onWaitNpc[i].end--;
                    i++;
                }
            }

            if ((this._model.shareEndTimeH != 0 && this._model.shareEndTimeH <= clientCore.ServerManager.curServerTime) || (this._model.shareEndTimeN != 0 && this._model.shareEndTimeN <= clientCore.ServerManager.curServerTime)) {
                this._model.shareEndTimeH = 0;
                this._model.shareEndTimeN = 0;
                this._model.onShareChange();
                if (this.aniShare) this.aniShare.visible = false;
                this.btnXuanchuan.skin = "restaurant/btn_xuanchuan.png";
            }
        }

        //#region UI相关
        /**装扮信息 */
        private setSkinUI() {
            let skin = this._model.curSkin;
            clientCore.ModuleManager.changeBgSkin("bg" + skin);
            this.imgMask.skin = "res/restaurantSkin/bg/" + skin + ".png";
            let xlsData = xls.get(xls.diningDecoration).get(skin).offset;
            for (let i: number = 1; i <= 5; i++) {
                this["table" + i].skin = "res/restaurantSkin/table/" + skin + ".png";
                this["table" + i].pos(this.seatPos[i - 1].v1 - 64, this.seatPos[i - 1].v2 - 427);
                this["table" + i].pivotX = xlsData[0].v1;
                this["table" + i].pivotY = xlsData[0].v2;
                this["chair" + i].skin = "res/restaurantSkin/chair/" + skin + ".png";
                this["chair" + i].pivotX = xlsData[1].v1;
                this["chair" + i].pivotY = xlsData[1].v2;
                this["chair" + i].x = this["table" + i].x + xlsData[3].v1;
                this["chair" + i].y = this["table" + i].y + xlsData[3].v2;
            }
            this.chair1.zOrder = this.chair3.zOrder = this.chair5.zOrder = 1;
            this.table1.zOrder = this.table3.zOrder = this.table3.zOrder = 2;
            this.chair2.zOrder = this.chair4.zOrder = 6;
            this.table2.zOrder = this.table4.zOrder = 7;
        }

        /**餐厅信息 */
        private setLevelUI() {
            if (!this._model) this._model = clientCore.CManager.getModel(this.sign) as RestaurantModel;
            this.labLvl.text = "餐厅等级:" + this._model.curLevel;
            let pointTarget = xls.get(xls.diningLevelUp).get(this._model.curLevel).upgradIntegral;
            if (pointTarget == 0) {
                this.labPoint.text = "本级美味币:已满级";
            } else {
                this.labPoint.text = "本级美味币:" + this._model.curPoint + "/" + pointTarget;
            }
            this.imgLvlRed.visible = this._model.checkCanLevelUp();
        }

        /**设置餐桌解锁情况 */
        private setTableLock() {
            if (!this.tableLock) this.tableLock = new util.HashMap();
            let total = xls.get(xls.diningLevelUp).get(this._model.curLevel).seat;
            for (let i = 1; i <= 5; i++) {
                if (i <= total && this.tableLock.has(i)) {
                    let item = this.tableLock.remove(i);
                    item.destroy();
                } else if (i > total && !this.tableLock.has(i)) {
                    let item = new ui.restaurant.render.LockItemUI();
                    let limit = _.find(xls.get(xls.diningLevelUp).getValues(), (o) => { return o.seat == i }).level;
                    item.limit.text = limit + "级";
                    this.boxEat.addChild(item);
                    item.zOrder = i % 2 == 0 ? 8 : 3;
                    item.pos(this.seatPos[i - 1].v1 - 114, this.seatPos[i - 1].v2 - 457);
                    this.tableLock.add(i, item);
                }
            }
        }

        /**上架区UI */
        private foodRender(item: ui.restaurant.render.OnsellFoodRenderUI, idx: number) {
            let limit = _.find(xls.get(xls.diningLevelUp).getValues(), (o) => { return o.exhibition == idx + 1 });
            item.bg.visible = true;
            if (this._model.curLevel < limit.level) {
                item.lockLvl.text = limit.level + "级";
                item.boxLock.visible = true;
                item.imgAdd.visible = item.icon.visible = item.num.visible = false;
            } else {
                item.boxLock.visible = false;
                let food = _.find(this._model.curFood, (o) => { return o.foodPos == idx + 1 });
                if (food.foodId && food.counts > 0) {
                    item.bg.visible = false;
                    item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(food.foodId);
                    item.num.value = food.counts.toString();
                    item.icon.visible = item.num.visible = true;
                    item.imgAdd.visible = false;
                } else {
                    item.icon.visible = item.num.visible = false;
                    item.imgAdd.visible = !(this._model.onEatPos?.includes(idx + 1));
                }
            }
        }

        /**上架区点击 */
        private foodClick(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.mouseY < 121) {
                if ((this.listFood.getCell(idx) as any).imgAdd.visible) {
                    this.upfoodPanel.show(idx + 1, this._model.curLevel);
                }
            }
        }
        /**当前垃圾数量 */
        private curGarbageNum: number;
        /**当前点击的垃圾 */
        private curClickGbg: number;
        /**根据清洁度出现垃圾 */
        private setGarbage() {
            let config: xls.triple[] = xls.get(xls.diningBase).get(1).clean;
            let count = _.last(config).v2;
            for (let i: number = 0; i < config.length - 1; i++) {
                if (this._model.cleanPoint <= config[i].v1 && this._model.cleanPoint > config[i + 1].v1) {
                    count = config[i].v2;
                    break;
                }
            }
            this.curGarbageNum = count;
            for (let j: number = 1; j <= 6; j++) {
                this["gbg_" + j].visible = false;
            }
            let temp = [];
            for (let i: number = 1; i <= count;) {
                let random = Math.floor(Math.random() * 6 + 1);
                if (temp.includes(random)) {
                    continue;
                } else {
                    this["gbg_" + random].visible = true;
                    temp.push(random);
                    i++;
                }
            }
        }

        /**刷新垃圾 */
        private refreshGarbage() {
            let config: xls.triple[] = xls.get(xls.diningBase).get(1).clean;
            let count = _.last(config).v2;
            for (let i: number = 0; i < config.length - 1; i++) {
                if (this._model.cleanPoint <= config[i].v1 && this._model.cleanPoint > config[i + 1].v1) {
                    count = config[i].v2;
                    break;
                }
            }
            if (this.curGarbageNum > count) {
                if (this.curClickGbg > 0) {
                    this["gbg_" + this.curClickGbg].visible = false;
                }
                this.curGarbageNum--;
                let arr = _.filter([1, 2, 3, 4, 5, 6], (o) => { return this["gbg_" + o].visible == true });
                for (let i: number = count; i < this.curGarbageNum; i++) {
                    let idx = Math.floor(Math.random() * arr.length);
                    this["gbg_" + arr[idx]].visible = false;
                    arr.splice(idx, 1);
                }
            } else {
                let arr = _.filter([1, 2, 3, 4, 5, 6], (o) => { return this["gbg_" + o].visible == false });
                for (let i: number = this.curGarbageNum; i < count; i++) {
                    let idx = Math.floor(Math.random() * arr.length);
                    this["gbg_" + arr[idx]].visible = true;
                    arr.splice(idx, 1);
                }
            }
            this.curGarbageNum = count;
            this.curClickGbg = 0;
        }
        //#endregion

        /**判断餐厅状态 */
        private judgeStatus() {
            if (this._model.curInCd > 0) return;
            //是否有足够的菜
            let dishNum = 0;
            for (let i: number = 0; i < this._model.curFood.length; i++) {
                dishNum += this._model.curFood[i].counts;
            }
            let haveDish = dishNum > this._model.inNoSeatNum;
            //是否有空位
            let haveSeat = this.getCanUseSeat() > 0;
            //满足两个条件
            //开始计算cd
            if (haveDish && haveSeat && this._model.curInCd == 0) {
                this._model.setInCd();
            }
            //生成待机顾客
            if (!this.tWaitNpc) this.getWaitNpc();
        }

        /**顾客入场 */
        private customerIn() {
            if (this._model.curInCd > 0) return;
            if (!this.tWaitNpc) return;
            let seat = this.getCanUseSeat();
            if (seat == 0) return;
            this.usedSeat.push(seat);
            this.tWaitNpc.visible = true;
            this.tWaitNpc.goEat(seat);
            this.tWaitNpc = null;
            this._model.inNoSeatNum++;
            this.judgeStatus();
        }

        /**获取一个待机顾客 */
        private getWaitNpc() {
            let id = this._model.getNextNpc();
            if (id > 0) {
                this.tWaitNpc = this.getCustomer();
                this.tWaitNpc.setData(id);
            }
        }

        /**获取一个顾客对象 */
        private getCustomer() {
            if (!this.npcPool) this.npcPool = [];
            let customer: Customer;
            for (let i: number = 0; i < this.npcPool.length; i++) {
                if (this.npcPool[i].visible == false) {
                    customer = this.npcPool[i];
                    break;
                }
            }
            if (!customer) {
                customer = new Customer(this.sign);
                this.boxEat.addChild(customer);
                this.npcPool.push(customer);
                customer.visible = false;
            }
            return customer;
        }

        /**获取空的座位 */
        private getCanUseSeat() {
            let total = xls.get(xls.diningLevelUp).get(this._model.curLevel).seat;
            for (let i: number = 1; i <= total; i++) {
                if (this.usedSeat.includes(i)) continue;
                else return i;
            }
            return 0;
        }

        /**打开厨房 */
        private openKitchen() {
            clientCore.ModuleManager.open("kitchen.KitchenModule", this._model.curLevel);
        }

        /**打开商店 */
        private goShopping() {
            clientCore.ModuleManager.open("familyTailor.FamilyTailorModule", { type: 2, lv: this._model.curLevel });
            // clientCore.ModuleManager.closeAllOpenModule();
            // clientCore.ModuleManager.open("commonShop.CommonShopModule", 7, { openWhenClose: "restaurant.RestaurantModule" });
            // clientCore.ModuleManager.open("commonShop.CommonShopModule", 7);
        }

        /**进行宣传 */
        private xuanchuan() {
            this.sharePanel.show();
        }

        /**查看趣闻 */
        private openNews() {
            this.newsPanel.show();
        }

        /**查看餐厅详情 */
        private openDetial() {
            this.detailPanel.show();
        }

        /**当厨房打开关闭时候 */
        private onKitchenChange(flag: boolean) {
            this.visible = flag;
            if (flag) {
                clientCore.ModuleManager.changeBgSkin("bg" + this._model.curSkin);
            }
        }

        /**食物上架返回 */
        private onFoodSell(data: { foodPos: number, foodId: number, counts: number }) {
            let local = _.find(this._model.curFood, (o) => { return o.foodPos == data.foodPos });
            local.foodId = data.foodId;
            local.counts = data.counts;
            this.listFood.refresh();
            this.judgeStatus();
        }

        /**清理垃圾 */
        private clean(point: number) {
            net.sendAndWait(new pb.cs_clean_restaurant()).then((msg: pb.sc_clean_restaurant) => {
                this.curClickGbg = point;
                this._model.cleanPoint = msg.cleanliness;
                this._model.curPoint = msg.scores;
                this.setLevelUI();
                this._model.onCleanPointChange();
                alert.showReward(msg.items);
            });
        }

        /**宣传返回 */
        private onShareBack() {
            this.showShareAni();
            this._model.onShareChange();
        }

        /**显示宣传动画 */
        private showShareAni() {
            if (!this.aniShare) {
                this.aniShare = clientCore.BoneMgr.ins.play("res/animate/restaurant/ui.sk", "animation", true, this);
                this.aniShare.pos(this.btnXuanchuan.x + 30, this.btnXuanchuan.y + 50);
            }
            this.aniShare.visible = true;
            this.btnXuanchuan.skin = "";
        }

        /**顾客叫餐 */
        private onCallFood(seat: number, food: number) {
            this.listFood.refresh();
            let img = this.getFoodImage();
            if (seat % 2 == 0) {
                img.zOrder = 8;
            } else {
                img.zOrder = 3;
            }
            img.dataSource = seat;
            img.skin = clientCore.ItemsInfo.getItemIconUrl(food);
            img.pos(this["table" + seat].x + 10, this["table" + seat].y);
            img.visible = true;
        }
        //食物图标
        private foodImgPool: Laya.Image[];
        private getFoodImage() {
            if (!this.foodImgPool) this.foodImgPool = [];
            for (let i: number = 0; i < this.foodImgPool.length; i++) {
                if (!this.foodImgPool[i].visible) return this.foodImgPool[i];
            }
            let img = new Laya.Image();
            this.foodImgPool.push(img);
            img.visible = false;
            this.boxEat.addChild(img);
            img.anchorX = img.anchorY = 0.5;
            img.width = 60;
            img.height = 60;
            return img;
        }

        /**顾客结账完毕 */
        private customerEatOver(seat: number) {
            this.setLevelUI();
            this.listFood.refresh();
            for (let i: number = 0; i < this.foodImgPool.length; i++) {
                if (this.foodImgPool[i].dataSource == seat) this.foodImgPool[i].visible = false;
            }
            _.remove(this.usedSeat, (o) => { return o == seat });
            this.judgeStatus();
        }

        /**餐厅升级返回 */
        private onLevelUp() {
            this.setLevelUI();
            this.setTableLock();
            this.listFood.refresh();
            this.judgeStatus();
        }

        /**显示规则面板 */
        private showRule() {
            clientCore.DialogMgr.ins.open(this.rulePanel);
        }

        /**食物制作数据变化 0:新食谱，1:制作数量*/
        private addCookCount(type: number, count: number) {
            if (type == 0) {
                this._model.curCreatNum++;
            } else if (type == 1) {
                this._model.curMakeNum += count;
            }
        }



        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnKitchen, Laya.Event.CLICK, this, this.openKitchen);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.goShopping);
            BC.addEvent(this, this.btnXuanchuan, Laya.Event.CLICK, this, this.xuanchuan);
            BC.addEvent(this, this.btnNews, Laya.Event.CLICK, this, this.openNews);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.openDetial);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            for (let i: number = 1; i <= 6; i++) {
                BC.addEvent(this, this["gbg_" + i], Laya.Event.CLICK, this, this.clean, [i]);
            }
            EventManager.on("SHARE_RESTAURANT_BACK", this, this.onShareBack);
            EventManager.on("ON_RESTAURANT_SKIN_CHANGE", this, this.setSkinUI);
            EventManager.on("ON_KITCHEN_OPEN_CLOSE", this, this.onKitchenChange);
            EventManager.on("SET_FOOD_SELL", this, this.onFoodSell);
            EventManager.on("REFRESH_LEVEL_INFO", this, this.setLevelUI);
            EventManager.on("CUSTOMER_CALL_FOOD", this, this.onCallFood);
            EventManager.on("CUSTOMER_EAT_OVER", this, this.customerEatOver);
            EventManager.on("ON_RESTAURANT_LEVEL_UP", this, this.onLevelUp);
            EventManager.on("ADD_COOK_COUNT", this, this.addCookCount);
            EventManager.on("FREASH_GARBAGE", this, this.refreshGarbage);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.offAllCaller(this);
        }

        destroy() {
            for (let i: number = 0; i < this.npcPool.length; i++) {
                this.npcPool[i].destroy();
            }
            this.npcPool = null;
            this.tWaitNpc = null;
            if (this.foodImgPool) {
                for (let i: number = 0; i < this.foodImgPool.length; i++) {
                    this.foodImgPool[i].destroy();
                }
                this.foodImgPool = null;
            }
            Laya.timer.clear(this, this.secondDo);
            if (this.tableLock?.length > 0) {
                for (let i: number = 0; i < this.tableLock.getValues().length; i++) {
                    this.tableLock.getValues()[i].destroy();
                }
            }
            this.aniShare?.dispose();
            this.aniShare = null;
            this.tableLock.clear();
            this.tableLock = null;
            this._control.outRestaurant();
            this.offReward = null;
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            this.detailPanel?.destroyData();
            this.newsPanel?.destroyData();
            this.upfoodPanel?.destroyData();
            this.sharePanel?.destroyData();
            this.detailPanel = this.newsPanel = this.upfoodPanel = this.sharePanel = null;
            super.destroy();
        }
    }
}