
namespace spirittree {
    /**仙露id */
    const ITEM_ID: number = 1550002;
    /**
     * spirittree.SpirittreeModule
     */
    export class SpirittreeModule extends ui.spirittree.SpirittreeModuleUI {

        private _freeCount: number = 0;
        private _gainsPos: number;
        private _level: number;
        private _overtime: number;
        private _itemList: SpriteTreeFlower[];
        private _infoPanel: SpirittreeInfoPanel;
        private _oncePanel: SpirittreeOncePanel;
        private _tenPanel: SpirittreeTenPanel;
        private _upgradePanel: SpirittreeUpgradePanel;
        private _excesstime: number;

        private _adsPanel: AdsPanel;
        private _buyMedalInfo: pb.ICommonData[];
        private _accumulateDrawInfo: pb.Isc_spirit_tree_get_draw_times_info;
        private _accumulateRewardXlsArr: xls.godTreeCounter[];
        private _commonBuyInfo: pb.Isc_get_common_buy_times;
        constructor() {
            super();
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(this.loadSpiritTreeInfo());
            this.addPreLoad(xls.load(xls.manageBuildingUpdate));
            this.addPreLoad(xls.load(xls.godTreeCounter));
            this.addPreLoad(res.load(['res/animate/spirittree/tree.sk', 'res/animate/spirittree/tree.png']));
            this.addPreLoad(res.load(['unpack/spirittree/getOne.sk', 'unpack/spirittree/getOne.png']));
            this.addPreLoad(res.load(['unpack/spirittree/getSpiritKing.sk', 'unpack/spirittree/getSpiritKing.png']));
            this.addPreLoad(res.load('atlas/spirittree/spiritTreeAds.atlas'));
            this.addPreLoad(this.checkBuyMedal());
            this.addPreLoad(this.checkAccumulateDrawInfo());
        }

        async checkBuyMedal() {
            this._buyMedalInfo = await clientCore.MedalManager.getMedal([MedalDailyConst.SPIRIT_TREE_ADS2_SHOW]);
            return Promise.resolve();
        }

        async loadSpiritTreeInfo(): Promise<any> {
            const data = await net.sendAndWait(new pb.cs_get_spirit_tree_info());
            this._gainsPos = data.crystalpos;
            this._level = clientCore.LocalInfo.treeLv;
            this._excesstime = data.excesstime;
        }
        async checkAccumulateDrawInfo() {
            this._accumulateDrawInfo = await net.sendAndWait(new pb.cs_spirit_tree_get_draw_times_info({}));
            this.btnCommonBuy.visible = false;
            // this._commonBuyInfo = await net.sendAndWait(new pb.cs_get_common_buy_times({ activityId: 110 }));
        }

        init(d: any) {
            super.init(d);
            this._itemList = [];
            this._tenPanel = new SpirittreeTenPanel();
            this._upgradePanel = new SpirittreeUpgradePanel();
            this._oncePanel = new SpirittreeOncePanel();
            this.boxTime.visible = false;
        }

