namespace secretroom.room_4{
    
    export class Table extends Laya.Script implements IComponent{
        
        private _ui: ui.secretroom.room.room_4.TableUI;
        constructor(){ super(); }

        init(): void{
            this._ui = this.owner as ui.secretroom.room.room_4.TableUI;
            this.updateView();
        }
        
        onEnable(): void{
            core.SoundManager.instance.playBgm('res/music/bgm/musicbox.mp3');
            BC.addEvent(this,this._ui.imgCom,Laya.Event.CLICK,this,this.onSmash);
        }

        onDisable(): void{
            core.SoundManager.instance.playBgm('res/music/bgm/secretroom.mp3');
            this._ui = null;
            BC.removeEvent(this);
        }

        private updateView(): void{
            let hasCom: boolean = clientCore.SecretroomMgr.instance.check('15');
            this._ui.imgCom.visible = !hasCom;
            this._ui.boxSmash.visible = hasCom;
        }

        private onSmash(): void{
            if(ItemBag.instance.selectKey == '13'){
                ItemBag.instance.remove('13','15');
                this.updateView();
            }
        }
    }
}