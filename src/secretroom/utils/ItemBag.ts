namespace secretroom{
    /**
     * 背包
     */
    export class ItemBag{
        private static _instance: ItemBag;
        public static get instance(): ItemBag{
            return this._instance || (this._instance = new ItemBag());
        }
        private _list: Laya.List;
        private _select: string;
        private _selectImg: Laya.Image;

        constructor(){ }

        init(list: Laya.List): void{
            this._list = list;
            this._list.vScrollBarSkin = '';
            this._list.scrollBar.elasticBackTime = 200;
            this._list.scrollBar.elasticDistance = 200;
            this._list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this._list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
            this._list.array = clientCore.SecretroomMgr.instance.getBags();
            this._selectImg = new Laya.Image('secretroom/select.png');
            this._selectImg.pos(-5,-4);
        }

        add(id: string): void{
            let array: string[] = this._list.array;
            array.push(id)
            this._list.array = _.uniq(array);
            clientCore.SecretroomMgr.instance.write(id,clientCore.ItemEnum.IN_BAG);
            ObserverMgr.instance.trigger(id);
        }

        /**
         * @param id 背包道具id
         * @param detrigger 
         */
        remove(id: string,detrigger: string,status: clientCore.ItemEnum = clientCore.ItemEnum.IS_COM): void{
            let index: number = this._list.array.indexOf(id);
            if(index == -1)return;
            this._list.deleteItem(index);
            this.updateSelect();
            clientCore.SecretroomMgr.instance.write(id,clientCore.ItemEnum.IS_COM);
            clientCore.SecretroomMgr.instance.write(detrigger,status);
            ObserverMgr.instance.trigger(detrigger);
        }

        clear(): void{
            this._selectImg?.destroy();
            this._list = this._selectImg = null;
        }

        get selectKey(): string{
            return this._select;
        }

        private listRender(item: ui.secretroom.render.ItemUI,index: number): void{
            item.imgIco.skin = `res/secretroom/icon/${this._list.array[index]}.png`;
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let select: string = this._list.array[index];
            if(select == this._select){
                this.updateSelect();
                return;
            }
            this.updateSelect(select,e.target);
        }

        private updateSelect(key?: string,target?: Laya.Sprite): void{
            target ? target.addChild(this._selectImg) : this._selectImg.removeSelf();
            this._select = key || '';
        }
    }
}