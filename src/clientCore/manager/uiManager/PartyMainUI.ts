/// <reference path="MainUIBase.ts" />
namespace clientCore {
    export class PartyMainUI extends MainUIBase {
        private _mainUI: ui.main.party.PartyMainUIUI;

        setUp() {
            if (!this._mainUI) {
                this._mainUI = new ui.main.party.PartyMainUIUI();
                this._mainUI.mouseThrough = true;
                this._mainUI.mcRightView.mouseThrough = true;
                this._mainUI.mcLeftView.mouseThrough = true;
            }
        }

        open() {
            this._mainUI.mcLeftView.x = 0;
            this.onResize();
            this.addEvent();
            UIManager.showTalk();
            LayerManager.uiLayer.addChild(this._mainUI);

            if(MapInfo.isOthersParty){
                this._mainUI.btnEdit.visible = false;
                this._mainUI.btnUse.visible = false;
                this._mainUI.btnEgg.visible = false;
                this._mainUI.btnCloth.visible = true;
            }
            else{
                this._mainUI.btnEdit.visible = true;
                this._mainUI.btnUse.visible = true;
                this._mainUI.btnEgg.visible = true;
                this._mainUI.btnCloth.visible = false;
            }
        }

        private back() {
            //回到家园
            if(MapInfo.isSelfParty){
                clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
            }
            else if(MapInfo.isOthersParty){
                clientCore.MapManager.enterHome(parseInt(MapInfo.mapData));
            }
        }

        private startEdit() {
            clientCore.PartyEditorManager.ins.showUI();
            if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPartyEditBtn"){
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private openEgg() {
            if(clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPartyEditGachaponBtn"){
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            ModuleManager.open('party.PartyEggSelectModule');
        }

        private openUse() {
            clientCore.ModuleManager.open("party.SchemePanel");
        }

        private openCollect() {
            ModuleManager.open('collection.CollectionModule');
        }

        public hide() {
            Laya.Tween.to(this._mainUI, { alpha: 0 }, 200);
            this._mainUI.mouseEnabled = false;
        }
        public show() {
            Laya.Tween.clearAll(this._mainUI);
            Laya.Tween.to(this._mainUI, { alpha: 1 }, 200);
            this._mainUI.mouseEnabled = true;
        }

        private addEvent() {
            BC.addEvent(this, this._mainUI.btnClose, Laya.Event.CLICK, this, this.back);
            BC.addEvent(this, this._mainUI.btnEdit, Laya.Event.CLICK, this, this.startEdit);
            BC.addEvent(this, this._mainUI.btnEgg, Laya.Event.CLICK, this, this.openEgg);
            BC.addEvent(this, this._mainUI.btnUse, Laya.Event.CLICK, this, this.openUse);
            BC.addEvent(this, this._mainUI.btnCloth, Laya.Event.CLICK, this, this.openChangeCloth);
            BC.addEvent(this, this._mainUI.btnCollect, Laya.Event.CLICK, this, this.openCollect);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.onResize);
            EventManager.on(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private onResize(): void{
            this._mainUI.mcRightView.x = Laya.stage.width;
        }
        private openChangeCloth(e:Laya.Event){
            clientCore.ModuleManager.open('clothChange.ClothChangeModule');
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "partyMainUI") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (this._mainUI[objName]) {
                    var obj: any;
                    obj = this._mainUI[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        close() {
            this.removeEvent();
            this._mainUI.removeSelf();
        }
    }
}