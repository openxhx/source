namespace anniversary {
    export class AnniversaryHzlyPanel extends ui.anniversary.panel.AnniversaryHzlyPanelUI {
        private readonly suitId: number = 2110026;
        private readonly coinId: number = 1511008;
        private _model: AnniversaryModel;
        private _control: AnniversaryControl;
        private reward: xls.rechargeActivity[];
        private _onePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private tagInfo: any[] = [{ name: "静谧之蓝", open: false }, { name: "雨后夏夜", open: true }];

        private _engryInfo: pb.sc_year_of_flower_love_stream_get_energy_cnt;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as AnniversaryModel;
            this._control = clientCore.CManager.getControl(sign) as AnniversaryControl;
            this._onePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
            this.addEventListeners();
            this.imgFemale1.visible = this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale1.visible = this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.listTag.renderHandler = new Laya.Handler(this, this.tagRender);
            this.listTag.selectEnable = true;
            this.listTag.selectHandler = new Laya.Handler(this, this.tagMouse);
            this.listTag.repeatY = this.tagInfo.length;
            this.listTag.array = this.tagInfo;
            this.box1.visible = true;
            this.box0.visible = false;
        }

        public onShow() {
            this.sendData();
            this.reward = _.filter(xls.get(xls.rechargeActivity).getValues(), (o) => { return o.type == 7 });
            this.setUI();
        }

        private async setUI() {
            /**静谧之蓝 */
            this.labCur.text = this._model.totalCost.toString();
            this.list.array = this.reward;
            /**恋恋久久 */
            this._engryInfo = await this._control.getEnergyInfo();
            this.labEngerCount.text = this._engryInfo.energyNum.toString();

            this.listTag.refresh();
        }

        private tagRender(item: ui.anniversary.render.TagRenderUI) {

            item.imgSelect.visible = item.dataSource.open;
            if (item.dataSource.name == "静谧之蓝") {
                item.imgRed.visible = util.RedPoint.checkShow([11803]);
                item.imgName.skin = `anniversary/${item.dataSource.name}.png`;
            }
            if (item.dataSource.name == "雨后夏夜") {
                item.imgRed.visible = util.RedPoint.checkShow([11804, 11806]);
                item.imgName.skin = "anniversary/title_yhxy.png";
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
            this.sendData();
        }

        private listRender(item: ui.anniversary.render.HzlyItemUI) {
            let data: xls.rechargeActivity = item.dataSource;
            let _index = this.reward.indexOf(data);
            let reward = clientCore.LocalInfo.sex == 1 ? data.rewardFamale : data.rewardMale;
            if (!item.list.renderHandler) {
                item.list.renderHandler = new Laya.Handler(this, this.setReward);
            }
            item.list.mouseHandler = new Laya.Handler(this, this.rewardClick, [_index]);
            item.list.repeatX = reward.length;
            item.list.array = reward;
            item.labTip.visible = item.btnGet.disabled = data.cost > this._model.totalCost;
            item.btnGet.visible = util.getBit(this._model.costRewardStatus, _index + 1) == 0;
            item.imgGot.visible = util.getBit(this._model.costRewardStatus, _index + 1) == 1;
            if (item.labTip.visible) item.labTip.text = `再消耗${data.cost - this._model.totalCost}即可领取`;
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [_index]);
        }

        private rewardClick(idx: number, e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let config: xls.rechargeActivity = this.reward[idx];
                let reward: xls.pair = (clientCore.LocalInfo.sex == 1 ? config.rewardFamale : config.rewardMale)[index];
                if (reward) {
                    let item = _.find(this.list.cells, (o) => { return o.dataSource == config });
                    clientCore.ToolTip.showTips((item as any).list.cells[index], { id: reward.v1 });
                    return;
                };
            }
        }

        private setReward(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        public hide() {
            this.visible = false;
        }

        /**统计项 */
        private sendData() {
            if (this.tagInfo[1].open == true) clientCore.Logger.sendLog('2020年7月24日活动', '【付费】花恋流年', '打开花之恋语第二页面板');
            if (this.tagInfo[0].open == true) clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '打开花之恋语面板');
        }

        /**领奖 */
        private async getReward(idx: number) {
            let msg = await this._control.getReward(3, this.reward[idx].packageID);
            alert.showReward(msg.item);
            this._model.costRewardStatus = util.setBit(this._model.costRewardStatus, idx + 1, 1);
            this.list.refresh();
            await util.RedPoint.reqRedPointRefresh(11803);
            EventManager.event("ANNIVERSARY_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit(suitId: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        //#region 抽奖
        private _loading: boolean = false;
        private _lastTime: number = 0;
        private callClick(value: number) {
            if (this._loading) return; //等待中
            if (!clientCore.GuideMainManager.instance.isGuideAction) {/**非新手情况，判断物品是否足够 */
                if (this._engryInfo.energyNum < 50 * value) {
                    alert.showFWords("花语能量不足~");
                    return;
                }
            }
            if ((Date.now() - this._lastTime) > 500) {
                this._lastTime = Date.now();
                this._loading = true;
                this.mouseEnabled = false;
                clientCore.UIManager.refrehMoneyEvent(null);
                let ani = clientCore.BoneMgr.ins.play("res/animate/anniversary/flower drop.sk", "animation", false, this.imgHua);
                ani.pos(500, 100);
                ani.once(Laya.Event.COMPLETE, this, () => {
                    ani.dispose();
                    this.mouseEnabled = true;
                    clientCore.UIManager.releaseEvent();
                    net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 2, times: value })).then(async (data: pb.sc_common_activity_draw) => {
                        if (value == 1) {
                            this.getOne(data.item[0]);
                        }
                        else {
                            this.getAll(data.item);
                        }
                        this.setUI();
                        await util.RedPoint.reqRedPointRefresh(11804);
                        await util.RedPoint.reqRedPointRefresh(11806);
                        EventManager.event("ANNIVERSARY_REFRESH_TAB");
                    }).catch(() => {
                        this._loading = false;
                    })
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
        //#endregion

        /**奖励总览 */
        private async preReward() {
            clientCore.UIManager.releaseCoinBox();
            let mod = await clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 2);
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '花语之恋点击奖励总览按钮');
            mod.once(Laya.Event.CLOSE, this, () => {
                clientCore.UIManager.setMoneyIds([this._model.drawCoin, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
                clientCore.UIManager.showCoinBox();
            })
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 10)
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1040);
        }

        /**更新tab状态 */
        private refreshTab() {
            this.listTag.refresh();
        }

        addEventListeners() {
            /**静谧之蓝 */
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit, [this.suitId]);
            /**恋恋久久 */
            BC.addEvent(this, this.btnTryLljj, Laya.Event.CLICK, this, this.trySuit, [2110035]);
            BC.addEvent(this, this.btnGlLljj, Laya.Event.CLICK, this, this.onProbClick);
            BC.addEvent(this, this.btnDrawLljj, Laya.Event.CLICK, this, this.callClick, [1]);
            BC.addEvent(this, this.btnDrawTenLljj, Laya.Event.CLICK, this, this.callClick, [10]);
            BC.addEvent(this, this.btnZlLljj, Laya.Event.CLICK, this, this.preReward);
            EventManager.on("ANNIVERSARY_REFRESH_TAB", this, this.refreshTab);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("ANNIVERSARY_REFRESH_TAB", this, this.refreshTab);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._tenPanel?.destroy();
            this._onePanel?.destroy();
            this._tenPanel = this._onePanel = this.reward = this._model = this._control = null;
        }
    }
}