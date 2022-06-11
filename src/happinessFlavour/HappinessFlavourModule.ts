namespace happinessFlavour {
    /**
     * 2021.12.3
     * 主活动节日的幸福味道
     * happinessFlavour.HappinessFlavourModule
     * 
     */
    export enum panelType {
        min = 0,
        LovelyGift,
        MysticSnowdrift,
        SantaClaus,
        Chrismas,
        max
    }

    export class HappinessFlavourModule extends ui.happinessFlavour.HappinessFlavourModuleUI {
        private curPanel: panelType;
        private panelMap: util.HashMap<any>;
        private defaultPanel: panelType;
        init(d: any) {
            if (d) this.defaultPanel = parseInt(d);
            else this.defaultPanel = panelType.Chrismas;
            this.addPreLoad(xls.load(xls.eventExchange));
        }
        onPreloadOver() {
            this.panelMap = new util.HashMap();
            this.addPanel(this.defaultPanel);
        }
        addEventListeners() {
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onSwitch, [-1]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onSwitch, [1]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            if (this.panelMap) {
                let panel = this.panelMap.getValues();
                for (let i = 0; i < panel.length; i++) {
                    panel[i].destroy();
                }
                this.panelMap.clear();
                this.panelMap = null;
            }
            super.destroy();
        }

        private onSwitch(flag: number) {
            let target = this.curPanel + flag;
            if (target == panelType.max) target = panelType.min + 1;
            if (target == panelType.min) target = panelType.max - 1;
            this.addPanel(target);
        }

        private async addPanel(type: panelType) {
            if (this.curPanel > 0) {
                this.panelMap.get(this.curPanel).hide();
            }
            this.curPanel = type;
            let showPanel = this.panelMap.get(this.curPanel);
            if (!showPanel) {
                clientCore.LoadingManager.showSmall();
                showPanel = await this.preLoadPanel();
                clientCore.LoadingManager.hideSmall(true);
                this.panelMap.add(type, showPanel);
            }
            showPanel.show();
            this.boxView.addChild(showPanel);
        }

        private async preLoadPanel() {
            switch (this.curPanel) {
                case panelType.LovelyGift:
                    return Promise.resolve(new LovelyGiftPanel());
                case panelType.MysticSnowdrift:
                    await res.load("atlas/happinessFlavour/MysticSnowdriftPanel.atlas", Laya.Loader.ATLAS);
                    await res.load("unpack/happinessFlavour/MysticSnowdriftPanel/bg.png");
                    return Promise.resolve(new MysticSnowdriftPanel());
                case panelType.SantaClaus:
                    await res.load("atlas/happinessFlavour/SantaClausPanel.atlas", Laya.Loader.ATLAS);
                    return Promise.resolve(new SantaClausPanel());
                case panelType.Chrismas:
                    await res.load("res/animate/chrismasInteract/mainmenu.png");
                    await res.load("atlas/happinessFlavour/ChristmasPanel.atlas", Laya.Loader.ATLAS);
                    return net.sendAndWait(new pb.cs_christmas_greetings_info()).then((msg: pb.sc_christmas_greetings_info) => {
                        return Promise.resolve(new CrismasPanel(msg));
                    })
            }
        }
    }
}