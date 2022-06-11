
namespace secretroom{
    /**
     * 道具展示
     */
    export class ItemShow extends ui.secretroom.ItemShowUI{
        
        public sideClose: boolean = true;
        private _type: number;
        private _key: string;
        private _story: number;

        constructor(){ super(); }

        show(type:number,key: string,name?: string): void{
            this._key = key;
            this._type = type;
            if(type == 0){
                let cls: xls.escapeRoomPlot = _.find(xls.get(xls.escapeRoomPlot).getValues(),(element: xls.escapeRoomPlot)=>{ return element.itemId == parseInt(key); });
                if(!cls){
                    console.error(`ItemShow：未在配置表escapeRoomPlot中找到itemId为${key}的数据.`);
                    return;
                }
                this._story = cls.movie;
                this.nameTxt.changeText(cls.name);
                this.pointTxt.changeText(`剧情点+${cls.plotNum}`);
            }else{
                this.nameTxt.changeText(name);
            }
            this.imgIco.skin = `res/secretroom/bigIcon/${key}.png`;
            this.imgBg.skin = type == 0 ? 'secretroom/use_di.png' : 'secretroom/desc_di.png';
            this.descTxt.changeText(type == 0 ? '剧情道具' : '使用道具');
            this.pointTxt.visible = type == 0;
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this,Laya.Event.CLICK,this,this.hide);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        destroy(): void{
            if(this._closed)return;
            if(this._type == 1){
                EventManager.event(Constant.FLY_TO_BAG,this._key)
            }else{
                clientCore.AnimateMovieManager.setParam({ selectArr: [], forceSkipOpt: 0, bgAlpha: 0.5 });
                clientCore.AnimateMovieManager.showAnimateMovie(this._story,null,null,1)
            }
            this.imgBg.skin = this.imgIco.skin = '';
            super.destroy();
        }


        private static _instance: ItemShow;
        /**
         * 打开道具预览
         * @param type 0-剧情道具 1-可使用道具
         * @param key 道具ID
         * @param name 道具名
         */
        public static openView(type: number,key: string,name?: string): void{
            this._instance = this._instance || new ItemShow();
            this._instance.show(type,key,name);
        }
    }
}