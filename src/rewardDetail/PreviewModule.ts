namespace rewardDetail {
    /**
     * rewardDetail.PreviewModule
     * 套装预览/花精灵王预览模块/
     * 参数：suitId或花精灵id或花精灵id
     * 增加支持部件预览
     */
    export class PreviewModule extends core.BaseModule {

        private _clothDetailPanel: ClothDetailPanel;
        private _fairyDetailPanel: FairyDetailPanel;
        init(d: any) {
            super.init(d);
        }

        popupOver() {
            this.fullScreen = true;
            if (xls.get(xls.suits).has(this._data)) {
                this._clothDetailPanel = new ClothDetailPanel();
                this._clothDetailPanel.once(Laya.Event.CLOSE, this, this.destroy);
                this._clothDetailPanel.init();
                this._clothDetailPanel.showCloth(this._data, false);
                clientCore.LayerManager.upMainLayer.addChild(this._clothDetailPanel);
                this._clothDetailPanel.showPanel();
            } else if (xls.get(xls.itemCloth).has(this._data) || xls.get(xls.itemCloth).has(this._data[0])) {
                this._clothDetailPanel = new ClothDetailPanel();
                this._clothDetailPanel.once(Laya.Event.CLOSE, this, this.destroy);
                this._clothDetailPanel.init();
                this._clothDetailPanel.showOneCloth(this._data, false);
                clientCore.LayerManager.upMainLayer.addChild(this._clothDetailPanel);
                this._clothDetailPanel.showPanel();
            }
            else {
                this._fairyDetailPanel = this._fairyDetailPanel || new FairyDetailPanel();
                this._fairyDetailPanel.once(Laya.Event.CLOSE, this, this.destroy);
                this._fairyDetailPanel.show(this._data);
            }
        }

        destroy() {
            this.fullScreen = false;
            super.destroy();
            this._clothDetailPanel?.destroy()
            this._fairyDetailPanel?.destroy();
            this._clothDetailPanel = null;
            this._fairyDetailPanel = null;
        }
    }
}