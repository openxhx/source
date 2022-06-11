namespace hideGiftGame {
    /**
     * 12.17
     * 圣诞爱德文老人
     * hideGiftGame.HideGiftGameModule
     */
    export class HideGiftGameModule extends ui.hideGiftGame.HideGiftGameModuleUI {
        private ballNum: number;//雪球个数
        private hitNum: number;//已堆积雪球数
        private levelNum: number;//关卡数
        private petAni: clientCore.Bone;
        private ballAni: clientCore.Bone;
        private handAni: clientCore.Bone;

        init(d: number) {
            this.levelNum = d;
            this.initPet();
            this.initBall();
            this.petAni = clientCore.BoneMgr.ins.play("res/animate/snowGame/huabaoSnow.sk", 1, true, this.pet);
            this.handAni = clientCore.BoneMgr.ins.play("unpack/hideGiftGame/hand.sk", 0, true, this.hand);
        }
        onPreloadOver() {
            this['boxBall' + this.levelNum].visible = true;
            this.ballNum = 15;
            this.hitNum = 0;
            this.labNum.text = `雪球剩余数量:${this.ballNum}个`;
        }
        addEventListeners() {
            BC.addEvent(this, this.boxStart, Laya.Event.CLICK, this, this.onGameStart);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnPutDown, Laya.Event.CLICK, this, this.onBallPutDown);
            BC.addEvent(this, this.btnAgain, Laya.Event.CLICK, this, this.gameAgain);
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }
        destroy() {
            this.petAni?.dispose();
            this.ballAni?.dispose();
            this.handAni?.dispose();
            this.petAni = null;
            this.ballAni = null;
            this.handAni = null;
            Laya.timer.clear(this, this.onTime);
            super.destroy();
        }

        /**游戏开始 */
        private onGameStart() {
            this.handAni?.dispose();
            this.boxStart.visible = false;
            Laya.timer.loop(20, this, this.onTime);
        }
        /**游戏结算 */
        private onGameOver(num: number): void {
            Laya.timer.clear(this, this.onTime);
            this.destroy();
            clientCore.ModuleManager.open("hideGiftGame.GameOverPanel", num);
        }

        private onClose() {
            alert.showSmall("是否退出游戏？", {
                callBack: {
                    funArr: [() => {
                        this.destroy();
                        clientCore.ModuleManager.open("happinessFlavour.HappinessFlavourModule", 3);
                    }], caller: this
                }
            });
        }

        /**游戏结束判定 */
        private gameOverJudge() {
            if (this.hitNum >= this['boxBall' + this.levelNum].numChildren - 1) {
                this.onGameOver(1);
            }
            else if (this.ballNum <= 0) {
                this.onGameOver(0);
            }
        }

        private gameAgain() {
            alert.showSmall("是否重新开始？", {
                callBack: {
                    funArr: [() => {
                        clientCore.ModuleManager.closeAllOpenModule();
                        clientCore.ModuleManager.open("hideGiftGame.HideGiftGameModule", this.levelNum);
                    }], caller: this
                }
            });

        }

        //#region 花宝
        private petSpeed: number;//花宝移动速度
        private haveBall: boolean;//是否拿着雪球
        private moveFlag: number;//正反方向
        private initPet() {
            this.haveBall = false;
            this.petSpeed = 4;
            this.moveFlag = 1;

        }

        /**花宝没有球的移动 */
        private petGetBallMove() {
            if (this.pet.x > 338) {
                this.moveFlag = -1;
                this.pet.scaleX = -1;
                this.pet.x += this.petSpeed * this.moveFlag;
            }
            else {
                this.moveFlag = 1;
                this.pet.scaleX = 1;
                this.pet.y += this.petSpeed * this.moveFlag;
            }
        }

        /**花宝有球的移动 */
        private petMove() {
            this.pet.x += this.petSpeed * this.moveFlag;
            if (this.pet.x < 338) {
                this.pet.scaleX = 1;
                this.moveFlag = 1;
            }
            if (this.pet.x > 1200) {
                this.pet.scaleX = -1;
                this.moveFlag = -1;
            }
            if (this.pet.y > 250) {
                this.pet.y -= this.petSpeed;
            }
        }

        /**花宝拿球 */
        private petGetBall() {
            if (Math.abs(this.pet.y - this.ball.y) < 10) {
                this.haveBall = true;
                this.isGetBall = true;
            }
        }
        //#endregion


        //#region 雪球
        private isGetBall: boolean;
        private ballSpeed: number;//雪球下落速度
        private ballTarget: number;//雪球下落的终点
        private initBall() {
            this.isGetBall = false;
            this.ballSpeed = 5;
        }

        /**球的移动 */
        private ballMove() {
            if (!this.haveBall) return;
            if (this.isGetBall) {
                this['ball' + (15 - this.ballNum)].x = this.pet.x;
                this['ball' + (15 - this.ballNum)].y = this.pet.y;
            } else {
                this['ball' + (15 - this.ballNum)].y += this.ballSpeed;
                if (this.ballTarget == -1 && this['ball' + (15 - this.ballNum)].y >= 690) {
                    this.changePetAni(0);
                    this.ballAni = clientCore.BoneMgr.ins.play("unpack/hideGiftGame/Effect.sk", 0, false, this['ball' + (15 - this.ballNum)]);
                    this.ballAni.pos(this['ball' + (15 - this.ballNum)].x, this['ball' + (15 - this.ballNum)].y);
                    this['ball' + (15 - this.ballNum)].skin = "";
                    this['ball' + (15 - this.ballNum)].x = 1200;
                    this.haveBall = false;
                    this.ballNum--;
                    this.labNum.text = `雪球剩余数量:${this.ballNum}个`;
                }
                if (this.ballTarget >= 0 && this['ball' + (15 - this.ballNum)].y + 10 >= this['di' + this.levelNum + this.ballTarget].y) {
                    this.collisionComplete();
                }
            }
        }


        private onBallPutDown() {
            this.isGetBall = false;
            this.getBallTarget();
        }

        /**计算雪球下落的位置 */
        private getBallTarget() {
            this.ballTarget = -1;
            let x = this['ball' + (15 - this.ballNum)].x;
            let min = 101;
            for (let i = 0; i <= this['boxBall' + this.levelNum].numChildren - 2; i++) {
                let dis = Math.abs(this['di' + this.levelNum + i].x - x);
                if (dis < 50 && this['di' + this.levelNum + i].skin != "hideGiftGame/xue_qiu.png") {
                    if (this.ballTarget == -1) {
                        this.ballTarget = i;
                        min = dis;
                    } else {
                        if (this['di' + this.levelNum + i].y < this['di' + this.levelNum + this.ballTarget].y) return;
                        if (dis < min) this.ballTarget = i;
                    }
                }
            }
        }

        //#endregion

        //帧刷新
        private onTime() {
            if (this.haveBall) this.petMove();
            else {
                this.petGetBallMove();
                this.petGetBall();
            }
            if (this.ballNum >= 1) {
                this.ballMove();
                // this.ballCollision(this.levelNum);
                this.ballY();
            }
            this.gameOverJudge();
        }

        /**花宝拿球的高度 */
        private ballY() {
            if (this.ballNum > 12 && this.ballNum <= 15) this.ball.y = 512;
            else if (this.ballNum <= 12 && this.ballNum > 5) this.ball.y = 600;
            else this.ball.y = 670;
        }

        /**碰撞后 */
        private collisionComplete() {
            this.changePetAni(4);
            this['di' + this.levelNum + this.ballTarget].skin = "hideGiftGame/xue_qiu.png";
            this['di' + this.levelNum + this.ballTarget].scaleX = 1.5;
            this['di' + this.levelNum + this.ballTarget].scaleY = 1.5;
            this['ball' + (15 - this.ballNum)].alpha = 0;
            this['ball' + (15 - this.ballNum)].x = this['di' + this.levelNum + this.ballTarget].x;
            this['ball' + (15 - this.ballNum)].y = this['di' + this.levelNum + this.ballTarget].y;
            this.haveBall = false;
            this.ballNum--;
            this.hitNum++;
            this.labNum.text = `雪球剩余数量:${this.ballNum}个`;
        }

        /**碰撞检测 */
        // private ballCollision(num: number) {
        //     if (Math.abs(this.ground.y - this['ball' + (15 - this.ballNum)].y) < 10) {
        //         if (this.haveBall && this.isGetBall == false) {
        //             for (let i = 0; i <= this['boxBall' + num].numChildren - 2; i++) {
        //                 if (this.distance(this['di' + num + i].x, this['di' + num + i].y, this['ball' + (15 - this.ballNum)].x, this['ball' + (15 - this.ballNum)].y) < 50) {
        //                     if (this['di' + num + i].skin != "hideGiftGame/xue_qiu.png") {
        //                         this.collisionComplete(num, i);
        //                         return;
        //                     }

        //                 }
        //             }
        //             this.changePetAni(0);
        //             this.ballAni = clientCore.BoneMgr.ins.play("unpack/hideGiftGame/Effect.sk", 0, false, this['ball' + (15 - this.ballNum)]);
        //             this['ball' + (15 - this.ballNum)].skin = "";
        //             this['ball' + (15 - this.ballNum)].x = 1200;
        //             this.haveBall = false;
        //             this.ballNum--;
        //             this.labNum.text = `雪球剩余数量:${this.ballNum}个`;
        //             return;
        //         }
        //     }
        //     for (let i = 0; i < 15; i++) {
        //         if (i != 15 - this.ballNum) {
        //             if (this.distance(this['ball' + i].x, this['ball' + i].y, this['ball' + (15 - this.ballNum)].x, this['ball' + (15 - this.ballNum)].y) < 75) {
        //                 if (this.haveBall && this.isGetBall == false) {
        //                     for (let i = 0; i <= this['boxBall' + num].numChildren - 2; i++) {
        //                         if (this.distance(this['di' + num + i].x, this['di' + num + i].y, this['ball' + (15 - this.ballNum)].x, this['ball' + (15 - this.ballNum)].y) < 50) {
        //                             if (this['di' + num + i].skin != "hideGiftGame/xue_qiu.png") {
        //                                 this.collisionComplete(num, i);
        //                                 return;
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        /**获取两点之间的距离 */
        private distance(X: number, Y: number, x: number, y: number) {
            let a = Math.pow(Math.abs(X - x), 2);
            let b = Math.pow(Math.abs(Y - y), 2);
            return Math.sqrt(a + b);
        }

        /**切换花宝动画 */
        private changePetAni(num: number) {
            let ani = this.petAni;
            ani.offAllHandle();
            ani.stop();
            ani.play(num, false, Laya.Handler.create(this, () => {
                ani.play("fly", true);
            }));
        }


    }
}