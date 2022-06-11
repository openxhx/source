namespace colorsGo {
    export class ColorsGoModule extends ui.colorsGo.ColorsGoModuleUI {
        private _waiting: boolean = false;
        private canGetReward: boolean;
        private curAllId: number;
        private haveNum: number;

        private _model: ColorsGoModel;
        private _control: ColorsGoControl;

        init(d: any) {

            this.sign = clientCore.CManager.regSign(new ColorsGoModel(), new ColorsGoControl());
            this._model = clientCore.CManager.getModel(this.sign) as ColorsGoModel;
            this._control = clientCore.CManager.getControl(this.sign) as ColorsGoControl;
            this._control.model = this._model;

            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.vScrollBarSkin = "";

            this.addPreLoad(xls.load(xls.dailyGo));
            this.addPreLoad(xls.load(xls.dailyGoMain));
        }

        onPreloadOver() {
            this._model.init();

            if (clientCore.FlowerPetInfo.petType < 1) {
                this.imgRight.y = 6;
                this.curAllId = 2;
            } else if (clientCore.FlowerPetInfo.petType < 3) {
                this.imgRight.y = 46;
                this.curAllId = 3;
            } else {
                this.imgRight.y = 86;
                this.curAllId = 4;
            }
            this.labPrice14.text = "" + this._model.getItemList(2)[0].regularPublic.v2;
            this.labPrice15.text = "" + this._model.getItemList(3)[0].regularPublic.v2;
            this.labPrice16.text = "" + this._model.getItemList(4)[0].regularPublic.v2;

            let sex = clientCore.LocalInfo.sex;
            let res: string = `res/colorsGo/${this._model.issue}/`;
            this.bg.skin = res + 'bg.png';
            this.imgRole.skin = sex == 1 ? res + 'girl.png' : res + 'boy.png';
            this.imgEye.skin = sex == 1 ? res + "girl_mei_tong.png" : res + "boy_mei_tong.png";
            this.imgSuitName.skin = res + 'suit_name.png';

            this.updateView();

            let timeData = this._model.dailyGoMain.issueBegin.split(" ");
            timeData = timeData[0].split("-");
            let timeStr = timeData[0] + '年' + timeData[1] + '月' + timeData[2] + '日活动';
            let titleStr = '【付费】缤纷每日GO 第' + this._model.issue + '期';
            clientCore.Logger.sendLog(timeStr, titleStr, '打开活动面板');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private listRender(item: ui.colorsGo.render.ColorsGoItemUI) {
            let data: xls.dailyGo = item.dataSource;
            let goods = clientCore.LocalInfo.sex == 1 ? data.femaleReward : data.maleReward;
            let day = data.sellDate.split("-");
            let isDay = util.TimeUtil.formatTimeStrToSec(data.sellDate) == util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(goods[0].v1);
            item.btnBuy.visible = !clientCore.ItemsInfo.checkHaveItem(goods[0].v1);
            item.imgGot.visible = !item.btnBuy.visible;
            item.labDay.text = day[1] + "/" + day[2];
            item.imgLine.y = isDay ? 180 : 210;
            if (item.imgTehui) item.imgTehui.visible = isDay;
            item.labPrice.text = "" + data.regularPublic.v2;
            item.labDayPrice.text = "" + data.durationTime.v2;
            BC.addEvent(this, item.btnBuy, Laya.Event.CLICK, this, this.buyCloth, [data]);
        }

        /**设置UI数据 */
        private updateView() {
            let buyInfo = clientCore.LocalInfo.sex == 1 ? this._model.dailyGoMain.needFemale : this._model.dailyGoMain.needMale;
            this.haveNum = _.filter(buyInfo, (o) => { return clientCore.LocalInfo.checkHaveCloth(o.v1) }).length;
            let eyeId = clientCore.LocalInfo.sex == 1 ? this._model.tokenId : this._model.tokenId2;
            this.imgGot.visible =  this.haveNum == buyInfo.length;
            this.btnBuyAll.disabled = this.haveNum>0;
            this.imgTip.skin = this.haveNum == buyInfo.length ? "colorsGo/getSuitRwd.png" : "colorsGo/ji_qi_jiang_li.png";
            this.canGetReward = this.haveNum == buyInfo.length && !clientCore.ItemsInfo.checkHaveItem(eyeId);
            this.imgTip.disabled = clientCore.ItemsInfo.checkHaveItem(eyeId);
            this.labProgress.text = this.haveNum + "/" + buyInfo.length;
            this.list.dataSource = this._model.getItemList(1);
        }

        /**购买服装 */
        private buyCloth(data: xls.dailyGo) {
            let isDay = data.sellDate != "" && util.TimeUtil.formatTimeStrToSec(data.sellDate) == util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
            let cost = isDay ? data.durationTime : data.regularPublic;
            let has = clientCore.ItemsInfo.getItemNum(cost.v1);
            if (has < cost.v2) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            let goodsName = clientCore.ItemsInfo.getItemName(data.maleReward[0].v1);
            if (data.maleReward.length > 1) {
                goodsName = clientCore.ItemsInfo.getItemName(this._model.suitId);
            }
            let str: string = `确定花费${cost.v2}${clientCore.ItemsInfo.getItemName(cost.v1)}购买${goodsName}吗？`;
            if (data.type != 1 && this.haveNum > 0) {//购买套装
                str = "你已拥有该套装的部分部件，" + str;
            }
            alert.showSmall(str, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.sureBuy(data.id);
                    }]
                }
            })
        }

        /**确定购买 */
        private sureBuy(id: number) {
            if (this._waiting) return;
            this._waiting = true;
            this._control.buy(id, Laya.Handler.create(this, (msg: pb.sc_colorful_every_day_go_buy) => {
                alert.showReward(msg.item);
                this.updateView();
                this._waiting = false;
            }), Laya.Handler.create(this, () => {
                this._waiting = false;
            }));
        }

        /**整套购买 */
        private buySuit() {
            this.buyCloth(this._model.getItemList(this.curAllId)[0]);
        }

        /**获取额外奖励 */
        private getReward() {
            if (this._waiting) return;
            if (!this.canGetReward) {
                alert.showFWords("未集齐其他部件或已领取！");
                return;
            }
            this._waiting = true;
            this._control.reward(Laya.Handler.create(this, (msg: pb.sc_colorful_every_day_go_get_reward) => {
                alert.showReward(msg.item);
                this.updateView();
                this.canGetReward = false;
                this._waiting = false;
            }), Laya.Handler.create(this, () => {
                this._waiting = false;
            }));
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(this._model.ruleById);
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._model.suitId);
        }

        /**跳转花宝小屋 */
        private goHuabaoHouse() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("flowerPet.FlowerPetModule");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.boxReward, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnBuyAll, Laya.Event.CLICK, this, this.buySuit);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnUpgrad, Laya.Event.CLICK, this, this.goHuabaoHouse);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}