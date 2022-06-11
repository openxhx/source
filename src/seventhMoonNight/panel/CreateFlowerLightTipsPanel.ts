namespace seventhMoonNight {
    /**
     * 制作花灯弹窗提示
     */
    export class CreateFlowerLightTipsPanel extends ui.seventhMoonNight.panel.CreateFlowerLightTipsPanelUI {
        private _model: SeventhMoonNightModel;
        private _control: SeventhMoonNightControl;
        private _petAni: clientCore.Bone;
        private _msg: pb.sc_qixi_lover_night_make_hua;
        private readonly BTN_SKINS: string[] = [
            "seventhMoonNight/txtb_ok.png",
            "seventhMoonNight/txtb_sure.png"
        ];
        private curState: CreateFlowerLightTipsPanelCBType;

        public constructor(sign: number, curState: CreateFlowerLightTipsPanelCBType, msg: pb.sc_qixi_lover_night_make_hua) {
            super();
            this.sign = sign;
            this.curState = curState;
            this._msg = msg;
            this._model = clientCore.CManager.getModel(this.sign) as SeventhMoonNightModel;
            this._control = clientCore.CManager.getControl(this.sign) as SeventhMoonNightControl;
        }

        initOver() {
            this.init2Tips();
            this.init2BtnSkin();
            this.init2PetBody();
        }

        //#region 初始化
        private init2Tips(): void {
            const index: number = this.curState - 2;
            this.labTips.text = this._model.LanBase_Creates[index];
        }

        private init2BtnSkin(): void {
            const index: number = this.curState - 2;
            this.btnCommon.fontSkin = this.BTN_SKINS[index];
        }

        //创建花宝
        private init2PetBody(): void {
            this._petAni = clientCore.BoneMgr.ins.play(
                pathConfig.getflowerPetRes(clientCore.FlowerPetInfo.select.big, clientCore.FlowerPetInfo.select.little),
                "idle",
                true,
                this,
                {addChildAtIndex: this.getChildIndex(this.btnCommon)}
            );
            this._petAni.pos(650, 350);
            this._petAni.scaleX = this._petAni.scaleY = 1.0;
        }

        //#endregion

        addEventListeners() {
            BC.addEvent(this, this.btnCommon, Laya.Event.CLICK, this, this.onClickHandler);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (this.btnCommon.fontSkin) {
                case this.BTN_SKINS[0]://材料不足
                    this.onClose(CreateFlowerLightTipsPanelCBType.INSUFFICIENT);
                    break;
                case this.BTN_SKINS[1]://制作完成
                    this.onClose(CreateFlowerLightTipsPanelCBType.FINISHED);
                    break;
            }
        }

        private onClose(data: CreateFlowerLightTipsPanelCBType): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(SeventhMoonNightEventType.CLOSE_CreateFlowerLightTipsPanel, [data, this._msg]);
        }


        destroy() {
            this._model = this._control = null;
            if (this._petAni) {
                this._petAni.dispose();
                this._petAni = null;
            }
            super.destroy();
        }
    }
}