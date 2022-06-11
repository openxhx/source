namespace operaDrama {
    export class OperaEndPanel extends ui.operaDrama.panel.OperaEndPanelUI {
        private _filter: Laya.ColorFilter;
        private _roleId: number;
        constructor() {
            super();
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.onListTabRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.onListTabSelect);
            this.listReward.renderHandler = new Laya.Handler(this, this.onListRwdRender);
            this.listReward.mouseHandler = new Laya.Handler(this, this.onListRwdMouse);
            this._filter = new Laya.ColorFilter();
            this._filter.setColor('#546e8b');
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['imgHead_' + i], Laya.Event.CLICK, this, this.onHeadClick, [i + 1]);
            }
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGetReward);
            BC.addEvent(this, this.btnGetAll, Laya.Event.CLICK, this, this.onGetAllReward);
            BC.addEvent(this, this.imgPrev, Laya.Event.CLICK, this, this.onPrevEnd);
            this.onHeadClick(1);

        }

        show() {
            this.onHeadClick(this._roleId);
            clientCore.Logger.sendLog('2020年9月30日活动', '【主活动】中秋话剧面板和剧情', '打开结局收集面板');
        }

        private onPrevEnd() {
            let endId = clientCore.OperaManager.instance.getEndingIdByRoleId(this._roleId)[this.listTab.selectedIndex];
            let routeInfo = xls.get(xls.dramaRoute).get(endId);
            let eventId = routeInfo.choiceEffect[0].v1;
            if (clientCore.OperaManager.instance.checkRouteJumped(endId)) {
                //动画
                clientCore.AnimateMovieManager.setParam({ selectArr: [], forceSkipOpt: 1 ,bgAlpha: 1});
                clientCore.AnimateMovieManager.showAnimateMovie(eventId, null, null);
            }
            else {
                alert.showFWords('结局还未解锁')
            }
        }

        private onListTabRender(cell: ui.operaDrama.render.OperaEndTabRenderUI, idx: number) {
            cell.imgSelect.visible = idx == this.listTab.selectedIndex;
            cell.imgTitle.skin = this._roleId == 3 ? `operaDrama/trueEnd.png` : `operaDrama/end_${idx}.png`;
            cell.imgTitle.filters = idx != this.listTab.selectedIndex ? [this._filter] : [];
        }

        private onListTabSelect(idx: number) {
            let endId = clientCore.OperaManager.instance.getEndingIdByRoleId(this._roleId)[this.listTab.selectedIndex];
            this.imgPrev.gray = !clientCore.OperaManager.instance.checkRouteJumped(endId);
            this.imgPlay.visible = !this.imgPrev.gray
            this.imgPrev.skin = `res/otherLoad/operaDrama/${endId}.png`;
            this.updateReward();
        }

        private onListRwdRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            clientCore.GlobalConfig.setRewardUI(cell, { id: data.v1, cnt: data.v2, showName: false });
        }

        private onListRwdMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.listReward.getItem(idx) as xls.pair;
                clientCore.ToolTip.showTips(e.currentTarget, { id: data.v1 })
            }
        }

        private onHeadClick(roleId: number) {
            this._roleId = roleId;
            //结局tabList
            this.listTab.dataSource = clientCore.OperaManager.instance.getEndingIdByRoleId(roleId);
            this.listTab.repeatX = this.listTab.length;
            this.listTab.selectedIndex = 0;
            this.onListTabSelect(0);
            //奖励
            this.updateReward();
            //头像选择
            for (let i = 0; i < 3; i++) {
                this['imgHead_' + i].skin = `operaDrama/head${i + 1}${(i == roleId - 1) ? 'select' : ''}.png`;
            }
        }

        private updateReward() {
            //结局奖励
            let rwdId = (this._roleId - 1) * 3 + this.listTab.selectedIndex + 4;
            let haveGet = clientCore.OperaManager.instance.hasRewardCliamed(rwdId);
            let endingIds = clientCore.OperaManager.instance.getEndingIdByRoleId(this._roleId);
            let canGet = clientCore.OperaManager.instance.checkRouteJumped(endingIds[this.listTab.selectedIndex]);
            this.btnGet.visible = !haveGet;
            this.imgGet.visible = haveGet;
            this.btnGet.disabled = !canGet;
            let rwdXls = xls.get(xls.dramaAward).get(rwdId);
            this.listReward.dataSource = clientCore.LocalInfo.sex == 1 ? rwdXls.femaleAward : rwdXls.maleAward;
            this.listReward.repeatX = this.listReward.length;
            //全通奖励
            let allRwdGet = clientCore.OperaManager.instance.hasRewardCliamed(11);
            let allCanGet = clientCore.OperaManager.instance.checkHaveAllBranchEnding() && clientCore.OperaManager.instance.chechHaveTrueEnding();
            this.imgGetAll.visible = allRwdGet;
            this.btnGetAll.visible = !allRwdGet;
            this.btnGetAll.disabled = !allCanGet;
            let role1Ending = clientCore.OperaManager.instance.getEndingIdByRoleId(1);
            let role2Ending = clientCore.OperaManager.instance.getEndingIdByRoleId(2)
            let role1 = _.filter(role1Ending, id => clientCore.OperaManager.instance.checkRouteJumped(id));
            let role2 = _.filter(role2Ending, id => clientCore.OperaManager.instance.checkRouteJumped(id));
            let trueEndingNum = clientCore.OperaManager.instance.chechHaveTrueEnding() ? 1 : 0
            this.txtEndNum.text = (role1.length + role2.length + trueEndingNum) + '/' + (role1Ending.length + role2Ending.length + 1);
        }

        private onGetReward() {
            let rwdId = (this._roleId - 1) * 3 + this.listTab.selectedIndex + 4;
            clientCore.OperaManager.instance.getRewardByIdx(rwdId).then(() => {
                this.updateReward();
            })
        }

        private onGetAllReward() {
            clientCore.OperaManager.instance.getRewardByIdx(11).then(() => {
                this.updateReward();
            })
        }
    }
}