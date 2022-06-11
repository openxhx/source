namespace selfInfo {
    /**
     * 爱心-美丽-智慧值面板
     */
    export class ValuePanel extends ui.selfInfo.panel.ValuePanelUI {
        onEnable(): void {
            this.once(Laya.Event.CLICK, this, this.removeSelf);
        }

        show(type: string, pointInfo: { point: number, lv: number, currLvPoint: number, currLvTotalPoint: number, max: boolean }): void {
            this.scale(1, 1);
            Laya.Tween.from(this, { scaleX: 0, scaleY: 0 }, 200, Laya.Ease.backOut);
            this.imgIcon.skin = `selfInfo/${type}.png`;
            this.txtPer.visible = false;
            switch (type) {
                case 'love':
                    this.txtPoint.text = '爱心点数:' + pointInfo.point;
                    this.txtLv.text = '爱心等级:' + pointInfo.lv;
                    this.txtDes.text = '帮助好友玩家可获得爱心点数提高自身爱心等级，帮助对象的爱心等级越高获得的收益越多';
                    break;
                case 'wisdom':
                    this.txtPoint.text = '智慧点数:' + pointInfo.point;
                    this.txtLv.text = '智慧等级:' + pointInfo.lv;
                    this.txtDes.text = '在拉贝尔游乐园中首通关卡可以获得智慧点数';
                    break;
                case 'beauty':
                    this.txtPoint.text = '美丽点数:' + pointInfo.point;
                    this.txtLv.text = '美丽等级:' + pointInfo.lv;
                    this.txtDes.text = '收集更多服饰可获得美丽点数提高自身美丽等级';
                    break;
                default:
                    break;
            }
            this.txtLv.text += pointInfo.max ? '(已达最大等级)' : `(${pointInfo.currLvPoint}/${pointInfo.currLvTotalPoint})`;
        }
    }
}