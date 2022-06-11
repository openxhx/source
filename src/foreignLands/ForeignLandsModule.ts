namespace foreignLands{
    /**
     * 异域王座
     * foreignLands.ForeignLandsModule 494
     */
    export class ForeignLandsModule extends ui.foreignLands.ForeignLandsModuleUI{
        private _model: ForeignLandsModel;
        private _control: ForeignLandsControl;
        private _buyPanel: BuyPanel;
        private _next: number = 0;
        private readonly RANK_ID: number = 22;
        init(): void{
            this.drawCallOptimize = true;
            this.sign = clientCore.CManager.regSign(new ForeignLandsModel(),new ForeignLandsControl());
            this._model = clientCore.CManager.getModel(this.sign) as ForeignLandsModel;
            this._control = clientCore.CManager.getControl(this.sign) as ForeignLandsControl;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'foreignLands/nvmeitong.png' : 'foreignLands/nanmeitong.png';
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(this.RANK_ID,0,2).then((ranks: clientCore.RankInfo[])=>{
                this.list.array = ranks;
            }))
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(this.RANK_ID,clientCore.LocalInfo.uid).then((rank: clientCore.RankInfo)=>{
                let ranking: number = rank.msg.ranking;
                this.rankTxt.changeText(`${ranking == 0 ? '默默无闻' : ranking}`);
                this.nameTxt.changeText(clientCore.LocalInfo.userInfo.nick);
                this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            }))
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(this._control.getInfo(this.sign));
        }
        addEventListeners(): void{
            BC.addEvent(this,this.btnClose,Laya.Event.CLICK,this,this.destroy);
            BC.addEvent(this,this.btnRank,Laya.Event.CLICK,this,this.openRank);
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.openBuy);
            BC.addEvent(this,this.btnTry,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward);
            BC.addEvent(this,EventManager,globalEvent.ITEM_BAG_CHANGE,this,this.updateMeterials);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            clientCore.Logger.sendLog('2021年4月30日活动', '【付费】异域王座', '打开异域王座面板');
            this.updateMeterials();
            this.updateEx();
        }
        destroy(): void{
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            super.destroy();
        }
        private listRender(item: ui.foreignLands.item.RoleItemUI,index: number): void{
            let element: clientCore.RankInfo = this.list.array[index];
            item.imgTop.skin = `foreignLands/top${element.msg.ranking}.png`;
            item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(element.headImage);
            item.nameTxt.changeText(element.userName);
            item.rankTxt.changeText(element.msg.score + '');
        }
        private updateHeart(index: number,data: xls.commonAward): void{
            let item: ui.foreignLands.item.RewardItemUI = this.boxTarget.getChildAt(index) as ui.foreignLands.item.RewardItemUI;
            let has: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_MONEY_ID);
            let isGet: boolean = util.getBit(this._model.rewardIdx,index + 1) == 1;
            BC.removeEvent(this,item,Laya.Event.CLICK,this,this.onCloth);
            item.numTxt.changeText(data.num.v2 + '');
            item.imgHas.visible = isGet;
            item.imgGet.visible = !isGet && data.num.v2 <= has;
            item.imgGet.visible && BC.addEvent(this,item,Laya.Event.CLICK,this,this.onCloth,[data.id,index]);
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);

            if(data.num.v2 <= has){
                this._next = index + 1;
            }

            item.filters = (!isGet && !item.imgGet.visible && this._next != index) ? util.DisplayUtil.darkFilter : [];
        }
        private openRank(): void{
            this.destroy();
            clientCore.ModuleManager.open('foreignLandsRank.ForeignLandsRankModule',null,{openWhenClose: 'foreignLands.ForeignLandsModule'});
        }

        private onReward(): void{
            this._control.getReward(new Laya.Handler(this,()=>{
                this.updateEx();
            }));
        }

        private onCloth(id: number,index: number): void{
            let pos: number = index + 1;
            this._control.getCloth(pos,id,new Laya.Handler(this,()=>{
                this._model.rewardIdx = util.setBit(this._model.rewardIdx,pos,1);
                this.updateHeart(index,xls.get(xls.commonAward).get(id));
                this.updateEx();
            }));
        }

        private openBuy(): void{
            this._buyPanel = this._buyPanel || new BuyPanel();
            this._buyPanel.show(this.sign);
        }

        /** 服装预览*/
        private onTry(): void{
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2100299);
        }

        /** 活动规则*/
        private onRule(): void{
            alert.showRuleByID(1158); 
        }

        private updateMeterials(): void{
            this.numTxt.changeText(clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_MONEY_ID)+'');
            let array: xls.commonAward[] = _.filter(xls.get(xls.commonAward).getValues(),(element:xls.commonAward)=>{ return element.type == this._model.ACTIVITY_ID; });
            _.forEach(array,(element: xls.commonAward,index: number)=>{
                this.updateHeart(index,element);
            })
        }

        private updateEx(): void{
            let result:{ suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(2100299);
            this.boxReward.visible = result.hasCnt < 15;
            if(this.boxReward.visible){
                this.clothTxt.changeText(`${result.hasCnt}/12`);
                this.btnReward.disabled = !this._model.checkReward();
            }
        }
    }
}