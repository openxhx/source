namespace nightRefine{
    /**
     * tips
     */
    export class TipsPanel extends ui.nightRefine.panel.TipsPanelUI{

        private _has: boolean;

        constructor(){ 
            super();
            this.list.renderHandler = new Laya.Handler(this, this.itemRender, null, false);
        }

        show(data: {id: number, desc: string, rewards: number[]}): void{
            this._has = clientCore.ItemsInfo.checkHaveItem(data.rewards[0]);
            this.txDesc.text = data.desc;
            this.txName.text =  this._has ? clientCore.ItemsInfo.getItemName(data.id) : '？？？？';
            this.list.array = data.rewards;
        }

        private itemRender(item: ui.nightRefine.render.RewardItemUI, index: number): void{
            item.imgHas.visible = this._has;
            clientCore.GlobalConfig.setRewardUI(item.mcView, {id: this.list.array[index], cnt: 1, showName: true});
        }
    }
}