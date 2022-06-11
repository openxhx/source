namespace timeAmbulatory {
    export class TimeEvidencePanle extends ui.timeAmbulatory.panel.TimeEvidencePanelUI {
        private curPage: number = -1;
        private panel1: Evidence1Panel;
        private panel2: Evidence2Panel;
        private panel3: Evidence3Panel;
        private panel4: Evidence4Panel;
        private panel5: Evidence5Panel;
        private panel6: Evidence6Panel;
        private panel7: Evidence7Panel;
        //自动切换相关属性
        private defultPage: number;
        private panelName: { name: string, open: number }[];
        private panelArr: any[];
        constructor() {
            super();
            this.addEventListeners();
            this.initUI();
        }

        private initUI() {
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.tabRender);
            this.list.selectHandler = new Laya.Handler(this, this.tabMouse);
            this.panel1 = new Evidence1Panel();
            this.panel2 = new Evidence2Panel();
            this.panel3 = new Evidence3Panel();
            this.panel4 = new Evidence4Panel();
            this.panel5 = new Evidence5Panel();
            this.panel6 = new Evidence6Panel();
            this.panel7 = new Evidence7Panel();
            this.panelName = [{ name: "beiguojinli", open: 0 }, { name: "yingchunzhiqin", open: 0 }, { name: "hongbailianyu", open: 0 }, { name: "xiangruichunjian", open: 0 }, { name: "yuanyedengxiao", open: 1 }];
            this.panelArr = [this.panel3, this.panel4, this.panel5, this.panel6, this.panel7];
            this.defultPage = 4;
            this.imgDown.visible = false;
            this.list.array = this.panelName;
            this.list.repeatX = this.panelName.length;
        }

        /**页签 */
        private tabRender(item: ui.timeAmbulatory.render.TimeTagRenderUI) {
            let data: { name: string, open: number } = item.dataSource;
            item.tip.visible = data.open == 1;
            item.bg.skin = `timeAmbulatory/di_tag_${data.open}.png`;
            item.img.skin = `timeAmbulatory/${data.name}_${data.open}.png`;
            switch (data.name) {
                default:
                    item.red.visible = false;
            }
        }

        private tabMouse(idx: number) {
            if (idx < 0 || this.curPage == idx || idx > this.defultPage) return;
            if (this.curPage >= 0) {
                this.panelArr[this.curPage].hide();
                this.panelName[this.curPage].open = 0;
            }
            this.panelName[idx].open = 1;
            this.list.refresh();
            this.curPage = idx;
            if (this.panelArr[idx].parent) {
                this.panelArr[idx].visible = true;
            } else {
                this.boxPanel.addChild(this.panelArr[idx]);
            }
            this.panelArr[idx].onShow();
            this.list.selectedIndex = -1;
        }

        public onShow() {
            clientCore.Logger.sendLog('2021年1月15日活动', '【付费】光阴的回廊', '打开光阴之证面板');
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.tabMouse(this.defultPage);
        }

        public hide() {
            clientCore.UIManager.releaseCoinBox();
            this.visible = false;
        }

        addEventListeners() {
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        public destroy() {
            super.destroy();
            this.panel1.destroy();
            this.panel3.destroy();
            this.panel2.destroy();
            this.panel4.destroy();
            this.panel5.destroy();
            this.panel6.destroy();
            this.panel7.destroy();
            this.removeEventListeners();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}