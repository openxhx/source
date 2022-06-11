namespace newyear2021 {
    /**
     * 迎福纳彩贺新春活动
     * newyear2021.NewYear2021Module
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0208\春节主活动功能文档.xlsx
     */
    export class NewYear2021Module extends ui.newyear2021.NewYear2021ModuleUI {
        private _panelMap: IPanel[] = [];
        private _boneMap: clientCore.Bone[] = [];
        private _model: NewYear2021Model;
        private _control: NewYear2021Control;

        constructor() { super(); }
        init(): void {
            this.sign = clientCore.CManager.regSign(new NewYear2021Model(), new NewYear2021Control());
            this._model = clientCore.CManager.getModel(this.sign) as NewYear2021Model;
            this._control = clientCore.CManager.getControl(this.sign) as NewYear2021Control;
            this.addPreLoad(res.load('atlas/couplet.atlas', Laya.Loader.ATLAS));
            this.addPreLoad(this._control.getInfo());
            this.addPreLoad(xls.load(xls.eventExchange));
            this.createAnimate();
            this.ani1.play(0, true);
            clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开活动面板');
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnExchange, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnExpel, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnFind, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onClick);
            BC.addEvent(this, this.btnSet, Laya.Event.CLICK, this, this.onClick);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            _.forEach(this._boneMap, (element: clientCore.Bone) => { element?.dispose(); });
            this._boneMap.length = 0;
            this._boneMap = null;
            this._panelMap.length = 0;
            this._panelMap = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
        }
        private onClick(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnExchange: //打开换年货
                    clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开换年货面板');
                    this.openDialog(0, ExchangePanel);
                    break;
                case this.btnExpel: //逐年兽
                    clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开逐年兽面板');
                    this.openDialog(1, ExpelPanel);
                    break;
                case this.btnFind: //找福字
                    clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开找福字面板');
                    this.openDialog(2, FindPanel);
                    break;
                case this.btnGo: //去拜年
                    clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开去拜年面板');
                    this.openDialog(3, NpcPanel);
                    break;
                case this.btnRule: //规则
                    clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开规则面板');
                    alert.showRuleByID(1128);
                    break;
                case this.btnSet: //集春联
                    clientCore.Logger.sendLog('2021年2月8日活动', '【主活动】迎福纳彩贺新春', '打开集春联面板');
                    this.openDialog(4, CoupletPanel);
                    break;
            }
        }
        private openDialog(index: number, cls: any): void {
            this._panelMap[index] = this._panelMap[index] || new cls();
            this._panelMap[index].show(this.sign);
        }

        private createAnimate(): void {
            this.createBone('title', 667, 114);
            this.createBone('female', 446, 605);
            this.createBone('male', 681, 558);
            this.createBone('nian', 981, 678, 'idle');
        }

        private createBone(name: string, x: number, y: number, nameOrIndex: number | string = 0): void {
            let bone: clientCore.Bone = clientCore.BoneMgr.ins.play(pathConfig.getActivityAnimate(name), nameOrIndex, true, this.spBone);
            bone.pos(x, y);
            this._boneMap.push(bone);
        }
    }
}