        public onPreloadOver() {
            // clientCore.Logger.sendLog('2021年1月8日活动', '【付费】神树上新', '打开活动面板');
            SpriteTreeFlower.templet = new Laya.Templet();
            SpriteTreeFlower.templet.parseData(res.get('res/animate/spirittree/tree.png'), res.get('res/animate/spirittree/tree.sk'))

            for (let i = 0; i < 15; i++) {
                let item = new SpriteTreeFlower(this['ball' + i] as Laya.Box);
                this._itemList.push(item);
                this._itemList[i].visible = false;
                this._itemList[i].on(Laya.Event.CLICK, this, this.onCollectOne, [i]);
            }

            this.initInfo();
        }
        public popupOver(): void {
            clientCore.UIManager.setMoneyIds([ITEM_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID])
            clientCore.UIManager.showCoinBox();
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "spiritTreeModuleOpen") {
                let flowerNum = util.get1num(this._gainsPos);
                if (flowerNum > 0) {
                    clientCore.GuideMainManager.instance.skipStep(14, 5);
                    clientCore.GuideMainManager.instance.startGuide();
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                }
            }
            this.startSpecialActivity();
            // 预告
            // this.checkNotice();
        }
        private startSpecialActivity() {
            this.showNumInfo();
            BC.addEvent(this, this.imgItem_1, Laya.Event.CLICK, this, this.showItemTips, [1]);
            BC.addEvent(this, this.imgItem_2, Laya.Event.CLICK, this, this.showItemTips, [2]);
            //额外逻辑，随活动开关
            // this.showAds();
            // this.imgCloth_1.visible = clientCore.LocalInfo.sex == 1;
            // this.imgCloth_2.visible = clientCore.LocalInfo.sex == 2;
            // BC.addEvent(this, this.btnGoExchange, Laya.Event.CLICK, this, this.goExchange);
            //////////////////////////////////////////////////下面不要
            // BC.addEvent(this, this.boxDrawReward, Laya.Event.CLICK, this, this.showContinueReward);
            // BC.addEvent(this, this.btnCommonBuy, Laya.Event.CLICK, this, this.showCommonBuyPanel);
            // this.showAccumulateReward();
            // this.showCommonBuyInfo();
        }
        private async showCommonBuyPanel() {
            let mod = await clientCore.ModuleManager.open("packageBuy.CommonBuyModule", this._commonBuyInfo.times + 114);
            mod.once(Laya.Event.CHANGED, this, this.commonBuySucc);
        }
        commonBuySucc() {
            this._commonBuyInfo.times++;
            this.showCommonBuyInfo();
        }
        showCommonBuyInfo() {
            if (this._commonBuyInfo.times < 2) {
                this.btnCommonBuy.skin = `spirittree/${this._commonBuyInfo.times == 0 ? "480神叶.png" : "680神叶.png"}`;
            }
            else {
                this.btnCommonBuy.visible = false;
            }
        }
        showAccumulateReward() {
            this.imgAccReward.scale(0.5, 0.5);
            this._accumulateRewardXlsArr = xls.get(xls.godTreeCounter).getValues();
            let accumulateDrawNum = this._accumulateDrawInfo.totalTimes;
            let haveNextFlag = false;
            for (let i = 0; i < this._accumulateRewardXlsArr.length; i++) {
                if (accumulateDrawNum >= this._accumulateRewardXlsArr[i].counter) {//满足领奖条件
                    if (util.getBit(this._accumulateDrawInfo.totalTimesRewardStatus, i + 1) == 0) {//奖励没领取
                        this.boxAccumulateInfo.visible = false;
                        this.btnAccumulateReward.visible = true;
                        let reward = this._accumulateRewardXlsArr[i].suitsAward ? this._accumulateRewardXlsArr[i].suitsAward : clientCore.LocalInfo.sex == 1 ? this._accumulateRewardXlsArr[i].femaleAward[0].v1 : this._accumulateRewardXlsArr[i].maleAward[0].v1;
                        this.imgAccReward.skin = `spiritTreeAccReward/${reward}.png`;
                        return;
                    }
                }
                else {
                    this.boxAccumulateInfo.visible = true;
                    this.btnAccumulateReward.visible = false;
                    this.txtNeedNum.text = `${this._accumulateRewardXlsArr[i].counter - accumulateDrawNum}`;
                    haveNextFlag = true;
                    let reward = this._accumulateRewardXlsArr[i].suitsAward ? this._accumulateRewardXlsArr[i].suitsAward : clientCore.LocalInfo.sex == 1 ? this._accumulateRewardXlsArr[i].femaleAward[0].v1 : this._accumulateRewardXlsArr[i].maleAward[0].v1;
                    this.imgAccReward.skin = `spiritTreeAccReward/${reward}.png`;
                    break;
                }
            }
            if (!haveNextFlag) {
                // this.boxAccumulateInfo.visible = false;
                // this.btnAccumulateReward.visible = false;
                this.boxDrawReward.visible = false;
            }
        }
        private showNumInfo() {
            this.fontNum_1.value = "" + clientCore.ItemsInfo.getItemNum(1540011);
            this.fontNum_2.value = "" + clientCore.ItemsInfo.getItemNum(1540001);
        }
        private showItemTips(index: number) {
            //1029,1030
            alert.showRuleByID(1028 + index);
        }
        private async showContinueReward() {
            let mod = await clientCore.ModuleManager.open("spiritTreeAccReward.SpiritTreeAccRewardModule");
            mod.once(Laya.Event.CLOSE, this, this.refreshDrawInfo);
        }
        private async refreshDrawInfo() {
            await this.checkAccumulateDrawInfo();
            this.showNumInfo();
            this.showAccumulateReward();
        }
        private goExchange() {
            this.needOpenMod = "sellStore.SellStoreModule";
            this.needOpenData = "clothExchange";
            this.destroy();
        }

        private showAds() {
            if (!clientCore.GuideMainManager.instance.isGuideAction) {
                if (this._buyMedalInfo[0].value == 0) {
                    if (!this._adsPanel) {
                        this._adsPanel = new AdsPanel();
                    }
                    this._adsPanel.show();
                }
            }
        }

