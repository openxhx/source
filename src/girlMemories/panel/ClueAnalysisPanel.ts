namespace girlMemories {
    /**
     * 线索分析(找茬玩法)
     */
    export class ClueAnalysisPanel extends ui.girlMemories.panel.ClueAnalysisPanelUI {
        private _model: GirlMemoriesModel;
        private _control: GirlMemoriesControl;
        //找茬从0开始
        private _index: number;
        //当前的错误坐标
        private _targetPos: IQuickspotVO;
        //坐标点
        private _po: Laya.Point;
        private _localPo: Laya.Point;
        private _tempPo: Laya.Point;
        private _cd: number;
        //#region 时间参数
        private _m: number;
        private _s: number;
        private _mStr: string;
        private _sStr: string;
        //#endregion
        //特效动画
        private _effAnimFail: Array<clientCore.Bone>;
        private _effAnimSucc: Array<clientCore.Bone>;
        private _curEffSucc: Array<clientCore.Bone>;
        //挑战结论动画(成功/失败)
        private _conclusionEff: clientCore.Bone;
        //进度条的宽度
        private readonly BAR_O_W: number = 751;
        public constructor(sign: number, index: number) {
            super();
            this.sign = sign;
            this._index = index;
            this._model = clientCore.CManager.getModel(this.sign) as GirlMemoriesModel;
            this._control = clientCore.CManager.getControl(this.sign) as GirlMemoriesControl;
            const data: IQuickspotVO = this._model.QuickspotPOSs[this._index];
            this._targetPos = {
                a: { x: data.a.x, y: data.a.y },
                b: { x: data.b.x, y: data.b.y },
                c: { x: data.c.x, y: data.c.y },
            };
        }

        initOver(): void {
            this.state_go.visible = true;
            this.state_do.visible = false;
            this.bar_1.visible = true;
            this.bar_2.visible = this.bar_3.visible = false;
            this.imgO.skin = `unpack/girlMemories/a_${this._index + 1}_o.png`;
            this.imgE.skin = `unpack/girlMemories/a_${this._index + 1}_e.png`;
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose, [null]);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.onShowRule);
            BC.addEvent(this, this.imgO, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.imgE, Laya.Event.CLICK, this, this.onClickHandler);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.onGameStart);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        private onGameStart(): void {
            this.state_go.visible = false;
            this.state_do.visible = true;
            this._cd = this._model.QuickspotCDTimeParagraph[0];
            this.labProgressShow();
            this.cdStart();
        }

        //#region 时间的处理
        private cdStart(): void {
            Laya.timer.loop(1000, this, this.doCDTime);
        }
        //开始倒计时
        private doCDTime(): void {
            this._cd--;
            if (this._cd <= 0) {
                this.clearCdTimer();
                this.playConclusionEff(false).then(result => {
                    this._control.getQuickspotReward(this._index, 0).then(msg => {
                        this.onClose(false);
                    });
                });
            }
            this.barProgressShow();
            this.labProgressShow();
        }
        //异步显示
        private async barProgressShow(): Promise<void> {
            return new Promise<void>(resolve => {
                let scale: number = this._cd / this._model.QuickspotCDTimeParagraph[0];
                if (scale < 0) scale = 0;
                let lv: number = null;
                let i: number, j: number;
                for (i = 1, j = this._model.QuickspotCDTimeParagraph.length; i < j; i++) {
                    if (this._cd > this._model.QuickspotCDTimeParagraph[i]) {
                        lv = i;
                        break;
                    } else if (this._cd == this._model.QuickspotCDTimeParagraph[i]) {
                        lv = i + 1;
                        break;
                    } else if (i == this._model.QuickspotCDTimeParagraph.length - 1) {
                        lv = 3;
                        break;
                    }
                }
                for (i = 1, j = 4; i < j; i++) {
                    if (i == lv) {
                        this[`bar_${i}`].visible = true;
                        this[`bar_${i}`].width = this.BAR_O_W * scale;//保持9宫格不变形
                    } else {
                        this[`bar_${i}`].visible = false;
                    }
                }
                resolve();
            });
        }
        //异步显示时间文本
        private async labProgressShow(): Promise<void> {
            return new Promise<void>(resolve => {
                let t: number = this._cd;
                if (t < 0) t = 0;
                this._m = Math.floor(t / 60);
                this._s = t - this._m * 60;
                this._mStr = this._m < 10 ? `0${this._m}` : `${this._m}`;
                this._sStr = this._s < 10 ? `0${this._s}` : `${this._s}`;
                this.labPro.text = `${this._mStr}:${this._sStr}`;
                resolve();
            });
        }
        //#endregion

        private onClickHandler(e: Laya.Event): void {
            if (!this.state_do.visible) return;
            const target: Laya.Image = e.currentTarget as Laya.Image;//获得目标
            if (!this._po) {
                this._po = new Laya.Point(e.stageX, e.stageY);
            } else {
                this._po.x = e.stageX;
                this._po.y = e.stageY;
            }
            this._localPo = target.globalToLocal(this._po);//获取Img的本地坐标
            this.checkResult();
        }
        //获取可用点
        private getChecks(tests: Array<string>): { arr: string[], key: string } {
            if (tests.length == 0) return null;
            let curK: string;
            while (tests.length > 0) {
                curK = tests.shift();
                if (this._targetPos[curK] != null) {
                    return { arr: tests, key: curK };
                }
            }
            return null;
        }

        //检查结果
        private checkResult(): void {
            this.imgO.mouseEnabled = this.imgE.mouseEnabled = false;
            let tests: Array<string> = ["a", "b", "c"];
            let data: { arr: string[], key: string };
            let pos: IQuickspotLocation;
            while (true) {
                data = this.getChecks(tests);
                if (data != null) {
                    tests = data.arr;
                    pos = this._targetPos[data.key];
                    if (Math.sqrt(Math.pow(pos.x - this._localPo.x, 2) + Math.pow(pos.y - this._localPo.y, 2)) < this._model.QuickspotErrorRadius) {
                        this._targetPos[data.key] = null;//置空(表示此位置已经被正确处理)
                        this.doSucc(pos);
                        break;
                    }
                } else {
                    this.doFail({ x: this._localPo.x, y: this._localPo.y });//指示错误的地方
                    break;
                }
            }
        }
        //重新设置temp坐标
        private resetTempPo(pos: IQuickspotLocation): void {
            if (!this._tempPo) {
                this._tempPo = new Laya.Point(pos.x, pos.y)
            } else {
                this._tempPo.x = pos.x;
                this._tempPo.y = pos.y;
            }
        }
        //(清除时间)
        private clearCdTimer(): void {
            Laya.timer.clear(this, this.doCDTime);
        }

        //成功选中处理
        private doSucc: (pos: IQuickspotLocation) => void = (pos) => {
            this.clearCdTimer();
            if (!this._effAnimSucc) this._effAnimSucc = [];
            if (!this._curEffSucc)
                this._curEffSucc = [];
            else
                this._curEffSucc.length = 0;
            this._curEffSucc[0] = clientCore.BoneMgr.ins.play("res/animate/activity/zhuhuodongdonghua.sk", "right", false, this, null, false, true);
            this._curEffSucc[1] = clientCore.BoneMgr.ins.play("res/animate/activity/zhuhuodongdonghua.sk", "right", false, this, null, false, true);
            this._effAnimSucc.push(this._curEffSucc[0]);
            this._effAnimSucc.push(this._curEffSucc[1]);
            const doPos: (img: Laya.Image, eff: clientCore.Bone) => void = (img, eff) => {
                this.resetTempPo(pos);
                this._po = img.localToGlobal(this._tempPo);
                this._localPo = this.globalToLocal(this._po);
                eff.pos(this._localPo.x, this._localPo.y);//设置坐标位置
            };
            doPos(this.imgO, this._curEffSucc[0]);//原始
            doPos(this.imgE, this._curEffSucc[1]);//差异
            this._curEffSucc[0].once(Laya.Event.COMPLETE, this, (e) => {
                this._curEffSucc.length = 0;
                //检测是否全部正确
                this.checkAllSucc();
            });
        };
        //检测是否全部正确
        private checkAllSucc: () => void = () => {
            if (this._targetPos.a == null && this._targetPos.b == null && this._targetPos.c == null) {
                this.labJu.text = `3/3`;
                this.playConclusionEff(true).then(result => {
                    //请求领取奖励
                    this._control.getQuickspotReward(this._index, 1).then(msg => {
                        alert.showReward(msg.item, null, { callBack: { funArr: [this.onCloseRewardPanel], caller: this } });
                    });
                });
            } else {
                this.imgO.mouseEnabled = this.imgE.mouseEnabled = true;
                let tj: number = 0;
                if (this._targetPos.a == null) tj++;
                if (this._targetPos.b == null) tj++;
                if (this._targetPos.c == null) tj++;
                this.labJu.text = `${tj}/3`;
                this.cdStart();//继续启动计时器
            }
        };
        //奖励弹窗关闭后
        private onCloseRewardPanel(): void {
            this.onClose(true);
        }

        //错误选中处理
        private doFail: (pos: IQuickspotLocation) => void = (pos) => {
            this.clearCdTimer();
            if (!this._effAnimFail) this._effAnimFail = [];
            this._effAnimFail[0] = clientCore.BoneMgr.ins.play("res/animate/activity/zhuhuodongdonghua.sk", "wrong", false, this);
            this._effAnimFail[1] = clientCore.BoneMgr.ins.play("res/animate/activity/zhuhuodongdonghua.sk", "wrong", false, this);
            const doPos: (img: Laya.Image, eff: clientCore.Bone) => void = (img, eff) => {
                this.resetTempPo(pos);
                this._po = img.localToGlobal(this._tempPo);
                this._localPo = this.globalToLocal(this._po);
                eff.pos(this._localPo.x, this._localPo.y);//设置坐标位置
            };
            doPos(this.imgO, this._effAnimFail[0]);
            doPos(this.imgE, this._effAnimFail[1]);
            this._effAnimFail[0].once(Laya.Event.COMPLETE, this, (e) => {
                this._cd -= this._model.QuickspotErrorDeductionTime;//因为错误减少时间
                if (this._cd < 0){
                    this._cd = 0;
                    this.doCDTime();
                    return;
                } 
                //更新倒计时信息
                this.barProgressShow();
                this.labProgressShow();
                if (this._effAnimFail != null) {
                    this._effAnimFail.forEach(item => {
                        if (item) {
                            item.dispose();
                        }
                    });
                    this._effAnimFail = null;
                }
                this.cdStart();
                this.imgO.mouseEnabled = this.imgE.mouseEnabled = true;
            });
        };

        private onClose(isSucc: boolean): void {
            clientCore.DialogMgr.ins.close(this);
            EventManager.event(GirlMemoriesEventType.CLOSE_ClueAnalysisPanel, isSucc);
        }

        private onShowRule(): void {
            alert.showRuleByID(this._model.ClueAnalysisPanel_RULE_ID);
        }
        //#region 成功或者失败动画(最后的判定)
        private async playConclusionEff(isSucc: boolean): Promise<boolean> {
            return new Promise<boolean>(resolve => {
                const keyA: string = isSucc ? "finish" : "fail";
                this._conclusionEff = clientCore.BoneMgr.ins.play("res/animate/activity/zhuhuodongdonghua.sk", keyA, false, this);
                this._conclusionEff.pos(543, 759);
                this._conclusionEff.once(Laya.Event.COMPLETE, this, (e) => {
                    resolve(isSucc);
                });
            });
        }
        //#endregion

        public destroy(): void {
            this.clearCdTimer();
            if (this._conclusionEff) {
                this._conclusionEff.dispose();
                this._conclusionEff = null;
            }
            this._model = this._control = null;
            this._targetPos = null;
            this._po = null;
            this._localPo = null;
            this._tempPo = null;
            if (this._effAnimFail) {
                if (this._effAnimFail.length > 0) {
                    this._effAnimFail.forEach(item => {
                        if (item) {
                            item.dispose();
                        }
                    });
                }
                this._effAnimFail = null;
            }
            if (this._effAnimSucc) {
                if (this._effAnimSucc.length > 0) {
                    this._effAnimSucc.forEach(item => {
                        if (item) {
                            item.dispose();
                        }
                    });
                }
                this._effAnimSucc = null;
            }
            super.destroy();
        }
    }
}