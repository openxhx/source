namespace dbfEvent {
    /**
     * 2020 端午节活动 端阳盛景
     * dbfEvent.DbfEventModule
     */
    export class DbfEventModule extends ui.dbfEvent.DbfEventModuleUI {
        private _model: DbfEventModel;
        private _control: DbfEventControl;

        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _buyPanel: DbfEventBuyPanel;

        private _animal: clientCore.Bone;
        constructor() {
            super();
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new DbfEventModel(), new DbfEventControl());
            this._control = clientCore.CManager.getControl(this.sign) as DbfEventControl;
            this._model = clientCore.CManager.getModel(this.sign) as DbfEventModel;
            clientCore.UIManager.setMoneyIds([this._model.materialId, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.giftSell));
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(res.load('res/animate/dbfEvent/zongzi.sk'));
            this.addPreLoad(res.load('res/animate/dbfEvent/zongzi.png'));
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this._buyPanel = new DbfEventBuyPanel(this.sign);
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年6月24日活动', '【主活动】端阳盛景', '打开活动面板');
            if (this._model.isStory == 0) {
                this.watchStory();
                this._model.isStory = 1;
                this._control.watchStory();
            }
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this._model.getCostCount();
            this._model.getMaxDraw();
            if (this._model.maxDrawCount > 0) this.labGiveCount.text = "1";
            else this.labGiveCount.text = "0";
            this.setCoinInfo();
        }

        async getEventInfo() {
            let msg: pb.sc_get_dragon_boat_festival_info = await this._control.getEventInfo();
            this._model.isStory = msg.story;
            this._model.leafBuyTimes = msg.leavesBuyTimes;
            this._model.coinBuyTimes = msg.coinBuyTimes;
        }

        /**设置材料信息 */
        private setCoinInfo() {
            clientCore.UIManager.releaseCoinBox();
            clientCore.UIManager.setMoneyIds([this._model.materialId, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.labRiceCount.text = clientCore.ItemsInfo.getItemNum(this._model.itemIds[0]) + "/" + this._model.costCount[0];
            this.labBeanCount.text = clientCore.ItemsInfo.getItemNum(this._model.itemIds[1]) + "/" + this._model.costCount[1];
            this.labLeafCount.text = clientCore.ItemsInfo.getItemNum(this._model.itemIds[2]) + "/" + this._model.costCount[2];
            if (this.labGiveCount.text == "0" && this._model.maxDrawCount > 0) {
                this.labGiveCount.text = "1";
            }
            this.boxContentUI.visible = true;
        }

        /**相关地图id */
        private readonly mapIds: number[] = [12, 13, 18];
        /**获取抽奖道具 */
        private toGetItems(type: ItemType) {
            // net.sendAndWait(new pb.cs_trigger_food_material_event({ id: this._model.itemIds[type] })).then((msg) => {
            //     clientCore.ModuleManager.open("dbfPick.DbfPickModule", msg);
            // })
            clientCore.MapManager.enterWorldMap(this.mapIds[type]);
            this.destroy();
        }
        
        //#region 抽奖相关
        /**抽奖 */
        private _loading: boolean = false;
        private _lastTime: number = 0;
        private drawReward() {
            if (this._loading) return; //等待中
            let num = Number(this.labGiveCount.text);
            if (num == 0) return;
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                this._animal = clientCore.BoneMgr.ins.play("res/animate/dbfEvent/zongzi.sk", "hecheng", false, this.boxContent);
                this._animal.pos(295, 255);
                this.boxContentUI.visible = false;
                this._animal.once(Laya.Event.COMPLETE, this, () => {
                    this._animal.dispose();
                    this._animal = null;
                    net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 1, times: num })).then((data: pb.sc_common_activity_draw) => {
                        if (num == 1) {
                            this.getOne(data.item[0])
                        }
                        else {
                            this.getAll(data.item);
                        }
                        this._model.getMaxDraw();
                        this.setCoinInfo();
                        this.setDrawCount(0);
                    }).catch(() => {
                        this._loading = false;
                    })
                })

            }
        }
        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            let partsIds: number[] = clientCore.SuitsInfo.getSuitInfo(this._model.suitId).clothes;
            if (partsIds.indexOf(itemInfo.reward.id) >= 0 && !itemInfo.decomp) {
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
        //#endregion
        
        /**设置抽奖次数 */
        private setDrawCount(change: number) {
            let count = Number(this.labGiveCount.text);
            count += change;
            count = _.clamp(count, 0, this._model.maxDrawCount);
            this.labGiveCount.text = count.toString();
        }

        /**购买食材包 */
        private buyMaterial() {
            this._buyPanel.showInfo();
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**播放剧情 */
        private watchStory() {
            clientCore.AnimateMovieManager.showAnimateMovie(80130, null, null);
        }

        /**概率公示 */
        private onPublic() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 6);
        }

        /**套装预览 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this._model.suitId);
        }

        /**活动说明 */
        private showRule() {
            alert.showRuleByID(1026);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnOut, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnPublic, Laya.Event.CLICK, this, this.onPublic);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.buyMaterial);
            BC.addEvent(this, this.btnRice, Laya.Event.CLICK, this, this.toGetItems, [ItemType.rice]);
            BC.addEvent(this, this.btnBean, Laya.Event.CLICK, this, this.toGetItems, [ItemType.bean]);
            BC.addEvent(this, this.btnLeaf, Laya.Event.CLICK, this, this.toGetItems, [ItemType.leaf]);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.drawReward);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.setDrawCount, [1]);
            BC.addEvent(this, this.btnLess, Laya.Event.CLICK, this, this.setDrawCount, [-1]);
            BC.addEvent(this, this.btnStory, Laya.Event.CLICK, this, this.watchStory);
            EventManager.on("BOX_BUY_BACK", this, this.setCoinInfo);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("BOX_BUY_BACK", this, this.setCoinInfo);
        }

        destroy() {
            super.destroy();
            this._buyPanel?.destroy();
            this._animal?.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._animal = this._model = this._control = this._buyPanel = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}