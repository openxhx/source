namespace newyear2021{
    /**
     * 集春联
     */
    export class CoupletPanel extends ui.newyear2021.panel.CoupletPanelUI implements IPanel{

        private _atlas: Laya.Sprite;
        private _word: Laya.Sprite;
        private _item: Laya.Sprite;
        private _model: NewYear2021Model;
        private _control: NewYear2021Control;
        private _items: CoupletItem[];

        show(sign: number): void{
            this._items = [];
            this._model = clientCore.CManager.getModel(sign) as NewYear2021Model;
            this._control = clientCore.CManager.getControl(sign) as NewYear2021Control;
            this.initView();
            this.initProgress();
            clientCore.UIManager.setMoneyIds([this._model.COUPLET_ITEM_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
        }   
        hide(): void{
            clientCore.UIManager.releaseCoinBox();
            _.forEach(this._items,(element: CoupletItem)=>{ element.dispose(); })
            this._items.length = 0;
            this._items = null;
            this._atlas?.destroy();
            this._word?.destroy();
            this._item?.destroy();
            this._atlas = this._word = this._item = null;
            this._model = this._control = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnAuto,Laya.Event.CLICK,this,this.onAuto);
            BC.addEvent(this,this.panel.hScrollBar,Laya.Event.CHANGE,this,this.onScrollBar);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private initView(): void{
            this.updateStep();
            this.btnAuto.disabled = !clientCore.ItemsInfo.checkHaveItem(this._model.COUPLET_ITEM_ID) || this._model.coupletStep == 98;
            //道具层
            this._item = new Laya.Sprite();
            this.panel.addChild(this._item);
            //合图层
            this._atlas = new Laya.Sprite();
            this.panel.addChild(this._atlas);
            //文字层
            this._word = new Laya.Sprite();
            this.panel.addChild(this._word);
            this.panel.hScrollBarSkin = '';
            let x: number = 0;
            let direction: number = 1;
            let rewards: xls.pair[] = clientCore.GlobalConfig.config[clientCore.LocalInfo.sex == 1 ? 'scrollsAwardsFemale' : 'scrollsAwardsMale'];
            for(let i:number=0; i<14; i++){
               let item: CoupletItem = new CoupletItem();
               item.initData(i + 1,this._item,this._atlas,this._word,rewards[i],this);
               item.pos(x,0);
               item.clickHandler = new Laya.Handler(this,this.onClick,[i + 1],false);
               item.reward = util.getBit(this._model.rewardIdx,i + 1) == 1;
               item.step = this._model.coupletStep;
               i % 2 == 0 && (direction = direction == 0 ? 1 : 0);
               item.direction = direction;
               x += 130;
               this._items.push(item);
            }
            this._word.width = this._atlas.width = this._item.width = x + 20;
        }

        private initProgress(): void{
            this.progressBar.imgBg.height = 600;
        }

        private onScrollBar(): void{
            let scrollBar: Laya.ScrollBar = this.panel.hScrollBar;
            this.progressBar.imgValue.y = scrollBar.value / scrollBar.max * 530;
        }

        private onClick(index: number): void{
            let item: CoupletItem = this._items[index - 1];
            if(this._model.checkReward(index)){
                this._control.getCoupletReward(index,new Laya.Handler(this,()=>{
                    util.RedPoint.reqRedPointRefresh(23302);
                    this._model.rewardIdx = util.setBit(this._model.rewardIdx,index,1);
                    item.reward = true;
                }));
            }else{
                item.reward == false && alert.showFWords('填完该列的对联才可以领奖哦~');
            }
        }

        /** 自动填字*/
        private onAuto(): void{
            let count: number = clientCore.ItemsInfo.getItemNum(this._model.COUPLET_ITEM_ID);
            this._control.setCouplet(new Laya.Handler(this,()=>{
                alert.showFWords('已经成功为对联填字啦~');
                util.RedPoint.reqRedPointRefresh(23301);
                let now: number = clientCore.ItemsInfo.getItemNum(this._model.COUPLET_ITEM_ID);
                this._model.coupletStep += (count - now);
                _.forEach(this._items,(element: CoupletItem)=>{ element.step = this._model.coupletStep; })
                this.btnAuto.disabled = now <= 0 || this._model.coupletStep == 98;
                this.updateStep();
            }));
        }

        private updateStep(): void{
            this.numTxt.changeText(this._model.coupletStep + '');
        }
    }
}