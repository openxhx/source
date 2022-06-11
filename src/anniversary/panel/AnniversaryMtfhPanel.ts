namespace anniversary {
    export class AnniversaryMtfhPanel extends ui.anniversary.panel.AnniversaryMtfhPanelUI {
        private readonly suitId: number = 2100210;
        private readonly medalId: number = 42;
        private config: xls.medalChallenge[];
        private _model: AnniversaryModel;
        private _control: AnniversaryControl;
        private _itemArr: ui.anniversary.render.MtfhProgressItemUI[];
        private onAddEvent: boolean = false;
        private _buyPanel: MtfhBuyPanel;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as AnniversaryModel;
            this._control = clientCore.CManager.getControl(sign) as AnniversaryControl;
            this.addEventListeners();
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            // this.config = _.filter(xls.get(xls.medalChallenge).getValues(), (o) => { return o.type == 1 });
            this.panel.vScrollBarSkin = "";
            this._buyPanel = new MtfhBuyPanel(sign);
        }
        public onShow() {
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '打开满庭芳华面板');
            this.setUI();
        }

        private setUI() {
            this.txtCurActive.text = "当前:" + this._model.activeValue.toString();
            this.btnActive.fontX = this._model.medalBuyStatus == 1 ? 30 : 16;
            this.btnActive.fontSkin = this._model.medalBuyStatus == 1 ? "anniversary/l_p_yjh.png" : "anniversary/l_p_jhxz.png";
            this.btnActive.mouseEnabled = this._model.medalBuyStatus == 0;
            // let max = this.config[this.config.length - 1].cost;
            // let maxLenth = (this.config.length - 1) * 124;
            // this.list.height = this.config.length * 124;
            // this.boxActive.height = this.lineBg.height = maxLenth;
            // this.line.height = this._model.activeValue / max * maxLenth;
            // this.list.array = this.config;
            // if (!this._itemArr) this._itemArr = [];
            // for (let i: number = 0; i < this.config.length; i++) {
            //     if (!this._itemArr[i]) {
            //         this._itemArr[i] = new ui.anniversary.render.MtfhProgressItemUI();
            //         this.boxActive.addChild(this._itemArr[i]);
            //         this._itemArr[i].pos(37.5, this.config[i].cost / max * maxLenth, true);
            //         this._itemArr[i].labCount.text = this.config[i].cost.toString();
            //     }
            //     this._itemArr[i].imgBg.skin = this.config[i].cost <= this._model.activeValue ? "anniversary/active1.png" : "anniversary/active2.png";
            // }
            this.imgMaleBg.skin = this._model.medalBuyStatus == 1 ? "unpack/anniversary/椭圆激活.png" : "unpack/anniversary/椭圆.png";
        }

        private listRender(item: ui.anniversary.render.MtfhItemUI, index: number) {
            // let data: xls.medalChallenge = item.dataSource;
            // item.imgGotFree.visible = util.getBit(this._model.activeRewardStatus, index + 1) == 1;
            // item.imgGotCost.visible = util.getBit(this._model.activeVIPRewardStatus, index + 1) == 1;
            // item.imgGot.visible = item.imgGotFree.visible && item.imgGotCost.visible;
            // item.btnGet.visible = !item.imgGot.visible;
            // item.btnGet.fontX = item.imgGotFree.visible ? 17 : 41;
            // item.btnGet.fontSkin = item.imgGotFree.visible ? "anniversary/l_p_get2.png" : "commonBtn/l_p_get.png";
            // item.btnGet.disabled = this._model.activeValue < data.cost || (item.imgGotFree.visible && this._model.medalBuyStatus == 0);
            // let rewardCost: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleCredit : data.maleCredit;
            // clientCore.GlobalConfig.setRewardUI(item.costReward1, { id: rewardCost[0].v1, cnt: rewardCost[0].v2, showName: false, lock: this._model.medalBuyStatus == 0 });
            // clientCore.GlobalConfig.setRewardUI(item.costReward2, { id: rewardCost[1].v1, cnt: rewardCost[1].v2, showName: false, lock: this._model.medalBuyStatus == 0 });
            // if (!this.onAddEvent) {
            //     let rewardFree: xls.pair[] = clientCore.LocalInfo.sex == 1 ? data.femaleFree : data.maleFree;
            //     clientCore.GlobalConfig.setRewardUI(item.freeReward, { id: rewardFree[0].v1, cnt: rewardFree[0].v2, showName: false });
            //     BC.addEvent(this, item.freeReward, Laya.Event.CLICK, this, this.showRewardInfo, [item.freeReward, rewardFree[0].v1]);
            //     BC.addEvent(this, item.costReward1, Laya.Event.CLICK, this, this.showRewardInfo, [item.costReward1, rewardCost[0].v1]);
            //     BC.addEvent(this, item.costReward2, Laya.Event.CLICK, this, this.showRewardInfo, [item.costReward2, rewardCost[1].v1]);
            //     BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [index]);
            // }
            // if (index == this.config.length - 1) {
            //     this.onAddEvent = true;
            // }
        }

        private showRewardInfo(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        public hide() {
            this.visible = false;
        }

        /**领奖 */
        private async getReward(idx: number) {
            let msg = await this._control.getReward(2, this.config[idx].id);
            alert.showReward(msg.item);
            this._model.activeRewardStatus = util.setBit(this._model.activeRewardStatus, idx + 1, 1);
            if (this._model.medalBuyStatus == 1) this._model.activeVIPRewardStatus = util.setBit(this._model.activeVIPRewardStatus, idx + 1, 1);
            this.list.refresh();
            await util.RedPoint.reqRedPointRefresh(11802);
            EventManager.event("ANNIVERSARY_REFRESH_TAB");
        }

        /**试穿套装 */
        private trySuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', this.suitId);
        }

        /**前往每日任务 */
        private gotoDailyTask() {
            clientCore.Logger.sendLog('2020年7月17日活动', '【付费】花恋流年', '点击满庭芳华立即前往按钮');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open("task.TaskModule", 1);
        }

        /**激活勋章 */
        private activeMedal() {
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        /**帮助说明 */
        private showRule() {
            alert.showRuleByID(1041);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.gotoDailyTask);
            BC.addEvent(this, this.btnActive, Laya.Event.CLICK, this, this.activeMedal);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            EventManager.on("MTFH_MEDAL_ACTIVE", this, this.setUI);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("MTFH_MEDAL_ACTIVE", this, this.setUI);
        }

        public destroy() {
            super.destroy();
            this.removeEventListeners();
            this._model = this._control = null;
        }
    }
}