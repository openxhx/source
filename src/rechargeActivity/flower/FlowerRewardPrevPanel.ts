namespace rechargeActivity {

    export class FlowerRewardPrevPanel extends ui.rechargeActivity.flowerPanel.FlowerRewardPreviewPanelUI {
        private _blockArr: FlowerRwdBlockRender[];
        private _tab: number = 0;
        constructor() {
            super();
            this._blockArr = [];
            this.panel.vScrollBarSkin = null;
            this.drawCallOptimize = true;
        }

        show(tab: number) {
            this._tab = tab;
            this.updateViewByTab();
            clientCore.DialogMgr.ins.open(this);
        }

        private updateViewByTab() {
            let all = xls.get(xls.giveFlowerReward).getValues();
            let rwdArr: xls.giveFlowerReward[] = [];
            if (this._tab == 1)
                rwdArr = _.filter(all, o => o.id > 500);
            else
                rwdArr = _.filter(all, o => o.id < 500);
            //去掉老的
            this.panel.removeChildren();
            for (const o of this._blockArr) {
                o.destroy();
            }
            let rwdGroupMap = _.groupBy(rwdArr, o => o.type);
            //创建list
            let y = 0;
            for (const groupKey in rwdGroupMap) {
                let rwdBlock = new FlowerRwdBlockRender();
                rwdBlock.setData(rwdGroupMap[groupKey]);
                rwdBlock.y = y;
                y += (56 + rwdGroupMap[groupKey].length * 150)
                this.panel.addChild(rwdBlock);
            }
            //tab
            for (let i = 0; i < 2; i++) {
                this['tab_' + i].skin = i == this._tab ? 'rechargeActivity/di_yeqian2.png' : 'rechargeActivity/di_yeqian1.png';
                this['tab_' + i].getChildAt(0).skin = `rechargeActivity/rewardPrev/tab_${i}${i == this._tab ? '_select' : ''}.png`;
            }
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onScorllChange() {
            let scroll = this.panel.vScrollBar;
            this.imgScrollBar.y = (this.imgScrollBg.height - this.imgScrollBar.height) * scroll.value / scroll.max;
        }

        private onChangeTab(tab: number) {
            if (this._tab != tab) {
                this._tab = tab;
                this.updateViewByTab();
                this.panel.vScrollBar.stopScroll();
                this.panel.vScrollBar.value = 0;
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.panel.vScrollBar, Laya.Event.CHANGE, this, this.onScorllChange);
            for (let i = 0; i < 2; i++) {
                BC.addEvent(this, this['tab_' + i], Laya.Event.CLICK, this, this.onChangeTab, [i]);
            }
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            for (const o of this._blockArr) {
                o.destroy();
            }
            this._blockArr = [];
        }
    }
}