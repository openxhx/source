namespace seventhMoonNight {
    /**
     * 放花灯材料渲染
     */
    export class PlayFlowerLightRender extends ui.seventhMoonNight.item.PlayFlowerLightRenderUI {
        private _info: IPlayFlowerUsingItemVo;
        private static readonly btnskins: string[] = ["seventhMoonNight/txtb_fangru.png", "seventhMoonNight/txtb_yijingfr.png"];
        private static readonly btnOffx: number[] = [25, 15];

        createChildren(): void {
            super.createChildren();
            this.addEvent();
        }

        private addEvent(): void {
            BC.addEvent(this, this.bg, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnCommon, Laya.Event.CLICK, this, this.onClickHandler);
        }

        private removeEvent(): void {
            BC.removeEvent(this);
        }


        public resetUI(data: IPlayFlowerUsingItemVo): void {
            this._info = data;
            this.doRender();
        }

        private async doRender(): Promise<void> {
            return new Promise<void>(resolve => {
                switch (this._info.status) {
                    case seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER:
                        this.doFlower();
                        break;
                    case seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS:
                        this.doItems();
                        break;
                }
                resolve();
            });
        }

        private doFlower(): void {
            this.btnCommon.visible = false;
            this.labNum.text = `${this._info.cnt}`;
            this.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(this._info.id);
        }

        private doItems(): void {
            this.btnCommon.visible = true;
            if (this._info.selected) {
                this.btnCommon.fontSkin = PlayFlowerLightRender.btnskins[1];
                this.btnCommon.fontX = PlayFlowerLightRender.btnOffx[1];
            } else {
                this.btnCommon.fontSkin = PlayFlowerLightRender.btnskins[0];
                this.btnCommon.fontX = PlayFlowerLightRender.btnOffx[0];
            }
            this.labNum.text = `${this._info.cnt}`;
            this.imgItem.skin = clientCore.ItemsInfo.getItemIconUrl(this._info.id);
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.bg:
                    if (this._info.status != seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER) return;
                    EventManager.event(SeventhMoonNightEventType.PLAYFLOWERLIGHT_SELECTED_FLOWER, this._info);
                    break;
                case this.btnCommon:
                    if (this._info.status != seventhMoonNight.PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS) return;
                    EventManager.event(SeventhMoonNightEventType.PLAYFLOWERLIGHT_SELECTED_ITEM, this._info);
                    break;
            }
        }

        public clear(): void {
            this._info = null;
            this.removeEvent();
        }

        destroy() {
            this.clear();
            super.destroy();
        }
    }
}