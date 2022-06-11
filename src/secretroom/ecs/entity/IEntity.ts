namespace secretroom.ecs{

    export interface IEntity{
        display: Laya.Sprite;
        sign: number;
        components: IComponent[];
        add(component: IComponent): void;
        remove(component: IComponent): void;
        get(sign: number): IComponent;
    }
}