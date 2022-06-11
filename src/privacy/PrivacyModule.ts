namespace privacy {

    export class PrivacyModule extends ui.privacy.PrivacyModuleUI {
        private _permissionPanel: PermissionPanel;
        constructor() {
            super();
        }

        init() {
            this.panel.vScrollBarSkin = null;
            // if (channel.ChannelConfig.channelId > 60 || channel.ChannelConfig.channelId == 2 || channel.ChannelConfig.channelId == channel.ChannelEnum.YSDK) {//官服或小米
            //     // this.addPreLoad(res.load('res/private/taomee.png'));
            //     this.txt.text = '';
            // } else {
            //     this.addPreLoad(res.load(`res/json/${channel.ChannelConfig.privacy}.txt`));
            // }
            this.txt.text = '';
        }

        onPreloadOver() {
            // if (channel.ChannelConfig.channelId > 60 || channel.ChannelConfig.channelId == 2 || channel.ChannelConfig.channelId == channel.ChannelEnum.YSDK) {//官服或小米

            // } else {
            //     let txt = res.get(`res/json/${channel.ChannelConfig.privacy}.txt`) as string;
            //     this.txt.text = txt;
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
        }

        private change() {
            let scrollBar = this.panel.vScrollBar;
            this.imgBar.y = (this.imgBagBg.height - this.imgBar.height) * (scrollBar.value / scrollBar.max) + this.imgBagBg.y;
        }


        private onPermission() {
            this._permissionPanel = this._permissionPanel || new PermissionPanel();
            this._permissionPanel.show();
        }

        private goPanel(pos: number) {
            this.panel.vScrollBar.value = pos;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTo, Laya.Event.CLICK, this, this.goPanel, [5060]);
            BC.addEvent(this, this.btnTo1, Laya.Event.CLICK, this, this.goPanel, [5060]);
            BC.addEvent(this, this.btnTo2, Laya.Event.CLICK, this, this.goPanel, [7216]);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnPermision, Laya.Event.CLICK, this, this.onPermission);
            BC.addEvent(this, this.panel.vScrollBar, Laya.Event.CHANGE, this, this.change);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._permissionPanel?.destroy();
            this._permissionPanel = null
        }
    }
}