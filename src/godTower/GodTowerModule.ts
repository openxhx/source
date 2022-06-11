namespace godTower {
    export class GodTowerModule extends ui.godTower.GodTowerModuleUI {
        private _model: GodTowerModel;
        private _control: GodTowerControl;

        private isFirst: boolean = false;
        /**帮助说明面板 */
        private _helpPanel: GodTowerDetailPanel;
        /**超值礼包购买面板 */
        private _cheapBuyPanel: CheapBuyPanel;
        init(data?: any) {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new GodTowerModel(), new GodTowerControl());
            this._control = clientCore.CManager.getControl(this.sign) as GodTowerControl;
            this._model = clientCore.CManager.getModel(this.sign) as GodTowerModel;

            let sex = clientCore.LocalInfo.sex;
            this.role_boy.visible = sex == 2;
            this.role_girl.visible = sex == 1;

            this._cheapBuyPanel = new CheapBuyPanel();

            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();

            this.list.renderHandler = new Laya.Handler(this, this.listRender);

            this.addPreLoad(xls.load(xls.godTower));
            this.addPreLoad(this.checkBuyMedal());
        }

        async onPreloadOver() {
            this._cheapBuyPanel.init(null);
            this.checkBuyCheapReward();
            let msg = await this._control.getInfo();
            this._model.setGotReward(msg.box);
            clientCore.Logger.sendLog('2020年5月14日活动', '【付费】圣堂神音', '打开活动面板');
            this.setUI(true);
            let data: pb.ICommonData[] = await clientCore.MedalManager.getMedal([MedalConst.GOD_TOWER_OPEN]);
            this.isFirst = data[0].value == 0;
        }

        popupOver() {
            if (this._model._gotReward.length <= 0 && this.isFirst) {
                this.openNewLevel();
                clientCore.MedalManager.setMedal([{ id: MedalConst.GOD_TOWER_OPEN, value: 1 }])
            }
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: true });
        }

        /**界面UI赋值和更新
         * @init 是否是界面初始化，默认false
         */
        private setUI(init: boolean = false) {
            let reward: xls.pair;
            for (let i = 1; i <= this._model.levelCount[this._model._curOpenLevel]; i++) {
                this["window_" + i].img_lock.visible = false;
                reward = this._model.getRewardByPos(i)?.reward;
                if (reward && this["window_" + i].img_window.visible) {
                    this["window_" + i].reward.visible = true;
                    clientCore.GlobalConfig.setRewardUI(this["window_" + i].reward, { id: reward.v1, cnt: reward.v2, showName: false });
                    this["window_" + i].img_window.visible = false;
                    if (!init) {
                        this.mouseEnabled = false;
                        let animate = clientCore.BoneMgr.ins.play("res/animate/godTower/Glass.sk", "open", false, this["window_" + i]);
                        animate.pos(54, 54);
                        animate.once(Laya.Event.COMPLETE, this, (i, reward) => {
                            animate.dispose();
                            this.mouseEnabled = true;
                            alert.showReward(clientCore.GoodsInfo.createArray([reward]), "", { callBack: { caller: this._model, funArr: [this._model.checkNewLevelOpen] } });
                        }, [i, reward]);
                    }

                }
            }
            this.img_off.visible = false;
            let off: number = 1;
            for (let i = 0; i < this._model.ticketIds.length; i++) {
                if (clientCore.ItemsInfo.getItemNum(this._model.ticketIds[i]) > 0) {
                    this.img_offeff.skin = `godTower/img_off${i}.png`;
                    this.img_off.visible = true;
                    off = i == 0 ? 0.7 : i == 1 ? 0.5 : 0.3;
                    break;
                }
            }
            let levelInfo: xls.godTower;
            for (let i = 1; i <= 7; i++) {
                levelInfo = _.find(xls.get(xls.godTower).getValues(), (o) => { return o.levelId == i });
                this["cost_" + i].text = Math.ceil(levelInfo.cost.v2 * off);
                this["cost_" + i].color = off < 1 ? "#14ff00" : "#f4f1ce";
            }
            let clothIds = clientCore.SuitsInfo.getSuitInfo(this._model.suitId).clothes;
            let haveNum = _.filter(clothIds, (id) => { return clientCore.LocalInfo.checkHaveCloth(id) }).length;
            this.lab_progress.text = haveNum + '/' + clothIds.length;
            let sex = clientCore.LocalInfo.sex;
            let haveEye = clientCore.LocalInfo.checkHaveCloth(sex == 1 ? 4100457 : 4100460);
            this.img_extReward.skin = !haveEye ? `godTower/eye_${sex}.png` : 'godTower/img_gift.png';
            //获得了美瞳，没有买齐衣服不显示背景秀领取按钮
            if (haveEye) {
                this.btn_extReward.disabled = haveNum < clothIds.length;
                let haveBgShow = clientCore.BgShowManager.instance.checkHaveBgShow(1000020);
                if (haveBgShow) {
                    this.btn_extReward.visible = false;
                }
            }
            else {
                //没有获得美瞳,超过6件才能领美瞳
                this.btn_extReward.disabled = haveNum < 6;
                this.lab_progress.text = haveNum + '/6';
            }
            this.btn_extReward.skin = this.btn_extReward.disabled ? "godTower/img_zi.png" : "godTower/getSuitRwd.png";
            for (let i: number = 1; i <= 7; i++) {
                this["img_bell_" + i].visible = this["cost_" + i].visible = this["btn_info_" + i].visible = (i <= this._model._curOpenLevel && !this._model.checkAllGet(i));

            }
        }


        //#region 超值礼包
        /**超值礼包ID */
        private _rechargeIDArr = [21, 22];
        private _buyMedalArr = [MedalDailyConst.GOD_TOWER_BUY_6_430, MedalDailyConst.GOD_TOWER_BUY_68_430];
        private _buyMedalInfo: pb.ICommonData[];
        private _curShowRechargeID: number;
        async checkBuyMedal() {
            this._buyMedalInfo = await clientCore.MedalManager.getMedal(this._buyMedalArr);
            return Promise.resolve();
        }
        /**礼包购买检查 */
        private cheapBuySucc(id: number) {
            this._buyMedalInfo[id].value = 1;
            this.checkBuyCheapReward();
        }
        /**检查超值礼包的购买情况 */
        private checkBuyCheapReward() {
            let showFlag = false;
            for (let i = 0; i < this._rechargeIDArr.length; i++) {
                if (this._buyMedalInfo[i].value == 0) {
                    if (i == 0) {
                        this.imgRewardBox.skin = "godTower/img_6.png";
                    }
                    else if (i == 1) {
                        this.imgRewardBox.skin = "godTower/img_68.png";
                    }
                    this._curShowRechargeID = this._rechargeIDArr[i];
                    showFlag = true;
                    break;
                }
            }
            this.imgRewardBox.visible = showFlag;
        }
        /**显示购买界面 */
        private showCheapBoxInfo() {
            this._cheapBuyPanel.showInfo(this._curShowRechargeID);
            clientCore.DialogMgr.ins.open(this._cheapBuyPanel);
        }
        //#endregion


        //#region 有新的层级可以开启
        /**开启新的层级 */
        private openNewLevel() {
            this.mouseEnabled = false;
            let halfCount = (this._model.levelCount[this._model._curOpenLevel] - this._model.levelCount[this._model._curOpenLevel - 1]) / 2;
            for (let i: number = this._model.levelCount[this._model._curOpenLevel]; i > this._model.levelCount[this._model._curOpenLevel - 1]; i--) {
                this["window_" + i].img_lock.visible = false;
                let index = i - this._model.levelCount[this._model._curOpenLevel - 1];
                let reward = clientCore.LocalInfo.sex == 1 ? xls.get(xls.godTower).get(i).femaleReward : xls.get(xls.godTower).get(i).maleReward;
                let img = new ui.godTower.render.RewardItemUI();
                img.img_bg.skin = clientCore.ItemsInfo.getItemIconBg(reward.v1);
                img.img_reward.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                img.lab_count.text = "";
                img.lab_name.text = "";
                let target = this["window_" + i].localToGlobal(new Laya.Point(13, 13));
                target = this.globalToLocal(target);
                img.pos(this.stage.width / 2 - (index - halfCount) * 100, this.stage.height / 2);
                this.addChild(img);
                Laya.Tween.to(img, { x: target.x, y: target.y }, 500, null, Laya.Handler.create(this, (img, i) => {
                    Laya.Tween.clearTween(img);
                    clientCore.GlobalConfig.setRewardUI(this["window_" + i].reward, { id: reward.v1, cnt: reward.v2, showName: false });
                    this["window_" + i].img_window.visible = false;
                    img.destroy();
                    let animate = clientCore.BoneMgr.ins.play("res/animate/godTower/Glass.sk", "close", false, this["window_" + i]);
                    animate.pos(54, 54);
                    animate.once(Laya.Event.COMPLETE, this, (i) => {
                        this["window_" + i].img_window.visible = true;
                        animate.dispose();
                        if (i == this._model.levelCount[this._model._curOpenLevel - 1] + 1) this.shuffle();
                    }, [i]);
                    // this["window_" + i].img_window.y = -85;
                    // Laya.Tween.to(this["window_" + i].img_window, { y: 0 }, 500, null, Laya.Handler.create(this, () => {
                    //     Laya.Tween.clearTween(this["window_" + i].img_window);
                    //     if (i == this._model.levelCount[this._model._curOpenLevel]) this.shuffle();
                    // }));
                    this["window_" + i].img_lock.visible = false;
                }, [img, i]), 800);
            }
        }
        /**洗牌 */
        private shuffle(): void {
            let startX = this["window_" + this._model.levelCount[this._model._curOpenLevel]].parent.width / 2 - 50;
            for (let i: number = this._model.levelCount[this._model._curOpenLevel]; i > this._model.levelCount[this._model._curOpenLevel - 1]; i--) {
                let myX = this["window_" + i].x;
                Laya.Tween.to(this["window_" + i], { x: startX }, 500, null, Laya.Handler.create(this, (myX) => {
                    Laya.Tween.clearTween(this["window_" + i]);
                    Laya.Tween.to(this["window_" + i], { x: myX }, 500, null, Laya.Handler.create(this, () => {
                        Laya.Tween.clearTween(this["window_" + i]);
                        this["img_bell_" + this._model._curOpenLevel].visible = this["cost_" + this._model._curOpenLevel].visible = this["btn_info_" + this._model._curOpenLevel].visible = true;
                        this.mouseEnabled = true;
                    }));
                }, [myX]));;
            }
        }
        //#endregion

        //#region 层级奖励提示
        private listPos: number[][] = [[490, 435], [55, 330], [430, 235], [180, 350], [500, 320], [235, 145], [430, 120]];
        /**显示指定层数的奖励 */
        private showLevelInfo(level: number) {
            if (level > this._model._curOpenLevel) return;
            this.list.array = this._model.getRewardByLevel(level);
            this.list.repeatX = this.list.array.length;
            this.box_info.width = this.list.repeatX < 3 ? 430 : (this.list.repeatX - 3) * 120 + 430;
            this.box_info.pos(this.listPos[level - 1][0], this.listPos[level - 1][1]);
            this.box_info.visible = true;
        }
        /**隐藏层数奖励 */
        private hideLevelInfo() {
            this.box_info.visible = false;
        }
        //#endregion
        /**点击窗口 */
        private onClick: boolean = false;
        private onWindowClick(pos: number) {
            if (this.onClick) return;
            //未开启窗口
            if (pos > this._model.levelCount[this._model._curOpenLevel]) return;
            //已领取窗口
            let reward = _.find(this._model._gotReward, (o) => { return o.pos == pos })
            if (reward) {
                clientCore.ToolTip.showTips(this["window_" + pos], { id: reward.reward.v1 });
                return;
            };
            //判断神叶是否足够
            let cost = 250;
            for (let i: number = 0; i < this._model.levelCount.length; i++) {
                if (pos <= this._model.levelCount[i]) {
                    cost = _.find(xls.get(xls.godTower).getValues(), (o) => { return o.levelId == i }).cost.v2;
                    break;
                }
            }
            if (this.img_off.visible) {
                if (this.img_offeff.skin == `godTower/img_off0.png`) cost *= 0.7;
                else if (this.img_offeff.skin == `godTower/img_off1.png`) cost *= 0.5;
                else if (this.img_offeff.skin == `godTower/img_off2.png`) cost *= 0.3;
            }
            let myLeaf = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
            if (myLeaf < cost) {
                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                    alert.AlertLeafEnough.showAlert(cost - myLeaf);
                }));
                return;
            }
            //请求窗口奖励
            if (clientCore.GlobalConfig.showUseLeafAlert && cost >= 100) {
                alert.useLeafAlert(cost, this, () => {
                    this.useLeafComplete(pos);
                });
            }
            else {
                this.useLeafComplete(pos);
            }
        }
        private useLeafComplete(pos: number): void {
            this.onClick = true;
            this._control.drawBox(pos, Laya.Handler.create(this, (msg: pb.sc_tower_draw_box) => {
                this._model.addGotReward(pos, this._model.getRewardInfo(msg.rewardId)[0]);
                this.setUI();
                this.onClick = false;
            }));
        }
        /**点击额外奖励 */
        private getExtReward() {
            let index = this.img_extReward.skin == 'godTower/img_gift.png' ? 2 : 1;
            //请求额外奖励
            this._control.otherReward(index, Laya.Handler.create(this, (msg: pb.sc_tower_draw_get_extra) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itms));
                this.setUI();
                util.RedPoint.reqRedPointRefresh(9401);
            }))
        }

        /**预览舞台和背景秀 */
        private showExtReward() {
            if(this.btn_extReward.visible && !this.btn_extReward.disabled){
                this.getExtReward();
                return;
            }
            clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [1000020, 1100011], condition: '集齐{圣装祈祷套装}可获得', limit: '' });
        }

        private onClose() {
            this.destroy();
        }
        //打开帮助面板
        private onHelp() {
            this._helpPanel = this._helpPanel || new GodTowerDetailPanel();
            this._helpPanel.show();
        }

        /**试穿 */
        private testSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._model.suitId);
        }

        addEventListeners() {
            for (let i = 1; i <= 25; i++) {
                BC.addEvent(this, this["window_" + i], Laya.Event.CLICK, this, this.onWindowClick, [i]);
            }
            for (let i = 1; i <= 7; i++) {
                BC.addEvent(this, this["btn_info_" + i], Laya.Event.MOUSE_DOWN, this, this.showLevelInfo, [i]);
                BC.addEvent(this, this["btn_info_" + i], Laya.Event.MOUSE_UP, this, this.hideLevelInfo);
                BC.addEvent(this, this["btn_info_" + i], Laya.Event.MOUSE_OUT, this, this.hideLevelInfo);
            }
            BC.addEvent(this, this.btn_close, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btn_help, Laya.Event.CLICK, this, this.onHelp);
            BC.addEvent(this, this.btn_extReward, Laya.Event.CLICK, this, this.getExtReward);
            BC.addEvent(this, this.img_extReward, Laya.Event.CLICK, this, this.showExtReward);
            BC.addEvent(this, this.imgRewardBox, Laya.Event.CLICK, this, this.showCheapBoxInfo);
            BC.addEvent(this, this._cheapBuyPanel, "CHEAP_PACKAGE_BUY_SUCC", this, this.cheapBuySucc);
            BC.addEvent(this, this.btn_test, Laya.Event.CLICK, this, this.testSuit);
            //达到新层级开启条件
            EventManager.on("OPEN_NEW_TOWER_LEVEL", this, this.openNewLevel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("OPEN_NEW_TOWER_LEVEL", this, this.openNewLevel);
        }

        destroy() {
            super.destroy();
            this._helpPanel?.destroy();
            this._cheapBuyPanel?.destroy();
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}