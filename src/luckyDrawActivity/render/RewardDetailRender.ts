namespace luckyDrawActivity {
    export class RewardDetailRender extends ui.luckyDrawActivity.render.RewardDetailRenderUI {
        private _config: xls.godTree;

        constructor(config: xls.godTree) {
            super();
            this._config = config;
            this.imgGet.visible = false;
            this.progress.visible = false;
            this.refreshData();
        }

        private refreshData() {
            let reward = clientCore.LocalInfo.sex == 1 ? this._config.item : this._config.itemMale;

            this.txtName.text = clientCore.ItemsInfo.getItemName(reward.v1);
            this.icon.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            this.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(reward.v1);
            this.imgGet.visible = false;
            let clothInfo = clientCore.ClothData.getCloth(this._config.item.v1);
            if (this._config.type == 1 || this._config.type == 2) {
                let has: boolean = clientCore.ItemBagManager.checkItemEnough(new clientCore.GoodsInfo(reward.v1, 1));
                let hasCloth = clothInfo && clientCore.LocalInfo.checkHaveCloth(reward.v1);
                this.imgGet.visible = has || hasCloth;
            }
        }
    }
}