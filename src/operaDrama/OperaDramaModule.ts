
namespace operaDrama {
    import OperaManager = clientCore.OperaManager;
    enum PANEL_TYPE {
        MAIN,
        RECALL,
        END,
        HOT,
        WAIT,
        INTRO,
        TALK,
        DRAW
    }

    const CAST_OFFCIAL = ['苏丸', '喵叔', '霓烁烁丶'];
    const CAST_UNOFFCIAL = ['小豆豆嗷', '潦草', '酒小九'];

    /**
     * 中秋话剧主模块
     * operaDrama.OperaDramaModule
     */
    export class OperaDramaModule extends ui.operaDrama.OperaDramaModuleUI {
        private _panelType: PANEL_TYPE;
        private _panelHash: util.HashMap<Laya.Sprite>;
        private _starAni: clientCore.Bone;
        private _startPanel: OperaStartPanel;

        init(d: any) {
            this.addPreLoad(OperaManager.instance.loadConfig());
            this.addPreLoad(OperaManager.instance.reqDramaInfo());
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(clientCore.ModuleManager.loadatlas('operaDrama/aftertalk'));
            this._panelHash = new util.HashMap();
            this._starAni = clientCore.BoneMgr.ins.play('res/animate/opera/stars.sk', 0, true, this.mainPanel, { addChildAtIndex: 0 });
            this._starAni.pos(600, 400);
            core.SoundManager.instance.playBgm('res/music/bgm/operaMain.mp3', true);
            this.mainPanel.txtCast.text = '领衔主演：伊紫\n主演：' + (channel.ChannelControl.ins.isOfficial ? CAST_OFFCIAL.join('，') : CAST_UNOFFCIAL.join('，'));

        }

        onPreloadOver() {
            //结局解锁
            let haveEnd = _.filter([1, 2, 3], id => clientCore.OperaManager.instance.checkHaveEndByRoleId(id)).length > 0;
            this.mainPanel.btnRecall.disabled = !haveEnd;
            this.mainPanel.imgLockRecall.visible = !haveEnd;
            //星星数量
            this.txtTimes.text = OperaManager.instance.remainTime.toString();
            let time = clientCore.OperaManager.timeToOperaStart();
            this._panelType = time > 0 ? PANEL_TYPE.WAIT : PANEL_TYPE.MAIN;
            this.showPanelType(false);
            if (time != 0) {
                this.onTimer();
                Laya.timer.loop(1000, this, this.onTimer);
            }
            clientCore.Logger.sendLog('2020年9月30日活动', '【主活动】中秋话剧面板和剧情', '打开游戏面板');
        }

        private onTimer() {
            let time = clientCore.OperaManager.timeToOperaStart();
            if (time == 0) {
                Laya.timer.clear(this, this.onTimer);
                this.changePanel(PANEL_TYPE.MAIN);
            }
        }

        private async showPanelType(needAni: boolean = true) {
            this.btnClose.skin = this.isMainView ? 'commonBtn/btn_l_y_home.png' : 'commonBtn/btn_l_y_back.png'
            this.mainPanel.visible = this._panelType == PANEL_TYPE.MAIN
            this.spCon.removeChildren();
            this.boxTitle.visible = this._panelType != PANEL_TYPE.WAIT && this._panelType != PANEL_TYPE.MAIN && this._panelType != PANEL_TYPE.DRAW;
            this.mainPanel.mouseEnabled = false;
            await this.playAni(needAni);
            this.boxTimes.visible = this._panelType == PANEL_TYPE.MAIN;
            this.mainPanel.mouseEnabled = true;
            if (this._panelType != PANEL_TYPE.MAIN) {
                let panel = this.createPanel(this._panelType);
                panel.show();
                panel.alpha = 0;
                Laya.Tween.to(panel, { alpha: 1 }, 150)
                this.spCon.addChild(panel);
            }
            if (this._panelType == PANEL_TYPE.DRAW) {
                clientCore.UIManager.setMoneyIds([9900075]);
                clientCore.UIManager.showCoinBox();
            }
            else {
                clientCore.UIManager.releaseCoinBox();
            }
            switch (this._panelType) {
                case PANEL_TYPE.RECALL:
                    this.imgTitle.skin = 'operaDrama/juqinghuigu.png';
                    break;
                case PANEL_TYPE.END:
                    this.imgTitle.skin = 'operaDrama/jiejushouji.png';
                    break;
                case PANEL_TYPE.INTRO:
                    this.imgTitle.skin = 'operaDrama/renwujieshao.png';
                    break;
                case PANEL_TYPE.TALK:
                    this.imgTitle.skin = 'operaDrama/hou_ri_tan.png';
                    break;
                default:
                    break;
            }
        }

