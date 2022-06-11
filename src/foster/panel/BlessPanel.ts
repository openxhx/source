namespace foster {
    export class BlessPanel {
        private _ui: ui.foster.panel.BlessPanelUI;
        private _currentInfo: clientCore.role.RoleInfo;
        private _attrChangeMap: util.HashMap<number>; //存放的是白分比
        private _ballList: ui.foster.comp.BlessBallCompUI[];
        constructor(ui: ui.foster.panel.BlessPanelUI) {
            this._ui = ui;
            this._ballList = [];
            this._attrChangeMap = new util.HashMap();
            for (let i = 0; i < this._ui.boxBless.numChildren; i++) {
                this._ballList.push(this._ui.boxBless.getChildAt(i) as ui.foster.comp.BlessBallCompUI);
                BC.addEvent(this, this._ballList[i], Laya.Event.MOUSE_DOWN, this, this.onBallInfoClick, [i]);
                BC.addEvent(this, this._ballList[i], Laya.Event.MOUSE_UP, this, this.onCloseInfo, [i]);
                BC.addEvent(this, this._ballList[i], Laya.Event.MOUSE_OUT, this, this.onCloseInfo, [i]);
            }
            BC.addEvent(this, this._ui.imgIcon, Laya.Event.CLICK, this, this.showTips);
            BC.addEvent(this, this._ui.btnBlessing, Laya.Event.CLICK, this, this.onUpgradeBlessing);
        }

        show(id: number) {
            if (!this._currentInfo || this._currentInfo.id != id) {
                this._currentInfo = clientCore.RoleManager.instance.getRoleById(id);
                this.updateView();
            }
        }

        private showTips() {
            let id = this._currentInfo?.upBlessNeedGoods?.itemID;
            if (id) {
                clientCore.ToolTip.showTips(this._ui.imgIcon, { id: id });
            }
        }

        private updateView() {
            this._ui.txtName.text = this._currentInfo.id == clientCore.RoleManager.instance.getSelfInfo().id ? clientCore.LocalInfo.userInfo.nick : this._currentInfo.name;
            this._ui.txtFight.text = util.StringUtils.splitNumber(this._currentInfo.fight, ',', 3);
            this._ui.txtStage.text = "第" + util.StringUtils.num2Chinese(this._currentInfo.bless) + "阶段"
            this._ui.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(this._currentInfo.upBlessNeedGoods.itemID);
            this._ui.imgUpBlessStage.visible = this._currentInfo.canUpBlessStage;
            let isFull = this._currentInfo.bless == clientCore.role.RoleInfo.xlsGlobalData.blessCostItem.length;
            _.each(this._ballList, (ball, idx) => {
                this.setBallInfo(ball, this._currentInfo.extAttr[idx]);
                let attr = this._currentInfo.extAttr[idx];
                if (attr.value < attr.limit) {
                    isFull = false;
                }
            });
            this._ui.btnBlessing.disabled = isFull;
            for (let i = 0; i < 4; i++) {
                let info = this._currentInfo.extSpecialAttr[i];
                let unlocked = this._currentInfo.bless >= (i + 2);
                (this._ui.getChildByName('unlockBg_' + i) as Laya.Image).skin = unlocked ? 'foster/di1.png' : 'foster/di2.png';
                (this._ui.getChildByName('unlock_' + i) as Laya.Label).text = unlocked ? '已解锁' : `第${util.StringUtils.num2Chinese(i + 2)}阶段激活`;
                (this._ui.getChildByName('add_' + i) as Laya.Label).text = '+' + info.name + '  ' + info.value;
            }
            this._ui.txtBlessNum.value = util.StringUtils.parseNumFontValue(clientCore.ItemsInfo.getItemNum(this._currentInfo.upBlessNeedGoods.itemID), this._currentInfo.upBlessNeedGoods.itemNum);
        }

        private setBallInfo(ball: ui.foster.comp.BlessBallCompUI, attrInfo: clientCore.role.RoleExtAttr) {
            let curr = attrInfo.value - attrInfo.lastLimit;
            let total = attrInfo.limit - attrInfo.lastLimit;
            let tarY = 82 - curr / total * 82;
            let needAni = this._attrChangeMap.has(attrInfo.id) && this._attrChangeMap.get(attrInfo.id) != curr;
            if (needAni) {
                Laya.Tween.to(ball, { scaleX: 1.3, scaleY: 1.3 }, 150);
                Laya.Tween.to(ball, { scaleX: 1, scaleY: 1 }, 150, null, null, 150);
                Laya.Tween.to(ball.imgMask, { y: tarY }, 300);
            }
            else {
                ball.imgMask.y = tarY;
            }
            ball.txtValue.text = attrInfo.value.toString();
            ball.txtNum.text = attrInfo.value.toString();
            ball.txtTotal.text = '/' + attrInfo.limit + ' ';
            ball.imgAttr.skin = `foster/attr${attrInfo.id}.png`;
            ball.imgBall.skin = `foster/bubble${attrInfo.id}.png`;
            this._attrChangeMap.add(attrInfo.id, curr);
        }

        private onBallInfoClick(idx: number) {
            let ball = this._ballList[idx];
            ball.parent.addChild(ball);
            ball.boxDetail.visible = true;
        }

        private onCloseInfo(idx: number) {
            this._ballList[idx].boxDetail.visible = false;
        }

        /** 提升祝福*/
        private onUpgradeBlessing(): void {
            if (this._currentInfo.canUpBlessStage) {

                clientCore.RoleManager.instance.upgradeBlessStage(this._currentInfo.id).then(() => {
                    this._currentInfo = clientCore.RoleManager.instance.getRoleById(this._currentInfo.id);
                    this.updateView();
                }).catch(() => { });
            }
            else {
                clientCore.RoleManager.instance.upgrageBless(this._currentInfo.id).then(() => {
                    this._currentInfo = clientCore.RoleManager.instance.getRoleById(this._currentInfo.id);
                    this.updateView();
                }).catch(() => { });
            }
        }

        destroy() {

        }
    }
}