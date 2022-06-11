namespace clientCore {
    /**
     * dialog管理者 - 将弹窗加入模块
     */
    export class DialogMgr {

        private dialogMap: core.BaseDialog[] = [];

        constructor() {
        }

        /**
         * 打开弹窗吧
         * @param dialog 
         */
        public async open(dialog: core.BaseDialog, needAni: boolean = true): Promise<void> {
            if (dialog) {
                dialog.isDialog = true;
                if (dialog.preLength > 0) { //有预加载项目
                    LoadingManager.showSmall();
                    await dialog.waitPreLoad();
                    LoadingManager.hideSmall();
                }
                dialog['_closed'] = false;
                this.dialogMap.push(dialog);
                dialog.addEventListeners();
                dialog.initOver();
                LayerManager.mainLayer.addChild(dialog);
                EventManager.event(globalEvent.CHECK_MASK);
                dialog.anchorY = dialog.anchorX = 0.5;
                dialog.rotation = clientCore.LayerManager.moshi == clientCore.MODE.HENG ? 0 : -90;
                dialog.scale(1, 1);
                dialog.pos(Laya.stage.width / 2 - LayerManager.OFFSET, Laya.stage.height / 2);
                needAni ? this.popupEffect(dialog) : dialog.popupOver();
                core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
            }
        }

        /**
         * 关闭弹窗吧
         * @param dialog 
         */
        public close(dialog: core.BaseDialog, needAni: boolean = true): void {
            needAni ? this.closeEffect(dialog) : this.doClose(dialog);
        }

        public closeAllDialog() {
            let len: number = this.dialogMap.length;
            for (let i: number = 0; i < len; i++) {
                let child: core.BaseModule = this.dialogMap[i];
                child && child.destroy();
            }
            this.dialogMap.length = 0;
            EventManager.event(globalEvent.CHECK_MASK);
        }

        public get curShowPanelNum(): number {
            return this.dialogMap.length;
        }

        private popupEffect(dialog: core.BaseDialog): void {
            let x: number = Laya.stage.width / 2 - LayerManager.OFFSET;
            let y: number = Laya.stage.height / 2;
            Laya.Tween.from(dialog, { x: x, y: y, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.backOut, Laya.Handler.create(dialog, dialog.popupOver));
        }

        private closeEffect(dialog: core.BaseDialog): void {
            let x: number = Laya.stage.width / 2 - LayerManager.OFFSET;
            let y: number = Laya.stage.height / 2;
            Laya.Tween.to(dialog, { x: x, y: y, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.strongOut, Laya.Handler.create(this, this.doClose, [dialog]));
        }

        private doClose(dialog: core.BaseDialog): void {
            let len: number = this.dialogMap.length;
            for (let i: number = len - 1; i > -1; i--) {
                if (this.dialogMap[i] == dialog) {
                    this.dialogMap.splice(i, 1);
                    break;
                }
            }
            dialog.destroy();
            EventManager.event(globalEvent.CHECK_MASK);
        }

        private static _ins: DialogMgr;
        public static get ins(): DialogMgr {
            return this._ins || (this._ins = new DialogMgr());
        }
    }
}