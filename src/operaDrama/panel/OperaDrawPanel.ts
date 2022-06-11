namespace operaDrama {
    const SCLAE_TPYE = [clientCore.CLOTH_TYPE.Wing, clientCore.CLOTH_TYPE.Cloth, clientCore.CLOTH_TYPE.Skirt];
    const COIN_ID = 9900075;
    export class OperaDrawPanel extends ui.operaDrama.panel.OperaDrawPanelUI {
        private _boxArr: ui.operaDrama.render.OperaDrawRenderUI[];
        private _nowIdx: number;
        private _rewardPanel: OperaDrawAlertPanel;
        constructor() {
            super();
            BC.addEvent(this, this.btnOne, Laya.Event.CLICK, this, this.onDraw, [1]);
            BC.addEvent(this, this.btnTen, Laya.Event.CLICK, this, this.onDraw, [10]);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnRwd, Laya.Event.CLICK, this, this.onRwdOpen);
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.onProb);
            this._boxArr = [];
            for (let i = 0; i < this.spCon.numChildren; i++) {
                this._boxArr.push(this.spCon.getChildAt(i) as ui.operaDrama.render.OperaDrawRenderUI);
            }
            this.createItems();
            this.updateItems();
            this.imgSuit.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/operaDrama/nv.png' : 'unpack/operaDrama/nan.png'
        }

        show() {
            this._nowIdx = 0;
            clientCore.Logger.sendLog('2020年9月30日活动', '【主活动】中秋话剧面板和剧情', '打开幸运抽奖面板');
        }

        private onProb() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 201);
        }

        private onRwdOpen() {
            this._rewardPanel = this._rewardPanel || new OperaDrawAlertPanel();
            this._rewardPanel.show();
        }

        private onTry() {
            alert.showPreviewModule(2100230)
        }

        private createItems() {
            let rewardArr = _.filter(xls.get(xls.godTree).getValues(), o => o.module == 201);
            for (let i = 0; i < this._boxArr.length; i++) {
                let box = this._boxArr[i];
                let reward = clientCore.LocalInfo.sex == 1 ? rewardArr[i].item : rewardArr[i].itemMale;
                let isCloth = xls.get(xls.itemCloth).has(reward.v1);
                box.dataSource = reward.v1;
                box.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
                box.num.visible = !isCloth;
                box.scale(0.7, 0.7);
                box.num.value = reward.v2.toString();
                if (isCloth) {
                    let type = clientCore.ClothData.getCloth(reward.v1).clothType;
                    if (SCLAE_TPYE.indexOf(type) > -1)
                        box.scale(1, 1);
                }
            }
        }

        private async onDraw(times: number) {
            if (clientCore.ItemsInfo.getItemNum(COIN_ID) < times) {
                alert.showFWords(`${clientCore.ItemsInfo.getItemName(COIN_ID)}不足`);
                return;
            }
            this._nowIdx = 0;
            this.updateItems(true);
            this.mouseEnabled = false;
            let rewardArr = await net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 201, times: times })).then((data: pb.sc_common_activity_draw) => { return data.item })
            if (rewardArr?.length) {
                await this.trunRound(3);
                let targetIdx = this.findTargetIdx(rewardArr[0].id);
                await this.turnToTarget(targetIdx);
                await this.playSelectAni(targetIdx);
                let rwd = _.map(rewardArr, (o) => {
                    let rwdXls = xls.get(xls.godTree).get(o.id);
                    return clientCore.LocalInfo.sex == 1 ? rwdXls.item : rwdXls.itemMale;
                })
                alert.showReward(rwd);
            }
            this._nowIdx = -1;
            this.updateItems();
            this.mouseEnabled = true;
        }

        private findTargetIdx(id: number) {
            let arr = _.filter(xls.get(xls.godTree).getValues(), o => o.module == 201);
            return _.findIndex(arr, o => o.id == id);
        }

        private async turnToTarget(idx: number) {
            if (!this.parent)
                return
            let len = this._boxArr.length;
            while (this._nowIdx != idx) {
                this._nowIdx = (this._nowIdx + 1) % len;
                this.updateItems(true);
                await util.TimeUtil.awaitTime(30);
            }
        }

        private playSelectAni(idx: number) {
            if (!this.parent)
                return
            let cell = this._boxArr[idx];
            return new Promise((ok) => {
                cell.ani1.play(0, false);
                cell.ani1.on(Laya.Event.COMPLETE, this, ok);
            })
        }

        private async trunRound(round: number) {
            if (!this.parent)
                return
            let len = this._boxArr.length;
            for (let i = 0; i < round; i++) {
                for (let j = 0; j < len; j++) {
                    this._nowIdx = (this._nowIdx + 1) % len;
                    this.updateItems(true);
                    await util.TimeUtil.awaitTime(30);
                }
            }
        }

        private updateItems(ingoreRwdState: boolean = false) {
            for (let i = 0; i < this._boxArr.length; i++) {
                let box = this._boxArr[i];
                box.imgSelect.visible = i == this._nowIdx;
                let isCloth = xls.get(xls.itemCloth).has(box.dataSource);
                if (!ingoreRwdState)
                    box.imgGet.visible = isCloth && clientCore.ItemsInfo.getItemNum(box.dataSource) > 0;
            }
        }


        destroy() {
            this._boxArr?.forEach((o) => { o.destroy() })
            this._boxArr = [];
            this._rewardPanel?.destroy();
            super.destroy();
        }
    }
}