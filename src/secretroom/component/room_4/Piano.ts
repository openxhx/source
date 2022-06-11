namespace secretroom.room_4{
    export class Piano extends Laya.Script implements IComponent{
        private _ui: ui.secretroom.room.room_4.PianoUI;
        private _psd: string = '2473';
        private _downStr: string;
        constructor(){ super(); }
        init(): void{
            this._downStr = '';
            this._ui = this.owner as ui.secretroom.room.room_4.PianoUI;
            this._ui.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
        }
        onEnable(): void{
        }
        onDisable(): void{
            this._ui = null;
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type == Laya.Event.MOUSE_DOWN){
                let item: ui.secretroom.render.KeyRenderUI = e.target as ui.secretroom.render.KeyRenderUI;
                item.ani1.play(0,false);
                if(index > 0 && index < 8){
                    core.SoundManager.instance.playSound(`res/sound/secretroom/${index}.ogg`);
                    this._downStr += index;
                    let len: number = this._downStr.length;
                    this._downStr = len > 4 ? this._downStr.substr(len-4,4) : this._downStr;
                    this._downStr == this._psd && this.checkTrigger();
                }
            }
        }

        private checkTrigger(): void{
            if(clientCore.SecretroomMgr.instance.check('18'))return;
            alert.showFWords('房间的画被移开了');
            clientCore.SecretroomMgr.instance.write('18',clientCore.ItemEnum.IS_COM);
            ObserverMgr.instance.trigger('18');
        }
    }
}