namespace secretroom.ecs{
    /**
     * 渲染系统
     */
    export class DisplaySystem implements ISystem{
        regs: number[] = [ComponentEnum.DISPLAY];
        constructor(){}
        update(entities: IEntity[]): void{
            _.forEach(entities,(element: IEntity)=>{
                let img: Laya.Image = element.display as Laya.Image;
                let skin: string = img.skin;
                let component: DisplayComponent = element.get(ComponentEnum.DISPLAY) as DisplayComponent;
                if(skin == component.skin)return;
                img.skin = component.skin;
            })
        }
    }
}