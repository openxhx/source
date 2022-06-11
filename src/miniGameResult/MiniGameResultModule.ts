namespace miniGameResult {
    export class MiniGameResultModule extends ui.miniGameResult.MiniGameResultModuleUI {
        private _blurBg: Laya.Sprite;
        private _blackBg: Laya.Sprite;
        private _needVim: number;
        // private _error: boolean;
        init(d: clientCore.IMiniGameResult) {
            super.init(d);
            this.isPromptlyClose = true;
            this.addPreLoad(xls.load(xls.characterVoice));
            // this.addPreLoad(net.sendAndWait(new pb.cs_mini_game_over({ type: d.type, score: d.score, stageId: d.stageId })).then((data: pb.sc_mini_game_over) => {
            //     this.list.dataSource = data.rewardInfo;
            //     this.list.repeatX = this.list.length;
            //     this._data.isWin = data.outcome == 1;//以后台给的输赢为准 
            // }).catch(() => {
            //     this.event('error')
            //     this.destroy();
            // }));
            this.list.dataSource = d.rewardInfo;
            this.list.repeatX = this.list.length;
            if (!d.isWin) {
                clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.HEALTH_ID]);
                clientCore.UIManager.showCoinBox();
            }
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
        }

        onPreloadOver() {
            clientCore.LoadingManager.hideSmall(true);
            this._blurBg = clientCore.LayerManager.createScreenShot();
            this._blackBg = util.DisplayUtil.createMask();
            this._blackBg.x = this._blurBg.x = -clientCore.LayerManager.mainLayer.x;
            this.addChildAt(this._blackBg, 0);
            this.addChildAt(this._blurBg, 0);
            let data: clientCore.IMiniGameResult = this._data;
            this.winPanel.visible = data.isWin;
            this.losePanel.visible = !data.isWin;
            let xlsStage = xls.get(xls.stageBase).get(data.stageId) || xls.get(xls.dateStage).get(data.stageId);
            if (data.isWin) {
                BC.addEvent(this, this._blackBg, Laya.Event.CLICK, this, this.onBack);
                let xlsMiniGame = xls.get(xls.miniGameBase).get(xlsStage.miniGameId);
                this.imgRole.skin = pathConfig.getRoleUI(xlsMiniGame.showNpc);
                let scale = xls.get(xls.characterId).get(xlsMiniGame.showNpc).showNpc;
                this.imgRole.scaleX = scale ? -this.imgRole.scaleY : this.imgRole.scaleY;
                this.txtScore.text = data.score.toString();
                this.txtName.text = this.txtName.text = xls.get(xls.characterId).get(xlsMiniGame.showNpc).name;
                this.txtTalk.text = _.find(xls.get(xls.characterVoice).getValues(), (o) => { return o.characterId == xlsMiniGame.showNpc && o.oggId == 'battleWin' })?.voiceText ?? '';
                if (data.txtTitle) {
                    this.txtTitle.visible = this.txtValue.visible = true;
                    this.txtTitle.text = data.txtTitle;
                    this.txtValue.text = data.txtValue;
                }
                else {
                    this.txtTitle.visible = this.txtValue.visible = false;
                }
            }
            else {
                this._needVim = xlsStage.vim;
                this.txtVim.text = 'x' + xlsStage.vim;
            }
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitMiniGameResultModuleOpen") {
                // EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
            }
        }

        private onListRender(cell: ui.commonUI.item.RewardItemUI, idx: number) {
            let info = cell.dataSource as pb.IItemInfo;
            cell.ico.skin = clientCore.ItemsInfo.getItemIconUrl(info.itemId);
            cell.txtName.text = clientCore.ItemsInfo.getItemName(info.itemId);
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(info.itemId);
            cell.num.value = info.itemCnt.toString();
            cell.txtName.visible = true;
            let isRole = Math.floor(info.itemId / 100000) == 14;
            cell.num.visible = !isRole;
            let s = isRole ? 0.6 : 0.7;
            cell.ico.scale(s, s, true);
        }

        private onAgain() {
            if (clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.HEALTH_ID) < this._needVim) {
                alert.showFWords('四叶草不足！');
                return;
            }
            this.event('again');
            this.destroy();
        }

        private onBack() {
            this.event('exit');
            this.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this._blackBg, Laya.Event.CLICK, this, this.onBack);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onBack);
            BC.addEvent(this, this.btnAgain, Laya.Event.CLICK, this, this.onAgain);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickCloseMiniGameResult") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this._blurBg?.destroy(true);
            this._blackBg?.destroy(true);
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}