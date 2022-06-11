namespace gorgeousAutumn {
    /**
     * 绚丽之秋
     * 2021.9.3
     * gorgeousAutumn.GorgeousAutumnModule
     */
    export class GorgeousAutumnModule extends ui.gorgeousAutumn.GorgeousAutumnModuleUI {
        private _model: GorgeousAutumnModel;
        /**制作颜色界面 */
        private makeColorPanel: MakeColorPanel;
        /**上色界面 */
        private dyeingPanel: DyeingPanel;

        init() {
            this.addPreLoad(xls.load(xls.colourfulautumn));
            this.addPreLoad(res.load("unpack/gorgeousAutumn/step_0.png"));
            this.addPreLoad(res.load("unpack/gorgeousAutumn/step_8.png"));
            this.addPreLoad(res.load("res/animate/activity/angesi.png"));
            this.addPreLoad(res.load("res/animate/activity/shangse.png"));
        }

        onPreloadOver() {
            this._model = GorgeousAutumnModel.instance;
            this._model.initConfig();
            this.imgSuit.skin = `gorgeousAutumn/imgSuit${this._model.sex}.png`;
            this.dyeingOver();
        }

        /**调制颜色 */
        private makeColor() {
            if (this._model.isFinish()) {
                alert.showFWords('上色已全部完成~');
                return;
            }
            if (!this.makeColorPanel) this.makeColorPanel = new MakeColorPanel();
            this.makeColorPanel.show();
        }

        /**上色完成，展示上色界面 */
        private showDyeingPanel() {
            if (!this.dyeingPanel) this.dyeingPanel = new DyeingPanel();
            this.dyeingPanel.show();
        }

        /**领取翅膀 */
        private getReward() {
            net.sendAndWait(new pb.cs_gorgeous_autumn_exchange()).then((msg: pb.sc_gorgeous_autumn_exchange) => {
                alert.showReward(msg.item);
                this.btnGet.visible = false;
            })
        }

        /**上色完成 */
        private dyeingOver() {
            this.btnGet.visible = this._model.canGetVipReward();
            this.picture.skin = `unpack/gorgeousAutumn/step_${this._model.curStep}.png`;
        }

        private showRule() {
            alert.showRuleByID(1206);
        }

        addEventListeners() {
            EventManager.on('GORGEOUS_AUTUMN_SHOW_DYEING', this, this.showDyeingPanel);
            EventManager.on('GORGEOUS_AUTUMN_DYEING_OVER', this, this.dyeingOver);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnMakeColor, Laya.Event.CLICK, this, this.makeColor);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, GorgeousAutumnModel.instance, GorgeousAutumnModel.instance.trySuit);
        }

        removeEventListeners() {
            EventManager.off('GORGEOUS_AUTUMN_SHOW_DYEING', this, this.showDyeingPanel);
            EventManager.off('GORGEOUS_AUTUMN_DYEING_OVER', this, this.dyeingOver);
            BC.removeEvent(this);
        }

        destroy() {
            this.makeColorPanel?.destroy();
            this.dyeingPanel?.destroy();
            this.makeColorPanel = this.dyeingPanel = null;
            super.destroy();
        }
    }
}