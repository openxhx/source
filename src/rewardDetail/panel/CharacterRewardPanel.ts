namespace rewardDetail {
    export class CharacterRewardPanel extends ui.rewardDetail.panel.FairyRewardPanelUI {
        private _rewardArr: number[];
        private _awakeUpHashMap: util.HashMap<number[]>;
        private _newTagArr: number[];
        constructor() {
            super();
            this._awakeUpHashMap = new util.HashMap();
        }
        init(d: any) {
            this._rewardArr = d.arr;
            this._newTagArr = d.newTag
            this.listFairy.vScrollBarSkin = "";
            this.listFairy.height = 550;
            this.listFairy.renderHandler = new Laya.Handler(this, this.showCharacter);
            this.listFairy.mouseHandler = new Laya.Handler(this, this.onListClick);
            this.listFairy.array = this._rewardArr;
            BC.addEvent(this, this.listFairy.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
        }
        private onListClick(e: Laya.Event, idx: number, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "btnPreview") {
                    EventManager.event("show_fairy_detail", [e.target.parent["dataSource"]]);
                }
            }
        }
        private onScrollChange() {
            let scroll = this.listFairy.scrollBar;
            this.imgBar.y = scroll.value / scroll.max * (this.imgProgress.height - this.imgBar.height) + this.imgProgress.y;
        }
        private showCharacter(cell: ui.rewardDetail.render.FairyRewardUI, index: number) {
            let id = this.listFairy.array[index];
            cell.btnTryCloth.visible = false;
            cell.mcItem.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            cell.mcItem.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            cell.mcItem.num.value = "";
            cell.mcGetState.visible = clientCore.RoleManager.instance.getRoleById(id) != null;
            cell.mcItem.ico.scale(0.6, 0.6);
            cell.txtName.text = clientCore.ItemsInfo.getItemName(id);
            cell.txtIntro.text = xls.get(xls.characterId).get(id)?.roleDesc ?? '';
            cell.imgNew.visible = this._newTagArr.indexOf(id) > -1;
        }
    }
}