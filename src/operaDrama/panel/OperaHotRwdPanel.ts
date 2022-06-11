namespace operaDrama {
    export class OperaHotRwdPanel extends ui.operaDrama.panel.OperaHotRewardPanelUI {
        private _rwdArr: ui.operaDrama.render.OperaHotRwdRenderUI[];
        private _hotPoint = [20000, 50000, 90000];
        constructor() {
            super();
            this._rwdArr = [];
            let total = _.last(this._hotPoint);
            for (let i = 0; i < 3; i++) {
                let rwd = new ui.operaDrama.render.OperaHotRwdRenderUI();
                rwd.imgIcon.skin = `operaDrama/hotIcon_${i == 2 ? 2 : 0}.png`;
                rwd.imgTitle.skin = `operaDrama/hotTitle_${i}.png`;
                rwd.x = this._hotPoint[i] / total * this.imgProgressPg.width;
                this.spCon.addChild(rwd);
                this._rwdArr.push(rwd)
                BC.addEvent(this, rwd.imgIcon, Laya.Event.CLICK, this, this.onIconClick, [i + 1]);
                BC.addEvent(this, rwd.btnGet, Laya.Event.CLICK, this, this.onGetRwd, [i + 1]);
            }
            BC.addEvent(this, this.imgBg, Laya.Event.CLICK, this, this.removeSelf);
        }

        show() {
            let total = _.last(this._hotPoint);
            let nowHot = Math.min(total, clientCore.OperaManager.instance.hot);
            for (let i = 0; i < 3; i++) {
                let rwd = this._rwdArr[i];
                let haveGet = clientCore.OperaManager.instance.hasRewardCliamed(i + 1);
                let canGet = nowHot >= this._hotPoint[i];
                rwd.imgGet.visible = haveGet;
                rwd.btnGet.visible = !haveGet;
                rwd.btnGet.disabled = !canGet;
            }
            this.imgProgess.width = (1 - nowHot / total) * this.imgProgressPg.width;
        }

        private onGetRwd(id: number) {
            clientCore.OperaManager.instance.getRewardByIdx(id).then(() => {
                this.show();
            })
        }

        private onIconClick(id: number) {
            let rwdInfo = xls.get(xls.dramaAward).get(id);
            let rwd = clientCore.LocalInfo.sex == 1 ? rwdInfo.femaleAward : rwdInfo.maleAward;
            clientCore.ModuleManager.open('panelCommon.RewardShowModule', { reward: clientCore.GoodsInfo.createArray(rwd) });
        }

        destroy() {
            super.destroy();
            this._rwdArr?.forEach((o) => { o.destroy() })
        }
    }
}