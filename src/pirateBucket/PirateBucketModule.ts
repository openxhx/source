namespace pirateBucket {
    /**
     * 欢乐海盗桶
     * pirateBucket.PirateBucketModule
     */
    export class PirateBucketModule extends ui.pirateBucket.PirateBucketModuleUI {
        private _model: PirateBucketModel;
        private _control: PirateBucketControl;

        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _sellPanel: SellSwordPanel;
        private _getPanel: GetSwardPanel;
        private _creatPanel: CreatSwordPanel;

        private _swordPos: number[];
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new PirateBucketModel(), new PirateBucketControl());
            this._control = clientCore.CManager.getControl(this.sign) as PirateBucketControl;
            this._model = clientCore.CManager.getModel(this.sign) as PirateBucketModel;
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.FAIRY_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(this._model.getBuyMedal());
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this._sellPanel = new SellSwordPanel(this.sign);
            this._getPanel = new GetSwardPanel();
            this._creatPanel = new CreatSwordPanel(this.sign);
            this.addPreLoad(res.load('res/animate/pirateBucket/Toysword.png'));
            this.addPreLoad(res.load('res/animate/pirateBucket/kukuru2.png'));
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2021年4月30日活动', '【付费】欢乐海盗桶', '打开活动面板');
            this.getSwordPos();
            this.setUI();
        }

        async getEventInfo() {
            let msg: pb.sc_joy_pirate_barrel_get_info = await this._control.getMissionInfo();
            this._model.flowerTimes = msg.flowerTimes;
            this._model.throwDiceTimes = msg.throwDiceTimes;
            this._model.isGetReward = msg.isGetReward;
        }

        private setUI() {
            this.imgRole.skin = clientCore.LocalInfo.sex == 1 ? "unpack/pirateBucket/female.png" : "unpack/pirateBucket/male.png";
            for (let i: number = 1; i <= 10; i++) {
                this["sword" + i].visible = this._swordPos[i] == 1;
            }
            this.imgRed2.visible = this._model._sellOpenFlag == 0;
            this.updateItem();
        }

        private updateItem() {
            this.labItem.text = clientCore.ItemsInfo.getItemNum(this._model.itemId).toString();
            this.imgRed.visible = this._model.checkMissionFinish();
        }

        /**解析目前插件位置 */
        private getSwordPos() {
            this._swordPos = new Array(10);
            for (let i: number = 1; i <= 10; i++) {
                this._swordPos[i] = util.getBit(this._model._swordPosFlag, i);
            }
            if (_.findIndex(this._swordPos, (o) => { return o == 0; }) <= 0) {
                this.clearSword();
            }
        }

        /**奖励预览 */
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
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 7)
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**抽奖 */
        private _loading: boolean = false;
        private _lastTime: number = 0;
        private swordAni: clientCore.Bone;
        private onPlayClick(num: number) {
            if (this._loading) return; //等待中
            if (!clientCore.GuideMainManager.instance.isGuideAction) {/**非新手情况，判断物品是否足够 */
                let itemNum = clientCore.ItemsInfo.getItemNum(this._model.itemId)
                if (itemNum < num) {
                    this.openGetPanel();
                    // alert.alertQuickBuy(this._model.itemId, num - itemNum, true);
                    return;
                }
            }
            this.mouseEnabled = false;
            if (num == 1) {
                let pos = this.randomPos();
                this.swordAni = clientCore.BoneMgr.ins.play("res/animate/pirateBucket/Toysword.sk", "1", false, this.boxSword);
                if (pos > 5) this.swordAni.scaleX = -1;
                else this.swordAni.scaleX = 1;
                this.swordAni.pos(this["sword" + pos].x + this.swordAni.scaleX * 140, this["sword" + pos].y - 115);
                this.swordAni.once(Laya.Event.COMPLETE, this, () => {
                    this["sword" + pos].visible = true;
                    this.swordAni.dispose(true);
                    this.swordAni = null;
                    this._swordPos[pos] = 1;
                    this.aniFinish(num);
                    this.mouseEnabled = true;
                    if (_.findIndex(this._swordPos, (o) => { return o == 0; }) > 0) {
                        this._model._swordPosFlag = util.setBit(this._model._swordPosFlag, pos, 1);
                        clientCore.MedalManager.setMedal([{ id: MedalConst.PIRATE_BUCKET_SWORD, value: this._model._swordPosFlag }]);
                    } else {
                        this.clearSword();
                    }
                });
            } else if (num == 10) {
                this.swordAni = clientCore.BoneMgr.ins.play("res/animate/pirateBucket/kukuru2.sk", "0", false, this.boxTen);
                this.swordAni.scaleX = 1;
                this.swordAni.pos(191, -68);
                this.boxSword.visible = false;
                this.swordAni.once(Laya.Event.START, this, () => {
                    this.imgTarget.visible = false;
                })
                this.swordAni.once(Laya.Event.COMPLETE, this, () => {
                    this.swordAni?.dispose(true);
                    this.swordAni = null;
                    this.imgTarget.visible = true;
                    this.mouseEnabled = true;
                    this.clearSword();
                    this.boxSword.visible = true;
                    this.aniFinish(num);
                });
            }
        }
        private randomPos() {
            let usefulPos = [];
            for (let i: number = 1; i <= 10; i++) {
                if (this._swordPos[i] == 0) {
                    usefulPos.push(i);
                }
            }
            return usefulPos[_.random(0, usefulPos.length - 1, false)];
        }
        private playKukuluAni(num: number, reward = null) {
            let animate = clientCore.BoneMgr.ins.play("res/animate/pirateBucket/kukuru.sk", "0", false, this.boxTarget);
            animate.pos(874, 376);
            this.imgTarget.visible = false;
            animate.once(Laya.Event.COMPLETE, this, () => {
                animate.dispose();
                this.swordAni?.dispose(true);
                this.swordAni = null;
                this.mouseEnabled = true;
                this.imgTarget.visible = true;
                this.boxSword.visible = true;
                if (num == 1 && reward != null) this.getOne(reward);
            });
        }
        private clearSword() {
            for (let i: number = 1; i <= 10; i++) {
                this._swordPos[i] = 0;
                this["sword" + i].visible = false;
            }
            clientCore.MedalManager.setMedal([{ id: MedalConst.PIRATE_BUCKET_SWORD, value: 0 }]);
        }
        private aniFinish(num: number) {
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 7, times: num })).then((data: pb.sc_common_activity_draw) => {
                    if (num == 1) {
                        let itemInfo = parseReward(data.item[0]);
                        if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                            this.playKukuluAni(1, data.item[0]);
                        } else {
                            this.getOne(data.item[0]);
                        }
                    }
                    else {
                        this.getAll(data.item);
                    }
                    // alert.showReward(clientCore.GoodsInfo.createArray(data.item));
                    this.updateItem();
                    // this._loading = false;
                }).catch(() => {
                    this._loading = false;
                })
            }
        }
        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            } else {
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

        /**概率公示 */
        private onPublic() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 15);
        }

        /**套装预览 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._model.suitId);
        }

        /**活动说明 */
        private showRule() {
            clientCore.Logger.sendLog('2021年4月30日活动', '【付费】欢乐海盗桶', '点击活动说明');
            alert.showRuleByID(1016);
        }

        /**打开制剑面板 */
        private goCreat() {
            clientCore.Logger.sendLog('2021年4月30日活动', '【付费】欢乐海盗桶', '点击制剑任务');
            this._creatPanel.showMission();
            clientCore.DialogMgr.ins.open(this._creatPanel);
        }

        /**打开商店面板 */
        private goSell() {
            clientCore.Logger.sendLog('2021年4月30日活动', '【付费】欢乐海盗桶', '点击售剑小铺');
            this._sellPanel.showGoodInfo();
            clientCore.DialogMgr.ins.open(this._sellPanel);
            if (this.imgRed2.visible) {
                clientCore.MedalManager.setMedal([{ id: MedalDailyConst.PIRATE_BUCKET_SELL, value: 1 }]);
                this.imgRed2.visible = false;
                util.RedPoint.reqRedPointRefresh(10301);
            }
        }

        /**打开道具不足提示面板 */
        private openGetPanel() {
            clientCore.DialogMgr.ins.open(this._getPanel);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnPublic, Laya.Event.CLICK, this, this.onPublic);
            BC.addEvent(this, this.btnTotalReward, Laya.Event.CLICK, this, this.showDetailPanel);
            BC.addEvent(this, this.btnPlayOne, Laya.Event.CLICK, this, this.onPlayClick, [1]);
            BC.addEvent(this, this.btnPlayTen, Laya.Event.CLICK, this, this.onPlayClick, [10]);
            BC.addEvent(this, this.btnGoSell, Laya.Event.CLICK, this, this.goSell);
            BC.addEvent(this, this.btnGoCreat, Laya.Event.CLICK, this, this.goCreat);
            EventManager.on("PIRATE_GO_CREAT", this, this.goCreat);
            EventManager.on("PIRATE_GO_SELL", this, this.goSell);
            EventManager.on("UPDATE_SWORD_ITEM", this, this.updateItem);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("PIRATE_GO_CREAT", this, this.goCreat);
            EventManager.off("PIRATE_GO_SELL", this, this.goSell);
            EventManager.off("UPDATE_SWORD_ITEM", this, this.updateItem);
        }

        destroy() {
            super.destroy();
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}