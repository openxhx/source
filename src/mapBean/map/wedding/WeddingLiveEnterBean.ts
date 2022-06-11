namespace mapBean {
    /**
     * 结缘礼准备场景bean
     */
    export class WeddingLiveEnterBean implements core.IMapBean {
        private _mainUI: ui.weddingLive.WeddingLiveEnterBeanUI;
        private _destoryed: boolean;
        private _needShow: boolean;
        async start() {
            await xls.load(xls.cpCommonDate);
            await clientCore.ModuleManager.loadatlas('weddingLive');
            await clientCore.CpManager.instance.refreshAllWeddingInfo();
            this.initUI();
        }

        private initUI() {
            if (!this._destoryed) {
                console.log('testtest')
                this._mainUI = new ui.weddingLive.WeddingLiveEnterBeanUI();
                this._mainUI.anchorX = 0.5;
                this._mainUI.x = Laya.stage.width / 2;
                this._mainUI.y = 10;
                this._mainUI.btnExit.visible = false;
                clientCore.LayerManager.uiLayer.addChild(this._mainUI);
                this.onTimer();
                Laya.timer.loop(1000, this, this.onTimer);
                BC.addEvent(this, this._mainUI.btnVisit, Laya.Event.CLICK, this, this.onVisit);
                BC.addEvent(this, this._mainUI.btnEnter, Laya.Event.CLICK, this, this.onEnter);
                BC.addEvent(this, EventManager, globalEvent.HUD_DISPLAY_CHANGE, this, this.onUIStateChange);
            }
        }

        private onUIStateChange() {
            if (this._mainUI) {
                this._mainUI.visible = this._needShow && !clientCore.UIManager.isHide();
            }
        }

        private onTimer() {
            //判断当前有没有结缘礼正在举行
            let openTime = 0;
            let nowList = clientCore.CpManager.instance.getNowWeddingList();
            nowList = _.filter(nowList, o => o.mapId == clientCore.CpManager.getWeddingMapIdByOriMapId(clientCore.MapInfo.mapID))
            openTime = nowList.length > 0 ? nowList[0].startTime : 0;
            this._needShow = false;
            if (openTime > 0) {
                let countDown = openTime - clientCore.ServerManager.curServerTime + 3600;
                if (countDown >= 0) {
                    this._needShow = true;
                    this._mainUI.txtTime.text = util.StringUtils.getDateStr2(countDown, '{min}:{sec}');
                    let selfOpenTime = clientCore.CpManager.instance.selfWeddingInfo?.weddingInfo?.startTime ?? 0;
                    let selfOpenMap = clientCore.CpManager.instance.selfWeddingInfo?.weddingInfo?.mapId ?? 0;
                    this._mainUI.btnEnter.disabled = selfOpenTime != openTime || selfOpenMap != clientCore.CpManager.getWeddingMapIdByOriMapId(clientCore.MapInfo.mapID);
                }
            }
            this._mainUI.visible = this._needShow && !clientCore.UIManager.isHide();
        }

        private onVisit() {
            clientCore.ModuleManager.open('weddingLive.WeddingLiveListModule', clientCore.CpManager.getWeddingMapIdByOriMapId(clientCore.MapInfo.mapID));
        }

        private onEnter() {
            let selfInfo = clientCore.CpManager.instance.selfWeddingInfo?.weddingInfo;
            if (selfInfo) {
                let now = clientCore.ServerManager.curServerTime;
                if (now < selfInfo.startTime + 3600) {
                    clientCore.MapManager.enterWedding(selfInfo);
                    return;
                }
            }
            alert.showFWords('不是你的结缘礼');
        }

        touch() {
        }

        redPointChange() {
        }

        destroy() {
            this._destoryed = true;
            Laya.timer.clear(this, this.onTimer);
            this._mainUI?.destroy();
        }
    }
}