namespace anniversary2021 {
    /**
     * 2021花仙周年庆典
     * anniversary2021.Anniversary2021Module
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0319\【付费】小花仙·周年庆典_carrot.docx
     */
    export class Anniversary2021Module extends ui.anniversary2021.Anniversary2021ModuleUI {

        private _panelMap: IPanel[] = [];
        private _selectIndex: number;
        private _model: Anniversary2021Model;
        private _control: Anniversary2021Control;
        private _isFrist: boolean;

        init(data: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new Anniversary2021Model(), new Anniversary2021Control());
            this._model = clientCore.CManager.getModel(this.sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(this.sign) as Anniversary2021Control;
            this.addPreLoad(Promise.all([
                xls.load(xls.eventExchange),
                xls.load(xls.rouletteDraw),
                xls.load(xls.rouletteDrawCost),
                xls.load(xls.rechargeEvent),
                this._control.getInfo(this._model),
                this._control.getTwoInfo(this._model),
                this.checkFrist()
            ]));
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            for (let i: number = 1; i <= 5; i++) {
                BC.addEvent(this, this['cp_' + i], Laya.Event.CLICK, this, this.onClick, [i]);
            }
            EventManager.on("ANNIVERSARY2021_SHOW_TIME", this, this.showTime);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        popupOver(): void {
            this.onClick(this._data || 1);
            if(this._isFrist){
                clientCore.MedalManager.setMedal([{id: MedalConst.ANNIVERSARY_OPEN,value: 1}]);
                alert.showSmall('亲爱的小花仙，我们已将你口袋里剩余的蔷薇以及夜之昙按照1：1的比例转换为江南银币，快去集齐最新的”醉江南“套装吧~');
            }
        }
        destroy(): void {
            _.forEach(this._panelMap, (element: IPanel) => { element?.dispose(); })
            this._panelMap.length = 0;
            this._panelMap = null;
            this._model = this._control = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        private checkFrist(): Promise<void>{
            return clientCore.MedalManager.getMedal([MedalConst.ANNIVERSARY_OPEN]).then((msg: pb.ICommonData[])=>{
                this._isFrist = msg[0].value == 0;
            })
        }

        private onRule(): void {
            alert.showRuleByID(this._panelMap[this._selectIndex - 1].ruleId);

            // alert.showRuleByID(this._selectIndex + 1136);
        }

        private onClick(index: number): void {
            //前往连充福利
            if(index == 5){
                clientCore.ToolTip.gotoMod(53);
                return;
            }

            if (this._selectIndex == index) return;
            if (this._selectIndex) {
                this['cp_' + this._selectIndex].index = 0;
                this._panelMap[this._selectIndex - 1].hide();
            }
            this['cp_' + index].index = 1;
            this._selectIndex = index;
            //界面操作
            let pos: number = index - 1;
            let panel: IPanel = this._panelMap[pos];
            if (!panel) {
                switch (index) {
                    case 1:
                        panel = new ColorfulPanel();
                        break;
                    case 2:
                        panel = new RosePanel();
                        break;
                    case 3:
                        panel = new FlowerPetPanel();
                        break;
                    case 4:
                        panel = new SixBuyPanel();
                        break;
                }
                panel.init(this.sign);
                this._panelMap[pos] = panel;
            }
            panel.show(this.boxView);
        }

        private showTime(time: string) {
            this.timeTxt.changeText(time);
        }
    }
}