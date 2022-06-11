
namespace formation {
    export class PraySkillDragControl {
        private _ui: Laya.Sprite & {
            item0: ui.formation.render.PraySkillItemUI,
            item1: ui.formation.render.PraySkillItemUI,
            item2: ui.formation.render.PraySkillItemUI
        }
        private _clickFun: (idx: number, id: number) => any;
        private _icon: Laya.Image;
        private _downMark: number[];

        constructor(
            ui: Laya.Sprite & {
                item0: ui.formation.render.PraySkillItemUI,
                item1: ui.formation.render.PraySkillItemUI,
                item2: ui.formation.render.PraySkillItemUI
            },
            clickFun?: (idx: number, id: number) => any
        ) {
            this._ui = ui;
            this._clickFun = clickFun;
            this.setSkillIcon();
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this._ui['item' + i], Laya.Event.CLICK, this, this.onSkillClick, [i]);
                BC.addEvent(this, this._ui['item' + i], Laya.Event.MOUSE_DOWN, this, this.onMouseDown, [i]);
                BC.addEvent(this, this._ui, Laya.Event.MOUSE_UP, this, this.onStopDrag);
                EventManager.on(globalEvent.EV_SKILL_INFO_UPDATE, this, this.setSkillIcon);
            }
        }

        private onMouseDown(idx) {
            if (clientCore.FormationControl.instance.praySkillArr[idx]) {
                this._downMark = [this._ui.mouseX, this._ui.mouseY, idx];
                BC.addEvent(this, this._ui, Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
            }
        }

        private onMouseMove() {
            if (this._downMark && this._downMark.length == 3) {
                let dis = Math.abs(this._downMark[0] - this._ui.mouseX) + Math.abs(this._downMark[1] - this._ui.mouseY);
                //鼠标在一个icon上按下 切移动一点距离 才开始拖动
                if (dis > 30) {
                    this.onStartDrag(this._downMark[2]);
                    BC.removeEvent(this, this._ui, Laya.Event.MOUSE_MOVE);
                    this._downMark = [];
                }
            }
        }

        private onStartDrag(idx: number) {
            if (!this._icon) {
                this._icon = new Laya.Image(pathConfig.getPraySkillIcon(clientCore.FormationControl.instance.praySkillArr[idx]));
                this._icon.anchorX = this._icon.anchorY = 0.5;
            }
            this._icon.dataSource = idx;
            this._icon.pos(this._ui.mouseX, this._ui.mouseY);
            this._ui.addChild(this._icon);
            this._icon.startDrag();
        }

        private onStopDrag() {
            this._downMark = [];
            if (this._icon && this._icon.parent) {
                this._icon.stopDrag();
                this._icon.removeSelf();
                let pos1 = new Laya.Point(this._icon.x, this._icon.y);
                let currIdx = this._icon.dataSource;
                let targetIdx = -1;
                for (let i = 0; i < 3; i++) {
                    let item = this._ui['item' + i];
                    let X = item.x + item.width / 2 - pos1.x;
                    let Y = item.y + item.height / 2 - pos1.y;
                    if (X * X + Y * Y < 2500) {
                        targetIdx = i;
                        break;
                    }
                }
                let skillArr = clientCore.FormationControl.instance.praySkillArr.slice();
                if (targetIdx == -1) {
                    this.setSkillIcon();
                }
                else {
                    //交换
                    let tmp = skillArr[targetIdx];
                    skillArr[targetIdx] = skillArr[currIdx];
                    skillArr[currIdx] = tmp;
                    clientCore.FormationControl.instance.setSkillArray(skillArr);
                }
            }
        }

        private onSkillClick(idx) {
            if (this._clickFun)
                this._clickFun.call(this._ui, idx, clientCore.FormationControl.instance.praySkillArr[idx]);
        }

        private setSkillIcon() {
            for (let i = 0; i < 3; i++) {
                let skillId = clientCore.FormationControl.instance.praySkillArr[i];
                this._ui['item' + i].icon.skin = skillId == 0 ? '' : pathConfig.getPraySkillIcon(skillId);
            }
        }

        destory() {
            BC.removeEvent(this);
            this._clickFun = null;
            this._ui = null;
            if (this._icon)
                this._icon.destroy()
            this._icon = null;
            EventManager.off(globalEvent.EV_SKILL_INFO_UPDATE, this, this.setSkillIcon);
        }
    }
}