        private initInfo() {
            this.txtLevel.text = this._level + "";
            if (this._excesstime > 0) {
                this.startTimer(this._excesstime);
            }
            else {
                this.boxTime.visible = false;
            }
            this.refreshItems();
            this.refreshUpgradePanelAndTips();
            this.changeBtnState();
        }

        private refreshUpgradePanelAndTips() {
            let lvInfoArr: xls.manageBuildingUpdate[] = _.orderBy(_.filter(xls.get(xls.manageBuildingUpdate).getValues(), { 'buildingTypeId': 99 }), 'level');
            let maxLv = _.last(lvInfoArr).level;
            let treeEnergy = xls.get(xls.globaltest).get(1).treeEnergy;
            let per = treeEnergy.v2 / 100;
            let sec = Math.floor(treeEnergy.v1 * (1 - per * Math.floor(this._level / 5)));
            this.btnUpgrade.disabled = this._level == maxLv;


            this.txtNextLvInfo.text = '当前自动获得结晶时间\n' + util.StringUtils.getDateStr(sec, ':');
            this.txtNextLvInfo.text = '升级神树可以缩短自动获得结晶的时间，提升家园中所有建筑的等级上限和种植上限'
            //下一个5级
            let nextLv = _.clamp(this._level + 5 - this._level % 5, 1, _.last(lvInfoArr).level);//边界
            //每5级减一个百分比
            let nextTime = Math.floor(treeEnergy.v1 * (1 - per * Math.floor(nextLv / 5)));
            this.txtNextLvInfo1.text = `(升级至${nextLv}级神树消耗时间降低${util.StringUtils.getDateStr(sec - nextTime, ':')})`;
        }

        private async refreshItems(needAni: boolean = false) {
            let needShowItems: SpriteTreeFlower[] = [];
            for (let i: number = 0; i < 15; i++) {
                let needShow = ((this._gainsPos >> i) & 1) == 1;
                let item = this._itemList[i];
                if (!needAni) {
                    item.visible = needShow;
                    item.playLoop();
                }
                else {
                    if (needShow) {
                        if (!item.visible)
                            needShowItems.push(item);
                    }
                    else {
                        if (item.visible)
                            item.playAni('harvest').then(() => { item.visible = false });
                    }
                }
            }
            //出现动画 需要从左到右 间隔播放
            if (needShowItems.length > 0) {
                this.mouseEnabled = false;
                needShowItems = _.sortBy(needShowItems, 'x');
                for (const item of needShowItems) {
                    await util.TimeUtil.awaitTime(100);
                    item.visible = true;
                    item.playAni('create').then(() => {
                        item.playLoop();
                    });
                }
                this.mouseEnabled = true;
            }
        }

        private startTimer(time: number) {
            this._overtime = Math.ceil(new Date().getTime() / 1000) + time;
            Laya.timer.clear(this, this.onTime);
            Laya.timer.frameLoop(15, this, this.onTime);
        }

        private onTime() {
            if (util.get1num(this._gainsPos) < 15) {
                let nowTime = Math.ceil(new Date().getTime() / 1000);
                let needTime = Math.max(0, this._overtime - nowTime);
                this.changeCountDown(needTime);
                if (needTime <= 0) {
                    Laya.timer.clear(this, this.onTime);
                    net.sendAndWait(new pb.cs_add_spirit_tree_energy()).then(
                        (data: pb.sc_add_spirit_tree_energy) => {
                            this._gainsPos = data.crystalpos;
                            this.refreshItems();
                            this.startTimer(data.excesstime);
                        }
                    );
                }
                this.boxTime.visible = true;
            }
            else {
                this.boxTime.visible = false;
            }
        }

        private onCollectOne(index: number) {
            net.sendAndWait(new pb.cs_collect_flower_god_crystal({ crystalpos: index + 1 })).then(
                (data: pb.sc_collect_flower_god_crystal) => {
                    this._gainsPos = data.crystalpos;
                    this.refreshItems(true);
                    this.mouseEnabled = false;
                    Laya.timer.once(1000, this, this.getOne, [data.godTree]);
                    if (data.excesstime > 0)
                        this.startTimer(data.excesstime);
                    util.RedPoint.reqRedPointRefresh(2401);
                    this.showNumInfo();
                }).catch(() => {
                    this.mouseEnabled = true;
                });

        }

