namespace produce.panel {
    /**
     * 空闲信息面板
     */
    export class LeisurePanel extends ui.produce.panel.LeisurePanelUI implements IPanel {

        private _info: clientCore.MapItemInfo | xls.shop;

        private _addMaterial: AddMaterials;

        private _stackLimit: number;

        constructor() {
            super();
            this.pos(158, 602);
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
            BC.addEvent(this, this.mcOutGood, Laya.Event.CLICK, this, this.onShowOutTips);
            this.mouseThrough = true;
        }

        update(parent: Laya.Sprite, info: clientCore.MapItemInfo | xls.shop, state: number): void {
            parent.addChild(this);
            this.addEvents();
            this._info = info;
            let itemID = 0;
            if (info instanceof clientCore.MapItemInfo) {
                let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(info.upgradeType, info.level);
                let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(info.produceFormulaID);
                itemID = info.id;
                this.txTime.changeText("用时: " + util.StringUtils.getDateStr(Math.round(formulaInfo.timeS * (100 - upgradeInfo.efficiency - clientCore.ScienceTreeManager.ins.increment(10)) / 100)));
            }
            else {
                itemID = info.itemId;
            }
            let formulaID = xls.get(xls.manageBuildingId).get(itemID).unlock1Formula;
            let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(formulaID);
            this.list.array = formulaInfo.material;
            let pair: xls.pair = new xls.pair();
            pair.v1 = formulaInfo.outputItem;
            pair.v2 = 1;
            this.mcOutGood.dataSource = pair;
            this.listRender(this.mcOutGood, -2);

            for (let i = 0; i < 3; i++) {
                this["mcArrow_" + i].visible = i <= (3 - this.list.array.length);
            }
            

            this.boxProduce.visible = state != 2;
        }

        private onShowOutTips() {
            clientCore.ToolTip.showTips(this.mcOutGood, { id: this.mcOutGood.dataSource.v1 });
        }

        updateFrame(): void { }

        dispose(): void {
            this.removeEvents();
            this._info = null;
            this.removeSelf();
        }

        private addEvents(): void {
            BC.addEvent(this, this.btnPro, Laya.Event.CLICK, this, this.onProduce);
            BC.addEvent(this,this.mcOutGood,Laya.Event.MOUSE_DOWN,this,this.showTips);
        }
        private showTips(e:Laya.Event){
            clientCore.ToolTip.showTips(this.mcOutGood, { id: this.mcOutGood.dataSource.v1 });
        }
        private removeEvents(): void {
            BC.removeEvent(this);
        }
        private onProduce(): void {
            if(this._info instanceof clientCore.MapItemInfo){
                if (this._info.produceRestTime > 0) {
                    alert.showFWords('生产中，不能再生产了！');
                    return;
                }
                if (this._info.produceCompleteNum > 0) {
                    alert.showFWords("领取完产品了才能继续生产！");
                    return;
                }
                this._addMaterial = this._addMaterial || new AddMaterials();
                this._addMaterial.show(this._info);
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceModuleStartProduce") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }
        private listRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: xls.pair = item.dataSource;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            item.txtName.text = clientCore.ItemsInfo.getItemName(data.v1);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
            if (index < 0) {
                item.num.value = "1";
            }
            else {
                item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(data.v1), data.v2);
            }
            item.num.scale(1.3, 1.3);
        }

        private listMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.MOUSE_DOWN) {
                let data: xls.pair = this.list.array[index];
                clientCore.ToolTip.showTips(this.list.getCell(index), { id: data.v1 });
            }
        }
        destroy() {
            BC.removeEvent(this);
            super.destroy();
        }
    }
}