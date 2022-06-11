namespace offPrintComeback {
    /**
     * 绝版复出大调查
     * offPrintComeback.OffPrintComebackModule
     * 策划案: \\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0625\【付费】绝版复出大调查20210625_Inory.docx
     */
    export class OffPrintComebackModule extends ui.offPrintComeback.OffPrintComebackModuleUI {
        private _model: OffPrintComebackModel;
        private _control: OffPrintComebackControl;
        private haveRead: number;
        private _person: clientCore.Person;
        private rewardPanel: VoteRewardPanel;

        constructor() {
            super();
            // clientCore.MaskManager.changeAlpha(0);
            this.visible = false;
        }

        public init(data?: number): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new OffPrintComebackModel(), new OffPrintComebackControl());
            this._model = clientCore.CManager.getModel(this.sign) as OffPrintComebackModel;
            this._control = clientCore.CManager.getControl(this.sign) as OffPrintComebackControl;
            this.addPreLoad(Promise.all([
                xls.load(xls.offPrintComeback),
                xls.load(xls.globaltest),
                this._control.getOffPrintComebackFlags().then((msg: pb.sc_out_of_print_comeback_panel) => {
                    if (msg.flag == 1) {
                        this._model.clothAnswerFlag = 1;
                    } else {
                        this._model.clothAnswerFlag = 0;
                        this.visible = true;
                        this.initOther();
                    }
                })
            ]));
        }
        async seqPreLoad(): Promise<void> {
            if (this._model.clothAnswerFlag == 0) {
                await this.getClothInfo();
            }
        }


        public popupOver(): void {
            if (this._model.clothAnswerFlag == 1) {//已经参与了,需要退出
                alert.showFWords("您已经参与了!");
                this.destroy();
            } else {
                clientCore.Logger.sendLog('2021年6月25日活动', '【活动】绝版复出大调查', '打开活动面板');
            }
        }
        //重设UI状态
        private resetUIStatus(): void {
            if (this._model.clothAnswerFlag == 1) {
                this.btnNo.gray = this.btnYes.gray = true;
                this.btnNo.mouseEnabled = this.btnYes.mouseEnabled = false;
            } else {
                this.btnNo.gray = this.btnYes.gray = false;
                this.btnNo.mouseEnabled = this.btnYes.mouseEnabled = true;
            }
        }

        private async getClothInfo(): Promise<void> {
            return this._control.getClothInfo().then((msg: pb.sc_out_of_print_comeback_chose_panel) => {
                this.showInfo({ clotheId: msg.clotheId, star: msg.star, haveRead: msg.haveRead });
            });
        }

        private initOther(): void {
            this.sideClose = true;
            this.listCloth.renderHandler = new Laya.Handler(this, this.clothRender);
            this.listCloth.mouseHandler = new Laya.Handler(this, this.clothMouse);
            this.rewardPanel = new VoteRewardPanel();
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
            this._person.x = this.imgSuit.x + 40;
            this._person.y = this.imgSuit.y + 30;
            this.addChild(this._person);
            this._person.scale(-0.5, 0.5);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnReward, Laya.Event.CLICK, this, this.showReward);
            BC.addEvent(this, this.btnYes, Laya.Event.CLICK, this, this.vote, [1]);
            BC.addEvent(this, this.btnNo, Laya.Event.CLICK, this, this.vote, [0]);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private showReward(e: Laya.Event): void {
            this.rewardPanel.showInfo(clientCore.GlobalConfig.config.offPrintComebackAward, "可在1月14日起的活动中购买服装");
            clientCore.DialogMgr.ins.open(this.rewardPanel);
        }

        private vote(flag: number): void {
            if (this._model.clothAnswerFlag != 1) {
                this._control.vote(flag, new Laya.Handler(this, this.voteBack, null, true));
            } else {
                alert.showFWords("您已经参与了本次活动！");
            }
        }
        //投票返回处理
        private voteBack(msg: pb.sc_out_of_print_comeback_chose) {
            this.showInfo({ clotheId: msg.clotheId, star: msg.star, haveRead: ++this.haveRead });
            this.resetUIStatus();
            if (msg.item && msg.item.length > 0) {
                this._model.clothAnswerFlag = 1;
                alert.showReward(msg.item, null, {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.destroy();
                        }]
                    }
                });
            }
        }

        public showInfo(info: { clotheId: number, star: number, haveRead: number }): void {
            if (!this.rewardPanel) this.rewardPanel = new VoteRewardPanel();
            if (!this._person) {
                this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
                this._person.x = this.imgSuit.x + 40;
                this._person.y = this.imgSuit.y + 30;
                this.addChild(this._person);
                this._person.scale(-0.5, 0.5);
            }
            this.haveRead = info.haveRead;
            this.listStar.array = new Array(info.star);
            let clothIDsArr = clientCore.SuitsInfo.getSuitInfo(info.clotheId).clothes;
            this._person.replaceByIdArr(clothIDsArr);
            // this.imgSuit.skin = pathConfig.getSuitImg(info.suitId, clientCore.LocalInfo.sex);
            this.labRead.text = "已阅:" + info.haveRead + "/" + xls.get(xls.offPrintComeback).length;
            this.listCloth.array = clientCore.SuitsInfo.getSuitInfo(info.clotheId).clothes;
            this.labSuitName.text = clientCore.ItemsInfo.getItemName(info.clotheId);
        }

        private clothRender(item: ui.commonUI.item.RewardItemUI) {
            let clothId = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: clothId, cnt: 1, showName: false });
            item.num.visible = false;
        }

        private clothMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                clientCore.ToolTip.showTips(e.target, { id: this.listCloth.array[idx] });
            }
        }

        public destroy(): void {
            this._model.dispose();
            this._model = this._control = null;
            if (this.rewardPanel) {
                this.rewardPanel.destroy();
                this.rewardPanel = null;
            }
            if (this._person) {
                this._person.destroy();
                this._person = null;
            }
            this.listCloth.array = null;
            this.listStar.array = null;
            clientCore.CManager.unRegSign(this.sign);
            super.destroy();
            // clientCore.MaskManager.changeAlpha();
        }
    }
}