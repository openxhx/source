namespace secretroom.room_2{

    export class SecretCloth extends Laya.Script implements IComponent{
        private _ui: ui.secretroom.room.room_2.SecretClothUI;
        constructor(){ super(); }
        init(): void{
            this._ui = this.owner as ui.secretroom.room.room_2.SecretClothUI;
        }
        onEnable(): void{
            !clientCore.SecretroomMgr.instance.check('7') && BC.addEvent(this,this._ui.btnPocket,Laya.Event.CLICK,this,this.onHit);
        }
        onDisable(): void{
            BC.removeEvent(this);
            this._ui = null;
        }

        private onHit(): void{
            if(clientCore.SecretroomMgr.instance.check('7'))return;
            this._ui[7].visible = true;
        }
    }
}