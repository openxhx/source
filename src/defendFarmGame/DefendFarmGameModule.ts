namespace defendFarmGame {
    /**
     * 2020.11.13
     * 保卫农场--小游戏
     * defendFarmGame.DefendFarmGameModule
     */
    export class DefendFarmGameModule extends ui.defendFarmGame.DefendFarmGameModuleUI {
        private _nextTimerNum: number;          //下拨怪出现时间
        private _countDownNum: number;          //倒计时
        private _cookMcNum: number = 0;         //当前饼干动画数量
        private _cookMcMax: number = 10;        //饼干动画最大数量

        private _model: DefendFarmGameModel;
        private _control: DefendFarmGameControl;

        private _roleAni: clientCore.Bone;

        init(data: ModuleInfo) {
            switch (data.modelType) {
                case "stageBase"://冒险
                    data.type = 0;
                    this.sign = clientCore.CManager.regSign(new DefendFarmGameModel(), new DefendFarmGameControl());
                    break;
                case "dateStage"://羁绊
                    data.type = 1;
                    this.sign = clientCore.CManager.regSign(new DefendFarmGameModel(), new DefendFarmGameControl());
                    break;
                case "activity"://活动
                    data.type = 2;
                    this.sign = clientCore.CManager.regSign(new DefendFarmGameModel(), new DefendFarmGameControl());
                    break;
            }

            this._control = clientCore.CManager.getControl(this.sign) as DefendFarmGameControl;
            this._model = clientCore.CManager.getModel(this.sign) as DefendFarmGameModel;

            this._control.model = this._model;
            this._model.initData(data);
        }

        popupOver() {
            this._roleAni = clientCore.BoneMgr.ins.play("res/animate/defendFarm/fear.sk", 0, true, this.boxRole as Laya.Sprite);
            this._roleAni.pos(130, 280);
            this.gameStart();
        }

        private gameStart(): void {
            this._countDownNum = this._model.gameInfo.miniGameTime;
            this.showTime(0);
            alert.showCountDown(new Laya.Handler(this, () => {
                this._control.startGame(
                    Laya.Handler.create(this, () => {
                        Laya.timer.loop(1000, this, this.showTime);
                        Laya.timer.frameLoop(1, this, this.onFrame);
                        this.createStars();
                    }))
            }))
        }

        private gameOver(): void {
            Laya.timer.clearAll(this);
            let len: number = this.spBox.numChildren;
            if (len <= 0) return;
            for (let i: number = 0; i < len; i++) {
                let element: MonsterItem = this.spBox.getChildAt(0) as MonsterItem;
                element?.dispose();
            }
            this._model.score = this._countDownNum > 0 ? 0 : 1;
            this._control.overGame(
                Laya.Handler.create(this, (msg: pb.sc_mini_game_over) => {
                    if (msg.rewardInfo.length == 0) {
                        alert.showFWords('游戏结束，本次游戏未获得奖励~');
                        this.destroy();
                        return;
                    }
                    alert.showReward(msg.rewardInfo, '', { callBack: { caller: this, funArr: [this.destroy] } });
                }));
        }

        /**显示倒计时 单位：秒 */
        private showTime(timer: number = 1) {
            this._countDownNum -= timer;
            if (this._countDownNum <= 0) {
                this._countDownNum = 0;
                this.gameOver();
            }
            this.txtTime.text = util.StringUtils.getDateStr2(this._countDownNum, "{min}:{sec}");;
        }

        private onFrame(): void {
            let currT = Laya.Browser.now();
            if (this._nextTimerNum < currT) {
                this.createStars();
            }

            let len: number = this.spBox.numChildren;
            if (len <= 0) return;
            for (let i: number = 0; i < len; i++) {
                let element: MonsterItem = this.spBox.getChildAt(i) as MonsterItem;
                element?.update(currT);
            }
        }

        private createStars(): void {
            this._nextTimerNum = Laya.Browser.now() + _.random(500, 2000);
            let num: number = _.random(1, 3);
            for (let i: number = 0; i < num; i++) { this.createStar(); }
        }

        private createStar(): void {
            let item: MonsterItem = Laya.Pool.getItemByClass('defendFarmGame.MonsterItem', MonsterItem);
            let arr = this._model.monsterDataList;
            let monsterData;
            for (let i = 0; i < arr.length; i++) {
                monsterData = arr[i];
                if (_.random(0, 100) / 100 < monsterData.pro) {
                    break;
                }
            }
            item.configure({ x: this.spBox.width + _.random(100, 200), y: _.random(100, this.spBox.height - 100), type: monsterData.type, speed: monsterData.speed, life: monsterData.life });

            let ifAdd: boolean = false;
            for (let i = 0; i < this.spBox.numChildren; i++) {
                if (this.spBox.getChildAt(i)["y"] > item.y) {
                    this.spBox.addChildAt(item, i);
                    ifAdd = true;
                    break;
                }
            }
            if (!ifAdd) {
                this.spBox.addChild(item);
            }
        }

        private onSpBox(): void {
            if (this._cookMcNum < this._cookMcMax) {
                this._cookMcNum++;
                let animate = clientCore.BoneMgr.ins.play("res/animate/defendFarm/biscuit.sk", 0, false, this.boxCook as Laya.Sprite);
                animate.pos(_.random(200, 250), _.random(100, this.boxCook.height - 100))
                animate.once(Laya.Event.COMPLETE, this, () => {
                    animate.dispose();
                    this._cookMcNum--;
                })
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.spBox, Laya.Event.CLICK, this, this.onSpBox);
            BC.addEvent(this, EventManager, MonsterItem.Monster_OUT, this, this.gameOver);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            Laya.Pool.clearBySign('defendFarmGame.MonsterItem');
            Laya.timer.clearAll(this);
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            this._roleAni.dispose();
            this._roleAni = null;
            super.destroy();
        }
    }
}