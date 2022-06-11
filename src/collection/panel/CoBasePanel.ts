namespace collection {
    export class CoBasePanel implements ICollectionPanel {
        ui: ui.collection.panel.BasePanelUI;
        private isInit: boolean;
        constructor() {
            this.ui = new ui.collection.panel.BasePanelUI();
            this.addEvent();
        }

        show() {
            if (!this.isInit) {
                net.sendAndWait(new pb.cs_get_collection_total_progress()).then((data: pb.sc_get_collection_total_progress) => {
                    this.ui.txtPoint.text = data.progress[0].toString();
                    for (let i = 0; i < data.progress.length; i++) {
                        const progress = data.progress[i];
                        let box = this.ui['pro_' + i];
                        box.txtProgress.text = progress + '%';
                        let maxW = box.width - 50;
                        box.imgPro.right = box.width - maxW * progress / 100;
                        if (box.parent.disabled) {
                            box.visible = false;
                        }
                    }
                });
                this.ui.txtName.text = clientCore.LocalInfo.userInfo.nick;
                this.ui.imgFrame.skin = clientCore.LocalInfo.frameImgUrl;
                this.ui.imgHead.skin = clientCore.LocalInfo.headImgUrl;
                this.ui.headFrame_1.visible = false;
                this.ui.headFrame_2.visible = false;
                this.isInit = true;
            }
        }
        waitLoad() {
            return Promise.resolve();
        }

        private onChangePanel(name: string) {
            EventManager.event(EV_CHAGE_PANEL, name);
        }

        private addEvent() {
            BC.addEvent(this, this.ui.imgSingle, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.SANJAIN]);
            BC.addEvent(this, this.ui.imgBadge, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.BADGE]);
            BC.addEvent(this, this.ui.imgRole, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.ROLE]);
            BC.addEvent(this, this.ui.imgCollect, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.COLLECT]);
            BC.addEvent(this, this.ui.imgCloth, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.CLOTH]);
            BC.addEvent(this, this.ui.imgStar, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.STAR]);
            BC.addEvent(this, this.ui.imgGarden, Laya.Event.CLICK, this, this.onChangePanel, [PANEL.GARDEN]);
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        private onClose() {
            clientCore.ModuleManager.closeModuleByName('collection')
        }

        destory() {
            this.removeEvent();
        }
    }
}