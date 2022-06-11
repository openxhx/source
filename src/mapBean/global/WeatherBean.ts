

namespace mapBean{
    /**
     * 地图天气触发
     */
    export class WeatherBean implements core.IGlobalBean{
        private _down: clientCore.Bone;
        private _up: clientCore.Bone;
        start(): void{
            this.addEvents();
            this.changeWeather();
        }
        private addEvents(): void{
            BC.addEvent(this, EventManager, globalEvent.START_CHANGE_MAP, this, this.dispose);
            BC.addEvent(this, EventManager, globalEvent.ENTER_MAP_SUCC, this, this.changeWeather);
        }
        private removeEvent(): void{
            BC.removeEvent(this);
        }
        private changeWeather(): void{
            if(clientCore.MapInfo.type == 3 || xls.get(xls.map).get(clientCore.MapInfo.mapID).sceneEffect == 0)return; //小屋不下雪
            this._down = clientCore.BoneMgr.ins.play(pathConfig.getMapAnimate('snowB'),0,true,clientCore.LayerManager.downUILayer);
            this._down.pos(Laya.stage.width/2,Laya.stage.height/2);
            this._up = clientCore.BoneMgr.ins.play(pathConfig.getMapAnimate('snowF'),0,true,clientCore.LayerManager.downUILayer);
            this._up.pos(Laya.stage.width/2,Laya.stage.height/2);
        }
        private dispose(): void{
            this._down?.dispose();
            this._up?.dispose();
            this._down = this._up = null;
        }
        destory(): void{
            this.removeEvent();
        }
    }
}