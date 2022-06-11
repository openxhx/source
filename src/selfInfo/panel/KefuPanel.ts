namespace selfInfo {
    export class KefuPanel extends ui.selfInfo.panel.KefuPanelUI {

        constructor() {
            super();
            let isOfficial = channel.ChannelControl.ins.isOfficial;
            this.unofficialTxt.visible = !isOfficial;
            this.officialTxt.visible = isOfficial;
        }

        show() {
            this.btnPrivacy.visible = channel.ChannelConfig.channelId != channel.ChannelEnum.OPPO;
            clientCore.DialogMgr.ins.open(this);
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private showPrivacy() {
            let url: string = 'https://account.61.com/main?goto_url=%2Fchange%2Fshow_close_account&referer=%2Fchange%2Fshow_close_account';
            if (clientCore.GlobalConfig.isH5) {
                window.open(url);
                return;
            }
            clientCore.NativeMgr.instance.openUrl(url, true);
        }

        private showPromise(): void {
            clientCore.ModuleManager.open('privacy.PrivacyModule');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnPrivacy, Laya.Event.CLICK, this, this.showPrivacy);
            BC.addEvent(this, this.btnPromise, Laya.Event.CLICK, this, this.showPromise);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}