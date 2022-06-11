namespace nightRefine{
    /**
     * 符文tips
     */
    export class Tips{

        private _ui: ui.nightRefine.panel.TipsUI;

        show(data: {
            parent: Laya.Sprite,
            x: number,
            y: number,
            name: string,
            desc: string,
            path: string
        }): void{
            this._ui = this._ui || new ui.nightRefine.panel.TipsUI();
            this._ui.pos(data.x, data.y);
            this._ui.scale(1, 1);
            this._ui.imgIco.skin = data.path;
            this._ui.txDesc.text = data.desc;
            this._ui.txName.changeText(data.name);
            data.parent.addChild(this._ui);
            Laya.Tween.from(this._ui,{scaleX: 0,scaleY: 0},300,Laya.Ease.backOut);
        }

        removeSelf(): void{
            Laya.Tween.clearAll(this._ui);
            this._ui.removeSelf();
        }

        dispose(): void{
            Laya.Tween.clearAll(this._ui);
            this._ui?.destroy();
            this._ui = null;
        }
    }
}