namespace coolBeach {
    export class JudgePanel extends ui.coolBeach.panel.JudgePanelUI {
        private imageList: pb.ICoolInfo[];
        private leftImg1: clientCore.Person;
        private leftImg2: clientCore.Person;
        private rightImg1: clientCore.Person;
        private rightImg2: clientCore.Person;
        private curShow: number = 0;
        constructor() {
            super();
            this.initUI();
        }

        public initUI() {
            let times = CoolBeachModel.instance.judgeTimes;
            this.boxBegin.visible = times == 0;
            this.boxJudge.visible = times > 0 && times < 10;
            this.btnOut.visible = false;
            this.btnOpen.visible = true;
            this.boxReward.visible = times == 10 && CoolBeachModel.instance.isGetJudgeBox == 0;
            this.boxPoint.visible = false;
            if (this.boxJudge.visible) this.beginJudge();
        }

        private closeClick() {
            if (CoolBeachModel.instance.judgeTimes == 10 && CoolBeachModel.instance.isGetJudgeBox == 0) {
                alert.showFWords('还有奖励未领取~');
                return;
            }
            if (CoolBeachModel.instance.isGetJudgeBox == 1) {
                clientCore.DialogMgr.ins.close(this, false);
                return;
            }
            alert.showSmall(`退出将保留当前进度，确认退出吗?`, {
                callBack: {
                    caller: this, funArr: [() => {
                        clientCore.DialogMgr.ins.close(this, false);
                    }]
                }
            })
        }

        /**开始判定 */
        private beginJudge() {
            this.imageList = _.cloneDeep(clientCore.CoolBeachImageManager.instance.images);
            this.imageList = _.shuffle(this.imageList);
            if (this.imageList.length % 2 != 0) {
                this.imageList.push(this.imageList[0]);
            }
            this.leftImg1 = new clientCore.Person(1);
            this.leftImg1.scale(0.6, 0.6);
            this.leftImg1.scaleX = -0.6;
            this.imgLeft.addChild(this.leftImg1);
            this.leftImg2 = new clientCore.Person(2);
            this.leftImg2.scale(0.6, 0.6);
            this.leftImg2.scaleX = -0.6;
            this.imgLeft.addChild(this.leftImg2);

            this.rightImg1 = new clientCore.Person(1);
            this.rightImg1.scale(0.6, 0.6);
            this.imgRight.addChild(this.rightImg1);
            this.rightImg2 = new clientCore.Person(2);
            this.rightImg2.scale(0.6, 0.6);
            this.imgRight.addChild(this.rightImg2);

            this.curShow = 0;
            this.showNext();
            this.boxBegin.visible = false;
            this.boxJudge.visible = true;
        }

        /**展示下一组 */
        private async showNext() {
            let model = CoolBeachModel.instance;
            if (model.judgeTimes == 10) {
                this.showEnd();
                return;
            }
            this.txtCurLevel.value = '' + (9 - model.judgeTimes);
            this.leftImg1.visible = this.imageList[this.curShow].sexy == 1;
            this.leftImg2.visible = this.imageList[this.curShow].sexy == 2;
            this.rightImg1.visible = this.imageList[this.curShow + 1].sexy == 1;
            this.rightImg2.visible = this.imageList[this.curShow + 1].sexy == 2;
            let left = this.imageList[this.curShow].sexy == 1 ? this.leftImg1 : this.leftImg2;
            let right = this.imageList[this.curShow + 1].sexy == 1 ? this.rightImg1 : this.rightImg2;
            left.downAllCloth();
            right.downAllCloth();
            let clothLeft = this.imageList[this.curShow].image.split('_').map((o) => { return parseInt(o) });
            let clothRight = this.imageList[this.curShow + 1].image.split('_').map((o) => { return parseInt(o) });
            left.upByIdArr(clothLeft);
            right.upByIdArr(clothRight);
        }

        private _waiting: boolean;
        /**做出选择 */
        private choose(idx: number) {
            if (this._waiting) return;
            this._waiting = true;
            let select = this.imageList.slice(this.curShow, this.curShow + 2);
            net.sendAndWait(new pb.cs_cool_beach_show_like({ uid: select[idx].userid })).then(async () => {
                CoolBeachModel.instance.judgeTimes++;
                select[idx].cool++;
                this.labLeftPoint.text = '' + select[0].cool;
                this.labRightPoint.text = '' + select[1].cool;
                this.boxPoint.visible = true;
                let ani = clientCore.BoneMgr.ins.play('unpack/coolBeach/zhuhuodongdonghua.sk', 0, true, this.boxJudge);
                if (idx == 0) ani.pos(this.imgLeft.x - 14, this.imgLeft.y + 170);
                else ani.pos(this.imgRight.x - 14, this.imgRight.y + 170);
                await util.TimeUtil.awaitTime(3000);
                ani?.dispose();
                if (this._closed) return;
                this.boxPoint.visible = false;
                this.curShow += 2;
                if (this.curShow >= this.imageList.length) this.curShow = 0;
                this.showNext();
                this._waiting = false;
            }).catch(() => {
                this._waiting = false;
            })
        }

        /**完成评选 */
        private showEnd() {
            this.boxJudge.visible = false;
            this.imgBox.skin = 'coolBeach/box_close.png';
            this.boxReward.visible = true;
        }

        /**领取奖励 */
        private getReward() {
            this.btnOpen.visible = false;
            net.sendAndWait(new pb.cs_cool_beach_show_reward({ flag: 2, type: 0 })).then((msg: pb.sc_cool_beach_show_reward) => {
                alert.showReward(msg.item);
                this.btnOut.visible = true;
                CoolBeachModel.instance.allJudgeCnt++;
                CoolBeachModel.instance.isGetJudgeBox = 1;
                this.imgBox.skin = 'coolBeach/box_open.png';
            }).catch(() => {
                this.btnOpen.visible = true;
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOut, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnBegin, Laya.Event.CLICK, this, this.beginJudge);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.choose, [0]);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.choose, [1]);
            BC.addEvent(this, this.btnOpen, Laya.Event.CLICK, this, this.getReward);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.removeEventListeners();
            this.imageList = null;
            this.leftImg1?.destroy();
            this.leftImg2?.destroy();
            this.rightImg1?.destroy();
            this.rightImg2?.destroy();
            super.destroy();
        }
    }
}