namespace springFaerie {
    /**
     * 古灵仙的春日
     * 2022.2.24
     * springFaerie.SpringFaerieGuideModule
     */
    export class SpringFaerieGuideModule extends ui.springFaerie.SpringFaerieGuideModuleUI {


        init() {
          
        }

        onPreloadOver() {
           
        }


        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.MedalManager.setMedal([{ id: MedalConst.SPRING_FAERIE_FIRST_3, value: 1 }]);
            clientCore.ModuleManager.open("springFaerie.SpringFaerieModule");
            super.destroy();

        }
    }
}