namespace secretroom{

    /**
     * 观察者
     */
    export class ObserverMgr{

        private static _instance: ObserverMgr;
        public static get instance(): ObserverMgr{
            return this._instance || (this._instance = new ObserverMgr());
        }

        private _observers: Map<string,Laya.Sprite>;
        private _model: SecretroomModel;

        constructor(){}

        init(sign: number): void{
            this._model = clientCore.CManager.getModel(sign) as SecretroomModel;
            this._observers = new Map();
            BC.addEvent(this,EventManager,globalEvent.SECRETROOM_ITEM_UPDATE,this,this.updateItem);
        }

        clear(): void{
            BC.removeEvent(this);
            this._observers?.clear();
            this._observers = this._model = null;
        }

        reg(id: string,obj: Laya.Sprite): void{
            this._observers.set(id,obj);
            if(clientCore.SecretroomMgr.instance.read(id)){
                this.checkFinish(id);
                this.trigger(id,true,true);
            }
        }

        remove(id: string): void{
            this._observers.delete(id);
        }

        /**
         * 
         *     complete 触发之后的表现 
        1-隐藏
        2-换图
        3-移动位置
    skin: 当complete为2时对应的图片路径
    pos: 当complete为3时需要移动的距离 正数：右移 负数：左移
         * @param id
         * @param all 是否触发所有事情 一般在初始化用
         * @param isInit 是否是初始化
         */
        trigger(id: string,all: boolean = false,isInit: boolean = false): void{            
            if(!this._observers.has(id))return;//没有注册
            let data: object = this._model.jsonData[id+''];
            let complete = data['complete'];
            let status: string = clientCore.SecretroomMgr.instance.read(id);
            let finish: boolean = clientCore.SecretroomMgr.instance.check(id);
            if(complete){
                // 如果是数组 则代表有多段触发
                if(complete instanceof Array){
                    let len: number = complete.length;
                    for(let i: number=0; i<len; i++){
                        if(all){
                            (finish || parseInt(status) > i) && this.handle(complete[i],id,data,finish ? status : (i+1)+'',isInit);                            
                        }else{
                            if(parseInt(status) == i + 1 || (i+1==len && finish)){
                                this.handle(complete[i],id,data,status,isInit);
                                break;
                            }
                        }
                    }
                }else{
                    this.handle(complete,id,data,status,isInit);
                }
            }else{
                this.autoTrigger(data,status);
            }
        }

        private handle(complete: number,id: string,data:object,status: string,isInit: boolean): void{
            switch(complete){
                case 1: //隐藏
                    this.changeShow(id,false);
                    break;
                case 2: //换图
                    this.changeImg(id,data['url']);
                    break;
                case 3: //移动位置
                    this.movePos(id,data['pos']);
                    break;
                case 4:
                    this.changeImg(id,data['url']);
                    this.movePos(id,data['pos']);
                    break;
                case 6: //显示隐藏
                    this.changeShow(id,true);
                    break;
            }
            // 初始化没必要
            if(isInit)return;
            // 完成时提示语
            status == clientCore.ItemEnum.IS_COM && data['comTips'] && alert.showFWords(data['comTips']);
            // 自动触发
            this.autoTrigger(data,status);
        }

        private autoTrigger(data: object,status: string): void{
            let auto: string[] = data['autoTrigger'];
            if(auto){
                let len: number = auto.length;
                for(let i:number=0; i<len; i++){
                    let array: string[] = auto[i].split("/");
                    if(array[0] == status){
                        clientCore.SecretroomMgr.instance.write(array[1],array[2]);
                        this.trigger(array[1]);
                        break;
                    }
                }
            }
        }


        private changeShow(id: string,visible: boolean): void{
            let obj: Laya.Sprite = this._observers.get(id);
            obj.visible = visible;
        }

        private changeImg(id: string, skin: string): void{
            let img: Laya.Image = this._observers.get(id) as Laya.Image;
            img.skin = skin;
        }

        private movePos(id: string,pos: string): void{
            let array: number[] = _.map(pos.split('/'),(ele: string)=>{ return parseInt(ele); });
            let obj: Laya.Sprite = this._observers.get(id);
            obj.x += array[0];
            obj.y += array[1];
        }

        private updateItem(key: string): void{
            // 检查完成
            this.checkFinish(key);
            // 触发目标道具
            let data: object = this._model.jsonData[key];
            data['target'] && EventManager.event(Constant.TRIGGER_TARGET);
        }

        /**
         * 处理完成后的一些状态
         * @param key 
         */
        private checkFinish(key: string): void{
            let data: object = this._model.jsonData[key];
            let status: string = clientCore.SecretroomMgr.instance.read(key);
            if(status == clientCore.ItemEnum.IS_COM){
                if(data['once']){ //清理点击
                    let obj: Laya.Sprite = this._observers.get(key);
                    obj.mouseEnabled = false;
                    obj.offAll(Laya.Event.CLICK);
                }
            }
        }
    }
}