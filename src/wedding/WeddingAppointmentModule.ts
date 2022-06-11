namespace wedding {

    /**
     * 结缘礼预约模块
     * wedding.WeddingAppointmentModule
     */
    export class WeddingAppointmentModule extends ui.wedding.WeddingAppointmentModuleUI {

        private _appointArr: pb.IWeddingCounts[];
        /**打开面板时的当天0点时间戳 */
        private _openModTime: number;
        private _config: xls.cpCommonDate;
        private _selectMapIdx: number = 0;
        private _selectTimeIdx: number;

        init(d: any) {
            this.boxSure.visible = false;
            this._openModTime = util.TimeUtil.floorTime(Math.floor(util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime).getTime() / 1000));
            this.listDay.selectedIndex = 0;
            this.listDay.selectEnable = true;
            this.listDay.renderHandler = new Laya.Handler(this, this.onDayRender);
            this.listDay.selectHandler = new Laya.Handler(this, this.onDaySelect);
            this.listTime.renderHandler = new Laya.Handler(this, this.onTimeRender);
            this.listTime.mouseHandler = new Laya.Handler(this, this.onListTimeMouse);
            this.addPreLoad(xls.load(xls.cpCommonDate));
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        async seqPreLoad() {
            await this.reqAppointmentInfo();
        }

        onPreloadOver() {
            this._config = xls.get(xls.cpCommonDate).get(1);
            this.txtCoin.text = this.txtCoinSure.text = this._config.weddingPrice.v2.toString();
            this.onDaySelect(0);
            this.listDay.dataSource = [0, 1, 2];
            this.listTime.dataSource = this._config.weddingHour;
        }

        private reqAppointmentInfo() {
            return net.sendAndWait(new pb.cs_get_wedding_reservation_info()).then((data: pb.sc_get_wedding_reservation_info) => {
                this._appointArr = data.wCounts.sort((a, b) => {
                    return a.dTime - b.dTime;
                });
                this.listTime.startIndex = this.listTime.startIndex;
            })
        }

        private onDayRender(cell: ui.wedding.render.AppointmentRenderUI, idx: number) {
            cell.imgContent.skin = `wedding/day_${idx}.png`;
            cell.imgSelect.visible = idx == this.listDay.selectedIndex;
        }

        private onDaySelect(idx: number) {
            this.listTime.startIndex = this.listTime.startIndex;
            this._selectTimeIdx = -1;
            this.listTime.startIndex = this.listTime.startIndex;
            this.showSelect();
        }

        private onTimeRender(cell: ui.wedding.render.AppointmentRenderUI, idx: number) {
            cell.imgContent.skin = `wedding/${this._config.weddingHour[idx]}.png`;
            cell.imgSelect.visible = idx == this._selectTimeIdx;
            cell.imgCanOrder.skin = this.checkCanOrder(this.listDay.selectedIndex, idx) ? 'wedding/yes.png' : 'wedding/no.png';
            let timePassed = this.getTimeByIdx(this.listDay.selectedIndex, idx) < clientCore.ServerManager.curServerTime;
            if (timePassed)
                cell.imgCanOrder.skin = 'wedding/no.png';
        }

        private onListTimeMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let canOrder = this._appointArr[this.listDay.selectedIndex].counts[idx] < this._config.weddingLimit.v1;
                let timePassed = this.getTimeByIdx(this.listDay.selectedIndex, idx) < clientCore.ServerManager.curServerTime;
                if (canOrder && !timePassed) {
                    this._selectTimeIdx = idx;
                    this.listTime.startIndex = this.listTime.startIndex;
                    this.showSelect();
                }
            }
        }

        private showSelect() {
            let mapId = this._config.weddingMap[this._selectMapIdx];
            this.imgMap.skin = this.imgMapSure.skin = `unpack/wedding/map_${mapId}.png`;
            this.imgMapName.skin = this.imgMapNameSure.skin = `wedding/mapName_${mapId}.png`;
            let mapName = xls.get(xls.map).get(mapId)?.name ?? '啥地图';
            this.txtContent.text = `${mapName}中的甜蜜结缘礼 时长60分钟`;
            this.btnOk.disabled = !this.checkCanOrder(this.listDay.selectedIndex, this._selectTimeIdx);
            let date = util.TimeUtil.formatSecToDate(this.openTimeByCurrSelect);
            let dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
            this.txtContentSure.text = `结缘礼日期：${dateStr} ${util.StringUtils.getDateStr2(this.openTimeByCurrSelect - this._openModTime, '{hour}:{min}')}`;
        }

        /**
         * 判断某个时间点能否预约
         * @param dayIdx 日子idx
         * @param timeIdx 时间idx
         */
        private checkCanOrder(dayIdx: number, timeIdx: number) {
            return this._appointArr[dayIdx].counts[timeIdx] < this._config.weddingLimit.v1;
        }

        private onOk() {
            if (this._selectTimeIdx == -1) {
                alert.showFWords('请选择时间');
            }
            else {
                this.boxSure.visible = true;
                this.boxAppoitment.visible = false;
            }
        }

        private onBackClick() {
            if (this.boxSure.visible) {
                this.boxSure.visible = false;
                this.boxAppoitment.visible = true;
            }
            else {
                this.destroy();
            }
        }

        private onChangePage(diff: number) {
            this._selectMapIdx = _.clamp(this._selectMapIdx + diff, 0, this._config.weddingMap.length - 1);
            this.showSelect();
        }

        /**根据当前所选预约 返回时间戳 */
        private get openTimeByCurrSelect() {
            return this.getTimeByIdx(this.listDay.selectedIndex, this._selectTimeIdx);
        }

        private getTimeByIdx(dayIdx: number, timeIdx: number) {
            let hour = 3600 * (dayIdx >= 0 ? this._config.weddingHour[timeIdx] : 0);
            let day = 24 * 3600 * dayIdx;
            return this._openModTime + day + hour;
        }

        private onSure() {
            let have = clientCore.ItemBagManager.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);
            let need = parseInt(this.txtCoin.text);
            if (have < need) {
                alert.showSmall('灵豆不足，是否补充？', { callBack: { caller: this, funArr: [this.goBuyBean] } })
                return;
            }
            alert.showSmall(`是否确认消耗${need}${clientCore.ItemsInfo.getItemName(this._config.weddingPrice.v1)}预定当前时段结缘礼？结缘礼开始需结缘双方都在场，预定后无法取消`, { callBack: { caller: this, funArr: [this.lastSure] } })
        }

        private lastSure() {
            let mapId = this._config.weddingMap[this._selectMapIdx];
            net.sendAndWait(new pb.cs_cp_wedding_appointment({ startTime: this.openTimeByCurrSelect, mapId: mapId })).then((data: pb.sc_cp_wedding_appointment) => {
                alert.showFWords('结缘礼已预定，请注意时间！');
                clientCore.CpManager.instance.haveWedding = true;
                clientCore.CpManager.instance.selfWeddingInfo = { invite: data.invite, weddingInfo: data.weddingInfo };
                this.destroy();
            }).catch((e) => {
                this._selectTimeIdx = -1;
                this.reqAppointmentInfo();
            })
        }

        private goBuyBean() {
            clientCore.ToolTip.gotoMod(50);
        }

        private onCpWeddingInfoChange() {
            alert.showSmall('你的花缘已经预约了一场结缘礼啦', { btnType: alert.Btn_Type.ONLY_SURE, needClose: false, callBack: { caller: this, funArr: [this.destroy] } })
        }

        private onCpInfoChange() {
            if (!clientCore.CpManager.instance.haveCp()) {
                alert.showSmall('你已没有花缘', { btnType: alert.Btn_Type.ONLY_SURE, needClose: false, callBack: { caller: this, funArr: [this.destroy] } });
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOk, Laya.Event.CLICK, this, this.onOk);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onBackClick);
            BC.addEvent(this, this.btnPrev, Laya.Event.CLICK, this, this.onChangePage, [-1]);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onChangePage, [1]);
            BC.addEvent(this, EventManager, globalEvent.CP_CHANGE_WEDDINGINFO, this, this.onCpWeddingInfoChange);
            BC.addEvent(this, EventManager, globalEvent.CP_INFO_UPDATE, this, this.onCpInfoChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            clientCore.UIManager.releaseCoinBox();
        }
    }
}