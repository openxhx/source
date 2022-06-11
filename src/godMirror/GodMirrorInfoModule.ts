namespace godMirror {
    /**
     * 花神之镜单个信息面板 参数 uid_type 的字符串
     * godMirror.GodMirrorInfoModule
     */
    export class GodMirrorInfoModule extends ui.godMirror.GodMirrorInfoModuleUI {
        private _imageInfo: pb.IMirrorRankInfo;
        init(d: any) {
            super.init(d);
            let uid = parseInt(d.split('_')[0]);
            let type = parseInt(d.split('_')[1]);
            this.addPreLoad(xls.load(xls.godMirror));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_flora_of_mirror_user_info({ uid: uid })).then((data: pb.sc_get_flora_of_mirror_user_info) => {
                this._imageInfo = _.find(data.info, o => o.type == type);
            }));
        }

        onPreloadOver() {
            setGodMirrorRender(this.mcView, this._imageInfo);
        }

        private async onLeftClick() {
            this._imageInfo = await GodMirrorModel.getSupport(this._imageInfo);
        }

        private async onRightClick() {
            this._imageInfo = await GodMirrorModel.likeOrGetReward(this._imageInfo);
            setGodMirrorRender(this.mcView, this._imageInfo);
        }

        private goMirror() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('godMirror.GodMirrorModule');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.mcView.btnLeft, Laya.Event.CLICK, this, this.onLeftClick);
            BC.addEvent(this, this.mcView.btnRight, Laya.Event.CLICK, this, this.onRightClick);
            BC.addEvent(this, this.btnGoMirror, Laya.Event.CLICK, this, this.goMirror);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            destoryRender(this.mcView);
            this._imageInfo = null;
        }
    }
}