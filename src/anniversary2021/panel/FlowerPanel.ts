namespace anniversary2021{
    /**
     * 眠花祈福
     */
    export class FlowerPanel extends ui.anniversary2021.panel.FlowerPanelUI{

        private _model: Anniversary2021Model;
        private _control: Anniversary2021Control;
        private _giftPanel: GiftPanel;
        private _next: number = 0;
        private _sign: number;
        private readonly RANK_ID: number = 20;
        ruleId:number = 1138;
        init(sign: number): void{
            this._sign = sign;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.pos(-46,46);
            this.addEvents();
            this._model = clientCore.CManager.getModel(sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(sign) as Anniversary2021Control;
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'anniversary2021/nvmeitong.png' : 'anniversary2021/nanmeitong.png';
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(this.RANK_ID,0,2).then((ranks: clientCore.RankInfo[])=>{
                for(let i: number=0; i<3; i++){
                    let element: clientCore.RankInfo = ranks[i];
                    let item: ui.anniversary2021.item.HeadItemUI = this.boxRank.getChildAt(i) as ui.anniversary2021.item.HeadItemUI;
                    if(element == void 0){
                        item.visible = false;
                        continue;
                    }
                    item.imgTop.skin = `anniversary2021/top${element.msg.ranking}.png`;
                    item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(element.headImage);
                    item.nameTxt.changeText(element.userName);
                    item.rankTxt.changeText(element.msg.score + '');
                }

            }))
            this.addPreLoad(clientCore.RankManager.ins.getUserRank(this.RANK_ID,clientCore.LocalInfo.uid).then((rank: clientCore.RankInfo)=>{
                let ranking: number = rank.msg.ranking;
                this.rankTxt.changeText(`${ranking == 0 ? '默默无闻' : ranking}`);
                this.nameTxt.changeText(clientCore.LocalInfo.userInfo.nick);
                this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            }))
            this.updateMeterials();
            this.updateEx();
        }

        show(parent: Laya.Sprite): void{
            clientCore.Logger.sendLog('2021年3月19日活动', '【付费】小花仙周年庆典', '打开眠花祈福面板');
            EventManager.event("ANNIVERSARY2021_SHOW_TIME", "活动时间：3月19~4月1日");
            parent.addChild(this);
        }

        hide(): void{
            this.removeSelf();
        }

        dispose(): void{
            this._model = this._control = null;
            BC.removeEvent(this);
        }

        addEvents(): void{
            BC.addEvent(this,this.btnRank,Laya.Event.CLICK,this,this.openRank);
            BC.addEvent(this,this.btnGet,Laya.Event.CLICK,this,this.goGift);
            BC.addEvent(this,this.btnTry1,Laya.Event.CLICK,this,this.onTry,[1]);
            BC.addEvent(this,this.btnTry2,Laya.Event.CLICK,this,this.onTry,[2]);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.onReward,[2]);
            BC.addEvent(this,EventManager,globalEvent.ITEM_BAG_CHANGE,this,this.updateMeterials);
        }

        destroy(): void{
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            super.destroy();
        }
        private updateHeart(index: number,data: xls.commonAward): void{
            let item: ui.mermaidLove.render.HeartRenderUI = this.boxGrid.getChildAt(index) as ui.mermaidLove.render.HeartRenderUI;
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
            clientCore.Logger.sendLog('2021年3月19日活动', '【付费】小花仙周年庆典', '点击排行榜按钮');
            clientCore.ModuleManager.closeModuleByName('anniversary2021');
            clientCore.ModuleManager.open('anniversaryRank.AnniversaryRankModule',null,{openWhenClose: 'anniversary2021.Anniversary2021Module',openData: 2});
        }
        /**
         * 领取奖励
         * @param type 1-次数领奖 2-服装领奖
         * @param id 对应commonAward的ID 
         */
        private onReward(type: number,id?: number,index?: number): void{
            this._control.getFlowerReward(type,id,new Laya.Handler(this,()=>{
                if(type == 1){
                    this._model.rewardIdx = util.setBit(this._model.rewardIdx,index + 1,1);
                    this.updateHeart(index,xls.get(xls.commonAward).get(id));
                }
                util.RedPoint.reqRedPointRefresh(type == 1 ? 23101 : 23102);
                this.updateEx();
            }));
        }

        private goGift(): void{
            this._giftPanel = this._giftPanel || new GiftPanel();
            this._giftPanel.show(this._sign);
        }

        /** 服装预览*/
        private onTry(type: number): void{
            if(type == 1){
                clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: [1000092,1100061], condition: '林归鹿梦背景秀和舞台' });
            }else{
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2100290);
            }
        }

        private updateMeterials(): void{
            this.numTxt.changeText(clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_MONEY_ID)+'');
            let array: xls.commonAward[] = _.filter(xls.get(xls.commonAward).getValues(),(element:xls.commonAward)=>{ return element.type == this._model.ACTIVITY_ID; });
            _.forEach(array,(element: xls.commonAward,index: number)=>{
                this.updateHeart(index,element);
            })
        }

        private updateEx(): void{
            let result:{ suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(2100290);
            this.boxReward.visible = result.hasCnt < 12;
            if(this.boxReward.visible){
                this.clothTxt.changeText(`${result.hasCnt}/9`);
                this.btnReward.disabled = !this._model.checkReward();
            }
        }
    }
}