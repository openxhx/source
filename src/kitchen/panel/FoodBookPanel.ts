namespace kitchen {
    export class FoodBookPanel extends ui.kitchen.panel.FoodBookPanelUI {
        private _model: KitchenModel;
        private xlsInfo: util.HashMap<xls.diningRecipe>;
        private curType: number = 0;
        private curFood: number;
        private foodArr1: number[];
        private foodArr2: number[];
        private foodArr3: number[];
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as KitchenModel;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listSelect);
            this.list.vScrollBarSkin = "";
        }

        init() {
            this.foodArr1 = [];
            this.foodArr2 = [];
            this.foodArr3 = [];
            this.xlsInfo = xls.get(xls.diningRecipe);
            for (let i: number = 1; i <= 3; i++) {
                this["btnType" + i].skin = "kitchen/huise.png";
                this["btnType" + i].x = 1216;
                this["imgType" + i].skin = "kitchen/foodType_" + i + "_0.png";
            }
            let xlsArr = this.xlsInfo.getValues();
            for (let j: number = 0; j < xlsArr.length; j++) {
                this["foodArr" + xlsArr[j].type].push(xlsArr[j].foodId);
            }
            this.changeType(1);
            //没啥意义的按钮右上自适应
            this.btnClose.x =this.btnClose.width/2 -(Laya.stage.width - this.width)/2;
            this.btnClose.y =this.btnClose.height/2-(Laya.stage.height - this.height)/2;
            this.width = this.stage.width;
            this.height = this.stage.height;
            this.panel.x = this.stage.width/2;
            this.panel.y = this.stage.height/2;
        }

        changeType(type: number) {
            if (type == this.curType) return;
            if (this.curType > 0) {
                this["btnType" + this.curType].skin = "kitchen/huise.png";
                this["btnType" + this.curType].x = 1216;
                this["imgType" + this.curType].skin = "kitchen/foodType_" + this.curType + "_0.png";
            }
            this.curType = type;
            this["btnType" + this.curType].skin = "kitchen/fense.png";
            this["btnType" + this.curType].x = 1207;
            this["imgType" + this.curType].skin = "kitchen/foodType_" + this.curType + "_1.png";
            this.list.array = this["foodArr" + this.curType];
            this.list.tweenTo(0);
            this.showFoodDetial(0);
        }

        public show() {
            let sortFun = (a: number, b: number) => {
                if (this._model.serverFoodInfo.has(a)) {
                    if (this._model.serverFoodInfo.has(b)) {
                        return clientCore.ItemsInfo.getItemQuality(b) - clientCore.ItemsInfo.getItemQuality(a);
                    } else {
                        return -1;
                    }
                } else {
                    if (this._model.serverFoodInfo.has(b)) {
                        return 1;
                    } else {
                        return clientCore.ItemsInfo.getItemQuality(b) - clientCore.ItemsInfo.getItemQuality(a);
                    }
                }
            }
            this.foodArr1.sort(sortFun);
            this.foodArr2.sort(sortFun);
            this.foodArr3.sort(sortFun);
            this.list.refresh();
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.kitchen.render.FoodInfoRenderUI) {
            let id = item.dataSource;
            let open = this._model.serverFoodInfo.has(id);
            item.btnMake.visible = false;
            let xlsData = this.xlsInfo.get(id);
            item.labName.text = xlsData.name;
            if (open) {
                let serverData = this._model.serverFoodInfo.get(id);
                item.labTime.text = "烹饪用时:" + this.getMakeTime(xlsData.time, serverData.counts, id);
                item.labLevel.text = "熟练度:" + this.getLevelDes(serverData.counts, id);
                item.labEffect.text = "+" + xlsData.award;
            } else {
                item.labTime.text = "烹饪用时:？？？";
                item.labLevel.text = "熟练度:" + this.getLevelDes(0, id);
                item.labEffect.text = "？？？";
            }
            item.labHave.text = "拥有:" + clientCore.ItemsInfo.getItemNum(id);
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.listStar.repeatX = clientCore.ItemsInfo.getItemQuality(id);
            item.list.renderHandler = new Laya.Handler(this, (item: ui.kitchen.render.BookMaterialItem1UI) => {
                if (open) {
                    let mtr = item.dataSource;
                    item.bg.skin = clientCore.ItemsInfo.getItemIconBg(mtr.v1);
                    item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(mtr.v1);
                    item.num.value = mtr.v2;
                    item.labUnknow.visible = false;
                    item.icon.visible = item.num.visible = true;
                } else {
                    item.bg.skin = `commonRes/iconType_2.png`;
                    item.icon.visible = item.num.visible = false;
                    item.labUnknow.visible = true;
                }
            })
            item.list.array = xlsData.material;
        }

        private listSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                this.showFoodDetial(this.list.getCell(index).dataSource);
            }
        }

        private getLevelDes(num: number, food: number) {
            let config = xls.get(xls.diningRecipe).get(food).proficiency;
            if (num <= config[0].v1) return "生疏";
            else if (num <= config[1].v1) return "熟练";
            else if (num < config[2].v1) return "精湛";
            else return "大师";
        }

        private getMakeTime(time: number, num: number, food: number) {
            let config = xls.get(xls.diningRecipe).get(food).proficiency;
            let off = 0;
            if (num <= config[0].v1) off = 0;
            else if (num <= config[1].v1) off = Math.floor(time * config[0].v2 / 100);
            else if (num < config[2].v1) off = Math.floor(time * config[1].v2 / 100);
            else off = Math.floor(time * config[2].v2 / 100);
            return util.TimeUtil.formatSecToStr(time - off);
        }

        private showFoodDetial(id: number) {
            if (!id) {
                if (this.curFood && this.xlsInfo.get(this.curFood).type == this.curType) id = this.curFood;
                else id = this["foodArr" + this.curType][0];
            }
            this.curFood = id;
            let open = this._model.serverFoodInfo.has(this.curFood);
            this.btnMake.disabled = !open;
            let xlsData = this.xlsInfo.get(id);
            this.labName.text = xlsData.name;
            this.labDes.text = xlsData.describe;
            this.labDes1.text = clientCore.ItemsInfo.getItemDesc(xlsData.foodId);
            this.imgIconS.skin = clientCore.ItemsInfo.getItemIconUrl(xlsData.foodId);
            this.imgIconL.skin = clientCore.ItemsInfo.getItemUIUrl(xlsData.foodId);
            for (let i = 0; i < 5; i++) {
                if (i < xlsData.material.length) {
                    this["material" + (i + 1)].visible = true;
                    if(open){
                        let mtr = xlsData.material[i];
                        this["material" + (i + 1)].icon.skin = clientCore.ItemsInfo.getItemIconUrl(mtr.v1);
                        this["material" + (i + 1)].num.value = mtr.v2;
                        this["material" + (i + 1)].labUnknow.visible = false;
                        this["material" + (i + 1)].icon.visible = this["material" + (i + 1)].num.visible = true;
                    }else{
                        this["material" + (i + 1)].icon.visible = this["material" + (i + 1)].num.visible = false;
                        this["material" + (i + 1)].labUnknow.visible = true;
                    }
                } else {
                    this["material" + (i + 1)].visible = false;
                }
            }
        }

        private showMaterialInfo(idx: number) {
            let open = this._model.serverFoodInfo.has(this.curFood);
            if (!open) return;
            let xlsData = this.xlsInfo.get(this.curFood);
            clientCore.ToolTip.showTips(this["material" + idx], { id: xlsData.material[idx - 1].v1 });
        }

        /**前往制作 */
        private goMake() {
            if (this._model.judge()) {
                EventManager.event("OPEN_MAKE_VIEW");
                clientCore.DialogMgr.ins.close(this);
            } else {
                alert.showFWords("没有空闲的锅子~");
            }
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        public destroyData() {
            this._model = null;
            this.foodArr3 = this.foodArr1 = this.foodArr2 = null;
            this.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            for (let i: number = 1; i < 4; i++) {
                BC.addEvent(this, this["btnType" + i], Laya.Event.CLICK, this, this.changeType, [i]);
            }
            for (let i: number = 1; i < 6; i++) {
                BC.addEvent(this, this["material" + i], Laya.Event.CLICK, this, this.showMaterialInfo, [i]);
            }
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.goMake);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}