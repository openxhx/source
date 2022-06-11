

namespace grassShoppingFestival {
    /**
     * 口才大考验
     */
    export class EloquenceBigTestPanel extends ui.grassShoppingFestival.panel.EloquenceBigTestPanelUI {
        private _model: GrassShoppingFestivalModel;
        private _control: GrassShoppingFestivalControl;
        private _curSelected: ui.grassShoppingFestival.item.EloquenceBigTestRenderUI;
        private _p: Laya.Point;
        private _lp: Laya.Point;
        private _beginP: Laya.Point;
        private _beginRotation: number;
        private _effState: clientCore.Bone;
        /**卡牌的碰撞目标线*/
        private _cardPoTarget: Array<ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI>;
        private readonly CARD_LINE_Y: number = 285;
        private readonly CARD_CENTER_X: number = 465;
        private readonly CARD_GAP_X: number = 10;
        public constructor(sign: number) {
            super();
            this._p = new Laya.Point(0, 0);
            this._beginP = new Laya.Point(0, 0);
            this._cardPoTarget = [];
            this.sideClose = false;
            this.sign = sign;
            this._model = clientCore.CManager.getModel(this.sign) as GrassShoppingFestivalModel;
            this._control = clientCore.CManager.getControl(this.sign) as GrassShoppingFestivalControl;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            for (let i: number = 0; i < 8; i++) {
                BC.addEvent(this, this[`card_${i}`], Laya.Event.MOUSE_DOWN, this, this.onCardHandler);
            }
            BC.addEvent(this, this, Laya.Event.MOUSE_MOVE, this, this.onCardHandler);
            BC.addEvent(this, this, Laya.Event.MOUSE_OUT, this, this.onCardHandler);
            BC.addEvent(this, this, Laya.Event.MOUSE_UP, this, this.onCardHandler);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private playEffect(isCorrect: boolean, isinit: boolean = true): void {
            if (this._effState) {
                this._effState.dispose();
            }
            this._effState = clientCore.BoneMgr.ins.play("res/animate/activity/koucaidakaoyan.sk", isCorrect ? "right" : "wrong", false, this);
            this._effState.pos(450, 701);
            this._effState.once(Laya.Event.COMPLETE, this, (e) => {
                if (this._effState) {
                    this._effState.dispose();
                }
                //刷新进入下一关
                if (isinit) {
                    this.resetUI(isinit);
                } else {
                    this.onClose();
                }
            });
        }

        private onCardHandler(e: Laya.Event): void {
            if (e.currentTarget == this) {
                if (!this._curSelected) return;
                switch (e.type) {
                    case Laya.Event.MOUSE_MOVE:
                        this._p.x = e.stageX;
                        this._p.y = e.stageY;
                        this._lp = this.globalToLocal(this._p);
                        this._curSelected.x = this._lp.x;
                        this._curSelected.y = this._lp.y;
                        //判断是否有碰撞
                        let tCell: ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI;
                        let isHas: boolean = false;
                        for (let i: number = 0; i < this._cardPoTarget.length; i++) {
                            tCell = this._cardPoTarget[i];
                            this._p.x = tCell.width >> 1;
                            this._p.y = tCell.height >> 1;
                            this._lp = tCell.localToGlobal(this._p);
                            if (this._curSelected.hitTestPoint(this._lp.x, this._lp.y)) {
                                isHas = true;
                                break;
                            }
                        }
                        if (isHas) {
                            this._curSelected.rotation = 0;
                        } else {
                            this._curSelected.rotation = this._beginRotation;
                        }
                        break;
                    case Laya.Event.MOUSE_OUT:
                        this.releaseCard();
                        break;
                    case Laya.Event.MOUSE_UP:
                        this.releaseCard();
                        break;
                }
            } else {
                this._curSelected = e.currentTarget as ui.grassShoppingFestival.item.EloquenceBigTestRenderUI;
                this._beginP.x = this._curSelected.x;
                this._beginP.y = this._curSelected.y;
                this._beginRotation = this._curSelected.rotation;
                this._curSelected.scaleX = this._curSelected.scaleY = 0.5;
            }
        }
        //释放
        private releaseCard(): void {
            let hitArr: Array<number> = [];
            let tCell: ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI;
            for (let i: number = 0; i < this._cardPoTarget.length; i++) {
                tCell = this._cardPoTarget[i];
                this._p.x = tCell.width >> 1;
                this._p.y = tCell.height >> 1;
                this._lp = tCell.localToGlobal(this._p);
                if (this._curSelected.hitTestPoint(this._lp.x, this._lp.y)) {
                    hitArr.push(i);
                }
            }
            if (hitArr.length == 0) {
                if (this._beginRotation == 0) {
                    this._curSelected.scaleY = this._curSelected.scaleX = 0.5;
                } else {
                    this._curSelected.scaleY = this._curSelected.scaleX = 1.0;
                }
                this._curSelected.x = this._beginP.x;
                this._curSelected.y = this._beginP.y;
                this._curSelected.rotation = this._beginRotation;
            } else {
                this._curSelected.rotation = 0;
                let target: ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI;
                if (hitArr.length == 1) {
                    target = this._cardPoTarget[hitArr[0]];//唯一碰撞的坑位
                } else {
                    let minDis: number = null;
                    let tempDis: number;
                    let index: number;
                    for (let i: number = 0, j: number = hitArr.length; i < j; i++) {
                        target = this._cardPoTarget[hitArr[i]];
                        tempDis = Math.pow(this._curSelected.x - target.x, 2) + Math.pow(this._curSelected.y - target.y, 2);
                        if (minDis == null) {
                            minDis = tempDis;
                            index = i;
                        } else {
                            if (tempDis < minDis) {
                                minDis = tempDis;
                                index = i;
                            }
                        }
                    }
                    target = this._cardPoTarget[hitArr[index]];//距离最近的坑位
                }
                let cell: ui.grassShoppingFestival.item.EloquenceBigTestRenderUI;
                for (let i: number = 0, j: number = 8; i < j; i++) {
                    cell = this[`card_${i}`];
                    if (cell != this._curSelected) {
                        if (cell.x == target.x && cell.y == target.y) {
                            cell.x = this._beginP.x;
                            cell.y = this._beginP.y;
                            if (this._beginRotation != 0) {
                                cell.rotation = this._beginRotation;
                                cell.scaleX = cell.scaleY = 1;
                            }
                            break;
                        }
                    }
                }
                this._curSelected.x = target.x;
                this._curSelected.y = target.y;
                this._curSelected.rotation = 0;
                this._curSelected.scaleY = this._curSelected.scaleX = 0.5;
                this.ckeckOver();
            }
            this._curSelected = null;
        }
        //判断本次游戏是否结束
        private ckeckOver(): void {
            let js: number = 0;
            let isOver: boolean = false;
            for (let i: number = 0; i < 8; i++) {
                if (this[`card_${i}`].rotation == 0) {
                    js++;
                    if (js >= this._cardPoTarget.length) {
                        isOver = true;
                        break;
                    }
                }
            }
            if (isOver) {//本次结束 (计算答案)
                let card: ui.grassShoppingFestival.item.EloquenceBigTestRenderUI;
                let poBox: ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI;
                let isSucc: boolean = true;
                const len: number = this._cardPoTarget.length;//获得题干长度
                let cardIndex: number;
                for (let i: number = 0; i < len; i++) {
                    cardIndex = this._model.card_question_upset.indexOf(i);
                    card = this[`card_${cardIndex}`];
                    poBox = this._cardPoTarget[i];
                    if (card.x != poBox.x || card.y != poBox.y) {
                        isSucc = false;
                        break;
                    }
                }
                if (!this._model.card_game_succ) {
                    this._model.card_game_succ = [];
                }
                this._model.card_game_succ[this._model.cur_card_level] = isSucc ? 1 : 0;
                const qId: number = this._model.card_game_questions[this._model.cur_card_level];
                clientCore.Logger.sendLog('2021年7月9日活动', '【游戏】口才大考验', isSucc ? `答对试题${qId}` : `答错试题${qId}`);
                this._model.cur_card_level++;
                if (this._model.cur_card_level >= this._model.card_game_all) {
                    let num: number = 0;
                    this._model.card_game_succ.forEach(succ => {
                        if (succ == 1) {
                            num++;
                        }
                    });
                    this._control.getQuestion(num).then(msg => {
                        alert.showReward(msg.item);
                        this._model.card_game_succ = [];
                        this._model.cur_card_level = 0;
                        this._model.resetCardGameQuestions();//重置题目
                        this.playEffect(isSucc, false);//请求进入新关
                        this._model.gameTimes++;
                    });
                } else {
                    this.playEffect(isSucc);
                }
            }
        }

        initOver(): void {
            this._model.cur_card_level = 0;
            this._model.resetCardGameQuestions();//重置题目
            if (!this._model.card_initInfo_list) {
                let cell: ui.grassShoppingFestival.item.EloquenceBigTestRenderUI;
                this._model.card_initInfo_list = [];
                for (let i: number = 0; i < 8; i++) {
                    cell = this[`card_${i}`];
                    this._model.card_initInfo_list.push({
                        x: cell.x,
                        y: cell.y,
                        rotation: cell.rotation
                    });
                }
            }
        }

        popupOver(): void {
            clientCore.Logger.sendLog('2021年7月9日活动', '【游戏】口才大考验', '打开游戏面板');
            this._model.card_game_succ = [];
            this.resetUI();
        }

        private resetUI(isInit: boolean = true): void {
            this.reset2CardTarget();
            this.init2CardUI(isInit);
        }
        //重置卡牌目标
        private reset2CardTarget(): void {
            const len: number = this._model.getCardsLineCnt();//获得题干长度
            const cardW: number = 100;
            const startX: number = this.CARD_CENTER_X - ((cardW + this.CARD_GAP_X) * len - this.CARD_GAP_X) / 2 + cardW / 2;
            let max: number = len > this._cardPoTarget.length ? len : this._cardPoTarget.length;
            let cell: ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI;
            for (let i: number = 0; i < max; i++) {
                if (i < len) {
                    if (i < this._cardPoTarget.length) {
                        cell = this._cardPoTarget[i];
                    } else {
                        cell = new ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI();
                        this._cardPoTarget[i] = cell;
                        cell.y = this.CARD_LINE_Y;
                    }
                    if (!cell.parent) {
                        this.addChild(cell);
                    }
                    cell.x = startX + (cardW + this.CARD_GAP_X) * i;
                } else {
                    let arr: Array<ui.grassShoppingFestival.item.EloquenceBigTestLineCellUI> = this._cardPoTarget.slice(i);
                    arr.forEach(item => {
                        if (item != null) {
                            item.removeSelf();
                            item.destroy();
                        }
                    });
                    break;
                }
            }
            this._cardPoTarget.length = len;
        }
        //#region 初始化牌
        private init2CardUI(isInit: boolean = true): void {
            if (!isInit || this._model.cur_card_level != 0) {
                for (let i: number = 0, j: number = this._model.card_initInfo_list.length; i < j; i++) {
                    this[`card_${i}`].x = this._model.card_initInfo_list[i].x;
                    this[`card_${i}`].y = this._model.card_initInfo_list[i].y;
                    this[`card_${i}`].rotation = this._model.card_initInfo_list[i].rotation;
                    this[`card_${i}`].scaleX = this[`card_${i}`].scaleY = 1.0;
                }
            }
            const questionId: number = this._model.card_game_questions[this._model.cur_card_level];
            this._model.cardUpset();
            const cfg: xls.gameWordPuzzle = xls.get(xls.gameWordPuzzle).get(questionId);
            const words: Array<string> = cfg.stemWord.concat(cfg.subWord);
            for (let i: number = 0, j: number = this._model.card_question_upset.length; i < j; i++) {
                this[`card_${i}`]["labWord"].text = words[this._model.card_question_upset[i]];
            }
            this.labProgress.text = `当前关卡: ${this._model.cur_card_level + 1}/${this._model.card_game_all}`;
            if (this._model.card_game_succ == null || this._model.card_game_succ.length == 0) {
                this.labSure.text = `正确: 0 \n错误: 0`;
            } else {
                let succ: number = 0;
                this._model.card_game_succ.forEach(su => {
                    if (su == 1) {
                        succ++;
                    }
                });
                this.labSure.text = `正确: ${succ} \n错误: ${this._model.card_game_succ.length - succ}`;
            }
        }
        //#endregion

        private onClose(): void {
            clientCore.DialogMgr.ins.close(this);
        }

        private onShowRule(): void {
            alert.showRuleByID(this._model.card_ruleId);
        }

        destroy(): void {
            EventManager.event(GrassShoppingFestivalEventType.CLOSE_EloquenceBigTestPanel);
            this._model = this._control = null;
            this._curSelected = null;
            this._p = this._lp = this._beginP = null;
            super.destroy();
        }


    }

    export interface CardInitPo {
        x: number;
        y: number;
        rotation: number;
    }
}