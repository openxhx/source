namespace lantern2021{
    export class MakeItem extends ui.lantern2021.item.MakeItemUI{
        constructor(){ 
            super();
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
        }
        setInfo(data: xls.eventTask): void{
            this.list.array = data.expend;
            let reward: xls.pair = clientCore.LocalInfo.sex == 1 ? data.awardsFemale[0] : data.awardsMale[0];
            clientCore.GlobalConfig.setRewardUI(this.vReward,{id: reward.v1,cnt: reward.v2,showName: false});
            this.vReward.offAll();
            this.vReward.on(Laya.Event.CLICK,this,()=>{ clientCore.ToolTip.showTips(this.vReward,{id: reward.v1})});
            this.btnMake.disabled = !clientCore.ItemsInfo.checkItemsEnough(_.map(data.expend,(element: xls.pair)=>{ return {itemID: element.v1,itemNum: element.v2}; }));
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