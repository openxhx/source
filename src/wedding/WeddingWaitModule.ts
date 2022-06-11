
namespace wedding {
    /**
     * 结缘礼已预约，等待面板
     * wedding.WeddingWaitModule
     */
    export class WeddingWaitModule extends ui.wedding.WeddingWaitModuleUI {
        private _friendPanel: WeddingFriendPanel;
        private _detailPanel: WeddingDetailPanel;
        private readonly NEED_ID: number;
        private readonly NEED_NUM: number;
        constructor() {
            super();
            let pair = xls.get(xls.cpCommonDate).get(1).weddingBroadcast;
            this.NEED_ID = pair.v1;
            this.NEED_NUM = pair.v2;
        }

        init(data: any) {
            let d = clientCore.CpManager.instance.selfWeddingInfo.weddingInfo;
            this.txtPlace.style.font = '汉仪中圆简';
            this.txtPlace.style.fontSize = 30;
            this.txtPlace.style.align = 'center';
            this.txtPlace.style.width = this.txtPlace.width;
            this.txtName.text = `${d.cps[0].nick} & ${d.cps[1].nick}`;
            let date = util.TimeUtil.formatSecToDate(d.startTime);
            let beginDate = util.TimeUtil.floorTime(d.startTime);
            this.txtTime.text = `${date.getMonth() + 1}月${date.getDate()}日 ${util.StringUtils.getDateStr2(Math.floor(date.getTime() / 1000) - beginDate, '{hour}:{min}')}`
            let mapName = xls.get(xls.map).get(d.mapId)?.name ?? '未知地图';
            this.txtPlace.innerHTML = util.StringUtils.getColorText3(`在{${mapName}}举办结缘礼`, '#6e5ec7', '#ff00fc');
            this.btnSend.disabled = clientCore.CpManager.instance.selfWeddingInfo.invite > 0;
            this.txtNum.text = 'x' + this.NEED_NUM;
            this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(this.NEED_ID);
        }

        private onPickFriend() {
            this._friendPanel = this._friendPanel || new WeddingFriendPanel();
            this._friendPanel.show();
            this._friendPanel.on(Laya.Event.COMPLETE, this, this.destroy);
        }

        private onBoardCast() {
            alert.showSmall(`是否花费${this.NEED_NUM}${clientCore.ItemsInfo.getItemName(this.NEED_ID)}神世界频道发布结缘之礼的消息？`, {
                callBack: {
                    caller: this,
                    funArr: [
                        this.sure
                    ]
                }
            })
        }

        private sure() {
            let have = clientCore.ItemsInfo.getItemNum(this.NEED_ID);
            if (have < this.NEED_NUM)
                if (this.NEED_ID == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                    alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                } else {
                    alert.alertQuickBuy(this.NEED_ID, this.NEED_NUM - have, true);
                }
            else
                net.sendAndWait(new pb.cs_send_wedding_reservation_announcement()).then(() => {
                    this.destroy();
                })
        }

        private onGo() {
            let info = clientCore.CpManager.instance.selfWeddingInfo.weddingInfo;
            let selfOpenTime = info.startTime;
            let now = clientCore.ServerManager.curServerTime;
            if (_.inRange(now, selfOpenTime, selfOpenTime + 3600))
                clientCore.MapManager.enterWedding(info);
            else
                alert.showFWords('当前不在结缘礼时间内');
        }

        private onDetail() {
            this._detailPanel = this._detailPanel || new WeddingDetailPanel();
            this._detailPanel.show()
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.onPickFriend);
            BC.addEvent(this, this.btnBroad, Laya.Event.CLICK, this, this.onBoardCast);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGo);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy()
            this._friendPanel?.offAll();
            this._detailPanel?.destroy();
            this._friendPanel?.destroy();
        }
    }
}