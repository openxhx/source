namespace answerReward {
    /**
     * 心有灵夕-诗文奖励
     */
    export class AnswerExtRewardModule extends ui.answerReward.AnswerExtRewardModuleUI {
        constructor() {
            super();
        }

        init(d: number): void {
            this._data = d;
            this.imgMan.visible = clientCore.LocalInfo.sex == 2;
            this.imgWoman.visible = clientCore.LocalInfo.sex == 1;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        onPreloadOver(): void {
            this.imgPoem.skin = `answerReward/${this._data}.png`;
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110467);
        }

        destroy() {
            EventManager.event(globalEvent.CLOSE_ANWEREXTREWARD_MODULE, this._data);//传递结算数据
            super.destroy();
        }
    }
}