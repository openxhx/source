namespace produce.panel {
    import StringUtils = util.StringUtils;
    /**
     * 升级信息
     */
    export class FlowerUpgradePanel extends ui.produce.panel.FlowerUpgradePanelUI {
        private _info: pb.FlowerInfo;
        constructor() {
            super();
            this.txtNeedPlantNum.style.fontSize = 22;
            this.txtNeedPlantNum.style.width = 361;
            this.mcTips.visible = false;
        }

        public show(info: pb.FlowerInfo): void {
            clientCore.DialogMgr.ins.open(this);
            this.mcTips.visible = false;
            this.refreshInfo(info);
        }

        public refreshInfo(info: pb.FlowerInfo) {
            this._info = info;
            this.imgIcon.skin = pathConfig.getSeedIconPath(info.flowerId);
            let flowerLevel = clientCore.FlowerGrowConf.getFlowerLevel(info.flowerId, info.exp);
            let maxLv = clientCore.FlowerGrowConf.getFlowerMaxLevel(info.flowerId);
            this.txtFlowerName.changeText(xls.get(xls.manageBuildingId).get(info.flowerId).name);
            this.txtDes.text = xls.get(xls.manageBuildingId).get(info.flowerId).captions;
            this.txtLv.text = `等级(${flowerLevel}/${maxLv})`;

            //时间和上限
            let growTimeArr = xls.get(xls.flowerPlant).get(this._info.flowerId).growUp;
            let curEfficiency = clientCore.FlowerGrowConf.getEfficiencyByLevel(this._info.flowerId, flowerLevel);
            let nextEfficiency = clientCore.FlowerGrowConf.getEfficiencyByLevel(this._info.flowerId, flowerLevel + 1);
            let curTotalTime = 0;
            let nextTotalTime = 0;
            for (let i = 0; i < growTimeArr.length; i++) {
                curTotalTime += Math.floor(growTimeArr[i] * (1 - curEfficiency / 100));
                nextTotalTime += Math.floor(growTimeArr[i] * (1 - nextEfficiency / 100));
            }
            this.txtCurTime.changeText(util.StringUtils.getTimeStr2(curTotalTime));
            this.txtNextTime.changeText(util.StringUtils.getTimeStr2(nextTotalTime));
            this.txtNextTime.color = curTotalTime == nextTotalTime ? '#805329' : '#fa7279';
            this.txtCurNum.changeText("" + clientCore.FlowerGrowConf.getFlowerMaxGrowNumByLevel(this._info.flowerId, flowerLevel));
            this.txtNextNum.changeText("" + clientCore.FlowerGrowConf.getFlowerMaxGrowNumByLevel(this._info.flowerId, flowerLevel + 1));
            this.txtNextNum.color = this.txtCurNum.text == this.txtNextNum.text ? '#805329' : '#fa7279';
            let needPlant = clientCore.FlowerGrowConf.nextLevelNeedPlant(this._info.flowerId, flowerLevel, this._info.exp);
            let isFullColor = this._info.exp >= needPlant ? '#805329' : '#fa7279';
            let totalNeed = needPlant += this._info.exp;
            this.txtNeedPlantNum.innerHTML = StringUtils.getColorText2([`累计收获${totalNeed}朵${this.txtFlowerName.text}(`, '#805329', this._info.exp.toString(), isFullColor, `/${totalNeed})`, '#805329']);
            this.imgOk.skin = needPlant <= 0 ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            //tips
            this.txtMaxLv.text = '等级:' + maxLv;
            let maxEfficiency = clientCore.FlowerGrowConf.getEfficiencyByLevel(this._info.flowerId, maxLv);
            let maxLvTime = 0
            for (let i = 0; i < growTimeArr.length; i++) {
                maxLvTime += Math.floor(growTimeArr[i] * (1 - maxEfficiency / 100));
            }
            this.txtMaxTime.text = util.StringUtils.getTimeStr2(maxLvTime);
            this.txtMaxNum.text = clientCore.FlowerGrowConf.getFlowerMaxGrowNumByLevel(this._info.flowerId, maxLv).toString();
            this.txtMaxName.text = this.txtFlowerName.text;
        }
        private onShowTips() {
            this.mcTips.visible = true;
            BC.addOnceEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.hideTips);
        }

        private hideTips() {
            this.mcTips.visible = false;
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnTips, Laya.Event.CLICK, this, this.onShowTips);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this._info = null;
        }
        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}