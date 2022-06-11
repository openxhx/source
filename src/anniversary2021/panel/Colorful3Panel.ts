namespace anniversary2021 {
    /**
     * 缤纷色彩-古灵精怪
     */
    export class Colorful3Panel extends ui.anniversary2021.panel.Colorful3PanelUI implements IPanel {
        
        private readonly BG_SHOW_ID: number = 1100068;
        private readonly SUIT_1: number = 2110328;
        private readonly SUIT_2: number = 2110329;

        private _model: Anniversary2021Model;
        private _control: Anniversary2021Control;
        private _rewardPanel: RewardPanel;
        ruleId:number = 1137;

        init(sign: number): void {
            this.pos(0, 0);
            this.addEvents();
            this._model = clientCore.CManager.getModel(sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(sign) as Anniversary2021Control;

            this.updateReward();
            for (let i: number = 1; i < 3; i++) {
                this['nan_' + i].visible = clientCore.LocalInfo.sex == 2;
                this['nv_' + i].visible = clientCore.LocalInfo.sex == 1;
                this.updateCloth(i);
            }
            for(let i:number = 0; i<3; i++){
                this.setPriveView([2550,2553,2556][i],i + 1);
            }
        }

        show(parent: Laya.Sprite): void {
            clientCore.Logger.sendLog('2021年4月2日活动', '【付费】小花仙周年庆典第三期', '打开古灵精怪面板');
            EventManager.event("ANNIVERSARY2021_SHOW_TIME", "活动时间：4月2日~4月15日");
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            parent.addChild(this);
        }

        hide(): void {
            clientCore.UIManager.releaseCoinBox();
            this.removeSelf();
        }

        dispose(): void {
            this._model = this._control = this._rewardPanel = null;
            BC.removeEvent(this);
        }

        private addEvents(): void {
            for (let i: number = 1; i < 4; i++) {
                BC.addEvent(this, this['try_' + i], Laya.Event.CLICK, this, this.onTry, [i]);
                BC.addEvent(this, this['buy_' + i], Laya.Event.CLICK, this, this.onBuy, [i]);
            }
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onGet);
            BC.addEvent(this, this.btnOther, Laya.Event.CLICK, this, this.onReward);
        }

        private setPriveView(base: number,index: number): void{
            if(!this['box_' + index].visible)return;
            let priveView: ui.anniversary2021.item.PriceItemUI = this['price_' + index];
            let type: number = clientCore.FlowerPetInfo.petType;
            priveView.imgGou.y = type == 3 ? 62 : (type == 0 ? 2 : 32);
            for(let i:number=0; i<3; i++){
                let id: number = base + i;
                let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(id);
                priveView['price_' + (i + 1)].changeText(cfg.cost[0].v2 + '');
            }
        }

        private updateReward(): void {
            let has: boolean = clientCore.ItemsInfo.checkHaveItem(this.BG_SHOW_ID);
            let hasCloth_1: boolean = clientCore.SuitsInfo.checkHaveSuits(this.SUIT_1);
            let hasCloth_2: boolean = clientCore.SuitsInfo.checkHaveSuits(this.SUIT_2);
            this.btnGet.visible = hasCloth_1 && hasCloth_2 && !has;
            this.box_3.visible = !has && !hasCloth_1 && !hasCloth_2;
        }

        private updateCloth(index: number): void {
            let has: boolean = clientCore.SuitsInfo.checkHaveSuits(this['SUIT_' + index]);
            this['box_' + index].visible = !has;
            this['imgHas_' + index].visible = has;
        }

        private onTry(index: number): void {
            switch (index) {
                case 1:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_1);
                    break;
                case 2:
                    clientCore.ModuleManager.open('previewBG.PreviewBGModule', { id: this.BG_SHOW_ID, condition: '妖灵祭祀舞台' });
                    break;
                case 3:
                    clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.SUIT_2);
                    break;
                default:
                    break;
            }
        }

        /** 奖励领取*/
        private onGet(): void {
            this._control?.getTree(new Laya.Handler(this, () => {
                this.btnGet.visible = false;
            }));
        }

        private onBuy(index: number): void {
            let type: number = clientCore.FlowerPetInfo.petType;
            let id: number = [2550,2553,2556][index - 1] + (type == 3 ? 2 : (type == 0 ? 0 : 1));
            let cfg: xls.eventExchange = xls.get(xls.eventExchange).get(id);        
            alert.showSmall(`是否确认花费灵豆x${cfg.cost[0].v2}购买？`, {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        this._control?.buy(cfg.id,this._model.ACTIVITY_ID,new Laya.Handler(this,()=>{
                            this.updateReward();
                            if(index != 3){
                                this.updateCloth(index);
                            }else{
                                this.updateCloth(1);
                                this.updateCloth(2);
                            }
                        }));
                    }]
                }
            })
        }

        /** 额外奖励展示*/
        private onReward(): void{
            let rewards: number[] = clientCore.LocalInfo.sex == 1 ? [140921,141767,141769] : [140933,141768,141770];
            this._rewardPanel = this._rewardPanel || new RewardPanel();
            this._rewardPanel.show(_.map(rewards,(element: number)=>{ return {v1: element,v2: 1}}));
        }
    }
}