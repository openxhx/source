namespace clientCore{

    export enum ItemEnum{
        IN_BAG = '0',
        IS_COM_1 = '1', //完成一阶段
        IS_COM_2 = '2', //完成二阶段
        IS_COM = '99' //取一个较大的值 防止阶段过多 这个值不可变
    }

    /**
     * 道具数据
     * @value 存储状态
     * 
     */
    export class SecretroomMgr{

        private static _instance: SecretroomMgr;
        public static get instance(): SecretroomMgr{
            return this._instance || (this._instance = new SecretroomMgr());
        }
        
        private _map: object;
        private _local: object;

        constructor(){}

        async setup(): Promise<void>{
            await this.init();
        }

        init(): Promise<void>{
            this._local = JSON.parse(window.localStorage.getItem(`${LocalInfo.uid}_SECRETROOM`) || '{}');
            this._map = {};
            return net.sendAndWait(new pb.cs_halloween_prop_info())
            .then((msg: pb.sc_halloween_prop_info)=>{
                _.forEach(msg.items,(element: pb.IbackRoomProp)=>{
                    this._map[element.itemId+''] = element.status+'';
                })
                // 和本地校验
                for(let key in this._local){
                    if(!this._map[key] || this._map[key] != this._local[key]){
                        this._map[key] = this._local[key];
                        net.send(new pb.cs_halloween_get_prop({itemId: parseInt(key),status: parseInt(this._local[key])}));
                    }
                }
                return Promise.resolve();
            })
            .catch(()=>{
                return Promise.resolve();
            })
        }

        /**
         * 写入数据
         * @param key 
         * @param value 
         */
        write(key: string | number,value: string): void{
            if(typeof key == 'number'){
                key = key + '';
            }
            this._map[key] = value;
            this._local[key] = value;
            net.send(new pb.cs_halloween_get_prop({itemId: parseInt(key),status: parseInt(value)}));
            //本地也缓存一份
            window.localStorage.setItem(`${LocalInfo.uid}_SECRETROOM`,JSON.stringify(this._local));
            //通知一次道具状态变化
            EventManager.event(globalEvent.SECRETROOM_ITEM_UPDATE,[key]);
        }

        /**
         * 读取数据
         * @param key 
         */
        read(key: string | number): string{
            if(typeof key == 'number'){
                key = key + '';
            }
            return this._map[key];
        }

        check(key: string | number): boolean{
            let status: string = this.read(key);
            return status == ItemEnum.IN_BAG || status == ItemEnum.IS_COM;
        }

        getBags(): string[]{
            let list: string[] = [];
            for(let key in this._map){
                this._map[key] == ItemEnum.IN_BAG && list.push(key);
            }
            return list;
        }
    }
}