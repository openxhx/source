namespace kitchen {
    export class SelectMakePanel extends ui.kitchen.panel.SelectMakePanelUI {
        private _model: KitchenModel;
        private curType: number = 0;
        private foodArr1: number[];
        private foodArr2: number[];
        private foodArr3: number[];
        private guo: number;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as KitchenModel;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.vScrollBarSkin = "";
        }

        init() {
            this.foodArr1 = [];
            this.foodArr2 = [];
            this.foodArr3 = [];
            for (let i: number = 1; i <= 3; i++) {
                this["bg" + i].skin = "kitchen/xing_zhuang_14.png";
                this["type" + i].skin = "kitchen/maketype_" + i + "_0.png";
            }
            let curArr = this._model.serverFoodInfo.getValues();
            let config = xls.get(xls.diningRecipe);
            for (let j: number = 0; j < curArr.length; j++) {
                let type = config.get(curArr[j].id).type;
                this["foodArr" + type].push(curArr[j].id);
            }
            if (this.foodArr1.length > 0) this.changeType(1);
            else if (this.foodArr2.length > 0) this.changeType(2);
            else if (this.foodArr3.length > 0) this.changeType(3);
            else this.changeType(1);
        }

        public show(idx: number) {
            this.guo = idx;
            this.init();
            clientCore.DialogMgr.ins.open(this);
        }

        changeType(type: number) {
            if (type == this.curType) return;
            if (this.curType > 0) {
                this["bg" + this.curType].skin = "kitchen/xing_zhuang_14.png";
                this["type" + this.curType].skin = "kitchen/maketype_" + this.curType + "_0.png";
            }
            this.curType = type;
            this["bg" + this.curType].skin = "kitchen/xing_zhuang_13.png";
            this["type" + this.curType].skin = "kitchen/maketype_" + this.curType + "_1.png";
            this.list.array = this["foodArr" + this.curType];
            this.list.tweenTo(0);
        }

        private listRender(item: ui.kitchen.render.FoodInfoRenderUI) {
            let id = item.dataSource;
            let xlsData = xls.get(xls.diningRecipe).get(id);
            item.labName.text = xlsData.name;
            let serverData = this._model.serverFoodInfo.get(id);
            item.labTime.text = "烹饪用时:" + this.getMakeTime(xlsData.time, serverData.counts, id);
            item.labLevel.text = "熟练度:" + this.getLevelDes(serverData.counts, id);
            item.labHave.text = "拥有:" + clientCore.ItemsInfo.getItemNum(id);
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.labEffect.text = "+" + xlsData.award;
            item.listStar.repeatX = clientCore.ItemsInfo.getItemQuality(id);
            item.list.renderHandler = new Laya.Handler(this, (item: ui.kitchen.render.BookMaterialItem1UI) => {
                let mtr = item.dataSource;
                item.bg.skin = clientCore.ItemsInfo.getItemIconBg(mtr.v1);
                item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(mtr.v1);
                item.num.value = mtr.v2;
                item.labUnknow.visible = false;
                item.icon.visible = item.num.visible = true;
            })
            item.list.mouseHandler = new Laya.Handler(this, (e: Laya.Event, idx: number) => {
                if (e.type == Laya.Event.CLICK) {
                    let mtr = item.list.array[idx];
                    clientCore.ToolTip.showTips(item.list.cells[idx], { id: mtr.v1 });
                }
            })
            item.list.array = xlsData.material;
            BC.addEvent(this, item.btnMake, Laya.Event.CLICK, this, this.goMake, [id]);
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

        /**前往制作 */
        private goMake(id: number) {
            if (!this.guo) return;
            EventManager.event("GO_MAKE_FOOD", [id, this.guo]);
            clientCore.DialogMgr.ins.close(this);
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
                BC.addEvent(this, this["bg" + i], Laya.Event.CLICK, this, this.changeType, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.curType = 0;
            super.destroy();
        }
    }
}