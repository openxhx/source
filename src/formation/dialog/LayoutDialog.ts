
namespace formation.dialog {
    /**
     * 阵型布局
     */
    export class LayoutDialog extends ui.formation.panel.LayoutUI {
        private _skHash: util.HashMap<Laya.Skeleton>;//key:位置 1-6
        private _closeed: boolean;
        private _currMoveingPos: number;
        private _skillComp: PraySkillDragControl;

        public addEventListeners(): void {
            this._skHash = new util.HashMap();
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onStopDrag);
            for (let i = 1; i <= 6; i++) {
                BC.addEvent(this, this['box' + i], Laya.Event.MOUSE_DOWN, this, this.onStartDrag, [i]);
            }
            this._skillComp = new PraySkillDragControl(this);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public show(): void {
            this._currMoveingPos = 0;
            this._closeed = false;
            clientCore.DialogMgr.ins.open(this);
            for (const id of clientCore.FormationControl.instance.seatArr) {
                if (id > 0)
                    this.getRoleSk(id);
            }
        }

        private hide(): void {
            this._closeed = true;
            clientCore.DialogMgr.ins.close(this);
            for (const sk of this._skHash.getValues()) {
                sk.destroy();
            }
            let data = [];
            for (let i = 1; i <= 6; i++) {
                data.push(this._skHash.has(i) ? this._skHash.get(i)['dataSource'] : 0);
            }
            clientCore.FormationControl.instance.setSeatArray(data);
            this._skHash.clear();
        }

        private getRoleSk(id: number) {
            let path = pathConfig.getRoleBattleSk(id);
            let selfInfo = clientCore.RoleManager.instance.getSelfInfo();
            if (selfInfo.id == id)
                //主角需要用神祇形象
                path = pathConfig.getRoleBattleSk(selfInfo.srvData.curPray);
            let sk = new Laya.Skeleton();
            sk.load(path, new Laya.Handler(this, this.onSkLoad, [sk, id]), 0);
        }

        private onSkLoad(sk: Laya.Skeleton, id: number) {
            if (!this._closeed) {
                let pos = _.indexOf(clientCore.FormationControl.instance.seatArr, id) + 1;
                sk['dataSource'] = id;
                sk.play('idle', true);
                this.setSkToBoxId(sk, pos);
                this.addChild(sk);
            }
            else {
                sk.destroy();
            }
        }

        private onStartDrag(pos) {
            if (this._skHash.has(pos)) {
                this._currMoveingPos = pos;
                let sk = this._skHash.get(pos);
                sk.pos(this.mouseX, this.mouseY);
                this.addChild(sk);
                this._skHash.get(pos).startDrag();
            }
        }

        private onStopDrag() {
            if (this._currMoveingPos > 0) {
                let targetPos = -1;
                for (let i = 1; i <= 6; i++) {
                    let box = this['box' + i];
                    let X = (this.mouseX - box.x - box.width / 2);
                    let Y = (this.mouseY - box.y - box.height / 2);
                    if (X * X + Y * Y < 2000) {
                        targetPos = i;
                        break;
                    }
                }
                let sk = this._skHash.get(this._currMoveingPos);
                sk.stopDrag();
                if (targetPos == -1) {
                    //恢复原位
                    this.setSkToBoxId(sk, this._currMoveingPos);
                }
                else {
                    if (this._skHash.has(targetPos)) {
                        let swapSk = this._skHash.remove(targetPos);
                        this._skHash.remove(this._currMoveingPos);
                        //交换 
                        this.setSkToBoxId(sk, targetPos);
                        this.setSkToBoxId(swapSk, this._currMoveingPos);

                    }
                    else {
                        //放到空位上
                        this._skHash.remove(this._currMoveingPos);
                        this.setSkToBoxId(sk, targetPos);
                    }
                }
                this._currMoveingPos = 0;
            }
        }

        private setSkToBoxId(sk: Laya.Skeleton, boxId: number) {
            let box = this['box' + boxId];
            sk.pos(box.x + box.width / 2, box.y + box.height / 2 + 30);
            this._skHash.add(boxId, sk);
        }

        destroy() {
            super.destroy();
            if (this._skillComp)
                this._skillComp.destory();
            this._skillComp = null;
        }
    }
}