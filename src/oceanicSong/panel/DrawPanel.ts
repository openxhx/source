namespace oceanicSong{

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
    export class DreamPanel extends ui.oceanicSong.panel.DrawPanelUI implements IPanel{

        private readonly MONEY_ID: number = 9900185;
        private readonly DRAW_ID: number = 11;
        private readonly CLOTHS: number[] = [2110396,2110394,2110395,2110397];

        private _oncePanel: OneRewardPanel;
        private _tenPanel: TenRewardPanel;
        private _buyPanel: BuyPanel;
        private _loading: boolean;

        ruleId: number = 1179;
        
        onAwake(): void{
            this.pos(26,84);
            this.ani1.index = clientCore.LocalInfo.sex == 1 ? 0 : 1;
            this.addEvents();
            this.updateReward();

            this._oncePanel = new OneRewardPanel();
            this._tenPanel = new TenRewardPanel();
        }
        show(parent: Laya.Sprite): void{
            EventManager.event(EventType.UPDATE_TIME, '活动时间:6月11日~7月8日');
            clientCore.UIManager.setMoneyIds([this.MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
            clientCore.Logger.sendLog('2021年6月11日活动', '【付费】海洋之歌', '打开海底传说面板');
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
            BC.addEvent(this,this.boxReward,Laya.Event.CLICK,this,this.onReward);
            BC.addEvent(this,this.buyTry,Laya.Event.CLICK,this,this.onTry,[0]);
            BC.addEvent(this,this.buyTry_1,Laya.Event.CLICK,this,this.onTry,[1]);
        }
        private removeEvents(): void{

        }

        private onDraw(times: number) {
            if(this._loading)return;
            if(!clientCore.ItemsInfo.checkItemsEnough([{itemID: this.MONEY_ID,itemNum: (times == 1 ? 1 : 10)}])){
                alert.showFWords('物品数量不足~');
                return;
            }
            this._loading = true;
            net.sendAndWait(new pb.cs_common_activity_draw({moduleId: this.DRAW_ID,times: times})).then(
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
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", this.DRAW_ID);
        }

        /**概率公示 */
        private onProbClick() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 19);
        }

        private onBuy(): void{
            this._buyPanel = this._buyPanel || new BuyPanel();
            this._buyPanel.show(1);
        }

        private onReward(): void{
            if(_.filter(this.CLOTHS,(element: number)=>{ return clientCore.SuitsInfo.checkHaveSuits(element); }).length == 0)return;
            net.sendAndWait(new pb.cs_ocean_song_get_draw_reward({period: 1})).then((msg: pb.sc_season_appoint_panel_get_cloth)=>{
                alert.showReward(msg.items);
                this.updateReward();
            })
        }

        private onTry(index: number): void{
            switch(index){
                case 0:
                    alert.showCloth(2110396);
                    break;
                case 1:
                    alert.showCloth(2110394);
                    break;
            }
        }

        private updateReward(): void{
            this.ani2.stop();
            let hasTitle: boolean = clientCore.TitleManager.ins.checkHaveTitle(3500052);
            let has: boolean = _.filter(this.CLOTHS,(element: number)=>{ return clientCore.SuitsInfo.checkHaveSuits(element); }).length > 0;
            this.boxReward.visible = !hasTitle;
            this.boxReward.mouseEnabled = has;
            this.descTxt.changeText(has ? '点击领取' : '集齐任意一套获赠');
            has && !hasTitle && this.ani2.play(0,true);
        }
    }
}