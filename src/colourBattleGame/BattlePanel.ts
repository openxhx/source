namespace colourBattleGame {
    //colourBattleGame.BattlePanel
    export class BattlePanel extends ui.colourBattleGame.BattlePanelUI {
        private other: { uid: number, nick: string, side: number, cloths: number[], sex: number };
        private times0: number;
        private times1: number;
        private waitCd: number;
        private curSide: number;

        private personSelf: clientCore.Person;
        private personOther: clientCore.Person;

        private imgData: any;
        private curType: number;
        private allCount: number;
        private count0: number;
        private count1: number;
        private isFirst: boolean;
        init(d: { other: any, type: number }) {
            this.other = d.other;
            this["labName" + this.other.side].text = this.other.nick;
            this["labName" + (1 - this.other.side)].text = clientCore.LocalInfo.userInfo.nick;
            this.imgImage.skin = `unpack/colourBattleGame/image/img_${d.type}.png`;
            this.imgMask.skin = `unpack/colourBattleGame/image/mask_${d.type}.png`;

            this.personSelf = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.wearingClothIdArr);
            this.personSelf.scale(0.6, 0.6);
            this["role" + (1 - this.other.side)].addChild(this.personSelf);
            this.personOther = new clientCore.Person(this.other.sex, this.other.cloths);
            this.personOther.scale(0.6, 0.6);
            this["role" + this.other.side].addChild(this.personOther);
            if (this.other.side == 0) this.personOther.scaleX = -0.6;
            else this.personSelf.scaleX = -0.6;
            this.curType = d.type;
            let path: string = `res/json/colourGame/image${d.type}.json`;
            this.addPreLoad(res.load(path, Laya.Loader.JSON));
            this.addPreLoad(res.load("res/animate/afternoonTime/losewintie.png"));
        }

        onPreloadOver() {
            let path: string = `res/json/colourGame/image${this.curType}.json`;
            this.imgData = _.cloneDeep(res.get(path));
            this.allCount = this.imgData["121"][0][0];
            console.log("所有点位的数量：" + this.allCount);
        }

        popupOver() {
            if (clientCore.BattleGameMgr.instance.otherLeave) {
                this.otherOff();
                return;
            }
            this.times0 = this.times1 = 0;
            if (this.other.uid != 0) {//真实玩家
                net.listen(pb.sc_draw_prepare_notify, this, this.gameStart);
                EventManager.on("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
                net.listen(pb.sc_draw_once_over_notify, this, this.drawPoint);
                net.send(new pb.cs_draw_prepare({ uidList: [clientCore.LocalInfo.uid, this.other.uid] }));
            } else {
                this.gameStart();
            }
        }

        //收到涂色信息，画图
        private async drawPoint(msg: pb.sc_draw_once_over_notify) {
            // if (msg.drawInfo[0].coordinate?.length > 0) {
            //     let img = new Laya.Image(`colourBattleGame/color${msg.drawInfo[0].location}.png`);
            //     this.boxPoint.addChildAt(img, 0);
            //     img.pos(msg.drawInfo[0].coordinate[0], msg.drawInfo[0].coordinate[1]);
            //     this.removeGetPoint(msg.drawInfo[0].coordinate, msg.drawInfo[0].location);
            // }
            // this["times" + this.curSide] = msg.drawInfo[0].drawTimes;
            // this["labTimes" + msg.drawInfo[0].location].text = "剩余次数：" + (10 - msg.drawInfo[0].drawTimes) + "/10";
            // if (msg.drawInfo[0].location == 1 && msg.drawInfo[0].drawTimes >= 10) {
            //     Laya.timer.clear(this, this.onTime);
            //     this.judgeImageState();
            // } else {
            //     Laya.timer.clear(this, this.onTime);
            //     this.changeSide();
            // }
        }

        //移除点位，增加数量
        private removeGetPoint(pos: number[], side: number) {
            pos[0] += 35.5;
            pos[1] += 35.5;
            let idxX = Math.floor(pos[0] / 40);
            let idxY = Math.floor(pos[1] / 40);
            let minX = Math.max(0, idxX - 1);
            let minY = Math.max(0, idxY - 1);
            let maxX = Math.min(10, idxX + 1);
            let maxY = Math.min(10, idxY + 1);
            while (minY <= maxY) {
                let pixel = minX + minY * 11;
                let info: number[][] = this.imgData[pixel.toString()];
                for (let i = 0; i < info.length; i++) {
                    let disX = pos[0] - info[i][0]
                    let disY = pos[1] - info[i][1]
                    if (Math.sqrt(disX * disX + disY * disY) < 35.5) {
                        info.splice(i, 1);
                        if (side == 0) this.count0++;
                        else this.count1++;
                        --i;
                    }
                }
                minX += 1;
                if (minX > maxX) {
                    minY += 1;
                    minX = Math.max(0, idxX - 1);;
                }
            }
            if (side == 0 && this.isFirst) {
                this.count0 = Math.ceil(this.count0 / 2);
                this.isFirst = false;
            }
            this.labGot0.text = "有效占比:" + (this.count0 / this.allCount * 100).toFixed(2) + "%";
            this.labGot1.text = "有效占比:" + (this.count1 / this.allCount * 100).toFixed(2) + "%";
        }

        //对手掉线，直接胜利
        private otherOff() {
            EventManager.off("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
            Laya.timer.clear(this, this.onTime);
            alert.showSmall("对手离开对局，直接胜利！", {
                needClose: false, btnType: alert.Btn_Type.ONLY_SURE, needMask: true, clickMaskClose: false, callBack: {
                    caller: this, funArr: [() => {
                        this.mouseEnabled = false;
                        this.gameOver(1, this["times" + (1 - this.other.side)] > 5 ? 1 : 0);
                    }]
                }
            })
        }

        //双方都准备好了，游戏开始
        private gameStart() {
            net.unListen(pb.sc_draw_prepare_notify, this, this.gameStart);
            this.boxWaiting.visible = false;
            this.curSide = 1;
            this.count0 = 0;
            this.count1 = 0;
            this.isFirst = true;
            this.changeSide();
        }

        //换边
        private changeSide() {
            this["imgState" + this.curSide].skin = "";
            this["labTime" + this.curSide].text = "";
            this.curSide = 1 - this.curSide;
            this["imgState" + this.curSide].skin = this.curSide == this.other.side ? "colourBattleGame/dui_fang_tu_se.png" : "colourBattleGame/zi_ji_tu_se.png";
            this["labTime" + this.curSide].text = "5";
            this.waitCd = 5;
            Laya.timer.loop(1000, this, this.onTime);
            this.boxType.mouseEnabled = this.curSide != this.other.side;
        }

        //涂抹点击事件
        private onImageClick(e: Laya.Event) {
            if (this.curSide == this.other.side) return;
            if (this.boxWaiting.visible) return;
            this.boxType.mouseEnabled = false;
            this.actPos([e.currentTarget.mouseX - 35, e.currentTarget.mouseY - 35]);
        }

        //玩家操作
        private actPos(pos: number[]) {
            if (this.other.uid == 0) {
                if (this.curSide == this.other.side) {
                    let x = Math.floor(Math.random() * 352) + 35;
                    let y = Math.floor(Math.random() * 352) + 35;
                    pos = [x, y];
                }
                // this.drawPoint(new pb.sc_draw_once_over_notify({ drawInfo: [{ location: this.curSide, drawTimes: ++this["times" + this.curSide], coordinate: pos }] }));
            } else if (this.curSide != this.other.side) {
                net.send(new pb.cs_draw_once_over({ uidList: [clientCore.LocalInfo.uid, this.other.uid], coordinate: pos }));
            }
        }

        //判断当前涂色信息
        private async judgeImageState() {
            if (this.other.uid != 0) {
                EventManager.off("BATTLE_GAME_OTHER_LEAVE", this, this.otherOff);
            }
            this.labWaiting.text = "结算中…";
            this.boxWaiting.visible = true;
            this.mouseEnabled = false;
            await util.TimeUtil.awaitTime(500);
            let result = 0;
            if (this.count0 == this.count1) result = 2;
            else if (this.count0 > this.count1) result = this.other.side == 0 ? 0 : 1;
            else if (this.count0 < this.count1) result = this.other.side == 0 ? 1 : 0;
            this.labGot0.text = "有效占比:" + (this.count0 / this.allCount * 100).toFixed(2) + "%";
            this.labGot1.text = "有效占比:" + (this.count1 / this.allCount * 100).toFixed(2) + "%";
            this.gameOver(result, result);
        }

        //秒级刷新
        private onTime() {
            --this.waitCd;
            if (this.waitCd <= 0) {
                this["labTime" + this.curSide].text = "0";
                if (this.waitCd == 0) {
                    this.actPos(null);
                }
            } else {
                this["labTime" + this.curSide].text = this.waitCd.toString();
            }
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
                        if (this.other.uid != 0)
                            net.send(new pb.cs_draw_game_user_leave({ uidList: [clientCore.LocalInfo.uid, this.other.uid] }));
                        this.gameOver(0, 3);
                    }]
                }
            })
        }

        //游戏结束
        private gameOver(result: number, type: number) {
            clientCore.DialogMgr.ins.closeAllDialog();
            if (this.other.uid != 0) {
                net.unListen(pb.sc_draw_once_over_notify, this, this.drawPoint);
            }
            Laya.timer.clear(this, this.onTime);
            this.boxWaiting.visible = false;
            this.boxOver.visible = true;
            let ani = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/losewintie.sk", result > 0 ? (3 - result) : 0, false, this.boxOver);
            ani.pos(680, 422);
            ani.once(Laya.Event.COMPLETE, this, () => {
                ani.dispose();
                if (type != 3) net.listen(pb.sc_draw_game_over_notify, this, this.showReward);
                net.send(new pb.cs_draw_game_over({ uidList: [clientCore.LocalInfo.uid, this.other.uid], status: type }));
                this.imgFail.visible = result == 0;
                this.imgWin.visible = result == 1;
                this.imgPing.visible = result == 2;
                this.mouseEnabled = true;
            });
        }

        //奖励
        private showReward(msg: pb.sc_draw_game_over_notify) {
            net.unListen(pb.sc_draw_game_over_notify, this, this.showReward);
            alert.showReward(msg.item);
        }

        addEventListeners() {
            BC.addEvent(this, this.boxType, Laya.Event.CLICK, this, this.onImageClick);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.imgClose, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.other = null;
            this.imgData = null;
        }
    }
}