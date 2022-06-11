namespace scene.battle.result {
    /**
     * 胜利
     */
    export class ResultSucPanel extends ui.battleResult.ResultSucUI implements IResult {

        public sideClose = false;

        private _record: ResultInfoPanel;
        private _msg: pb.sc_battle_finish;
        private _blurBg: Laya.Sprite;
        private _blackBg: Laya.Sprite;

        constructor() {
            super();
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
        }

        public show(msg: pb.sc_battle_finish): void {
            this._blurBg = clientCore.LayerManager.createScreenShot();
            this._blackBg = util.DisplayUtil.createMask();
            this._blackBg.x = this._blurBg.x = -clientCore.LayerManager.mainLayer.x
            this.addChildAt(this._blackBg, 0);
            this.addChildAt(this._blurBg, 0);
            clientCore.DialogMgr.ins.open(this, false);
            this.updateView(msg);
            //播放胜利音效
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl("battleSuc"));

            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "fightMissionComplete") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "showFightResult") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, this._blackBg);
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, this._blackBg, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnRecord, Laya.Event.CLICK, this, this.openRecord);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            this._blackBg?.destroy(true);
            this._blurBg?.destroy(true);
            super.destroy();
        }

        private updateView(msg: pb.sc_battle_finish): void {
            this._msg = msg;
            this.list.array = msg.awardInfo;
            this.list.repeatX = this.list.length;
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
                this.txtTalk.text = _.find(xls.get(xls.characterVoice).getValues(), (o) => { return o.characterId == showRoleId && o.oggId == 'battleWin' })?.voiceText ?? '';
            }
        }

        private listRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let info: pb.ItemInfo = item.dataSource;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.itemId);
            item.num.value = info.itemCnt.toString();
            item.txtName.text = clientCore.ItemsInfo.getItemName(info.itemId);
            item.txtName.visible = true;
        }

        /** 打开战斗记录*/
        private openRecord(): void {
            this._record = this._record || new ResultInfoPanel();
            this._record.show(this._msg.dataInfo);
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this, false);
            copy.CopyManager.ins.close();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "battleFinishAndClose") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
    }
}