namespace library {

    export class CollectItem extends ui.library.render.CollectItemUI {

        private _rewardData: xls.pair;

        constructor() {
            super();
            this.reward.on(Laya.Event.CLICK, this, this.onClick);
        }

        public setData(value: xls.rebuildAward): void {
            this._rewardData = clientCore.LocalInfo.sex == 1 ? value.femaleAward : value.maleAward;
            this.reward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(this._rewardData.v1);
            this.reward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(this._rewardData.v1);
            this.reward.num.value = util.StringUtils.parseNumFontValue(this._rewardData.v2);

            let isEng: boolean = clientCore.ItemsInfo.getItemNum(value.num.v1) >= value.num.v2;
            let isFinish: boolean = LibraryModel.ins.checkFinish(1, value.id);
            // this.txCondi.visible = !isFinish && !isEng;
            // if (this.txCondi.visible) {
            this.txCondi.changeText(`获得${clientCore.ItemsInfo.getItemName(value.num.v1)}达到${value.num.v2}`);
            // }
            this.btnGet.disabled = isFinish || !isEng;
            if (isFinish) {
                this.btnGet.fontSkin = "commonBtn/l_p_alr_get.png";
                this.btnGet.fontX = 30;
            }
            else{
                this.btnGet.fontSkin = "commonBtn/l_p_get.png";
                this.btnGet.fontX = 41.5;
            }
            // else {
            //     this.btnGet.fontSkin = "commonBtn/l_p_no_get.png";
            //     this.btnGet.fontX = 14;
            // }
        }

        private onClick(): void {
            clientCore.ToolTip.showTips(this.reward, { id: this._rewardData.v1 });
        }
    }
}