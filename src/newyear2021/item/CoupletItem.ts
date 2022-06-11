namespace newyear2021{
    export class CoupletItem{
        private _has: Laya.Image;
        private _bg: Laya.Image;
        private _item: ui.commonUI.item.RewardItemUI;
        private _list: Laya.List;
        private _x: number;
        private _y: number;
        private _step: number;
        private _index: number;

        public clickHandler: Laya.Handler;

        constructor(){}

        initData(index: number,item: Laya.Sprite,atlas: Laya.Sprite,word: Laya.Sprite,reward: xls.pair,caller: CoupletPanel): void{
            this._index = index;
            this._item = new ui.commonUI.item.RewardItemUI();
            this._item.scale(0.7,0.7);
            item.addChild(this._item);
            BC.addEvent(caller,this._item,Laya.Event.CLICK,this,()=>{ this.clickHandler.run(); });
            clientCore.GlobalConfig.setRewardUI(this._item,{id: reward.v1,cnt: reward.v2,showName: false});
            this._bg = new Laya.Image('newyear2021/couplet.png');
            atlas.addChild(this._bg);
            this._has = new Laya.Image('newyear2021/has.png');
            atlas.addChild(this._has);
            this._list = new Laya.List();
            word.addChild(this._list);
            this._list.itemRender = WordItem;
            this._list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this._list.repeatX = 1;
            this._list.repeatY = 7;
        }

        pos(x: number,y: number): void{
            this._x = x;
            this._y = y;
        }

        dispose(): void{
            this._has?.destroy();
            this._has = null;
            this._bg?.destroy();
            this._bg = null;
            this._item?.destroy();
            this._item = null;
            this._list?.destroy();
            this._list = null;
        }

        /** 当前进度*/
        set step(value: number){
            this._step = value;
            this._list.array = new Array(7);
            this.gray = this._step < 7 * this._index;
        }

        get index(): number{
            return this._index;
        }

        set gray(value: boolean){
            if(this._item){
                this._item.imgBg.gray = value;
            }
        }
        
        set reward(value: boolean){
            this._has.visible = value;
        }

        get reward(): boolean{
            return this._has.visible;
        }

        private listRender(item: WordItem,index: number): void{
            item.height = 34;
            item.skin = `couplet/${this._index}_${index + 1}.png`;
            item.yellow = ((this._index - 1) * 7 + index) < this._step;
        }

        set direction(value: number){
            if(value == 0){ //正向
                this._bg.pos(this._x + 12,this._y);
                this._has.pos(this._x + 11,this._y + 384);
                this._list.pos(this._x + 35,this._y + 56);
                this._item.pos(this._x, this._y + 358);
            }else{
                this._item.pos(this._x,this._y);
                this._bg.pos(this._x + 12,this._y + 100);
                this._has.pos(this._x + 11,this._y + 26);
                this._list.pos(this._x + 36,this._y + 156);
            }
        }
    }
}