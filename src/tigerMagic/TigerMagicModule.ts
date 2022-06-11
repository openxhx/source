namespace tigerMagic {
    /**
     * 布老虎魔法
     * tigerMagic.TigerMagicModule
     */
    export class TigerMagicModule extends ui.tigerMagic.TigerMagicModuleUI {

        private tipPanel: TigerTipPanel;
        private flag: number;
        private exchangePanel: ClothExchangePanel;

        constructor() {
            super();
        }

        init(d: any) {
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.TIGER_TIP_OPEN]).then((msg: pb.ICommonData[]) => {
                this.flag = msg[0].value;
            }));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(net.sendAndWait(new pb.cs_show_clothing_score()).then((msg: pb.sc_show_clothing_score) => {
                this.numTxt1.text = msg.num + "";
            }));
            this.numTxt0.text = ":" + clientCore.ItemsInfo.getItemNum(300155) + "";
            clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '打开主活动面板');
        }

        onPreloadOver() {

        }

        async changePanel(i: number) {
            switch (i) {
                case 0:
                    clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '点击第一块内容');
                    this.destroy();
                    clientCore.ModuleManager.open("playground.PlaygroundModule");
                    break;
                case 1:
                    clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '点击第二块内容');
                    if (!this.tipPanel) {
                        await res.load(`atlas//tigerMagic/panel.atlas`, Laya.Loader.ATLAS);
                        this.tipPanel = new TigerTipPanel();
                    }
                    this.tipPanel.setData(0);
                    clientCore.DialogMgr.ins.open(this.tipPanel);
                    if (this.flag == 0) {
                        clientCore.MedalManager.setMedal([{ id: MedalConst.TIGER_TIP_OPEN, value: 1 }]);
                        this.flag = 1;
                    }
                    break;
                case 2:
                    clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '点击第三块内容');
                    this.destroy();
                    clientCore.ModuleManager.open("christmasShow.ChristmasShowModule");
                    break;
                case 3:
                    this.destroy();
                    clientCore.ModuleManager.open("onsenRyokan.OnsenRyokanModule");
                    break;
                case 4:
                    this.destroy();
                    clientCore.ModuleManager.open("saveFaery.SaveFaeryModule");
                    break;
            }
        }

        //兑换材料
        private async onExchange() {
            clientCore.Logger.sendLog('2021年1月14日活动', '【主活动】', '点击兑换服装');
            if (!this.exchangePanel) {
                clientCore.LoadingManager.showSmall();
                await res.load("atlas/tigerMagic/ExchangePanel.atlas", Laya.Loader.ATLAS);
                await res.load("unpack/tigerMagic/ExchangePanel/bg1.png");
                await res.load(`unpack/tigerMagic/ExchangePanel/2110578_${clientCore.LocalInfo.sex}.png`);
                clientCore.LoadingManager.hideSmall();
                this.exchangePanel = new ClothExchangePanel();
                this.exchangePanel.init({ suitId: 2110578, startId: 3077, endId: 3089, iconId: 9900291 });
            }
            clientCore.DialogMgr.ins.open(this.exchangePanel);
        }

        private TipShow(e: Laya.Event) {
            clientCore.ToolTip.showTips(e.target, { id: 300155 });
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1232);
        }

        addEventListeners() {
            for (let i: number = 0; i < 3; i++) {
                BC.addEvent(this, this["goBtn" + i], Laya.Event.CLICK, this, this.changePanel, [i]);
            }
            BC.addEvent(this, this.btnOther0, Laya.Event.CLICK, this, this.changePanel, [3]);
            BC.addEvent(this, this.btnOther1, Laya.Event.CLICK, this, this.changePanel, [4]);
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.exchangeBtn, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.addBtn, Laya.Event.CLICK, this, this.TipShow);
            BC.addEvent(this, this.ruleBtn, Laya.Event.CLICK, this, this.showHelp);
            EventManager.on("DESTROY_TIGER", this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("DESTROY_TIGER", this, this.destroy);
        }

        destroy() {
            this.tipPanel?.destroy();
            this.tipPanel = null;
            this.exchangePanel?.destroy();
            this.exchangePanel = null;
            super.destroy();
        }
    }
}