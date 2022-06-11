namespace springSummberAppoint{

    class ItemInfo {
        id: number;
        iconUrl: string;
        name: string;
        num: number;
    }
    export class RewardInfo {
        godTreeType: number;
        reward: ItemInfo;
        decomp?: ItemInfo;
    }
    export function parseReward(info: pb.IdrawReward): RewardInfo {
        let rtn = new RewardInfo();
        let xlsInfo = xls.get(xls.godTree).get(info.id);
        if (!xlsInfo) {
            // alert.showSmall(`id:${info.id}在godTree表中找不到`);
            alert.showSmall(`道具:${clientCore.ItemsInfo.getItemName(info.flag)}到达背包上限`);
        }
        rtn.godTreeType = xlsInfo.type;
        rtn.reward = new ItemInfo();
        rtn.reward = pairToItemInfo(info.id, clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale);
        //分解逻辑处理
        if (info.flag == 1) {
            rtn.decomp = pairToItemInfo(info.id, xlsInfo.repeatReward);
        }
        return rtn;
    }

    function pairToItemInfo(godTreeid: number, pair: xls.pair) {
        let obj = new ItemInfo();
        obj.id = pair.v1;
        obj.name = clientCore.ItemsInfo.getItemName(obj.id);
        obj.iconUrl = clientCore.ItemsInfo.getItemIconUrl(obj.id);
        obj.num = pair.v2;
        return obj;
    }

    /**
     * 未来之梦
     */
    export class DreamPanel extends ui.springSummberAppoint.panel.DreamPanelUI implements IPanel{

        private _oncePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _buyPanel: BuyPanel;
        private _loading: boolean;

        ruleId: number = 1156;
        
        onAwake(): void{
            this.pos(76,84);
            this.boxNan.visible = clientCore.LocalInfo.sex == 2;
            this.boxNv.visible = clientCore.LocalInfo.sex == 1;
            this.addEvents();
            this.updateReward();

            this._oncePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
        }
        show(sign:number,parent: Laya.Sprite): void{
            clientCore.UIManager.setMoneyIds([9900158]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
        }
        hide(): void{
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }
        dispose(): void{
            this._oncePanel = this._tenPanel = this._buyPanel = null;
            this.removeEvents();
        }
        private addEvents(): void{
            BC.addEvent(this,this.btnOnce,Laya.Event.CLICK,this,this.onDraw,[1]);
            BC.addEvent(this,this.btnTen,Laya.Event.CLICK,this,this.onDraw,[10]);
            BC.addEvent(this,this.btnPro,Laya.Event.CLICK,this,this.onProbClick);
            BC.addEvent(this,this.btnReward,Laya.Event.CLICK,this,this.preReward);
            BC.addEvent(this,this.btnBuy,Laya.Event.CLICK,this,this.onBuy);
            BC.addEvent(this,this.boxTitle,Laya.Event.CLICK,this,this.onReward);
            for(let i:number=1; i<5; i++){
                BC.addEvent(this,this[`btnTry_${i}`],Laya.Event.CLICK,this,this.onTry,[i]);
            }
        }
        private removeEvents(): void{

        }

        private onDraw(times: number) {
            if(this._loading)return;
            if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: 9900158,itemNum: (times == 1 ? 1 : 8)}])){
                alert.showFWords('物品数量不足~');
                return;
            }
            this._loading = true;
            net.sendAndWait(new pb.cs_common_activity_draw({moduleId: 1,times: times})).then(
                (data: pb.sc_common_activity_draw) => {
                    times == 1 ? this.getOne(data.item[0]) : this.getAll(data.item);
                    this._loading = false;
                    this.updateReward();
                }).catch(() => {
                    this._loading = false;
                });
        }

        private async getOne(rwdInfo: pb.IdrawReward) {
            let itemInfo = parseReward(rwdInfo);
            if (xls.get(xls.itemCloth).has(itemInfo.reward.id) && !itemInfo.decomp) {
                await alert.showDrawClothReward(itemInfo.reward.id);
            }
            else {
                clientCore.DialogMgr.ins.open(this._oncePanel, false);
                this._oncePanel.showReward(rwdInfo);
            }
        }

        private getAll(treeInfos: pb.IdrawReward[]) {
            clientCore.DialogMgr.ins.open(this._tenPanel, false);
            this._tenPanel.showReward(treeInfos, this, this.waitOnePanelClose);
        }

        private async waitOnePanelClose(rwdInfo: pb.GodTree) {
            return new Promise((ok) => {
                this._oncePanel.on(Laya.Event.CLOSE, this, ok);
                this.getOne(rwdInfo)
            })
        }

        /**奖励总览 */
        private async preReward() {
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", 1);
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 12);
        }

        private onBuy(): void{
            this._buyPanel = this._buyPanel || new BuyPanel();
            this._buyPanel.show(2);
        }

        private onReward(): void{
            net.sendAndWait(new pb.cs_season_appoint_panel_get_cloth({module: 2,term: 2})).then((msg: pb.sc_season_appoint_panel_get_cloth)=>{
                alert.showReward(msg.items);
                this.updateReward();
            })
        }

        private onTry(index: number): void{
            switch(index){
                case 1:
                    alert.showCloth(2110352);
                    break;
                case 2:
                    alert.showCloth(2110350);
                    break;
                case 3:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: 1200017});
                    break;
                case 4:
                    alert.showCloth(2110351);
                    break;
            }
        }

        private updateReward(): void{
            this.ani1.stop();
            let hasTitle: boolean = clientCore.TitleManager.ins.checkHaveTitle(3500042);
            let has: boolean = _.filter([2110352,2110350,2110351],(element: number)=>{ return clientCore.SuitsInfo.checkHaveSuits(element); }).length > 0;
            this.boxTitle.visible = !hasTitle;
            this.boxTitle.mouseEnabled = has;
            this.descTxt.changeText(has ? '点击领取' : '集齐任意一套获赠');
            has && !hasTitle && this.ani1.play(0,true);
        }
    }
}