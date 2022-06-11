namespace mail.panel {
    export class InvitePanel extends ui.mail.panel.InvitePanelUI {
        private _info: pb.IWeddingInfo;
        private _seq: number;
        show(data: pb.IWeddingInfo, seq: number) {
            let d = data;
            this._info = d;
            this._seq = seq;
            this.txtPlace.style.font = '汉仪中圆简';
            this.txtPlace.style.fontSize = 30;
            this.txtPlace.style.align = 'center';
            this.txtPlace.style.width = 476;
            this.txtName.text = `${d.cps[0].nick} & ${d.cps[1].nick}`;
            let date = util.TimeUtil.formatSecToDate(d.startTime);
            let beginDate = util.TimeUtil.floorTime(d.startTime);
            this.txtTime.text = `${date.getMonth() + 1}月${date.getDate()}日 ${util.StringUtils.getDateStr2(Math.floor(date.getTime() / 1000) - beginDate, '{hour}:{min}')}`
            let mapName = xls.get(xls.map).get(d.mapId)?.name ?? '未知地图';
            this.txtPlace.innerHTML = util.StringUtils.getColorText3(`在{${mapName}}举办结缘礼`, '#6e5ec7', '#ff00fc');
            clientCore.DialogMgr.ins.open(this);
        }

        private onClose(needAni: boolean = true) {
            clientCore.DialogMgr.ins.close(this, needAni);
        }

        private onGo() {
            let now = clientCore.ServerManager.curServerTime;
            if (_.inRange(now, this._info.startTime, this._info.startTime + 3600)) {
                this.onClose(true);
                clientCore.MapManager.enterWedding(this._info);
            }
            else
                alert.showFWords('当前不在结缘礼时间内')
        }

        private onDelete() {
            MailSCommand.ins.deleteMail(0, Laya.Handler.create(this, (array: number[]) => {
                _.forEach(array, (element: number) => {
                    clientCore.MailManager.ins.removeMail(2, element);
                })
                this.event(Laya.Event.CHANGED);
                this.onClose();
            }), this._seq)
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnDelete, Laya.Event.CLICK, this, this.onDelete);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}