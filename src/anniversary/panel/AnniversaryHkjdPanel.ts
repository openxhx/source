namespace anniversary {
    export class AnniversaryHkjdPanel extends ui.anniversary.panel.AnniversaryHkjdPanelUI {
        private readonly suitIds: number[] = [2110029, 2100207, 2100208, 2110014, 2100212, 2100217];
        private readonly coinId: number = 1511008;
        private readonly giftIds: number[] = [2175, 2176, 2178, 2179, 2180];
        private readonly stageId: number = 1100006;
        private readonly bgshowId: number = 1000010;
        private _control: AnniversaryControl;
        private _model: AnniversaryModel;

        private _t: time.GTime;

        private limitInfo: pb.sc_year_of_flower_love_stream_get_bg_limit;
        private tagInfo: any[] = [{ name: "星梦庆典", open: false }, { name: "猫咪贵族", open: false }, { name: "守望灯塔", open: false }, { name: "tag_yyzd", open: true }, { name: "tag_ydsq", open: false }];
        constructor(sign: number) {
            super();
            this.addEventListeners();
            this.buyCarPanel = new AnniversaryCarPanel(sign);
            this._model = clientCore.CManager.getModel(sign) as AnniversaryModel;
            this._control = clientCore.CManager.getControl(sign) as AnniversaryControl;
            this.initUI();
        }

        private initUI() {
            this.imgFemaleYyzd.visible = this.imgFemaleMhhx.visible = this.imgFemaleSyr.visible = this.imgFemale.visible = this.boxFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMaleYyzd.visible = this.imgMaleMhhx.visible = this.imgMaleSyr.visible = this.imgMale.visible = this.boxMale.visible = clientCore.LocalInfo.sex == 2;
            this.listTag.renderHandler = new Laya.Handler(this, this.tagRender);
            this.listTag.selectEnable = true;
            this.listTag.selectHandler = new Laya.Handler(this, this.tagMouse);
            this.listTag.repeatY = this.tagInfo.length;
            this.listTag.array = this.tagInfo;
            this.listBuyInfo.renderHandler = new Laya.Handler(this, this.infoRender);
            this.listBuyInfo.vScrollBarSkin = "";
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.6, 0.6);
            this._person.x = 150;
            this._person.y = 210;
            this.boxImage.addChild(this._person);
            this.clothBuyIds = [];
            for (let i: number = 2200; i <= 2223; i++) {
                this.clothBuyIds.push(i);
            }
            this.listGoods.vScrollBarSkin = "";
            this.listGoods.renderHandler = new Laya.Handler(this, this.goodsRender);
            this.listGoods.mouseHandler = new Laya.Handler(this, this.goodsMouse);
            this.box1.visible = false;
            this.box0.visible = false;
            this.box2.visible = false;
            this.box3.visible = true;
            this.box4.visible = false;
        }

        private infoRender(item: ui.anniversary.render.BuyInfoRenderUI) {
            let data: pb.YFLSTopCloudBuyHistory = item.dataSource;
            if (data.nick.length > 6) {
                item.labName.text = data.nick.slice(0, 4) + "..";
            } else {
                item.labName.text = data.nick;
            }
            if (data.discount == 1) {
                item.laboff.text = "【一折】";
            } else if (data.discount == 3) {
                item.laboff.text = "【三折】";
            } else if (data.discount == 5) {
                item.laboff.text = "【五折】";
            } else if (data.discount == 7) {
                item.laboff.text = "【七折】";
            } else if (data.discount == 9) {
                item.laboff.text = "【九折】";
            }
        }

        private tagRender(item: ui.anniversary.render.TagRenderUI) {
            item.imgName.skin = `anniversary/${item.dataSource.name}.png`;
            item.imgSelect.visible = item.dataSource.open;
            if (item.dataSource.name == "守望灯塔") {
                item.imgRed.visible = util.RedPoint.checkShow([11805]);
            }
        }

        private tagMouse(index: number) {
            for (let i: number = 0; i < this.tagInfo.length; i++) {
                this.tagInfo[i].open = false;
            }
            this.tagInfo[index].open = true;
            this.listTag.refresh();
            this.box0.visible = index == 0;
            this.box1.visible = index == 1;
            this.box2.visible = index == 2;
            this.box3.visible = index == 3;
            this.box4.visible = index == 4;
            this.sendData();
        }

        public onShow() {
            this.sendData();
            clientCore.UIManager.setMoneyIds([this.coinId]);
            clientCore.UIManager.showCoinBox();
            this.setUI();
        }

        private async setUI() {
            this.setXmqdUI();
            this.setMmgzUI();
            this.setSwdtUI();
            await this.refreshOffInfo();
            await this.getBuyInfo();
            if (this.curOff < 9 && this.curOff > 0) {
                this._control.cancleListenBuy();
                this._control.listenBuy();
            }
            this.setYyzdUI();
            this.setYdsqUI();
        }

        private setXmqdUI() {
            //星梦庆典
            let have1 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[0]).allGet;
            this.btnBuy1.visible = this.imgCost1.visible = this.txtCost1.visible = !have1;
            this.imgGot1.visible = have1;
            let have2 = clientCore.SuitsInfo.getSuitInfo(this.suitIds[1]).allGet;
            this.btnBuy2.visible = this.imgCost2.visible = this.txtCost2.visible = !have2;
            this.imgGot2.visible = have2;
            if (this.txtCost1.visible) this.txtCost1.text = xls.get(xls.eventExchange).get(this.giftIds[0]).cost[0].v2.toString();
            if (this.txtCost2.visible) this.txtCost2.text = xls.get(xls.eventExchange).get(this.giftIds[1]).cost[0].v2.toString();
            this.imgTip.visible = !have1 || !have2;
            this.btnGet.visible = have1 && have2 && !clientCore.BgShowManager.instance.checkHaveBgShow(this.bgshowId);
        }

        private setMmgzUI() {
            //猫咪贵族
            this.imgNoOpen.visible = false;
            this.imgGotWhgz.visible = clientCore.ItemsInfo.checkHaveItem(1000029);
            this.imgGotXcxj.visible = clientCore.SuitsInfo.getSuitInfo(2100208).allGet;
            this.btnBuyXcxj.visible = !this.imgGotXcxj.visible;
            this.checkLimit(0);
        }

        private setSwdtUI() {
            //守望灯塔
            this.btnVipGet.disabled = clientCore.FlowerPetInfo.petType < 3;
            this.imgGotSyr.visible = clientCore.SuitsInfo.getSuitInfo(2100212).allGet;
            this.btnBuySyr.visible = !this.imgGotSyr.visible;
            this.imgGotMhhx.visible = clientCore.SuitsInfo.getSuitInfo(2110014).allGet;
            this.btnVipGet.visible = !this.imgGotMhhx.visible;
        }

        private setYyzdUI() {
            //云翳之巅
            if (this.curOff > 0 && !this._t) {
                this.onTime();
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                this._t.start();
            }
            this.btnBuyYyzd.disabled = this.imgGotYyzd.visible = clientCore.SuitsInfo.getSuitInfo(this.suitIds[5]).allGet;
            this.boxNoOpen.visible = this.checkYyzdSell() > 0;
            this.btnBuyYyzd.visible = this.checkYyzdSell() <= 0;
            this.boxBuy.y = this.curOff > 0 ? 47 : 20;
            let price = xls.get(xls.eventExchange).get(2224).cost[0].v2;
            if (this.curOff == 0) {
                this.labCurPrice.text = price.toString();
            } else {
                this.labCurPrice.text = (price * this.curOff / 10).toString();
            }
            if (this.curOff > 0) {
                this.labOffCount.text = this.curOffCount.toString();
                this.imgCurOff.skin = "anniversary/" + this.curOff + ".png";
                this.imgHot.pos(this["imgOffDown" + this.curOff].x, this["imgOffDown" + this.curOff].y);
            }
            this.boxOff.visible = this.imgHot.visible = this.curOff > 0;
            this.imgOffDown1.visible = this.curOff > 1 || this.curOff == 0;
            this.imgOffDown3.visible = this.curOff > 3 || this.curOff == 0;
            this.imgOffDown5.visible = this.curOff > 5 || this.curOff == 0;
            this.imgOffDown7.visible = this.curOff > 7 || this.curOff == 0;
            this.imgOffDown9.visible = this.curOff > 9 || this.curOff == 0;
            this.labLimit1.text = channel.ChannelControl.ins.isOfficial ? "50" : "75";
            this.labLimit3.text = channel.ChannelControl.ins.isOfficial ? "100" : "150";
            this.labLimit5.text = channel.ChannelControl.ins.isOfficial ? "250" : "375";
            this.labLimit7.text = channel.ChannelControl.ins.isOfficial ? "600" : "900";
            this.labLimit9.text = channel.ChannelControl.ins.isOfficial ? "1000" : "1500";
        }
        //#region 云端拾取
        private _person: clientCore.Person;
        private curWearIds: number[] = [];
        private clothBuyIds: number[];
        private buyCarPanel: AnniversaryCarPanel;
        private setYdsqUI() {
            //云端拾取
            this.listGoods.array = this.clothBuyIds;
            this.setPrice();
        }
        /**商品列表渲染 */
        private goodsRender(item: ui.anniversary.render.ShopItemUI) {
            let id: number = item.dataSource;
            let config = xls.get(xls.eventExchange).get(id);
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(reward[0].v1);
            item.imgTrying.visible = this.curWearIds.indexOf(reward[0].v1) >= 0;
            item.list.repeatX = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.quality;
            item.labName.text = clientCore.ClothData.getCloth(reward[0].v1).xlsInfo.name;
            item.imgHad.visible = clientCore.ItemsInfo.checkHaveItem(reward[0].v1);
            item.btnAdd.visible = this._model.buyCarInfo.indexOf(id) < 0 && !item.imgHad.visible;
            item.btnPop.visible = !item.btnAdd.visible && !item.imgHad.visible;
            item.labPrice.text = config.cost[0].v2.toString();
            item.imgTrying.visible = this._person.getWearginIds().indexOf(reward[0].v1) > 0;
            // BC.addEvent(this, item.imgIcon, Laya.Event.CLICK, this, this.previewCloth, [reward[0].v1]);
            // BC.addEvent(this, item.btnAdd, Laya.Event.CLICK, this, this.addToCar, [1, id]);
            // BC.addEvent(this, item.btnPop, Laya.Event.CLICK, this, this.addToCar, [0, id]);
        }

        /**商品列表点击 */
        private goodsMouse(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let item = this.listGoods.getCell(index) as any;
                if (e.target.mouseY > 244) {
                    if (item.btnAdd.visible) {
                        this.addToCar(1, item.dataSource);
                    } else if (item.btnPop.visible) {
                        this.addToCar(0, item.dataSource);
                    }
                } else {
                    let config = xls.get(xls.eventExchange).get(item.dataSource);
                    let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
                    this.previewCloth(reward[0].v1);
                }
            }
        }

        /**预览部件 */
        private previewCloth(id: number) {
            this._person.upById(id);
            this.listGoods.refresh();
        }

        /**加入购物车 */
        private addToCar(flag: number, id: number) {
            if (flag) {
                if (this._model.buyCarInfo.length >= 6) {
                    alert.showFWords("你的购物车已经满了！先去结算吧！");
                    return;
                }
                if (this._model.buyCarInfo.indexOf(id) >= 0) return;
                this._model.buyCarInfo.push(id);
            } else {
                _.remove(this._model.buyCarInfo, (o) => { return o == id });
            }
            this.setPrice();
            this.listGoods.refresh();
        }

        /**计算购物车价格 */
        private setPrice() {
            let price = 0;
            for (let i: number = 0; i < this._model.buyCarInfo.length; i++) {
                price += xls.get(xls.eventExchange).get(this._model.buyCarInfo[i]).cost[0].v2;
            }
            this.labOldPrice.text = price.toString();
            if (this._model.buyCarInfo.length >= 6) {
                price -= 100;
            } else if (this._model.buyCarInfo.length >= 3) {
                price -= 30;
            }
            this.labPrice.text = price.toString();
            this.labCarNum.text = this._model.buyCarInfo.length.toString();
        }

        /**还原形象 */
        private backImage() {
            this._person.downAllCloth();
            this._person.replaceByIdArr(clientCore.LocalInfo.wearingClothIdArr);
            this.listGoods.refresh();
        }

        /**打开购物车 */
        private openBuyCar() {
            this.buyCarPanel.show();
            this.buyCarPanel.once(Laya.Event.CLOSE, this, () => {
                this.setPrice();
                this.listGoods.refresh();
            })
        }
        //#endregion

        public hide() {
            this._t?.dispose();
            this._t = null;
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**统计项 */
        private sendData() {
            if (this.tagInfo[4].open == true) clientCore.Logger.sendLog('2020年8月7日活动', '【付费】花恋流年', '打开花开几度第五页面板');
            if (this.tagInfo[3].open == true) clientCore.Logger.sendLog('2020年8月7日活动', '【付费】花恋流年', '打开花开几度第四页面板');
            if (this.tagInfo[2].open == true) clientCore.Logger.sendLog('2020年7月24日活动', '【付费】花恋流年', '打开花开几度第三页面板');
            if (this.tagInfo[1].open == true) clientCore.Logger.sendLog('2020年7月24日活动', '【付费】花恋流年', '打开花开几度第二页面板');
            if (this.tagInfo[0].open == true) clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '打开花开几度面板');
        }

        /**检查限量状态 */
        private async checkLimit(flag: number) {
            this.limitInfo = await this._control.getLimitInfo(flag);
            // this.boxLimit.visible = !this.imgGotWhgz.visible;
            this.labLimitCount.text = this.limitInfo.limitCnt.toString();
        }

        /**购买套装 */
        private async buySuit(idx: number) {
            let config = xls.get(xls.eventExchange).get(this.giftIds[idx]);
            let has = clientCore.ItemsInfo.getItemNum(config.cost[0].v1);
            if (has < config.cost[0].v2) {
                alert.alertQuickBuy(config.cost[0].v1, config.cost[0].v2 - has, true);
                return;
            }
            if (idx == 2) {//猫咪贵族
                this.limitInfo = await this._control.getLimitInfo(1);
                // this.boxLimit.visible = this.limitInfo.limitCnt > 0 && !this.imgGotWhgz.visible;
                this.labLimitCount.text = this.limitInfo.limitCnt.toString();
                alert.showSmall(`是否购买香草信笺套装？限量舞台剩余:${this.limitInfo.limitCnt}`, {
                    callBack: {
                        funArr: [() => { this.buy(2); }, () => { this._control.unlockLimit(); }],
                        caller: this,
                    },
                    needClose: false,
                    needMask: true,
                    clickMaskClose: false
                })
            } else {
                this.buy(idx);
            }
        }

        /**实际购买 */
        private buy(idx: number) {
            net.sendAndWait(new pb.cs_common_exchange({ activityId: 47, exchangeId: this.giftIds[idx] })).then(async (data: pb.sc_common_exchange) => {
                let arr: pb.IItem[] = [];
                for (let j: number = 0; j < data.item.length; j++) {
                    if (data.item[j].id == this.suitIds[idx]) {
                        let cloths = clientCore.SuitsInfo.getSuitInfo(this.suitIds[idx]).clothes;
                        for (let i: number = 0; i < cloths.length; i++) {
                            let item = new pb.Item();
                            item.id = cloths[i];
                            item.cnt = 1;
                            arr.push(item);
                        }
                    } else {
                        arr.push(data.item[j]);
                    }
                }
                alert.showReward(arr);
                if (idx != 3) this._model.totalCost += xls.get(xls.eventExchange).get(this.giftIds[idx]).cost[0].v2;
                if (idx < 2) this.setXmqdUI();
                else if (idx < 3) this.setMmgzUI();
                else if (idx < 5) this.setSwdtUI();
                if (idx == 3) {
                    await util.RedPoint.reqRedPointRefresh(11805);
                    EventManager.event("ANNIVERSARY_REFRESH_TAB");
                }
            })
        }

        /**领取舞台和背景秀 */
        private async getReward() {
            let msg = await this._control.getReward(1, 0);
            alert.showReward(msg.item);
            this.setXmqdUI();
        }

        /**预览舞台和背景秀 */
        private preBgStage(ids: number[]) {
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: ids, condition: '', limit: '' });
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitIds[idx]);
        }

        /**检查云翳之巅开卖时间 */
        private checkYyzdSell(): number {
            let endT: number = util.TimeUtil.formatTimeStrToSec("2020/8/7 18:00:00");
            return endT - clientCore.ServerManager.curServerTime;
        }

        /**秒级刷新 */
        private onTime() {
            if (this.checkYyzdSell() > 0) {
                this.labTimeYyzd.changeText(`${util.StringUtils.getDateStr2(this.checkYyzdSell(), '{hour}:{min}:{sec}')}`);
            } else if (this.countTime > 0) {
                this.countTime--;
                this.boxNoOpen.visible = false;
                this.btnBuyYyzd.visible = true;
                this.boxBuy.visible = true;
            } else {
                this.refreshOffInfo();
                this.countTime = 5;
            }
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTag.refresh();
        }
        //#region 云翳之巅
        private waiting: boolean = false;
        private buyInfo: pb.YFLSTopCloudBuyHistory[];
        private curOff: number;
        private curOffCount: number;
        private countTime: number = 5;
        /**拉取购买记录 */
        private async getBuyInfo() {
            let msg = await this._control.getBuyInfo();
            this.buyInfo = msg?.buyHistory ?? [];
            this.listBuyInfo.array = this.buyInfo;
            this.listBuyInfo.startIndex = this.buyInfo.length - 4;
            this.listBuyInfo.tweenTo(this.buyInfo.length - 4);
        }
        /**购买云翳之巅 */
        private buyYyzd() {
            let config = xls.get(xls.eventExchange).get(2224);
            let has = clientCore.ItemsInfo.getItemNum(config.cost[0].v1);
            let cost = config.cost[0].v2;
            if (this.curOff != 0) {
                cost = cost * this.curOff / 10;
            }
            if (has < cost) {
                alert.alertQuickBuy(config.cost[0].v1, cost - has, true);
                return;
            }
            let off: number = this.curOff; //打开的时候 需要缓存一下折扣值 以防打开的时候折扣发生变化... 有争议
            alert.showSmall(`是否花费${cost}${clientCore.ItemsInfo.getItemName(config.cost[0].v1)}购买云翳之巅套装？`, {
                callBack: {
                    caller: this, funArr: [async () => {
                        if (this.waiting) return;
                        this.waiting = true;
                        let res = await this._control.buyCloudTop(off);
                        if (res) {
                            alert.showReward(res.item);
                            this.imgGotYyzd.visible = true;
                            this.btnBuyYyzd.disabled = true;
                        }
                        this.waiting = false;
                    }]
                }
            })
        }

        /**刷新购买信息和剩余数量 */
        private refreshBuyInfo(data: pb.YFLSTopCloudBuyHistory) {
            if (this.buyInfo.indexOf(data) >= 0) return;
            this.buyInfo.push(data);
            this.listBuyInfo.updateArray(this.buyInfo);
            if (this.listBuyInfo.startIndex == this.buyInfo.length - 5) {
                this.listBuyInfo.tweenTo(this.listBuyInfo.length - 4);
            }
            if (data.discount > this.curOff && this.curOff > 0) {
                this.refreshOffInfo();
                this.countTime = 5;
            } else {
                this.curOffCount--;
                this.labOffCount.text = this.curOffCount.toString();
            }
        }

        /**每五秒刷新折扣信息 */
        private async refreshOffInfo() {
            let msg = await this._control.getSellInfo();
            if (msg.oneDiscount > 0) {
                this.curOff = 1;
                this.curOffCount = msg.oneDiscount;
            } else if (msg.threeDiscount > 0) {
                this.curOff = 3;
                this.curOffCount = msg.threeDiscount;
            } else if (msg.fiveDiscount > 0) {
                this.curOff = 5;
                this.curOffCount = msg.fiveDiscount;
            } else if (msg.sevenDiscount > 0) {
                this.curOff = 7;
                this.curOffCount = msg.sevenDiscount;
            } else if (msg.nineDiscount > 0) {
                this.curOff = 9;
                this.curOffCount = msg.nineDiscount;
            } else {
                this.curOff = 0;
            }
            this.setYyzdUI();
        }
        //#endregion

        addEventListeners() {
            /**星梦庆典 */
            BC.addEvent(this, this.btnBuy1, Laya.Event.CLICK, this, this.buySuit, [0]);
            BC.addEvent(this, this.btnBuy2, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnPre, Laya.Event.CLICK, this, this.preBgStage, [[this.bgshowId, this.stageId]]);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.trySuit, [1]);
            /**猫咪贵族 */
            BC.addEvent(this, this.btnTryXcxj, Laya.Event.CLICK, this, this.trySuit, [2]);
            BC.addEvent(this, this.btnTryWhgz, Laya.Event.CLICK, this, this.preBgStage, [[1000029]]);
            BC.addEvent(this, this.btnBuyXcxj, Laya.Event.CLICK, this, this.buySuit, [2]);
            /**守望灯塔 */
            BC.addEvent(this, this.btnVipGet, Laya.Event.CLICK, this, this.buy, [3]);
            BC.addEvent(this, this.btnBuySyr, Laya.Event.CLICK, this, this.buySuit, [4]);
            BC.addEvent(this, this.btnTryMhhx, Laya.Event.CLICK, this, this.trySuit, [3]);
            BC.addEvent(this, this.btnTrySyr, Laya.Event.CLICK, this, this.trySuit, [4]);
            BC.addEvent(this, this.btnUpVip, Laya.Event.CLICK, this, this.goHuabaoHouse);
            /**云翳之巅 */
            BC.addEvent(this, this.btnTryYyzd, Laya.Event.CLICK, this, this.trySuit, [5]);
            BC.addEvent(this, this.btnBuyYyzd, Laya.Event.CLICK, this, this.buyYyzd);
            /**云端拾取 */
            BC.addEvent(this, this.btnToBack, Laya.Event.CLICK, this, this.backImage);
            BC.addEvent(this, this.btnCar, Laya.Event.CLICK, this, this.openBuyCar);
            EventManager.on("ANNIVERSARY_REFRESH_TAB", this, this.refreshTab);
            EventManager.on("ANNIVERSARY_GET_BUY_INFO", this, this.refreshBuyInfo);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("ANNIVERSARY_REFRESH_TAB", this, this.refreshTab);
            EventManager.off("ANNIVERSARY_GET_BUY_INFO", this, this.refreshBuyInfo);
        }

        public destroy() {
            super.destroy();
            this._control.cancleListenBuy();
            this.removeEventListeners();
            this._t?.dispose();
            this._t = this._control = null;
        }
    }
}