namespace secretroom.ecs{
    /**
     * 实体
     */
    export class Entity implements IEntity{
        display: Laya.Sprite;
        sign: number;
        components: IComponent[];
        constructor(){
            this.components = [];
        }
        add(component: IComponent): void{
            this.components.push(component);
        }
        remove(component: IComponent): void{
            this.components = _.filter(this.components,(element: IComponent)=>{ element.sign != component.sign; });
        }
        get(sign: number): IComponent{
            return _.find(this.components,(element: IComponent)=>{ return element.sign == sign; });
        } 
    }
}