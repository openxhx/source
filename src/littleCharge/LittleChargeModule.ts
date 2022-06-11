namespace littleCharge {
    export class LittleChargeModule extends ui.littleCharge.LittleChargeModuleUI {
        private _currId: number;
        init(d: any) {
            this.list.hScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.listTab.vScrollBarSkin = null;
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.onListTabRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.onListTabSelect);
            let arr = clientCore.LittleRechargManager.instacne.getRecentArr();
            this.listTab.dataSource = arr;
            let arr1 = _.map(arr, (o) => { return o.xlsInfo.id });
            this.listTab.selectedIndex = _.clamp(arr1.indexOf(d), 0, this.listTab.length - 1);
            this.listTab.visible = this.listTab.length > 1;
            this.addPreLoad(xls.load(xls.rechargeLimit));
            switch (d) {
                case 1:
                    clientCore.Logger.sendLog('付费系统', '小额充值', '打开6元星之粉礼包界面')
                    break;
                case 2:
                    clientCore.Logger.sendLog('付费系统', '小额充值', '打开6元神树浇灌礼包界面')
                    break;
                case 3:
                    clientCore.Logger.sendLog('付费系统', '小额充值', '打开30元服装购买礼包界面')
                    break;
                case 4:
                    clientCore.Logger.sendLog('付费系统', '小额充值', '打开6元仓库扩建礼包界面')
                    break;
                case 5:
                    clientCore.Logger.sendLog('付费系统', '小额充值', '打开30元升级药水礼包界面')
                    break;
                default:
                    break;
            }
        }

        private async onBuy() {
            clientCore.LittleRechargManager.instacne.payByiId(this._currId).then(() => {
                this.destroy();
            });
        }

        private updateTabList() {
            this.listTab.dataSource = clientCore.LittleRechargManager.instacne.getRecentArr();
            this.listTab.visible = this.listTab.length > 1;
            if (this.listTab.length == 0) {
                this.destroy();
            }
            else {
                this.listTab.selectedIndex = 0;
                this.showView();
            }
        }

        private showView() {
            this._currId = (this.listTab.getItem(this.listTab.selectedIndex) as clientCore.LittleRechargeInfo).xlsInfo.id;
            let info = clientCore.LittleRechargManager.instacne.getInfoById(this._currId);
            let shopInfo = clientCore.RechargeManager.getShopInfo(info.xlsInfo.shopId);
            this.list.dataSource = info.rewards;
            this.txtCost.value = shopInfo.cost.toString();
            this.txtValue.value = info.xlsInfo.oldPrice.toString()
            this.txtPrice.text = '￥' + shopInfo.cost;
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data: xls.pair = cell.dataSource;
            cell.num.value = data.v2.toString();
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
            cell.txtName.text = clientCore.ItemsInfo.getItemName(data.v1);
            cell.txtName.visible = true;
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.v1);
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK)
                clientCore.ToolTip.showTips(this.list.getCell(idx), { id: this.list.getItem(idx).v1 });
        }

        private onListTabRender(cell: Laya.Image, idx: number) {
            cell.skin = idx == this.listTab.selectedIndex ? 'littleCharge/btn_biaoqian2.png' : 'littleCharge/btn_biaoqian.png';
        }

        private onListTabSelect(idx: number) {
            this.showView();
            this.onTimer();
        }

        private onTimer() {
            let info = clientCore.LittleRechargManager.instacne.getInfoById(this._currId);
            if (info) {
                this.txtTime.text = util.StringUtils.getDateStr(info.leftTime);
                if (info.leftTime <= 0) {
                    this.updateTabList();
                }
            }
        }

        addEventListeners() {
            Laya.timer.loop(1000, this, this.onTimer);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuy);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.onTimer);
            BC.removeEvent(this);
        }
    }
}