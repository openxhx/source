namespace moonStory {
    export class MoonLjsyPanel extends ui.moonStory.panel.MoonLjsyPanelUI {
        private readonly suitIds: number[] = [2110050, 2100229, 2110056, 2100237, 2110060, 2100240];
        private readonly coinId: number = 1511010;
        private readonly giftIds: number[] = [2279, 2280, 2284, 2285, 2286, 2287];
        private readonly stageId: number = 1100023;
        private _control: MoonStoryControl;
        private tagInfo: any[] = [{ name: "tag_qfly", open: 0 }, { name: "tag_jqqd", open: 0 }];
        constructor(sign: number) {
            super();
            this.addEventListeners();
            this._control = clientCore.CManager.getControl(sign) as MoonStoryControl;
            this.initUI();
        }

        private initUI() {
            this.fyzy_1.visible = this.name_mxxm.visible = this.mxxm_1.visible = this.bltz_1.visible = this.hjym_1.visible = this.xymf_1.visible = this.slyj_1.visible = clientCore.LocalInfo.sex == 1;
            this.fyzy_2.visible = this.name_mxxd.visible = this.mxxd_2.visible = this.bltz_2.visible = this.hjym_2.visible = this.xymf_2.visible = this.slyj_2.visible = clientCore.LocalInfo.sex == 2;
            this.list_tag.renderHandler = new Laya.Handler(this, this.tagRender);
            this.list_tag.selectEnable = true;
            this.list_tag.selectHandler = new Laya.Handler(this, this.tagMouse);
            if (clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec('2020-10-8 00:00:00')) {
                this.tagInfo = [{ name: "tag_qfly", open: 0 }, { name: "tag_blhf", open: 0 }, { name: "tag_fcxy", open: 0 }];
            } else {
                this.tagInfo = [{ name: "tag_qfly", open: 0 }, { name: "tag_blhf", open: 0 }, { name: "tag_jqqd", open: 0 }];
            }
            this.box1.visible = this.box2.visible = this.box3.visible = false;
            this.list_tag.repeatY = this.tagInfo.length;
            this.list_tag.array = this.tagInfo;
        }

        private tagRender(item: ui.moonStory.render.MoonViewTagUI) {
            item.imgName.skin = `moonStory/${item.dataSource.name}_${item.dataSource.open}.png`;
            item.imgTime.visible = item.imgSelect.visible = item.dataSource.open == 1;
            if (item.dataSource.name == "tag_qfly") {
                item.imgRed.visible = util.RedPoint.checkShow([16903]);
                item.imgTime.skin = `moonStory/img_time_s.png`;
            } else if (item.dataSource.name == "tag_blhf") {
                item.imgRed.visible = util.RedPoint.checkShow([16905]);
                item.imgTime.skin = `moonStory/img_time_s_1.png`;
            } else if (item.dataSource.name == "tag_fcxy") {
                item.imgRed.visible = false;
                item.imgTime.skin = `moonStory/img_time_s_2.png`;
            } else if (item.dataSource.name == "tag_jqqd") {
                item.imgRed.visible = false;
                item.imgSelect.visible = false;
                item.imgTime.visible = true;
                item.imgTime.skin = `moonStory/img_time_s_3.png`;
            }
        }

        private tagMouse(index: number) {
            if (this.tagInfo[index].name == "tag_jqqd") return;
            for (let i: number = 0; i < this.tagInfo.length; i++) {
                if (this.tagInfo[i].open == 1) {
                    this.tagInfo[i].open = 0;
                    this["box" + (i + 1)].visible = false;
                }
            }
            this.tagInfo[index].open = 1;
            this["box" + (index + 1)].visible = true;
            this.list_tag.selectedIndex = index;
            this.sendData();
        }

        public onShow() {
            clientCore.UIManager.setMoneyIds([this.coinId, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.setUI();
        }

        private async setUI() {
            this.setQflyUI();
            this.setBlhfUI();
            this.setFcxyUI();
            if (clientCore.ServerManager.curServerTime > util.TimeUtil.formatTimeStrToSec('2020-10-8 00:00:00')) {
                this.tagMouse(2);
            } else {
                this.tagMouse(1);
            }
        }

        /**秋枫凉月UI */
        private setQflyUI() {
            let haveXymf = clientCore.SuitsInfo.getSuitInfo(this.suitIds[0]).allGet;
            let haveSlyj = clientCore.SuitsInfo.getSuitInfo(this.suitIds[1]).allGet;
            let costXymf = xls.get(xls.eventExchange).get(this.giftIds[0]).cost[0].v2;
            let costSlyj = xls.get(xls.eventExchange).get(this.giftIds[1]).cost[0].v2;
            this.img_got_xymf.visible = haveXymf;
            this.img_got_slyj.visible = haveSlyj;
            this.btnGet.visible = haveXymf && haveSlyj;
            this.img_got_mxs.visible = clientCore.ItemsInfo.checkHaveItem(this.stageId);
            this.img_off.visible = (haveXymf || haveSlyj) && !(haveXymf && haveSlyj);
            if (haveXymf && this.img_off.visible) {
                this.img_off.pos(this.btn_buy_slyj.x - 20, this.btn_buy_slyj.y - 40);
                costSlyj -= 120;
            }
            if (haveSlyj && this.img_off.visible) {
                this.img_off.pos(this.btn_buy_xymf.x - 20, this.btn_buy_xymf.y - 40);
                costXymf -= 120;
            }
            this.img_cost_xymf.skin = `moonStory/num_${costXymf}.png`;
            this.img_cost_slyj.skin = `moonStory/num_${costSlyj}.png`;
        }

        /**玻璃花房UI */
        private setBlhfUI() {
            let haveHjym = clientCore.SuitsInfo.getSuitInfo(this.suitIds[2]).allGet;
            let haveBltz = clientCore.SuitsInfo.getSuitInfo(this.suitIds[3]).allGet;
            this.imgGotHjym.visible = haveHjym;
            this.imgGotBltz.visible = haveBltz;
            this.btnGo.visible = this.btnGetHjym.disabled = clientCore.FlowerPetInfo.petType < 3;
        }

        /**反差学院UI */
        private setFcxyUI() {
            let haveMxxm = clientCore.SuitsInfo.getSuitInfo(this.suitIds[4]).allGet;
            let haveFyzy = clientCore.SuitsInfo.getSuitInfo(this.suitIds[5]).allGet;
            this.imgGotMxxm.visible = haveMxxm;
            this.imgGotFyzy.visible = haveFyzy;
            let costMxxm = xls.get(xls.eventExchange).get(this.giftIds[4]).cost[0].v2;
            let costFyzy = xls.get(xls.eventExchange).get(this.giftIds[5]).cost[0].v2;
            this.imgHalf.visible = (haveFyzy || haveMxxm) && !(haveMxxm && haveFyzy);
            if (haveFyzy && this.imgHalf.visible) {
                this.imgHalf.pos(this.btnBuyMxxm.x - 20, this.btnBuyMxxm.y - 40);
                costMxxm /= 2;
            }
            if (haveMxxm && this.imgHalf.visible) {
                this.imgHalf.pos(this.btnBuyFyzy.x - 20, this.btnBuyFyzy.y - 40);
                costFyzy /= 2;
            }
            this.costFyzy.skin = `moonStory/num_${costFyzy}.png`;
            this.costMxxm.skin = `moonStory/num_${costMxxm}.png`;
        }

        public hide() {
            this.visible = false;
            clientCore.UIManager.releaseCoinBox();
        }

        /**统计项 */
        private sendData() {
            if (this.list_tag.selectedIndex == 0) clientCore.Logger.sendLog('2020年9月25日活动', '【付费】华彩月章', '打开流金岁月面板');
            if (this.list_tag.selectedIndex == 1) clientCore.Logger.sendLog('2020年9月30日活动', '【付费】华彩月章', '打开玻璃花房面板');
            if (this.list_tag.selectedIndex == 2) clientCore.Logger.sendLog('2020年10月8日活动', '【付费】华彩月章', '打开反差学院面板');
        }

        /**购买套装 */
        private async buySuit(idx: number) {
            if (idx == 0 && this.img_got_xymf.visible) return;
            else if (idx == 1 && this.img_got_slyj.visible) return;
            else if (idx == 2 && this.imgGotHjym.visible) return;
            else if (idx == 3 && this.imgGotBltz.visible) return;
            else if (idx == 4 && this.imgGotMxxm.visible) return;
            else if (idx == 5 && this.imgGotFyzy.visible) return;
            if (idx == 2) {
                this.buy(idx);
                return;
            }
            let config = xls.get(xls.eventExchange).get(this.giftIds[idx]);
            let has = clientCore.ItemsInfo.getItemNum(config.cost[0].v1);
            let cost = config.cost[0].v2;
            if (idx < 2 && this.img_off.visible) cost -= 120;
            if ((idx == 4 || idx == 5) && this.imgHalf.visible) cost /= 2;
            if (has < cost) {
                alert.alertQuickBuy(config.cost[0].v1, cost - has, true);
                return;
            }
            let suitName = clientCore.ItemsInfo.getItemName(config.maleProperty[0].v1);
            if (idx == 4) suitName = clientCore.LocalInfo.sex == 1 ? "萌系学妹套装" : "萌系学弟套装";
            alert.showSmall(`确定花费${cost}${clientCore.ItemsInfo.getItemName(config.cost[0].v1)}购买${suitName}吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.buy(idx);
                    }]
                }
            })
        }

        /**实际购买 */
        private buy(idx: number) {
            net.sendAndWait(new pb.cs_common_exchange({ exchangeId: this.giftIds[idx], activityId: 78 })).then(async (data: pb.sc_common_exchange) => {
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
                if (idx < 2) this.setQflyUI();
                else if (idx < 4) this.setBlhfUI();
                else if (idx < 6) this.setFcxyUI();
                if (idx == 2) {
                    await util.RedPoint.reqRedPointRefresh(16905);
                    this.refreshTab();
                    EventManager.event("MOONSTORY_REFRESH_TAB");
                }
            })
        }

        /**领取舞台和背景秀 */
        private async getReward() {
            if (this.img_got_mxs.visible) return;
            let msg = await this._control.getReward(1, 0);
            alert.showReward(msg.item);
            this.setQflyUI();
            await util.RedPoint.reqRedPointRefresh(16903);
            this.refreshTab();
            EventManager.event("MOONSTORY_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit(idx: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitIds[idx]);
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        /**更新tab状态 */
        private refreshTab() {
            this.list_tag.refresh();
        }

        addEventListeners() {
            //秋枫凉月
            BC.addEvent(this, this.btn_buy_xymf, Laya.Event.CLICK, this, this.buySuit, [0]);
            BC.addEvent(this, this.btn_buy_slyj, Laya.Event.CLICK, this, this.buySuit, [1]);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btn_try_xymf, Laya.Event.CLICK, this, this.trySuit, [0]);
            BC.addEvent(this, this.btn_try_slyj, Laya.Event.CLICK, this, this.trySuit, [1]);
            //玻璃花房
            BC.addEvent(this, this.btnGetHjym, Laya.Event.CLICK, this, this.buySuit, [2]);
            BC.addEvent(this, this.btnBuyBltz, Laya.Event.CLICK, this, this.buySuit, [3]);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goHuabaoHouse);
            BC.addEvent(this, this.btnTryHjym, Laya.Event.CLICK, this, this.trySuit, [2]);
            BC.addEvent(this, this.btnTryBltz, Laya.Event.CLICK, this, this.trySuit, [3]);
            //反差学院
            BC.addEvent(this, this.btnBuyMxxm, Laya.Event.CLICK, this, this.buySuit, [4]);
            BC.addEvent(this, this.btnBuyFyzy, Laya.Event.CLICK, this, this.buySuit, [5]);
            BC.addEvent(this, this.btnTryMxxm, Laya.Event.CLICK, this, this.trySuit, [4]);
            BC.addEvent(this, this.btnTryFyzy, Laya.Event.CLICK, this, this.trySuit, [5]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
            this._control = null;
        }
    }
}