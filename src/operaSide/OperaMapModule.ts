namespace operaSide {
    const FEATHER_ID = 9900071;
    import OperaManager = clientCore.OperaManager;
    import OperaSideManager = clientCore.OperaSideManager;
    /**
     * 中秋话剧-阵营活动 地图面板
     * operaSide.OperaMapModule
    */
    export class OperaMapModule extends ui.operaSide.OperaMapModuleUI {
        private _stageArr: ui.operaSide.render.OperaStageRenderUI[];
        private _circleArr: Laya.Image[];
        private _mapInfoArr: xls.dramaMap[];
        private _fightStageIdArr: number[] = [];
        private _plotPanel: OperaPlotPanel;
        private _fightPanel: OperaFightPanel;
        private _suitPrevPanel: OperaSuitPrevPanel;

        init(d: any) {
            this._stageArr = [];
            this._circleArr = [];
            this.addPreLoad(xls.load(xls.dramaMap));
            this.addPreLoad(xls.load(xls.dramaBaseData));
            this.addPreLoad(xls.load(xls.dramaArea));
            this.addPreLoad(clientCore.ModuleManager.loadatlas('operaSide/bg'))
            this.addPreLoad(clientCore.OperaSideManager.instance.reqPanelInfo());
            clientCore.ToolTip.addTips(this.imgLeaf, { id: FEATHER_ID });
            core.SoundManager.instance.playBgm('res/music/bgm/operaFight.mp3', true);
            this.btnFinal.gray = OperaManager.timeToFinalFight > 0;
        }

        onPreloadOver() {
            this._mapInfoArr = xls.get(xls.dramaMap).getValues();
            this.imgHead.skin = `operaSide/${OperaManager.instance.side == 1 ? 'left' : 'right'}.png`
            this.createMap();
            this.updateView();
        }

        popupOver() {
            OperaManager.instance.checkHasActionTodo();
        }

        private createMap() {
            for (let i = 0; i < this.boxStage.numChildren; i++) {
                this._stageArr.push(this.boxStage.getChildAt(i) as ui.operaSide.render.OperaStageRenderUI);
            }
            for (let i = 0; i < this._stageArr.length; i++) {
                let info = this._mapInfoArr[i];
                let stageType = this.getStageTypeByStageId(info.id)
                this._stageArr[i].imgIcon.skin = `operaSide/imgIcon_${stageType}.png`;
                if (i == this._stageArr.length - 1) {
                    this._stageArr[i].imgIcon.skin = `operaSide/imgIcon_end.png`;
                }
                if (stageType == 2) {
                    let routeInfo = xls.get(xls.dramaRoute).get(info.nodes[OperaManager.instance.side - 1]);
                    this._fightStageIdArr.push(routeInfo.event.v2);
                }
                BC.addEvent(this, this._stageArr[i], Laya.Event.CLICK, this, this.onStageClick, [i]);
            }
            for (let i = 0; i < this._stageArr.length - 1; i++) {
                let a = this._stageArr[i];
                let b = this._stageArr[i + 1];
                let lenX = b.x - a.x;
                let lenY = b.y - a.y;
                for (let j = 1; j <= 2; j++) {
                    let img = new Laya.Image('operaSide/yuan2.png');
                    img.anchorX = img.anchorY = 0.5;
                    this.boxCircle.addChild(img);
                    img.x = a.x + lenX * j / 3;
                    img.y = a.y + lenY * j / 3;
                    this._circleArr.push(img);
                }
            }
        }

        /**
         * 根据dramaMap中id判断关卡类型
         * @return id 1剧情 2战斗 3交互
         */
        private getStageTypeByStageId(id: number) {
            let mapInfo = xls.get(xls.dramaMap).get(id);
            let routeInfo = xls.get(xls.dramaRoute).get(mapInfo.nodes[OperaManager.instance.side - 1]);
            if (routeInfo.event.v1 <= 2)
                return 1;
            if (routeInfo.event.v1 == 4)
                return 2;
            if (routeInfo.event.v1 == 3)
                return 3;
        }

        /**更新关卡地图 */
        private updateStage() {
            let allComplete = OperaManager.instance.nowEndRoute();
            let nowStageIdx = clientCore.OperaSideManager.instance.nowStageIdx;
            for (let i = 0; i < this._stageArr.length; i++) {
                this._stageArr[i].imgNow.visible = i == nowStageIdx && !allComplete;
                this._stageArr[i].filters = (i <= nowStageIdx || allComplete) ? [] : util.DisplayUtil.darkFilter;
                let isEnd = i == (this._stageArr.length - 1);
                this._stageArr[i].imgLock.visible = isEnd && !this.checkFinalStageUnlock();
            }
            let circleIdx = nowStageIdx * 2 - 1;
            for (let i = 0; i < this._circleArr.length; i++) {
                this._circleArr[i].skin = (i <= circleIdx || allComplete) ? 'operaSide/yuan1.png' : 'operaSide/yuan2.png'
            }
        }

        /**更新区域解锁状态 */
        private updateLockArea() {
            let nowArea = clientCore.OperaSideManager.instance.currArea;
            let nextAreaInfo = xls.get(xls.dramaArea).get(Math.min(4, nowArea + 1));
            for (let i = 1; i <= 3; i++) {
                this['imgCloud_' + i].visible = i >= nowArea;
            }
            this.boxNotOpen.visible = nowArea < 4;
            if (this.boxNotOpen.visible) {
                let nextBox = this['imgCloud_' + (nextAreaInfo.id - 1)];
                this.boxNotOpen.pos(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2, true);
                let time = Math.max(0, util.TimeUtil.formatTimeStrToSec(nextAreaInfo.openTime) - clientCore.ServerManager.curServerTime)
                this.txtNotOpen.text = `上一区域进度完成\n备战倒计时：${util.StringUtils.getDateStr(time)}`;
                Laya.timer.loop(1000, this, this.updateLockArea);
            }
            else {
                Laya.timer.clear(this, this.updateLockArea);
            }
        }

        private updateView() {
            if (this._closed)
                return;
            this.onItemChange();
            this.updateStage();
            this.updateLockArea();
            let nowPoint = clientCore.OperaSideManager.instance.progressNum;
            let totalPoint = this.currTotalPoint;
            this.imgProgress.width = Math.min(1, nowPoint / totalPoint) * 412;
            this.txtProgress.text = nowPoint + '/' + totalPoint;
            this.txtFightNum.text = `今日战斗次数：${clientCore.OperaSideManager.instance.restFightTimes}/3`;
        }

        private get currTotalPoint() {
            let nowArea = clientCore.OperaSideManager.instance.currArea;
            let nowAreaInfo = xls.get(xls.dramaArea).get(nowArea);
            let side = Math.max(0, clientCore.OperaManager.instance.side - 1);
            let totalPoint = channel.ChannelControl.ins.isOfficial ? nowAreaInfo.officialTarget[side].v2 : nowAreaInfo.channelTarget[side].v2;
            return totalPoint;
        }

        private async onStageClick(idx: number) {
            if (idx > clientCore.OperaSideManager.instance.nowStageIdx) {
                alert.showFWords('请先完成前面的关卡')
                return;
            }
            let mapInfo = this._mapInfoArr[idx];
            let routeId = mapInfo.nodes[OperaManager.instance.side - 1];
            let routeInfo = xls.get(xls.dramaRoute).get(routeId);
            let eventType = routeInfo.event.v1;
            let eventId = routeInfo.event.v2;
            //如果是战斗关卡，判断战斗次数是否充足
            if (eventType == 4 && clientCore.OperaSideManager.instance.fightTimes >= clientCore.OperaSideManager.instance.totalFightTimes) {
                alert.showFWords('可用战斗次数不足');
                return
            }
            //之前通过的关卡，可以重复玩
            if (idx < clientCore.OperaSideManager.instance.nowStageIdx) {
                this.handleBeforeStage(eventType, eventId);
            }
            else {
                //判断区域是否解锁
                if (!this.checkAreaOk(mapInfo)) {
                    return;
                }
                //如果是需要消耗的关卡 还需要弹出消耗面板
                if (this.checkNeedCostByMapInfo(mapInfo)) {
                    this.openPlotPanel(mapInfo).then(() => {
                        OperaManager.instance.actionCurrRoute();
                    }).catch(() => { })
                }
                else {
                    OperaManager.instance.actionCurrRoute();
                }
            }
        }

        private checkAreaOk(mapInfo: xls.dramaMap) {
            if (mapInfo.area == 5) {
                //如果是最后一关，需要判断区域4满捐献才能开
                if (!this.checkFinalStageUnlock()) {
                    alert.showFWords('完成当前军需目标后可开启结局');
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                //普通关，判断阵营是否解锁
                return mapInfo.area <= OperaSideManager.instance.currArea;
            }
        }

        /**判断最后一关是否解锁 */
        private checkFinalStageUnlock() {
            return OperaSideManager.instance.progressNum >= this.currTotalPoint && OperaSideManager.instance.currArea == 4;
        }

        /**判断某一关是否还需要消耗 */
        private checkNeedCostByMapInfo(mapInfo: xls.dramaMap) {
            //配表中是否需要消耗
            let needCost = mapInfo.firstCost.length > 0;
            //该地图点是否已经走过（无论是哪个在阵营走过的都算）
            let haveJumped = _.filter(mapInfo.nodes, id => OperaManager.instance.checkRouteJumped(id)).length > 0;
            return needCost && !haveJumped;
        }

        /**处理之前已经通过的关卡 */
        private async handleBeforeStage(eventType: number, eventId: number) {
            if (eventType == 1) {
                //动画
                clientCore.AnimateMovieManager.setParam({ selectArr: [], forceSkipOpt: 1 ,bgAlpha: 1})
                clientCore.AnimateMovieManager.showAnimateMovie(eventId, null, null);
            }
            else if (eventType == 4) {
                //进战斗
                this.openFightPanel(eventId, true);
            }
        }

        private openFightPanel(fightStageId: number, canSweep: boolean = false) {
            this._fightPanel = this._fightPanel || new OperaFightPanel();
            let rewardIdx = this._fightStageIdArr.indexOf(fightStageId)
            this._fightPanel.on(Laya.Event.CLOSE, this, this.updateView);
            this._fightPanel.show(fightStageId, clientCore.OperaSideManager.instance.getSweepRewardByIdx(rewardIdx), canSweep);
        }

        private openPlotPanel(info: xls.dramaMap): Promise<boolean> {
            this._plotPanel = this._plotPanel || new OperaPlotPanel();
            this._plotPanel.show(info);
            return new Promise((ok, rej) => {
                this._plotPanel.on(Laya.Event.COMPLETE, this, (flag) => {
                    if (flag == 'yes')
                        ok();
                    else
                        rej();
                })
            })
        }

        private onSubmit() {
            this.destroy();
            clientCore.ModuleManager.open('operaSide.OperaSubmitModule')
        }

        private onFinal() {
            if (OperaManager.timeToFinalFight == 0) {
                this.needOpenMod = 'operaSide.OperaFightModule';
                this.needOpenData = true;
                this.destroy();
            }
            else {
                alert.showFWords('10月8日开启活动')
            }
        }

        private onClose() {
            this.needOpenMod = 'operaDrama.OperaDramaModule'
            this.destroy();
        }

        private onItemChange() {
            this.txtNum.text = clientCore.ItemsInfo.getItemName(FEATHER_ID) + '：' + clientCore.ItemsInfo.getItemNum(FEATHER_ID).toString();
        }

        private onBuyFightTimes() {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID])
            clientCore.UIManager.showCoinBox();
            clientCore.OperaSideManager.instance.buyFightTimes().then(() => {
                clientCore.UIManager.releaseCoinBox();
                this.updateView();
            })
        }

        private onDetail() {
            alert.showRuleByID(1072);
        }

        private onLimit() {
            this._suitPrevPanel = this._suitPrevPanel || new OperaSuitPrevPanel();
            this._suitPrevPanel.show();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.onSubmit);
            BC.addEvent(this, this.btnFinal, Laya.Event.CLICK, this, this.onFinal);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.onBuyFightTimes);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnLimit, Laya.Event.CLICK, this, this.onLimit);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.onItemChange);
            BC.addEvent(this, EventManager, globalEvent.MID_OPERA_PROGRESS_UPDATE, this, this.updateView);
            BC.addEvent(this, EventManager, globalEvent.MID_OPERA_ENTERFIGHT, this, this.openFightPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.updateLockArea);
        }

        destroy() {
            this._plotPanel?.destroy();
            this._fightPanel?.destroy();
            this._suitPrevPanel?.destroy();
            this._suitPrevPanel = this._fightPanel = this._plotPanel = null;
            clientCore.ToolTip.removeTips(this.imgLeaf);
            clientCore.UIManager.releaseCoinBox();
            for (const iterator of this._circleArr) {
                iterator?.destroy();
            }
            super.destroy();
        }
    }
}