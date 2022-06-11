namespace secretroom.room_1{
    /**
     * 台灯
     */
    export class DeskLamp extends Laya.Script implements IComponent{
        private _ui: ui.secretroom.room.room_1.DeskLampUI;
        private _key: string;
        constructor(){ super(); }
        init(key: string): void{
            let finish: boolean = clientCore.SecretroomMgr.instance.check(key);
            this._key = key;
            this._ui = this.owner as ui.secretroom.room.room_1.DeskLampUI;
            this._ui.imgLight.visible = finish;
            this._ui[22].visible = finish && key == '23' && !clientCore.SecretroomMgr.instance.check('22'); 
            !finish && BC.addEvent(this,this._ui.btnSwitch,Laya.Event.CLICK,this,this.onLight);
        }
        onEnable(): void{        
        }
        onDisable(): void{
            this._ui = null;
            BC.removeEvent(this);
        }
        private onLight(): void{
            if(clientCore.SecretroomMgr.instance.check(this._key))return;
            clientCore.SecretroomMgr.instance.write(this._key,clientCore.ItemEnum.IS_COM);
            ObserverMgr.instance.trigger(this._key);
            this._ui.imgLight.visible = true;
            this._ui[22].visible = this._key == '23' && !clientCore.SecretroomMgr.instance.check('22');
        }
    }
}