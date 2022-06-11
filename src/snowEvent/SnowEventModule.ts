namespace snowEvent {
    enum EventEnum {
        SQUIRREL = 1,//帮助松鼠捡松果
        SNOWFLAKE,//旋转雪花
        TREASUREBOX,//神秘宝箱
        MYSTERIOUSMAP,//神秘地图
    }
    /**
     * 主活动：觅雪寻冬地图触发事件
     * snowEvent.SnowEventModule
     * 策划案：\\files\incoming\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\1211\主活动觅雪寻冬最新_connie.xlsx
     */
    export class SnowEventModule extends core.BaseModule {
        private _panel: core.BaseModule & ISnowEventPanel;
        private _gameData: pb.Isnow_panel;
        private _idx: number;
        init(d: any): void {
            this._gameData = d.data;
            this._idx = d.idx;
        }

        async onPreloadOver() {
            this.initView();
        }

        initView(): void {
            switch (this._gameData.type) {
                case EventEnum.SQUIRREL:
                    this._panel = new SquirrelPanel();
                    break;
                case EventEnum.SNOWFLAKE:
                    this._panel = new SnowflakePanel();
                    break;
                case EventEnum.TREASUREBOX:
                    this._panel = new TreasureBoxPanel();
                    break;
                case EventEnum.MYSTERIOUSMAP:
                    this._panel = new MysteriousMapPanel();
                    break;
                default:
                    break;
            }
            this.setupPanel();
            this._panel.init(this._gameData);
            this.addChild(this._panel)
        }

        private setupPanel() {
            this._panel.addEventListeners();
            this._panel.btnClose.once(Laya.Event.CLICK, this, this.destroy);
            this._panel.btnGive.once(Laya.Event.CLICK, this, this.onReward);
            this._panel.sweepHanlder = new Laya.Handler(this, this.onSweep);
            this.updatePanel();
        }

        private updatePanel() {
            this._panel.boxGame.visible = this._gameData.res == 0;
            this._panel.boxAward.visible = this._gameData.res == 1;
        }

        /**完成交互 */
        private onSweep() {
            net.sendAndWait(new pb.cs_sweep_the_snow_deal({ index: this._idx })).then((msg: pb.sc_sweep_the_snow_deal) => {
                this._gameData.res = 1;
                this.updatePanel();
            });
        }

        /**点击领取奖励 */
        private onReward() {
            let items = this._gameData.items;
            net.sendAndWait(new pb.cs_sweep_the_snow_get_reward({ index: this._idx })).then((data: pb.sc_sweep_the_snow_get_reward) => {
                this._gameData.res = 2;
                alert.showReward(items, '', { callBack: { caller: this, funArr: [this.destroy] } })
            })
        }

        destroy(): void {
            this.event(Laya.Event.COMPLETE, this._gameData);
            this._panel?.destroy();
            this._panel = null;
            super.destroy();
        }
    }
}