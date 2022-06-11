namespace familyTailor {


    export enum ShopType {
        /** 裁缝小铺*/
        TAILOR,
        /** 服装圣殿*/
        TEMPLE,
        /**食神荟院 */
        EATGOT,
        /** 闪耀套装*/
        TWINKLE
    }

    export enum ViewType {
        /** 展示界面*/
        SHOW = 1,
        /** 制作界面*/
        MAKE
    }

    /**
     * 裁缝小铺
     * familyTailor.FamilyTailorModule
     */
    export class FamilyTailorModule extends ui.familyTailor.FamilyTailorModuleUI {

        private _panelType: ViewType;
        private _panelMap: Object;

        constructor() { super(); }

        public init(data: { type: number, lv: number }): void {
            if (data && data.type == ShopType.TAILOR) {
                FamilyTailorModel.ins.tailorLevel = data.lv;
                this.addPreLoad(xls.load(xls.familyClothStore));
                this.bg.skin = "unpack/familyTailor/bg.png";
                this.imgTitle.skin = "familyTailor/cfxp.png";
            } else if (data && data.type == ShopType.EATGOT) {
                FamilyTailorModel.ins.restaurantLevel = data.lv;
                this.addPreLoad(xls.load(xls.clothTemple));
                this.bg.skin = "unpack/familyTailor/bg.png";
                this.imgTitle.skin = "familyTailor/sshy.png";
            } else if (data && data.type == ShopType.TWINKLE) {
                FamilyTailorModel.ins.twinkleChapter = data.lv;
                this.addPreLoad(xls.load(xls.clothTemple));
                this.addPreLoad(xls.load(xls.shineTripChapter));
                this.addPreLoad(this.getTwinkleEventInfo());
                this.bg.skin = "unpack/familyTailor/bg.png";
                this.imgTitle.skin = "familyTailor/twinkle.png";
            } else {
                data = { type: ShopType.TEMPLE, lv: 0 };
                this.addPreLoad(xls.load(xls.clothTemple));
                this.bg.skin = "unpack/familyTailor/bg1.png";
                this.imgTitle.skin = "familyTailor/fzsd.png";
            }
            FamilyTailorModel.ins.shopType = data.type;
            this._panelMap = {};
            data.type == ShopType.TAILOR && clientCore.UIManager.showCoinBox();
            if (data.type == ShopType.EATGOT) {
                clientCore.UIManager.setMoneyIds([9900066]);
                clientCore.UIManager.showCoinBox();
            }
            if (FamilyTailorModel.ins.shopType == ShopType.TEMPLE) {
                clientCore.Logger.sendLog('系统', '主UI按钮触达', '进入服装圣殿');
            }
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onBack);
            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo);
        }

        /**获取闪耀秀场活动章节信息 */
        private getTwinkleEventInfo() {
            return net.sendAndWait(new pb.cs_shine_change_level_panel({ chapterId: 11 })).then((msg: pb.sc_shine_change_level_panel) => {
                if (msg.passInfo[msg.passInfo.length - 1].star > 0) {
                    FamilyTailorModel.ins.twinkleEventChapter = [11];
                }
            });
        }
        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "familyTailorModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (this[objName]) {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public initOver(): void {
            this.showPanel(ViewType.SHOW);
        }

        public destroy(): void {
            for (let key in this._panelMap) {
                let element: core.BaseModule = this._panelMap[key];
                element && element.destroy();
                delete this._panelMap[key];
            }
            this._panelMap = null;
            FamilyTailorModel.ins.twinkleEventChapter = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }

        /**
         * 展示页面
         * @param type 
         * @param data 
         */
        public showPanel(type: ViewType, data?: any): void {
            let mod: core.BaseModule;
            if (this._panelType) {
                mod = this._panelMap[this._panelType];
                mod.removeEventListeners();
                mod.removeSelf();
            }
            mod = this._panelMap[type];
            if (!mod) {
                mod = type == ViewType.SHOW ? new panel.ShowPanel() : new panel.MakePanel();
                this._panelMap[type] = mod;
            }
            mod.init(data);
            mod.addEventListeners();
            this.addChild(mod);
            this.btnBack.skin = this._panelType != ViewType.SHOW ? 'commonBtn/btn_l_y_home.png' : 'commonBtn/btn_l_y_back.png';
            this._panelType = type;
        }

        private onBack(): void {
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickBackIcon") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
            if (this._panelType == ViewType.SHOW) {
                this.destroy();
                if (FamilyTailorModel.ins.shopType == ShopType.TWINKLE) {
                    clientCore.ModuleManager.open('twinkleTransfg.TwinkleTransfgModule');
                }
            } else {
                this.showPanel(ViewType.SHOW);
            }
        }
    }
}