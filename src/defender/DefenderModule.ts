
namespace defender {
    const TOTAL_LEN = 1700;
    const POINT_ITEM_ID = 9900028;
    /**
     * 命定者保卫战
     * defender.DefenderModule
     */
    export class DefenderModule extends ui.defender.DefenderModuleUI {
        private _itemList: ui.defender.render.DefenderRenderUI[];
        private _score: number;
        private _totalScore: number;
        /**已挑战小游戏次数 */
        private _gameTimes: number;
        /**大炮攻击次数 */
        private _attackTimes: number;
        private _energy: number;
        private _buyNum: number;
        private _lastAttackTimeStamp: number;
        private _nextBuyInfo: xls.commonBuy;

        /**最大小游戏挑战次数 */
        private readonly MAX_GAME_TIME: number;
        /**能量最大值 */
        private readonly MAX_CHARGE_ENERGY: number;
        /**最大攻击次数 */
        private readonly MAX_ATTACK_TIME: number;
        /**攻击cd */
        private readonly ATTACK_CD: number;

        private _cannon: clientCore.Bone;

        private _animateFlg: number;

        constructor() {
            super();
            let xlsGlobal = xls.get(xls.globaltest).get(1);
            this.MAX_GAME_TIME = xlsGlobal.challengeTime;
            this.MAX_ATTACK_TIME = xlsGlobal.shellAttackTime;
            this.ATTACK_CD = xlsGlobal.shellCDTime;
            this.MAX_CHARGE_ENERGY = xlsGlobal.atkEnergyCost;
        }

