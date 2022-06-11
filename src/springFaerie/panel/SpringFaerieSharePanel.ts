namespace springFaerie {
    export class SpringFaerieSharePanel extends ui.springFaerie.panel.SpringFaerieSharePanelUI {

        private model: SpringFaerieModel;

        constructor(sign: number) {
            super();
            this.sideClose = true;
            this.init();
            this.sign = sign;
            this.model = clientCore.CManager.getModel(this.sign) as SpringFaerieModel;
        }

        init() {
            this.head.skin = clientCore.LocalInfo.headImgUrl;
            this.nameTxt.text = clientCore.LocalInfo.userInfo.nick;
        }

        public show() {
            //clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','打开制作元宵面板');
            clientCore.DialogMgr.ins.open(this);
            this.shareBg.visible = false;
            this.tip.visible = this.model.shareTag != 1;
        }

        public hide(){
            clientCore.DialogMgr.ins.close(this, false);
        }

        async shareClick() {
            this.shareBg.visible = true;
            this.light.visible = false;
            this.tip.visible = false;
            this.shareBtn.visible = false;
            this.closeBtn.visible = false;
            this.flower.visible = false;
            await SpringFaerieShareManager.showShare('horizontal');
            this.shareBg.visible = false;
            this.light.visible = true;
            this.tip.visible = this.model.shareTag != 1;
            this.shareBtn.visible = true;
            this.closeBtn.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.shareBtn, Laya.Event.CLICK, this, this.shareClick);
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.hide);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }

        clear(): void {
            this.model = null;
        }
    }
}