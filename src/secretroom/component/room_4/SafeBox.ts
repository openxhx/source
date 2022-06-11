namespace secretroom.room_4{
    
    export class SafeBox extends Laya.Script implements IComponent{


        private _ui: ui.secretroom.room.room_4.SafeBoxUI;
        private _psd: string = '1224';
        
        constructor(){ super(); }

        onEnable(): void{
            this.addEvents();
        }

        onDisable(): void{
            this.removeEvents();
        }
        
        init(): void{
            let status: string = clientCore.SecretroomMgr.instance.read('19');
            this._ui = this.owner as ui.secretroom.room.room_4.SafeBoxUI;
            this._ui.boxLock.visible = status != clientCore.ItemEnum.IS_COM;
            this._ui.boxOpen.visible = status == clientCore.ItemEnum.IS_COM;
            this._ui.psdTxt.changeText('');
        }

        addEvents(): void{
            for(let i:number=1; i<10; i++){
                BC.addEvent(this,this._ui['btn_'+i],Laya.Event.CLICK,this,this.onInput,[i]);
            }
            BC.addEvent(this,this._ui.btnOpen,Laya.Event.CLICK,this,this.checkPsd);
        }

        removeEvents(): void{
            this._ui = null;
            BC.removeEvent(this);
        }

        private onInput(index: number): void{
            let txt: string = this._ui.psdTxt.text;
            txt += index;
            txt.length <= 4 && this._ui.psdTxt.changeText(txt);
        }

        private checkPsd(): void{
            if(this._psd != this._ui.psdTxt.text){
                alert.showFWords('密码错误！！');
                this._ui.psdTxt.changeText('');
                return;
            }
            clientCore.SecretroomMgr.instance.write('19',clientCore.ItemEnum.IS_COM);
            ObserverMgr.instance.trigger('19');
            this._ui.boxOpen.visible = true;
            this._ui.boxLock.visible = false;
        }
    }
}