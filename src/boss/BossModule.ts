namespace boss {
    /**
     * boss模块
     */

    const ONCE_COUNT_TIME = 3;
    const TEN_COUNT_TIME = 10;
    export class BossModule extends ui.boss.BossModuleUI {

        private _t: time.GTime;
        private _control: BossControl;
        private _model: BossModel;
        private _commonData: xls.bossCommomData;
        private _pool: Laya.Sprite[] = [];
        private _damages: number[] = [];

        private _left: BossLeft;
        private _isOver: boolean;
        private _alertPanel: AlertPanel;

        /** 当前状态 0-未开启 1-准备中 2-战斗 3-胜利了*/
        private _status: number;

        /** 特效集合*/
        private _effects: Effect[];

        private _fightMovieInfoArr: pb.sc_user_attack_world_boss_notify[];


        constructor() { super(); }


        init(): void {
            this.mouseThrough = true;
            this.sign = clientCore.CManager.regSign(new BossModel(), new BossControl());
            this._left = new BossLeft(this.leftView, this.sign);
            this._status = -1;
            this.resizeView();
            this._fightMovieInfoArr = [];
        }

        addEventListeners(): void {
            BC.addEvent(this, this.rightView.btnClose, Laya.Event.CLICK, this, this.onExit);
            BC.addEvent(this, this.rightView.btnOnce, Laya.Event.CLICK, this, this.onAttack, [1]);
            BC.addEvent(this, this.rightView.btnTen, Laya.Event.CLICK, this, this.onAttack, [10]);
            BC.addEvent(this, this.rightView.btnGift, Laya.Event.CLICK, this, this.onGift);
            BC.addEvent(this, this.rightView.btnTalk, Laya.Event.CLICK, this, this.onTalk);
            BC.addEvent(this, this.rightView.btnFight, Laya.Event.CLICK, this, this.onFight);
            BC.addEvent(this, this.rightView.btnCd, Laya.Event.CLICK, this, this.onCd);
            BC.addEvent(this, this.rightView.btnMail, Laya.Event.CLICK, this, this.onMail);
            BC.addEvent(this, this.rightView.btnEx, Laya.Event.CLICK, this, this.onSynthesis);
            BC.addEvent(this, this.rightView.cpShield, Laya.Event.CLICK, this, this.onShield);
            BC.addEvent(this, this.rightView.btnArray, Laya.Event.CLICK, this, this.openBattleArray);
            BC.addEvent(this, EventManager, globalEvent.BOSS_BLOOD_REFRESH, this, this.onBloodNotify);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.updateExchange);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.resizeView);
            net.listen(pb.sc_user_attack_world_boss_notify, this, this.otherAttackNotify);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
            net.unListen(pb.sc_user_attack_world_boss_notify, this, this.otherAttackNotify);
        }

        destroy(): void {
            util.TweenUtils.remove("BossModule");
            _.forEach(this._pool, (element) => { element.destroy(); })
            this._damages.length = this._pool.length = 0;
            this._damageT?.dispose();
            this._t?.dispose();
            this._left?.dispose();
            this._alertPanel = this._damageT = this._left = this._damages = this._pool = this._commonData = this._model = this._control = this._t = null;
            clientCore.CManager.unRegSign(this.sign);
            clientCore.GiftPanel.hideAlert();
            super.destroy();
        }

        async popupOver(): Promise<void> {
            this._commonData = xls.get(xls.bossCommomData).get(1);
            this._control = clientCore.CManager.getControl(this.sign) as BossControl;
            this._model = clientCore.CManager.getModel(this.sign) as BossModel;
            this._isOver = false;

            let data: pb.sc_get_world_boss_info = await clientCore.BossManager.ins.getBossInfo();
            this._model.bossMaxHp = parseFloat(data.maxBlood);
            this.onBloodChange(data.remainBlood);
            this._model.excitation = data.inspireCnt;
            this._model.nextTime = data.nextTime;
            this._model.showTime = data.showTime;
            this._model.talkCnt = data.talkCnt;
            this._model.rankTime = 0;
            this._model.myDamage = 0;
            this._model.wirteSvrTime(data);
            this._left.update();
            this.initView();
        }

        private resizeView(): void {
            this.width = Laya.stage.width;
            this.height = Laya.stage.height;
            this.hpView.x = this.width / 2 - this.hpView.width / 2 + 112;
            this.leaveView.x = this.width / 2 - this.leaveView.width / 2;
            this.rightView.x = this.width - this.rightView.width;
        }

        private initView(): void {
            this.rightView.cpShield.index = clientCore.PeopleManager.showPlayerFlag ? 0 : 1;
            this.updateExchange();
            this.onTime();
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();

            this.rightView.boxOne.visible = false;
            this.rightView.boxTen.visible = false;
        }

        private updateExchange(): void {
            let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(clientCore.BossManager.BOSS_ROLD_ID);
            if (role) {
                this.rightView.imgPro.width = 65;
                this.rightView.txPro.changeText("已拥有");
                return;
            }
            //TODO 现在兑换默认是2 兑换莫拉格斯
            let merge: xls.commonMerge = xls.get(xls.commonMerge).get(this._model.mergeID);
            let has: number = clientCore.ItemsInfo.getItemNum(merge.mergeRequire.v1);
            this.rightView.txPro.changeText(`${has}/${merge.mergeRequire.v2}`);
            this.rightView.imgPro.width = Math.min(has / merge.mergeRequire.v2, 1) * 65;
        }

        private onTime(): void {
            let status: number = this._model.status;
            let talk: boolean = status == 3;
            this.hpView.visible = this.rightView.boxFight.visible = !talk;
            this.hpView.boxTime.visible = status == 2;
            this.leaveView.visible = this.rightView.boxTalk.visible = talk;
            this._left.rankVisible = status == 2 || status == 3;
            this._status != status && this.changeStatus(status);
            this.bossStatus(status);
            switch (status) {
                case 0: //活动外
                    this.exit();
                    break;
                case 1: //准备阶段
                    this.setFightView(0);
                    this.rightView.txTime.changeText(util.StringUtils.getDateStr2(this._model.waitTime, '{min}:{sec}'));
                    break;
                case 2: //战斗中
                    let ct: number = clientCore.ServerManager.curServerTime; //15s自动刷新一次伤害排行
                    if (ct - this._model.rankTime >= 15) {
                        this._left.updateRank();
                        this._model.rankTime = ct;
                    }
                    this.hpView.txTime.changeText(`倒计时：${util.StringUtils.getDateStr2(this._model.closeTime, '{min}:{sec}')}`);
                    let cd: number = this._model.cdTime;
                    let type: number = cd > 0 ? 1 : 2;
                    this.setFightView(type);
                    type == 1 && this.rightView.txTime.changeText(util.StringUtils.getDateStr2(cd, '{min}:{sec}'));
                    break;
                case 3: //战胜阶段
                    if (!this._isOver) {
                        this._isOver = true;
                        this._left.updateRank(); //在战胜阶段立即获取一次排行信息
                        //游戏结束，情况两个动画的数组
                        this._fightMovieInfoArr = [];
                        this._damageArr = [];

                    }
                    this.setFightView(3);
                    this._left.fightOver();
                    let leaveTime: number = this._model.leaveTime;
                    this.leaveView.boxLev.visible = leaveTime <= 0;
                    if (leaveTime <= 0) {
                        let closeTime: number = this._model.closeTime;
                        if (closeTime < 0) {
                            this.exit();
                            return;
                        }
                        this.leaveView.txTime.changeText('莫拉格斯已经离去了');
                        this.leaveView.txLev.changeText(`倒计时：${util.StringUtils.getDateStr2(closeTime, '{min}:{sec}')}`);
                    } else {
                        this.leaveView.txTime.changeText(util.StringUtils.getDateStr2(leaveTime));
                    }
                    break;
            }

            this.playOtherFightMovie();
            this.refreshFightTimeCount();
        }

        private _timeOneCount: number = 0;
        private _timeTenCount: number = 0;
        private refreshFightTimeCount() {
            if (this._isOver) {
                this.rightView.boxOne.visible = false;
                this.rightView.boxTen.visible = false;
                return;
            }
            if (this._timeOneCount > 0) {
                this._timeOneCount--;
                this.rightView.txtTimeOne.changeText("" + this._timeOneCount);
                if (this._timeOneCount == 0) {
                    this.rightView.btnOnce.disabled = false;
                    this.rightView.boxOne.visible = false;
                }
                else {
                    let maskTen: Laya.Sprite = this.rightView.spOne;
                    maskTen.graphics.clear();
                    maskTen.graphics.drawPie(0, 0, 52, -90, -90 + 360 * ((ONCE_COUNT_TIME - this._timeOneCount) / ONCE_COUNT_TIME), "#000000");
                }
            }
            if (this._timeTenCount > 0) {
                this._timeTenCount--;
                this.rightView.txtTimeTen.changeText("" + this._timeTenCount);
                if (this._timeTenCount == 0) {
                    this.rightView.btnTen.disabled = false;
                    this.rightView.boxTen.visible = false;
                } else {
                    let maskTen: Laya.Sprite = this.rightView.spTen;
                    maskTen.graphics.clear();
                    maskTen.graphics.drawPie(0, 0, 52, -90, -90 + 360 * ((TEN_COUNT_TIME - this._timeTenCount) / TEN_COUNT_TIME), "#000000");
                }
            }
        }

        /**
         * 状态切换
         * @param status 
         */
        private changeStatus(status: number): void {
            if (this._status != -1) { //不是第一次进入
                switch (status) {
                    case 2: //切换到战斗
                        // core.SoundManager.instance.playSound(pathConfig.getAnimateTalkSound('ximeng_ps2_start'));
                        break;
                    case 3: //切换到胜利
                        // core.SoundManager.instance.playSound(pathConfig.getAnimateTalkSound('ximeng_ps2_end'));
                        clientCore.ModuleManager.open("bossTopThree.BossTopThreeModule", "death");
                        break;
                }
            }
            this._status = status;
        }

        /**
         * 设置活动过程的界面显示
         * @param type 0-准备 1-休整 2-战斗
         */
        private setFightView(type: number): void {
            this.rightView.lock1.visible =
                this.rightView.lock2.visible =
                this.rightView.btnWait.visible = type == 0;
            this.rightView.btnOnce.disabled = type == 0 || this._timeOneCount > 0;
            this.rightView.btnTen.disabled = type == 0 || this._timeTenCount > 0;
            this.rightView.btnCd.visible = type == 1;
            this.rightView.btnFight.visible = type == 2;
            this.rightView.txTime.visible = type == 0 || type == 1;
        }

        /** 血量变化通知*/
        private onBloodNotify(msg: pb.sc_world_boss_blood_notify): void {
            _.forEach(msg.damageLists, (element) => { this.showDamage(element); });
            this.onBloodChange(msg.blood);
        }

        /** 血量变化*/
        private onBloodChange(hpStr: string): void {
            let hp = parseFloat(hpStr);
            if (this._model.bossHp <= hp) return;
            this._model.bossHp = Math.min(hp, this._model.bossMaxHp);
            let rate: number = hp / this._model.bossMaxHp;
            this.hpView.txHp.changeText(`${hp}/${this._model.bossMaxHp}(${Math.floor(this._model.bossHp / this._model.bossMaxHp * 10000) / 100}%)`);
            if (rate >= 0.5) {
                rate = (1 - rate) * 2;
                this.hpView.bule_hp.x = 584 * rate;
                this.hpView.red_hp.x = 0;
            } else {
                rate = (0.5 - rate) * 2;
                this.hpView.bule_hp.x = 584;
                this.hpView.red_hp.x = 584 * rate;
            }
            //光点进度
            this.hpView.imgLight.x = 61 + 584 * rate;
            //BOSS挂了
            if (hp <= 0 && this._model.leaveTime <= 0) this._model.showTime = clientCore.ServerManager.curServerTime + this._commonData.stayTime;
        }

        /**
         * boss状态
         * @param rate 
         */
        private bossStatus(status: number): void {
            let boss: clientCore.BossXM = clientCore.BossManager.ins.boss;
            if (!boss || boss.destroyed) return;
            switch (status) {
                case 1:
                    boss.status = 0;
                    break;
                case 2:
                    let rate: number = this._model.bossHp / this._model.bossMaxHp * 100;
                    let phase: number[] = boss.cls.bossPhase;
                    if (rate >= phase[0]) boss.status = -1;
                    else if (rate >= phase[1]) boss.status = 1;
                    else if (rate >= phase[2]) boss.status = 2;
                    else boss.status = 3;
                    break;
                case 3:
                    boss.status = 4;
                    break;
            }
        }

        private async onAttack(cnt: number): Promise<void> {
            let cost: number = cnt == 1 ? this._commonData.attackCost.v1 : this._commonData.attackCost.v2;
            let index = cnt == 1 ? 0 : 1;
            let medal = [MedalDailyConst.BOSS_COST_LEAF_ONE, MedalDailyConst.BOSS_COST_LEAF_TEN][index];
            let data: pb.ICommonData[] = await clientCore.MedalManager.getMedal([medal]);
            if (data[0].value == 0) { //未设置
                this._alertPanel = this._alertPanel || new AlertPanel();
                this._alertPanel.show(`是否花费${cost}神叶进行${cnt}次攻击？`, medal, Laya.Handler.create(this, () => { this.leafAttack(cost, cnt); }));
            } else {
                this.leafAttack(cost, cnt);
            }
        }

        /**
         * 神叶攻击
         * @param cost 花费
         * @param attactCnt 攻击次数 
         */
        private leafAttack(cost: number, attactCnt: number): void {
            if (!clientCore.MoneyManager.checkLeaf(cost)) return;
            this._control.attackBoss(attactCnt, Laya.Handler.create(this, (data: pb.sc_attack_world_boss_by_counts) => {
                let de: number = 0;
                _.forEach(data.damage, (element) => { de += element.num; });
                this._left.updateMyRank(de);
                this.showEffect(clientCore.PeopleManager.getInstance().player, attactCnt == 1 ? 1 : 2);
                this.onBloodChange(data.remainBlood);
                _.forEach(data.damage, (element) => { this.showDamage(element); });

                if (attactCnt == 1) {
                    this._timeOneCount = ONCE_COUNT_TIME;
                    this.rightView.txtTimeOne.changeText("" + this._timeOneCount);
                    this.rightView.boxOne.visible = true;
                    this.rightView.btnOnce.disabled = true;
                }
                else if (attactCnt == 10) {
                    this._timeTenCount = TEN_COUNT_TIME;
                    this.rightView.txtTimeTen.changeText("" + this._timeTenCount);
                    this.rightView.boxTen.visible = true;
                    this.rightView.btnTen.disabled = true;
                }
            }));

            /**如果神叶攻击需要做延迟，则在哪里加定时器，一定时间内不能攻击 */
            this.rightView.btnOnce.disabled = true;
            this.rightView.btnTen.disabled = true;
            Laya.timer.once(500, this, () => {
                if (this._timeOneCount <= 0)
                    this.rightView.btnOnce.disabled = false;
                if (this._timeTenCount <= 0)
                    this.rightView.btnTen.disabled = false;
            })
        }

        private onFight(): void {
            this._control.fightBoss(Laya.Handler.create(this, (data: pb.sc_attack_world_boss) => {
                this._left.updateMyRank(data.damage.num);
                this.showEffect(clientCore.PeopleManager.getInstance().player, 1);
                this._model.nextTime = data.nextTime;
                this.onBloodChange(data.remainBlood);
                this.showDamage(data.damage);
            }));
        }

        /** 重置Cd*/
        private onCd(): void {
            let cd: number = this._model.cdTime;
            if (cd <= 0) return;
            alert.showFWords('技能正在冷却中……');

            // let cost: number = Math.ceil(cd / 60) * this._commonData.cdPrice;
            // alert.showSmall(`是否花费${cost}神叶清除等待时间？`, {
            //     callBack: {
            //         caller: this,
            //         funArr: [() => { clientCore.MoneyManager.checkLeaf(cost) && this._control.clearCd(Laya.Handler.create(this, () => { this._model.nextTime = 0; })) }]
            //     }
            // })
        }

        private onExit(): void {
            alert.showSmall('是否要退出此次活动？\n(退出后可再次进入)', {
                callBack: {
                    caller: this,
                    funArr: [this.exit]
                }
            });
        }

        /** 退出*/
        private exit(): void {
            clientCore.MapManager.enterWorldMap(clientCore.BossManager.ins.mapID);
        }

        private _damageArr: pb.IWorldBossDamage[] = [];
        private _damageT: time.GTime;
        private _randomT: number;
        private _currT: number;

        /**
         * 展示伤害
         * @param value 
         */
        private showDamage(value: pb.IWorldBossDamage): void {
            if (value <= 0) return;
            this._damageArr.push(value);
            if (!this._damageT) {
                this._randomT = _.random(1, 4);
                this._currT = 0;
                this._damageT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 100, this, this.showFWord);
                this._damageT.start();
            }
        }

        private showFWord(): void {
            if (++this._currT <= this._randomT) {
                return;
            }
            this._randomT = _.random(2, 5);
            this._currT = 0;
            let value: pb.IWorldBossDamage = this._damageArr.shift();
            if (this._damageArr.length <= 0) {
                this._damageT?.dispose();
                this._damageT = null;
            }
            if (!value)
                return;
            let sp: Laya.Sprite = this._pool.shift() || new Laya.Sprite();
            util.showTexWord(sp, "boss", "-" + value.num);
            sp.pivotX = sp.width / 2;
            let y: number = Math.random() * 80 + 246;
            sp.pos(Math.random() * 200 + 581.5, y);
            sp.alpha = 1;
            sp.scale(1, 1);
            this.hpView.addChild(sp);
            //暴击了
            value.crit && sp.scale(1.25, 1.25);
            // util.TweenUtils.creTween("BossModule", sp, { y: y - 163, alpha: 0.2, scaleX: 1, scaleY: 1 }, 1500, true, null, this, () => {
            //     sp.removeSelf();
            //     this._pool.push(sp);
            // });

            util.TweenUtils.creTween(sp, { y: y - 163, alpha: 0.2, scaleX: 1, scaleY: 1 }, 1500, null, this, () => {
                sp.removeSelf();
                this._pool.push(sp);
            }, "BossModule");

            // let tw: Laya.Tween = new Laya.Tween();
            // tw.to(sp, { y: y - 163, alpha: 0.2, scaleX: 1, scaleY: 1 }, 1500, null, new Laya.Handler(this, () => {
            //     // if (!this._pool) { //这时候界面关闭了
            //     //     sp?.destroy();
            //     //     return;
            //     // }
            //     sp.offAll();
            //     sp.removeSelf();
            //     // this._pool.push(sp);
            // }));
        }

        /** 赠礼*/
        private onGift(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击赠礼按钮');
            let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(clientCore.BossManager.BOSS_ROLD_ID);
            if (!role) {
                alert.showFWords('你尚未获得莫拉格斯~');
                return;
            }
            if (this._model.leaveTime <= 0) {
                alert.showFWords(`莫拉格斯已离去了~`);
                return;
            }
            clientCore.GiftPanel.showAlert(role.id);
        }

        /** 交谈*/
        public onTalk(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击交谈按钮');
            if (this._model.leaveTime <= 0) {
                alert.showFWords(`莫拉格斯已离去了~`);
                return;
            }
            // let talkArr = [90001, 90002, 90003, 90004, 90005, 90006, 80012, 80013, 80014, 80015, 80016, 80017];
            let talkArr: number[] = [90001, 90002, 90003, 90004, 90005, 90006];
            let movieId: number = this._model.talkCnt >= 3 ? 90007 : talkArr[_.random(0, talkArr.length - 1)]; //三次后只有一个
            let rewardArr: clientCore.GoodsInfo[];
            this._control.talk(Laya.Handler.create(this, (msg: pb.sc_talk_with_semon) => {
                this._model.talkCnt = msg.talkCnt;
                rewardArr = clientCore.GoodsInfo.createArray(msg.itms);
            }));
            clientCore.AnimateMovieManager.showAnimateMovie(movieId + "", this, () => {
                alert.showReward(rewardArr);
            });
        }

        /** 打开邮件*/
        private onMail(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击邮件按钮');
            clientCore.ModuleManager.open("mail.MailModule");
        }

        /** 合成*/
        private onSynthesis(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击莫拉格斯【预览/兑换】按钮');
            let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(clientCore.BossManager.BOSS_ROLD_ID);
            if (role) {
                alert.showFWords('你已经拥有莫拉格斯了哟！');
                return;
            }
            let merge: xls.commonMerge = xls.get(xls.commonMerge).get(this._model.mergeID);
            //合成材料不足 跳转预览界面
            if (clientCore.ItemsInfo.getItemNum(merge.mergeRequire.v1) < merge.mergeRequire.v2) {
                clientCore.ModuleManager.open("rewardDetail.PreviewModule", clientCore.BossManager.BOSS_ROLD_ID);
            } else {
                alert.showSmall('是否合成莫拉格斯？', {
                    callBack: {
                        caller: this,
                        funArr: [() => { this._control.synthesis(merge.mergeId); }]
                    }
                })
            }
        }

        /** 屏蔽其他玩家*/
        private onShield(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击屏蔽其他玩家按钮');
            clientCore.PeopleManager.showPlayerFlag = !clientCore.PeopleManager.showPlayerFlag;
            this.rightView.cpShield.index = clientCore.PeopleManager.showPlayerFlag ? 0 : 1;
        }

        /** 其他玩家伤害同步*/
        private otherAttackNotify(msg: pb.sc_user_attack_world_boss_notify): void {
            /**战胜，游戏结束，防止游戏结束了，还有协议推过来，这里加个活动结束的判断 */
            if (this._isOver) {
                return;
            }
            _.forEach(msg.damage, (element) => { this.showDamage(element); });
            // handler 
            this._fightMovieInfoArr.push(msg);
        }
        private _fightMovieCount: number = 0;
        private playOtherFightMovie() {
            if (++this._fightMovieCount < 3) {
                return;
            }
            this._fightMovieCount = 0;
            if (this._fightMovieInfoArr.length > 0) {
                let msg = this._fightMovieInfoArr.shift();
                let otherPlayer = clientCore.PeopleManager.getInstance().getOther(msg.userid);
                if (otherPlayer && otherPlayer.visible == true)
                    this.showEffect(otherPlayer, msg.damage.length > 1 ? 2 : 1);
            }
        }

        /** 打开队伍*/
        private openBattleArray(): void {
            clientCore.ModuleManager.open('formation.FormationModule');
        }

        /** 施法*/
        private showEffect(user: clientCore.PersonUnit, type: number): void {
            if (!user) return;
            let boss: clientCore.BossXM = clientCore.BossManager.ins.boss;
            if (!boss || boss.destroyed) return;
            let effect: Effect = Effect.create();
            let point: Laya.Point = Laya.Point.create();
            point.setTo(boss.x, boss.y - 232);
            effect.show(user, point, type);
        }
    }
}