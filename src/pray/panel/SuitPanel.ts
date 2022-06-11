namespace pray.panel {
    /**
     * 套装购买界面
     */
    export class SuitPanel extends ui.pray.panel.SuitPanelUI {

        private _suidId: number;
        private _storeHash: util.HashMap<xls.clothStore>;
        constructor() {
            super();

            this.list.vScrollBarSkin = "";
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.listMouse, null, false);
            this.costList.renderHandler = Laya.Handler.create(this, this.costRender, null, false);
            this._storeHash = new util.HashMap();
            let values = xls.get(xls.clothStore).getValues();
            for (const o of values) {
                if (this._storeHash.has(o.clothId)) {
                    console.warn('服装商店表重复 服装id' + o.clothId);
                }
                else {
                    this._storeHash.add(o.clothId, o);
                }
            }
        }

        public show(id: number): void {
            clientCore.DialogMgr.ins.open(this);
            let xlsPray: xls.godprayBase = xls.get(xls.godprayBase).get(id);
            this._suidId = xlsPray.suitId;
            this.updateView(xlsPray.suitId);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnAllBuy, Laya.Event.CLICK, this, this.onBuySuit);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onChange);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private costRender(item: Laya.Box, index: number): void {
            let info: xls.pair = item.dataSource;
            (item.getChildByName("ico") as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(info.v1);
            (item.getChildByName("num") as Laya.Label).changeText(info.v2 + "");
        }

        private updateView(suitId: number): void {
            let data: xls.suits = xls.get(xls.suits).get(suitId);
            this.txDesc.text = data.describe;
            this.ico.skin = pathConfig.getSuitImg(suitId, clientCore.LocalInfo.sex);
            this.list.array = clientCore.SuitsInfo.getSuitInfo(suitId).clothes;
            //套装价格
            let suitPrice = this._storeHash.get(suitId);
            if (suitPrice) {
                this.costList.array = suitPrice.cost;
                this.costList.width = 81.5 + 91.5 * (suitPrice.cost.length - 1);
            }
            else {
                console.warn(suitId + ' clothStore中找不到')
            }
        }

        private listRender(item: ui.pray.item.SuitItemUI, index: number): void {
            let clothId = item.dataSource as number;
            let info = clientCore.ClothData.getCloth(clothId);
            item.txName.changeText(info.name);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.id);
            let has: boolean = clientCore.LocalInfo.checkHaveCloth(info.id)
            item.imgHas.visible = has;
            (item.getChildByName("buy") as Laya.Button).visible = !has;
            let clothStore = this._storeHash.get(info.id);
            if (clothStore) {
                item.list.repeatX = info.xlsInfo.quality;
                let cost: xls.pair = clothStore.cost[0];
                item.costIco.skin = clientCore.ItemsInfo.getItemIconUrl(cost.v1);
                item.txCost.changeText(cost.v2 + "");
            }
        }

        private listMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.CLICK && e.target.name == "buy") {
                let clothId: number = this.list.array[index];
                if (!this.checkSpritBean(this._storeHash.get(clothId).cost[0].v2)) {
                    return;
                }

                alert.showSmall(`是否购买${clientCore.ItemsInfo.getItemName(clothId)}?`, {
                    callBack: {
                        caller: this,
                        funArr: [() => {
                            let ids: number[] = [clothId];
                            net.sendAndWait(new pb.cs_buy_clothes({ clothesid: ids })).then((msg: pb.sc_buy_clothes) => { //购买部件
                                this.list.changeItem(index, clothId);
                            })
                        }]
                    }
                })
            }
        }

        private checkSpritBean(cnt: number): boolean {
            let has: number = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            if (has < cnt) {
                alert.showSmall("灵豆不足，是否前去补充？", {
                    callBack: {
                        funArr: [() => {
                            clientCore.ToolTip.gotoMod(50);
                        }],
                        caller: this
                    }
                })
                return false;
            }
            return true;
        }

        private onChange(): void {
            this.imgBar.y = 235 + 284 * (this.list.scrollBar.value / this.list.scrollBar.max);
        }

        private onBuySuit(): void {

            let array: xls.pair[] = this.costList.array;
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                if (array[i].v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID && !this.checkSpritBean(array[i].v2)) { //灵豆不足
                    return;
                }
            }

            let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(this._suidId);
            alert.showSmall(`是否购买${info.suitInfo.name}套装?`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        net.sendAndWait(new pb.cs_buy_suit({ suitId: this._suidId })).then(() => {
                            let ids: number[] = info.clothes;
                            let fakeInfos = _.map(ids, (id) => {
                                return { clothesid: id };
                            });
                            let rwds = _.map(ids, (id) => {
                                return { itemID: id, itemNum: 1 };
                            })
                            alert.showReward(rwds, '购买成功');
                            clientCore.LocalInfo.addClothes(fakeInfos);
                            this.list.refresh();
                        });
                    }]
                }
            });
        }
    }
}