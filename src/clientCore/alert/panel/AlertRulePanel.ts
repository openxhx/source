namespace alert {
    const MIN_H = 350;
    const MAX_H = 570;
    const CONTAN_DIFF = 170;//整个框体与文本域差值
    export class AlertRulePanel extends ui.alert.panel.RulePanelUI {
        private _renderArr: ui.alert.render.RuleTxtRenderUI[];

        constructor() {
            super();
            this.panel.vScrollBarSkin = null;
        }

        show(txtArr: string[], oriTxtArr: string[]) {
            clientCore.DialogMgr.ins.open(this);
            this._renderArr = [];
            let totelH = 5;
            for (let i = 0; i < txtArr.length; i++) {
                let s = txtArr[i];
                let render = new ui.alert.render.RuleTxtRenderUI();
                render.txt.style.font = '汉仪中圆简';
                render.txt.style.wordWrap = true;
                render.txt.style.width = 670;
                render.txt.style.fontSize = 25;
                render.txt.style.leading = 5;
                render.txt.innerHTML = s;
                render.y = totelH;
                render.txtLable.text = oriTxtArr[i];
                this.panel.addChild(render);
                this._renderArr.push(render);
                totelH += (render.txtLable.height + 30);
            }
            this.boxCon.height = _.clamp(totelH + CONTAN_DIFF, MIN_H, MAX_H);
            //超过高度就显示滚动条
            this.boxScroll.visible = totelH > this.panel.height;
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onScorllChange() {
            let scroll = this.panel.vScrollBar;
            this.imgBar.y = (this.imgBarBg.height - this.imgBar.height) * scroll.value / scroll.max;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.panel.vScrollBar, Laya.Event.CHANGE, this, this.onScorllChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            if (this._renderArr)
                for (const o of this._renderArr) {
                    o.destroy();
                }
            this._renderArr = [];
            super.destroy();
        }
    }
}