namespace mapBean {
    export class PartyEnterBean implements core.IMapBean {
        private _mainUI:clientCore.MapTouchObject;
        start(ui?: any, data?: any): void {
            this._mainUI = ui;
            this.addEVentListners();
            this.init();
        }
        init() {
            this._mainUI.visible = false;
            if(clientCore.MapInfo.isSelfHome){
                this.checkOpenState(clientCore.LocalInfo.uid);
            }
            else if(clientCore.MapInfo.isOthersHome){
                if(clientCore.PartyManager.openFlag)
                    this.checkOpenState(clientCore.FriendHomeInfoMgr.ins.friendBaseInfo.userid);
            }
        }
        addEVentListners() {
            BC.addEvent(this, EventManager, globalEvent.PARTY_ENTER_OPEN_START, this, this.playOpenModule);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "partyEnterBean") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "partyInterImg") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this._mainUI);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }
        playOpenModule(){
            this._mainUI.visible = false;
            clientCore.PartyManager.openGuideFlag = true;
            let render: clientCore.Bone = clientCore.BoneMgr.ins.play(`res/animate/party/hut.sk`, 0, false, clientCore.MapManager.mapItemsLayer);
            render.pos(this._mainUI.x+this._mainUI.width / 2, this._mainUI.y+this._mainUI.height / 2);
            render.on(Laya.Event.COMPLETE, this, () => {
                this._mainUI.visible = true;
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "openMoviePlayOver") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            })
        }
        private checkOpenState(id:number){
            //后台还没开发完
            net.sendAndWait(new pb.cs_query_party_house_open_status({uid:id})).then((data:pb.sc_query_party_house_open_status)=>{
                if(id == clientCore.LocalInfo.uid){
                    clientCore.PartyManager.openFlag = data.status == 1;
                    this._mainUI.visible = data.status == 1;
                    if(clientCore.PartyManager.openGuideFlag){
                        this._mainUI.visible = false;
                    }
                }
                else{
                    this._mainUI.visible = data.status == 1;
                }
            });
        }
        touch():void{
            if(clientCore.MapInfo.mapEditState){
                alert.showFWords("请先退出编辑状态，然后再进入派对吧");
                return;
            }
            if(clientCore.MapInfo.isSelfHome){
                clientCore.MapManager.enterParty(clientCore.LocalInfo.uid);
            }
            else if(clientCore.MapInfo.isOthersHome){
                clientCore.MapManager.enterParty(clientCore.FriendHomeInfoMgr.ins.friendBaseInfo.userid);
            }
            //引导
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickEnterParty") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
        redPointChange():void{
            
        }
        destroy(): void{
            BC.removeEvent(this);
            clientCore.PartyManager.openGuideFlag = false;
        }
    }
}