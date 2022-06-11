namespace heartPrison{
    /**
     * 奖励兑换界面
     */
    export class ExchangePanel extends ui.heartPrison.panel.ExchangePanelUI{
        private _fragmentPanel: FragmentPanel;
        private _point: number;
        private _sign: number;
        constructor(){ 
            super(); 
            this.list.renderHandler = new Laya.Handler(this,this.itemRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.itemMouse,null,false);
            this.list.vScrollBarSkin = '';
            this._point = this.getCurrPoint();
            this.pointTxt.changeText(`当前剧情点:${this._point}`);
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
        }
        show(sign: number): void{
            this._sign = sign;
            this.list.array = _.filter(xls.get(xls.eventExchange).getValues(),(element: xls.eventExchange)=>{ return element.type == 87; });
            this.updateItemCnt();
            clientCore.DialogMgr.ins.open(this);
        }
        hide(): void{
            this._fragmentPanel = null;
            clientCore.DialogMgr.ins.close(this);
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.hide);
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.onGet);
            BC.addEvent(this,this.imgIco,Laya.Event.CLICK,this,this.onShowTips);
            BC.addEvent(this,this.list.scrollBar,Laya.Event.CHANGE,this,this.onChange);
            BC.addEvent(this,EventManager,globalEvent.ITEM_BAG_CHANGE,this,this.updateItemCnt);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }

        private itemRender(item: ui.heartPrison.render.ExchangeRenderUI,index: number): void{
            let data: xls.eventExchange = this.list.array[index];
            let reward:xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            let id: number = reward.v1;
            let value: number = data.unlockCondition[0].v2;
            let lock: boolean = value > this._point;
            item.boxLock.visible = lock;
            item.boxOpen.visible = !lock;
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            if(lock){
                item.conTxt.changeText(`剧情点：${value}`);
            }else{
                let has: boolean = clientCore.ItemsInfo.checkHaveItem(id) && data.repeat == 0;
                item.imgHas.visible = item.btnExchange.disabled = has;
                item.costTxt.changeText(`${data.cost[0].v2}`);
            }
        }

        private itemMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let data: xls.eventExchange = this.list.array[index];
            let reward:xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            let id: number = reward.v1;
            if(e.target instanceof component.HuaButton){
                if(clientCore.ItemsInfo.checkHaveItem(id) && !data.repeat)return;
                let value: number = data.unlockCondition[0].v2;
                if(value > this._point){
                    alert.showFWords(`剧情点需达到${value}才可兑换哦~`);
                    return;
                }
                if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: data.cost[0].v1,itemNum: data.cost[0].v2}])){
                    alert.showFWords('心灵碎片数量不足，点击右下角获取哦~');;
                    return;
                }
                net.sendAndWait(new pb.cs_common_exchange({ activityId: data.type, exchangeId: data.id })).then((msg: pb.sc_common_exchange) => {
                    alert.showReward(msg.item);
                    this.list.changeItem(index,data);
                })
            }else{
                clientCore.ToolTip.showTips(e.target,{id: id});
            }
        }

        private onChange(): void{
            let scr: Laya.ScrollBar = this.list.scrollBar;
            scr.max > 0 && (this.imgBar.y = 168 + 336 *(scr.value/scr.max));
        }

        private onShowTips(e: Laya.Event): void{
            clientCore.ToolTip.showTips(e.target,{id: 9900093});
        }

        private onGet(): void{
            this._fragmentPanel = this._fragmentPanel || new FragmentPanel();
            this._fragmentPanel.show(this._sign);
        }

        private getCurrPoint(): number{
            let value: number = 0;
            _.forEach(xls.get(xls.escapeRoomPlot).getValues(),(element: xls.escapeRoomPlot)=>{
                clientCore.SecretroomMgr.instance.read(element.itemId+'') && (value+=element.plotNum);
            })
            return value;
        }

        private updateItemCnt(): void{
            this.itemTxt.changeText(clientCore.ItemsInfo.getItemNum(9900093)+'');
        }
    }
}