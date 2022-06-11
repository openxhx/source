namespace rechargeActivity {
    export class RechargeActivityModule extends ui.rechargeActivity.RechargeActivityModuleUI {
        private _rechargeDataArr: xls.rechargeActivity[][];
        private _showTabArr: number[];
        private _panelArr: BasePanel[];
        private _curPanel: BasePanel;
        private _rechargeInfo: pb.sc_get_activity_gift_bag_info;
        private _initTab: number = 0;
        constructor() {
            super();
        }
        init(d: any) {
            super.init(d);
            if (d) {
                this._initTab = d;
            }
            this.addPreLoad(xls.load(xls.rechargeActivity));
            this.addPreLoad(this.checkRechargeInfo());
            clientCore.MapManager.mapItemsLayer.visible = false;
        }

        async checkRechargeInfo() {
            return net.sendAndWait(new pb.cs_get_activity_gift_bag_info({})).then((data: pb.sc_get_activity_gift_bag_info) => {
                this._rechargeInfo = data;
            });
        }

        onPreloadOver() {
            this.initXlsData();
            this.initTabs();
        }

        popupOver() {
            if (this._showTabArr.length > 0) {
                if (this._showTabArr.indexOf(this._initTab) > -1)
                    this.onTabClick(this._initTab);
                else
                    this.onTabClick(this._showTabArr[0]);
            }
            else {
                alert.showSmall("当前没有任何充值活动！", { btnType: alert.Btn_Type.ONLY_SURE });
                this.destroy();
            }
            // //特殊处理
            // this.btnTabShow_5.fontSkin = clientCore.FlowerPetInfo.petType >= 1 ? 'rechargeActivity/s_y_Blazing welfare_1.png' : 'rechargeActivity/s_y_Blazing welfare_vip1.png'
            // this.btnTabHide_5.fontSkin = clientCore.FlowerPetInfo.petType >= 1 ? 'rechargeActivity/s_y_Blazing welfare.png' : 'rechargeActivity/s_y_Blazing welfare_vip.png'
        }

        private initXlsData() {
            this._rechargeDataArr = [];
            let arr = xls.get(xls.rechargeActivity).getValues();
            for (let info of arr) {
                if (!this._rechargeDataArr[info.type]) {
                    this._rechargeDataArr[info.type] = [];
                }
                switch (info.type) {
                    case 1:
                        //单充 只显示活动时间内的选项
                        if (this.isDuringTime(info.openDate, info.closeDate)) {
                            this._rechargeDataArr[info.type].push(info);
                        }
                        break;

                    default:
                        this._rechargeDataArr[info.type].push(info);
                        break;
                }
            }
        }
        private initTabs() {
            this._showTabArr = [];
            if(this._data == "flowerPet"){
                /** 闪耀花宝是否购买了*/
                if (!clientCore.FlowerPetInfo.checkBuyHistory(3) && clientCore.LocalInfo.userLv >= 8) {
                    this._showTabArr.push(5);
                }
            }else{
                for (let i = 0; i < this._rechargeDataArr.length; i++) {
                    if (this._rechargeDataArr[i]?.length) {
                        if (this.isDuringTime(this._rechargeDataArr[i][0].openDate, this._rechargeDataArr[i][0].closeDate)) {
                            if (this._rechargeDataArr[i][0].type == 2) {
                                if (clientCore.LocalInfo.userLv >= 8) {
                                    //连续充值先下掉
                                    this._showTabArr.push(i);
                                }
                            }
                            else if (this._rechargeDataArr[i][0].type == 4) {
    
                                let cls: xls.rechargeActivity = this._rechargeDataArr[i][0];
                                let activityTime: number = util.TimeUtil.formatTimeStrToSec(cls.closeDate) - util.TimeUtil.formatTimeStrToSec(cls.openDate);
    
                                if (this._rechargeInfo.accumulatePayStartTime > 0 && clientCore.ServerManager.curServerTime - this._rechargeInfo.accumulatePayStartTime < activityTime) {
                                    this._showTabArr.push(i);
                                }
                            }
                            else if (this._rechargeDataArr[i][0].type == 3) {
                                if (clientCore.LocalInfo.userLv >= 8) {
                                    this._showTabArr.push(i);
                                }
                            }
                            else if ([7, 8, 9].indexOf(this._rechargeDataArr[i][0].type) >= 0) { //无视
    
                            }
                            else {
                                this._showTabArr.push(i);
                            }
                        }
                    }
                }
                //排行榜提前
                if (this._showTabArr.indexOf(6) > -1) {
                    this._showTabArr.unshift(6);
                }
            }

            this._showTabArr = _.uniq(this._showTabArr);

            for (let i = 1; i < 7; i++) {
                this["btnTabShow_" + i].visible = false;
                this["btnTabHide_" + i].visible = false;
            }

            for (let i = 0; i < this._showTabArr.length; i++) {
                this["btnTabShow_" + this._showTabArr[i]].y = 20 + i * 90;
                this["btnTabHide_" + this._showTabArr[i]].y = 20 + i * 90;
            }

        }
        private isDuringTime(startTime: string, endTime: string): boolean {
            let st = util.TimeUtil.formatTimeStrToSec(startTime);
            let et = util.TimeUtil.formatTimeStrToSec(endTime);
            let serverTime = clientCore.ServerManager.curServerTime;
            return serverTime >= st && serverTime <= et;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            for (let i = 1; i < 7; i++) {
                BC.addEvent(this, this["btnTabHide_" + i], Laya.Event.CLICK, this, this.onTabClick, [i]);
            }
            BC.addEvent(this, EventManager, "RECHARGE_ACTIVITY_GET_REWARD", this, this.refreshRechargeInfo);

            Laya.timer.loop(1000, this, this.refreshAllTime);
        }
        private refreshAllTime() {
            if (!this._panelArr || this._panelArr.length == 0) {
                return;
            }
            for (let i = 0; i < this._panelArr.length; i++) {
                if (this._panelArr[i]) {
                    this._panelArr[i].refreshTime();
                }
            }
        }
        private refreshRechargeInfo() {
            net.sendAndWait(new pb.cs_get_activity_gift_bag_info({})).then((data: pb.sc_get_activity_gift_bag_info) => {
                this._rechargeInfo.accumulateCostCnt = data.accumulateCostCnt;
                this._rechargeInfo.accumulateCostStatus = data.accumulateCostStatus;
                this._rechargeInfo.accumulatePayCnt = data.accumulatePayCnt;
                this._rechargeInfo.accumulatePayStatus = data.accumulatePayStatus;
                this._rechargeInfo.dailySequencePayCnt = data.dailySequencePayCnt;
                this._rechargeInfo.sequencePayCurDay = data.sequencePayCurDay;
                this._rechargeInfo.sequencePayStatus = data.sequencePayStatus;
                this._rechargeInfo.singlePayMaxCnt = data.singlePayMaxCnt;
                this._rechargeInfo.singlePayStatus = data.singlePayStatus;
                this._curPanel.refresh();
            });
        }

        private async onTabClick(index: number) {
            for (let i = 0; i < this._showTabArr.length; i++) {
                if (this._showTabArr[i] == index) {
                    this["btnTabShow_" + this._showTabArr[i]].visible = true;
                    this["btnTabHide_" + this._showTabArr[i]].visible = false;
                }
                else {
                    this["btnTabHide_" + this._showTabArr[i]].visible = true;
                    this["btnTabShow_" + this._showTabArr[i]].visible = false;
                }
            }
            if (!this._panelArr) {
                this._panelArr = [];
            }
            if (this._curPanel) {
                this._curPanel.hide();
            }
            if (!this._panelArr[index]) {
                this._panelArr[index] = await this.createPanelByIndex(index);
            }
            this._curPanel = this._panelArr[index];
            switch (index) {
                case 1:
                    clientCore.Logger.sendLog('付费系统', '单充礼包', '打开单充礼包界面')
                    break;
                case 2:
                    clientCore.Logger.sendLog('付费系统', '连充礼包', '打开连充礼包界面');
                    clientCore.Logger.sendLog('2021年8月20日活动', '【付费】蒸汽迷梦连充', '打开蒸汽迷梦面板');4
                    break;
                case 3:
                    clientCore.Logger.sendLog('付费系统', '累计消费', '打开累计消费界面')
                    break;
                case 4:
                    clientCore.Logger.sendLog('付费系统', '累计充值', '打开累计充值界面')
                    break;
                default:
                    break;
            }
            this.boxPanelCon.addChild(this._curPanel);
        }

        private async createPanelByIndex(index: number) {
            let tmpPanel: BasePanel;
            switch (index) {
                case 1:
                    tmpPanel = new SingleRechargePanel();
                    break;
                case 2:
                    tmpPanel = new ContinueRechargePanel();
                    break;
                case 3:
                    tmpPanel = new CumulativeSpendPanel();
                    break;
                case 4:
                    tmpPanel = new CumulativeRechargePanel();
                    break;
                case 5:
                    // tmpPanel = new PetGiftPanel();
                    tmpPanel = new MoonRechargePanel();
                    break;
                case 6:
                    tmpPanel = new GiveFlowerPanel();
                    break;
            }
            if (tmpPanel.needLoading) {
                clientCore.LoadingManager.showSmall();
                await tmpPanel.waitLoading();
                clientCore.LoadingManager.hideSmall(true);
            }
            tmpPanel.init(this._rechargeDataArr[index], this._rechargeInfo);
            tmpPanel.refreshTime();
            tmpPanel.type = index;
            return tmpPanel;
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            if (this._panelArr) {
                for (let i = 0; i < this._panelArr.length; i++) {
                    if (this._panelArr[i]) {
                        this._panelArr[i].destroy();
                    }
                }
            }
            Laya.timer.clear(this, this.refreshAllTime);

            this._rechargeDataArr = null;
            this._showTabArr = null;
            this._panelArr = null;
            this._curPanel = null;
            this._rechargeInfo = null;

            super.destroy();
            clientCore.MapManager.mapItemsLayer.visible = true;
        }
    }
}