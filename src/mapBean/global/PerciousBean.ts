namespace mapBean{
    /**
     * 秘密的宝藏
     */
    export class PerciousBean implements core.IGlobalBean{

        private _ui: PerciousUI;

        async start(): Promise<void>{
            await res.load(`atlas/perciousMap.atlas`, Laya.Loader.ATLAS);
            this.addEvenets();
        }
        destory(): void{
            this.removeEvents();
        }

        private addEvenets(): void {
            BC.addEvent(this, EventManager, globalEvent.START_CHANGE_MAP, this, this.cleanPercious);
            BC.addEvent(this, EventManager, globalEvent.ENTER_MAP_SUCC, this, this.checkPercious);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private cleanPercious(): void{
            this._ui?.hide();
        }

        private checkPercious(): void{
            let currMap: number = clientCore.MapInfo.mapID;
            if(currMap < 11 || currMap > 18)return; //策划说 只有在这个范围地图才会有宝藏
            net.sendAndWait(new pb.cs_get_secret_treasure_info()).then((msg: pb.sc_get_secret_treasure_info)=>{
                if(msg.mapId == 0 || msg.mapId != clientCore.MapInfo.mapID)return;
                this._ui = this._ui || new PerciousUI();
                this._ui.show(msg);
            });
        }
    }


    enum Status{
        EXCAVATE,
        AUGUR,
        RESULT
    }

    class PerciousUI extends ui.perciousMap.PerciousMapUI{

        private _distance: number;
        private _type: Status;
        private _msg: pb.sc_get_secret_treasure_info;

        constructor(){
            super();
            this.anchorX = 0.5;
            this.anchorY = 1;
            this.pos(Laya.stage.width/2,Laya.stage.height);
            this.htmlTxt.style.width = 324;
        }

        show(msg: pb.sc_get_secret_treasure_info): void{
            this._msg = msg;
            this.addEvents();
            this.updateStatus(Status.EXCAVATE);
            clientCore.LayerManager.uiLayer.addChild(this);
        }
        hide(): void{
            this._msg = null;
            this.removeEvents();
            this.removeSelf();
        }

        private addEvents(): void{
            BC.addEvent(this,EventManager,globalEvent.JOY_STICK_CHANGE,this,this.onPlayerMove);
            BC.addEvent(this,this.btnAugur,Laya.Event.CLICK,this,this.onAugur);
            BC.addEvent(this,this.btnExcavate,Laya.Event.CLICK,this,this.onExcavate);
            BC.addEvent(this,this.btnGo,Laya.Event.CLICK,this,this.onGotoMap);
        }

        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onPlayerMove(): void{
            if(this._type != Status.EXCAVATE)return;
            this.updatePoint();
        }

        private updateStatus(type: Status): void{
            this._type = type;
            this.btnAugur.visible = type == Status.AUGUR;
            this.btnExcavate.visible = type == Status.EXCAVATE;
            this.btnGo.visible = type == Status.RESULT;
            this.htmlTxt.visible = type != Status.EXCAVATE;
            this.boxExcavate.visible = type == Status.EXCAVATE;
            switch(type){
                case Status.AUGUR:
                    this.htmlTxt.innerHTML = this.getText(`占卜获得下一宝藏的位置(${this.isFeel ? '不消耗次数' : ( this._msg.cntUsed + '/'+this._msg.cntTotal)})`,'#805329',22);
                    break;
                case Status.EXCAVATE:
                    this.updatePoint();
                    break;
                case Status.RESULT:
                    this.htmlTxt.innerHTML = this.getText('宝藏所在地图：','#805329',22) +  this.getText(xls.get(xls.map).get(this._msg.mapId).name,'#805329',24);
                    break;
            }
        }

        private updatePoint(): void{
            let player: clientCore.Player = clientCore.PeopleManager.getInstance().player;
            let point: Laya.Point = new Laya.Point(player.x,player.y);
            this._distance = point.distance(this._msg.point.x,this._msg.point.y);
            this.txt.changeText(this._distance > 500 ? '大于500' : (this._distance < 50 ? '已进入宝藏范围' : util.tofix(this._distance,3)+'')); 
        }

        /** 占卜*/
        private onAugur(): void{
            if(this.canAugur == false){
                alert.showFWords('今日占卜次数已经用完啦，明天再来吧~');
                return;
            }
            net.sendAndWait(new pb.cs_devine_secret_treasure()).then((msg: pb.sc_devine_secret_treasure)=>{
                this.isFeel ? this._msg.freeUsed++ : this._msg.cntUsed++;
                this._msg.cntHistory++;
                this._msg.mapId = msg.mapId;
                this._msg.point = msg.point;
                msg.mapId == clientCore.MapInfo.mapID ? this.updateStatus(Status.EXCAVATE) :  this.updateStatus(Status.RESULT);
            });
        }

        private getText(txt: string,color: string,fontSize: number): string{
            return `<span style="color:${color};font-family:汉仪中圆简;fontSize:${fontSize}">${txt}</span>`;
        }

        /** 前往指定地图*/
        private onGotoMap(): void{
            clientCore.MapManager.enterWorldMap(this._msg.mapId);
        }

        /** 挖掘*/
        private onExcavate(): void{
            if(this._distance > 50){
                alert.showFWords('当前位置没有挖掘到任何宝藏');
                return;
            }
            net.sendAndWait(new pb.cs_excavate_secret_treasure()).then((msg: pb.sc_excavate_secret_treasure)=>{
                if(msg.flag == 1){
                    alert.showFWords('新的一天啦，宝藏重新刷新了哦~');
                    this.updateInfo();
                    return;
                }
                alert.showReward(msg.items);
                this.updateStatus(Status.AUGUR);
            });
        }

        /**是否可免费*/
        private get isFeel(): boolean{
            let now: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 12:00:00');
            let et: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 18:00:00');
            return this._msg.freeUsed < 2 && now >= st && now <= et;
        }
    
        /** 是否可以占卜*/
        private get canAugur(): boolean{
            return this.isFeel || this._msg.cntUsed < this._msg.cntTotal;
        }

        /** 隔天刷新*/
        private updateInfo(): void{
            net.sendAndWait(new pb.cs_get_secret_treasure_info()).then((msg: pb.sc_get_secret_treasure_info)=>{
                this._msg = msg;
                this.updateStatus(Status.AUGUR);
            });
        }
    }
}