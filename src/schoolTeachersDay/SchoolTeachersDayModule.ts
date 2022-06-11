namespace schoolTeachersDay {
    /**
     * 2020.8.31
     * 花蕾亚教师节
     * purify.PurifyModule
     */
    export class SchoolTeachersDayModule extends ui.schoolTeachersDay.SchoolTeachersDayModuleUI {
        private readonly TOTAL_LEN: number = 2000;

        private _totalScore: number;

        private _itemList: ui.schoolTeachersDay.render.ExchangeRenderUI[];

        private _model: SchoolTeachersDayModel;
        private _control: SchoolTeachersDayControl;

        private _emergencyPanel: EmergencyPanel;
        private _buyPanel: BuyPanel;

        init(data?: any) {
            super.init(data);

            this._itemList = [];

            this.panelPro.hScrollBarSkin = null;

            this.sign = clientCore.CManager.regSign(new SchoolTeachersDayModel(), new SchoolTeachersDayControl());
            this._control = clientCore.CManager.getControl(this.sign) as SchoolTeachersDayControl;
            this._model = clientCore.CManager.getModel(this.sign) as SchoolTeachersDayModel;

            clientCore.AnimateMovieManager.showOnceAnimate(this._model.mc_Id, MedalConst.SCHOOL_TEACHERS_DAY_MC);

            this._emergencyPanel = new EmergencyPanel(this.sign);
            this._buyPanel = new BuyPanel(this.sign);

            this.addPreLoad(xls.load(xls.miniAnswer));
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(res.load('res/animate/schoolTeachersDay/icon1.png'))
            this.addPreLoad(res.load('res/animate/schoolTeachersDay/icon2.png'))
            this.addPreLoad(res.load('res/animate/schoolTeachersDay/icon3.png'))
            this.addPreLoad(res.load('res/animate/schoolTeachersDay/icon4.png'))
            this.addPreLoad(this._model.getBuyMedal());
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年9月4日活动', '【主活动】花蕾亚教师节', '打开活动面板')
            let msg = await this._control.getInfo();
            this._model.updateInfo(msg);
            this.btnDati.alpha = 0;
            this.btnOrder.alpha = 0;
            this.btnActive.alpha = 0;
            this.btnSupply.alpha = 0;
            this.imgRole.skin = clientCore.LocalInfo.sex == 1 ? "schoolTeachersDay/girl.png" : "schoolTeachersDay/boy.png";

            let aniBtnDati: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/schoolTeachersDay/icon1.sk", 0, true, this.boxAni as Laya.Sprite);
            aniBtnDati.pos(95, 180);
            let aniBtnOrder: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/schoolTeachersDay/icon2.sk", 0, true, this.boxAni as Laya.Sprite);
            aniBtnOrder.pos(395, 105);
            let aniBtnActive: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/schoolTeachersDay/icon3.sk", 0, true, this.boxAni as Laya.Sprite);
            aniBtnActive.pos(275, 300);
            let aniBtnSupply: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/schoolTeachersDay/icon4.sk", 0, true, this.boxAni as Laya.Sprite);
            aniBtnSupply.pos(615, 240);

            //创建进度条
            this.imgProgressBg.width = this.TOTAL_LEN;
            let arr = this._model.getRewardArr();
            this._totalScore = _.last(_.map(arr, (o) => { return o.num.v2 }));
            for (let i = 0; i < arr.length; i++) {
                let o = arr[i];
                let itemUI = new ui.schoolTeachersDay.render.ExchangeRenderUI();
                itemUI.pos(o.num.v2 / this._totalScore * this.TOTAL_LEN, 0, true);
                itemUI.dataSource = o;
                itemUI.labNum.value = o.num.v2.toString();
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                itemUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwdId);
                this.panelPro.addChild(itemUI);
                this._itemList.push(itemUI);
                BC.addEvent(this, itemUI, Laya.Event.CLICK, this, this.onGetScoreReward, [i]);
            }

            this.updateView();
        }

        public onEmergencyUpdate(data: any): void {
            if (!this._model.isCanAnswer) {
                clientCore.DialogMgr.ins.close(this._emergencyPanel);
            } else {
                this.onDati();
            }

            if (data && data.rewardItems && data.rewardItems.length > 0) {
                for (let i = 0; i < data.rewardItems.length; i++) {
                    if (data.rewardItems[i].id == this._model.coinId) {
                        this._model.coinNum += data.rewardItems[i].cnt;
                    }
                }
                this.updateView();
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardItems));
            }
        }

        public onBuyPanelUpdate(data: any): void {
            if (data && data.rewardItems && data.rewardItems.length > 0) {
                for (let i = 0; i < data.rewardItems.length; i++) {
                    if (data.rewardItems[i].id == this._model.coinId) {
                        this._model.coinNum += data.rewardItems[i].cnt;
                    }
                }
                this.updateView();
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardItems));
            }
        }

        private updateView() {
            this.labCoinNum.text = this._model.coinNum + "";

            //进度条
            this.imgProgress.width = Math.min(this._model.coinNum / this._totalScore * this.TOTAL_LEN, this.TOTAL_LEN);
            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                let data = item.dataSource as xls.commonAward;
                let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
                let canGetReward = this._model.coinNum >= data.num.v2;
                item.imgGet.visible = getRewarded;
                item.imgHaveRwd.visible = canGetReward && !getRewarded;
                item.clipBg.index = canGetReward && !getRewarded ? 1 : 0;
            }
        }

        private onDetail() {
            alert.showRuleByID(1059);
        }

        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this._model.suitId);
        }

        private onReview(): void {
            clientCore.AnimateMovieManager.showAnimateMovie(this._model.mc_Id, null, null);
        }

        private onDati(): void {
            if (!this._model.isCanAnswer) {
                alert.showFWords('今日' + this._model.answerNumMax + '次答题已达上限');
                return;
            }
            this._control.getQuestion(Laya.Handler.create(this, (msg: pb.sc_teachers_day_get_question) => {
                this._emergencyPanel.init({ subject: this._model.getMiniAnswer(msg.questionId), onCloseFun: this.onEmergencyUpdate.bind(this) });
                clientCore.DialogMgr.ins.open(this._emergencyPanel);
            }))
        }

        private onActive(): void {
            clientCore.ModuleManager.open("task.TaskModule", 1);
            this.destroy();
        }

        private onOrder(): void {
            clientCore.ModuleManager.open("orderSystem.OrderSystemModule");
            this.destroy();
        }

        private onSupply(): void {
            if (!this._model.isCanBuy) {
                alert.showFWords('今日购买次数已达上限');
                return;
            }
            this._buyPanel.init({ onCloseFun: this.onBuyPanelUpdate.bind(this) });
            clientCore.DialogMgr.ins.open(this._buyPanel);
        }

        private onGetScoreReward(idx: number, e: Laya.Event) {
            let data = e.currentTarget['dataSource'] as xls.commonAward;
            let rewardId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            let getRewarded = clientCore.ItemsInfo.getItemNum(rewardId) > 0;
            let canGetReward = this._model.coinNum >= data.num.v2;
            if (canGetReward && !getRewarded) {
                this._control.exchange(data.id, idx + 1, Laya.Handler.create(this, (msg: pb.sc_teachers_day_exchange) => {
                    this.updateView();
                    alert.showReward(clientCore.GoodsInfo.createArray(msg.items));
                }))
            } else {
                clientCore.ToolTip.showTips(e.currentTarget, { id: rewardId });
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnCancel, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnReview, Laya.Event.CLICK, this, this.onReview);
            BC.addEvent(this, this.btnDati, Laya.Event.CLICK, this, this.onDati);
            BC.addEvent(this, this.btnActive, Laya.Event.CLICK, this, this.onActive);
            BC.addEvent(this, this.btnOrder, Laya.Event.CLICK, this, this.onOrder);
            BC.addEvent(this, this.btnSupply, Laya.Event.CLICK, this, this.onSupply);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            for (const o of this._itemList) {
                o.destroy();
            }
            this._itemList = [];
            this._emergencyPanel?.destroy();
            this._emergencyPanel = null;
            this._buyPanel?.destroy();
            this._buyPanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            for (let i = this.boxAni.numChildren - 1; i >= 0; i--) {
                let obj = this.boxAni.getChildAt(i)
                if (obj instanceof clientCore.Bone)
                    obj.dispose();
            }
            super.destroy();
        }
    }
}