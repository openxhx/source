namespace restaurant {
    export class RestaurantUpfoodPanel extends ui.restaurant.panel.ReataurantUpfoodPanelUI {
        private select: number;
        private target: number;
        private curLevel: number;
        private _model: RestaurantModel;
        constructor(sign: number) {
            super();
            this.list.vScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse);
            this._model = clientCore.CManager.getModel(sign) as RestaurantModel;
            this.sideClose = true;
        }

        show(target: number, curlvl: number) {
            this.target = target;
            this.curLevel = curlvl;
            let total = xls.get(xls.diningRecipe).getKeys();
            for (let i: number = 0; i < total.length;) {
                if (clientCore.ItemsInfo.getItemNum(Number(total[i])) == 0) {
                    total.splice(i, 1);
                } else {
                    i++;
                }
            }
            if (total.length == 0) {
                this.boxFood.visible = false;
                this.labNofood.visible = true;
                if (this._model.curCreatNum > 0) {
                    this.labNofood.text = "当前仓库没有完成的菜品~";
                } else {
                    this.labNofood.text = "当前没有可以制作的食谱~";
                }
                this.btnSure.fontSkin = "restaurant/t_p_zhizuo.png";
            } else {
                total.sort((a: string, b: string) => {
                    return clientCore.ItemsInfo.getItemQuality(Number(b)) - clientCore.ItemsInfo.getItemQuality(Number(a));
                })
                this.list.array = total;
                this.boxFood.visible = true;
                this.labNofood.visible = false;
                this.btnSure.fontSkin = "restaurant/t_p_shangjia.png";
            }
            clientCore.DialogMgr.ins.open(this);
        }

        private listRender(item: ui.restaurant.render.CanSellFoodRenderUI) {
            let id: number = Number(item.dataSource);
            let have = clientCore.ItemsInfo.getItemNum(id);
            // let max = xls.get(xls.diningBase).get(1).dishesMax;
            // if (have > max) {
            //     item.num.value = max + "/" + have;
            // } else {
            //     item.num.value = have + "/" + have;
            // }
            item.num.value = "" + have;
            item.imgSelect.visible = id == this.select;
            item.list.repeatX = clientCore.ItemsInfo.getItemQuality(id);
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
        }

        private listMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                if (this.list.getCell(idx).dataSource != this.select?.toString()) {
                    this.select = Number(this.list.getCell(idx).dataSource);
                    this.list.refresh();
                }
            }
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        private sure() {
            if (this.btnSure.fontSkin == "restaurant/t_p_shangjia.png") {
                if (!this.select) return;
                let have = clientCore.ItemsInfo.getItemNum(this.select);
                let max = xls.get(xls.diningBase).get(1).dishesMax;
                let sellNum: number = have > max ? max : have;
                net.sendAndWait(new pb.cs_add_restaurant_food({ foodPos: this.target, foodId: this.select, counts: sellNum })).then((msg: pb.sc_add_restaurant_food) => {
                    EventManager.event("SET_FOOD_SELL", { foodPos: this.target, foodId: this.select, counts: sellNum });
                    clientCore.DialogMgr.ins.close(this);
                })
            } else {
                clientCore.DialogMgr.ins.close(this);
                clientCore.ModuleManager.open("kitchen.KitchenModule", this.curLevel);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sure);

        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroyData() {
            this.list.renderHandler.recover();
            this.list.mouseHandler.recover();
            this._model = null;
            this.destroy();
        }

        destroy() {
            super.destroy();
        }
    }
}