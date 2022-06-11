namespace fetterGift {
    /**
     * 羁绊送礼
     */
    export class FetterGiftModule extends ui.fetterGift.FetterGiftModuleUI {
        private _uid: number;
        private _fetterPanel: FetterGiftPanel;
        private _friendPanel: SendToFriendPanel;
        private _haveSendMap: util.HashMap<number>;
        init(data: number): void {
            this._uid = data;
            this._haveSendMap = new util.HashMap();
            this.addPreLoad(xls.load(xls.globaltest, true));
            this.addPreLoad(xls.load(xls.global));
            this.addPreLoad(net.sendAndWait(new pb.cs_send_gift_list_info()).then((data: pb.sc_send_gift_list_info) => {
                for (const o of data.list) {
                    this._haveSendMap.add(o.uid, o.times);
                }
            }))
            this.sideClose = true;
            this.mouseThrough = true;
            this.isPromptlyClose = true;
        }

        private onFetter() {
            this._fetterPanel = this._fetterPanel || new FetterGiftPanel();
            this._fetterPanel.show(this._uid);
            this._fetterPanel.once(Laya.Event.CLOSE, this, this.destroy);
        }

        private onFriend() {
            let items = xls.get(xls.globaltest).get(1).friendDonate;
            if(clientCore.LocalInfo.uid == 1176157 && channel.ChannelControl.ins.isOfficial){
                items = xls.get(xls.global).get(1).friendDonate;
            }
            if (items.length == 0) {
                alert.showFWords(`当前没有可赠送道具~`);
                return;
            }
            let max = xls.get(xls.globaltest).get(1).friendDonateLimit;
            let sendMaxPeople = xls.get(xls.globaltest).get(1).friendDonateNum;
            let sendMaxPeopleNum = _.filter(this._haveSendMap.getValues(), times => times >= max).length;
            if (sendMaxPeopleNum >= sendMaxPeople) {
                alert.showFWords(`今日已经给${sendMaxPeople}个好友赠送过道具了~`)
                return;
            }
            let haveSend = this._haveSendMap.has(this._uid) ? this._haveSendMap.get(this._uid) : 0;
            if (haveSend >= max) {
                alert.showFWords(`今日向该好友赠送道具的数量已经满了~`)
                return;
            }
            this._friendPanel = this._friendPanel || new SendToFriendPanel();
            this._friendPanel.show(this._uid, haveSend);
            this._friendPanel.once(Laya.Event.CLOSE, this, this.destroy);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnFetter, Laya.Event.CLICK, this, this.onFetter);
            BC.addEvent(this, this.btnSendToFriend, Laya.Event.CLICK, this, this.onFriend);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            super.destroy();
            this._friendPanel?.destroy();
            this._fetterPanel?.destroy();
        }

    }
}