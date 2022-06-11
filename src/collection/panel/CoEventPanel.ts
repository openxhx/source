namespace collection {
    import CollectManager = clientCore.CollectManager;
    export class CoEventPanel implements ICollectionPanel {
        ui: ui.collection.panel.EventPanelUI;
        constructor() {
            this.ui = new ui.collection.panel.EventPanelUI();
            this.ui.list.vScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.dataSource = [];
            this.ui.boxScroll.visible = false;
            this.addEvent();
        }

        async show() {
            await CollectManager.instance.reqInfo(clientCore.CO_TYPE.EVENT);
            this.onTabChange(1);
        }

        waitLoad() {
            return Promise.resolve();
        }

        private onTabChange(tab: number) {
            this.ui.list.dataSource = CollectManager.instance.getCoEventInfoByType(tab);
            this.ui.boxScroll.visible = this.ui.list.length > 5;
            for (let i = 1; i <= 4; i++) {
                let isCurrTab = tab == i;
                this.ui['btn_' + i].getChildAt(0).index = isCurrTab ? 0 : 1;
                this.ui['btn_' + i].getChildAt(1).index = isCurrTab ? 1 : 0;
            }
        }

        private onListRender(cell: ui.collection.render.EventListRenderUI, idx: number) {
            let data = cell.dataSource as clientCore.CoBigEventInfo;
            cell.txtTime.text = data.finishDate;
            cell.boxComplete.visible = data.srvData.finishTime > 0;
            cell.txtDetail.text = data.text;
        }

        private onScroll() {
            let scroll = this.ui.list.scrollBar;
            this.ui.scrollBar.y = scroll.value / scroll.max * 467;
        }

        private onOpenWeek() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.WEEKLY_RECORD);
        }

        private onOpenHistory() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.HISTORY);
        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
            BC.addEvent(this, this.ui.btnLastWeek, Laya.Event.CLICK, this, this.onOpenWeek);
            BC.addEvent(this, this.ui.btnHistory, Laya.Event.CLICK, this, this.onOpenHistory);
            for (let i = 1; i <= 4; i++) {
                BC.addEvent(this, this.ui['btn_' + i], Laya.Event.CLICK, this, this.onTabChange, [i]);
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