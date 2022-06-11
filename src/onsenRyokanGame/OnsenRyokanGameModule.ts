namespace onsenRyokanGame {
    /**
     * 温泉会馆小游戏
     * 2021.3.19
     * onsenRyokanGame.OnsenRyokanGameModule
     */
    export class OnsenRyokanGameModule extends ui.onsenRyokanGame.OnsenRyokanGameModuleUI {
        private curPosition: number[];
        private canSelect: boolean;
        private moveTimes: number = 10;
        private ani: clientCore.Bone;
        init() {
            this.curPosition = [1, 2, 3];
            this.boxDown.visible = false;
            this.boxUp.visible = true;
            this.labMove.visible = true;
            this.labSelect.visible = false;
            this.canSelect = false;
            this.moveTimes = 10;
        }

        async onPreloadOver() {
            await util.TimeUtil.awaitTime(1000);
            this.ani = clientCore.BoneMgr.ins.play("res/animate/onsenRyokan/cupflower.sk", "animation", false, this);
            this.ani.pos(-200, 761);
            this.boxUp.visible = false;
            this.ani.once(Laya.Event.COMPLETE, this, () => {
                this.ani.dispose();
                this.animationOver();
            })
        }

        private animationOver() {
            this.boxDown.visible = true;
            this.boxUp.visible = false;
            this.imgHua.visible = false;
            this.move();
        }

        private async move() {
            if (this.moveTimes <= 0) {
                this.labMove.visible = false;
                this.labSelect.visible = true;
                this.canSelect = true;
                this.imgHua.x = this.img_down_2.x + 43;
                this.imgHua.visible = true;
                return;
            }
            this.moveTimes--;
            let idx = Math.random() < 0.5 ? 0 : 1;
            let tempPos = this.curPosition.slice();
            let temp = tempPos[idx];
            tempPos[idx] = tempPos[idx + 1];
            tempPos[idx + 1] = temp;
            Laya.Tween.to(this["img_down_" + tempPos[idx + 1]], { x: (idx + 1) * 290 }, 200);
            Laya.Tween.to(this["img_down_" + tempPos[idx]], { x: idx * 290 }, 200);
            await util.TimeUtil.awaitTime(200);
            this.curPosition = tempPos;
            this.move();
        }

        private select(index: number) {
            if (!this.canSelect) return;
            this.canSelect = false;
            this['img_down_' + index].visible = false;
            let result = index == 2 ? 1 : 0;
            net.sendAndWait(new pb.cs_select_hot_spring_cup({ res: result })).then((msg: pb.sc_select_hot_spring_cup) => {
                alert.showReward(msg.items, "", { callBack: { caller: this, funArr: [this.destroy] } });
                clientCore.OnsenRyokanManager.ins.panTimes = msg.num;
                EventManager.event("ONSENRYOKAN_GAME_OVER", msg.bTime);
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this['img_down_' + i], Laya.Event.CLICK, this, this.select, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}