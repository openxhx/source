namespace coolBeach {
    export class SetImagePanel extends ui.coolBeach.panel.ImageSetPanelUI {
        private _person: clientCore.Person;
        private _model: CoolBeachModel;
        private curTxt: number = 0;
        constructor() {
            super();
            this.initUI();
        }

        private initUI() {
            this._model = CoolBeachModel.instance;
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this._person.scale(0.6, 0.6);
            this._person.x = 0;
            this._person.y = 0;
            this.selfImage.addChild(this._person);
            this.boxTxt.visible = false;

            this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID);

            this.btnSubmit.visible = this.btnChange.visible = this._model.isSetImage == 0;
            this.imgReday.visible = this._model.isSetImage == 1;

            this.curTxt = 1;
            this.imgTxt.skin = `coolBeach/txt1.png`;

            this.labCur.text = '' + this._model.curCoolPoint;

            this.updataPoint();
        }

        private updataPoint() {
            this.imgGot10.visible = this._model.pointReward == 1;
            this.imgGot50.visible = clientCore.ItemsInfo.checkHaveItem(1000140);
            this.imgGot100.visible = clientCore.ItemsInfo.checkHaveItem(3500057);
            this.btnGet10.visible = !this.imgGot10.visible && this._model.curCoolPoint >= 10;
            this.btnGet50.visible = !this.imgGot50.visible && this._model.curCoolPoint >= 50;
            this.btnGet100.visible = !this.imgGot100.visible && this._model.curCoolPoint >= 100;
        }

        /**领取清凉奖励 */
        private getCoolReward(idx: number) {
            this['btnGet' + idx].visible = false;
            net.sendAndWait(new pb.cs_cool_beach_show_reward({ flag: 1, type: Math.floor(idx / 50) })).then((msg: pb.sc_cool_beach_show_reward) => {
                alert.showReward(msg.item);
                this['imgGot' + idx].visible = true;
                if (idx == 10) this._model.pointReward = 1;
            })
        }

        /**提交形象 */
        private submitImage() {
            alert.showSmall('确认使用当前形象和台词参赛吗?', {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_cool_beach_show_submit_image({ lines: this.curTxt })).then(() => {
                            alert.showFWords("提交成功!");
                            this._model.isSetImage = 1;
                            this.btnSubmit.visible = this.btnChange.visible = false;
                            this.imgReday.visible = true;
                            clientCore.CoolBeachImageManager.instance.selfTxt = this.curTxt;
                        })
                    }]
                }
            })
        }

        /**更换形象 */
        private changeImage() {
            alert.showSmall('前往装扮界面调整当前形象?', {
                callBack: {
                    caller: this, funArr: [() => {
                        clientCore.ToolTip.gotoMod(6);
                    }]
                }
            })
        }

        /**选择台词 */
        private selectTxt(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                let index = Math.floor((e.target.mouseY - 5) / 30) + 1;
                this.curTxt = index;
                this.imgTxt.skin = `coolBeach/txt${index}.png`;
            }
        }

        /**打开台词选项 */
        private openTxtBox(e: Laya.Event) {
            this.boxTxt.visible = true;
            e.stopPropagation();
            BC.addOnceEvent(this, this, Laya.Event.CLICK, this, this.closeTxtBox);
        }

        /**关闭台词选项 */
        private closeTxtBox(e: Laya.Event) {
            this.boxTxt.visible = false;
        }

        /**道具tips */
        private showTips(cnt: number) {
            let idx = Math.floor(cnt / 50);
            clientCore.ToolTip.showTips(this['reward' + cnt], { id: [9900195, 1000140, 3500057][idx] });
        }

        /**发红包 */
        private redBag() {
            if (clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) < 10) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            alert.showSmall('是否花费10灵豆在世界频道放送夏日果盘?', {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_cool_beach_show_fruit_tray()).then((msg: pb.sc_cool_beach_show_fruit_tray) => {
                            let getCnt = msg.cool - this._model.curCoolPoint;
                            this._model.curCoolPoint = msg.cool;
                            this.labCur.text = '' + this._model.curCoolPoint;
                            alert.showFWords(`夏日果盘已放送,获得${getCnt}清凉值`);
                            this.updataPoint();
                        })
                    }]
                }
            });
        }

        private closeClick() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            this._model = CoolBeachModel.instance;
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeClick);
            BC.addEvent(this, this.btnGet10, Laya.Event.CLICK, this, this.getCoolReward, [10]);
            BC.addEvent(this, this.btnGet50, Laya.Event.CLICK, this, this.getCoolReward, [50]);
            BC.addEvent(this, this.btnGet100, Laya.Event.CLICK, this, this.getCoolReward, [100]);
            BC.addEvent(this, this.reward10, Laya.Event.CLICK, this, this.showTips, [10]);
            BC.addEvent(this, this.reward50, Laya.Event.CLICK, this, this.showTips, [50]);
            BC.addEvent(this, this.reward100, Laya.Event.CLICK, this, this.showTips, [100]);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submitImage);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.changeImage);
            BC.addEvent(this, this.boxTxt, Laya.Event.CLICK, this, this.selectTxt);
            BC.addEvent(this, this.btnShowTxt, Laya.Event.CLICK, this, this.openTxtBox);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.redBag);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._model = null;
            this.removeEventListeners();
            super.destroy();
        }
    }
}