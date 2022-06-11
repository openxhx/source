namespace secretPercious {

    enum Status {
        AUGUR,
        RESULT
    }

    /**
     * 隐藏的宝藏
     * secretPercious.SecretPerciousModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0115\【主活动】秘密的宝藏_connie.xlsx
     */
    export class SecretPerciousModule extends ui.secretPercious.SecretPerciousModuleUI {

        private _model: SecretPerciousModel;
        private _control: SecretPerciousControl;
        private _reward: RewardPanel;
        private _type: Status;

        init(): void {
            this.imgNv.visible = clientCore.LocalInfo.sex == 1;
            this.imgNan.visible = clientCore.LocalInfo.sex == 2;
            this.sign = clientCore.CManager.regSign(new SecretPerciousModel(), new SecretPerciousControl());
            this._model = clientCore.CManager.getModel(this.sign) as SecretPerciousModel;
            this._control = clientCore.CManager.getControl(this.sign) as SecretPerciousControl;
            this.imgHuabao.visible = clientCore.FlowerPetInfo.petType >= 1;
            let sult: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(this._model.clothId);
            this.clothTxt.changeText(`${sult.hasCnt}/${sult.clothes.length}`);
            this.addPreLoad(this._control.getInfo(this.sign));
            clientCore.Logger.sendLog('2021年1月15日活动', '【主活动】秘密的宝藏', '打开活动面板');
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnAugur, Laya.Event.CLICK, this, this.onAugur);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onGotoMap);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        onPreloadOver(): void {
            this.updateView(this._model.mapId == 0 ? Status.AUGUR : Status.RESULT);
        }

        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._reward = this._model = this._control = null;
            super.destroy();
        }

        /** 占卜*/
        private onAugur(): void {
            if (this._type != Status.AUGUR) return;
            if (this._model.canAugur == false) {
                alert.showFWords('今日占卜次数已经用完啦，明天再来吧~');
                return;
            }
            this._control.augur(new Laya.Handler(this, (msg: pb.sc_devine_secret_treasure) => {
                this._model.mapId = msg.mapId;
                this._model.isFeel ? this._model.feelTimes++ : this._model.times++;
                this._model.historyTimes++;
                this.updateView(Status.RESULT);
            }));
        }

        /** 前往指定地图*/
        private onGotoMap(): void {
            clientCore.Logger.sendLog('2021年1月15日活动', '【主活动】秘密的宝藏', '点击前往跳转');
            if (this._type != Status.RESULT) return;
            let map: number = this._model.mapId;
            this.destroy();
            clientCore.MapManager.enterWorldMap(map);
        }

        /** 服装预览*/
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.clothId);
        }

        /** 打开奖励*/
        private onReward(): void {
            clientCore.Logger.sendLog('2021年1月15日活动', '【主活动】秘密的宝藏', '打开累计占卜奖励弹窗');
            this._reward = this._reward || new RewardPanel();
            this._reward.show(this.sign);
        }

        /** 打开规则*/
        private onRule(): void {
            clientCore.Logger.sendLog('2021年1月15日活动', '【主活动】秘密的宝藏', '打开活动规则');
            alert.showRuleByID(1123);
        }

        private updateView(type: Status): void {
            this._type = type;
            this.txtTimes.changeText(`${this._model.realTimes}/${this._model.totalTimes}`);
            this.boxAugur.visible = type == Status.AUGUR;
            this.boxResult.visible = type == Status.RESULT;
            if (type == Status.AUGUR) {
                this.boxFeel.visible = this._model.isFeel;
            } else {
                this.txtPlace.changeText(xls.get(xls.map).get(this._model.mapId).name);
            }
        }
    }
}