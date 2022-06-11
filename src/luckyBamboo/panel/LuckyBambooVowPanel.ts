namespace luckyBamboo {
    export class LuckyBambooVowPanel extends ui.luckyBamboo.panel.LuckyBambooVowPanelUI {
        private _model: LuckyBambooModel;
        private _waiting: boolean;

        private curType: "write" | "check" | "other";
        private curIndex: number;
        private _writePanel: WriteVowPanel;
        private _txt: string;
        private curVowNum: number;
        constructor(sign: number) {
            super();
            this._model = clientCore.CManager.getModel(sign) as LuckyBambooModel;
            this.btnRight.visible = this.btnLeft.visible = false;
        }

        show(type: "write" | "check" | "other", index: number) {
            this.curType = type;
            this.boxCheck.visible = type == "check";
            this.boxWrite.visible = type == "write";
            // this.btnRight.visible = this.btnLeft.visible = type != "write";
            this.imgGou.visible = this._model.limit == 0;
            this.curIndex = index;
            this.setContent();
            if (type == "check") {
                clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '查看挂上去的祈愿牌');
            }
            this.checkVowNum();
            clientCore.DialogMgr.ins.open(this);
        }

        /**展示当前祈愿牌 */
        private setContent() {
            let name = "";
            if (this.curType == "write") {
                let info = _.find(this._model.allVow, (o) => { return o?.uid == clientCore.LocalInfo.uid });
                if (info) {
                    this.setTxtContent(info.content);
                } else {
                    this.setTxtContent("请输入内容");
                }
                name = clientCore.LocalInfo.userInfo.nick;
            } else {
                let info = this._model.allVow[this.curIndex];
                this.setTxtContent(info.content);
                name = info.name;
            }
            let arr = name.split("");
            let temp = "";
            for (let i: number = 0; i < arr.length; i++) {
                temp += arr[i];
                temp += "\n";
            }
            this.labName.text = temp;
        }

        /**写内容 */
        private write() {
            if (!this._writePanel) this._writePanel = new WriteVowPanel();
            this._writePanel.labInput.text = "";
            clientCore.DialogMgr.ins.open(this._writePanel);
        }

        /**确定祈愿 */
        private sureVow() {
            if (this._waiting) return;
            this._waiting = true;
            let txt = this._txt;
            let cost = this._model.vowCose;
            if (this._model.curUid == clientCore.LocalInfo.uid) {
                net.sendAndWait(new pb.cs_luck_bamboo_set_wish_plate({ text: txt, itemId: cost })).then((msg: pb.sc_luck_bamboo_set_wish_plate) => {
                    this._waiting = false;
                    let info = _.find(this._model.allVow, (o) => { return o?.uid == clientCore.LocalInfo.uid });
                    if (!info) {
                        for (let i: number = 0; i < 10; i++) {
                            if (!this._model.allVow[i] || !this._model.allVow[i].uid) {
                                this._model.allVow[i] = msg.plateInfo;
                                break;
                            }
                        }
                        EventManager.event("UPDATA_BAMBOO_INFO");
                    } else {
                        info.content = txt;
                    }
                    this.close();
                }).catch(() => {
                    this._waiting = false;
                })
            } else {
                net.sendAndWait(new pb.cs_luck_bamboo_add_bamboo_to_friend({ uid: this._model.curUid, content: txt, itemId: cost })).then((msg: pb.sc_luck_bamboo_add_bamboo_to_friend) => {
                    this._waiting = false;
                    for (let i: number = 0; i < 10; i++) {
                        if (!this._model.allVow[i] || !this._model.allVow[i].uid) {
                            this._model.allVow[i] = msg.plateInfo;
                            break;
                        }
                    }
                    EventManager.event("UPDATA_BAMBOO_INFO");
                    this.close();
                }).catch(() => {
                    this._waiting = false;
                })
            }
        }

        /**翻页 */
        private changePage(flag: number) {
            if (this._model.allVow[this.curIndex]?.uid && this.curVowNum == 1) return;
            this.curIndex += flag;
            if (this.curIndex < 0) this.curIndex = this._model.allVow.length - 1;
            if (this.curIndex >= this._model.allVow.length) this.curIndex = 0;
            if (!this._model.allVow[this.curIndex]) {
                this.changePage(flag);
                return;
            }
            this.setContent();
        }

        /**删除祈愿牌 */
        private deleteCur() {
            if (this._waiting) return;
            this._waiting = true;
            let id = this._model.allVow[this.curIndex].uid;
            net.sendAndWait(new pb.cs_luck_bamboo_del_wish_plate({ uid: id, idx: this.curIndex })).then(() => {
                this._model.allVow[this.curIndex] = {};
                this.curVowNum--;
                EventManager.event("UPDATA_BAMBOO_INFO");
                this._waiting = false;
                this.close();
            }).catch(() => {
                this._waiting = false;
            })
        }

        private checkVowNum() {
            this.curVowNum = 0;
            for (let i: number = 0; i < 10; i++) {
                if (this._model.allVow[i] && this._model.allVow[i].uid) {
                    this.curVowNum++;
                }
            }
        }

        /**设置留言权限 */
        private setLimit() {
            if (this._waiting) return;
            this._waiting = true;
            this.imgGou.visible = !this.imgGou.visible;
            net.sendAndWait(new pb.cs_luck_bamboo_wish_plate_limit({ flag: this.imgGou.visible ? 0 : 1 })).then(() => {
                this._model.limit = this.imgGou.visible ? 0 : 1;
                this._waiting = false;
            }).catch(() => {
                this.imgGou.visible = !this.imgGou.visible;
                this._waiting = false;
            })
        }

        private setTxtContent(txt: string) {
            this._txt = txt;
            for (let i: number = 1; i <= 4; i++) {
                if ((i - 1) * 8 < txt.length) {
                    let arr = txt.slice((i - 1) * 8, i * 8).split("");
                    let temp = "";
                    for (let i: number = 0; i < arr.length; i++) {
                        temp += arr[i];
                        temp += "\n";
                    }
                    this["labContent" + i].text = temp;
                } else {
                    this["labContent" + i].text = "";
                }
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnWrite, Laya.Event.CLICK, this, this.write);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureVow);
            BC.addEvent(this, this.btnDelete, Laya.Event.CLICK, this, this.deleteCur);
            BC.addEvent(this, this.boxRefuse, Laya.Event.CLICK, this, this.setLimit);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changePage, [1]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changePage, [-1]);
            EventManager.on("VOW_WRITE_BACK", this, this.setTxtContent);
        }

        close() {
            this._model.vowCose = 0;
            clientCore.DialogMgr.ins.close(this);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("VOW_WRITE_BACK", this, this.setTxtContent);
        }

        destroy() {
            super.destroy();
            this._writePanel?.destroy();
            this._writePanel = null;
        }
    }
}