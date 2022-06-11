namespace jumpGame {
    /**
     * 跳一跳小游戏
     * jumpGame.JumpGameModule
     */
    export class JumpGameModule extends ui.jumpGame.JumpGameModuleUI {
        private _moduleOffsetPosX: number = 0;//屏幕最左边到模块左边间隔
        private _gameWidth: number = 0;//模块最左边到屏幕最右边间隔
        private readonly GAME_BASE_LINE: number = 450;//游戏基准线，人物，花朵都在这个基准线上下
        private readonly ORI_PLAYER_POS_DIS_X: number = 200;//人初始位置距离屏幕右侧间隔
        private _flowerItemArr: FlowerItem[];
        private _player: JumpPlayer;
        private _flowerPool: FlowerItem[];
        private _flowerNumCount: number = 0;

        private _flowerCreateInfo: JumpGameInfo;//花朵生成类型，位置，读表

        private _isChargeFlag: boolean = false;
        private _playerFlyFlag: boolean = false;
        private _moveBgFlag: boolean = false;

        private _speedX: number;
        private _speedY: number;
        private readonly _acceleratedSpeed: number = 0.8;

        private _curPlatformNum: number = 0;

        private _bgMoveDis: number = 0;
        private _bgMoveSpeed: number = 10;
        private _bgMoveTotalDis: number = 0;

        private _score: number = 0;

        private _gameStartFlag: boolean = false;
        private _startTime: number = 0;
        private _totalTime: number = 120;
        private _preRestTime: number = 120;

        private _isGameOver: boolean = false;

        private _friendStepInfoHashMap: util.HashMap<pb.IFriendStepInfo>;

        private _alertView: Laya.View;

        private _model: JumpGameModel;
        private _control: JumpGameControl;

        constructor() {
            super();
        }

        init(data: ModuleInfo) {
            switch (data.modelType) {
                case "stageBase"://冒险
                case "dateStage"://羁绊
                case "activity"://活动
                    this.sign = clientCore.CManager.regSign(new JumpGameModel(), new JumpGameControl());
                    this.labHistoryMax.text = "历史最高分：";
                    break;
                case "amusementPark"://花仙游乐园
                    this.sign = clientCore.CManager.regSign(new JumpGameModel2(), new JumpGameControl2());
                    this.labHistoryMax.text = "过关分数：";
                    this.addPreLoad(xls.load(xls.park));
                    break;
            }

            this._control = clientCore.CManager.getControl(this.sign) as JumpGameControl;
            this._model = clientCore.CManager.getModel(this.sign) as JumpGameModel;

            this._control.model = this._model;
            this._model.initData(data);

            this._flowerItemArr = [];
            this._flowerPool = [];
            this.txtHistoryMax.text = "" + this._model.historyHighScore;

            this.addPreLoad(xls.load(xls.gameJumpAward));
            this.addPreLoad(xls.load(xls.gameJumpBase));
            this.addPreLoad(xls.load(xls.gameJumpFlower));
            if (clientCore.LocalInfo.sex == 1)/**女 */ {
                this.addPreLoad(res.load("res/animate/jumpGame/womanfall.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/womanfall.png"));
                this.addPreLoad(res.load("res/animate/jumpGame/womanidle.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/womanidle.png"));
                this.addPreLoad(res.load("res/animate/jumpGame/womanjump.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/womanjump.png"));
                this.addPreLoad(res.load("res/animate/jumpGame/womansquat.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/womansquat.png"));
            }
            else {
                this.addPreLoad(res.load("res/animate/jumpGame/manfall.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/manfall.png"));
                this.addPreLoad(res.load("res/animate/jumpGame/manidle.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/manidle.png"));
                this.addPreLoad(res.load("res/animate/jumpGame/manjump.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/manjump.png"));
                this.addPreLoad(res.load("res/animate/jumpGame/mansquat.sk"));
                this.addPreLoad(res.load("res/animate/jumpGame/mansquat.png"));
            }
            this.addPreLoad(res.load("res/sound/foco.ogg"));
            this.addPreLoad(res.load("res/sound/stand.ogg"));
            this.addPreLoad(this.loadFriendInfo());

            this.hitArea = new Laya.Rectangle(-clientCore.LayerManager.mainLayer.x, 0, Laya.stage.width, Laya.stage.height);

            Laya.MouseManager.multiTouchEnabled = false;
        }

        onPreloadOver() {
            this.initGameSizeInfo();
            this._flowerCreateInfo = new JumpGameInfo(this.sign);
            this._flowerCreateInfo.init();
            this.initBgPos();
            this.initGameInfo();
        }

        async loadFriendInfo() {
            this._friendStepInfoHashMap = new util.HashMap();
            await this._control.getFriendStep(
                Laya.Handler.create(this, (msg: any) => {
                    for (let friendInfo of msg.friendStepInfo) {
                        this._friendStepInfoHashMap.add(friendInfo.stepNum, friendInfo);
                    }
                }))
        }

        private initGameSizeInfo() {
            if (Laya.stage.width <= 1334) {
                this._moduleOffsetPosX = 0;
                this._gameWidth = Laya.stage.width;
            }
            else {
                this._moduleOffsetPosX = (Laya.stage.width - 1334) / 2;
                this._gameWidth = Laya.stage.width - this._moduleOffsetPosX;
            }
        }

        private initBgPos() {
            this.imgBg1.x = -(this.imgBg1.width - this._gameWidth);
            this.imgBg2.x = this.imgBg1.x - this.imgBg2.width;
        }

        private initGameInfo() {
            this.gameCon.x = this._gameWidth;
            this.gameCon.y = this.GAME_BASE_LINE;
            //初始化游戏的时候，先初始化初始的台子
            this.addOneFlower();
            for (let i = 0; i < 10; i++) {
                this.addOneFlower();
            }
            this._player = new JumpPlayer();
            this._player.x = -this.ORI_PLAYER_POS_DIS_X;
            this._player.y = 0;
            this._player.stand();
            this.gameCon.addChild(this._player);
            this._curPlatformNum = 0;

            this._score = 0;
            this.txtCurMax.text = "" + this._score;
            this.txtTime.text = util.StringUtils.getDateStr2(this._totalTime, "{min}:{sec}");
            this._control.startGame(
                Laya.Handler.create(this, () => {
                    this._gameStartFlag = true;
                    this._startTime = clientCore.ServerManager.curServerTime;
                }))
        }

        private addOneFlower(): void {
            let flower = this.getFlower();
            flower.flowerNum = this._flowerNumCount;
            this._flowerNumCount++;
            if (this._flowerItemArr.length == 0) {
                flower.show(0);
                flower.x = -this.ORI_PLAYER_POS_DIS_X;
                flower.y = 0;
            }
            else {
                let flowerInfo = this._flowerCreateInfo.getCreateFlowerInfo(flower.flowerNum);
                flower.show(flowerInfo.type);
                let lastFlower = this._flowerItemArr[this._flowerItemArr.length - 1];
                flower.x = lastFlower.x - flowerInfo.disX - flower.width / 2 - lastFlower.width / 2;
                flower.y = flowerInfo.disY;

            }
            /** 如果这朵花上面的有宝箱，就显示出来，宝箱位置配表 */
            if (this._flowerCreateInfo.checkShowRewardBox(flower.flowerNum)) {
                flower.showRewardBox();
            }
            if (this._friendStepInfoHashMap.has(flower.flowerNum)) {
                flower.showPlayerInfo(this._friendStepInfoHashMap.get(flower.flowerNum));
            }
            this._flowerItemArr.push(flower);
            this.gameCon.addChildAt(flower, 0);
            console.log("当前花朵数量：" + this._flowerItemArr.length);
        }

        private getFlower(): FlowerItem {
            if (this._flowerPool.length > 0) {
                return this._flowerPool.shift();
            }
            else {
                return new FlowerItem();
            }
        }

        /**蓄力 */
        private squatSount: laya.media.SoundChannel;

        startSquat() {
            /**飞行中，不能点，不能蓄力 */
            if (this._playerFlyFlag) {
                return;
            }
            /**背景移动中，不能点，不能蓄力 */
            if (this._moveBgFlag) {
                return;
            }
            this._isChargeFlag = true;
            this._player.squat();
            this.squatSount = core.SoundManager.instance.playSound(this.getMusicUrl("foco"));
        }

        /**开始跳 */
        jump() {
            if (this.squatSount) {
                this.squatSount.stop();
                this.squatSount = null;
            }
            if (this._isChargeFlag) {
                this._isChargeFlag = false;
                this._playerFlyFlag = true;
                /**开始起飞 ，设置起飞速度 */
                this._speedX = this._player.speedX;
                this._speedY = this._player.speedY;
                this._player.jump();
                console.log(`起始速度X ${this._speedX}  起始速度Y: ${this._speedY}`);
            }
        }

        calScore(posX: number, flower: FlowerItem, skipScore: number) {
            let disX = Math.abs(posX - flower.x);
            let halfWidth = flower.width / 2;
            let disPercent = disX / halfWidth * 100;
            let getScore = this._flowerCreateInfo.getScore(flower.flowerType, disPercent);
            getScore += skipScore;
            this._player.showScore(getScore);
            this._score += getScore;
            console.log("当前获得分数：" + getScore + "  当前分数：" + this._score);
            this.txtCurMax.text = "" + this._score;
            if (this._model.modelType == "amusementPark") {
                if (this._score >= this._model.historyHighScore) {
                    this.gameOver();
                }
            }
        }

        gameFrame() {
            if (!this._gameStartFlag) {
                return;
            }
            if (this._isChargeFlag) {
                /**蓄力中，进度条更新 */
                this._player.curProgress++;
            }
            /** 玩家飞 */
            if (this._playerFlyFlag) {
                /**这里做个穿透判断 */
                let p1: Laya.Point = new Laya.Point(Math.floor(this._player.x), Math.floor(this._player.y));
                this._player.x += this._speedX;
                this._player.y += this._speedY;
                this._speedY += this._acceleratedSpeed;
                let q1: Laya.Point = new Laya.Point(Math.floor(this._player.x), Math.floor(this._player.y));
                if (this._speedY > 0) {/**人物往下掉的时候，判断相交 */
                    for (let i = 0; i < this._flowerItemArr.length; i++) {
                        if (Math.abs(this._flowerItemArr[i].x - this._player.x) < 160) {
                            let p2 = new Laya.Point(Math.floor(this._flowerItemArr[i].x - this._flowerItemArr[i].width / 2), Math.floor(this._flowerItemArr[i].y));
                            let q2 = new Laya.Point(Math.floor(this._flowerItemArr[i].x + this._flowerItemArr[i].width / 2), Math.floor(this._flowerItemArr[i].y));
                            if (util.MathUtil.checkLineSegmentIntersect(p1, q1, p2, q2)) {
                                /** 线段相交  求交点 */
                                let crossPoint = util.MathUtil.getCrossPoint(p1, q1, p2, q2);
                                this._player.x = crossPoint.x;
                                this._player.y = crossPoint.y;
                                /** 人物跳到平台上 飞行停止  动作变成站的*/
                                this._playerFlyFlag = false;
                                this._player.stand();
                                core.SoundManager.instance.playSound(this.getMusicUrl("stand"));
                                if (this._flowerItemArr[i].flowerNum != this._curPlatformNum) {
                                    let disFlower = this._flowerItemArr[i].flowerNum - this._curPlatformNum;
                                    this._curPlatformNum = this._flowerItemArr[i].flowerNum;
                                    this._moveBgFlag = true;
                                    this._bgMoveDis = -this.ORI_PLAYER_POS_DIS_X - this._flowerItemArr[i].x
                                    this._bgMoveTotalDis = this._bgMoveDis;
                                    if (this._flowerItemArr[i].hasBox()) {
                                        this._flowerItemArr[i].getRewardBox();
                                        if (!this._model.isTry)
                                            this._control.gameSync(this._flowerItemArr[i].flowerNum);
                                    }
                                    /**直接跳过的花朵，每朵花都按照最高分算 */
                                    let skipScore = (disFlower - 1) * 10;
                                    console.log("dis flower:" + disFlower);
                                    this.calScore(crossPoint.x, this._flowerItemArr[i], skipScore);
                                }
                            }
                        }
                    }
                }
                if (this._player.y > 750) {
                    /**死掉 game over */
                    this.gameOver();

                }
                else if (this._player.y > 100) {
                    /**播放掉下的动画 */
                    if (!this._player.isFall()) {
                        this._player.fall();
                    }
                }
            }
            /** 移动背景 */
            if (this._moveBgFlag) {
                if (this._bgMoveSpeed < this._bgMoveDis) {
                    this.gameCon.x += this._bgMoveSpeed;
                    this.imgBg1.x += this._bgMoveSpeed;
                    this.imgBg2.x += this._bgMoveSpeed;
                    /**每次移动完，需要把移动的距离从总距离里面扣除 */
                    this._bgMoveDis -= this._bgMoveSpeed;
                }
                else {
                    this.gameCon.x += this._bgMoveDis;
                    this.imgBg1.x += this._bgMoveDis;
                    this.imgBg2.x += this._bgMoveDis;
                    this.resetFlowerPos();
                    this._moveBgFlag = false;

                }
                /**判断bg滚动 */
                if (this.imgBg1.x > this._gameWidth) {
                    this.imgBg1.x = this.imgBg2.x - this.imgBg1.width;
                }
                else if (this.imgBg2.x > this._gameWidth) {
                    this.imgBg2.x = this.imgBg1.x - this.imgBg2.width;
                }
                /**判断是否生成新的花朵 */
                if (this._flowerItemArr.length > 0 && this._flowerItemArr[this._flowerItemArr.length - 1].x + this.gameCon.x > (-Laya.stage.width - 200)) {
                    this.addOneFlower();
                }
            }
            // if (!this._isTryFlag) {
            this.showTime();
            // }
        }

        private showTime() {
            if (this._startTime > 0) {
                let disTime = clientCore.ServerManager.curServerTime - this._startTime;
                let restTime = this._totalTime - disTime;
                if (restTime != this._preRestTime) {
                    this._preRestTime = restTime;
                    this.txtTime.text = util.StringUtils.getDateStr2(restTime, "{min}:{sec}");
                }
                if (restTime <= 0) {
                    this.gameOver();
                }
            }
        }

        private gameOver() {
            Laya.timer.clearAll(this);
            // if (this._isTryFlag) {
            //     this.destroy();
            // }
            // else {
            this._model.score = this._score;
            this._model.totalStep = this._curPlatformNum;
            this._control.overGame(
                Laya.Handler.create(this, (data: pb.sc_jump_game_end) => {
                    this._isGameOver = true;
                    if (data.item.length == 0) {
                        alert.showFWords('游戏结束，本次游戏未获得奖励~');
                        this.destroy();
                        return;
                    }
                    alert.showReward(clientCore.GoodsInfo.createArray(data.item), "恭喜获得", {
                        callBack: { caller: this, funArr: [this.destroy] },
                        btnType: alert.Btn_Type.SURE_AND_CANCLE,
                        needMask: true,
                        clickMaskClose: true,
                        needClose: false,
                    });
                }))
            // }
        }

        private resetFlowerPos() {
            this.gameCon.x = this._gameWidth;
            let num = this.gameCon.numChildren;
            for (let i = 0; i < num; i++) {
                let obj = this.gameCon.getChildAt(i) as Laya.Sprite;
                obj.x += this._bgMoveTotalDis;
            }
            // this._moveBgFlag = false;
            this.recoverFlower();
        }

        /** 花朵回收 */
        private recoverFlower() {
            for (let i = this._flowerItemArr.length - 1; i >= 0; i--) {
                if (this._flowerItemArr[i].x > 200) {
                    this._flowerItemArr[i].removeSelf();
                    this._flowerPool.push(this._flowerItemArr[i]);
                    this._flowerItemArr.splice(i, 1);
                }
            }
        }

        /**音效路径 */
        private getMusicUrl(str: string): string {
            return `res/sound/${str}.ogg`;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            BC.addEvent(this, this.btnClose, Laya.Event.MOUSE_DOWN, this, (e: Laya.Event) => { e.stopPropagation() });
            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.startSquat);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.jump);

            Laya.timer.loop(1000 / 60, this, this.gameFrame);
        }

        onCloseClick() {
            if (this._model.modelType == "amusementPark") {
                alert.showSmall('是否确认退出？退出后不计算当前进度，无法获得奖励。', { callBack: { caller: this, funArr: [this.destroy] } });
                return;
            }
            if (!this._model.isTry) {/**非试玩，弹窗确认退出 */
                this._alertView = alert.showSmall("主动退出将结束本次挑战并结算当前成绩，是否确认退出？", {
                    callBack: { caller: this, funArr: [this.sureClose] },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true,
                    needClose: true,
                })
            }
            else {
                this._alertView = alert.showSmall("主动退出将结束本次挑战，是否确认退出？", {
                    callBack: { caller: this, funArr: [this.sureClose] },
                    btnType: alert.Btn_Type.SURE_AND_CANCLE,
                    needMask: true,
                    clickMaskClose: true,
                    needClose: true,
                })
            }
        }

        sureClose() {
            // if (!this._isTryFlag) {
            if (!this._isGameOver) {
                this.gameOver();
            }
            // }
            // else {
            //     this.gameOver();
            // }
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clearAll(this);
        }

        destroy() {
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            Laya.MouseManager.multiTouchEnabled = true;
            this._flowerItemArr?.splice(0);
            this._flowerItemArr = null;
            this._flowerPool?.splice(0);
            this._flowerPool = null;
            this._player?.destroy();
            this._player = null;
            this._alertView?.destroy();
            this._flowerCreateInfo?.destroy();
            super.destroy();
        }
    }
}