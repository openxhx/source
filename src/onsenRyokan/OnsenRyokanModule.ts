namespace onsenRyokan {
    /**
     * 温泉会馆
     * 2021.3.19
     * onsenRyokan.OnsenRyokanModule
     */
    export class OnsenRyokanModule extends ui.onsenRyokan.OnsenRyokanModuleUI {
        private storyFlag: number;
        init() {
            this.ani1.play(0, true);
            this.addPreLoad(this.getBuyMedal());
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2022年1月7日活动', '【主活动】温泉会馆', '打开活动面板');
            // if (this.storyFlag == 0) {
            //     clientCore.MedalManager.setMedal([{ id: MedalConst.ONSEN_RYOKAN_OPEN, value: 1 }]);
            //     this.onRecall();
            // }
        }

        /**获取勋章情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal([MedalConst.ONSEN_RYOKAN_OPEN]);
            this.storyFlag = totalInfo[0].value;
            return Promise.resolve();
        }

        /**播放剧情 */
        private onRecall() {
            // clientCore.Logger.sendLog('2020年5月29日活动', '【主活动】与摩卡的一天', '点击剧情回顾')
            clientCore.AnimateMovieManager.showAnimateMovie(80513, null, null);
        }

        /**跳转温泉地图 */
        private goMap() {
            this.destroy();
            clientCore.OnsenRyokanManager.ins.getInfo();
        }

        private changePanel(i: number) {
            switch (i) {
                case 1:
                    this.destroy();
                    clientCore.ModuleManager.open("tigerMagic.TigerMagicModule");
                    break;
                case 2:
                    this.destroy();
                    clientCore.ModuleManager.open("saveFaery.SaveFaeryModule");
                    break;
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goMap);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnOther1, Laya.Event.CLICK, this, this.changePanel, [1]);
            BC.addEvent(this, this.btnOther2, Laya.Event.CLICK, this, this.changePanel, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}