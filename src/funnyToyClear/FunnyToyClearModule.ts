namespace funnyToyClear {
    /**
     * 奇趣道具清除面板
     * funnyToyClear.FunnyToyClearModule
     * 参数：{itemId:number, endTime:number}
     */
    export class FunnyToyClearModule extends ui.funnyToyClear.FunnyToyClearModuleUI {
        private _allInfo: pb.IpropInfo[];
        private _nowIdx: number;
        init(d: any) {
            let now = clientCore.ServerManager.curServerTime;
            this._allInfo = _.filter(clientCore.LocalInfo.srvUserInfo.propStampInfo, o => o.clearPropStamp != 0 && o.clearPropStamp >= now);
            this._nowIdx = 0;
        }


        onPreloadOver() {
            this.updateView();
            this.onTimer();
        }

        private onClear() {
            let id = this._allInfo[this._nowIdx].propId
            net.sendAndWait(new pb.cs_clear_map_tool({ propId: id })).then(() => {
                this.destroy();
            })
        }

        private updateView() {
            let id = this._allInfo[this._nowIdx].propId
            this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this.txtName.text = clientCore.ItemsInfo.getItemName(id);
            let xlsInfo = xls.get(xls.funnyProp).get(id);
            this.imgNeedIcon.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.cost.v1);
            this.txtNum.text = xlsInfo.cost.v2.toString();
            this.boxPrice.visible = clientCore.FlowerPetInfo.petType == 0;
            this.boxVip.visible = clientCore.FlowerPetInfo.petType != 0;
            this.btnPrev.visible = this._nowIdx > 0;
            this.btnNext.visible = this._nowIdx < this._allInfo.length - 1;
        }

        private onTimer() {
            let leftTime = this._allInfo[this._nowIdx].clearPropStamp - clientCore.ServerManager.curServerTime;
            if (leftTime <= 0) {
                this.checkNeedDestory();
            }
            else {
                this.txtTime.text = util.StringUtils.getDateStr2(leftTime);
            }
        }

        private checkNeedDestory() {
            let now = clientCore.ServerManager.curServerTime;
            this._allInfo = _.filter(clientCore.LocalInfo.srvUserInfo.propStampInfo, o => o.clearPropStamp != 0 && o.clearPropStamp >= now);
            if (this._allInfo.length == 0) {
                this.destroy();
            }
            else {
                this._nowIdx = 0;
                this.updateView();
            }
        }

        private onChangePage(diff: number) {
            this._nowIdx = _.clamp(this._nowIdx + diff, 0, this._allInfo.length - 1);
            this.updateView();
            this.onTimer();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnClear, Laya.Event.CLICK, this, this.onClear);
            BC.addEvent(this, this.btnPrev, Laya.Event.CLICK, this, this.onChangePage, [-1]);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onChangePage, [1]);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.onTimer);
            BC.removeEvent(this);
        }
    }
}