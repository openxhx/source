namespace godMirror {
    enum VIEW_TYPE {
        ALL,
        FRIEND
    }

    const REQ_TIME = 1000;

    /**
     * 花神之镜主面板
     * godMirror.GodMirrorModule
     */
    export class GodMirrorModule extends ui.godMirror.GodMirrorModuleUI {
        private _currPage: number[];
        private _totalLen: number[];
        private _viewType: VIEW_TYPE;
        private _lastReqTime: number = 0;
        private _currShowInfoArr: pb.IMirrorRankInfo[];

        private _upPanel: GodMirrorUpPanel;
        private _myViewPanel: GodMirrorMyViewPanel;
        private _achievePanel: GodMirrorAchievePanel;
        private _boardPanel: GodMirrorBoardCastPanel;

        init(d: any) {
            super.init(d);
            this._currPage = [0, 0];
            this._totalLen = [3, 3];
            this.btnLeft.visible = false;
            this.btnNext.visible = false;
            for (let i = 0; i < 3; i++) {
                this['mc_' + i].visible = false;
                sortLayer(this['mc_' + i], { bg: this.bg, person: this.person, up: this.up });
            }
            this.addPreLoad(xls.load(xls.godMirror));
            this.addPreLoad(xls.load(xls.godMirrorReward));
            this.addPreLoad(GodMirrorModel.refreshTimeInfo())
            this.addPreLoad(GodMirrorModel.refreshSelfView())
            this.txtNow.restrict = '0-9';
            this.drawCallOptimize = true;
            this._viewType = VIEW_TYPE.ALL;
        }

        onPreloadOver() {
            GodMirrorModel.readConfig();
            this.showViewType();
            this.refreshUploadState();
            this.onTimer();
            Laya.timer.loop(1000, this, this.onTimer);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '打开活动面板');
        }

        popupOver() {
            // TODO 官服数据被清除 暂时关闭
            // if(channel.ChannelControl.ins.isOfficial){
            //     alert.showSmall('功能维护中，开放时间请留意游戏公告！',{
            //         callBack: {
            //             caller: this,
            //             funArr: [this.destroy]
            //         },
            //         btnType: alert.Btn_Type.ONLY_SURE,
            //         clickMaskClose: false,
            //         needClose: false
            //     });
            //     return;
            // }

            if (this._data) {
                this.onUpClick();
            }
        }

        private onDetail() {
            alert.showRuleByID(1058);
        }

        private showViewType() {
            this.onPageChange(0, true);
            this.imgTab.skin = this._viewType == VIEW_TYPE.ALL ? 'godMirror/quanfu_pai_ming.png' : 'godMirror/hao_you_pai_ming.png'
        }

        private onJump() {
            if (this._currPage[this._viewType] == parseInt(this.txtNow.text) - 1) return;
            this._currPage[this._viewType] = parseInt(this.txtNow.text) - 1;
            this.reqListInfo();
        }

        private onPageChange(diff: number, force: boolean = false) {
            let page = this._currPage[this._viewType];
            page = _.clamp(page + diff, 0, this._totalLen[this._viewType]);
            if (page != this._currPage[this._viewType] || force) {
                this._currPage[this._viewType] = page;
                this.reqListInfo();
            }
        }

        /**刷新当前页数据 */
        private async reqListInfo() {
            if (this.destroyed)
                return;
            let now = clientCore.ServerManager.curServerTime * 1000;
            let passTime = now - this._lastReqTime;
            if (passTime < REQ_TIME) {
                clientCore.LoadingManager.showSmall();
                await util.TimeUtil.awaitTime(REQ_TIME - passTime);
            }
            if (this.destroyed) {
                clientCore.LoadingManager.hideSmall(true);
                return;
            }
            let start = this._currPage[this._viewType] * 3;
            let end = start + 2;
            let proto = this._viewType == VIEW_TYPE.ALL ? new pb.cs_get_flora_of_mirror_ranking_info({ start: start, end: end, flag: 1 }) : new pb.cs_get_friend_mirror_ranking_info({ start: start, end: end, flag: 1 })
            net.sendAndWait(proto).then((data: pb.sc_get_flora_of_mirror_ranking_info | pb.sc_get_friend_mirror_ranking_info) => {
                if (this.destroyed) {
                    clientCore.LoadingManager.hideSmall(true);
                    return;
                }
                this._lastReqTime = now;
                //特殊处理前3名的情况
                let idxArr = start == 0 ? [1, 0, 2] : [0, 1, 2];
                for (let i = 0; i < 3; i++) {
                    let idx = idxArr[i];
                    setGodMirrorRender(this['mc_' + idx], data.info[i], i);
                }
                if (start == 0) {
                    this._currShowInfoArr = [data.info[1], data.info[0], data.info[2]]
                }
                else {
                    this._currShowInfoArr = data.info;
                }
                this._totalLen[this._viewType] = data.length;
                this.updagePage()
                clientCore.LoadingManager.hideSmall(true);
            })
        }

        private setRankVisible(b: boolean) {
            this.bg.visible = this.up.visible = this.person.visible = b;
        }

        private updagePage() {
            let page = this._currPage[this._viewType] + 1;
            let total = Math.ceil(this._totalLen[this._viewType] / 3);
            this.txtPage.text = page + '/' + Math.max(page, total);
            this.txtNow.text = page.toString();
            this.btnLeft.visible = page > 1;
            this.btnNext.visible = page < total;
        }

        private async onRightBtnClick(idx: number) {
            this._currShowInfoArr[idx] = await GodMirrorModel.likeOrGetReward(this._currShowInfoArr[idx]);
            setGodMirrorRender(this['mc_' + idx], this._currShowInfoArr[idx], idx);
        }

        private async onLeftBtnClick(idx: number) {
            this._currShowInfoArr[idx] = await GodMirrorModel.getSupport(this._currShowInfoArr[idx]);
            setGodMirrorRender(this['mc_' + idx], this._currShowInfoArr[idx], idx);
        }

        private onChangeViewType() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击好友排行按钮');
            this._viewType = this._viewType == VIEW_TYPE.ALL ? VIEW_TYPE.FRIEND : VIEW_TYPE.ALL;
            this.showViewType();
        }

        private onTxtChanged() {
            if (this.txtNow.text == '')
                this.txtNow.text = '1';
            let total = Math.ceil(this._totalLen[this._viewType] / 3);
            this.txtNow.text = _.clamp(parseInt(this.txtNow.text), 1, total).toString();
        }

        private refreshUploadState() {
            this.imgNo.visible = (GodMirrorModel.leftUpTime + GodMirrorModel.rightUpTime) == 0;
        }

        private onPanelClose() {
            this.setRankVisible(true);
            this.refreshUploadState();
            this.reqListInfo();
        }

        private onUpClick() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击我要上镜按钮');
            if (clientCore.FlowerPetInfo.petType == 3) {
                let panel = this._upPanel || new GodMirrorUpPanel();
                this.setRankVisible(false);
                panel.open();
                panel.on(Laya.Event.CLOSE, this, this.onPanelClose);
            }
            else {
                alert.showSmall('只有闪耀花宝才能上传形象。是否立即前往开通？', {
                    callBack: {
                        caller: this, funArr: [
                            this.goPet
                        ]
                    }
                })
            }
        }

        private goPet() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击成为年费会员按钮');
            clientCore.ToolTip.gotoMod(52);
        }

        private async onMyView() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击我的形象按钮');
            let now = clientCore.ServerManager.curServerTime * 1000;
            let passTime = now - this._lastReqTime;
            if (passTime < REQ_TIME) {
                clientCore.LoadingManager.showSmall();
                await util.TimeUtil.awaitTime(REQ_TIME - passTime);
            }
            if (this.destroyed)
                return;
            await GodMirrorModel.refreshSelfView();
            clientCore.LoadingManager.hideSmall(true);
            this._myViewPanel = this._myViewPanel || new GodMirrorMyViewPanel();
            this._myViewPanel.show()
            this.setRankVisible(false);
            this._myViewPanel.once(Laya.Event.OPEN, this, this.onUpClick);
            this._myViewPanel.on(Laya.Event.CLOSE, this, this.onPanelClose);
            this._myViewPanel.on(Laya.Event.COMPLETE, this, this.openBoardCast);
        }

        private openBoardCast(type: number) {
            this._boardPanel = this._boardPanel || new GodMirrorBoardCastPanel();
            this._boardPanel.show(type);
        }

        private onTimer() {
            let uploadCd = GodMirrorModel.uploadCd;
            this.txtCd.visible = this.imgTimeBg.visible = uploadCd > 0;
            this.btnUp.disabled = uploadCd > 0;
            if (GodMirrorModel.uploadCd) {
                this.txtCd.text = util.StringUtils.getDateStr(uploadCd);
            }
        }

        private onAchieve() {
            this._achievePanel = this._achievePanel || new GodMirrorAchievePanel();
            this._achievePanel.show();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetai, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnJump, Laya.Event.CLICK, this, this.onJump);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onChangeViewType);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.onPageChange, [1]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onPageChange, [-1]);
            BC.addEvent(this, this.txtNow, Laya.Event.INPUT, this, this.onTxtChanged);
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.onUpClick);
            BC.addEvent(this, this.btnMy, Laya.Event.CLICK, this, this.onMyView);
            BC.addEvent(this, this.btnVip, Laya.Event.CLICK, this, this.goPet);
            BC.addEvent(this, this.btnAchieve, Laya.Event.CLICK, this, this.onAchieve);
            for (let i = 0; i < 3; i++) {
                let mc = this['mc_' + i] as ui.godMirror.render.GodMirrorShowTopRenderUI;
                BC.addEvent(this, mc.btnLeft, Laya.Event.CLICK, this, this.onLeftBtnClick, [i]);
                BC.addEvent(this, mc.btnRight, Laya.Event.CLICK, this, this.onRightBtnClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            clientCore.LoadingManager.hideSmall(true);
            for (let i = 0; i < 3; i++) {
                destoryRender(this['mc_' + i]);
            }
            this._myViewPanel?.destroy();
            this._myViewPanel = null;
            this._upPanel?.destroy();
            this._upPanel = null;
            this._boardPanel?.destroy();
            this._boardPanel = null;
            this._achievePanel?.destroy();
            this._achievePanel = null;
            this._currShowInfoArr = [];
            GodMirrorModel.destory();
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}