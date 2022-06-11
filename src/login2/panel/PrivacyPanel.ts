namespace login2.panel {
    export class PrivacyPanel extends ui.login2.panel.PrivacyPanelUI {
        private _permissionPanel: PermissionPanel;
        constructor() {
            super();
            this.sideClose = false;
            // let txt = res.get(`res/json/${channel.ChannelConfig.privacy}.txt`) as string;
            // this.txt.text = txt;
            this.panel.vScrollBarSkin = null;
            this.imgGou.visible = false;
            // if (channel.ChannelConfig.channelId > 60 || channel.ChannelConfig.channelId == 2 || channel.ChannelConfig.channelId == channel.ChannelEnum.YSDK) {//官服、小米、应用宝
            //     for (let i = 0; i <= 12; i++) {
            //         let img1 = new Laya.Image(`res/private/${i}_0.png`);
            //         let img2 = new Laya.Image(`res/private/${i}_1.png`);
            //         this.img.addChildAt(img1, 0);
            //         this.img.addChildAt(img2, 0);
            //         img1.pos(0, i * 747);
            //         img2.pos(393, i * 747);
            //     }
            //     // this.img.skin = 'res/private/taomee.png';
            //     this.panel.addChild(this.img);
            //     this.img.pos(0, 0);
            //     this.panel.vScrollBar.max = 9282;
            //     this.txt.text = '';
            // } else {
            //     this.addPreLoad(res.load(`res/json/${channel.ChannelConfig.privacy}.txt`));
            // }
            for (let i = 0; i <= 12; i++) {
                let img1 = new Laya.Image(`res/private/${i}_0.png`);
                let img2 = new Laya.Image(`res/private/${i}_1.png`);
                this.img.addChildAt(img1, 0);
                this.img.addChildAt(img2, 0);
                img1.pos(0, i * 747);
                img2.pos(393, i * 747);
            }
            // this.img.skin = 'res/private/taomee.png';
            this.panel.addChild(this.img);
            this.img.pos(0, 0);
            this.panel.vScrollBar.max = 9282;
            this.txt.text = '';
            this.updateView();
        }

        private change() {
            let scrollBar = this.panel.vScrollBar;
            this.imgBar.y = (this.imgBagBg.height - this.imgBar.height) * (scrollBar.value / scrollBar.max) + this.imgBagBg.y;
        }

        private updateView() {
            this.btnSure.disabled = !this.imgGou.visible;
        }

        private onSelect() {
            this.imgGou.visible = !this.imgGou.visible;
            this.updateView();
        }

        private onPermission() {
            this._permissionPanel = this._permissionPanel || new PermissionPanel();
            this._permissionPanel.show();
        }

        private goPanel(pos: number) {
            this.panel.vScrollBar.value = pos;
        }

        private closeGame() {
            window.location.reload();
        }

        addEventListeners() {
            BC.addEvent(this, this.boxSelect, Laya.Event.CLICK, this, this.onSelect);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onClosePanel);
            BC.addEvent(this, this.btnno, Laya.Event.CLICK, this, this.closeGame);
            BC.addEvent(this, this.btnPermision, Laya.Event.CLICK, this, this.onPermission);
            BC.addEvent(this, this.btnTo, Laya.Event.CLICK, this, this.goPanel, [5060]);
            BC.addEvent(this, this.btnTo1, Laya.Event.CLICK, this, this.goPanel, [5060]);
            BC.addEvent(this, this.btnTo2, Laya.Event.CLICK, this, this.goPanel, [7216]);
            BC.addEvent(this, this.panel.vScrollBar, Laya.Event.CHANGE, this, this.change);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        onClosePanel() {
            Laya.LocalStorage.setItem(channel.ChannelConfig.privacy, 'true');
            clientCore.DialogMgr.ins.close(this);
        }

        destroy() {
            super.destroy();
            this._permissionPanel?.destroy();
            this._permissionPanel = null
        }

    }
}