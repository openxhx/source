namespace luluCamping {
    /**
     * 露露的露营
     * 2021.4.16
     * luluCamping.LuluCampingModule
     */
    export class LuluCampingModule extends ui.luluCamping.LuluCampingModuleUI {
        private _msg: pb.sc_get_lulu_camping_info;
        private curTask: number;
        private taskPanel: CampingTaskPanel;
        private storyPanel: CampingStoryPanel;
        private taskInfo: xls.taskData[];

        private aniMoon: clientCore.Bone;
        private aniFire: clientCore.Bone;

        private storyFlag: number;
        init() {
            this.addPreLoad(net.sendAndWait(new pb.cs_get_lulu_camping_info()).then((msg: pb.sc_get_lulu_camping_info) => {
                this._msg = msg;
            }))
            this.addPreLoad(this.getBuyMedal());
            this.addPreLoad(xls.load(xls.taskData));
            this.addPreLoad(res.load("res/animate/luluCamping/campfire.png"));
            this.addPreLoad(res.load("res/animate/luluCamping/campfire2.png"));
            this.addPreLoad(res.load("res/animate/luluCamping/campfire.sk"));
            this.suit1.visible = clientCore.LocalInfo.sex == 1;
            this.suit2.visible = clientCore.LocalInfo.sex == 2;
            this.aniMoon = clientCore.BoneMgr.ins.play("res/animate/luluCamping/moonlight.sk", 0, true, this.moon);
            this.aniMoon.pos(144, 144);
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年4月16日活动', '【主活动】露露的露营', '打开主活动面板');
            if (this.storyFlag == 0) {
                clientCore.MedalManager.setMedal([{ id: MedalConst.LULU_CAMPING_OPEN, value: 1 }]);
                this.playAnimation();
            }
            clientCore.UIManager.setMoneyIds([9900152, clientCore.MoneyManager.LEAF_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this.labDaily.text = "" + this._msg.dailyCounts;
            this.imgGet.visible = this._msg.dailyReward == 1;
            this.taskInfo = _.filter(xls.get(xls.taskData).getValues(), (o) => { return o.type == 16 });
            this.curTask = 0;
            this.checkTask();
        }

        /**获取勋章情况 */
        async getBuyMedal() {
            let totalInfo = await clientCore.MedalManager.getMedal([MedalConst.LULU_CAMPING_OPEN]);
            this.storyFlag = totalInfo[0].value;
            return Promise.resolve();
        }

        private checkTask() {
            for (let i: number = this.curTask; i < this.taskInfo.length; i++) {
                let flag = clientCore.TaskManager.getTaskById(this.taskInfo[i].task_id);
                if (flag.state < 3) {
                    this.curTask = i;
                    break;
                } else {
                    this.curTask = i + 1;
                }
            }
            this.imgFire.visible = this.curTask == 0;
            let aniName = this.curTask >= 7 ? "fire3" : this.curTask >= 3 ? "fire2" : "fire1";
            if (this.curTask >= 1 && !this.aniFire) {
                this.aniFire = clientCore.BoneMgr.ins.play("res/animate/luluCamping/campfire.sk", aniName, true, this.boxFire);
                this.aniFire.pos(310, 465);
            } else if (this.aniFire) {
                this.aniFire.play(aniName, true);
            }
            this.btnTask.visible = this.curTask < 7;
            if (this.curTask == this.taskInfo.length) {//任务全部完成
                this.line_lulu.visible = this.line_luna.visible = this.line_lusha.visible = this.alert.visible = false;
                this.moon.pos(972, 89);
                this.bg2.visible = false;
            } else {
                let alertPos = [{ x: 980, y: 230 }, { x: 447, y: 188 }, { x: 810, y: 160 }];
                let flag = this.curTask % 3;
                this.line_lulu.visible = flag == 0;
                this.line_lusha.visible = flag == 1;
                this.line_luna.visible = flag == 2;
                this.alert.pos(alertPos[flag].x, alertPos[flag].y);
                this.alert.visible = true;
                this.bg2.visible = true;
                let moonPos = [{ x: 0, y: 89 }, { x: 243, y: 24 }, { x: 486, y: 0 }, { x: 729, y: 24 }];
                flag = Math.floor(this.curTask / 2);
                this.moon.pos(moonPos[flag].x, moonPos[flag].y);
            }
        }

        /**领取每日奖励 */
        private getDailyReward() {
            if (this._msg.dailyReward == 1) return;
            net.sendAndWait(new pb.cs_get_lulu_camping_daily_reward()).then((msg: pb.sc_get_lulu_camping_daily_reward) => {
                if (msg.items && msg.items.length > 0) {
                    alert.showReward(msg.items);
                    this._msg.dailyCounts += msg.items[0].cnt;
                    this.labDaily.text = "" + this._msg.dailyCounts;
                } else {
                    alert.showFWords("今日获取木柴已达上限");
                }
                this._msg.dailyReward = 1;
                this.imgGet.visible = true;
                util.RedPoint.reqRedPointRefresh(25802);
            })
        }

        /**打开任务面板 */
        private openTask() {
            clientCore.Logger.sendLog('2021年4月16日活动', '【主活动】露露的露营', '点击营火维护按钮');
            if (!this.taskPanel) this.taskPanel = new CampingTaskPanel();
            this.taskPanel.show(this.curTask, this.taskInfo[this.curTask]);
        }

        /**打开故事书 */
        private openStory() {
            clientCore.Logger.sendLog('2021年4月16日活动', '【主活动】露露的露营', '点击露娜的故事书按钮');
            if (!this.storyPanel) this.storyPanel = new CampingStoryPanel();
            this.storyPanel.show(this.curTask);
        }

        /**打开小游戏 */
        private openGame() {
            clientCore.Logger.sendLog('2021年4月16日活动', '【主活动】露露的露营', '点击砍树训练按钮');
            clientCore.ToolTip.gotoMod(176, "5");
        }

        /**试穿服装 */
        private trySuit() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110338);
        }

        /**帮助说明 */
        private showRule() {
            clientCore.Logger.sendLog('2021年4月16日活动', '【主活动】露露的露营', '点击活动规则按钮');
            alert.showRuleByID(1148);
        }

        /**播放相关剧情 */
        private playAnimation() {
            clientCore.AnimateMovieManager.showAnimateMovie(80517, null, null);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTask, Laya.Event.CLICK, this, this.openTask);
            BC.addEvent(this, this.btnDaily, Laya.Event.CLICK, this, this.getDailyReward);
            BC.addEvent(this, this.btnStory, Laya.Event.CLICK, this, this.openStory);
            BC.addEvent(this, this.btnGame, Laya.Event.CLICK, this, this.openGame);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            EventManager.on("CAMPING_TASK_REFRESH", this, this.checkTask);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("CAMPING_TASK_REFRESH", this, this.checkTask);
        }

        destroy() {
            this.taskPanel?.destroy();
            this.taskPanel = null;
            this.aniMoon.dispose();
            this.aniMoon = null;
            this.aniFire?.dispose();
            this.aniFire = null;
            this.storyPanel?.destroy();
            this.storyPanel = null;
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
        }
    }
}