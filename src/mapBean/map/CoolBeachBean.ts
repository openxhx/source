namespace mapBean {

    /**
     * 清凉沙滩秀
     * 
     */
    export class CoolBeachBean implements core.IMapBean {
        private _destroy: boolean = false;
        private _currShowId: number;
        private _mainUI: ui.coolBeachBean.CoolBeachBeanUI;
        private person: clientCore.Person2;
        async start() {
            await Promise.all([
                clientCore.ModuleManager.loadatlas('coolBeachBean')
            ]);
            if (!this._destroy) {
                this.init();
            }
        }

        init() {
            this._currShowId = 0;
            this._mainUI = new ui.coolBeachBean.CoolBeachBeanUI();
            this._mainUI.scale(0.5,0.5);
            this._mainUI.pos(1390, 917);
            clientCore.MapManager.curMap.upLayer.addChild(this._mainUI);
            this.createNextShower();
            BC.addEvent(this, this._mainUI.btnGo, Laya.Event.CLICK, this, this.goEvent);
            BC.addEvent(this, this._mainUI.btnRule, Laya.Event.CLICK, this, this.showRule);
        }

        private goEvent(e: Laya.Event) {
            clientCore.ModuleManager.open('coolBeach.CoolBeachModule');
        }

        private async showRule() {
            await res.load('unpack/coolBeach/di_help.png');
            let panel = new ui.coolBeach.RulePanelUI();
            BC.addOnceEvent(panel, panel.btnClose, Laya.Event.CLICK, clientCore.DialogMgr.ins, clientCore.DialogMgr.ins.close, [panel]);
            clientCore.DialogMgr.ins.open(panel);
        }

        /**请求刷新列表 */
        private updateList() {
            clientCore.CoolBeachImageManager.instance.getImages();
        }

        /**换下一批人 */
        private createNextShower() {
            this.person?.destroy();
            let info = clientCore.CoolBeachImageManager.instance.images[this._currShowId];
            if (!info) {
                let cloth = clientCore.LocalInfo.wearingClothIdArr;
                this.person = new clientCore.Person2({ curClothes: cloth, sex: clientCore.LocalInfo.sex, }, 'huxi');
                this._mainUI.labCool.text = '0';
                this._mainUI.txtContent.text = clientCore.CoolBeachImageManager.instance.txtArr[0];
            } else {
                let cloth = info.image.split('_').map((o) => { return parseInt(o) });
                this.person = new clientCore.Person2({ curClothes: cloth, sex: info.sexy }, 'huxi');
                this._mainUI.labCool.text = '' + info.cool;
                this._mainUI.txtContent.text = clientCore.CoolBeachImageManager.instance.txtArr[info.lines];
            }
            this.person.scale(0.5, 0.5);
            this._mainUI.showImage.addChild(this.person);
            this._currShowId++;
            if (this._currShowId == clientCore.CoolBeachImageManager.instance.images.length) {
                this._currShowId = 0;
            }
            Laya.timer.once(15000, this, this.createNextShower);
        }

        private destroyRole() {
            if (this._destroy)
                return;
            this.person.destroy();
        }

        touch(): void {
        }

        redPointChange(): void {
        }

        destroy(): void {
            BC.removeEvent(this);
            this._destroy = true;
            this.destroyRole();
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
    }
}