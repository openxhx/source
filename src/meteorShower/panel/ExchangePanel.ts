namespace meteorShower{
    /**
     * 材料兑换
     */
    export class ExchangePanel extends ui.meteorShower.ExchangePanelUI{
        private _model: MeteorShowerModel;
        private _control: MeteorShowerControl;
        private _page: number;
        private _array: xls.commonAward[];
        constructor(){ 
            super();
            this.list.renderHandler = new Laya.Handler(this,this.itemRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.itemMouse,null,false);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
        }
        show(sign: number): void{
            this._page = 0;
            this._model = clientCore.CManager.getModel(sign) as MeteorShowerModel;
            this._control = clientCore.CManager.getControl(sign) as MeteorShowerControl;
            this._array = _.filter(xls.get(xls.commonAward).getValues(),(element:xls.commonAward)=>{ return element.type == 99; });
            this.changePage();
            clientCore.UIManager.setMoneyIds([9900103]);
            clientCore.UIManager.showCoinBox();
            clientCore.DialogMgr.ins.open(this);
            clientCore.Logger.sendLog('2020年11月27日活动', '【主活动】一起来看流星雨', '打开奖励领取弹窗');
        }
        hide(): void{
            this._array.length = 0;
            this._array = null;
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnLeft,Laya.Event.CLICK,this,this.onPage,[0]);
            BC.addEvent(this,this.btnRight,Laya.Event.CLICK,this,this.onPage,[1]);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private itemRender(item: ui.meteorShower.render.ExchangeItemUI,index: number): void{
            let data:xls.commonAward = this.list.array[index];
            let has: boolean = util.getBit(this._model.msg.commonAward,this.getPos(index)) == 1;
            let btn: component.HuaButton = item.getChildByName('exchange') as component.HuaButton;
            btn.disabled = has || data.num.v2 > clientCore.ItemsInfo.getItemNum(9900103);
            item.imgHas.visible = has;
            item.costTxt.changeText(`x${data.num.v2}`);
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            clientCore.GlobalConfig.setRewardUI(item.mcView,{id: reward.v1,cnt: reward.v2,showName: false});
        }
        private async itemMouse(e: Laya.Event,index: number): Promise<void>{
            if(e.type != Laya.Event.CLICK || e.target.name != 'exchange')return;
            let data:xls.commonAward = this.list.array[index];
            if(data.num.v2 > clientCore.ItemsInfo.getItemNum(9900103)){
                alert.showFWords('星屑数量不满足哦~');
                return;
            }
            this._model.msg.commonAward =  await this._control.exchange(this.getPos(index),data.id);
            if(this._closed)return;
            this.list.changeItem(index,data);
            // alert.showSmall(`是否确认兑换部件？`,{
            //     callBack:{
            //         caller: this,
            //         funArr: [async()=>{
            //             if(data.num.v2 > clientCore.ItemsInfo.getItemNum(9900103)){
            //                 alert.showFWords('星屑数量不满足哦~');
            //                 return;
            //             }
            //             this._model.msg.commonAward =  await this._control.exchange(this.getPos(index),data.id);
            //             if(this._closed)return;
            //             this.list.changeItem(index,data);
            //         }]
            //     }
            // })
        }
        private onTry(): void{
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110199);
        }
        private onPage(type: number): void{
            let page: number = type == 0 ? this._page - 1 : this._page + 1;
            if(page < 0 || page >= Math.ceil(this._array.length / 8))return;
            this._page = page;
            this.changePage();
        }

        private changePage(): void{
            this.list.array = _.slice(this._array,this._page*8,this._page*8 + 8);
        }

        private getPos(index: number): number{
            return this._page*8 + index + 1;
        }
    }
}