namespace seventhMoonNight {
    /**
     * 小游戏
     */
    export class GameFlowerLightPanel extends ui.seventhMoonNight.panel.GameFlowerLightPanelUI {
        private _model: SeventhMoonNightModel;
        private _control: SeventhMoonNightControl;
        private _gameCountDownTime: GameCountDownTime;
        private _gameMap: GameMap;
        private _gameFrameTime: GameFrameTime;
        //0:没有 , 1: 左移 , 2: 右移
        private _arrowStatus: number;

        constructor(sign: number) {
            super();
            this.sign = sign;
            this._arrowStatus = 0;
            this._model = clientCore.CManager.getModel(this.sign) as SeventhMoonNightModel;
            this._control = clientCore.CManager.getControl(this.sign) as SeventhMoonNightControl;
        }

        initOver() {
            this.state_fail.visible = false;
            this.btnBack.visible = false;
            this._gameCountDownTime = new GameCountDownTime(this.labCd, this._model.COUNTDOWN_TIME_ALL_2GAME);
            this.init2Map();
        }

        private init2Map(): void {
            this._gameMap = new GameMap(this._model, this.resetProgressCallback);
            this._gameMap.x = this.width >> 1;
            this._gameMap.y = 0;
            this.addChildAt(this._gameMap, 0);
            this._gameFrameTime = new GameFrameTime(this.onFremeUpdate);
            this._gameFrameTime.start();
            this._gameCountDownTime.start();
        }

        //逐帧刷新
        private onFremeUpdate: () => void = () => {
            if (!this._gameMap) return;
            this._gameMap.resetMoveY();
            if (this._arrowStatus == 0) return;
            switch (this._arrowStatus) {
                case 1:
                    this._gameMap.play(IGameMapType.GO_LEFT);
                    break;
                case 2:
                    this._gameMap.play(IGameMapType.GO_RIGHT);
                    break;
            }
        };

        addEventListeners() {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onClose, [false]);
            BC.addEvent(this, this.btnLeft, Laya.Event.MOUSE_DOWN, this, this.onClickHandler);
            BC.addEvent(this, this.btnRight, Laya.Event.MOUSE_DOWN, this, this.onClickHandler);
            BC.addEvent(this, this.btnLeft, Laya.Event.MOUSE_UP, this, this.onClickHandler);
            BC.addEvent(this, this.btnLeft, Laya.Event.MOUSE_OUT, this, this.onClickHandler);
            BC.addEvent(this, this.btnRight, Laya.Event.MOUSE_UP, this, this.onClickHandler);
            BC.addEvent(this, this.btnRight, Laya.Event.MOUSE_OUT, this, this.onClickHandler);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.COUNTDOWN_TIMER_FINISHED, this, this.onTimerFinished);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.GAME_SUCC, this, this.onGameSucc);
            BC.addEvent(this, EventManager, SeventhMoonNightEventType.GAME_SUCC_LIGHTAI_FINISHED, this, this.onShowResult);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        //进度回调信息
        private resetProgressCallback: (num: number) => void = (num) => {
            const H: number = 390;
            num < 0 && (num = 0);
            if (num * H >= 10) {
                this.barProgress.height = num * H;
            } else {
                if (num != 0)
                    this.barProgress.height = 10;
                else
                    this.barProgress.visible = false;
            }
        };

        //游戏成功
        private onGameSucc(): void {
            this._gameCountDownTime.stop();
        }

        private onShowResult(): void {
            this._gameFrameTime.stop();
            this.onClose(true);
        }

        //计时结束(以失败告终)
        private onTimerFinished(): void {
            this.state_fail.visible = true;
            this._gameFrameTime.stop();
            this._control.getGameSuccReward(0, this._model._curPlayFlower.index).then(() => {
                setTimeout(() => {
                    this.onClose(false);
                }, 1000);
            });
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.type) {
                case Laya.Event.MOUSE_DOWN:
                    switch (e.currentTarget) {
                        case this.btnLeft:
                            this._arrowStatus = 1;
                            break;
                        case this.btnRight:
                            this._arrowStatus = 2;
                            break;
                    }
                    break;
                case Laya.Event.MOUSE_UP:
                case Laya.Event.MOUSE_OUT:
                    this._arrowStatus = 0;
                    break;
            }
        }

        private onClose(isSucc: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(SeventhMoonNightEventType.CLOSE_GameFlowerLightPanel, isSucc);
        }

        destroy() {
            this._model = this._control = null;
            if (this._gameCountDownTime) {
                this._gameCountDownTime.destroy();
                this._gameCountDownTime = null;
            }
            super.destroy();
        }
    }
}