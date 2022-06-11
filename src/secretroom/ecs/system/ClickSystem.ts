namespace secretroom.ecs{
    /**
     * 点击系统
     */
    export class ClickSystem implements ISystem{
        regs: number[] = [ComponentEnum.CLICK];
        update(entities: IEntity[]): void{
            BC.removeEvent(this);
            _.forEach(entities,(element: IEntity)=>{
                BC.addEvent(this,element.display,Laya.Event.CLICK,this,this.onClick,[element.sign]);
            })
        }

        private onClick(sign: number): void{
            console.log('click entity ' + sign);
        }
    }
}