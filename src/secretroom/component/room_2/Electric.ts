namespace secretroom.room_2{
    /**
     * 配电箱
     */
    export class Electric extends Laya.Script implements IComponent{

        private _ui: ui.secretroom.room.room_2.ElectricUI;

        private readonly ROW_REG: number[] = [3,3,2,2];
        private readonly COL_REG: number[] = [3,2,3,2];

        init(): void{
            this._ui = this.owner as ui.secretroom.room.room_2.ElectricUI;
            this._ui.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);

            for(let i: number = 1; i < 5; i++){
                this.checkLamp('row',i);
                this.checkLamp('col',i);
            }
            this.checkOver();
        }

        onEnable(): void{
        
        }

        onDisable(): void{
            this._ui = null;
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let on: string = 'electric/anniu2.png';
            let off: string = 'electric/anniu.png';
            let item: any = this._ui.list.getCell(index);
            item.skin = item.skin == on ? off : on;
            this.checkLamp('row',Math.floor(index/4)+1);
            this.checkLamp('col',index%4+1);
            this.checkOver();
        }

        private updateLamp(type: string,index: number,on: boolean): void{
            this._ui[`${type}_${index}`].skin = on ? 'electric/dengliang.png' : 'electric/dengan.png';
        }

        private checkLamp(type: string,index: number): void{
            if(type == 'row'){
                let start: number = (index-1)*4;
                let count: number = 0;
                for(let i: number= start; i< start + 4; i++){
                    let item: any = this._ui.list.getCell(i);
                    item.skin == 'electric/anniu2.png' && count++;
                }
                this.updateLamp(type,index,count==this.ROW_REG[index-1]);
            }else{
                let count: number = 0;
                for(let i:number=0; i<4; i++){
                    let item: any = this._ui.list.getCell(index-1+i*4);
                    item.skin == 'electric/anniu2.png' && count++;
                }
                this.updateLamp(type,index,count==this.COL_REG[index-1]);
            }
        }
    
        private check(): boolean{
            for(let i: number=1; i<5; i++){
                if(this._ui['row_'+i].skin != 'electric/dengliang.png')return false;
                if(this._ui['col_'+i].skin != 'electric/dengliang.png')return false;
            }   
            return true;
        }

        private checkOver(): void{
            if(this.check()){
                alert.showFWords('备用电路已接通');
                clientCore.SecretroomMgr.instance.write('1',clientCore.ItemEnum.IS_COM);
                clientCore.SecretroomMgr.instance.write('2',clientCore.ItemEnum.IS_COM);
                ObserverMgr.instance.trigger('1');
                ObserverMgr.instance.trigger('2');
                this._ui?.destroy();
            }
        }
    }
}