namespace mapBean {
    export class ScienceTreeBean implements core.IMapBean {
        private _mainUI: clientCore.MapTouchObject;
        private _lightMovie: clientCore.Bone;
        private _destroy: boolean = false;
        private _showOpenFlag: boolean = false;
        start(ui?: any, data?: any): void {
            this._mainUI = ui;
            this.addEVentListners();
            this.init();
        }
        init() {
            this.checkOpen();
            if (clientCore.ScienceTreeManager.ins.isOpen) {
                this._mainUI.mapImg.skin = "res/mapObj/1004.png";
                this._mainUI.mapImg.x = 24;
            }
            else {
                this._mainUI.mapImg.skin = "res/mapObj/1003.png";
                this._mainUI.mapImg.x = 0;
            }
            this._lightMovie = clientCore.BoneMgr.ins.play("res/animate/guide/guideLight.sk", 0, true, this._mainUI,null);
            this._lightMovie.pos(this._mainUI.width / 2, this._mainUI.height / 2);
            this._lightMovie.visible = false;
        }
        addEVentListners() {
            BC.addEvent(this, EventManager, globalEvent.USER_LEVEL_UP, this, this.checkOpen);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "scienceTreeBean") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "scienceTreeImg") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this._mainUI);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }
        checkOpen() {
            if (!this._showOpenFlag && !clientCore.ScienceTreeManager.ins.isOpen && clientCore.LocalInfo.userLv >= 20) {
                this._showOpenFlag = true;
                // clientCore.MapManager.setSelfBodyPos(942, 544);
                let btn: ui.mapExpand.mapExpandBtnUI = new ui.mapExpand.mapExpandBtnUI();
                btn.imgExpand.skin = "expandUI/clear.png";
                btn.pos(this._mainUI.width / 2, this._mainUI.height / 2);
                btn.on(Laya.Event.CLICK, this, () => {
                    alert.showSmall("是否开启家园绿萝藤?", {
                        callBack: {
                            caller: this,
                            funArr: [() => {
                                btn.destroy();
                                clientCore.ScienceTreeManager.ins.open();
                                this.showCleanMovie();
                                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAlertShowSmallSureBtn") {
                                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                                }
                            }]
                        }
                    })
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickOpenScienctTree") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                });
                if (clientCore.GuideMainManager.instance.curGuideInfo.objectName == "showScienceExpandBtn") {
                    Laya.timer.frameOnce(1, this, () => {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, btn);
                    });
                }
                else {
                    EventManager.once("NEW_PLAYER_START_GUIDE", this, () => {
                        if (clientCore.GuideMainManager.instance.curGuideInfo.objectName == "showScienceExpandBtn") {
                            EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, btn);
                        }
                    });
                }
                this._mainUI.addChild(btn);
                let light: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/guide/guideLight.sk", 0, true, btn);
                light.pos(btn.width / 2, btn.height / 2);
                let handImg: Laya.Image = new Laya.Image();
                handImg.anchorX = 0.5;
                handImg.anchorY = 0.5;
                handImg.skin = "res/animate/guide/hand.png";
                handImg.pos(btn.width / 1.5, btn.height + 40);
                btn.addChild(handImg);
            }
        }
        private showCleanMovie() {
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('extend'));
            let render: clientCore.Bone = clientCore.BoneMgr.ins.play(`res/animate/expand/expand_1.sk`, 0, false, this._mainUI);
            render.pos(this._mainUI.width / 2, this._mainUI.height / 2);
            render.on(Laya.Event.COMPLETE, this, () => {
                this.showGuide();
                this.treeOpen();
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "cleanMoviePlayOver") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            })
        }
        private treeOpen() {
            if (this._destroy) {
                return;
            }
            this._mainUI.mapImg.skin = "res/mapObj/1004.png";
            this._mainUI.mapImg.x = 24;
        }
        private _arrow: Laya.Image;
        private _timeLine: Laya.TimeLine;
        private showGuide(): void {
            if (this._destroy) {
                return;
            }
            this._lightMovie.visible = true;
            this._arrow = new Laya.Image("commonUI/arrowTips.png");
            this._arrow.pos((this._mainUI.width - this._arrow.width) / 2, (this._mainUI.height - this._arrow.height) / 2);
            this._mainUI.addChild(this._arrow);
            this._timeLine = new Laya.TimeLine();
            this._timeLine.to(this._arrow, { y: (this._mainUI.height - this._arrow.height) / 2 - 50 }, 500);
            this._timeLine.to(this._arrow, { y: (this._mainUI.height - this._arrow.height) / 2 }, 500);
            this._timeLine.play(0, true);
        }

        public clearGuide(): void {
            this._timeLine?.destroy();
            this._arrow?.destroy();
            this._timeLine = this._arrow = null;
            this._lightMovie && (this._lightMovie.visible = false);
        }
        touch() {
            if (!clientCore.ScienceTreeManager.ins.isOpen)
                return;
            this.clearGuide();
            clientCore.ModuleManager.open("scienceTree.ScienceTreeModule");
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickScienceTreeImg") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        redPointChange() {
            if(!clientCore.ScienceTreeManager.ins.isOpen){
                this._mainUI.redPointMovie.visible = false;
            }
        }
        destroy(): void {
            BC.removeEvent(this);
            this._mainUI = null;
            if (this._lightMovie) {
                this._lightMovie.dispose();
            }
            this._destroy = true;
        }
    }
}