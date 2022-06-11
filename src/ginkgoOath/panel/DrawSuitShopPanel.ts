namespace ginkgoOath {
    export class DrawSuitShopPanel extends ui.ginkgoOath.panel.DrawSuitShopPanelUI {
        /**商品id */
        private goodsId: number[];
        /**当前类型 */
        private _type: number;
        constructor() {
            super();
            this.init();
        }
        init() {
            this.list.mouseEnabled = true;
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse);
        }

        show(type: 1 | 2) {
            this._type = type;
            this.goodsId = [];
            if (type == 1) {
                clientCore.Logger.sendLog('2020年11月27日活动', '【付费】淘乐节·银杏誓约', '打开寒蝉商店面板');
                this.imgTitle.skin = "ginkgoOath/title_hcsd.png";
                for (let i: number = 2353; i <= 2356; i++) {
                    this.goodsId.push(i);
                }
                this.list.width = 1220;
                this.btnLeft.visible = this.btnRight.visible = false;
            } else {
                clientCore.Logger.sendLog('2020年11月27日活动', '【付费】淘乐节·银杏誓约', '打开兑换小铺面板');
                this.imgTitle.skin = "ginkgoOath/title_dhxp.png";
                for (let i: number = 2346; i <= 2352; i++) {
                    this.goodsId.push(i);
                }
                this.list.width = 1180;
                this.btnLeft.visible = this.btnRight.visible = true;
            }
            this.goodsId.sort(this.sortSuit);
            this.list.array = this.goodsId;
            this.setCoin();
        }

        private setCoin() {
            this.num_1511014.text = "" + clientCore.ItemsInfo.getItemNum(1511014);
            this.num_1511015.text = "" + clientCore.ItemsInfo.getItemNum(1511015);
        }

        /**列表渲染 */
        private listRender(item: ui.ginkgoOath.render.DrawSuitRenderUI) {
            let id: number = item.dataSource;
            let xlsConfig = xls.get(xls.eventExchange).get(id);
            let suitId = xlsConfig.femaleProperty[0].v1;
            item.labCost.text = xlsConfig.cost[0].v2.toString();
            item.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(xlsConfig.cost[0].v1);
            item.imgName.skin = "ginkgoOath/name_" + suitId + ".png";
            item.imgSuit.skin = `res/suitLean/${suitId}_${clientCore.LocalInfo.sex}.png`;
            item.imgGot.visible = clientCore.SuitsInfo.getSuitInfo(xlsConfig.femaleProperty[0].v1).allGet;
            item.labCost.visible = !item.imgGot.visible;
            BC.addEvent(this, item.btnTry, Laya.Event.CLICK, this, this.previewSuit, [xlsConfig.femaleProperty[0].v1]);
        }

        /**列表点击 */
        private listMouse(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.mouseY > 630 && e.target.mouseY < 700) {
                    let id: number = this.list.getItem(index);
                    let xlsConfig = xls.get(xls.eventExchange).get(id);
                    if (clientCore.SuitsInfo.getSuitInfo(xlsConfig.femaleProperty[0].v1).allGet) return;
                    let has = clientCore.ItemsInfo.getItemNum(xlsConfig.cost[0].v1);
                    let cost = xlsConfig.cost[0].v2;
                    if (has < cost) {
                        if (xlsConfig.cost[0].v1 == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                            alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        } else if (xlsConfig.cost[0].v1 == 1511012) {
                            alert.showSmall("淘乐球不足，是否要购买？", {
                                callBack: {
                                    caller: this, funArr: [() => {
                                        alert.alertQuickBuy(1511012, cost - has, true);
                                    }]
                                }
                            })
                        } else {
                            alert.showFWords(`${clientCore.ItemsInfo.getItemName(xlsConfig.cost[0].v1)}不足~`);
                        }
                        return;
                    }
                    alert.showSmall(`是否花费${xlsConfig.cost[0].v2}${clientCore.ItemsInfo.getItemName(xlsConfig.cost[0].v1)}购买所选套装？`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                net.sendAndWait(new pb.cs_common_exchange({ activityId: 96, exchangeId: id })).then(async (data: pb.sc_common_exchange) => {
                                    let arr: pb.IItem[] = [];
                                    let cloths = clientCore.SuitsInfo.getSuitInfo(xlsConfig.femaleProperty[0].v1).clothes;
                                    for (let i: number = 0; i < cloths.length; i++) {
                                        let item = new pb.Item();
                                        item.id = cloths[i];
                                        item.cnt = 1;
                                        arr.push(item);
                                    }
                                    alert.showReward(arr);
                                    this.goodsId.sort(this.sortSuit);
                                    this.list.array = this.goodsId;
                                    this.setCoin();
                                    await util.RedPoint.reqRedPointRefresh(19305);
                                    EventManager.event("GINKGOOATH_REFRESH_TAB");
                                })
                            }]
                        }
                    })
                }
            }
        }

        /**排序 */
        private sortSuit(a: number, b: number): number {
            let suit_a = xls.get(xls.eventExchange).get(a).femaleProperty[0].v1;
            if (clientCore.SuitsInfo.getSuitInfo(suit_a).allGet) return 1;
            else return -1;
        }


        /**预览套装 */
        private previewSuit(id: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
        }

        /**移动列表 */
        private moveList(flag: number) {
            let target = this.list.startIndex;
            target += flag;
            if (target < 0) target = 0;
            this.list.tweenTo(target);
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        private showTip(item: any, id: number) {
            clientCore.ToolTip.showTips(item, { id: id });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.moveList, [-1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.moveList, [1]);
            BC.addEvent(this, this.coin1511014, Laya.Event.CLICK, this, this.showTip, [this.coin1511014, 1511014]);
            BC.addEvent(this, this.coin1511015, Laya.Event.CLICK, this, this.showTip, [this.coin1511015, 1511015]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}