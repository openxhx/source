namespace collection {
    import CollectManager = clientCore.CollectManager;
    export class CoBadgePanel implements ICollectionPanel {
        private _type: number = -1;
        ui: ui.collection.panel.BadgePanelUI;
        constructor() {
            this.ui = new ui.collection.panel.BadgePanelUI();
            this.ui.list.vScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.addEvent();
        }

        waitLoad() {
            return Promise.resolve();
        }

        async show() {
            await CollectManager.instance.reqInfo(clientCore.CO_TYPE.BADGE);
            this.showType(0);
            this.showProgress();
        }

        private showProgress() {
            let pro = CollectManager.instance.getCollectProgress(clientCore.CO_TYPE.BADGE);
            this.ui.imgProgress.x = (pro.now / pro.total - 1) * 313;
            this.ui.txtProgress.text = pro.now + '/' + pro.total;
            this.ui.clip_rwd.index = pro.haveRwd ? 0 : 1;
            if (pro.haveRwd) {
                if (!this.ui.ani1.isPlaying)
                    this.ui.ani1.play(0, true);
            }
            else {
                this.ui.ani1.gotoAndStop(0);
            }
        }

        private showType(type: number) {
            if (this._type != type) {
                this._type = type;
                this.ui.list.scrollTo(0);
                this.ui.list.dataSource = CollectManager.instance.getBadgeListBytype(type);
                this.ui.boxScroll.visible = this.ui.list.length > 4;
                for (let i = 0; i < 4; i++) {
                    this.ui['tab_' + i].index = type == i ? 0 : 1;
                }
            }
        }

        private onListRender(cell: ui.collection.render.BadgeListRenderUI, idx: number) {
            let data = cell.dataSource as clientCore.CoBadgeInfo;
            cell.txtPoint.text = '成就点数' + data.point;
            cell.txtTitle.text = data.xlsData.achievementTitle;
            cell.txtDetail.text = data.des;
            let progress = data.progress;
            cell.txtProgress.text = progress.now + '/' + progress.total;
            cell.imgMask.x = (progress.now / progress.total - 1) * 290;
            clientCore.GlobalConfig.setRewardUI(cell.item, { id: data.reward.v1, cnt: data.reward.v2, showName: false });
            cell.btnRwd.visible = data.nowHaveReward;
            cell.imgComplete.visible = data.isComplete;
            let pathObj = pathConfig.getBadgeIcon(data.xlsData.achievementId, data.currStep);
            cell.imgBadgeBg.skin = pathObj.bg;
            cell.imgIcon.skin = pathObj.icon;
        }

        private async onListMouse(e: Laya.Event, idx: number) {
            if (e.type != Laya.Event.CLICK) return;
            if (e.target instanceof HuaButton) {
                let data = this.ui.list.getItem(idx) as clientCore.CoBadgeInfo;
                await CollectManager.instance.getBadgeReward(data.xlsData.achievementId);
                this.ui.list.dataSource = CollectManager.instance.getBadgeListBytype(this._type);
                this.showProgress();
            }
            if (e.target.name == 'imgBg') {
                clientCore.ToolTip.showTips(e.target, { id: e.currentTarget['dataSource'].reward.v1 });
            }
        }

        private onScroll() {
            let scroll = this.ui.list.scrollBar;
            this.ui.imgScroll.y = scroll.value / scroll.max * 432;
        }

        private async onGetProgressRwd() {
            if (this.ui.clip_rwd.index == 0) {
                await CollectManager.instance.getCollectProgressReward(clientCore.CO_TYPE.BADGE);
                this.showProgress();
            }
        }

        private addEvent() {
            BC.addEvent(this, this.ui.clip_rwd, Laya.Event.CLICK, this, this.onGetProgressRwd);
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            for (let i = 0; i < 4; i++) {
                BC.addEvent(this, this.ui['tab_' + i], Laya.Event.CLICK, this, this.showType, [i]);
            }
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        private onClose() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this.removeEvent();
        }
    }
}