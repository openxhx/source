namespace collection {
    const AREA = ['', '土栽', '水栽'];
    const MEDAL_ARR = [MedalConst.FLOWER_WIKI_1, MedalConst.FLOWER_WIKI_2, MedalConst.FLOWER_WIKI_3, MedalConst.FLOWER_WIKI_4, MedalConst.FLOWER_WIKI_5];
    export class CoGardenPanel implements ICollectionPanel {
        ui: ui.collection.panel.GardenPanelUI;
        private _newHash: util.HashMap<boolean>;//已经点掉了new 就是true
        private _medalArr: number[];
        constructor() {
            this.ui = new ui.collection.panel.GardenPanelUI();
            this.ui.list.vScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.selectHandler = new Laya.Handler(this, this.onListSelect);
            this.addEvent();
            this._newHash = new util.HashMap();
            this._medalArr = [];
        }

        show() {

        }

        async waitLoad() {
            await xls.load(xls.flowerWiki);
            for (const infos of xls.get(xls.flowerWiki).getValues()) {
                this._newHash.add(infos.id, false);
            }
            this._medalArr = [];
            await clientCore.MedalManager.getMedal(MEDAL_ARR).then((data) => {
                let idx = 0;
                for (const medalId of MEDAL_ARR) {
                    let medalInfo = _.find(data, { 'id': medalId });
                    this._medalArr.push(medalInfo.value);
                    if (medalInfo) {
                        for (let i = 1; i <= 31; i++) {
                            this._newHash.add(i + idx, util.getBit(medalInfo.value, i) == 1);
                        }
                    }
                    idx += 31;
                }
            })
            this.ui.list.dataSource = xls.get(xls.flowerWiki).getValues();
            this.ui.list.selectedIndex = 0;
        }

        private onListRender(cell: ui.collection.render.GardenListRenderUI, idx: number) {
            let xlsInfo: xls.flowerWiki = cell.dataSource;
            let unlocked = clientCore.MaterialBagManager.checkMatUnlock(xlsInfo.production)
            cell.txtName.text = unlocked ? xlsInfo.name : '???';
            cell.imgNo.visible = !unlocked;
            cell.imgIcon.visible = unlocked;
            cell.imgNew.visible = !this._newHash.get(xlsInfo.id) && unlocked;
            cell.imgIcon.skin = pathConfig.getFlowerWikiIcon(xlsInfo.id);
            cell.imgSelect.visible = idx == this.ui.list.selectedIndex;
        }

        private onListSelect(idx: number) {
            if (this.ui.list.selectedIndex > -1) {
                let xlsInfo: xls.flowerWiki = this.ui.list.selectedItem;
                let unlocked = clientCore.MaterialBagManager.checkMatUnlock(xlsInfo.production)
                this.ui.imgIcon.skin = unlocked ? pathConfig.getFlowerWikiIcon(xlsInfo.id) : 'collection/garden/wenhao.png';
                this.ui.txtName.text = unlocked ? xlsInfo.name : '???';
                this.ui.txtLang.text = unlocked ? xlsInfo.flowerLanguage : '???';
                this.ui.txtArea.text = unlocked ? AREA[xlsInfo.growthArea] : '???';
                this.ui.txtWeather.text = unlocked ? xlsInfo.weather : '???';
                this.ui.txtSeed.text = unlocked ? xlsInfo.source : '???';
                this.ui.txtDes.text = unlocked ? xlsInfo.flowerDes : '???';
                this.ui.txtMade.text = unlocked ? clientCore.ItemsInfo.getItemName(xlsInfo.production) : '???';
                this.ui.txtTime.text = unlocked ? ('成熟时间:' + util.StringUtils.getTimeStr(xlsInfo.time * 60)) : '???';
                if (unlocked && !this._newHash.get(xlsInfo.id)) {
                    let data = new pb.CommonData();
                    let medalIdx = Math.floor(xlsInfo.id / 31);
                    data.id = MEDAL_ARR[medalIdx];
                    data.value = util.setBit(this._medalArr[medalIdx], xlsInfo.id % 31, 1);
                    this._medalArr[medalIdx] = data.value;
                    clientCore.MedalManager.setMedal([data]);
                    this._newHash.add(xlsInfo.id, true);
                    this.ui.list.getCell(idx)['imgNew'].visible = false;
                }
            }
        }

        private onScoll() {
            let scroll = this.ui.list.scrollBar;
            this.ui.imgBar.y = scroll.value / scroll.max * (this.ui.imgBarBot.height - this.ui.imgBar.height) + this.ui.imgBarBot.y;
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.list.scrollBar, Laya.Event.CHANGE, this, this.onScoll);
        }

        private removeEvent() {
            BC.removeEvent(this)
        }

        private onClose() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this._medalArr = [];
            this._newHash.clear();
            this.removeEvent();
        }
    }
}