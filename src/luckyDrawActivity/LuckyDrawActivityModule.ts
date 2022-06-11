namespace luckyDrawActivity {
    /**
     * 
     * luckyDrawActivity.LuckyDrawActivityModule
     */
    export class LuckyDrawActivityModule extends ui.luckyDrawActivity.LuckyDrawActivityModuleUI {
        private _moving: boolean = false;
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;

        private _stopAutoMoving: boolean = false;

        private _count: number;
        private _startPos: Laya.Point;
        private _todayBuyFlag: boolean;

        private _cheapBuyPanel: CheapBuyPanel;
        private _npcShowPanel: NpcDetailPanel;
        private _clothShowPanel: ClothDetailPanel;
        private _endTime: number;
        private _restTimeFlag: boolean;

        private _rechargeIDArr = [21, 22];
        private _coinBoxIDArr = [38, 39];
        private _curShowRechargeID: number;
        private _curShowCoinBoxID: number;

        private _buyMedalInfo: pb.ICommonData[];
        private _buyMedalArr: number[] = [MedalDailyConst.WANSHI_CHAOYIN_BUY_200, MedalDailyConst.WANSHI_CHAOYIN_BUY_600];

        private readonly ITEM_ID: number = 1511006;
        private readonly FAIRY_IDS: number[] = [1420012, 1420015];

        constructor() {
            super();
        }
        init() {
            this.boxCloth.visible = false;
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.eventControl));
            this.addPreLoad(xls.load(xls.giftSell));
            this.addPreLoad(xls.load(xls.SkillBase));
            this.addPreLoad(xls.load(xls.CommonShopData));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(this.checkBuyMedal());
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this._cheapBuyPanel = new CheapBuyPanel();
            this._npcShowPanel = new NpcDetailPanel();
            this._clothShowPanel = new ClothDetailPanel();
            this._count = 0;
        }
        async checkBuyMedal() {
            this._buyMedalInfo = await clientCore.MedalManager.getMedal(this._buyMedalArr);
            return Promise.resolve();
        }
        onPreloadOver() {
            clientCore.Logger.sendLog('2020年5月22日活动', '【付费】玩世朝隐', '打开玩世朝隐界面');
            //先检查活动时间再检查礼包状态  礼包状态要用到时间
            this.showActivityTime();
            this.checkBuyCheapReward();
            this.checkBuyCheapCoin();
            this._cheapBuyPanel.init(null);
            this._npcShowPanel.init();
            this._clothShowPanel.init();
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;

            //价格
            // let cls: xls.giftSell = xls.get(xls.giftSell).get(1);
            // this.txOne.changeText(cls.oneLottery[0].v2 + "");
            // this.txTen.changeText(cls.tenLottery[0].v2 + "");
            //属性
            // for (let i: number = 1; i <= 2; i++) {
            //     let cls: xls.characterId = xls.get(xls.characterId).get(this.FAIRY_IDS[i - 1]);
            //     if (cls) {
            //         this['imgAttr' + i].skin = pathConfig.getRoleAttrIco(cls.Identity);
            //         this['imgBattleType' + i].skin = pathConfig.getRoleBattleTypeIcon(cls.battleType);
            //     }
            // }
        }

        popupOver() {
            clientCore.UIManager.setMoneyIds([this.ITEM_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }
        private showActivityTime() {
            let timeStr = xls.get(xls.eventControl).get(19).eventTime;
            let endTimeStr = timeStr.split("_")[1];
            endTimeStr = endTimeStr.replace(/\-/g, '/');
            this._endTime = Math.floor(new Date(endTimeStr).getTime() / 1000);
            let restTime = this._endTime - clientCore.ServerManager.curServerTime;
            if (restTime < 0) {
                restTime = 0;
            }
            let restDay = Math.floor(restTime / 86400);
            if (restDay < 1) {
                let time = restTime % 86400;
                this.txtRestDay.text = util.StringUtils.getDateStr(time);
                this._restTimeFlag = true;
                Laya.timer.loop(1000, this, this.refreshActivityTime);
            }
            else {
                this.txtRestDay.text = "" + restDay + "天";
                this._restTimeFlag = false;
            }
        }
        /**活动剩余时间在这里 */
        private refreshActivityTime() {
            let restTime = this._endTime - clientCore.ServerManager.curServerTime;
            if (restTime < 0) {
                restTime = 0;
            }
            let txtTime = util.StringUtils.getDateStr(restTime % 86400);
            if (this._restTimeFlag) this.txtRestDay.text = txtTime;
        }
        /**检查超值礼包购买情况 */
        private checkBuyCheapReward() {
            let buyRewardFlag = false;
            for (let i = 0; i < this._rechargeIDArr.length; i++) {
                let lastFloorTime = util.TimeUtil.floorTime(clientCore.RechargeManager.checkBuyLimitInfo(this._rechargeIDArr[i]).lastTime);
                let curFloorTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
                if (lastFloorTime < curFloorTime) {
                    if (i == 0) {
                        this.imgBox.skin = "luckyDrawActivity/超值礼包6.png";
                        this.btnBox.skin = "luckyDrawActivity/超值价6.png";
                    }
                    else if (i == 1) {
                        this.imgBox.skin = "luckyDrawActivity/超值礼包68.png";
                        this.btnBox.skin = "luckyDrawActivity/超值价68.png";
                    }
                    this._curShowRechargeID = this._rechargeIDArr[i];
                    buyRewardFlag = true;
                    break;
                }
            }
            this.btnBox.mouseEnabled = buyRewardFlag;
            if (!buyRewardFlag) this.btnBox.skin = "luckyDrawActivity/明日重置.png";
        }
        /**检查灵石礼包购买情况 */
        private checkBuyCheapCoin() {
            let showFlag = false;
            for (let i = 0; i < this._coinBoxIDArr.length; i++) {
                if (this._buyMedalInfo[i].value == 0) {
                    if (i == 0) {
                        this.imgCheapCoin.skin = "luckyDrawActivity/灵豆礼包200.png";
                        this.btnCheapCoin.skin = "luckyDrawActivity/灵豆200.png";
                    }
                    else if (i == 1) {
                        this.imgCheapCoin.skin = "luckyDrawActivity/灵豆礼包600.png";
                        this.btnCheapCoin.skin = "luckyDrawActivity/灵豆600.png";
                    }
                    this._curShowCoinBoxID = this._coinBoxIDArr[i];
                    showFlag = true;
                    break;
                }
            }
            this.btnCheapCoin.mouseEnabled = showFlag;
            if (!showFlag) this.btnCheapCoin.skin = "luckyDrawActivity/明日重置.png";
        }

        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 2)
        }
        private showHelp() {
            alert.showRuleByID(1009);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            Laya.timer.loop(1000, this, this.startMoveBgImg);
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnShowRewardDetail, Laya.Event.CLICK, this, this.showDetailPanel);
            BC.addEvent(this, this.btnCallOne, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnCallTen, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.startMove);
            BC.addEvent(this, this.btnBox, Laya.Event.CLICK, this, this.showCheapBoxInfo, [1]);
            BC.addEvent(this, this.btnCheapCoin, Laya.Event.CLICK, this, this.showCheapBoxInfo, [2]);
            BC.addEvent(this, this._cheapBuyPanel, "CHEAP_PACKAGE_BUY_SUCC", this, this.cheapBuySucc);
            BC.addEvent(this, this.npcDetail1, Laya.Event.CLICK, this, this.showNpcDetail, [1]);
            BC.addEvent(this, this.npcDetail2, Laya.Event.CLICK, this, this.showNpcDetail, [2]);
            BC.addEvent(this, this._npcShowPanel, Laya.Event.CLICK, this, this.hideNpcPanel);
            BC.addEvent(this, this.btnTry1, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnTry2, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTry3, Laya.Event.CLICK, this, this.onTryClick, [3]);
            BC.addEvent(this, this._clothShowPanel, Laya.Event.CLICK, this, this.hideClothPanel);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onSideClick, ["right"]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onSideClick, ["left"]);
            BC.addEvent(this, this.btn_help, Laya.Event.CLICK, this, this.showHelp);
        }
        private onSideClick(dir: string) {
            if (this._moving) {
                return;
            }
            this._count = 0;
            if (dir == "left") {
                if (this.boxPet.visible) {
                    this.moveLeft(this.boxPet, this.boxCloth);
                }
                else {
                    this.moveLeft(this.boxCloth, this.boxPet);
                }
            }
            else {
                if (this.boxPet.visible) {
                    this.moveRight(this.boxPet, this.boxCloth);
                }
                else {
                    this.moveRight(this.boxCloth, this.boxPet);
                }
            }
        }
        private onTryClick(index: number) {
            // this._clothShowPanel.x = (1334 - Laya.stage.width) / 2;
            // this._clothShowPanel.showCloth(index);
            // this.addChild(this._clothShowPanel);
            // this._clothShowPanel.showPanel();

            let cloths: number[] = [2100056, 2100045, 2100181];
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", cloths[index - 1]);
        }
        private hideClothPanel() {
            this._clothShowPanel.hidePanel();
        }

        private hideNpcPanel() {
            clientCore.DialogMgr.ins.close(this._npcShowPanel);
        }
        private showNpcDetail(index: number) {
            // this._npcShowPanel.showNpc(index);
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.FAIRY_IDS[index - 1])
            // clientCore.DialogMgr.ins.open(this._npcShowPanel);
        }
        /**
         * 显示礼包信息
         * @param type 超值礼包传1；灵豆礼包传2
         */
        private showCheapBoxInfo(type: number) {
            let targetId = type == 1 ? this._curShowRechargeID : this._curShowCoinBoxID;
            this._cheapBuyPanel.showInfo(targetId, type);
            clientCore.DialogMgr.ins.open(this._cheapBuyPanel);
        }
        private cheapBuySucc(id: number) {
            let type = _.indexOf(this._rechargeIDArr, id) >= 0 ? 1 : 2;
            if (type == 1) this.checkBuyCheapReward();
            if (type == 2) {
                let index = _.indexOf(this._coinBoxIDArr, id);
                this._buyMedalInfo[index].value = 1;
                this.checkBuyCheapCoin();
            }
        }
        private startMove(e: Laya.Event) {
            this._startPos = new Laya.Point(this.mouseX, this.mouseY);
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseRelease);
            BC.addEvent(this, this, Laya.Event.ROLL_OUT, this, this.onMouseRelease);
        }
        private onMouseMove(e: Laya.Event): void {
            if (this._moving) {
                return;
            }
            let curPos = new Laya.Point(this.mouseX, this.mouseY);
            if (Math.abs(curPos.x - this._startPos.x) > Math.abs(curPos.y - this._startPos.y)) {
                if (Math.abs(curPos.x - this._startPos.x) > 200) {
                    this.onMouseRelease(null);
                    this._count = 0;
                    if (curPos.x > this._startPos.x) {
                        if (this.boxPet.visible) {
                            this.moveRight(this.boxPet, this.boxCloth);
                        }
                        else {
                            this.moveRight(this.boxCloth, this.boxPet);
                        }
                    }
                    else {
                        if (this.boxPet.visible) {
                            this.moveLeft(this.boxPet, this.boxCloth);
                        }
                        else {
                            this.moveLeft(this.boxCloth, this.boxPet);
                        }
                    }
                }
            }
        }
        private onMouseRelease(e: Laya.Event): void {
            BC.removeEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseRelease);
            BC.removeEvent(this, this, Laya.Event.ROLL_OUT, this, this.onMouseRelease);
        }
        private _loading: boolean = false;
        private _lastTime: number = 0;
        private callClick(num: number) {
            if (this._loading) return; //等待中
            if (!clientCore.GuideMainManager.instance.isGuideAction) {/**非新手情况，判断物品是否足够 */
                let itemNum = clientCore.ItemsInfo.getItemNum(this.ITEM_ID)
                if (itemNum < num) {
                    alert.alertQuickBuy(this.ITEM_ID, num - itemNum, true);
                    return;
                }
            }
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 1, times: num })).then((data: pb.sc_common_activity_draw) => {
                    if (num == 1) {
                        this.getOne(data.item[0])
                    }
                    else {
                        this.getAll(data.item);
                    }
                }).catch(() => {
                    this._loading = false;
                })
            }
        }
        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            }
            else {
                clientCore.DialogMgr.ins.open(this._onePanel, false);
                this._onePanel.showReward(rwdInfo);
            }
            this._loading = false;
        }

        private getAll(treeInfos: pb.IdrawReward[]) {
            clientCore.DialogMgr.ins.open(this._tenPanel, false);
            this._tenPanel.showReward(treeInfos, this, this.waitOnePanelClose);
            this._loading = false;
        }
        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._onePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }
        private async showDetailPanel() {
            // let arr = _.filter(xls.get(xls.godTree).getValues(), (o) => { return o.module == 1 });
            // let rewardInfo: clientCore.RewardDetailInfo = new clientCore.RewardDetailInfo();
            // arr = _.uniqBy(arr, (o) => { return clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1 });
            // for (let i = 0; i < arr.length; i++) {
            //     rewardInfo.rewardArr[arr[i].type].push(clientCore.LocalInfo.sex == 1 ? arr[i].item.v1 : arr[i].itemMale.v1);
            // }
            // rewardInfo.newTagIdArr = _.compact(_.map(arr, (o) => {
            //     if (o.isNew)
            //         return clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1;
            //     else
            //         return 0;
            // }));
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 1)
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this.ITEM_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID])
                clientCore.UIManager.showCoinBox();
            })
        }
        private startMoveBgImg() {
            if (this._stopAutoMoving) {
                this._count = 0;
                return;
            }
            this._count++;
            if (this._count % 8 == 0) {
                if (clientCore.DialogMgr.ins.curShowPanelNum > 0 || this._clothShowPanel.parent) {
                    this._count = 0;
                    return;
                }
                if (this.boxPet.visible) {
                    this.moveLeft(this.boxPet, this.boxCloth);
                }
                else {
                    this.moveLeft(this.boxCloth, this.boxPet);
                }
                this._count = 0;
            }
        }
        /**
         * 背景左移滑动效果
         * @param outBox 
         * @param inBox 
         */
        private moveLeft(outBox: Laya.Box, inBox: Laya.Box): void {
            this._moving = true;
            if (outBox.width < 1500) {/**服装 */
                let aimPosX = -(outBox.width) - clientCore.LayerManager.mainLayer.x;
                Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                    outBox.visible = false;
                    this._moving = false;
                }));

                inBox.x = Laya.stage.width - clientCore.LayerManager.mainLayer.x + 151;
                inBox.visible = true;
                Laya.Tween.to(inBox, { x: 0 }, 500);
            }
            else {/**花精灵 */
                let aimPosX = -(outBox.width) - clientCore.LayerManager.mainLayer.x;
                Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                    outBox.visible = false;
                    this._moving = false;
                }));
                inBox.visible = true;
                inBox.x = Laya.stage.width - clientCore.LayerManager.mainLayer.x + 52;
                Laya.Tween.to(inBox, { x: 0 }, 500);
            }
        }
        /**
         * 背景右移滑动效果
         * @param outBox 
         * @param inBox 
         */
        private moveRight(outBox: Laya.Box, inBox: Laya.Box): void {
            this._moving = true;
            if (outBox.width < 1500) {/**服装 */
                let aimPosX = Laya.stage.width - clientCore.LayerManager.mainLayer.x + 52;
                Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                    outBox.visible = false;
                    this._moving = false;
                }));

                inBox.x = -(inBox.width - 0) - clientCore.LayerManager.mainLayer.x;
                inBox.visible = true;
                Laya.Tween.to(inBox, { x: 0 }, 500);
            }
            else {
                let aimPosX = Laya.stage.width - clientCore.LayerManager.mainLayer.x + 182;
                Laya.Tween.to(outBox, { x: aimPosX }, 500, null, new Laya.Handler(this, () => {
                    outBox.visible = false;
                    this._moving = false;
                }));

                inBox.x = -(inBox.width - 0) - clientCore.LayerManager.mainLayer.x;
                inBox.visible = true;
                Laya.Tween.to(inBox, { x: 0 }, 500);
            }
        }
        removeEventListeners() {
            Laya.timer.clear(this, this.startMoveBgImg);
        }
        destroy() {
            clientCore.UIManager.releaseCoinBox();
            // Laya.timer.clear(this, this.refreshCheapRewardRestTime);
            this._onePanel && this._onePanel.destroy();
            this._tenPanel && this._tenPanel.destroy();
            this._cheapBuyPanel && this._cheapBuyPanel.destroy();
            super.destroy();
        }
    }
}