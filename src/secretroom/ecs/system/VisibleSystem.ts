namespace secretroom.ecs{
    /**
     * 显示系统
     */
    export class VisibleSystem implements ISystem{
        regs: number[] = [];
        constructor(){}
        update(entities: IEntity[]): void{
            _.forEach(entities,(element: IEntity)=>{
                
            })
        }
    }
}