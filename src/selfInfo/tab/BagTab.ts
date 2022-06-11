
namespace selfInfo {
    import ItemBagManager = clientCore.ItemBagManager;
    export class BagTab implements IselfInfoTabModule {
        public tab: number;
        private _tab: number = -1;
        private _curSelectInfo: clientCore.ItemBagInfo;
        private _usePanel: UsePanel;
        private _sellPanel: SellPanel;

        private _mainUI: ui.selfInfo.tab.bagTabUI;
        private _model: SelfInfoModel;

        constructor(ui: ui.selfInfo.tab.bagTabUI, sign: number) {
            this._mainUI = ui;
            this._model = clientCore.CManager.getModel(sign) as SelfInfoModel;
            this.initTab();
            this.addEventListeners();
        }

        private initTab() {
            this._mainUI.listItem.vScrollBarSkin = '';
            this._mainUI.listItem.renderHandler = new Laya.Handler(this, this.onItemRender);
            this._mainUI.listItem.selectHandler = new Laya.Handler(this, this.onItemSelect);
            this._mainUI.listGetWay.renderHandler = new Laya.Handler(this, this.onGetWayRender);
            this._mainUI.txtItemIntro.text = "";

            this.onTabChange(0);
            this._mainUI.imgRed.visible = clientCore.ItemBagManager.checkHasItemRed();
        }

        private onUse() {
            if (this._curSelectInfo) {
                switch (this._curSelectInfo.xlsInfo.event) {
                    case 1:
                        EventManager.event("close_self_info_module");
                        clientCore.ModuleManager.open("foster.FosterModule");
                        break;
                    case 2: //打开礼包道具
                        let num: number = this._curSelectInfo.goodsInfo.itemNum;
                        if (num <= 0) break;
                        if (num == 1) {
                            this.useItem(1);
                        } else {
                            this._usePanel = this._usePanel || new UsePanel();
                            this._usePanel.show(num, Laya.Handler.create(this, this.useItem));
                        }
                        break;
                    case 3:
                        //彩虹秒表
                        num = this._curSelectInfo.goodsInfo.itemNum;
                        let useNum = this.judgeRainbowTime();
                        let maxNum = Math.min(num, useNum);
                        if (maxNum <= 0) break;
                        this._usePanel = this._usePanel || new UsePanel();
                        this._usePanel.show(maxNum, Laya.Handler.create(this, this.useRainBowItem));
                        break;
                    case 4:
                        EventManager.event("go_person_tab");
                        break;
                    case 6: //合成
                        clientCore.MergeManager.merge(this._curSelectInfo.xlsInfo.itemId);
                        break;
                    case 11:
                        let openFlag: boolean = clientCore.SystemOpenManager.ins.getIsOpen(16);
                        if (!openFlag) {
                            alert.showSmall("羁绊暂未开启！");
                            return;
                        }

                        EventManager.event("close_self_info_module");
                        clientCore.ModuleManager.open("roleChain2.RoleChainModule");
                        break;
                    case 21:
                        EventManager.event("close_self_info_module");
                        clientCore.ModuleManager.open("chat.ChatModule");
                        break;
                    default:
                        break;
                }
            }
        }

        /**判断彩虹时间 */
        private judgeRainbowTime(): number {
            let limitTime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) + 3600 * 24;
            let endTime = clientCore.ServerManager.curServerTime + clientCore.LocalInfo.rainbowInfo.duration;
            if (endTime > limitTime - 1800) {
                alert.showSmall("无法使用彩虹怀表，剩余累计彩虹时间不得超过次日0点！");
                return 0;
            }
            return Math.floor((limitTime - endTime) / 1800);
        }

