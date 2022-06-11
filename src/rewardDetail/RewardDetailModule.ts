namespace rewardDetail {
    export class RewardDetailModule extends ui.rewardDetail.RewardDetailModuleUI {
        private _panedArr: core.BaseModule[] = [null, null, null, null, null, null];
        private _rewardDetailInfo: clientCore.RewardDetailInfo;
        private _curSelectTab: number = 0;
        private _curPanel: core.BaseModule;

        private _clothDetailPanel: ClothDetailPanel;
        private _fairyDetailPanel: FairyDetailPanel;
        constructor() {
            super();
        }
        /**
         * 这个通用奖励预览
         * 数据需要在打开这个面板的时候传进来
         * 数据需要分类型  1、花精灵  2、花精灵王  3、服装   4、其他 5角色 6活动  7家具
         * 
         * 
         * @param d 
         */
        init(d: any) {
            if (d instanceof clientCore.RewardDetailInfo) {
                this._rewardDetailInfo = d;
            }
            else if (typeof (d) == "number") {
                this.parseRewardInfo(d);
            }

            this.initTab();
            this.showPanel(this.listTab.array[this._curSelectTab]);
        }
        parseRewardInfo(id: number) {
            let arr = _.filter(xls.get(xls.godTree).getValues(), (o) => { return o.module == id });
            let rewardInfo: clientCore.RewardDetailInfo = new clientCore.RewardDetailInfo();
            arr = _.uniqBy(arr, (o) => { return clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1 });
            for (let i = 0; i < arr.length; i++) {
                rewardInfo.rewardArr[arr[i].type].push(clientCore.LocalInfo.sex == 1 ? arr[i].item.v1 : arr[i].itemMale.v1);
                if (arr[i].dropTimes > 0) {
                    rewardInfo.rateInfohashMap.add(clientCore.LocalInfo.sex == 1 ? arr[i].item.v1 : arr[i].itemMale.v1, arr[i].dropTimes);
                }
            }
            rewardInfo.newTagIdArr = _.compact(_.map(arr, (o) => {
                if (o.isNew == 1)
                    return clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1;
                else
                    return 0
            }));
            rewardInfo.downIdArr = _.compact(_.map(arr, (o) => {
                if (o.isNew == 2)
                    return clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1;
                else
                    return 0
            }));
            this._rewardDetailInfo = rewardInfo;
        }
        private initTab() {
            let tabArr = [];
            for (let i = 1; i < this._rewardDetailInfo.rewardArr.length; i++) {
                if (this._rewardDetailInfo.rewardArr[i].length > 0) {
                    tabArr.push(i);
                }
            }
            //其他标签 放在最后
            if (tabArr.indexOf(4) > -1) {
                tabArr = _.pull(tabArr, 4);
                tabArr.push(4);
            }
            if (tabArr.indexOf(6) > -1) {
                tabArr = _.pull(tabArr, 6);
                tabArr.unshift(6);
            }
            this.listTab.renderHandler = new Laya.Handler(this, this.renderTab);
            this.listTab.mouseHandler = new Laya.Handler(this, this.tabClick);
            this.listTab.array = tabArr;
            this.listTab.visible = tabArr.length > 1;
        }
        private renderTab(cell: ui.rewardDetail.render.TabUI, index: number) {
            let tabIndex = cell.dataSource;
            if (index == this._curSelectTab) {
                cell.imgBg.skin = tabIndex == 6 ? "rewardDetail/tabBgSelect_2.png" : "rewardDetail/tabBgSelect_1.png";
                cell.imgWord.skin = "rewardDetail/tabSelect_" + this.listTab.array[index] + ".png"
            }
            else {
                cell.imgBg.skin = tabIndex == 6 ? "rewardDetail/tabBgSelect_2.png" : "rewardDetail/tabBgNormal_1.png";
                cell.imgWord.skin = "rewardDetail/tabNormal_" + this.listTab.array[index] + ".png";
            }
        }
        private tabClick(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (this._curSelectTab == index) {
                    return;
                }
                this._curSelectTab = index;
                this.listTab.startIndex = this.listTab.startIndex;
                this.showPanel(this.listTab.array[index]);
            }
        }
        private showPanel(index: number) {
            if (!this._panedArr[index]) {
                this._panedArr[index] = this.getPanelByIndex(index);
                this._panedArr[index].init({ arr: this._rewardDetailInfo.rewardArr[index], newTag: this._rewardDetailInfo.newTagIdArr, rate: this._rewardDetailInfo.rateInfohashMap, down: this._rewardDetailInfo.downIdArr });
            }
            if (this._curPanel) {
                this._curPanel.removeSelf();
            }
            this._curPanel = this._panedArr[index];
            this.mcPanelCon.addChild(this._curPanel);
        }
        private getPanelByIndex(index: number) {
            var panel: core.BaseModule;
            switch (index) {
                case 1:
                case 2:
                    panel = new FairyRewardPanel();
                    break;
                case 3:
                    panel = new ClothRewardPanel();
                    break;
                case 4:
                    panel = new OtherRewardPanel();
                    break;
                case 5:
                    panel = new CharacterRewardPanel();
                    break;
                case 6:
                    panel = new ClothActivityPanel();
                    break;
                case 7:
                    panel = new OtherRewardPanel();
                    break;

            }
            panel.x = 16;
            panel.y = 12;
            return panel;
        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, EventManager, "show_cloth_detail", this, this.showClothDetail);
            BC.addEvent(this, EventManager, "show_fairy_detail", this, this.showFairyDetail);
        }
        private showFairyDetail(id: number) {
            this._fairyDetailPanel = this._fairyDetailPanel || new FairyDetailPanel();
            this._fairyDetailPanel.show(id)
        }
        private showClothDetail(suitID: number, title: boolean) {
            if (!this._clothDetailPanel) {
                this._clothDetailPanel = new ClothDetailPanel();
                this._clothDetailPanel.init();
            }
            this._clothDetailPanel.showCloth(suitID, title);
            clientCore.LayerManager.upMainLayer.addChild(this._clothDetailPanel);
            this._clothDetailPanel.showPanel();
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            for (let i = 0; i < this._panedArr.length; i++) {
                if (this._panedArr[i]) {
                    this._panedArr[i].destroy();
                }
            }
            this._fairyDetailPanel?.destroy();
            this._panedArr = null;
            super.destroy();
        }
    }
}