namespace anniversary2021 {
    /**
     * 花宝赠礼
     */
    export class FlowerPetPanel extends ui.anniversary2021.panel.FlowerPetPanelUI implements IPanel {
        private _model: Anniversary2021Model;
        private _control: Anniversary2021Control;
        private _rewardPanel: RewardPanel;
        ruleId: number = 1140;
        init(sign: number): void {
            this.imgNan.visible = this.imgBoy.visible = clientCore.LocalInfo.sex == 2;
            this.imgNv.visible = this.imgGril.visible = clientCore.LocalInfo.sex == 1;
            this.pos(131, 135);
            this.addEvents();
            this._model = clientCore.CManager.getModel(sign) as Anniversary2021Model;
            this._control = clientCore.CManager.getControl(sign) as Anniversary2021Control;
            for (let i: number = 1; i <= 3; i++) {
                this.updateReward(i);
                BC.addEvent(this, this['btnGet_' + i], Laya.Event.CLICK, this, this.onReward, [i]);
                BC.addEvent(this, this['btn_' + i], Laya.Event.CLICK, this, this.onShow, [i]);
            }
        }
        show(parent: Laya.Sprite): void {
            clientCore.Logger.sendLog('2021年3月19日活动', '【付费】小花仙周年庆典', '打开花宝赠礼面板');
            EventManager.event("ANNIVERSARY2021_SHOW_TIME", "活动时间：3月19~4月15日");
            parent.addChild(this);
        }
        hide(): void {
            this.removeSelf();
        }
        dispose(): void {
            this._rewardPanel = null;
            this._model = this._control = null;
            BC.removeEvent(this);
        }
        private addEvents(): void {
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.gotoFlowerPet);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
        }
        private updateReward(index: number): void {
            let hasGet: boolean = this._model.checkPet(index);
            let type: number = clientCore.FlowerPetInfo.petType;
            this['imgHas_' + index].visible = hasGet;
            this['btnGet_' + index].visible = !hasGet && type >= [0, 1, 3][index - 1];
        }
        private gotoFlowerPet(): void {
            clientCore.Logger.sendLog('2021年3月19日活动', '【付费】小花仙周年庆典', '点击充值奇妙花宝按钮');
            clientCore.ToolTip.gotoMod(52);
        }
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2100294);
        }
        private onReward(index: number): void {
            if (this._model?.checkPet(index)) return;
            this._control?.getPetReward(index, new Laya.Handler(this, () => {
                this._model.petRewardIdx = util.setBit(this._model.petRewardIdx, index, 1);
                this.updateReward(index);
            }))
        }
        private onShow(index: number): void {
            let base: number = clientCore.LocalInfo.sex == 1 ? 0 : 3;
            this._rewardPanel = this._rewardPanel || new RewardPanel();
            this._rewardPanel.show(clientCore.GlobalConfig.config['babyReward' + (base + index)]);
        }
    }
}