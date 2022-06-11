namespace hideGiftGame {
    /**
     * 12.17
     * 圣诞爱德文老人
     * hideGiftGame.GameOverPanel
     */
    export class GameOverPanel extends ui.hideGiftGame.panel.GameOverPanelUI {
        private num: number;
        init(d: number) {
            this.num = d;
            net.sendAndWait(new pb.cs_christmas_old_edwin_game({ flag: d })).then((item: pb.sc_christmas_old_edwin_game) => {
                alert.showReward(item.item);
            });
        }
        onPreloadOver() {
            if (this.num == 1) {
                this.imgSpeak.skin = 'hideGiftGame/qipao1.png';
                this.labNum.skin = "hideGiftGame/x10.png";
            }
            else {
                this.imgSpeak.skin = 'hideGiftGame/qipao0.png';
                this.labNum.skin = "hideGiftGame/x5.png";
            }

        }
        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onNext);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            
        }

        private onClose(){
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("happinessFlavour.HappinessFlavourModule", 3);
        }

        private onNext() {
            clientCore.Logger.sendLog('2021年12月17日活动', '【活动】圣诞爱德文老人', '点击寻找下一个雪堆');
            let levelNum = Math.floor(Math.random() * 6);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("hideGiftGame.HideGiftGameModule", levelNum);
        }
    }
}