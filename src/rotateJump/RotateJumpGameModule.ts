namespace rotateJump {
    import Point = Laya.Point;

    export class RotateJumpGameModule extends ui.rotateJump.RotateJumpModuleUI {
        private mPlayer: Player;
        private mPlanetList: Array<Planet>;
        private mOverPlanetCount: number = 0;
        private mGameIsStop: boolean = false;

        private mPlanetIndexCount: number = 1;
        private mFirstPlanetX: number;
        private mFirstPlanetY: number;
        private mJumpCombo: number = 0;
        private mMaxJumpCombo: number = 0;
        private mPointHelp: Point = new Point();
        private _extraScore: number = 0;

        private _model: RotateJumpGameModel;
        private _control: RotateJumpGameControl;

        init(data: ModuleInfo) {
            switch (data.modelType) {
                case "stageBase"://冒险
                    data.type = 0;
                    this.sign = clientCore.CManager.regSign(new RotateJumpGameModel(), new RotateJumpGameControl());
                    break;
                case "dateStage"://羁绊
                    data.type = 1;
                    this.sign = clientCore.CManager.regSign(new RotateJumpGameModel(), new RotateJumpGameControl());
                    break;
                case "activity"://活动
                    data.openType == 'loveMagic' && clientCore.Logger.sendLog('2021年4月9日活动', '【游戏】甜甜圈冒险', '进入游戏');
                    data.type = 2;
                    this.sign = clientCore.CManager.regSign(new RotateJumpGameModel(), new RotateJumpGameControl());
                    break;
                case "amusementPark"://花仙游乐园
                    this.sign = clientCore.CManager.regSign(new RotateJumpGameModel2(), new RotateJumpGameControl2());
                    this.addPreLoad(xls.load(xls.park));
                    break;
            }

            this._control = clientCore.CManager.getControl(this.sign) as RotateJumpGameControl;
            this._model = clientCore.CManager.getModel(this.sign) as RotateJumpGameModel;

            this._control.model = this._model;
            this._model.initData(data);

            this.addPreLoad(res.load('res/BattleConfig.b.xml', Laya.Loader.BUFFER));
        }

        onPreloadOver() {
            let bytes: Laya.Byte = new Laya.Byte(res.get('res/BattleConfig.b.xml'));
            GameDataConfig.parseBattleConfig(bytes);
            this.adaptScreen();
            this.resetUI();

            if (this._model.modelType == "amusementPark") {
                this.txtTarget.text = this._model.needSource + "";
                this.boxTarget.visible = true;
            } else {
                this.boxTarget.visible = false;
            }

            this.mPlayer = new Player(this._model.openType);
            this.mPlayer.setPos(this.player.x, this.player.y);
            this.mPlayer.setParent(this.player.parent as Laya.Sprite);

            window['hero'] = this.mPlayer;

            this.mPlanetList = new Array<Planet>();

            let firstPlanet: Planet = new Planet();
            firstPlanet.setDisplayObject(this.planet);
            firstPlanet.reset(this.mPlanetIndexCount);

            this.mPlanetList.push(firstPlanet);
            this.mFirstPlanetX = firstPlanet.pos.x;
            this.mFirstPlanetY = firstPlanet.pos.y;
            this._control.startGame();
            for (let i: number = 1; i < GameDataConfig.MAX_PLANET_COUNT; i++) {
                this.createPlanet(true);
            }

            let decoCount: number = 12;
            // this.mDecoList = new Array<Laya.Sprite>(decoCount)
            // for (let j: number = 0; j < decoCount; j++) {
            //     let deco: Laya.Sprite = new Laya.Sprite();
            //     deco.loadImage("rotateJump/deco" + j + ".png");
            //     deco.pivot(deco.width / 2, deco.height / 2);
            //     deco.visible = false;
            //     this.mDecoList[j] = deco;
            // }
            this.ChangeBgColor();
            this.onTimer();
            Laya.timer.frameLoop(1, this, this.update);
            // Laya.timer.loop(1000, this, this.onTimer);
        }

        private adaptScreen(): void {
            this.player.y = Laya.stage.height + 200;
            this.imgBottom.y = this.player.y + 121;
            this.planet.y = this.player.y - 300;
        }

        private createPlanet(isInit: boolean = false): void {
            let newPlanet: Planet;
            if (isInit) {
                newPlanet = new Planet(true);
                newPlanet.setParent(this.unitLayer);
            }
            else {
                if (this.mPlayer.standingPlanet.index - this.mPlanetList[0].index < 3)
                    return;
                newPlanet = this.mPlanetList.shift();
            }
            newPlanet.reset(++this.mPlanetIndexCount);

            let lastPlanet: Planet = this.mPlanetList[this.mPlanetList.length - 1];
            let xPos: number = 0;
            if (this.mPlanetIndexCount % 2 == 0) {
                xPos = newPlanet.radius + Math.random() * (Laya.stage.height / 2 - newPlanet.radius);
            }
            else {
                xPos = Laya.stage.height / 2 + Math.random() * (Laya.stage.height / 2 - newPlanet.radius);
            }
            let defDis: number = Math.random() * (newPlanet.def.distanceMax - newPlanet.def.distanceMin) + newPlanet.def.distanceMin;
            let yPos: number = lastPlanet.pos.y - (defDis + lastPlanet.radius + newPlanet.radius);
            //let lastPlanetGlobalPos = this.unitLayer.localToGlobal(lastPlanet.pos, true);
            //let newPlanetPos:Point = new Point(xPos, yPos);
            newPlanet.setPos(xPos, yPos);
            this.mPlanetList.push(newPlanet);

        }


        private update(): void {
            if (this.mGameIsStop)
                return;
            this.playerUpdate();
            this.planetUpdate();
            this.cameraFollowUpdate();
        }


        private playerUpdate(): void {
            this.mPlayer.update();
            if (this.mPlayer.isJumping) {
                this.mPointHelp.setTo(this.mPlayer.pos.x, this.mPlayer.pos.y);
                let playerGlobalPos: Point = this.mPlayer.parent.localToGlobal(this.mPointHelp);
                if (playerGlobalPos.y > Laya.stage.height + GameDataConfig.PLAYER_RADIUS || playerGlobalPos.y < 0 - GameDataConfig.PLAYER_RADIUS || playerGlobalPos.x < GameDataConfig.PLAYER_RADIUS) {
                    this.gameOver();
                }
            }
        }

        private planetUpdate(): void {
            for (let i: number = 0; i < GameDataConfig.MAX_PLANET_COUNT; i++) {
                this.mPlanetList[i].update();
                if (!this.mPlayer.isJumping) {
                    continue;
                }
                if (this.mPlanetList[i] == this.mPlayer.standingPlanet) {
                    continue;
                }
                if (this.mPlayer.collisionDetective(this.mPlanetList[i])) {
                    if (this.mPlayer.standingPlanet != null) {
                        this.mOverPlanetCount = this.mPlanetList[i].index - this.mPlayer.standingPlanet.index;
                        if (this.mOverPlanetCount > 0 && this.mPlayer.standingPlanet.playerStayWithin360()) {
                            this._extraScore += 5;
                            this.mJumpCombo += this.mOverPlanetCount;
                            this.showCombo(this.mJumpCombo);
                            this.mMaxJumpCombo = this.mJumpCombo > this.mMaxJumpCombo ? this.mJumpCombo : this.mMaxJumpCombo;
                        }
                        else {
                            this.mJumpCombo = 0;
                        }
                    }
                    this.mPlayer.standOnPlanet(this.mPlanetList[i]);
                    if (this.mPlanetList[i].type == PlanetType.Horizontal) {
                        this.ChangeBgColor();
                    }
                    this.updateHeightRecord(Math.abs(this.mPlanetList[i].displayObject.y - this.width) / 10);
                }

            }
            if (this.mOverPlanetCount > 0) {
                if (this.mPlayer.standingPlanet.index > 3) {
                    for (let m: number = 0; m < this.mOverPlanetCount; m++) {
                        this.createPlanet();
                    }
                }
                this.mOverPlanetCount = 0;
            }
            if (this._model.modelType == "amusementPark") {
                if (parseInt(this.heightTxt.text) >= this._model.needSource) {
                    this.gameOver();
                }
            }
        }

        private ChangeBgColor(): void {
            // let bgColor: ColorData = GameDataConfig.BG_COLOR[this.mBgColorIndex % 3];
            // this.spbg.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, ColorUtil.rgb2Hex16(bgColor.r, bgColor.g, bgColor.b))
            // this.mBgColorIndex++;
        }


        private cameraFollowUpdate(): void {
            this.mPointHelp.setTo(this.mPlayer.pos.x, this.mPlayer.pos.y);
            let playerGlobalPos: Point = this.mPlayer.parent.localToGlobal(this.mPointHelp);
            let cameraLineYpos = this.width * 0.3;
            if (playerGlobalPos.x >= cameraLineYpos) {
                this.unitLayer.x -= (playerGlobalPos.x - cameraLineYpos);
                this.imgBg.x -= (playerGlobalPos.x - cameraLineYpos);
                if (this.imgBg.x <= -875) {
                    this.imgBg.x = -206 - (-875 - this.imgBg.x);
                }
                // let decoHArea: number = Math.floor(this.unitLayer.x / GameDataConfig.DECO_DIS);
                // if (decoHArea > this.mDecoHeightAreaIndex) {
                //     this.mDecoHeightAreaIndex = decoHArea;

                //     let decoX: number = Math.random() * Laya.stage.height;
                //     let deco: Laya.Sprite = this.mDecoList[this.mDecoIndex];
                //     this.unitLayer.addChildAt(deco, 0);
                //     deco.pos(decoX, -this.unitLayer.y);
                //     deco.visible = true;

                //     this.mDecoIndex++;
                //     if (this.mDecoIndex >= 12)
                //         this.mDecoIndex = 0;
                // }
            }
        }

        private gameOver(): void {
            this.mGameIsStop = true;
            this.mPlayer.die();
            this.mPlayer.setParent(this.unitLayer);
            clientCore.LoadingManager.showSmall('正在结算中...');
            this._model.score = parseInt(this.heightTxt.text);
            this._control.overGame(
                Laya.Handler.create(this, (msg: pb.sc_mini_game_over) => {
                    clientCore.LoadingManager.hideSmall(true);
                    if (msg.rewardInfo.length == 0) {
                        alert.showFWords('游戏结束，本次游戏未获得奖励~');
                        this.destroy();
                        return;
                    }
                    if (this._model.modelType == "amusementPark" || this._model.openType == "christmasParty" || this._model.openType == "loveMagic") {
                        alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), '', {
                            callBack: {
                                caller: this,
                                funArr: [this.destroy]
                            }
                        })
                    } else {
                        alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), '', {
                            vipAddPercent: 50, callBack: {
                                caller: this,
                                funArr: [this.destroy]
                            }
                        })
                    }
                }), Laya.Handler.create(this, () => {
                    clientCore.LoadingManager.hideSmall(true);
                }));
        }

        private onRestartGame(e: Event): void {
            this.mPlayer.reset(this.player.x, this.player.y);
            this.resetUI();
            this.resetGame();
            this.resetPlanet();
        }

        private resetGame(): void {
            this.unitLayer.y = 0;
            this.mJumpCombo = 0;
            this.mMaxJumpCombo = 0;
            this.ChangeBgColor();
        }

        private resetUI(): void {
            this.hideCombo();
            this.updateHeightRecord(0);
        }

        private resetPlanet(): void {
            this.mPlanetIndexCount = 1;
            this.mPlanetList[0].setPos(this.mFirstPlanetX, this.mFirstPlanetY);
            this.mPlanetList[0].reset(this.mPlanetIndexCount);
            for (let i: number = 1; i < GameDataConfig.MAX_PLANET_COUNT; i++) {
                this.mPlanetList[i].reset(++this.mPlanetIndexCount);
                let prevPlanet: Planet = this.mPlanetList[i - 1];
                let xPos: number = 0;
                if (this.mPlanetIndexCount % 2 == 0) {
                    xPos = this.mPlanetList[i].radius + Math.random() * (Laya.stage.height / 2 - this.mPlanetList[i].radius);
                }
                else {
                    xPos = Laya.stage.height / 2 + Math.random() * (Laya.stage.height / 2 - this.mPlanetList[i].radius);
                }
                let defDis: number = Math.random() * (this.mPlanetList[i].def.distanceMax - this.mPlanetList[i].def.distanceMin) + this.mPlanetList[i].def.distanceMin;
                let yPos: number = prevPlanet.pos.y - (defDis + prevPlanet.radius + this.mPlanetList[i].radius);

                this.mPlanetList[i].setPos(xPos, yPos);
            }
        }

        private showCombo(num: number): void {
            this.comboTxt.value = num.toString();
            this.hideCombo();
            Laya.Tween.to(this.comboNum, { y: 20, scaleX: 1, scaleY: 1 }, 1000, Laya.Ease.elasticOut, Laya.Handler.create(this, this.hideCombo));
        }

        private hideCombo(): void {
            this.comboTxt.scale(0.8, 0.8);
            this.comboNum.y = -50;
        }

        private updateHeightRecord(h: number): void {
            this.heightTxt.text = (Math.floor(h) + this._extraScore).toString();
        }

        private _time: number = 0;
        private onTimer() {
            if (this.mGameIsStop)
                return;
            this._time = Math.max(0, this._time + 1);
            this.txtTime.text = '倒计时:' + (60 - this._time);
        }

        private onExit() {
            this.mGameIsStop = true;
            if (this._model.modelType == "amusementPark") {
                alert.showSmall('是否确认退出？退出后不计算当前进度，无法获得奖励。', { callBack: { caller: this, funArr: [this.destroy, this.continue] } });
                return;
            }
            alert.showSmall('确定要退出吗', { needClose: false, callBack: { caller: this, funArr: [this.destroy, this.continue] } })
        }

        private continue() {
            this.mGameIsStop = false;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onExit);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
            Laya.timer.clear(this, this.update);
        }

        destroy() {
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            super.destroy();
            // clientCore.ModuleManager.open('dayWithRabbit.DayWithRabbitModule')
        }
    }
}