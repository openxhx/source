namespace elfEnergy {
    export class ElfEnergyModule extends ui.elfEnergy.ElfEnergyModuleUI {
        private _unlockPanel: UnlockPanel;
        private _chargePanel: ChargeElfPanel;

        init(d: any) {
            super.init(d);
            this.addPreLoad(xls.load(xls.elfEnergy));
            for (let i = 0; i < 3; i++) {
                let htmlTxt: Laya.HTMLDivElement = this['elf_' + i].txtTime;
                htmlTxt.style.fontSize = 20;
                htmlTxt.style.font = '汉仪中圆简';
                htmlTxt.style.align = 'center';
            }
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        onPreloadOver() {
            this.updateView();
        }

        private updateView() {
            let total = 0;
            for (let i = 0; i < 3; i++) {
                total += this.updateSigle(this['elf_' + i], i + 1);
            }
            this.txtNum.text = clientCore.BuildQueueManager.allEnergy.toString();
            this.txtTotal.text = '/' + total;
        }

        private updateSigle(cell: ui.elfEnergy.ElfRenderUI, id: number) {
            let info = clientCore.BuildQueueManager.getInfoById(id);
            let unlocked = info != undefined;
            let isfull = unlocked && (info.num >= info.total);

            cell.boxNum.visible = unlocked;
            cell.imgFairy.visible = !unlocked;
            //进度UI
            if (unlocked) {
                cell.txtNum.text = info.num.toString();
                cell.txtNum.color = info.num >= info.total ? '#805329' : '#ff0000';
                cell.txtTotal.text = '/' + info.total;
                //倒计时
                cell.imgTime.visible = !isfull;
                cell.txtTime.style.width = 400;
                cell.txtTime.style.fontSize = 24;
                cell.txtTime.style.align = 'center';
                cell.txtTime.innerHTML = util.StringUtils.getColorText2([
                    util.StringUtils.getDateStr(info.restTimeToAdd) + '后',
                    '#ffff00',
                    '恢复',
                    '#ffffff',
                    `${xls.get(xls.globaltest).get(1).fairyPower.v1}点`,
                    '#ffff00',
                    '能量',
                    '#ffffff'
                ]);
            }
            cell.imgLight_0.visible = cell.imgLight_1.visible = isfull;
            let max = -42;
            let min = 128;
            cell.imgProgress.y = unlocked ? (min + (info.num / info.total) * (max - min)) : min;
            //按钮
            cell.btn.visible = !isfull;
            cell.btn.fontSkin = unlocked ? 'elfEnergy/full.png' : 'elfEnergy/awake.png';
            return unlocked ? info.total : 0;
        }

        private onTimer() {
            for (let i = 0; i < 3; i++) {
                let info = clientCore.BuildQueueManager.getInfoById(i + 1);
                if (info)
                    if (info.num < info.total) {
                        this.updateSigle(this['elf_' + i], info.id);
                    }
            }
        }

        private async onBtnClick(id: number) {
            let info = clientCore.BuildQueueManager.getInfoById(id);
            let unlocked = info != undefined;
            let isfull = unlocked && (info.num >= info.total);
            if (unlocked) {
                if (!isfull) {
                    this._chargePanel = this._chargePanel ?? new ChargeElfPanel();
                    this._chargePanel.show(info);
                    this._chargePanel.once(Laya.Event.CLOSE, this, this.updateView);
                }
            }
            else {
                this._unlockPanel = this._unlockPanel ?? new UnlockPanel();
                this._unlockPanel.show(id);
                this._unlockPanel.once(Laya.Event.CLOSE, this, this.updateView);
                this._unlockPanel.once(Laya.Event.COMPLETE, this, this.showUnlockAni, [id]);
            }
        }

        private showUnlockAni(id: number) {
            let bone = clientCore.BoneMgr.ins.play('unpack/elfEnergy/unlockElf.sk', 0, false, this);
            let elfRender = this['elf_' + (id - 1)];
            elfRender.visible = false;
            bone.pos(elfRender.x + 126, elfRender.y + 100);
            bone.once(Laya.Event.COMPLETE, this, () => {
                if (elfRender) {
                    elfRender.visible = true;
                    this.updateView();
                }
            })
        }

        private showDetail() {
            clientCore.DialogMgr.ins.open(new ElfDetailPanel());
        }

        addEventListeners() {
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['elf_' + i].btn, Laya.Event.CLICK, this, this.onBtnClick, [i + 1]);
            }
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.showDetail);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
            clientCore.UIManager.releaseCoinBox();
        }

        destroy() {
            this._unlockPanel?.destroy();
            this._chargePanel?.destroy();
            super.destroy();
        }
    }
}