namespace rewardDetail {
    export class ClothActivityPanel extends ui.rewardDetail.panel.ClothRewardPanelUI {
        private _rewardArr: number[];
        private _suitHashMap: util.HashMap<number[]>;
        private _newTagArr: number[];
        private _downArr: number[];
        private ROW_NUM: number = 4;
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
            this.clothPanel.width = 1000;

            BC.addEvent(this, this.clothPanel.vScrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this,this.clothPanel,Laya.Event.CLICK,this,this.showTips);
        }
        showTips(e:Laya.Event){
            let nameStr = e.target.name;
            if(nameStr.indexOf("reward") > -1){
                let id = parseInt(nameStr.split("_")[1]);
                clientCore.ToolTip.showTips(e.target,{id:id});
            }
        }
        private onScrollChange() {
            let scroll = this.clothPanel.vScrollBar;
            this.imgBar.y = scroll.value / scroll.max * (this.imgProgress.height - this.imgBar.height) + this.imgProgress.y;
        }
        private parseClothInfo() {
            for (let i = 0; i < this._rewardArr.length; i++) {
                let suitID = xls.get(xls.itemCloth).get(this._rewardArr[i]).suitId;
                if (!this._suitHashMap.has(suitID)) {
                    this._suitHashMap.add(suitID, []);
                }
                this._suitHashMap.get(suitID).push(this._rewardArr[i]);
            }
            let suitArr = this._suitHashMap.getKeys();
            suitArr = _.sortBy(suitArr, (o) => { return xls.get(xls.itemCloth).get(this._suitHashMap.get(o)[0]).quality });
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
                mcSuitName.txtSuitName.text = xls.get(xls.suits).get(suitArr[i]).name;
                mcSuitName.x = 140;
                mcSuitName.y = curdisY;
                mcSuitName["suitID"] = suitArr[i];
                this.clothPanel.addChild(mcSuitName);
                BC.addEvent(this, mcSuitName.btnTry, Laya.Event.CLICK, this, this.showSuitClick);

                let imgCloth = new Laya.Image();
                imgCloth.anchorX = 0.5;
                imgCloth.anchorY = 0.5;
                imgCloth.x = 684;
                imgCloth.y = curdisY + 300;
                imgCloth.skin = `res/suitBig/${suitArr[i]}_${clientCore.LocalInfo.sex}.png`;
                this.clothPanel.addChildAt(imgCloth, 0);

                curdisY += mcSuitName.height;
                curdisY += 10;
                let rewardItemHeight = 0;
                let suitClothIDArr = this._suitHashMap.get(suitArr[i]);
                for (let j = 0; j < suitClothIDArr.length; j++) {
                    let rewardItem = new ui.rewardDetail.render.OneRewardUI();
                    rewardItem.mouseEnabled = true;
                    rewardItem.scale(0.8, 0.8);
                    let w = rewardItem.width * 0.8;
                    let h = rewardItem.height * 0.8;
                    this.showDetailReward(rewardItem, suitClothIDArr[j]);
                    rewardItemHeight = h;
                    if (j > 0 && j % this.ROW_NUM == 0) {
                        curdisY += h;
                        curdisY += 5;
                    }
                    rewardItem.y = curdisY;
                    rewardItem.x = 10 + (w + 7) * (j % this.ROW_NUM);
                    rewardItem.imgNew.visible = this._newTagArr.indexOf(suitClothIDArr[j]) > -1;
                    rewardItem.imgDown.visible = this._downArr.indexOf(suitClothIDArr[j]) > -1;
                    rewardItem.name = `reward_${suitClothIDArr[j]}`;
                    this.clothPanel.addChild(rewardItem);
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