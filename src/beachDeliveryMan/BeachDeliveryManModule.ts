namespace beachDeliveryMan {
    /**
     * 海滩宅配员
     * beachDeliveryMan.BeachDeliveryManModule
     * \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0716\【主活动】海滩宅配员20210716_Inory.docx
     */
    export class BeachDeliveryManModule extends ui.beachDeliveryMan.BeachDeliveryManModuleUI {
        private _model: BeachDeliveryManModel;
        private _control: BeachDeliveryManControl;
        private _taskPanel: BeachOrderTaskPanel;
        private _signCd: number;
        //#region 倒计时显示参数
        private s: number;
        private h: number;
        private m: number;
        private ss: number;
        private hs: string;
        private ms: string;
        private sss: string;
        //#endregion

        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new BeachDeliveryManModel(), new BeachDeliveryManControl());
            this._model = clientCore.CManager.getModel(this.sign) as BeachDeliveryManModel;
            this._control = clientCore.CManager.getControl(this.sign) as BeachDeliveryManControl;
            this.initUI();
            this.addPreLoad(Promise.all([
                xls.load(xls.taskData),
                xls.load(xls.itemBag),
                xls.load(xls.eventControl)
            ]));
        }

        async seqPreLoad(): Promise<void> {
            const data: pb.sc_beach_housekeeper_panel = await this._control.getInitPanel();
            this._model.sign_in_flag = data.flag;
            this._model.today_fruit_cut = data.rewardCnt;
            this.reset2SignIn();
            this.reset2Fruits();
        }
        //水果
        private reset2Fruits(): void {
            this.labFruitNum.text = `: ${clientCore.MoneyManager.getNumById(this._model.FRUIT_MONEY_ID)}`;
            this.labUpLimit.text = `每日获得上限：${this._model.today_fruit_cut}/${this._model.EVERYDAY_LIMITUP}`;
        }

        //重置签到
        private reset2SignIn(): void {
            this.labCd.visible = false;
            if (this._model.sign_in_flag == 1) {//今日已经领取完毕(需要倒计时)
                this.state_geted.visible = true;
                this.state_canGet.visible = false;
                this.startCD();
            } else {//需要提示
                const state: BeachActivityTime = this._model.getActivitystate();//本活动当前的状态
                if (state == BeachActivityTime.none_start) {
                    this.state_geted.visible = false;
                    this.state_canGet.visible = false;
                    this.startCD();
                } else if (state == BeachActivityTime.inner_doing) {
                    this.state_geted.visible = false;
                    this.state_canGet.visible = true;
                    this.stopCD();
                } else {
                    this.state_geted.visible = false;
                    this.state_canGet.visible = false;
                    this.startCD();
                }
            }
        }

        //#region 关于倒计时
        private startCD(): void {
            this.stopCD();
            const now: number = clientCore.ServerManager.curServerTime;//当前的服务器时间
            const state: BeachActivityTime = this._model.getActivitystate(now);//本活动当前的状态
            if (state == BeachActivityTime.finished) {
                return;
            }
            let nextDay: number;
            if (state == BeachActivityTime.inner_doing) {
                nextDay = Math.ceil(new Date(new Date(now * 1000).setHours(23, 59, 59, 999)).getTime() / 1000);
                if (nextDay + 1 >= util.TimeUtil.formatTimeStrToSec(this._model.ACTIVITY_TIMES[1])) {
                    return;//下一天,活动结束了
                }
            } else if (state == BeachActivityTime.none_start) {
                nextDay = util.TimeUtil.formatTimeStrToSec(this._model.ACTIVITY_TIMES[0]);//开启活动的时间倒计时
            }
            this.labCd.visible = true;
            this._signCd = nextDay - now;
            this.showLabCd();
            Laya.timer.loop(1000, this, this.doTimeCD);
        }
        private stopCD(): void {
            this.labCd.visible = false;
            Laya.timer.clear(this, this.doTimeCD);
        }
        private doTimeCD(): void {
            this._signCd--;
            this.showLabCd();
            if (this._signCd <= 0) {
                this.stopCD();
                this._model.sign_in_flag = 0;
                this.reset2SignIn();
            }
        }
        //显示倒计时
        private showLabCd(): void {
            this.s = Math.ceil(this._signCd);
            this.h = Math.floor(this.s / 3600);
            this.m = Math.floor((this.s - this.h * 3600) / 60);
            this.ss = this.s - this.h * 3600 - this.m * 60;
            this.hs = this.h < 10 ? `0${this.h}` : `${this.h}`;
            this.ms = this.m < 10 ? `0${this.m}` : `${this.m}`;
            this.sss = this.ss < 10 ? `0${this.ss}` : `${this.ss}`;
            this.labCd.text = `${this.hs}:${this.ms}:${this.sss}`;
        }
        //#endregion

        private initUI(): void {
            const sex: number = clientCore.LocalInfo.sex;
            this.imgPho.skin = `unpack/beachDeliveryMan/npc_${sex}.png`;
            //初始化列表
            this.listOrder.vScrollBarSkin = "";
            this.listOrder.hScrollBarSkin = "";
            this.listOrder.renderHandler = new Laya.Handler(this, this.listRender);
            this.reset2List();
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onShowSuit);
            BC.addEvent(this, this.btnTab1, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnTab2, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, EventManager, BeachDeliveryManEventType.close_orderTaskPanel, this, this.onCloseTaskPanel);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        popupOver(): void {
            clientCore.UIManager.setMoneyIds(this._model.G_CURENCY);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2021年7月16日活动', '【主活动】海滩宅配员', '打开主活动面板');
        }
        private onCloseTaskPanel(refresh: boolean): void {
            if (this._taskPanel) {
                this._taskPanel = null;
            }
            if (refresh) {
                this.reset2List();//刷新订单列表
                this.reset2Fruits();//刷新水果信息
            }
        }
        private onShowRule(): void {
            alert.showRuleByID(this._model.RULE_ID);
        }

        private onShowSuit(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.SUIT_ID);
        }

        private reset2List(): void {
            const arr: pb.ITask[] = this._model.getTaskData();
            this.listOrder.array = arr;
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.target) {
                case this.btnTab1:
                    if (this._model.sign_in_flag == 1) {
                        alert.showFWords("今日已经领取,请明日再来!");
                    } else {
                        const state: BeachActivityTime = this._model.getActivitystate();//本活动当前的状态
                        if (state == BeachActivityTime.finished) {
                            alert.showFWords("活动已经结束!");
                        } else if (state == BeachActivityTime.none_start) {
                            alert.showFWords("活动还未开始!");
                        } else {
                            this._control.getSignInReward().then(msg => {
                                alert.showReward(msg.item);
                                this._model.sign_in_flag = 1;
                                this.reset2SignIn();
                                this.reset2Fruits();//刷新水果信息
                            });
                        }
                    }
                    break;
                case this.btnTab2://水果连连看
                    // clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ToolTip.gotoMod(176, "2");
                    clientCore.Logger.sendLog('2021年7月16日活动', '【主活动】海滩宅配员', '点击水果连连看按钮');
                    break;
            }
        }


        //#region 关于订单列表
        private listRender(item: ui.beachDeliveryMan.item.OrderItemUI, index: number): void {
            const data: pb.ITask = item.dataSource;
            if (data.state == 3) {//已经做完
                item.state_over.visible = true;
                item.state_order.visible = false;
                BC.removeEvent(item);
            } else {
                item.state_over.visible = false;
                item.state_order.visible = true;
                const index = data.taskid - this._model.TASK_ID_OFF;
                item.imgPho.skin = `beachDeliveryMan/spho_${index}.png`;
                BC.addEvent(item, item.btnGive, Laya.Event.CLICK, this, this.onItemClick, [item]);
            }
        }
        //点击交付事件
        private onItemClick(item: ui.beachDeliveryMan.item.OrderItemUI): void {
            const data: pb.ITask = item.dataSource;
            this._taskPanel = new BeachOrderTaskPanel(this.sign, data);
            clientCore.DialogMgr.ins.open(this._taskPanel);
        }
        //#endregion

        public destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            this.listOrder.renderHandler = null;
            for (let i: number = 0, j: number = this.listOrder.numChildren; i < j; i++) {
                BC.removeEvent(this.listOrder.getChildAt(i));
            }
            this.stopCD();
            super.destroy();
        }
    }
}