        private onCollectAll() {
            let flowerNum = util.get1num(this._gainsPos);
            if (flowerNum > 0)
                this.mouseEnabled = false;
            if (flowerNum == 0) {
                alert.showFWords('神树上没有花神结晶可收取');
                return;
            }
            net.sendAndWait(new pb.cs_collect_all_flower_god_crystal()).then(
                (data: pb.sc_collect_all_flower_god_crystal) => {
                    this._gainsPos = data.crystalpos;
                    this.refreshItems(true);
                    util.RedPoint.reqRedPointRefresh(2401);
                    if (data.excesstime > 0)
                        this.startTimer(data.excesstime);
                    if (flowerNum == 1)
                        Laya.timer.once(1000, this, this.getOne, [data.godTree[0]]);
                    else
                        Laya.timer.once(1000, this, this.getAll, [data.godTree]);

                    this.showNumInfo();
                }).catch(() => {
                    this.mouseEnabled = true;
                });
        }

        private async getOne(rwdInfo: pb.GodTree) {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickOneFlowerGetReward") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.mouseEnabled = true;
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id)) {
                await alert.showDrawClothReward(itemInfo.reward.id, itemInfo.decomp);
            }
            else {
                clientCore.DialogMgr.ins.open(this._oncePanel, false);
                this._oncePanel.showReward(rwdInfo);
            }
        }

        private getAll(treeInfos: pb.GodTree[]) {
            this.mouseEnabled = true;
            clientCore.DialogMgr.ins.open(this._tenPanel, false);
            this._tenPanel.showReward(treeInfos, this, this.waitOnePanelClose);
            // clientCore.ModuleManager.open("drawReward.TenRewardModule",clientCore.DrawRewardInfo.create(treeInfos,this,this.waitOnePanelClose));
        }

        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._oncePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }

        private changeCountDown(time: number) {
            let str: string = "";
            let hour: number = Math.floor(time / 3600);
            time -= 3600 * hour;
            let minute: number = Math.floor(time / 60);
            time -= 60 * minute;
            if (hour > 0) {
                str += hour > 9 ? hour : "0" + hour;
                str += ":";
            }
            else {
                str += '00:';
            }
            str += minute > 9 ? minute : "0" + minute;
            str += ":";
            str += time > 9 ? time : "0" + time;
            this.txtTime.text = str;
        }

        private onUpgrade() {
            clientCore.DialogMgr.ins.open(this._upgradePanel);
            this._upgradePanel.setLvInfo();
        }

        private onUpgradeBack() {
            //如果这次升级 会造成时间变化 直接更改倒计时
            let beforeTimeLv = Math.floor(this._level / 5);
            let nowTimeLv = Math.floor(clientCore.LocalInfo.treeLv / 5);
            if (nowTimeLv > beforeTimeLv) {
                let treeEnergy = xls.get(xls.globaltest).get(1).treeEnergy;
                let per = treeEnergy.v2 / 100;
                let sec = Math.floor(treeEnergy.v1 * (1 - per * Math.floor(nowTimeLv / 5))) + Math.ceil(new Date().getTime() / 1000);//升级后倒计时时间
                //比如1级是消耗30分钟倒计时，2级是消耗25分钟。 
                //1.我现在显示还有28分钟，升级之后就刷新从25分钟开始倒计时；
                //2.现在显示还有5分钟，就继续5分钟倒计时走完下一次就是25分钟
                if (sec < this._overtime) {
                    this._overtime = sec;
                }
            }
            this._level = clientCore.LocalInfo.treeLv;
            this.txtLevel.text = this._level + "";
            this.refreshUpgradePanelAndTips();
        }

        private water(flag: number) {
            if (flag == 0 && clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSpiritTreeOneIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }

            let haveItemNum = clientCore.ItemsInfo.getItemNum(ITEM_ID);
            let needItemNum = flag == 0 ? 1 : 10;
            if (!clientCore.GuideMainManager.instance.isGuideAction) {
                //仙露不足,判断神叶
                if (haveItemNum < needItemNum) {
                    let haveLeaf = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID);
                    let needLeaf = needItemNum * 168;
                    if (clientCore.GlobalConfig.showUseLeafAlert && needLeaf >= 100) {
                        alert.useLeafAlert(needLeaf, this, () => {
                            if (haveLeaf < needLeaf) {
                                alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                                    alert.AlertLeafEnough.showAlert(needLeaf - haveLeaf);
                                }));
                            }
                            else {
                                this.sureWater(flag);
                            }
                        })
                        return;
                    }
                    else {
                        if (haveLeaf < needLeaf) {
                            alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                                alert.AlertLeafEnough.showAlert(needLeaf - haveLeaf);
                            }));
                            return;
                        }
                    }
                }
            }

            this.sureWater(flag);

        }

        private sureWater(flag: number) {
            net.sendAndWait(new pb.cs_water_spirit_tree({ flag: flag })).then(
                (data: pb.sc_water_spirit_tree) => {
                    this._gainsPos = data.crystalpos;
                    this.refreshItems(true);
                    if (flag == 0 && this._freeCount > 0) {
                        this._freeCount--;
                        this.changeBtnState();
                    }
                    if (util.get1num(this._gainsPos) >= 15) {
                        this.boxTime.visible = false;
                        Laya.timer.clear(this, this.onTime);
                    }
                    if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitFlowerRewardBack") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                    }
                    //10连完成且小于15级 弹出限时特惠
                    if (flag == 1 && clientCore.LocalInfo.userLv < 15) {
                        clientCore.LittleRechargManager.instacne.activeWindowById(2);
                    }
                    this._accumulateDrawInfo.totalTimes += (flag == 0 ? 1 : 10);
                    this.showAccumulateReward();
                }).catch(() => { });
        }

        private async onOpenPreview() {

            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 0)
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([ITEM_ID, clientCore.MoneyManager.LEAF_MONEY_ID])
                clientCore.UIManager.showCoinBox();
            })
        }

        private onClose() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickCloseSpiritTreeModule") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.destroy();
        }

        private onShowTips() {
            this.boxTips.visible = true;
        }

        private onHideTips() {
            this.boxTips.visible = false;
        }

        private onOpenInfo() {
            this._infoPanel = this._infoPanel || new SpirittreeInfoPanel();
            clientCore.DialogMgr.ins.open(this._infoPanel);
        }

        private changeBtnState() {
            let itemNum = clientCore.ItemsInfo.getItemNum(ITEM_ID);
            this.btnOne.skin = itemNum >= 1 ? 'spirittree/btn_water1.png' : 'spirittree/btn_shengye1.png'
            if (this._freeCount == 0) {
                this.btnTen.skin = itemNum >= 10 ? 'spirittree/btn_water10.png' : 'spirittree/btn_shenye10.png';
            }
            else {
                this.btnTen.skin = 'spirittree/btn_water_free.png';
            }
        }

        private onShowProb() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 1);
        }

        public addEventListeners() {
            // BC.addEvent(this, this.btnTips, Laya.Event.CLICK, this, this.onShowTips);
            BC.addEvent(this, this.boxTips, Laya.Event.CLICK, this, this.onHideTips);
            BC.addEvent(this, this.btnPro, Laya.Event.CLICK, this, this.onShowProb);
            EventManager.on(globalEvent.TREE_LEVEL_CHANGE, this, this.onUpgradeBack);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.changeBtnState);
            this.btnClose.on(Laya.Event.CLICK, this, this.onClose);
            this.btnUpgrade.on(Laya.Event.CLICK, this, this.onUpgrade);
            this.btnOne.on(Laya.Event.CLICK, this, this.water, [0]);
            this.btnTen.on(Laya.Event.CLICK, this, this.water, [1]);
            this.btnOnekey.on(Laya.Event.CLICK, this, this.onCollectAll);
            this.btnInfo.on(Laya.Event.CLICK, this, this.onOpenInfo);
            this.btnReward.on(Laya.Event.CLICK, this, this.onOpenPreview);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);

        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "spiritTreeModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "showOneFlower") {
                    var obj: any;

                    for (let i: number = 0; i < 15; i++) {
                        let needShow = ((this._gainsPos >> i) & 1) == 1;
                        if (needShow) {
                            obj = this['ball' + i];
                        }
                    }
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        public removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.TREE_LEVEL_CHANGE, this, this.onUpgradeBack);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.changeBtnState);
            this.btnClose.offAll();
            this.btnUpgrade.offAll();
            this.btnOne.offAll();
            this.btnTen.offAll();
            this.btnOnekey.offAll();
            this.btnInfo.offAll();
            this.btnReward.offAll();
        }

        public destroy() {
            for (let i: number = 0; i < 15; i++) {
                this._itemList[i].destory();
            }
            if (this._oncePanel) {
                this._oncePanel.destroy();
            }
            if (this._infoPanel) {
                this._infoPanel.destroy();
            }
            if (this._tenPanel) {
                clientCore.DialogMgr.ins.close(this._tenPanel, false);
            }
            if (this._upgradePanel) {
                clientCore.DialogMgr.ins.close(this._upgradePanel, false);
            }
            this._tip = null;
            Laya.timer.clear(this, this.onTime);
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }

        private _tip: SpirittreeNoticePanel;
        private async checkNotice(): Promise<void> {
            let value: pb.ICommonData[] = await clientCore.MedalManager.getMedal([MedalConst.SPIRITTREE_NOTICE]);
            if (value[0].value == 0) {
                this._tip = new SpirittreeNoticePanel();
                this._tip.show();
            }
        }
    }
}