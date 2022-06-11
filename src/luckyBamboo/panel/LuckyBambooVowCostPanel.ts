namespace luckyBamboo {
    export class LuckyBambooVowCostPanel extends ui.luckyBamboo.panel.LuckyBambooVowCostPanelUI {
        private _model: LuckyBambooModel;
        private _waiting: boolean;
        private curPage: number;
        private maxPage: number;
        private allMaterial: number[];
        private allInfo: { id: number, cnt: number }[];
        constructor(sign: number) {
            super();
            this.sideClose = true;
            this._model = clientCore.CManager.getModel(sign) as LuckyBambooModel;
            this.init();
        }

        init() {
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
            this.allMaterial = clientCore.MaterialBagManager.getCanShowMtr();
        }

        show() {
            clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '打开祈愿面板');
            let have = _.filter(this.allMaterial, (o) => {
                return clientCore.ItemsInfo.getItemNum(o) > 0;
            })
            this.allInfo = _.map(have, (o) => {
                return { id: o, cnt: -clientCore.ItemsInfo.getItemNum(o) };
            })
            this.boxRefuse.visible = clientCore.LocalInfo.uid == this._model.curUid;
            this.imgGou.visible = this._model.limit == 0;
            this.maxPage = Math.ceil(this.allInfo.length / 6);
            this.labTip.visible = this.allInfo.length <= 0;
            if (this.labTip.visible) {
                this.labPage.text = "0/0";
                this.list.array = [];
            } else {
                this.allInfo = _.sortBy(this.allInfo, ["cnt"]);
                this.curPage = 1;
                this.labPage.text = this.curPage + "/" + this.maxPage;
                this.setList();
            }
            this._model.vowCose = 0;
            this.labCnt.text = "0";
            clientCore.DialogMgr.ins.open(this);
        }

        private setList() {
            let begin = (this.curPage - 1) * 6;
            let end = this.curPage * 6;
            if (end > this.allInfo.length) end = this.allInfo.length;
            let arr = this.allInfo.slice(begin, end);
            this.list.array = arr;
        }

        private changePage(flag: number) {
            if (this.maxPage < 2) return;
            this.curPage += flag;
            if (this.curPage > this.maxPage || this.curPage < 1) {
                this.curPage -= flag;
                return;
            }
            this.labPage.text = this.curPage + "/" + this.maxPage;
            this.setList();
        }

        private listSelect(index: number) {
            if (index == -1) return;
            let id = this.list.array[index].id;
            if (clientCore.ItemsInfo.getItemNum(id) >= 100) {
                this._model.vowCose = this.list.array[index].id;
                this.labCnt.text = "100";
            } else {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: id });
            }
            this.list.selectedIndex = -1;
        }

        private listRender(item: ui.luckyBamboo.render.VowMaterialRenderUI) {
            let mtr: { id: number, cnt: number } = item.dataSource;
            item.imgGou.visible = mtr.id == this._model.vowCose;
            item.labCount.text = "" + clientCore.ItemsInfo.getItemNum(mtr.id);
            item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(mtr.id);
        }

        /**确定材料 */
        private sure() {
            if (!this._model.vowCose) return;
            this.close();
            EventManager.event("OPEN_VOW_PANEL", "write");
        }

        /**设置留言权限 */
        private setLimit() {
            if (this._waiting) return;
            this._waiting = true;
            this.imgGou.visible = !this.imgGou.visible;
            net.sendAndWait(new pb.cs_luck_bamboo_wish_plate_limit({ flag: this.imgGou.visible ? 0 : 1 })).then(() => {
                this._model.limit = this.imgGou.visible ? 0 : 1;
                this._waiting = false;
            }).catch(() => {
                this.imgGou.visible = !this.imgGou.visible;
                this._waiting = false;
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sure);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changePage, [1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changePage, [-1]);
            BC.addEvent(this, this.boxRefuse, Laya.Event.CLICK, this, this.setLimit);
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}