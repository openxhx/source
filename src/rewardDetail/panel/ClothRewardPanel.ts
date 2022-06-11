namespace rewardDetail {
    export class ClothRewardPanel extends ui.rewardDetail.panel.ClothRewardPanelUI {
        private _rewardArr: number[];
        private _suitHashMap: util.HashMap<number[]>;
        private _newTagArr: number[];
        private _downArr: number[];
        private _suitDetailPanel: ClothDetailPanel;
        private _rateInfoHashMap: util.HashMap<number>;
        constructor() {
            super();
            this._suitHashMap = new util.HashMap();
        }
        init(d: any) {
            this._rewardArr = d.arr;
            this._newTagArr = d.newTag;
            this._downArr = d.down;
            this._rateInfoHashMap = d.rate;
            this.parseClothInfo();
            this.clothPanel.vScrollBarSkin = "";

            BC.addEvent(this, this.clothPanel.vScrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this, this.clothPanel, Laya.Event.CLICK, this, this.showTips);
        }
        showTips(e: Laya.Event) {
            let nameStr = e.target.name;
            if (nameStr.indexOf("reward") > -1) {
                let id = parseInt(nameStr.split("_")[1]);
                clientCore.ToolTip.showTips(e.target, { id: id });
            }
        }
        private onScrollChange() {
            let scroll = this.clothPanel.vScrollBar;
            this.imgBar.y = scroll.value / scroll.max * (this.imgProgress.height - this.imgBar.height) + this.imgProgress.y;
        }
        private parseClothInfo() {
            for (let i = 0; i < this._rewardArr.length; i++) {
                let suitID: number;
                let cloths: number[];
                if (xls.get(xls.suits).has(this._rewardArr[i])) {
                    suitID = this._rewardArr[i];
                    cloths = clientCore.SuitsInfo.getSuitInfo(suitID).clothes;
                }
                else {
                    suitID = xls.get(xls.itemCloth).get(this._rewardArr[i]).suitId;
                    cloths = [this._rewardArr[i]];
                }
                if (!this._suitHashMap.has(suitID)) {
                    this._suitHashMap.add(suitID, []);
                }
                for (let j: number = 0; j < cloths.length; j++) {
                    this._suitHashMap.get(suitID).push(cloths[j]);
                }
            }
            let suitArr = this._suitHashMap.getKeys();
            suitArr = _.sortBy(suitArr, (o) => { return xls.get(xls.suits).get(o)?.quality });
            suitArr = suitArr.reverse();
            this.createPanelInfo(suitArr);
        }

        private showSuitClick(e: Laya.Event) {
            let suitID = parseInt(e.currentTarget.parent["suitID"]);
            console.log("click suit ID: " + suitID);
            EventManager.event("show_cloth_detail", [suitID, false]);
        }

        private createPanelInfo(suitArr: string[]) {
            let curdisY = 0;
            let disY = 10;
            for (let i = 0; i < suitArr.length; i++) {
                curdisY += disY;
                let mcSuitName = new ui.rewardDetail.render.SuitLineUI();
                mcSuitName.x = 140;
                mcSuitName.y = curdisY;
                if (xls.get(xls.suits).get(suitArr[i])) {
                    mcSuitName.txtSuitName.text = xls.get(xls.suits).get(suitArr[i]).name;
                    mcSuitName["suitID"] = suitArr[i];
                    BC.addEvent(this, mcSuitName.btnTry, Laya.Event.CLICK, this, this.showSuitClick);
                } else {
                    mcSuitName.txtSuitName.text = "散件";
                    mcSuitName.btnTry.visible = false;
                }
                this.clothPanel.addChild(mcSuitName);

                curdisY += mcSuitName.height;
                curdisY += 10;
                let rewardItemHeight = 0;
                let suitClothIDArr = this._suitHashMap.get(suitArr[i]);
                for (let j = 0; j < suitClothIDArr.length; j++) {
                    let rewardItem = new ui.rewardDetail.render.OneRewardUI();
                    rewardItem.mouseEnabled = true;
                    this.showDetailReward(rewardItem, suitClothIDArr[j]);
                    rewardItemHeight = rewardItem.height;
                    if (j > 0 && j % 5 == 0) {
                        curdisY += rewardItem.height;
                        curdisY += 5;
                    }
                    rewardItem.y = curdisY;
                    rewardItem.x = 10 + (rewardItem.width + 7) * (j % 5);
                    rewardItem.imgNew.visible = this._newTagArr.indexOf(suitClothIDArr[j]) > -1;
                    rewardItem.imgDown.visible = this._downArr?.indexOf(suitClothIDArr[j]) > -1;
                    this.clothPanel.addChild(rewardItem);
                    rewardItem.name = `reward_${suitClothIDArr[j]}`;
                }
                curdisY += rewardItemHeight;
                curdisY += 10;
            }
        }

        private showDetailReward(rewardItem: ui.rewardDetail.render.OneRewardUI, id: number) {
            let has = clientCore.LocalInfo.checkHaveCloth(id);
            rewardItem.imgGet.visible = has;
            rewardItem.txtName.changeText(clientCore.ItemsInfo.getItemName(id));
            rewardItem.mcItem.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            rewardItem.mcItem.num.value = "";
            rewardItem.mcItem.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            rewardItem.imgRate.visible = false;
            if (!has && this._rateInfoHashMap.has(id)) {
                rewardItem.imgRate.visible = true;
                rewardItem.imgRate.skin = `rewardDetail/rate_${this._rateInfoHashMap.get(id)}.png`;
            }
        }
        destroy() {
            super.destroy();
            BC.removeEvent(this);
        }
    }
}