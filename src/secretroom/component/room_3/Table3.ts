namespace secretroom.room_3{
    /**
     * 桌子
     */
    export class Table3 extends Laya.Script implements IComponent{
        private _ui: ui.secretroom.room.room_3.Table3UI;
        constructor(){ super(); }
        init(): void{
            this._ui = this.owner as ui.secretroom.room.room_3.Table3UI;
            this._ui.boxLight.visible = false;
            BC.addEvent(this,this._ui.btnLight,Laya.Event.CLICK,this,this.onLight);
        }
        onDisable(): void{
            BC.removeEvent(this);
            this._ui = null;
        }
        private onLight(): void{
            if(!clientCore.SecretroomMgr.instance.check('58')){
                alert.showFWords('灯无法打开~');
                return;
            }
            this._ui.boxLight.visible = !this._ui.boxLight.visible;
        }
    }
}