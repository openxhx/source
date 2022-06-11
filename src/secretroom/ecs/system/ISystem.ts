namespace secretroom.ecs{
    /**
     * 系统接口
     */
    export interface ISystem{
        regs: number[];
        update(entities: IEntity[]): void;
    }
}