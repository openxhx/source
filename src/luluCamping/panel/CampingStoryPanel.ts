namespace luluCamping {
    export class CampingStoryPanel extends ui.luluCamping.panel.LuluCampingStoryUI {
        private _idx: number;
        private _story: number;

        show(idx: number) {
            this._idx = idx;
            for (let j: number = 0; j <= 6; j++) {
                this["lock" + j].visible = j >= idx;
            }
            this.boxOpen.visible = false;
            if (idx <= 6) {
                this.boxTip.pos(this["lock" + idx].x + 44, this["lock" + idx].y - 15);
                // let name = ["露露", "露莎", "露娜"];
                // let flag1 = idx % 3;
                // let flag2 = Math.floor(idx / 3) + 1;
                // this.labCondition.text = `完成${flag2}次${name[flag1]}的任务`;
                this.boxTip.visible = true;
            } else {
                this.boxTip.visible = false;
            }
            clientCore.DialogMgr.ins.open(this, false);
        }

        /**打开书 */
        private openBook(idx: number) {
            if (this.boxOpen.visible) return;
            if (idx > this._idx) return;
            this._story = idx;
            this.imgTitle.skin = `luluCamping/di_${idx}_zhang.png`;
            this.boxOpen.visible = true;
        }

        /**关闭书 */
        private closeBook(e: Laya.Event) {
            if (this.boxOpen.visible) this.boxOpen.visible = false;
        }

        /**播放相关剧情 */
        private playAnimation() {
            let storyName: string = "初章";
            if (this._story == 7) {
                storyName = "终章";
            } else if (this._story > 0) {
                storyName = `第${this._story}章`;
            }
            clientCore.Logger.sendLog('2021年4月16日活动', '【主活动】露露的露营', '开始阅读露娜的故事书' + storyName);
            clientCore.AnimateMovieManager.showAnimateMovie(80517 + this._story, null, null);
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        addEventListeners() {
            BC.addEvent(this, this.bg, Laya.Event.CLICK, this, this.closeBook);
            for (let i: number = 0; i <= 7; i++) {
                BC.addEvent(this, this["book" + i], Laya.Event.CLICK, this, this.openBook, [i]);
            }
            BC.addEvent(this, this.btnRead, Laya.Event.CLICK, this, this.playAnimation);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}