namespace collection {
    export class CollectionModule extends ui.collection.CollectionModuleUI {
        private _curPanelName: PANEL;
        private _panelDic: util.HashMap<ICollectionPanel>;
        init() {
            this._panelDic = new util.HashMap();
            //子面板素材
            this.addPreLoad(res.load('atlas/collection/badge.atlas'));
            this.addPreLoad(res.load('atlas/collection/cloth.atlas'));
            this.addPreLoad(res.load('atlas/collection/singleCloth.atlas'));
            this.addPreLoad(res.load('atlas/collection/collect.atlas'));
            this.addPreLoad(res.load('atlas/collection/event.atlas'));
            this.addPreLoad(res.load('atlas/collection/garden.atlas'));
            this.addPreLoad(res.load('atlas/collection/role.atlas'));
        }

        onPreloadOver() {
            this.hitArea = new Laya.Rectangle(-clientCore.LayerManager.mainLayer.x,0,Laya.stage.width,Laya.stage.height);
            this.changePanel(PANEL.BASE);
        }

        private async changePanel(panelName: PANEL, data?: any) {
            if (panelName != this._curPanelName) {
                this._curPanelName = panelName;
                let panel = await this.getPanelByName(panelName);
                this.boxPanel.removeChildren();
                this.boxPanel.addChild(panel.ui);
                panel.show(data);

                if(panel.ui.btnClose){
                    this.addChild(panel.ui.btnClose);
                    panel.ui.btnClose.x =  - (Laya.stage.width - Laya.stage.designWidth) / 2;
                    panel.ui.btnClose.y = 10;
                }
            }
        }

        private async getPanelByName(name: PANEL) {
            let panel: ICollectionPanel;
            if (this._panelDic.has(name)) {
                panel = this._panelDic.get(name);
            }
            else {
                switch (name) {
                    case PANEL.BASE:
                        panel = new CoBasePanel();
                        break;
                    case PANEL.BADGE:
                        panel = new CoBadgePanel();
                        break;
                    case PANEL.ROLE:
                        panel = new CoRolePanel();
                        break;
                    case PANEL.COLLECT:
                        panel = new CoCollectPanel();
                        break;
                    case PANEL.STAR:
                        panel = new CoClothPanel(1);
                        break;
                    case PANEL.CLOTH:
                        panel = new CoClothPanel(0);
                        break;
                    case PANEL.GARDEN:
                        panel = new CoGardenPanel();
                        break;
                    case PANEL.SANJAIN:
                        panel = new CoSingleClothPanel();
                        break;
                    case PANEL.WEEKLY_RECORD:
                        panel = new CoEventRecordPanel();
                        break;
                    default:
                        break;
                }
                clientCore.LoadingManager.showSmall();
                await panel.waitLoad();
                clientCore.LoadingManager.hideSmall(true);
                this._panelDic.add(name, panel);
            }
            return panel;
        }

        addEventListeners() {
            EventManager.on(EV_CHAGE_PANEL, this, this.changePanel);
        }

        removeEventListeners() {
            EventManager.off(EV_CHAGE_PANEL, this, this.changePanel);
        }

        destroy() {
            for (const panel of this._panelDic.getValues()) {
                panel.destory();
            }
            super.destroy();
        }
    }
}