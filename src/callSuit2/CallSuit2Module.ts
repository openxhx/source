namespace callSuit2 {
    /**
     * 2020年11月13日
     * 拾光织布机二期
     * callSuit2.CallSuit2Module
     */
    export class CallSuit2Module extends ui.callSuit2.CallSuitModuleUI {
        /**key为套装id */
        private localInfo: util.HashMap<{ name: string }>;
        /**商品id */
        private goodsId: number[];
        init(data: any) {
            this.setLocalInfo();
            this.goodsId = [];
            for (let i: number = 2333; i <= 2339; i++) {
                this.goodsId.push(i);
            }
            this.addPreLoad(xls.load(xls.eventExchange));
            this.list.mouseEnabled = true;
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listMouse);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年11月13日活动', '【老玩家召回】守望忆拾光', '打开拾光织布机面板');
            this.goodsId.sort(this.sortSuit);
            this.list.array = this.goodsId;
        }

        /**本地数据 */
        private setLocalInfo() {
            this.localInfo = new util.HashMap();
            this.localInfo.add(2100233, { name: "mrkkx" });
            this.localInfo.add(2110050, { name: "xymf" });
            this.localInfo.add(2100237, { name: "bltz" });
            this.localInfo.add(2100235, { name: "jllg" });
            this.localInfo.add(2100250, { name: "jsts" });
            this.localInfo.add(2100240, { name: "fyzy" });
            this.localInfo.add(2100229, { name: "slyj" });
        }

        /**列表渲染 */
        private listRender(item: ui.callSuit2.render.CallSuitRenderUI) {
            let id: number = item.dataSource;
            let xlsConfig = xls.get(xls.eventExchange).get(id);
            let localConfig = this.localInfo.get(xlsConfig.femaleProperty[0].v1);
            item.labCost.text = xlsConfig.cost[0].v2.toString();
            item.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(xlsConfig.cost[0].v1);
            item.imgName.skin = "callSuit2/name_" + localConfig.name + ".png";
            item.imgSuit.skin = `unpack/callSuit2/img_${localConfig.name}_${clientCore.LocalInfo.sex}.png`;
            // item.imgSuit.pos(20, 40);
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
                    let has = clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
                    let cost = xlsConfig.cost[0].v2;
                    if (has < cost) {
                        alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                        return;
                    }
                    alert.showSmall(`是否花费${xlsConfig.cost[0].v2}${clientCore.ItemsInfo.getItemName(xlsConfig.cost[0].v1)}购买所选套装？`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                net.sendAndWait(new pb.cs_common_exchange({ activityId: 96, exchangeId: id })).then((data: pb.sc_common_exchange) => {
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

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.moveList, [-1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.moveList, [1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}