


namespace rainbow {

    export class RainbowModule extends ui.rainbow.RainbowPanelUI {

        public init(data: number): void {
            super.init(data);
            this.sideClose = true;
            this.txt.width = 425;
            this.txt.style.width = 425;
            this.txt.style.align = 'center';
            this.txt.style.font = '汉仪中圆简';
            this.txt.style.fontSize = 20;
            this.updateView(data);
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "rainbowModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnProduce, Laya.Event.CLICK, this, this.goProduce);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "rainbowModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {

                }
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        /** 前往生产*/
        private goProduce(): void {
            this.destroy();
            if (clientCore.MapInfo.isSelfHome) {
                clientCore.ModuleManager.closeModuleByName('selfInfo');
                clientCore.ModuleManager.open("produce.ProduceModule")
            }
            else {
                clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);
            }
        }

        /**
         * 
         * @param t 延长秒数
         */
        private updateView(t: number): void {
            if (t) {
                this.txt.innerHTML = util.StringUtils.getColorText2(['彩虹时间延长:', '#805329', util.StringUtils.getDateStr(t), '#fa868b'])
            }
            else {
                this.txt.innerHTML = util.StringUtils.getColorText('彩虹时间开启啦!', '#805329');
            }
            this.btnProduce.fontSkin = clientCore.MapInfo.isSelfHome ? "commonBtn/l_p_ljsc.png" : "commonBtn/l_p_go_home.png";
            this.imgTitle.skin = clientCore.LocalInfo.rainbowInfo.activityID == 118 ? 'rainbow/wd_1.png' : 'rainbow/wd.png';
        }
        destroy() {
            super.destroy();
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickRainbowModuleCloseBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }
    }
}