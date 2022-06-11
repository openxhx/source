namespace searchCherryClues {
    /**
     * 旋转樱花
     */
    export class RotateCherryPanel extends ui.searchCherryClues.panel.RotateCherryPanelUI implements IPanel {
        private _model: SearchCherryCluesModel;
        private _control: SearchCherryCluesControl;
        private _beginPos: Vector2D;
        private _isBegin: boolean = false;
        private _endPos: Vector2D;
        private _cosValue: number;
        private _angle: number;
        private readonly Rad2Deg: number = 180 / Math.PI;
        private _isFinished: boolean;
        private _globalRoteImg: Vector2D;
        show(parent: Laya.Sprite, sign: number): void {
            if (!this.parent) {
                parent.addChild(this);
            }
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as SearchCherryCluesModel;
            this._control = clientCore.CManager.getControl(this.sign) as SearchCherryCluesControl;
            this.initUI();
        }

        private initUI(): void {
            this.reset2Init();
            this.addEventListeners();
        }

        private reset2Init(): void {
            const po: Laya.Point = this.imgRotate.localToGlobal(new Laya.Point(0, 0));
            this._globalRoteImg = new Vector2D(po.x, po.y);
            if (this._model.info.state == 0) {
                this.state_game.visible = true;
                this.state_get.visible = false;
                this._isFinished = false;
            } else {
                this.state_game.visible = false;
                this.state_get.visible = true;
                this._isFinished = true;
                //初始化奖励
                clientCore.GlobalConfig.setRewardUI(this.itemReward, { id: this._model.MONEY_ID, cnt: 5, showName: false });
                this.itemReward.num.visible = true;
                this.itemReward.visible = true;
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.onClickHandler);

            BC.addEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.onMouseHandler);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onMouseHandler);
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onMouseHandler);
            BC.addEvent(this, this, Laya.Event.MOUSE_OUT, this, this.onMouseHandler);

            BC.addEvent(this, this.itemReward, Laya.Event.CLICK, this, this.onShowRewardItem);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onShowRewardItem(): void {
            clientCore.ToolTip.showTips(this.itemReward, { id: this._model.MONEY_ID });
        }

        private onMouseHandler(e: Laya.Event): void {
            if (this._model.info.state != 0 || this._isFinished == true) return;
            switch (e.type) {
                case Laya.Event.MOUSE_DOWN:
                    if (!this._beginPos) {
                        this._beginPos = new Vector2D(e.stageX, e.stageY);
                    } else {
                        this._beginPos.x = e.stageX;
                        this._beginPos.y = e.stageY;
                    }
                    this._isBegin = true;
                    break;
                case Laya.Event.MOUSE_UP:
                case Laya.Event.MOUSE_OUT:
                    this._isBegin = false;
                    if (this._model.isRotationOK(this.imgRotate.rotation, false)) {
                        this._isFinished = true;//已经成功
                        this._control.finishSearchCule(this._model.info.index + 1).then(msg => {
                            this._model.info.state = 1;
                            EventManager.event(globalEvent.GIRLMOMORIES_CLEAR_CLUE, this._model.info);
                            this.reset2Init();
                        });
                    }
                    break;
                case Laya.Event.MOUSE_MOVE:
                    if (!this._isBegin) return;
                    if (!this._endPos) {
                        this._endPos = new Vector2D(e.stageX, e.stageY);
                    } else {
                        this._endPos.x = e.stageX;
                        this._endPos.y = e.stageY;
                    }
                    const end: Vector2D = this._endPos.clone();
                    this._cosValue = this._beginPos.normalize().dot(this._endPos.normalize());
                    this._angle = Math.acos(this._cosValue) * this.Rad2Deg;
                    //方向的判断
                    if (this._angle != 0) {
                        this.handleAngle4Direction(end);
                        if (!isNaN(this._angle)) {
                            this.imgRotate.rotation += this._angle;
                        }
                    }
                    this._beginPos.x = this._endPos.x;
                    this._beginPos.y = this._endPos.y;
                    break;
            }
        }
        //处理角度正负方向问题
        private handleAngle4Direction(end: Vector2D): void {
            if (end.x >= this._globalRoteImg.x) {
                if (this._beginPos.y == this._endPos.y) {
                    if (this._endPos.x > this._beginPos.x) {
                        this._angle = -Math.abs(this._angle);
                    } else {
                        this._angle = Math.abs(this._angle);
                    }
                } else {
                    if (this._endPos.y > this._beginPos.y) {
                        this._angle = Math.abs(this._angle);
                    } else {
                        this._angle = -Math.abs(this._angle);
                    }
                }
            } else {
                if (this._beginPos.y == this._endPos.y) {
                    if (this._endPos.x > this._beginPos.x) {
                        this._angle = Math.abs(this._angle);
                    } else {
                        this._angle = -Math.abs(this._angle);
                    }
                } else {
                    if (this._endPos.y > this._beginPos.y) {
                        this._angle = -Math.abs(this._angle);
                    } else {
                        this._angle = Math.abs(this._angle);
                    }
                }
            }
        }

        private onClickHandler(e: Laya.Event): void {
            switch (e.currentTarget) {
                case this.btnClose:
                    this.hide();
                    break;
                case this.btnGet:
                    this._control.getSearchCuleReward(this._model.info.index + 1, 1).then(data => {
                        //领取了奖励
                        alert.showReward(data.item);
                        this._model.info.state = 2;
                        EventManager.event(globalEvent.GIRLMOMORIES_CLEAR_CLUE, this._model.info);//领取成功
                        this.hide();//关闭
                    });
                    break;
            }
        }


        hide(): void {
            EventManager.event(SearchCherryCluesEventType.CLOSE_RotateCherryPanel);
        }
        dispose(): void {
            this.removeEventListeners();
            this._model = this._control = null;
            this._beginPos = null;
            this._endPos = null;
            this._globalRoteImg = null;
            this.removeSelf();
        }
    }
}