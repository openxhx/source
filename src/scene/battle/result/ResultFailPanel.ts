namespace scene.battle.result {
    /**
     * 失败
     */
    export class ResultFailPanel extends ui.battleResult.ResultFailUI implements IResult {

        public sideClose = false;
        /** 战斗记录*/
        private _record: ResultInfoPanel;
        private _msg: pb.sc_battle_finish;
        private _blurBg: Laya.Sprite;
        private _blackBg: Laya.Sprite;
        private _needVim: number;

        constructor() { super(); }

        public show(msg: pb.sc_battle_finish): void {
            this._blurBg = clientCore.LayerManager.createScreenShot();
            this._blackBg = util.DisplayUtil.createMask();
            this.addChildAt(this._blackBg, 0);
            this.addChildAt(this._blurBg, 0);
            clientCore.DialogMgr.ins.open(this, false);
            this._msg = msg;
            //播放失败音效
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl("battleFail"));
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.HEALTH_ID]);
            clientCore.UIManager.showCoinBox();
            this._needVim = 0;
            if (copy.CopyManager.ins.currCopy instanceof copy.child.CopyNoramlBase) {
                let xlsStage = xls.get(xls.stageBase).get(copy.CopyManager.ins.currCopy.stageId);
                if (!xlsStage) {
                    this.boxVim.visible = false;
                    this.btnReStart.visible = false;
                }
                else {
                    this.txtVim.text = 'x' + xlsStage.vim;
                    this.boxVim.visible = false;
                    this._needVim = xlsStage.vim;
                }
            }
            else {
                this.boxVim.visible = false;
            }
            // 展示形象
            let roleIdArr = _.map(_.filter(msg.dataInfo, (o) => { return o.team == 1 }), (o) => { return o.roleid });
            _.remove(roleIdArr, (id) => { return id == clientCore.RoleManager.instance.getSelfInfo().id });
            let showRoleId: number;
            if (roleIdArr.length == 0) {
                showRoleId = clientCore.RoleManager.instance.getSelfInfo().id;
            }
            else {
                showRoleId = _.shuffle(roleIdArr)[0];
            }
            this.imgRole.skin = pathConfig.getRoleUI(showRoleId);
            let xlsRole = xls.get(xls.characterId).get(showRoleId);
            if (!xlsRole) {
                console.warn(showRoleId + '没有')
                return;
            }
            let scale = xlsRole.showNpc;
            this.imgRole.scaleX = scale ? -this.imgRole.scaleY : this.imgRole.scaleY;
            if (showRoleId == clientCore.RoleManager.instance.getSelfInfo().id) {
                this.boxTalk.visible = false;
            }
            else {
                this.boxTalk.visible = true;
                this.txtName.text = xls.get(xls.characterId).get(xlsRole.mutexId).name;
                this.txtTalk.text = _.find(xls.get(xls.characterVoice).getValues(), (o) => { return o.characterId == showRoleId && o.oggId == 'battleFail' })?.voiceText ?? '';
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, this._blackBg, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnReStart, Laya.Event.CLICK, this, this.reStart);
            BC.addEvent(this, this.btnRecord, Laya.Event.CLICK, this, this.openRecord);
            BC.addEvent(this, this.btnTree, Laya.Event.CLICK, this, this.openMod, [0]);
            BC.addEvent(this, this.btnArr, Laya.Event.CLICK, this, this.openMod, [1]);
            BC.addEvent(this, this.btnFoster, Laya.Event.CLICK, this, this.openMod, [2]);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this._blackBg?.destroy(true);
            this._blurBg?.destroy(true);
            this._msg = this._record = null;
        }

        private hide(): void {
            copy.CopyManager.ins.close();
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.UIManager.releaseCoinBox();
        }

        /** 重新开始*/
        private reStart(): void {
            if (clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.HEALTH_ID) < this._needVim) {
                alert.showFWords('四叶草不足！');
                return;
            }
            let copyMod: copy.child.CopyNoramlBase = copy.CopyManager.ins.currCopy as copy.child.CopyNoramlBase;
            let stageID: number = copyMod.stageId;
            copyMod.isReStart = true;
            this.hide();
            battle.BattleSCommand.ins.battleLayout(BattleConfig.mod, stageID);
        }

        private openMod(type: number): void {
            let mods: string[] = ["spirittree.SpirittreeModule", "formation.FormationModule", "foster.FosterModule"];
            let mod: string = mods[type];
            copy.CopyManager.ins.currCopy.openMod = { moduleName: mod };
            this.hide();
        }

        /** 打开战斗记录*/
        private openRecord(): void {
            this._record = this._record || new ResultInfoPanel();
            this._record.show(this._msg.dataInfo);
        }
    }
}