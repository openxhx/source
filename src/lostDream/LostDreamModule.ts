namespace lostDream {
    /**
     * 逝梦之境
     */
    export class LostDreamModule extends ui.lostDream.LostDreamModuleUI {
        private _model: LostDreamModel;
        private _control: LostDreamControl;
        //各种二级面板
        private _bossPanel: BossPanel;
        private _gamePanel: GamePanel;
        private _rewardPanel: RewardPanel;
        private _buyPanel: BuyPanel;
        //各种临时变量
        private _isOver: boolean; //是否领完了梦境奖励
        //各种常量
        private readonly CLOTH_ID: number = 2100064;
        private readonly TALKS: string[] = [
            '你们谁都不能离开！',
            '为什么你们不接受莱妮的善意',
            '现实并不会比噩梦好多少……',
            '永恒的沉睡更适合闯入的蝴蝶……',
        ];

        init(data?: any): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new LostDreamModel(), new LostDreamControl());
            this._control = clientCore.CManager.getControl(this.sign) as LostDreamControl;
            this._model = clientCore.CManager.getModel(this.sign) as LostDreamModel;
            clientCore.UIManager.setMoneyIds([this._model.ACTIVITY_ID, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();

            this.addPreLoad(xls.load(xls.commonBuy));
            this.addPreLoad(xls.load(xls.commonStoryActivity));
            this.addPreLoad(res.load('unpack/lostDream/nightmareBubble.sk'));
            this.addPreLoad(res.load('unpack/lostDream/nightmareBubble.png'));
            this.addPreLoad(this.playStory());
        }

        private playStory(): Promise<void> {
            return new Promise(async (suc) => {
                let data: pb.ICommonData[] = await clientCore.MedalManager.getMedal([MedalConst.LOST_DREAM_OPEN_COPY]);
                let isFrist: boolean = data[0].value == 0;
                isFrist && clientCore.AnimateMovieManager.showAnimateMovie('80080', this, () => { clientCore.MedalManager.setMedal([{ id: MedalConst.LOST_DREAM_OPEN_COPY, value: 1 }]) });
                suc();
            })
        }

        private gotoPark() {
            clientCore.ToolTip.gotoMod(96);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.backBtn, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.bossBtn, Laya.Event.CLICK, this, this.onGame);
            BC.addEvent(this, this.gameBtn, Laya.Event.CLICK, this, this.gotoPark);
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.descBtn, Laya.Event.CLICK, this, this.onDesc);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.onGift);
            BC.addEvent(this, this.imgNpc, Laya.Event.CLICK, this, this.onTalk);
            BC.addEvent(this, EventManager, globalEvent.UPDATE_LOST_DREAM, this, this.updateView);
            for (let i: number = 0; i < 5; i++) {
                BC.addEvent(this, this['progress_' + (i + 1)], Laya.Event.CLICK, this, this.onProgress, [i]);
            }
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            clientCore.UIManager.releaseCoinBox();
            this._model = this._control = this._bossPanel = this._gamePanel = null;
            super.destroy();
        }
        async onPreloadOver(): Promise<void> {
            clientCore.Logger.sendLog('2020年5月22日活动', '【主活动】噩梦之境莱妮丝', '打开活动面板');
            let msg: pb.sc_lenis_dream_panel = await this._control.getInfo();
            this._model.rewards = msg.panelInfo;
            this._model.bossCnt = msg.challengeLeftTimes;
            this._model.gameCnt = msg.gameLeftTimes;
            this._model.sweepCnt = msg.rewardNumber;
            this.updateView();
            this._data == 1 && this.onBoss();
            this._data == 2 && this.onGame();
        }

        private updateView(): void {
            for (let i: number = 0; i < 5; i++) { this.updateBall(i); };
            this.updateNpc();
        }

        private updateBall(index: number): void {
            let flag: number = this._model.rewards[index];
            let id: number = index + 1; //作为id
            let ball: ui.lostDream.item.BallUI = this['progress_' + id];
            let isReward: boolean = flag == 3;
            if (!isReward) {
                if (flag == 1) {  //未开启的时候自己检查下
                    let cls: xls.commonStoryActivity = xls.get(xls.commonStoryActivity).get(id);
                    let has: number = clientCore.ItemsInfo.getItemNum(this._model.ACTIVITY_ID);
                    if (cls.openRequire <= has) this._model.rewards[index] = flag = 2;
                }
                ball.lightImg.visible = false;
                ball.ball.visible = true;
                if (flag == 1)
                    ball.ball?.stop();
                else
                    ball.ball?.play(0, true);
            }
            else {
                ball.ball.visible = false;
                ball.lightImg.visible = true;
            }
        }

        /** 打开挑战莱妮丝*/
        private onBoss(): void {
            this._bossPanel = this._bossPanel || new BossPanel();
            this._bossPanel.show(this.sign);
        }
        /** 打开摩卡的游戏*/
        private onGame(): void {
            this._gamePanel = this._gamePanel || new GamePanel();
            this._gamePanel.show(this.sign);
        }
        /** 打开套装预览*/
        private onTry(): void {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.CLOTH_ID);
        }
        /** 打开规则说明*/
        private onDesc(): void {
            alert.showRuleByID(1005);
        }
        /** 打开礼盒购买*/
        private async onGift(): Promise<void> {
            this._model.buys = this._model.buys || await clientCore.MedalManager.getMedal([MedalDailyConst.LOST_DREAM_COPY_1, MedalDailyConst.LOST_DREAM_COPY_2, MedalDailyConst.LOST_DREAM_COPY_3, MedalDailyConst.LOST_DREAM_COPY_4]);
            let index: number = this._model.checkBuy();
            if (index == -1) { //都卖完啦
                alert.showFWords('今日礼包购买已上限~');
                return;
            }
            this._buyPanel = this._buyPanel || new BuyPanel();
            this._buyPanel.show(this.sign, index);
        }
        private onProgress(index: number): void {
            this._rewardPanel = this._rewardPanel || new RewardPanel();
            this._rewardPanel.show(this.sign, index);
        }
        private onTalk(): void {
            if (this._isOver) {
                clientCore.Logger.sendLog('2020年5月22日活动', '【主活动】噩梦之境莱妮丝', '点击现实回顾按钮');
                clientCore.AnimateMovieManager.showAnimateMovie('80086', this, () => { });
                return;
            }
            this.talkTxt.text = this.TALKS[_.random(0, 3)]
        }
        private updateNpc(): void {
            let array: number[] = _.filter(this._model.rewards, (element) => { return element != 3; });
            this._isOver = array.length == 0; //是否都领了
            this.imgNpc.skin = this._isOver ? 'unpack/lostDream/over.png' : 'unpack/lostDream/tuzi.png';
            this.boxTalk.visible = !this._isOver;
            this.imgBg2.visible = !this._isOver;
        }
    }
}