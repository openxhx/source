namespace rechargeActivity {
    export class FlowerRecordPanel extends ui.rechargeActivity.flowerPanel.RecordPanelUI {
        private _dataGettedFlg: boolean;
        private _topGiveIdx: number;
        private _topGetIdx: number;
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.list.dataSource = [];
            this.addEventListeners()
        }

        init(d: any) {
            if (!this._dataGettedFlg) {
                net.sendAndWait(new pb.cs_player_give_flower_record({ startIdx: 0, endIdx: 98 })).then((data: pb.sc_player_give_flower_record) => {
                    this._dataGettedFlg = true;
                    this.list.dataSource = data.fRecords;
                    this._topGiveIdx = _.indexOf(data.fRecords, _.maxBy(data.fRecords, o => o.type == 2 ? 0 : o.num));
                    this._topGetIdx = _.indexOf(data.fRecords, _.maxBy(data.fRecords, o => o.type == 1 ? 0 : o.num));
                    this.boxScroll.visible = data.fRecords.length > 6;
                    this.txtNo.visible = data.fRecords.length == 0;
                })
            }
        }

        private onListRender(cell: ui.rechargeActivity.flowerRender.FlowerRecordRenderUI, idx: number) {
            let data = cell.dataSource as pb.IFlowerRecord;
            cell.txtNick.text = data.nick;
            cell.txtFamilyName.text = data.familyName ? data.familyName : '尚未加入家族';
            let date = util.TimeUtil.formatSecToDate(data.timestamp);
            cell.txtDate.text = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
            cell.txtInfo.text = `${data.type == 1 ? '赠送给我' : '向TA送出'}鲜花${data.num}朵`;
            cell.imgRank.visible = cell.imgStar.visible = false;
            if (this._topGiveIdx == idx && data.type == 1) {
                cell.imgRank.visible = cell.imgStar.visible = true;
                cell.imgRank.skin = 'rechargeActivity/giveFlower/收花最多.png';
            }
            if (this._topGetIdx == idx && data.type == 2) {
                cell.imgRank.visible = cell.imgStar.visible = true;
                cell.imgRank.skin = 'rechargeActivity/giveFlower/赠花最多.png';
            }
            cell.txtRank.visible = !cell.imgRank.visible;
            cell.txtRank.text = (idx + 1).toString();
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let data = this.list.getItem(idx) as pb.IFlowerRecord;
                clientCore.UserInfoTip.showTips(e.currentTarget, data.uid);
            }
        }

        private onScorllChange() {
            let scroll = this.list.scrollBar;
            this.imgBar.y = (this.imgBarBg.height - this.imgBar.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScorllChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}