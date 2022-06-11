namespace secretroom{
    /**
     * 一个房间
     */
    export class Room implements IRoom {
        id: number;
        target: string;
        layer: Laya.Sprite;

        private _model: SecretroomModel;
        private _roomDraw: DrawView;

        constructor(){}
        
        async enter(sign: number,id: number,layer: Laya.Sprite): Promise<void>{
            await Promise.all([
                res.load(`atlas/room_${id}.atlas`,Laya.Loader.ATLAS), //atlas
                res.load(clientCore.UnpackJsonManager.getUnpackUrls(`room_${id}`), Laya.Loader.IMAGE, false) //unpcak
            ])
            this._model = clientCore.CManager.getModel(sign) as SecretroomModel;
            this._model.roomId = id;
            this.id = id;
            this.layer = layer;
            let view: Laya.View = new ui.secretroom.room[`room_${id}`].RoomUI();
            layer.width = view.width;
            layer.height = view.height;
            layer.addChild(view);
            //观察者初始化
            ObserverMgr.instance.init(sign);
            //创建房间代理
            this._roomDraw = new DrawView(sign,view);
            //相机初始化
            Camera.instance.init(layer);
            //统计项
            clientCore.Logger.sendLog('2020年10月30日活动', '【主活动】心灵之囚', `点击进入第${id}个房间`);
        }

        updateItem(key: string,status: number): void{

        }

        exit(): void{
            this._roomDraw?.dispose();
            this._roomDraw = this.layer = this._model= null;
            Camera.instance.dispose();
            ObserverMgr.instance.clear();
        }
    }
}