        private useItem(count: number): void {
            net.sendAndWait(new pb.cs_use_gift_bag_item({ itemId: this._curSelectInfo.goodsInfo.itemID, num: count })).then((msg: pb.sc_use_gift_bag_item) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.itemInfo), "获得奖励：");
            })
        }

        private useRainBowItem(count: number) {
            let useNum = this.judgeRainbowTime();
            if (count > useNum) {
                alert.showSmall("使用数量过多，剩余累计彩虹时间不得超过次日0点！");
                return;
            }
            net.sendAndWait(new pb.cs_use_item_bag_tool({ toolId: this._curSelectInfo.goodsInfo.itemID, toolNum: count })).then((msg: pb.cs_use_item_bag_tool) => {
                if (clientCore.LocalInfo.rainbowInfo.duration > 0) {
                    let rainbowTime = xls.get(xls.globaltest).get(1).rainbowTime * count;
                    clientCore.ModuleManager.open("rainbow.RainbowModule", rainbowTime);
                }
            })
        }

        private async onSellClick() {
            let item: clientCore.ItemBagInfo = this._mainUI.listItem.selectedItem;
            this._sellPanel = this._sellPanel || new SellPanel();
            this._sellPanel.show(item.goodsInfo.itemNum, Laya.Handler.create(this, this.onSureSell));
        }

        private onSureSell(num: number) {
            let item: clientCore.ItemBagInfo = this._mainUI.listItem.selectedItem;
            net.sendAndWait(new pb.cs_user_sell_item({ itemId: item.xlsInfo.itemId, itemCnt: num })).then(
                (data: pb.sc_user_sell_item) => {
                    let goodsList: clientCore.GoodsInfo[] = [];
                    goodsList.push(new clientCore.GoodsInfo(data.itemId, data.itemCnt));
                    alert.showReward(goodsList, "出售成功");
                    this.refreshList();
                }
            ).catch(() => { });
        }

        private onItemRender(cell: ui.selfInfo.render.ItemRenderUI, idx: Number) {
            let info = cell.dataSource as clientCore.ItemBagInfo;
            cell.mcReward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.goodsInfo.itemID);
            cell.mcReward.txtName.text = clientCore.ItemsInfo.getItemName(info.goodsInfo.itemID);
            cell.mcReward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.goodsInfo.itemID);
            cell.mcReward.num.value = info.goodsInfo.itemNum.toString();
            // cell.mcReward.txtName.visible = false;
            // cell.num.value = info.goodsInfo.itemNum.toString();
            cell.mcSelect.visible = this._mainUI.listItem.selectedIndex == idx;
            // cell.mcItemImg.skin = clientCore.ItemsInfo.getItemIconUrl(info.goodsInfo.itemID);
            // cell.mcBgImg.skin = "commonRes/iconType_" + info.xlsInfo.quality + ".png";
            cell.imgRed.visible = clientCore.ItemBagManager.needShowRed(info.xlsInfo.itemId);
        }

        private onItemSelect(idx: number) {
            this.showDetail(this._mainUI.listItem.dataSource[idx]);
            clientCore.ItemBagManager.cancleRed(this._mainUI.listItem.dataSource[idx].xlsInfo.itemId);
            if (this._mainUI.listItem.getCell(idx))
                this._mainUI.listItem.getCell(idx)['imgRed'].visible = false;
            this._mainUI.imgRed.visible = clientCore.ItemBagManager.checkHasItemRed();
            this._mainUI.event(Laya.Event.CHANGED);
        }

        private onGetWayRender(cell: Laya.Box, idx: number) {
            cell.getChildByName('txt')['text'] = cell.dataSource.split('/')[0];
        }

        private showDetail(info: clientCore.ItemBagInfo) {
            this._curSelectInfo = info;
            if (info && info.xlsInfo) {
                this._mainUI.imgIconBg.skin = "commonRes/iconType_" + info.xlsInfo.quality + ".png";
                this._mainUI.txtName.text = info.xlsInfo.name;
                this._mainUI.txtNum.text = info.goodsInfo.itemNum.toString();
                this._mainUI.txtPrice.text = info.xlsInfo.sell == 0 ? '无法出售' : info.xlsInfo.sell.toString();
                this._mainUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(info.goodsInfo.itemID);
                this._mainUI.btnSell.disabled = info.xlsInfo.sell == 0;
                this._mainUI.btnUse.disabled = info.xlsInfo.event == 0;
                this._mainUI.txtItemIntro.text = info.xlsInfo.captions;
                this._mainUI.boxNoGetWay.visible = info.xlsInfo.channelType.length == 0;
                this._mainUI.listGetWay.dataSource = info.xlsInfo.channelType;
            }
        }

        private addEventListeners() {
            for (let i = 0; i < 4; i++) {
                BC.addEvent(this, this._mainUI['tab_' + i], Laya.Event.CLICK, this, this.onTabChange, [i]);
            }
            BC.addEvent(this, this._mainUI.btnSell, Laya.Event.CLICK, this, this.onSellClick);
            BC.addEvent(this, this._mainUI.btnUse, Laya.Event.CLICK, this, this.onUse);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.refreshList);
        }

        show() {
            this._mainUI.visible = true;
        }

        hide() {
            this._mainUI.visible = false;
        }

        private onTabChange(idx: number) {
            if (this._tab != idx) {
                this._tab = idx;
                for (let i = 0; i < 4; i++) {
                    this._mainUI['tab_' + i].index = i == this._tab ? 0 : 1;
                }
                this.refreshList();
            }
        }

        private refreshList() {
            let list = _.filter(ItemBagManager.getAllItems(), (info) => {
                if (info.xlsInfo && info.xlsInfo.hide == 1)
                    return false;
                switch (this._tab) {
                    case 0:
                        if (info.xlsInfo && info.xlsInfo.kind != 0)
                            return info;
                        break;
                    case 1:
                        if (info.xlsInfo && (info.xlsInfo.kind == 15 || info.xlsInfo.kind == 19))
                            return info;
                        break;
                    case 2:
                        if (info.xlsInfo && info.xlsInfo.kind == 17)
                            return info;
                        break;
                    case 3:
                        if (info.xlsInfo && info.xlsInfo.kind == 23)
                            return info;
                        break;
                    default:
                        break;
                }
            });
            list = _.sortBy(list, (o) => {
                if (o.xlsInfo && o.xlsInfo.event == 2)
                    return -1
                return 0;
            })
            this._mainUI.listItem.dataSource = list;
            let tmpSelectIdx = this._mainUI.listItem.selectedIndex;
            this._mainUI.listItem.selectedIndex = this._mainUI.listItem.dataSource.length == 0 ? -1 : 0;
            if (tmpSelectIdx == this._mainUI.listItem.selectedIndex) {
                this.showDetail(this._mainUI.listItem.dataSource[0])
            }
            this._mainUI.boxDetail.visible = this._mainUI.listItem.selectedIndex > -1;
        }

        destroy() {
            this._usePanel = null;
            BC.removeEvent(this);
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.refreshList);
        }
    }
}
