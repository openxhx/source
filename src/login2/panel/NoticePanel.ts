namespace login2.panel {
    export class NoticePanel extends ui.login2.panel.NoticePanelUI {

        public closeHandler: Laya.Handler;

        constructor() {
            super();
            this.sideClose = false;
            this.list.vScrollBarSkin = null;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.selectHandler = new Laya.Handler(this, this.onListSelectHanlder);
            let arr = xls.get(xls.noticeBoard).getValues();
            this.list.dataSource = arr.filter((v) => {
                let t1 = (new Date(v.noticeOpen)).getTime();
                let t2 = (new Date(v.noticeClose)).getTime();
                let now = (new Date()).getTime();
                let needType = channel.ChannelControl.ins.isOfficial ? 1 : 2;
                return now >= t1 && now <= t2 && (needType == v.isOffical || v.isOffical == 0);
            })
            this.txtTitle.text = '';
            this.txtDesc.text = '';
            this.list.selectedIndex = this.list.dataSource.length > 0 ? 0 : -1;
            this.panel.vScrollBarSkin = null;
        }

        // private getTime(str: string) {
        //     let arr = _.map(str.split('-'), (s) => {
        //         return parseInt(s);
        //     });
        //     let t = new Date(arr[0], arr[1] - 1, arr[2]);
        //     return t.getTime();
        // }

        private onListRender(box: Laya.Box, idx: number) {
            let data = box.dataSource as xls.noticeBoard;
            (box.getChildByName('clipBg') as Laya.Clip).index = this.list.selectedIndex == idx ? 0 : 1;
            (box.getChildByName('clipHead') as Laya.Clip).index = data.noticeType == 1 ? 0 : 1;
            (box.getChildByName('txt') as Laya.Label).text = data.noticeTitle;
        }

        private onListSelectHanlder(idx: number) {
            let data = this.list.selectedItem as xls.noticeBoard;
            this.txtTitle.text = data.noticeTitle;
            this.txtDesc.text = data.noticeDes;
            this.img.skin = pathConfig.getNoticeImg(data.img);
            this.panel.height = data.img ? 249 : 355;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
            this.closeHandler && this.closeHandler.run();
            this.closeHandler = null;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}