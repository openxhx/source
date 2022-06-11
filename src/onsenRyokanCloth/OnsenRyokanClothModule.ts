namespace onsenRyokanCloth {
    /**
     * 温泉会馆更衣室
     * 2021.3.19
     * onsenRyokanCloth.OnsenRyokanClothModule
     */
    export class OnsenRyokanClothModule extends ui.onsenRyokanCloth.OnsenRyokanClothModuleUI {
        private curSelect: number;
        init() {
            let sex = clientCore.LocalInfo.sex == 1 ? "" : "n";
            for (let i: number = 1; i <= 4; i++) {
                this['type' + i].skin = `onsenRyokanCloth/${i}-2${sex}.png`;
            }
        }

        onPreloadOver() {
            this.selectCloth(1);
        }

        /**确认选择 */
        private sureSelect() {
            if (!this.curSelect) {
                alert.showFWords('请先选择一件泳衣~');
                return;
            }
            this.destroy();
            net.sendAndWait(new pb.cs_enter_hot_spring({ image: this.curSelect })).then((msg: pb.sc_enter_hot_spring) => {
                clientCore.Logger.sendLog('2021年3月19日活动', '【主活动】温泉会馆', '进入温泉');
                if (clientCore.ServerManager.curServerTime < msg.bTime) clientCore.ServerManager.curServerTime = msg.bTime;
                clientCore.OnsenRyokanManager.ins.selfBeginTime = msg.bTime;
                EventManager.event("SELF_IN_HOT");
            })
        }

        private selectCloth(index: number) {
            if (index == this.curSelect) return;
            let sex = clientCore.LocalInfo.sex == 1 ? "" : "n";
            for (let i: number = 1; i <= 4; i++) {
                this['type' + i].skin = `onsenRyokanCloth/${i}-${i == index ? 1 : 2}${sex}.png`;
            }
            this.curSelect = index;
            this.imgSelect.x = 153 + (index - 1) * 243;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureSelect);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this['type' + i], Laya.Event.CLICK, this, this.selectCloth, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}