        init(d: any) {
            this.panelPro.hScrollBarSkin = null;
            this._itemList = [];
            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(net.sendAndWait(new pb.cs_destiny_defend_panel()).then((data: pb.sc_destiny_defend_panel) => {
                this._score = data.damage;
                this._energy = data.userEnergy;
                this._gameTimes = data.gameChallengeTimes;
                this._attackTimes = data.shellAttackTimes;
                this._buyNum = data.payAttackTimes;
                this._lastAttackTimeStamp = data.shellAttackTime;
            }));
            this.addPreLoad(res.load('res/animate/defender/bomb.sk'));
            this.addPreLoad(res.load('res/animate/defender/shell.sk'));
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalConst.DEFENDER_ANIMATE]).then((data) => {
                this._animateFlg = data[0].value;
            }))
            this.imgSuit.skin = clientCore.LocalInfo.sex == 1 ? 'defender/3937.png' : 'defender/3938.png';
            this.imgRole.skin = clientCore.LocalInfo.sex == 1 ? 'defender/主角女.png' : 'defender/主角男.png';
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            clientCore.Logger.sendLog('2020年5月14日活动', '【主活动】命定者保卫战', '打开活动面板')
        }

        onPreloadOver() {
            //创建进度条
            this.imgProgressBg.width = TOTAL_LEN;
            let arr = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == 24 });
            this._totalScore = _.last(_.map(arr, (o) => { return o.num.v2 }));
            for (let i = 0; i < arr.length; i++) {
                let o = arr[i];
                let itemUI = new ui.defender.render.DefenderRenderUI();
                itemUI.pos(o.num.v2 / this._totalScore * TOTAL_LEN, 110, true);
                itemUI.dataSource = o;
                itemUI.txtScore.value = o.num.v2.toString();
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.femaleAward[0].v1 : o.maleAward[0].v1;
                itemUI.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(rwdId);
                this.panelPro.addChild(itemUI);
                this._itemList.push(itemUI);
                BC.addEvent(this, itemUI, Laya.Event.CLICK, this, this.onGetScoreReward, [i]);
            }
            this.updateView();
            this._cannon = clientCore.BoneMgr.ins.play('res/animate/defender/shell.sk', 'idle', true, this.spCannon);
            this._cannon.pos(-90, 30);
            this.playAnimateByIdx(1);
        }

        private playAnimateByIdx(bit: number) {
            if (util.getBit(this._animateFlg, bit) == 0) {
                return new Promise((ok) => {
                    clientCore.AnimateMovieManager.showAnimateMovie(80069 + bit, this, () => {
                        this._animateFlg = util.setBit(this._animateFlg, bit, 1);
                        clientCore.MedalManager.setMedal([{ id: MedalConst.DEFENDER_ANIMATE, value: this._animateFlg }]);
                        ok();
                    })
                })
            }
            return Promise.resolve();
        }

        private onGetScoreReward(idx: number, e: Laya.Event) {
            let data = e.currentTarget['dataSource'] as xls.commonAward;
            let rwdId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
            let getRewarded = clientCore.LocalInfo.checkHaveCloth(rwdId);
            let canGetReward = this._score >= data.num.v2;
            if (canGetReward && !getRewarded) {
                net.sendAndWait(new pb.cs_get_destiny_defend_reward({ rewardId: data.id })).then((data: pb.sc_purifying_the_great_war_get_point_reward) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.item));
                    this.updateView();
                })
            }
            else {
                let rwdId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                clientCore.ToolTip.showTips(e.currentTarget, { id: rwdId });
            }
        }

        private updateView() {
            this._score = clientCore.ItemsInfo.getItemNum(POINT_ITEM_ID);
            this.txtScore.text = Math.min(100, this._score) + '%';
            //神叶购买
            let buyInfoArr = _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == 24 });
            let nextBuyTimes = _.clamp(this._buyNum + 1, 1, _.last(buyInfoArr).buyTimes);
            this._nextBuyInfo = _.find(buyInfoArr, (o) => { return o.buyTimes == nextBuyTimes });
            this.txtAddDamage.text = `立即造成${this._nextBuyInfo.maleAward[0].v2}%伤害`;
            this.imgNeedNum.value = this._nextBuyInfo.itemCost.v2.toString();
            this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(this._nextBuyInfo.itemCost.v1);
            this.btnLeafAttack.disabled = this._buyNum >= buyInfoArr.length;
            //进度条
            this.imgProgress.width = Math.min(1, this._score / this._totalScore) * TOTAL_LEN;
            for (let i = 0; i < this._itemList.length; i++) {
                let item = this._itemList[i];
                let data = item.dataSource as xls.commonAward;
                let rwdId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                let getRewarded = clientCore.LocalInfo.checkHaveCloth(rwdId);
                let canGetReward = this._score >= data.num.v2;
                item.imgGet.visible = getRewarded;
                item.imgHaveRwd.visible = canGetReward && !getRewarded;
                item.clipBg.index = canGetReward && !getRewarded ? 1 : 0;
            }
            //能量进度
            let energy = Math.min(this.MAX_CHARGE_ENERGY, this._energy)
            this.txtProgress.text = `${this._energy}/${this.MAX_CHARGE_ENERGY}`;
            this.imgProgEnergy.height = energy / this.MAX_CHARGE_ENERGY * 201;
            this.btnCharge.fontSkin = this._energy >= this.MAX_CHARGE_ENERGY ? 'defender/t_y_gongji.png' : 'defender/t_p_chongneng.png';
            this.boxCharge.visible = this._energy < this.MAX_CHARGE_ENERGY;
            //次数限制
            this.txtChargeTimes.text = `充能次数${this.MAX_GAME_TIME - this._gameTimes}/${this.MAX_GAME_TIME}`;
            this.txtAttackTimes.text = `剩余次数${this.MAX_ATTACK_TIME - this._attackTimes}/${this.MAX_ATTACK_TIME}`;
            this.onTimer();
            this.txtTalk.text = this._score >= 100 ? '我还会再回来的！' : '还不快把莱妮丝还给我';
            Laya.timer.loop(500, this, this.onTimer);

            if (this._score >= 100) {
                this.btnAttack.disabled = this.btnCharge.disabled = this.btnLeafAttack.disabled = true;
            }
        }

        private onTry() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2100065)
        }

        private onRecall() {
            clientCore.Logger.sendLog('2020年5月14日活动', '【主活动】命定者保卫战', '点击剧情回顾')
            clientCore.AnimateMovieManager.showAnimateMovie(80070, null, null);
        }

        private onDetail() {
            alert.showRuleByID(1008);
        }

        private async onCharge() {
            //能量满了攻击
            if (this._energy >= this.MAX_CHARGE_ENERGY) {
                this.reqAttack(1);
            }
            else {
                if (this._gameTimes >= this.MAX_GAME_TIME) {
                    alert.showFWords('挑战次数不足');
                    return;
                }
                //进入小游戏
                clientCore.ToolTip.gotoMod(97)
            }
        }

        private onAttack() {
            if (this.boxTime.visible) {
                alert.showFWords('大炮正在维修中')
                return;
            }
            if (this._attackTimes >= this.MAX_ATTACK_TIME) {
                alert.showFWords('今日普通攻击次数到达上限');
                return;
            }
            this.reqAttack(2);
        }

        private onUseLeafAttack() {
            let item = this._nextBuyInfo.itemCost;
            alert.showSmall(`确定要消耗${item.v2}个${clientCore.ItemsInfo.getItemName(item.v1)}进行一次乾坤一掷吗？`, { callBack: { caller: this, funArr: [this.sureBuyScore] } });
        }

        private sureBuyScore() {
            let needId = this._nextBuyInfo.itemCost.v1;
            let needNum = this._nextBuyInfo.itemCost.v2;
            if (needId == clientCore.MoneyManager.LEAF_MONEY_ID)
                alert.useLeaf(needNum, new Laya.Handler(this, this.reqAttack, [3]));
            else if (needId == clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID) {
                if (needNum <= clientCore.ItemsInfo.getItemNum(needId)) {
                    this.reqAttack(3);
                }
                else {
                    alert.showSmall('灵豆不足，是否前往补充？', { callBack: { caller: this, funArr: [this.goMoneyShop] } })
                }
            }
        }


        /**
         * 向后台请求攻击协议
         * @param type 1:使用能量2:大炮:3:乾坤一掷  
         */
        private reqAttack(type: number) {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_destiny_attack_damage_info({ attackType: type })).then(async (data: pb.sc_destiny_attack_damage_info) => {
                this._score = data.damage;
                switch (type) {
                    //能量攻击
                    case 1:
                        this._energy -= this.MAX_CHARGE_ENERGY;
                        this._energy = Math.max(0, this._energy);
                        await this.playHurtAni(1);
                        break;
                    //大炮攻击
                    case 2:
                        this._attackTimes++;
                        this._lastAttackTimeStamp = data.shellAttackTime;
                        await this.playFireAni();
                        await this.playHurtAni(0);
                        break;
                    //乾坤一掷（花代币攻击）
                    case 3:
                        this._buyNum++;
                        this.mouseEnabled = true;
                        break;
                    default:
                        break;
                }
                this.mouseEnabled = true;
                this.updateView();
                //根据进度播放动画
                let arr = [33, 66, 100];
                for (let i = 0; i < arr.length; i++) {
                    if (this._score >= arr[i]) {
                        await this.playAnimateByIdx(i + 2);
                    }
                }
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }

        private playHurtAni(type: number) {
            return new Promise((ok) => {
                let bomb = clientCore.BoneMgr.ins.play('res/animate/defender/bomb.sk', type, false, this);
                bomb.pos(679, 349);
                bomb.once(Laya.Event.COMPLETE, this, () => {
                    core.SoundManager.instance.playSound('res/sound/heart.ogg');
                    ok();
                });
            })
        }

        private playFireAni() {
            core.SoundManager.instance.playSound('res/sound/bomb.ogg');
            return new Promise((ok) => {
                this._cannon.play('Firing', false, new Laya.Handler(this, () => {
                    this._cannon.play('idle', true, null);
                    ok();
                }));
            })
        }

        private goMoneyShop() {
            clientCore.ToolTip.gotoMod(50);
        }

        private onTimer() {
            if (this._lastAttackTimeStamp > 0) {
                let leftTime = this._lastAttackTimeStamp + this.ATTACK_CD - clientCore.ServerManager.curServerTime;
                this.boxTime.visible = leftTime > 0;
                if (leftTime > 0) {
                    this.txtCd.text = util.StringUtils.getDateStr(leftTime, ':');
                }
                else {
                    Laya.timer.clear(this, this.onTimer);
                }
            }
            else {
                this.boxTime.visible = false;
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnClose1, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnCharge, Laya.Event.CLICK, this, this.onCharge);
            BC.addEvent(this, this.btnAttack, Laya.Event.CLICK, this, this.onAttack);
            BC.addEvent(this, this.btnRecall, Laya.Event.CLICK, this, this.onRecall);
            BC.addEvent(this, this.btnLeafAttack, Laya.Event.CLICK, this, this.onUseLeafAttack);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
            this._cannon.dispose();
        }
    }
}