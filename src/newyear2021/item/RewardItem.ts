namespace newyear2021{
    export class RewardItem extends ui.newyear2021.item.RewardItemUI{
        constructor(){ 
            super(); 
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
        }
        
        setInfo(data: xls.eventExchange): void{
            this.list.array = data.cost;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.femaleProperty[0] : data.maleProperty[0];
            clientCore.GlobalConfig.setRewardUI(this.vReward,{id: reward.v1,cnt: reward.v2,showName: false});
            this.vReward.offAll();
            this.vReward.on(Laya.Event.CLICK,this,()=>{ clientCore.ToolTip.showTips(this.vReward,{id: reward.v1})});
            this.btnExchange.disabled = data.repeat == 0 && clientCore.LocalInfo.checkHaveCloth(reward.v1);
        }

        private listRender(item: ui.commonUI.item.RewardItemUI,index: number): void{
            let data: xls.pair = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item,{id: data.v1,cnt: data.v2,showName: false});
            item.num.visible = true;
            item.num.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(data.v1),data.v2);
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let data: xls.pair = this.list.array[index];
            clientCore.ToolTip.showTips(e.target,{id: data.v1});
        }
    }
}