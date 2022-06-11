namespace secretroom.ecs{
    /**
     * 显示组件
     */
    export class VisibleComponent implements IComponent{
        sign: number = ComponentEnum.VISIBLE;
        constructor(){}
    }
}