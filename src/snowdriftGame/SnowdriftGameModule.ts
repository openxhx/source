namespace snowdriftGame {
    //snowdriftGame.SnowdriftGameModule
    export class SnowdriftGameModule extends ui.snowdriftGame.SnowdriftGameModuleUI {
        private other: { uid: number, nick: string, side: number, cloths: number[], sex: number };
        private max: number;
        private waitCd: number;
        private room: number;
        private personSelf: clientCore.Person;
        private personOther: clientCore.Person;
        private petSelfAni: clientCore.Bone;
        private petOtherAni: clientCore.Bone;

        private count0: number;
        private count1: number;
        private onGame: boolean;
        private isAction: boolean;
        private resultPanle: GameResultPanel;
        init(d: { other: { uid: number, nick: string, side: number, cloths: number[], sex: number }, max: number, room: number }) {
            this.other = d.other;
            this.max = d.max;
            this.room = d.room;
            this.personSelf = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this.personSelf.scale(-0.4, 0.4);
            this.imgSelf.addChild(this.personSelf);
            this.personSelf.pos(74, -150);
            this.personOther = new clientCore.Person(this.other.sex, this.other.cloths);
            this.personOther.scale(0.4, 0.4);
            this.imgOther.addChild(this.personOther);
            this.personOther.pos(74, -150);

            this.petSelfAni = clientCore.BoneMgr.ins.play("res/animate/snowGame/huabaoSnow.sk", "fly", true, this.petSelf);
            this.petOtherAni = clientCore.BoneMgr.ins.play("unpack/happinessFlavour/MysticSnowdriftPanel/huabaoSnow.sk", "fly", true, this.petOther);
            // this.petOtherAni.scaleX = -1;
        }

        onPreloadOver() {
            this.btnClose.visible = false;
            this.labMax.text = this.max.toString();
            this.labTime.text = "03:00";
            this.labSelf.text = "0";
            this.labOther.text = "0";
            this.waitCd = 9000;
            this.onGame = false;
            this.initPet();
            this.initBall();
        }

        popupOver() {
            if (clientCore.BattleGameMgr.instance.otherLeave) {
                this.otherOff();
                // return;
            }
            this.prepareGame();
        }

        private async prepareGame() {
            await util.TimeUtil.awaitTime(2000);
            Laya.Tween.to(this.boxWaiting, { y: 0, scaleX: 0, scaleY: 0 }, 500, null, Laya.Handler.create(this, () => {
                if (this.other.uid != 0) {//真实玩家
                    net.listen(pb.sc_draw_prepare_notify, this, this.gameStart);
                    EventManager.on("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
                    net.send(new pb.cs_snowman_prepare({ uidList: [clientCore.LocalInfo.uid, this.other.uid] }));
                } else {
                    this.isAction = true;
                    this.gameStart();
                }
            }))
        }

        //#region 花宝的移动
        private petSpeed: number;
        private selfBallHold: boolean;
        private otherBallHold: boolean;
        private moveFlag: number;
        private robotActTime: number;
        private aniHandle: Laya.Handler;
        private initPet() {
            this.petSpeed = 3;
            this.moveFlag = 1;
            this.boxSelf.x = 0;
            this.boxOther.x = 1334;
            this.selfBallHold = this.otherBallHold = true;
            this.selfBall.visible = this.otherBall.visible = true;
            this.setRobotTime();
        }

        private petMove() {
            this.boxSelf.x += this.petSpeed / (this.curScale + 0.25) * this.moveFlag;
            this.boxOther.x -= this.petSpeed / (this.curScale + 0.25) * this.moveFlag;
            if (this.boxSelf.x >= 543) {
                this.moveFlag = -1;
                this.changePetAni(0, "idle2");
                this.changePetAni(1, "idle2");
            }
            else if (this.boxSelf.x <= 0) {
                this.moveFlag = 1;
                this.selfBallHold = this.otherBallHold = true;
                this.selfBall.visible = this.otherBall.visible = true;
                this.setRobotTime();
            }
        }

        private setRobotTime() {
            if (this.other.uid == 0) {
                let dis = Math.floor(Math.random() * 74) + 449 - (124 - 74) * this.curScale;
                this.robotActTime = this.waitCd - Math.floor(dis / this.petSpeed);
            }
        }

        private changePetAni(side: number, name: string) {
            let ani = side == 0 ? this.petSelfAni : this.petOtherAni;
            ani.offAllHandle();
            ani.stop();
            ani.play(name, false, Laya.Handler.create(this, () => {
                ani.play("fly", true);
            }));
        }
        //#endregion

        //#region 雪球相关
        private ballPool: Laya.Image[];
        private onShowBall: Laya.Image[];
        private onMoveBall: { img: Laya.Image, target: number }[];
        private ballSpeed: number;
        private actionTimeArr: number[];
        private actionPosArr: number[];
        private curScale: number;
        private initBall() {
            this.ballPool = [];
            this.onShowBall = [];
            this.onMoveBall = [];
            this.actionTimeArr = [];
            this.actionPosArr = [];
            this.ballSpeed = 5;
            this.curScale = 1;
            let base1 = this.getBallImage();
            this.boxBall.addChild(base1);
            let base2 = this.getBallImage();
            this.boxBall.addChild(base2);
            base1.pos(486, 695);
            base2.pos(848, 695);
            this.onShowBall.push(base1, base2);
        }
        /**根据操作创建雪球 */
        private creatBall(info: pb.IsnowmanInfo) {
            if (info.location == this.other.side) {
                if (!this.otherBallHold) return;
                this.otherBallHold = this.otherBall.visible = false;
            } else {
                if (!this.isAction) return;
                this.isAction = false;
                this.selfBallHold = this.selfBall.visible = false;
            }
            let img = this.getBallImage();
            img.scale(this.curScale, this.curScale);
            if (info.coordinate[1] >= 486 - 17 * this.curScale && info.coordinate[1] <= 486 + 17 * this.curScale) {
                let count = info.location == this.other.side ? ++this.count1 : ++this.count0;
                this.onMoveBall.push({ img: img, target: 695 - count * Math.ceil(55 * this.curScale) });
                this.boxBall.addChild(img);
            } else {
                this.onMoveBall.push({ img: img, target: 695 });
                this.boxBall.addChildAt(img, 0);
            }
            if (info.location == this.other.side) {
                img.pos(1334 - info.coordinate[1], 60 + 223 * this.curScale);
            } else {
                img.pos(info.coordinate[1], 60 + 223 * this.curScale);
                net.send(new pb.cs_snowman_update_layersTimes({ layersTimes: this.count0 }));
            }
            img.visible = true;
        }
        /**雪球对象池 */
        private getBallImage(): Laya.Image {
            let img: Laya.Image;
            if (this.ballPool.length == 0) {
                img = new Laya.Image("snowdriftGame/xue_qiu.png");
                img.width = 74;
                img.height = 75;
                img.anchorX = 0.5;
                img.anchorY = 1;
            } else {
                img = this.ballPool.shift();
            }
            return img;
        }
        /**检查缓存的操作 */
        private checkActionArr() {
            if (!this.actionTimeArr || this.actionTimeArr.length == 0) return;
            for (let i = 0; i < this.actionTimeArr.length; i++) {
                if (this.actionTimeArr[i] >= this.waitCd) {
                    let time = this.actionTimeArr.splice(i, 1)[0];
                    let pos = this.actionPosArr.splice(i, 1)[0];
                    this.drawPoint(new pb.sc_snowman_once_over_notify({ info: [{ location: this.other.side, coordinate: [time, pos] }] }));
                    i--;
                }
            }
        }
        /**球下落 */
        private ballMove() {
            for (let i = 0; i < this.onMoveBall.length; i++) {
                this.onMoveBall[i].img.y += this.ballSpeed;
                if (this.onMoveBall[i].img.y >= this.onMoveBall[i].target) {
                    this.onMoveBall[i].img.y = this.onMoveBall[i].target;
                    if (this.onMoveBall[i].target == 695) {
                        this.onMoveBall[i].img.visible = false;
                        this.ballPool.push(this.onMoveBall[i].img);
                        if (this.onMoveBall[i].img.x < 667) {
                            this.changePetAni(0, "fail");
                        } else {
                            this.changePetAni(1, "fail");
                        }
                        let ani = clientCore.BoneMgr.ins.play("unpack/snowdriftGame/Effect.sk", 0, false, this.boxBall);
                        ani.scaleX = this.curScale;
                        ani.scaleY = this.curScale;
                        ani.pos(this.onMoveBall[i].img.x, this.onMoveBall[i].img.y - 37 * this.curScale);
                        ani.once(Laya.Event.COMPLETE, this, () => {
                            ani.dispose();
                        })
                    } else {
                        this.onShowBall.push(this.onMoveBall[i].img);
                        if (this.onMoveBall[i].img.x < 667) {
                            this.labSelf.text = this.count0.toString();
                            this.changePetAni(0, "success");
                        } else {
                            this.labOther.text = this.count1.toString();
                            this.changePetAni(1, "success");
                        }
                        this.checkScale();
                        let ani = clientCore.BoneMgr.ins.play("unpack/snowdriftGame/Effect.sk", 1, false, this.boxBall);
                        ani.scaleX = this.curScale;
                        ani.scaleY = this.curScale;
                        ani.pos(this.onMoveBall[i].img.x, this.onMoveBall[i].img.y - 37 * this.curScale);
                        ani.once(Laya.Event.COMPLETE, this, () => {
                            ani.dispose();
                        })
                    }
                    this.onMoveBall.splice(i, 1);
                    --i;
                }
            }
        }
        /**足够高时候缩小 */
        private checkScale() {
            let max = Math.max(this.count0, this.count1);
            let needScale = 1;
            if (max == 6) needScale = 0.75;
            else if (max == 8) needScale = 0.65;
            else if (max == 11) needScale = 0.55;
            else if (max == 15) needScale = 0.45;
            else if (max == 20) needScale = 0.35;
            if (this.curScale > needScale) {
                let curDis = Math.ceil(55 * this.curScale);
                for (let i = 0; i < this.onShowBall.length; i++) {
                    this.onShowBall[i].scale(needScale, needScale);
                    this.onShowBall[i].y = 695 - ((695 - this.onShowBall[i].y) / curDis) * Math.ceil(55 * needScale);
                    if (this.onShowBall[i].x < 667) {
                        this.onShowBall[i].x = 486 - (486 - this.onShowBall[i].x) / this.curScale * needScale;
                    } else {
                        this.onShowBall[i].x = 848 - (848 - this.onShowBall[i].x) / this.curScale * needScale;
                    }
                }
                for (let i = 0; i < this.onMoveBall.length; i++) {
                    this.onMoveBall[i].img.scale(needScale, needScale);
                    this.onMoveBall[i].target = 695 - ((695 - this.onMoveBall[i].target) / curDis) * Math.ceil(55 * needScale);
                    if (this.onMoveBall[i].img.x < 667) {
                        this.onMoveBall[i].img.x = 486 - (486 - this.onMoveBall[i].img.x) / this.curScale * needScale;
                    } else {
                        this.onMoveBall[i].img.x = 848 - (848 - this.onMoveBall[i].img.x) / this.curScale * needScale;
                    }
                }
                this.boxSelf.scale(needScale, needScale);
                this.boxOther.scale(needScale, needScale);
                this.boxBg.scale(needScale + 0.25, needScale + 0.25);
                this.curScale = needScale;
            }
        }
        //#endregion

        //收到操作信息
        private async drawPoint(msg: pb.sc_snowman_once_over_notify) {
            if (msg.info[0].coordinate[0] < this.waitCd) {
                if (!this.actionTimeArr.includes(msg.info[0].coordinate[0])) {
                    this.actionTimeArr.push(msg.info[0].coordinate[0]);
                    this.actionPosArr.push(msg.info[0].coordinate[1]);
                }
            } else {
                this.creatBall(msg.info[0]);
            }
        }

        //双方都准备好了，游戏开始
        private gameStart() {
            net.unListen(pb.sc_draw_prepare_notify, this, this.gameStart);
            net.listen(pb.sc_snowman_once_over_notify, this, this.drawPoint);
            this.boxWaiting.visible = false;
            this.count0 = 0;
            this.count1 = 0;
            Laya.timer.loop(20, this, this.onTime);
            this.onGame = true;
            this.btnClose.visible = true;
        }

        //操作点击事件
        private onImageClick() {
            if (!this.onGame) return;
            if (!this.selfBallHold) return;
            this.selfBallHold = false;
            this.actPos(1 - this.other.side);
        }

        //玩家操作
        private actPos(side: number) {
            this.isAction = true;
            let pos = this.boxSelf.x + 74 * this.curScale;
            if (this.other.uid == 0 || side == this.other.side) {
                this.drawPoint(new pb.sc_snowman_once_over_notify({ info: [{ location: side, coordinate: [this.waitCd, pos] }] }));
            } else {
                net.sendAndWait(new pb.cs_snowman_once_over({ uidList: [clientCore.LocalInfo.uid, this.other.uid], coordinate: [this.waitCd, pos], room: this.room })).then((msg: pb.sc_snowman_once_over) => {
                    for (let i = 0; i < msg.coordinate.length; i += 2) {
                        if (parseInt(msg.coordinate[i]) < this.waitCd && !this.actionTimeArr.includes(parseInt(msg.coordinate[i]))) {
                            this.actionTimeArr.push(parseInt(msg.coordinate[i]));
                            this.actionPosArr.push(parseInt(msg.coordinate[i + 1]));
                        }
                    }
                });
            }
        }

        //帧刷新
        private onTime() {
            --this.waitCd;
            this.petMove();
            this.ballMove();
            this.checkActionArr();
            if (this.waitCd <= 0) {
                Laya.timer.clear(this, this.onTime);
                if (this.other.uid != 0) {
                    EventManager.off("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
                }
                this.onGame = false;
                let result = this.count0 > this.count1 ? 1 : (this.count0 < this.count1 ? 0 : 2);
                let type = result;
                if (Math.max(this.count0, this.count1) < 5) type = 0;
                this.gameOver(result, type);
            } else {
                let secend = Math.ceil(this.waitCd / 50);
                let min = Math.floor(secend / 60);
                secend = secend - min * 60;
                this.labTime.text = `0${min}:${secend > 9 ? "" : "0"}${secend}`;
                if (this.waitCd == this.robotActTime) {
                    this.actPos(this.other.side);
                }
            }
        }

        //玩家点击退出
        private onCloseClick() {
            alert.showSmall("关闭将会直接退出，确认退出吗?", {
                needMask: true, clickMaskClose: false, callBack: {
                    caller: this, funArr: [() => {
                        this.mouseEnabled = false;
                        if (this.other.uid != 0) {
                            EventManager.off("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
                            net.send(new pb.cs_draw_game_user_leave({ uidList: [clientCore.LocalInfo.uid, this.other.uid] }));
                        }
                        Laya.timer.clear(this, this.onTime);
                        this.gameOver(0, 3);
                    }]
                }
            })
        }

        //对手掉线，直接胜利
        private otherOff() {
            EventManager.off("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
            if (this.onGame) {
                net.unListen(pb.sc_snowman_once_over_notify, this, this.drawPoint);
            }
            this.other.uid = 0;
            // Laya.timer.clear(this, this.onTime);
            // alert.showSmall("对手离开对局，直接胜利！", {
            //     needClose: false, btnType: alert.Btn_Type.ONLY_SURE, needMask: true, clickMaskClose: false, callBack: {
            //         caller: this, funArr: [() => {
            //             this.mouseEnabled = false;
            //             this.gameOver(1, this["times" + (1 - this.other.side)] > 5 ? 1 : 0);
            //         }]
            //     }
            // })
        }

        //游戏结束
        private gameOver(result: number, type: number) {
            clientCore.DialogMgr.ins.closeAllDialog();
            if (this.other.uid != 0) {
                net.unListen(pb.sc_snowman_once_over_notify, this, this.drawPoint);
            }
            if (!this.resultPanle) {
                this.resultPanle = new GameResultPanel();
            }
            this.resultPanle.setResult(result, this.count0, this.max);
            clientCore.Logger.sendLog('2021年12月10日活动', '【活动】神秘的雪堆', `游戏结束时堆叠${this.count0}层雪球`);
            if (type != 3) {
                net.listen(pb.sc_draw_game_over_notify, this, this.showReward);
                net.send(new pb.cs_snowman_game_over({ uidList: [clientCore.LocalInfo.uid, this.other.uid], status: type }));
            } else {
                net.send(new pb.cs_snowman_game_over({ uidList: [clientCore.LocalInfo.uid, this.other.uid], status: type }));
                this.destroy();
            }
        }

        //奖励
        private showReward(msg: pb.sc_draw_game_over_notify) {
            net.unListen(pb.sc_draw_game_over_notify, this, this.showReward);
            this.resultPanle.setReward(msg.item[0]);
            clientCore.DialogMgr.ins.open(this.resultPanle);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClick, Laya.Event.CLICK, this, this.onImageClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.personSelf?.destroy();
            this.personOther?.destroy();
            while (this.ballPool.length > 0) {
                this.ballPool.pop().destroy();
            }
            while (this.onShowBall.length > 0) {
                this.onShowBall.pop().destroy();
            }
            while (this.onMoveBall.length > 0) {
                this.onMoveBall.pop().img.destroy();
            }
            this.petSelfAni?.dispose();
            this.petOtherAni?.dispose();
            this.ballPool = null;
            this.onShowBall = null;
            this.onMoveBall = null;
            this.actionTimeArr = null;
            this.actionPosArr = null;
            this.petSelfAni = null;
            this.petOtherAni = null;
            this.other = this.personOther = this.personSelf = null;
        }
    }
}