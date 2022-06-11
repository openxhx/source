namespace moneyShop {
    export class TipsViewControl extends Laya.EventDispatcher {
        private ui: ui.moneyShop.panel.MoneyBuyTipsUI;
        private _currProductId: number;
        private _cell: Laya.Sprite;
        private _todayInfo: { id: number, state: STATE, day: number };
        private _todayFlg: boolean;
        constructor(v: ui.moneyShop.panel.MoneyBuyTipsUI) {
            super();
            this.ui = v;
            this.ui.visible = false;
            this.ui.rwd_0.listRwd.renderHandler = this.ui.rwd_1.listRwd.renderHandler = new Laya.Handler(this, this.onRwdRender);
            this.ui.rwd_0.listRwd.mouseHandler = this.ui.rwd_1.listRwd.mouseHandler = new Laya.Handler(this, this.onRwdMouse);
            BC.addEvent(this, this.ui.btn, Laya.Event.CLICK, this, this.onBtnClick);
        }

        private onBtnClick() {
            if (this._todayFlg) {
                if (this._todayInfo.state == STATE.NO_REWARD) {
                    if (this._currProductId > 0)
                        clientCore.RechargeManager.pay(this._currProductId).then((data) => {
                            alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                            this.hide();
                            this.event(Laya.Event.CHANGED, true);
                            util.RedPoint.reqRedPointRefresh(5002);
                        });
                }
                else {
                    net.sendAndWait(new pb.cs_get_pay_back_reward({ idx: this._todayInfo.id, day: _.clamp(this._todayInfo.day, 1, 7) })).then((data: pb.sc_get_pay_back_reward) => {
                        alert.showReward(clientCore.GoodsInfo.createArray(_.filter(data.itms, (o) => {
                            return o.id != 1900012;
                        })));
                        let giftItem = data.itms[0];
                        if (giftItem && giftItem.id == 1900012) {
                            net.sendAndWait(new pb.cs_use_gift_bag_item({ itemId: giftItem.id, num: giftItem.cnt })).then((msg: pb.sc_use_gift_bag_item) => {
                                alert.showReward(clientCore.GoodsInfo.createArray(msg.itemInfo), "获得奖励：");
                            })
                        }
                        this.hide();
                        this.event(Laya.Event.CHANGED, true);
                        util.RedPoint.reqRedPointRefresh(5002);
                    });
                }
            }
            else {
                clientCore.RechargeManager.pay(this._currProductId).then((data) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.items.concat(data.extItms)));
                    this.hide();
                    this.event(Laya.Event.CHANGED);
                    util.RedPoint.reqRedPointRefresh(5002);
                });
            }
        }

        showNewbie(data: { cell: Laya.Sprite, productId: number }) {
            this._todayFlg = false;
            this._currProductId = data.productId;
            this._cell = data.cell;
            this.ui.rwd_1.visible = false;
            this.ui.btn.fontSkin = 'commonBtn/l_p_buy.png';
            this.ui.btn.disabled = clientCore.RechargeManager.checkBuyLimitInfo(data.productId).payFinTimes > 0;
            let proInfo = clientCore.RechargeManager.getShopInfo(data.productId);
            let rwd = clientCore.LocalInfo.sex == 1 ? proInfo.rewardFamale : proInfo.rewardMale;
            this.ui.txtPrice.value = proInfo.cost.toString();
            this.ui.boxPrice.visible = true;
            this.setPartView({
                ui: this.ui.rwd_0,
                rwdArr: rwd,
                titleSkin: 'moneyShop/title1.png',
                titleTxt: '限购一次'
            })
            this.layoutAndShowUI();
        }

        showEvent(data: { cell: Laya.Sprite, cfg: xls.rechargeEvent }) {
            this._todayFlg = false;
            this._currProductId = data.cfg.chargeId;
            this._cell = data.cell;
            this.ui.rwd_1.visible = false;
            this.ui.btn.fontSkin = 'commonBtn/l_p_buy.png';
            this.ui.btn.disabled = clientCore.RechargeManager.checkBuyLimitInfo(this._currProductId).lastTime > clientCore.ServerManager.getWeekUpdataSec();
            let proInfo = clientCore.RechargeManager.getShopInfo(this._currProductId);
            let rwd = clientCore.LocalInfo.sex == 1 ? proInfo.rewardFamale : proInfo.rewardMale;
            this.ui.txtPrice.value = proInfo.cost.toString();
            this.ui.boxPrice.visible = true;
            let limitString = "";
            if (data.cfg.limit.v1 == 1) limitString += "每日限购";
            else if (data.cfg.limit.v1 == 2) limitString += "每周限购";
            else limitString += "不限购";
            if (data.cfg.limit.v1 < 3) limitString += (data.cfg.limit.v2 + "次");
            this.setPartView({
                ui: this.ui.rwd_0,
                rwdArr: rwd,
                titleSkin: 'moneyShop/title1.png',
                titleTxt: limitString
            })
            this.layoutAndShowUI();
        }

        showToday(data: { id: number, state: STATE, day: number }, cell: Laya.Sprite) {
            this._todayFlg = true;
            this._todayInfo = data;
            this._cell = cell;
            this.ui.rwd_0.visible = this.ui.rwd_1.visible = false;
            let todayInfo = xls.get(xls.rechargeToday).get(data.id);
            this._currProductId = todayInfo.productId;
            let rwd = todayInfo.firstReward;
            this.ui.txtPrice.value = clientCore.RechargeManager.getShopInfo(this._currProductId)?.cost.toString() ?? '0';
            let status: number = this.checkTodayRecharge(data.id);
            if (status == 2) {
                alert.showFWords('已过期~');
                return;
            }
            if (status == -1) {
                alert.showFWords('商品未开启购买~');
                return;
            }
            switch (data.state) {
                case STATE.GETED_REWARD:
                    this.setPartView({
                        rwdArr: todayInfo.freeReward,
                        ui: this.ui.rwd_0,
                        titleSkin: 'moneyShop/title2.png',
                        titleTxt: '每日限领1次'
                    });
                    this.ui.btn.disabled = true;
                    this.ui.btn.fontSkin = 'commonBtn/l_p_get.png';
                    this.ui.boxPrice.visible = false;
                    break;
                case STATE.NO_REWARD:
                    if (status != 0) {
                        alert.showFWords('该商品已不支持购买了~');
                        return;
                    }
                    if (rwd.length > 0)
                        this.setPartView({
                            rwdArr: rwd,
                            ui: this.ui.rwd_0,
                            titleSkin: 'moneyShop/title1.png',
                            titleTxt: '限购1个'
                        });
                    this.setPartView({
                        rwdArr: todayInfo.freeReward,
                        ui: this.ui.rwd_1,
                        titleSkin: 'moneyShop/title3.png',
                        titleTxt: '每日限领1次'
                    });
                    this.ui.btn.disabled = false;
                    this.ui.btn.fontSkin = 'commonBtn/l_p_buy.png';
                    this.ui.boxPrice.visible = true;
                    break;
                case STATE.HAVE_REWARD:
                    this.setPartView({
                        rwdArr: todayInfo.freeReward,
                        ui: this.ui.rwd_0,
                        titleSkin: 'moneyShop/title2.png',
                        titleTxt: '每日限领1次'
                    });
                    this.ui.btn.disabled = false;
                    this.ui.btn.fontSkin = 'commonBtn/l_p_get.png';
                    this.ui.boxPrice.visible = false;
                    break;
                default:
                    break;
            }
            //id==4 每日只能买一次的礼包特殊处理
            if (data.id == 4) {
                this.ui.rwd_0.visible = this.ui.rwd_1.visible = false;
                this.setPartView({
                    rwdArr: todayInfo.firstReward,
                    ui: this.ui.rwd_0,
                    titleSkin: 'moneyShop/title1.png',
                    titleTxt: '每日限购1次'
                });
                this.ui.btn.disabled = data.day == 1;
                this.ui.btn.fontSkin = 'commonBtn/l_p_buy.png';
                this.ui.boxPrice.visible = true;
            }
            this.layoutAndShowUI();
        }

        /**
         * 检查今日特惠的购买状态
         * @param id
         * @return -1未开放购买 0-可以购买 1-已结束购买 但可以领奖 2-彻底下架 奖励过期了
         */
        public checkTodayRecharge(id: number): number {
            let data: xls.rechargeToday = xls.get(xls.rechargeToday).get(id);
            if (!data.openDate) return 0;
            let time: number = util.TimeUtil.formatTimeStrToSec(data.openDate);
            let currT: number = clientCore.ServerManager.curServerTime;
            if (currT < time) return -1;
            time = util.TimeUtil.formatTimeStrToSec(data.closeDate);
            if (currT < time) return 0;
            time = util.TimeUtil.formatTimeStrToSec(data.overtimeDate);
            if (currT < time) return 1;
            return 2;
        }

        private setPartView(param: { ui: ui.moneyShop.render.TipsRwdRenderUI, titleSkin: string, titleTxt: string, rwdArr: xls.pair[] }) {
            param.ui.visible = true;
            param.ui.listRwd.dataSource = param.rwdArr;
            param.ui.listRwd.repeatX = param.rwdArr.length > 1 ? 2 : 1;
            param.ui.listRwd.repeatY = param.rwdArr.length > 2 ? 2 : 1;
            param.ui.txtLimit.text = param.titleTxt;
            param.ui.imgTitle.skin = param.titleSkin;
        }

        hide() {
            if (this.ui)
                this.ui.visible = false;
        }

        private layoutAndShowUI() {
            let startY = this.ui.rwd_0.y;
            for (let i = 0; i < 2; i++) {
                let rwdPart = this.ui['rwd_' + i];
                rwdPart.y = startY;
                if (rwdPart.visible)
                    startY += rwdPart.height;
            }
            this.ui.height = startY + (this.ui.boxPrice.visible ? 120 : 70);
            //位置
            let pos = new Laya.Point(0, 0);
            this._cell.localToGlobal(pos, false, this.ui.parent as Laya.Sprite);
            pos.x += this._cell.width / 2;
            pos.y += this._cell.height / 2;
            if ((pos.y + this.ui.height) > Laya.stage.height)
                pos.y -= (pos.y + this.ui.height - Laya.stage.height);
            this.ui.pos(pos.x, pos.y, true);
            //
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
            this.ui.visible = true;
        }

        private onStageClick() {
            if (this.ui.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            if (this._cell.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))
                return;
            this.hide();
        }

        private onRwdRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let o = cell.dataSource as xls.pair;
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(o.v1);
            cell.num.value = o.v2.toString();
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(o.v1);
            cell.txtName.visible = true;
            cell.txtName.text = clientCore.ItemsInfo.getItemName(o.v1);
        }

        private onRwdMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let dis = e.currentTarget as Laya.Sprite;
                clientCore.ToolTip.showTips(dis, { id: dis['dataSource'].v1 })
            }
        }

        destory() {
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onStageClick);
            BC.removeEvent(this);
            this.ui = null;
        }
    }
}