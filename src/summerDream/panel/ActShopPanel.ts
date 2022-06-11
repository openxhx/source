namespace summerDream {
    export class ActShopPanel extends ui.summerDream.panel.SDActShopUI {
        private suitId: number = 2110383;
        private bgId: number = 1000112;
        private stageId: number = 1100078;
        constructor() {
            super();
            this.imgSuit1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = clientCore.LocalInfo.sex == 2;
            this.addEventListeners();
            this.setUI();
        }

        private setUI() {
            this.btnBuy.visible = !clientCore.SuitsInfo.getSuitInfo(this.suitId).allGet;
            this.imgGot.visible = !this.btnBuy.visible;
        }

        show() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【付费】夏夜如梦', '打开夏日青柠面板');
            this.visible = true;
        }

        hide() {
            this.visible = false;
        }

        private closeClick() {
            EventManager.event("SUMMER_DREAM_CLOSE_ACTIVITY");
            this.hide();
        }

        /**展示套装详情 */
        private onTryClick(index: number) {
            if (index == 2) {
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [this.bgId, this.stageId], condition: '', limit: '' });
            } else {
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitId);
            }
        }

        private buySuit() {
            alert.showBuyDetails(52, new Laya.Handler(this, () => {
                this.btnBuy.visible = false;
                this.imgGot.visible = true;
            }));
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnTryBg, Laya.Event.CLICK, this, this.onTryClick, [2]);
            BC.addEvent(this, this.btnTrySuit, Laya.Event.CLICK, this, this.onTryClick, [1]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.buySuit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            this.removeEventListeners();
            super.destroy();
        }
    }
}