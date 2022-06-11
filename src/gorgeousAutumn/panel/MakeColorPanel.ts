namespace gorgeousAutumn {
    export class MakeColorPanel extends ui.gorgeousAutumn.panel.MakeColorPanelUI {
        private onSelectIdx: number[];
        private angesi: clientCore.Bone;
        constructor() {
            super();
        }

        show() {
            this.sideClose = true;
            this.initMaterial();
            this.angesi = clientCore.BoneMgr.ins.play('res/animate/activity/angesi.sk', 'idle', true, this.boxAni);
            this.angesi.pos(130, 340);
            clientCore.DialogMgr.ins.open(this);
        }

        private initMaterial() {
            this.btnSure.mouseEnabled = true;
            let config = GorgeousAutumnModel.instance.getCurConfig();
            this.labDes.text = config.dialog;
            let material = config.meterial_1;
            for (let i: number = 1; i <= 4; i++) {
                this['item' + i].imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(material[i - 1].v1);
                this['item' + i].labCost.text = clientCore.ItemsInfo.getItemNum(material[i - 1].v1) + '/' + material[i - 1].v2;
                this['item' + i].di.skin = 'gorgeousAutumn/di_item.png';
            }
            this.onSelectIdx = [];
        }

        private onItemClick(idx: number, e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                if (this.imgMaterial.visible) this.imgMaterial.visible = false;
                let material = GorgeousAutumnModel.instance.getCurConfig().meterial_1;
                clientCore.ToolTip.showTips(this['item' + idx], { id: material[idx - 1].v1 });
            }
        }

        private onItemDown(idx: number, e: Laya.Event) {
            if (e.type == Laya.Event.MOUSE_DOWN) {
                BC.addEvent(this, this, Laya.Event.MOUSE_OUT, this, this.onMouseUp, [idx]);
                BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.moveMaterial);
                BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp, [idx]);
                let material = GorgeousAutumnModel.instance.getCurConfig().meterial_1;
                let id = material[idx - 1].v1;
                this.imgMaterial.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                this.imgMaterial.pos(e.currentTarget.mouseX + this['item' + idx].x, e.currentTarget.mouseY + this['item' + idx].y);
                this.imgMaterial.visible = true; 
            }
        }

        private moveMaterial(e: Laya.Event) {
            this.imgMaterial.pos(e.currentTarget.mouseX, e.currentTarget.mouseY);
        }

        private onMouseUp(idx: number, e: Laya.Event) {
            BC.removeEvent(this, this, Laya.Event.MOUSE_OUT, this, this.onMouseUp);
            BC.removeEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.moveMaterial);
            BC.removeEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseUp);
            let pos = new Laya.Point();
            pos.x = e.currentTarget.mouseX;
            pos.y = e.currentTarget.mouseY;
            if (pos.distance(260, 366) < 60) {
                this.chooseMaterial(idx);
            }
            this.imgMaterial.visible = false;
        }

        private chooseMaterial(idx: number) {
            let index = this.onSelectIdx.indexOf(idx);
            if (index >= 0) {
                this.onSelectIdx.splice(index, 1);
                this['item' + idx].di.skin = 'gorgeousAutumn/di_item.png';
            } else {
                if (this.onSelectIdx.length >= 2) {
                    alert.showFWords('最多选择两种材料~');
                    return;
                }
                let costCnt = this['item' + idx].labCost.text.split('/');
                if (parseInt(costCnt[0]) < parseInt(costCnt[1])) {
                    alert.showFWords('该材料数量不足~');
                    return;
                }
                this.onSelectIdx.push(idx);
                this['item' + idx].di.skin = 'gorgeousAutumn/di_item1.png';
            }
        }

        private async sureMake() {
            if (this.onSelectIdx.length < 2) return;
            this.angesi.play('jiaoban', true);
            this.btnSure.mouseEnabled = false;
            await util.TimeUtil.awaitTime(1000);
            if (this._closed) return;
            let material = GorgeousAutumnModel.instance.getCurConfig().meterial_1;
            net.sendAndWait(new pb.cs_gorgeous_autumn_reward({ id: [material[this.onSelectIdx[0] - 1].v1, material[this.onSelectIdx[1] - 1].v1], index: GorgeousAutumnModel.instance.curStep + 1 })).then((msg: pb.sc_gorgeous_autumn_reward) => {
                if (msg.item.length > 0) {
                    GorgeousAutumnModel.instance.dyeingReward = msg.item;
                    this.sideClose = false;
                    this.angesi.play('succeed', false, Laya.Handler.create(this, () => {
                        EventManager.event('GORGEOUS_AUTUMN_SHOW_DYEING');
                        clientCore.DialogMgr.ins.close(this);
                    }));
                } else {
                    this.angesi.play('lose', true);
                    alert.showFWords('制作失败,可以尝试其他材料组合~');
                    this.initMaterial();
                    this.labDes.text = "好像制作出来的颜色怪怪的，还好我只放了亿点点~";
                }
            }).catch(() => {
                this.btnSure.mouseEnabled = true;
            })
        }

        addEventListeners() {
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this['item' + i], Laya.Event.CLICK, this, this.onItemClick, [i]);
                BC.addEvent(this, this['item' + i], Laya.Event.MOUSE_DOWN, this, this.onItemDown, [i]);
            }
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureMake);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.angesi?.dispose();
            this.angesi = this.onSelectIdx = null;
            super.destroy();
        }
    }
}