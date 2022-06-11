namespace earthValue{
    export class NoteItem extends ui.earthValue.item.NoteItemUI{
        
        constructor(){
            super();
            this.list.renderHandler = new Laya.Handler(this,this.listRender,null,false);
            this.list.mouseHandler = new Laya.Handler(this,this.listMouse,null,false);
        }

        setInfo(cfg: xls.commonAward,index: number): void{
            let level: number = clientCore.EarthPerciousMgr.level;
            let has: boolean = clientCore.EarthPerciousMgr.checkReward(index + 1);
            let current: number = index + 1;
            this.imgHas.visible = has;
            this.btnReward.visible = !has && level >= current;
            this.boxLv.visible = !has && level < current;
            if(this.boxLv.visible)
                this.imgLv.skin = `earthValue/${current}.png`;
            this.list.array = clientCore.LocalInfo.sex == 1 ? cfg.femaleAward : cfg.maleAward;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI,index: number): void{
            let data: xls.pair = this.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item,{id: data.v1,cnt: data.v2,showName: false});   
        }

        private listMouse(e: Laya.Event,index: number): void{
            if(e.type != Laya.Event.CLICK)return;
            let data: xls.pair = this.list.array[index];
            clientCore.ToolTip.showTips(e.target,{id: data.v1});
        }
    }
}