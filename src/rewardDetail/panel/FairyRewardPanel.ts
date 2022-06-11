namespace rewardDetail {
    export class FairyRewardPanel extends ui.rewardDetail.panel.FairyRewardPanelUI {
        private _rewardArr: number[];
        private _awakeUpHashMap: util.HashMap<number[]>;
        private _newTagArr:number[];
        constructor() {
            super();
            this._awakeUpHashMap = new util.HashMap();
        }
        init(d: any) {
            this._rewardArr = d.arr;
            this._newTagArr = d.newTag;
            this.parseAwakeInfo();
            this.listFairy.vScrollBarSkin = "";
            this.listFairy.height = 550;
            this.listFairy.renderHandler = new Laya.Handler(this, this.showFairy);
            this.listFairy.mouseHandler = new Laya.Handler(this, this.onListClick);
            this.listFairy.array = this._rewardArr;
            BC.addEvent(this, this.listFairy.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
        }
        private onListClick(e: Laya.Event, idx: number, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == 'btnTryCloth') {
                    let awakeRoleID = e.target.parent["awakeRoleID"];
                    let suitID = xls.get(xls.godprayBase).get(awakeRoleID).suitId;
                    EventManager.event("show_cloth_detail", [suitID, true]);
                }
                else if (e.target.name == "btnPreview") {
                    EventManager.event("show_fairy_detail", [e.target.parent["id"]]);
                }
            }
        }
        private onScrollChange() {
            let scroll = this.listFairy.scrollBar;
            this.imgBar.y = scroll.value / scroll.max * (this.imgProgress.height - this.imgBar.height) + this.imgProgress.y;
        }
        private parseAwakeInfo() {
            let arr = xls.get(xls.awakeBase).getValues();
            for (let i = 0; i < arr.length; i++) {
                if (!this._awakeUpHashMap.has(arr[i].needCurrency)) {
                    this._awakeUpHashMap.add(arr[i].needCurrency, []);
                }
                this._awakeUpHashMap.get(arr[i].needCurrency).push(arr[i].rroleID);
            }
        }
        private showFairy(cell: ui.rewardDetail.render.FairyRewardUI, index: number) {
            let id = this.listFairy.array[index];
            cell.mcItem.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            cell.mcItem.num.value = "";
            cell.mcItem.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            cell.mcGetState.visible = clientCore.ItemBagManager.getFairyNum(id) !== null || clientCore.ItemBagManager.getItemNum(id) > 0;
            cell.imgNew.visible = this._newTagArr.indexOf(id) > -1;
            cell.txtName.text = xls.get(xls.itemBag).get(id).name;
            let arr = this._awakeUpHashMap.get(id);
            if (arr.length < 1) {
                alert.showFWords("" + id + "花精灵对应awakeBase表里面没有觉醒数据！");
                return;
            }
            let awakeRoleID = 0;
            let str = "";
            if (arr.length > 1) {
                awakeRoleID = arr[clientCore.LocalInfo.sex - 1];
                str = "可激活神祈 " + xls.get(xls.godprayBase).get(awakeRoleID).name + "\\n";
                let suitID = xls.get(xls.godprayBase).get(awakeRoleID).suitId;
                // str += "激活后可购买对应套装 " + xls.get(xls.suits).get(suitID).name;
                str += "激活后可购买对应套装";
            }
            else {
                awakeRoleID = arr[0];
                str = "可绽放 " + xls.get(xls.characterId).get(awakeRoleID).name;
                cell.btnTryCloth.visible = false;
            }
            cell.mcGetState.visible = cell.mcGetState.visible || clientCore.RoleManager.instance.getRoleById(awakeRoleID) != null;
            cell["awakeRoleID"] = awakeRoleID;
            cell['id'] = id;
            cell.txtIntro.text = str;
        }
    }
}