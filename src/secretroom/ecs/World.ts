namespace secretroom.ecs{
    /**
     * ECS 框架世界
     */
    export class World{

        private static _instance: World;
        public static get instance(): World{
            return this._instance || (this._instance = new World());
        }

        private readonly SIGN_COUNT: number = 1000;

        private _entities: IEntity[];
        private _systems: ISystem[];

        private _draw: DrawView;

        constructor(){
            this._entities = new Array(this.SIGN_COUNT);
            this._systems = [
                new ClickSystem()
            ];
        }


        createEntity(): IEntity{
            for(let i:number=0; i<this.SIGN_COUNT; i++){
                if(!this._entities[i]){
                    let entity: Entity = new Entity();
                    entity.sign = i;
                    this._entities[i] = entity;
                    return entity;
                }
            }
            console.error(`error entity number out max value.`);
            return null;
        }

        async init(sign: number,id: number,layer: Laya.Sprite): Promise<void>{
            let url: string = `res/json/secretroom/${id}.json`;
            await Promise.all([
                res.load(url,Laya.Loader.JSON), //json file
                res.load(`atlas/room_${id}.atlas`,Laya.Loader.ATLAS), //atlas
                res.load(clientCore.UnpackJsonManager.getUnpackUrls(`room_${id}`), Laya.Loader.IMAGE, false) //unpcak
            ])
            //添加view
            let view: Laya.View = new ui.secretroom.room[`room_${id}`].RoomUI();
            layer.width = view.width;
            layer.height = view.height;
            layer.addChild(view);
            //创建实体
            this._draw = new DrawView(sign,view);
            //相机初始化
            Camera.instance.init(layer);
            //开始
            this.start();
        }

        createEntityBy(sprite: Laya.Sprite): void{
            let entity: IEntity = this.createEntity();
            entity.display = sprite;
            entity.add(new ClickComponent());
        }

        start(): void{
            Laya.timer.frameLoop(1,this,this.update);
        }

        update(): void{
            _.forEach(this._systems,(element: ISystem)=>{
                element.update(this.getEntities(element.regs));
            })
        }

        over(): void{
            Laya.timer.clear(this,this.update);
            this._entities.length = 0;
            this._systems.length = 0;
            this._entities = this._systems = null;
            this._draw.dispose();
            this._draw = null;
        }

        private getEntities(regs: number[]): IEntity[]{
            return _.filter(this._entities,(element: IEntity)=>{
                if(element){
                    let array: number[] = _.map(element.components,(ele: IComponent)=>{ return ele.sign; });
                    if(_.difference(regs,array).length == 0)return element;
                }
            })
        }
    }
}