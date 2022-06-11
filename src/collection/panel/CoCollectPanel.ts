namespace collection {
    export class CoCollectPanel implements ICollectionPanel {
        ui: ui.collection.panel.CollectPanelUI;
        private _newHash: util.HashMap<boolean>;//已经点掉了new 就是true
        private _medalArr: number[];
        private _medalIdArr: number[] = [];
        private _currId: number;
        private _itemIdHash: util.HashMap<boolean>;
        constructor() {
            this.ui = new ui.collection.panel.CollectPanelUI();
            this.ui.list.vScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.selectHandler = new Laya.Handler(this, this.onListSelect);
            this.addEvent();
            this._itemIdHash = new util.HashMap();
            this._newHash = new util.HashMap();
            this._medalArr = [];
            for (let i = MedalConst.COLLECT_FURNITURE_START; i <= MedalConst.COLLECT_FURNITURE_END; i++) {
                this._medalIdArr.push(i);
            }
        }

        show() {

        }

        async waitLoad() {
            await xls.load(xls.partyHouse);
            await this.loadItemInfo();
            for (const infos of xls.get(xls.partyHouse).getValues()) {
                this._newHash.add(infos.furnitureId, false);
            }
            this._medalArr = [];
            await clientCore.MedalManager.getMedal(this._medalIdArr).then((data) => {
                let idx = 0;
                for (const medalId of this._medalIdArr) {
                    let medalInfo = _.find(data, { 'id': medalId });
                    this._medalArr.push(medalInfo.value);
                    if (medalInfo) {
                        for (let i = 1; i <= 32; i++) {
                            this._newHash.add(i + idx, util.getBit(medalInfo.value, i) == 1);
                        }
                    }
                    idx += 32;
                }
            })
            this.ui.list.dataSource = xls.get(xls.partyHouse).getValues();
            this.ui.list.selectedIndex = 0;
        }

        private loadItemInfo() {
            return net.sendAndWait(new pb.cs_get_all_party_house_build_lists()).then((data: pb.sc_get_all_party_house_build_lists) => {
                for (const id of data.buildIds) {
                    this._itemIdHash.add(id, true);
                }
            })
        }

        private onListRender(cell: ui.collection.render.GardenListRenderUI, idx: number) {
            let xlsInfo: xls.partyHouse = cell.dataSource;
            let unlocked = this._itemIdHash.has(xlsInfo.furnitureId);
            cell.txtName.text = unlocked ? xlsInfo.furnitureName : '???';
            cell.imgNo.visible = !unlocked;
            cell.imgIcon.visible = unlocked;
            cell.imgNew.visible = !this._newHash.get(idx+1) && unlocked;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.furnitureId);
            cell.imgSelect.visible = idx == this.ui.list.selectedIndex;
        }

        private onListSelect(idx: number) {
            if (this.ui.list.selectedIndex > -1) {
                let xlsInfo: xls.partyHouse = this.ui.list.selectedItem;
                this._currId = xlsInfo.furnitureId;
                let unlocked = this._itemIdHash.has(xlsInfo.furnitureId);
                this.ui.imgIcon.skin = unlocked ? clientCore.ItemsInfo.getItemIconUrl(xlsInfo.furnitureId) : 'collection/garden/wenhao.png';
                this.ui.imgIcon.scaleX = this.ui.imgIcon.scaleY = unlocked ? 1.5 : 1;
                this.ui.txtName.text = unlocked ? xlsInfo.furnitureName : '???';
                if (unlocked && !this._newHash.get(xlsInfo.furnitureId)) {
                    let data = new pb.CommonData();
                    let medalIdx = Math.floor(idx/32);
                    data.id = this._medalIdArr[medalIdx];
                    data.value = util.setBit(this._medalArr[medalIdx], idx % 32+1, 1);
                    this._medalArr[medalIdx] = data.value;
                    clientCore.MedalManager.setMedal([data]);
                    // this._newHash.add(xlsInfo.furnitureId, true);
                    this._newHash.add(idx+1,true);
                    this.ui.list.getCell(idx)['imgNew'].visible = false;
                }
            }
        }

        private onWant() {
            let info = xls.get(xls.partyHouse).get(this._currId);
            if (info)
                if (info.channelType)
                    clientCore.ToolTip.gotoMod(parseInt(info.channelType.split('/')[1]));
                else
                    alert.showSmall('当前没有获取途径', { btnType: alert.Btn_Type.ONLY_SURE });
        }

        private onScoll() {
            let scroll = this.ui.list.scrollBar;
            this.ui.imgBar.y = scroll.value / scroll.max * (this.ui.imgBarBot.height - this.ui.imgBar.height) + this.ui.imgBarBot.y;
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.btnWant, Laya.Event.CLICK, this, this.onWant);
            BC.addEvent(this, this.ui.list.scrollBar, Laya.Event.CHANGE, this, this.onScoll);
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        private onClose() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this.removeEvent();
        }
    }
}