namespace adventure {
    enum PANEL {
        /**主线 */
        MAIN = 0,
        /**秘闻录 */
        MIWENLU = 2
    }
    import AdvManager = clientCore.AdventureManager;
    import Money = clientCore.MoneyManager;
    /**打开fightInfo面板 参数StageInfo */
    export const EV_OPEN_FIGHT_INFO_PANEL = 'EV_OPEN_FIGHT_INFO_PANEL';

    /**
     * 冒险面板
     * 打开参数 
     * 参数格式 下面2种取一
     * 1.数组 
     *  第一位：StageInfo  
     *  第二位 是否直接打开FightInfo
     * 
     * 2.数字(chapterBase表中activity字段)
     *  0 主线
     *  2 秘闻录
     * 
     * 若无参数 默认打开最新一关主线
     */
    export class AdventureModule extends ui.adventure.AdventureModuleUI {
        private _curPanel: PANEL;
        private _mainPanel: AdvMainPanel;
        private _mwlPanel: AdvMwlPanel;
        //参数：章节id
        init(d: any) {
            super.init(d);
            clientCore.UIManager.setMoneyIds([0, Money.FAIRY_BEAN_MONEY_ID, Money.LEAF_MONEY_ID, Money.HEALTH_ID])
            clientCore.UIManager.showCoinBox();
            this.handleSystemOpen();
            this.addPreLoad(res.load('atlas/actDungeon.atlas'));
            this.addPreLoad(AdvManager.instance.loadXml())
            this._mainPanel = new AdvMainPanel(this.mainPanel);
            this._mwlPanel = new AdvMwlPanel(this.mainMwl);
        }

        initOver() {
            this.initPanelByData();
        }

        popupOver() {
            // if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "adventureModuleOpen") {
            //     EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            // }
        }

        private async initPanelByData() {
            if (this._data) {
                // 有参数
                if (this._data instanceof Array) {
                    let stage: clientCore.StageInfo = this._data[0];
                    let needOpenFight: boolean = this._data[1];
                    let isMWL = AdvManager.checkIsMWLChapter(stage.chatperId);//是否为秘闻录
                    //这里的needOpenFight处理不太一样 mwlPanel里面有异步还要先弹出一个detail面板 所以吧fightInfo的打开放到mwlPanel里面去了
                    if (isMWL)
                        this._mwlPanel.init(stage, needOpenFight);
                    else {
                        this._mainPanel.init(stage.chatperId, needOpenFight);
                    }
                    await this.onPanelChange(isMWL ? PANEL.MIWENLU : PANEL.MAIN);
                }
                else {
                    this._mainPanel.init();
                    this._mwlPanel.init();
                    await this.onPanelChange(this._data);
                }
            }
            else {
                //无参数默认打开主线剧情
                this._mainPanel.init();
                await this.onPanelChange(PANEL.MAIN);
            }
        }

        private async onPanelChange(p: PANEL) {
            if (this._curPanel != p) {
                this.mainPanel.visible = p == PANEL.MAIN;
                this.mainMwl.visible = p == PANEL.MIWENLU;
                this.clip_main.index = p == PANEL.MAIN ? 0 : 1;
                this.clip_act.index = p == PANEL.MIWENLU ? 1 : 0;
                if (p == PANEL.MAIN)
                    await this._mainPanel.show()
                if (p == PANEL.MIWENLU)
                    await this._mwlPanel.show()
                this._curPanel = p;
            }
        }

        private onStageClick(stage: clientCore.StageInfo) {
            //体力限制
            let diff: number = stage.xlsData.vim - clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.HEALTH_ID);
            if (diff > 0 && stage.state == clientCore.STAGE_STATU.NO_COMPLETE) {
                alert.alertQuickBuy(clientCore.MoneyManager.HEALTH_ID, diff, true);
                return;
            }

            switch (stage.state) {
                case clientCore.STAGE_STATU.NO_COMPLETE:
                    if (stage.type == clientCore.STAGE_TYPE.NORMAL || stage.type == clientCore.STAGE_TYPE.BOSS) { //前往战斗
                        this.openFightInfo(stage);
                    } else {
                        if (stage.type == clientCore.STAGE_TYPE.GAME) {
                            this.needOpenData = this.needOpenMod = null;
                            this.destroy();
                        }
                        AdvManager.instance.gotoStage(stage);
                    }
                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelectMission") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }
                    break;
                case clientCore.STAGE_STATU.COMPLETE:
                    AdvManager.instance.getReward(stage);
                    break;
                case clientCore.STAGE_STATU.REWARDED:
                    break;
                default:
                    break;
            }
        }

        private async openFightInfo(stage: clientCore.StageInfo): Promise<void> {
            let mod = await clientCore.ModuleManager.open('fightInfo.FightInfoModule', stage);
            BC.addEvent(this, mod, Laya.Event.CLOSE, this, this.onFightInfoClose);
            BC.addEvent(this, mod, Laya.Event.CHANGED, this, this.onInfoChange);//秘闻录挑战时 扫荡可能导致次数限制变动
            BC.addEvent(this, mod, Laya.Event.ENTER, this, this.onEnterFight, [stage]);
        }

        private onEnterFight(stage: clientCore.StageInfo) {
            clientCore.AdventureManager.instance.gotoStage(stage);
        }

        private onInfoChange() {
            this._mwlPanel.updateView();
        }

        private onFightInfoClose() {
            clientCore.UIManager.showCoinBox();
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.oncloseClick);
            BC.addEvent(this, this.clip_main, Laya.Event.CLICK, this, this.onPanelChange, [PANEL.MAIN]);
            BC.addEvent(this, this.clip_act, Laya.Event.CLICK, this, this.onPanelChange, [PANEL.MIWENLU]);
            EventManager.on(EV_CLICK_STAGE, this, this.onStageClick);
            EventManager.on(EV_CLOSE_ADV_MODULE, this, this.destroy);
            EventManager.on(globalEvent.SYSTEM_OPEN_CHANGED, this, this.handleSystemOpen);

            BC.addEvent(this, EventManager, "CLOSE_ADVENTURE", this, this.destroy);
            BC.addEvent(this, EventManager, EV_OPEN_FIGHT_INFO_PANEL, this, this.openFightInfo);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }

        private handleSystemOpen() {
            let open = clientCore.SystemOpenManager.ins.getIsOpen(22);
            this.lockMwl.visible = !open;
            this.clip_act.mouseEnabled = open;
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "adventureModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName == "mission1_1") {
                    var obj: any;
                    obj = this._mainPanel.getMissionObj(0);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);

                }
                else if (objName == "mission1_2") {
                    var obj: any;
                    obj = this._mainPanel.getMissionObj(1);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName == "mission1_3") {
                    var obj: any;
                    obj = this._mainPanel.getMissionObj(2);
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        removeEventListeners() {
            EventManager.off(EV_CLICK_STAGE, this, this.onStageClick);
            EventManager.off(EV_CLOSE_ADV_MODULE, this, this.destroy);
            EventManager.off(globalEvent.SYSTEM_OPEN_CHANGED, this, this.handleSystemOpen);
            BC.removeEvent(this);
        }
        oncloseClick() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAdventureCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            this.destroy();
        }
        destroy() {
            super.destroy();
            this.mainPanel && this._mainPanel.destory();
            this._mwlPanel && this._mwlPanel.destory();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}
