namespace mentor {
    export class MentorHelpPanel extends ui.mentor.panel.MentorHelpPanelUI {
        private _selectIdArr: number[];

        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
        }

        show() {
            this._selectIdArr = [];
            let xlsArr = xls.get(xls.tutorSupply).getValues();
            let supply = _.find(xlsArr, o => o.traineeLevel == clientCore.LocalInfo.userLv);
            if (!supply) {
                alert.showFWords('当前等级没有物资请求数据')
            }
            this.list.dataSource = supply ? supply.supplyList : [];
            this.list.startIndex = this.list.startIndex;
            this.onScroll();
            clientCore.DialogMgr.ins.open(this);
        }

        private onListRender(cell: ui.mentor.render.MentorHelpItemRenderUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            clientCore.GlobalConfig.setRewardUI(cell.item, { id: data.v1, cnt: data.v2, showName: false });
            cell.btn.visible = this._selectIdArr.indexOf(data.v1) == -1;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = e.currentTarget['dataSource'] as xls.pair;
                if (e.target.name == 'imgBg') {
                    clientCore.ToolTip.showTips(e.target, { id: data.v1 });
                }
                else {
                    this.select(data.v1);
                }
            }
        }

        private select(id: number) {
            if (this._selectIdArr.indexOf(id) > -1) {
                _.remove(this._selectIdArr, (o) => { return o == id });
            }
            else if (this._selectIdArr.length < 3) {
                this._selectIdArr.push(id);
            }
            else {
                alert.showFWords('最多选择3个求助');
            }
            this.txtNum.text = this._selectIdArr.length.toString();
            this.txtNum.color = this._selectIdArr.length == 3 ? '#9f6230' : '#ff0000';
            this.list.startIndex = this.list.startIndex;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onSendHelp() {
            if (this._selectIdArr.length == 3) {
                alert.showSmall('是否确认请求该物资？（选择之后今日无法更改）', { callBack: { caller: this, funArr: [this.sureHelp] } })
            }
        }

        private sureHelp() {
            clientCore.MentorManager.teacher.askHelpToTeacher(this._selectIdArr).then(() => {
                this.onClose();
            })
        }

        private onScroll() {
            let scroll = this.list.scrollBar;
            this.imgScrollBar.y = this.imgScrollBg.y + (this.imgScrollBg.height - this.imgScrollBar.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btn, Laya.Event.CLICK, this, this.onSendHelp);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScroll);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}