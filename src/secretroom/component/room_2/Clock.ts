namespace secretroom.room_2{
    /**
     * 时钟
     */
    export class Clock extends Laya.Script implements IComponent{
        private _ui: ui.secretroom.room.room_2.ClockUI;
        constructor(){ super(); }
        init(): void{
            this._ui = this.owner as ui.secretroom.room.room_2.ClockUI;
            this._ui.boxOpen.visible = clientCore.SecretroomMgr.instance.check('4');
            this.addEvents();
        }
        onDisable(): void{
            this.removeEvents();
            this._ui = null;
        }

        private addEvents(): void{
            BC.addEvent(this,this._ui.btnHourAdd,Laya.Event.CLICK,this,this.onHour,[0]);
            BC.addEvent(this,this._ui.btnHourSub,Laya.Event.CLICK,this,this.onHour,[1]);
            BC.addEvent(this,this._ui.btnMinAdd,Laya.Event.CLICK,this,this.onMin,[0]);
            BC.addEvent(this,this._ui.btnMinSub,Laya.Event.CLICK,this,this.onMin,[1]);
        }
        private removeEvents(): void{
            BC.removeEvent(this);
        }

        private onHour(type: number): void{
            this._ui.imgHour.rotation  += (type == 0 ? 30 : -30);
            this.checkOpen();
        }

        private onMin(type: number): void{
            this._ui.imgMin.rotation  += (type == 0 ? 30 : -30);
            this.checkOpen();
        }

        private checkOpen(): void{
            console.log(this._ui.imgHour.rotation,this._ui.imgMin.rotation);
            let minr: number = this._ui.imgMin.rotation;
            let isMin: boolean = minr != 0 &&((minr < 0 ? (minr%360 + 360) : minr%360) % 270 == 0);
            let isHour: boolean = this._ui.imgHour.rotation % 360 == 0;
            if(isMin && isHour){
                this._ui.boxOpen.visible = true;
                clientCore.SecretroomMgr.instance.write('4',clientCore.ItemEnum.IS_COM);
                ObserverMgr.instance.trigger('4');
            }
        }
    }
}