        private playAni(needAni: boolean) {
            if (!needAni) {
                this.ani1.gotoAndStop(this._panelType != PANEL_TYPE.MAIN ? 0 : this.ani1['_count']);
                return Promise.resolve();
            }
            return new Promise((ok) => {
                this.ani1.wrapMode = this._panelType == PANEL_TYPE.MAIN ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
                this.ani1.play(0, false);
                this.ani1.on(Laya.Event.COMPLETE, this, ok)
            })
        }

        private createPanel(type: PANEL_TYPE) {
            if (this._panelHash.has(this._panelType)) {
                return this._panelHash.get(this._panelType);
            }
            let panel: any;
            switch (type) {
                case PANEL_TYPE.END:
                    panel = new OperaEndPanel();
                    break;
                case PANEL_TYPE.RECALL:
                    panel = new OperaRecallPanel();
                    break;
                case PANEL_TYPE.WAIT:
                    panel = new OperaWaitPanel();
                    break;
                case PANEL_TYPE.HOT:
                    panel = new OperaHotRwdPanel();
                    break;
                case PANEL_TYPE.INTRO:
                    panel = new OperaIntroPanel();
                    break;
                case PANEL_TYPE.DRAW:
                    panel = new OperaDrawPanel();
                    break;
                case PANEL_TYPE.TALK:
                    panel = new OperaAfterTalkPanel();
                    break;
                default:
                    break;
            }
            return panel;
        }

        private openHotReward() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【主活动】中秋话剧面板和剧情', '打开观看奖励面板');
            let panel = this.createPanel(PANEL_TYPE.HOT);
            panel.show();
            this.spCon.addChild(panel);
        }

        private onClose() {
            if (this.isMainView) {
                this.destroy();
            }
            else {
                this._panelType = PANEL_TYPE.MAIN;
                this.showPanelType();
            }
        }

        private get isMainView() {
            return this._panelType == PANEL_TYPE.MAIN || this._panelType == PANEL_TYPE.WAIT;
        }

        private changePanel(type: PANEL_TYPE) {
            if (type != this._panelType) {
                this._panelType = type;
                this.showPanelType();
            }
        }

        private onGo() {
            //如果当前不是初始节点或者真结局节点，则需要话剧之星
            if (OperaManager.instance.remainTime == 0 && (OperaManager.instance.currRouteId == 1 || OperaManager.instance.currRouteId == 407)) {
                alert.showFWords('话剧之星不足，明日再来哦~');
                return;
            }
            if (clientCore.OperaManager.instance.needPlayStartAni) {
                this.playStartAni();
                return;
            }
            if (OperaManager.instance.side == 0) {
                OperaManager.instance.actionCurrRoute();
            }
            else {
                this.needOpenMod = 'operaSide.OperaMapModule'
                this.destroy();
            }
        }

        private playStartAni() {
            this._startPanel = this._startPanel || new OperaStartPanel();
            this._startPanel.show();
            this._startPanel.once(Laya.Event.CLOSE, this, this.onGo);
        }

        private onRule() {
            alert.showRuleByID(1079);
        }

        addEventListeners() {
            BC.addEvent(this, this.mainPanel.btnIntro, Laya.Event.CLICK, this, this.changePanel, [PANEL_TYPE.INTRO]);
            BC.addEvent(this, this.mainPanel.btnRecall, Laya.Event.CLICK, this, this.changePanel, [PANEL_TYPE.RECALL]);
            BC.addEvent(this, this.mainPanel.btnEnd, Laya.Event.CLICK, this, this.changePanel, [PANEL_TYPE.END]);
            BC.addEvent(this, this.mainPanel.btnDraw, Laya.Event.CLICK, this, this.changePanel, [PANEL_TYPE.DRAW]);
            BC.addEvent(this, this.mainPanel.btnTalk, Laya.Event.CLICK, this, this.changePanel, [PANEL_TYPE.TALK]);
            BC.addEvent(this, this.mainPanel.btnGo, Laya.Event.CLICK, this, this.onGo);
            BC.addEvent(this, this.mainPanel.btnReward, Laya.Event.CLICK, this, this.openHotReward);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this._starAni?.dispose();
            this._startPanel?.destroy();
            let panel = this._panelHash.getValues();
            panel.forEach((o) => {
                Laya.Tween.clearAll(panel)
                o.destroy();
            })
            super.destroy();
            if (!this.needOpenMod) {
                let mapXls = xls.get(xls.map).get(clientCore.MapInfo.mapID)
                if (mapXls)
                    core.SoundManager.instance.playBgm(pathConfig.getBgmUrl(mapXls.Bgm))
            }
        }
    }
}