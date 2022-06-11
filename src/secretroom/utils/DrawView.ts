namespace secretroom{
    /**
     * 界面代理类
     */
    export class DrawView{
        private _view: Laya.View;
        private _model: SecretroomModel;
        constructor(sign:number,view: Laya.View){
            this._view = view;
            this._model = clientCore.CManager.getModel(sign) as SecretroomModel;
            for(let key in view){
                if((/^[0-9]+$/.test(key))){
                    let sprite: Laya.Image = view[key];
                    sprite.on(Laya.Event.CLICK,this,this.onClick,[key]);
                    ObserverMgr.instance.reg(key,view[key]);
                }
            }
        }

        private onClick(key: string): void{
            console.log('click key: '+key);
            let data: object = this._model.jsonData[key];
            if(!data){
                console.error(`item ${key} is not found in json file.`);
                return;
            }
            let type = data['type'];
            if(type instanceof Array){
                 let len: number = type.length;
                 let status: string = clientCore.SecretroomMgr.instance.read(key);
                 for(let i: number=0; i<len; i++){
                     if(!status || parseInt(status) == i){
                        this.handle(type[i],key,data,len == i + 1 ? clientCore.ItemEnum.IS_COM : clientCore.ItemEnum[`IS_COM_${i+1}`]);                       
                        break;
                     }
                 }
            }else{
                this.handle(type,key,data,clientCore.ItemEnum.IS_COM);
            }
        }

        private handle(type: number,key: string,data: object,status?: clientCore.ItemEnum): void{
            switch(type){
                case 1: //仅展示
                    DialogMgr.open(this._model.roomId,data['openview'],key);
                    break;
                case 2: //收入背包
                    ItemBag.instance.add(key);
                    ItemShow.openView(1,key,data['name']);
                    break;
                case 3: //接受道具触发
                    let trigger: string = data['trigger'] + '';
                    trigger == ItemBag.instance.selectKey ? ItemBag.instance.remove(trigger,key,status) : (data['tips'] && alert.showFWords(data['tips']));
                    break;
                case 4: //点击触发
                    clientCore.SecretroomMgr.instance.write(key,status);
                    ObserverMgr.instance.trigger(key);
                    break;
                case 5: //触发剧情点
                    let storyId: string = data["story"];
                    if(storyId){
                        clientCore.SecretroomMgr.instance.write(storyId,clientCore.ItemEnum.IS_COM);
                        ItemShow.openView(0,data['story']);
                        EventManager.event(Constant.UPDATE_STORY_POINT);
                    }
                    break;
                case 6: //离开房间前往主界面
                    clientCore.ToolTip.gotoMod(188);
                    break;
                case 7: //点击飘字
                    data['tips'] && alert.showFWords(data['tips']);
                    break;
            }
        }

        dispose(): void{
            for(let key in this._view){
                if((/^[0-9]+$/.test(key))){
                   ObserverMgr.instance.remove(key);
                }
            }
            this._model = this._view = null;
            BC.removeEvent(this);
        }
    }
}