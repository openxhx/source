namespace mermaidLove{
    /**
     * 付费：人鱼之恋
     * mermaidLove.MermaidLoveModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0205\【付费】人鱼之恋20210205_Inory
     */
    export class MermaidLoveModule extends ui.mermaidLove.MermaidLoveModuleUI{
        private _model: MermaidLoveModel;
        private _control: MermaidLoveControl;
        private _finishPanel: FinishPanel;
        private _next: number = 0;
        private readonly RANK_ID: number = 32;
        init(): void{
            this.drawCallOptimize = true;
            this.sign = clientCore.CManager.regSign(new MermaidLoveModel(),new MermaidLoveControl());
            this._model = clientCore.CManager.getModel(this.sign) as MermaidLoveModel;
            this._control = clientCore.CManager.getControl(this.sign) as MermaidLoveControl;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'mermaidLove/nvmeitong.png' : 'mermaidLove/nanmeitong.png';
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
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.goFinishPool);
            BC.addEvent(this,this.tryBtn,Laya.Event.CLICK,this,this.onTry);
            BC.addEvent(this,this.btnRule,Laya.Event.CLICK,this,this.onRule);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward,[2]);
            BC.addEvent(this,EventManager,globalEvent.ITEM_BAG_CHANGE,this,this.updateMeterials);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        onPreloadOver(): void{
            clientCore.Logger.sendLog('2022年1月28日活动', '【付费】双子星的约定排行榜', '打开双子星的约定面板');
            this.updateMeterials();
            this.updateEx();
        }
        destroy(): void{
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            super.destroy();
        }
        private listRender(item: ui.mermaidLove.render.HeadRenderUI,index: number): void{
            let element: clientCore.RankInfo = this.list.array[index];
            item.imgTop.skin = `mermaidLove/top${element.msg.ranking}.png`;
            item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(element.headImage);
            item.nameTxt.changeText(element.userName);
            item.rankTxt.changeText(element.msg.score + '');
        }
        private updateHeart(index: number,data: xls.commonAward): void{
            let item: ui.mermaidLove.render.HeartRenderUI = this.boxHeart.getChildAt(index) as ui.mermaidLove.render.HeartRenderUI;
            let has: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_MONEY_ID);
            let isGet: boolean = util.getBit(this._model.rewardIdx,index + 1) == 1;
            BC.removeEvent(this,item,Laya.Event.CLICK,this,this.onReward);
            item.numTxt.changeText(data.num.v2 + '');
            item.imgHas.visible = isGet;
            item.imgGet.visible = !isGet && data.num.v2 <= has;
            item.imgGet.visible && BC.addEvent(this,item,Laya.Event.CLICK,this,this.onReward,[1,data.id,index]);
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0] : data.maleAward[0];
            item.imgIco.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);

            if(data.num.v2 <= has){
                this._next = index + 1;
            }

            item.filters = (!isGet && !item.imgGet.visible && this._next != index) ? util.DisplayUtil.darkFilter : [];
        }
        private openRank(): void{
            clientCore.Logger.sendLog('2021年2月5日活动', '【付费】人鱼之恋', '点击排行榜按钮');
            this.destroy();
            clientCore.ModuleManager.open('mermaidRank.MermaidRankModule',null,{openWhenClose: 'mermaidLove.MermaidLoveModule'});
        }
        /**
         * 领取奖励
         * @param type 1-次数领奖 2-服装领奖
         * @param id 对应commonAward的ID 
         */
        private onReward(type: number,id?: number,index?: number): void{
            this._control.getReward(type,id,new Laya.Handler(this,()=>{
                if(type == 1){
                    this._model.rewardIdx = util.setBit(this._model.rewardIdx,index + 1,1);
                    this.updateHeart(index,xls.get(xls.commonAward).get(id));
                }
                util.RedPoint.reqRedPointRefresh(type == 1 ? 23101 : 23102);
                this.updateEx();
            }));
        }

        private goFinishPool(): void{
            clientCore.Logger.sendLog('2021年2月5日活动', '【付费】人鱼之恋', '点击获取鱼鳞按钮');
            this._finishPanel = this._finishPanel || new FinishPanel();
            this._finishPanel.show(this.sign);
        }

        /** 服装预览*/
        private onTry(): void{
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110553);
        }

        /** 活动规则*/
        private onRule(): void{
            alert.showRuleByID(1045); 
        }

        private updateMeterials(): void{
            this.numTxt.changeText(clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_MONEY_ID)+'');
            let array: xls.commonAward[] = _.filter(xls.get(xls.commonAward).getValues(),(element:xls.commonAward)=>{ return element.type == this._model.ACTIVITY_ID; });
            _.forEach(array,(element: xls.commonAward,index: number)=>{
                this.updateHeart(index,element);
            })
        }

        private updateEx(): void{
            let result:{ suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(2110553);
            this.boxReward.visible = result.hasCnt < 13;
            if(this.boxReward.visible){
                this.clothTxt.changeText(`${result.hasCnt}/10`);
                this.btnReward.disabled = !this._model.checkReward();
            }
        }
    }
}