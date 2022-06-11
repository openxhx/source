namespace secretroom.room_3{
    /**
     * 拼图
     */
    export class Jigsaw extends Laya.Script implements IComponent{
        private _ui: ui.secretroom.room.room_3.JigsawUI;
        init(): void{
            this._ui = this.owner as ui.secretroom.room.room_3.JigsawUI;
            this.shuffle();
        }
        onAwake(): void{
            let len: number = this._ui.boxImg.numChildren;
            for(let i:number=0; i<len; i++){
                let item: Laya.Image = this._ui.boxImg.getChildAt(i) as Laya.Image;
                BC.addEvent(this,item,Laya.Event.CLICK,this,this.onItemClick,[item]);
            }
        }
        onDisable(): void{
            BC.removeEvent(this);
            this._ui = null;
        }

        private onItemClick(item: Laya.Image): void{
            item.rotation += 90;
            if(this.checkFinish()){
                alert.showFWords('碎片成功拼凑好了');
                clientCore.SecretroomMgr.instance.write('51',clientCore.ItemEnum.IS_COM_2);
                ObserverMgr.instance.trigger('51');
                this._ui?.destroy();
            }
        }

        private checkFinish(): boolean{
            let len: number = this._ui.boxImg.numChildren;
            for(let i:number=0; i<len; i++){
                let item: Laya.Image = this._ui.boxImg.getChildAt(i) as Laya.Image;
                if(item && item.rotation % 360 != 0)return false;
            }
            return true;
        }

        
        private shuffle(): void{
            let len: number = this._ui.boxImg.numChildren;
            for(let i:number=0; i<len; i++){
                let item: Laya.Image = this._ui.boxImg.getChildAt(i) as Laya.Image;
                item.rotation = _.random(0,6)*90;
            }
            this.checkFinish() && this.shuffle();
        }
    }
}