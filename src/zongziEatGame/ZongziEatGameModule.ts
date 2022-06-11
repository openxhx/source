namespace zongziEatGame {
    export class ZongziEatGameModule extends ui.zongziEatGame.ZongziEatGameModuleUI {
        private other: { uid: number, nick: string, side: number, cloths: number[], sex: number };
        private personSelf: clientCore.Person;
        private personOther: clientCore.Person;

        private readyTime: number = 3;
        private curSide: number = 1;
        private waitCd: number = -1;
        private canAct: boolean;

        private allZongzi: number = 21;
        private allCoin: number = 13;
        private selfTimes: number = 10;
        private otherTimes: number = 10;
        private selfCoin: number = 0;
        private otherCoin: number = 0;
        init() {
            this.addPreLoad(xls.load(xls.aiCloth));
            this.addPreLoad(res.load("unpack/zongziEat/zongzi.png"));
            this.addPreLoad(res.load("unpack/zongziEat/zongzi.sk"));
            this.labSelfName.text = clientCore.LocalInfo.userInfo.nick;
            this.personSelf = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this.personSelf.scale(-0.7, 0.7);
            this.selfPerson.addChild(this.personSelf);
        }

        popupOver() {
            clientCore.DialogMgr.ins.open(new FindBattlePanel());
            this.visible = false;
        }

        private onFindGame() {
            this.other = ZongziEatGameModel.instance.otherInfo;
            this.labOtherName.text = this.other.nick;
            this.personOther = new clientCore.Person(this.other.sex, this.other.cloths);
            this.personOther.scale(0.7, 0.7);
            this.otherPerson.addChild(this.personOther);
            this.gameReady();
            this.visible = true;
        }

        /**准备游戏 */
        private gameReady() {
            if (this.other.uid != 0) {//真实玩家
                net.listen(pb.sc_pvp_prepare_notify, this, this.gameStart);
                net.listen(pb.sc_pvp_doing_once_notify, this, this.doingOnceAct);
                net.send(new pb.cs_pvp_prepare({ uidList: [clientCore.LocalInfo.uid, this.other.uid] }));
            } else {
                this.gameStart();
            }
        }

        //双方都准备好了，游戏开始
        private gameStart() {
            net.unListen(pb.sc_pvp_prepare_notify, this, this.gameStart);
            this.imgTime.skin = "zongziEatGame/3.png";
            this.tipTime.visible = true;
            this.tipOver.visible = false;
            this.boxTip.visible = true;
            this.readyTime = 3;
            Laya.timer.loop(1000, this, this.onTime);
        }

        //换边
        private changeSide() {
            if (this.otherTimes == 0 && this.selfTimes == 0) {
                ZongziEatGameModel.instance.selfCoin = this.selfCoin;
                ZongziEatGameModel.instance.otherCoin = this.otherCoin;
                this.gameOver();
                return;
            }
            this.curSide = 1 - this.curSide;
            if (this.curSide == this.other.side) {
                --this.otherTimes;
            } else {
                --this.selfTimes;
            }
            this.labOtherTime.text = "";
            this.labSelfTime.text = "";
            this.imgOtherEating.visible = this.curSide == this.other.side;
            this.imgSelfEating.visible = this.curSide != this.other.side;
            this.labOtherCount.text = "剩余次数:" + this.otherTimes + "/10";
            this.labSelfCount.text = "剩余次数:" + this.selfTimes + "/10";
            this.labOtherCoin.text = "" + this.otherCoin;
            this.labSelfCoin.text = "" + this.selfCoin;
            this.waitCd = 10;
            this.setActTime();
            this.canAct = this.curSide != this.other.side;
            Laya.timer.loop(1000, this, this.onTime);
        }

        private setActTime() {
            if (this.curSide == this.other.side) {
                this.labOtherTime.text = "" + this.waitCd;
            } else {
                this.labSelfTime.text = "" + this.waitCd;
            }
        }

        //对手掉线，直接胜利
        private otherOff() {
            Laya.timer.clear(this, this.onTime);
            alert.showSmall("对手离开对局，清空对手幸运币，结束对局", {
                needClose: false, btnType: alert.Btn_Type.ONLY_SURE, needMask: true, clickMaskClose: false, callBack: {
                    caller: this, funArr: [() => {
                        this.mouseEnabled = false;
                        ZongziEatGameModel.instance.selfCoin = this.selfCoin;
                        ZongziEatGameModel.instance.otherCoin = 0;
                        this.gameOver();
                    }]
                }
            })
        }

        //玩家点击退出
        private onCloseClick() {
            alert.showSmall("退出将直接判负，确认退出吗?", {
                needMask: true, clickMaskClose: false, callBack: {
                    caller: this, funArr: [() => {
                        if (this.other.uid != 0) {
                            EventManager.off("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
                        }
                        this.mouseEnabled = false;
                        if (this.other.uid != 0) {
                            net.send(new pb.cs_pvp_game_user_leave({ uidList: [clientCore.LocalInfo.uid, this.other.uid] }));
                            net.unListen(pb.sc_pvp_doing_once_notify, this, this.doingOnceAct);
                        }
                        Laya.timer.clear(this, this.onTime);
                        // net.send(new pb.cs_pvp_game_over({ uidList: [clientCore.LocalInfo.uid, this.other.uid], status: 3 }));
                        this.destroy();
                    }]
                }
            })
        }

        //游戏结束
        private gameOver() {
            if (this.other && this.other.uid != 0) {
                net.unListen(pb.sc_pvp_doing_once_notify, this, this.doingOnceAct);
            }
            Laya.timer.clear(this, this.onTime);
            this.tipTime.visible = false;
            this.tipOver.visible = true;
            this.boxTip.visible = true;
            clientCore.DialogMgr.ins.open(new GameResult());
        }

        //秒级刷新
        private onTime() {
            if (this.readyTime > 0) {
                --this.readyTime;
                if (this.readyTime <= 0) {
                    Laya.timer.clear(this, this.onTime);
                    this.boxTip.visible = false;
                    this.changeSide();
                } else {
                    this.imgTime.skin = `zongziEatGame/${this.readyTime}.png`;
                }
            }
            if (this.waitCd >= 0) {
                --this.waitCd;
                if (this.waitCd == 0) {
                    if (this.curSide == this.other.side && this.other.uid == 0) {
                        this.actPos(0);
                    } else {
                        alert.showFWords("超时跳过操作~");
                        this.changeSide();
                    }
                } else if (this.waitCd > 0) {
                    this.setActTime();
                }
            }
        }

        //玩家操作
        private actPos(type: number) {
            if (this.other.uid == 0) {
                if (this.canAct || type == 0) {
                    this.canAct = false;
                    let flag = Math.random() < this.allCoin / this.allZongzi ? 1 : 0;
                    this.doingOnceAct(new pb.sc_pvp_doing_once_notify({ info: [{ location: this.curSide, flag: flag }] }));
                }
            } else if (this.canAct) {
                this.canAct = false;
                net.send(new pb.cs_pvp_doing_once({ uidList: [clientCore.LocalInfo.uid, this.other.uid], coordinate: [0] }));
            }
        }

        private doingOnceAct(msg: pb.sc_pvp_doing_once_notify) {
            Laya.timer.clear(this, this.onTime);
            --this.allZongzi;
            this.aniMood.x = msg.info[0].location == this.other.side ? 1080 : 250;
            this.aniMood.once(Laya.Event.STOPPED, this, () => {
                this.aniMood.visible = false;
            })
            if (msg.info[0].flag == 1) {
                this.aniMood.play("win", false, true);
                this.aniMood.visible = true;
                clientCore.DialogMgr.ins.open(new ZongziMakePanel(2));
                --this.allCoin;
                if (msg.info[0].location == this.other.side) {
                    this.otherCoin++;
                } else {
                    this.selfCoin++;
                }
            } else {
                this.aniMood.play("lose", false, true);
                this.aniMood.visible = true;
                clientCore.DialogMgr.ins.open(new ZongziMakePanel(1));
            }
            this.changeSide();
        }

        addEventListeners() {
            net.listen(pb.sc_pvp_user_offline_notify, this, this.otherOff);
            EventManager.on("ZONGZI_GAME_FIND", this, this.onFindGame);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.onCloseClick);
            for (let i = 1; i <= 13; i++) {
                BC.addEvent(this, this["zongzi" + i], Laya.Event.CLICK, this, this.actPos, [1]);
            }
        }

        removeEventListeners() {
            net.unListen(pb.sc_pvp_user_offline_notify, this, this.otherOff);
            EventManager.off("ZONGZI_GAME_FIND", this, this.onFindGame);
            BC.removeEvent(this);
        }

        destroy() {
            this.personSelf?.destroy();
            this.personOther?.destroy();
            this.personSelf = this.personOther = this.other = null;
            super.destroy();
        }
    }
}