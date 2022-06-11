namespace secretroom{
    /**
     * 弹窗显示
     */
    export class DialogMgr{
        private static _model: SecretroomModel;
        private static _layer: Laya.Sprite;
        private static _sign: number;
        private static _mark: Laya.Sprite;
        private static _itemShow: ItemShow;

        constructor(){ }

        static configure(sign: number,layer: Laya.Sprite): void{
            this._sign = sign;
            this._layer = layer;
            this._model = clientCore.CManager.getModel(sign) as SecretroomModel;

            this._mark = new Laya.Sprite();
            this._mark.graphics.drawRect(0,0,Laya.stage.width,Laya.stage.height,'#000000');
            this._mark.width = Laya.stage.width;
            this._mark.height = Laya.stage.height;
            this._mark.alpha = 0.75;
            this._mark.mouseEnabled = true;
        }

        static async open(roomId: number,openview: string,key: string): Promise<void>{
            await res.load(`atlas/${openview.toLowerCase()}.atlas`,Laya.Loader.ATLAS);
            let view: Laya.View = new ui.secretroom.room[`room_${roomId}`][`${openview}UI`]();
            //创建代理
            let drawview: DrawView = new DrawView(this._sign,view);
            view['btnClose']?.once(Laya.Event.CLICK,this,()=>{ 
                view.destroy();
            });
            view.once(Laya.Event.CLOSE,this,()=>{
                this._mark.removeSelf();
                drawview.dispose();
            });
            view.scale(1,1);
            view.anchorX = view.anchorY = 0.5;
            view.pos(Laya.stage.width/2,Laya.stage.height/2);
            //添加组件啦
            if(secretroom[`room_${roomId}`] && secretroom[`room_${roomId}`][openview]){
                let component: IComponent =  view.addComponent(secretroom[`room_${roomId}`][openview]);
                component.init(key);
            }
            this._layer.addChild(this._mark);
            this._layer.addChild(view);
            Laya.Tween.from(view,{scaleX: 0,scaleY: 0},300,Laya.Ease.backOut);
        }

        static clear(): void{
            this._layer = this._model = null;
        }
    }
}