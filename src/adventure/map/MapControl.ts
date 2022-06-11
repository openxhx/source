namespace adventure {
    export class MapControl {
        private _contain: Laya.Box;
        private _uiHash: util.HashMap<Laya.Box>;
        private _currMapUI: Laya.Box;
        private _chapterInfo: clientCore.ChapterInfo;
        private _pathArr: Laya.Box[];
        private _unlockPanel: AdvUnlockPanel;

        constructor(con: Laya.Box) {
            this._contain = con;
            this._uiHash = new util.HashMap();
            this._pathArr = [];
        }

        setMap(chapterInfo: clientCore.ChapterInfo) {
            this.clearMap();
            this._chapterInfo = chapterInfo;
            let stageNum = chapterInfo.stageInfos.length - 1;//去掉boss关
            this._currMapUI = this._uiHash.has(stageNum) ? this._uiHash.get(stageNum) : this.createNewMapUI(stageNum);
            this.setUIPath();
            this.setUIByInfo();
            this._currMapUI.anchorX = this._currMapUI.anchorY = 0.5;
            this._currMapUI.pos(this._currMapUI.width / 2, this._currMapUI.height / 2, true)
            this._contain.addChild(this._currMapUI);
        }

        clearMap() {
            this._currMapUI?.removeSelf();
            this._pathArr = [];
        }

        private setUIPath() {
            let numChildren = this._currMapUI.numChildren;
            for (let i = 0; i < numChildren - 1; i++) {
                let foot = this._currMapUI.getChildByName('foot_' + i) as Laya.Box;
                if (foot) {
                    this._pathArr.push(foot);
                    foot.visible = true;
                }
            }
        }

        private createNewMapUI(num: number) {
            let mapUI = new ui.adventure.maps['Map' + num + 'UI']();
            this._uiHash.add(num, mapUI);
            return mapUI;
        }

        private setUIByInfo() {
            let stageNum = this._chapterInfo.stageInfos.length - 1;
            for (let i = 0; i < stageNum; i++) {
                let stage = this._currMapUI.getChildByName(i.toString()) as ui.adventure.render.AdvMapItemUI;
                stage.offAllCaller(this);
                let info = this._chapterInfo.stageInfos[i];
                stage.clipStage.visible = stage.imgRole.visible = stage.boxReward.visible = stage.boxGame.visible = false;
                stage.imgNow.visible = stage.imgNow1.visible = stage.boxNow.visible = this._chapterInfo.nowStageIdx == i;
                stage.boxLock.visible = false;
                let stageAllComplete = this._chapterInfo.nowStageIdx == -1;
                //路径
                if (this._pathArr[i] && !stageAllComplete)
                    this._pathArr[i].visible = i < this._chapterInfo.nowStageIdx;
                //置灰设置
                this.setGray(stage, i > this._chapterInfo.nowStageIdx || stageAllComplete);
                if ((i <= this._chapterInfo.nowStageIdx || stageAllComplete) && this._chapterInfo.srvData.isOpen == 1)
                    stage.on(Laya.Event.CLICK, this, this.onStageClick);
                switch (info.type) {
                    case clientCore.STAGE_TYPE.PLOT:
                        this.setPlot(stage, info);
                        break;
                    case clientCore.STAGE_TYPE.NORMAL:
                        this.setFightStage(stage, info);
                        break;
                    case clientCore.STAGE_TYPE.BOSS:
                        this.setFightStage(stage, info);
                        break;
                    case clientCore.STAGE_TYPE.GAME:
                        this.setGameStage(stage, info);
                        break;
                    default:
                        break;
                }
            }
            if (!this._chapterInfo.srvData.isOpen) {
                let stage = this._currMapUI.getChildByName('0') as ui.adventure.render.AdvMapItemUI;
                stage.boxLock.visible = true;
                stage.on(Laya.Event.CLICK, this, this.onOpenUnlockPanel);
            }
        }

        private onOpenUnlockPanel(e: Laya.Event) {
            let idx = parseInt(e.currentTarget.name);
            let info = this._chapterInfo.stageInfos[idx]
            this._unlockPanel = this._unlockPanel || new AdvUnlockPanel();
            this._unlockPanel.show(xls.get(xls.chapterBase).get(info.chatperId));
        }

        private setGray(stage: ui.adventure.render.AdvMapItemUI, b: boolean) {
            for (let i = 0; i < stage.numChildren; i++) {
                let dis = stage.getChildAt(i);
                dis['gray'] = b;
            }
        }

        private setPlot(stage: ui.adventure.render.AdvMapItemUI, info: clientCore.StageInfo) {
            stage.clipStage.visible = true;
            stage.clipStage.index = info.state == clientCore.STAGE_STATU.NO_COMPLETE ? 0 : 1;
        }

        private setFightStage(stage: ui.adventure.render.AdvMapItemUI, info: clientCore.StageInfo) {
            stage.imgRole.visible = true;
            // stage.imgRole.skin = pathConfig.getMonsterUI(info.xlsData.display);
            if (info.state > clientCore.STAGE_STATU.NO_COMPLETE)
                this.setReward(stage, info);
        }

        private setGameStage(stage: ui.adventure.render.AdvMapItemUI, info: clientCore.StageInfo) {
            stage.boxGame.visible = true;
            stage.clip_game.index = info.state == clientCore.STAGE_STATU.NO_COMPLETE ? 0 : 1;
        }

        private setReward(stage: ui.adventure.render.AdvMapItemUI, info: clientCore.StageInfo) {
            if (info.state == clientCore.STAGE_STATU.COMPLETE) {
                //还有将没领 强制取消置灰
                this.setGray(stage, false)
            }
            if (info.state == clientCore.STAGE_STATU.COMPLETE) {
                stage.ani2.play(0, true);
            }
            else {
                stage.ani2.gotoAndStop(0);
                stage.imgLight.visible = false;
            }
            stage.boxReward.visible = true;
            stage.imgRole.visible = false;
            stage.clipBox.index = info.state == clientCore.STAGE_STATU.REWARDED ? 1 : 0;
            //奖励icon 数量
            let firstpassRwd = clientCore.LocalInfo.sex == 1 ? info.xlsData.firstpass : info.xlsData.firstpassMale;
            if (firstpassRwd.length > 0) {
                stage.txtReward.text = 'x' + firstpassRwd[0].v2;
                stage.imgRwd.skin = clientCore.ItemsInfo.getItemIconUrl(firstpassRwd[0].v1);
            }
        }

        private onStageClick(e: Laya.Event) {
            let idx = e.currentTarget.name;
            EventManager.event(EV_CLICK_STAGE, this._chapterInfo.stageInfos[idx]);
        }
        public getStageObjByID(id: number) {
            return this._currMapUI.getChildByName(id.toString());
        }

        destroy() {
            // this._currMapUI.destroy();
            // for (const o of this._uiHash.getValues()) {
            //     o.destroy();
            // }
            // this._uiHash.clear();
        }
    }
}