namespace produce.panel {
    /**
     * 补充材料
     */
    export class AddMaterials extends ui.produce.panel.AddMaterialUI {

        private _info: clientCore.MapItemInfo;
        private _maxPro: number;
        private _curNum: number;
        private _needLeafNum: number;

        constructor() {
            super();

            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.txtNum.restrict = '0-9'
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitProduceMetialPanelOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        public show(info: clientCore.MapItemInfo): void {
            clientCore.DialogMgr.ins.open(this);
            this._info = info;
            this.txName.changeText(info.name);
            this.txtLv.changeText(info.level + "");
            let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(info.upgradeType, info.level);
            this.txLimit.changeText("" + upgradeInfo.stackLimit);
            this._maxPro = upgradeInfo.stackLimit;

            let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(info.produceFormulaID);
            let outItemID = formulaInfo.outputItem;
            this.mcItemOut.ico.skin = clientCore.ItemsInfo.getItemIconUrl(outItemID);
            this.mcItemOut.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(outItemID);
            this.mcItemOut.txtName.text = "库存："+clientCore.ItemsInfo.getItemNum(outItemID);
            this.mcItemOut.txtName.visible = true;
            
            // this.mcItemOut.num.value = util.StringUtils.parseNumFontValue(myNum,needNum);
            // this.mcItemOut.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(outItemID);
            // this.mcItemOut.txtNum.innerHTML = util.StringUtils.getColorText2(["库存："+clientCore.ItemsInfo.getItemNum(outItemID) + "", '#805329']);
            this.caculProduce();
            this.showBtnsState();
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnPro, Laya.Event.CLICK, this, this.onProduce);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onAddClick, [1]);
            BC.addEvent(this, this.btnMinus, Laya.Event.CLICK, this, this.onAddClick, [-1]);
            BC.addEvent(this, this.btnMax, Laya.Event.CLICK, this, this.onAddClick, [0]);

            BC.addEvent(this, this.txtNum, Laya.Event.INPUT, this, this.onInputChange);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        private onInputChange() {
            let max = this._maxPro
            this._curNum = this.txtNum.text == '' ? 1 : parseInt(this.txtNum.text);
            this._curNum = _.clamp(this._curNum, 1, max);
            this.txtNum.text = this._curNum.toString();
            this.showBtnsState();
        }

        private onAddClick(num: number) {
            if (num == 0) {
                this._curNum = this._maxPro;
                this.showDetailNumInfo();
            }
            else {
                this._curNum += num;
                if (this._curNum < 1) {
                    this._curNum = 1;
                }
                if (this._curNum > this._maxPro) {
                    this._curNum = this._maxPro;
                }
                this.showDetailNumInfo();
            }
            this.showBtnsState();

        }

        private showBtnsState() {
            this.btnMinus.disabled = this._curNum <= 1;
            this.btnAdd.disabled = this._curNum >= this._maxPro;
            this.btnMax.disabled = this._curNum >= this._maxPro;
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "produceMetialPanel") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);

                }
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this._info = null;
        }

        /** 计算生产数量*/
        private caculProduce(): void {
            let len: number = this._info.produceNeedItemArr.length;
            this._curNum = this._maxPro;
            let arr: { id: number, cost: number }[] = [];
            for (let i = 0; i < len; i++) {
                let id: number = this._info.produceNeedItemArr[i].v1;
                let cost: number = this._info.produceNeedItemArr[i].v2;
                let myItemNum = clientCore.MaterialBagManager.getItemNum(id);
                let curMaxNum = Math.floor(myItemNum / cost);
                this._curNum = Math.min(this._curNum, curMaxNum);
                arr.push({ id: id, cost: cost });
            }
            if (this._curNum < 1) {
                this._curNum = 1;
            }
            this.list.array = arr;
            this.list.repeatX = arr.length;
            this.list.x = -(arr.length - 1) * 132;
            this.boxProduceInfo.x = 470 - (337 - (arr.length - 1) * 132) / 2;
            this.showDetailNumInfo();
        }
        private showDetailNumInfo() {
            let needLeafNum = 0;
            let len: number = this._info.produceNeedItemArr.length;
            for (let i = 0; i < len; i++) {
                let id: number = this._info.produceNeedItemArr[i].v1;
                let cost: number = this._info.produceNeedItemArr[i].v2;
                let myItemNum = clientCore.ItemsInfo.getItemNum(id);
                let diff = cost * this._curNum - myItemNum;
                if (diff > 0) {
                    needLeafNum += (xls.get(xls.materialBag).get(this._info.produceNeedItemArr[i].v1).buy * diff);
                }
            }
            this._needLeafNum = needLeafNum;
            this.txtNum.changeText("" + this._curNum);
            this.txCostNum.changeText("x" + needLeafNum);
            this.boxLeafInfo.visible = this._needLeafNum > 0;
            
            this.mcItemOut.num.value = ""+this._curNum;
            this.list.refresh();
            let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(this._info.upgradeType, this._info.level);
            let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(this._info.produceFormulaID);
            this.txtNeedTime.changeText("需要时间: " + util.StringUtils.getDateStr(this._curNum * Math.floor(formulaInfo.timeS * (100 - upgradeInfo.efficiency) / 100)));
        }

        private listRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: { id: number, cost: number } = item.dataSource;
            // item.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            item.txtName.text = clientCore.ItemsInfo.getItemName(data.id);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.id);

            let myNum = clientCore.ItemsInfo.getItemNum(data.id);
            let needNum = data.cost * this._curNum;
            item.num.value = util.StringUtils.parseNumFontValue(myNum,needNum);
        }

        /**
         * 开始生产
         */
        private onProduce(): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickProduceModuleBcIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            if (this._needLeafNum > 0) {
                alert.showSmall("材料不足，是否消耗 " + this._needLeafNum + " 神叶立即开始生产？", { callBack: { funArr: [this.sureProduce], caller: this }, needMask: true, clickMaskClose: false, btnType: alert.Btn_Type.SURE_AND_CANCLE });
            }
            else {
                this.sureProduce();
            }
        }

        private sureProduce() {
            alert.useLeaf(this._needLeafNum,new Laya.Handler(this,()=>{
                net.sendAndWait(new pb.cs_add_product_in_build({ getTime: this._info.getTime, addNum: this._curNum }))
                .then((data: pb.sc_add_product_in_build) => {
                    this._info.refreshItemInfo(data.build);
                    this.startProduce();
                }).catch(() => {

                });
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAlertShowSmallSureBtn") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }));
        }

        private startProduce(): void {
            EventManager.event(ProduceConstant.START_PRODUCE);
            this.hide();
            if(clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitProduceComplete"){
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}