
namespace rewardDetail {
    export class OtherRewardPanel extends ui.rewardDetail.panel.OtherRewardPanelUI {
        private _rewardArr: number[];
        private _newTagArr: number[];
        private _downArr: number[];
        constructor() {
            super();
        }
        init(d: any) {
            this._rewardArr = d.arr;
            this._newTagArr = d.newTag;
            this._downArr = d.down;
            this.listReward.vScrollBarSkin = "";
            this.listReward.renderHandler = new Laya.Handler(this, this.showDetailReward);
            this.listReward.mouseHandler = new Laya.Handler(this, this.showRewardTips);
            let xlsBag = xls.get(xls.itemBag);
            this._rewardArr = _.sortBy(this._rewardArr, (o) => {
                return clientCore.ItemsInfo.getItemQuality(o);
            });
            this.listReward.array = this._rewardArr;
            this.imgBar.visible = this.imgProgress.visible = this.listReward.scrollBar.max > 0;
            this.imgBot.visible = this.listReward.scrollBar.max > 0;
            BC.addEvent(this, this.listReward.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
        }
        private showRewardTips(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.currentTarget, { id: this._rewardArr[index] });
            }
        }
        private onScrollChange() {
            let scroll = this.listReward.scrollBar;
            this.imgBar.y = scroll.value / scroll.max * (this.imgProgress.height - this.imgBar.height) + this.imgProgress.y;
        }
        private showDetailReward(itemCell: ui.rewardDetail.render.OneRewardUI, index: number) {
            let id = this.listReward.array[index];
            itemCell.imgGet.visible = false;
            itemCell.txtName.changeText(clientCore.ItemsInfo.getItemName(id));
            itemCell.mcItem.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            itemCell.mcItem.num.value = "";
            itemCell.mcItem.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            itemCell.imgNew.visible = this._newTagArr.indexOf(id) > -1;
            itemCell.imgDown.visible = this._downArr?.indexOf(id) > -1;
        }
    }
}