namespace adventureAct {
    /**金币副本fightInfo */
    export class MoneyFightInfo extends ui.fightInfo.FightInfoModuleUI {
        private _moneyStageInfo: clientCore.StageInfo;
        private _timePanel: BuyTimePanel;
        private _bone: clientCore.Bone;
        constructor() { super(); }

        public async show() {
            clientCore.DialogMgr.ins.open(this);
            await clientCore.FormationControl.instance.initXml();
            //501 金币副本特殊信息
            await clientCore.AdventureActManager.instance.reqOneActInfo(501);
            let moneyChapterInfo = clientCore.AdventureActManager.instance.getOneActChapterInfo(501);
            this._moneyStageInfo = _.last(moneyChapterInfo.stageInfos);
            this.btnFight.skin = 'fightInfo/btn_fight2.png';
            this.txTl.visible = false;
            this.initView();
            this.updateTimesInfo();
        }

        private updateTimesInfo() {
            this.boxTime.visible = true;
            let timesInfo = clientCore.AdventureActManager.instance.getMoneyCntInfo();
            this.txtUseTimes.text = (timesInfo.totalCnt - timesInfo.passCnt).toString();
            this.txtTimes.text = '/' + timesInfo.totalCnt;
        }

        private onOpenTimePanel() {
            this._timePanel = this._timePanel || new BuyTimePanel();
            this._timePanel.show(true);
            clientCore.DialogMgr.ins.open(this._timePanel);
            this._timePanel.once(Laya.Event.CLOSE, this, this.updateTimesInfo);
            BC.addEvent(this, this._timePanel, Laya.Event.CHANGED, this, this.updateTimesInfo);
        }

        private openDetailInfo() {
            let panel = new ui.fightInfo.panel.InfoPanelUI();
            panel.sideClose = false;
            clientCore.DialogMgr.ins.open(panel);
            BC.addOnceEvent(this, panel.btnClose, Laya.Event.CLICK, this, this.closeInfoPanel, [panel]);
        }

        private closeInfoPanel(panel: core.BaseModule) {
            clientCore.DialogMgr.ins.close(panel);
            BC.removeEvent(this, panel);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.goFight);
            BC.addEvent(this, this.btnBattleArray, Laya.Event.CLICK, this, this.goBattleArray);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onOpenTimePanel);
            BC.addEvent(this, this.btnInfo, Laya.Event.CLICK, this, this.openDetailInfo);
        }
        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            this._bone && this._bone.dispose();
            this._bone = null;
            if (this._timePanel) {
                clientCore.DialogMgr.ins.close(this._timePanel, false);
                this._timePanel = null;
            }
            super.destroy();
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private initView(): void {
            this.btnInfo.visible = true;
            this.txChap.visible = false;;
            let xlsStage = xls.get(xls.stageBase).get(50101);
            this.txTitle.text = xlsStage.name;
            this.txDesc.visible = false;
            this.imgTalkBg.visible = false;
            this.boxCondition.visible = false;
            this.boxFightInfo.visible = false;
            this.boxReqAttr.visible = false;
            let xlsGoldStage = xls.get(xls.goldStage).get(clientCore.AdventureActManager.instance.getOneActChapterInfo(501).stageInfos[0].id);
            let monsterInfo: xls.monsterBase = xls.get(xls.monsterBase).get(xlsGoldStage.bossId.v1);
            if (monsterInfo) {
                // 显示怪物形象
                this._bone = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(monsterInfo.monAppear), "idle", true, this.boxCon);
                // 显示其他信息
                this.monsterPro.skin = pathConfig.getRoleAttrIco(monsterInfo.Identity);
                this.txMonsterName.text = monsterInfo.name;
            }
        }

        private async goFight(): Promise<void> {
            let stageId: number = this._moneyStageInfo.id;
            this.hide();
            await clientCore.SceneManager.ins.register();
            clientCore.SceneManager.ins.battleLayout(5, stageId);
            clientCore.ModuleManager.closeAllOpenModule();
        }

        private goBattleArray(): void {
            this.hide();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("battleArray.BattleArrayModule", null, { openWhenClose: "adventureAct.AdventureActModule", openData: 501 });
        }
    }
}