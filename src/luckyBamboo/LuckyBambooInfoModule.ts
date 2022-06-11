namespace luckyBamboo {
    export class LuckyBambooInfoModule extends ui.luckyBamboo.LuckyBambooInfoModuleUI {
        private _model: LuckyBambooModel;
        private _control: LuckyBambooControl;
        private _waiting: boolean;
        /**随机出来的奖励 */
        private dailyReward: pb.IItem[];
        /**是否已浇水 */
        private isWater: number;
        /**离线升级奖励 */
        private offLineReward: pb.IItem[];
        /**升级信息面板 */
        private levelPanel: LuckyBambooLevelPanel;
        /**好友面板 */
        private friendPanel: LuckyBambooFriendPanel;
        /**祈愿消耗面板 */
        private vowCosePanel: LuckyBambooVowCostPanel;
        /**祈愿内容面板 */
        private vowPanel: LuckyBambooVowPanel;
        /**奖励信息面板 */
        private _rewardPanel: LuckyBambooRewardPanel;
        /**祈愿牌坐标 */
        private vowPos: { x: number, y: number }[] = [{ x: 300, y: 507 }, { x: 300, y: 444 }, { x: 300, y: 426 }, { x: 298, y: 391 }, { x: 295, y: 297 }, { x: 294, y: 297 }, { x: 296, y: 268 }, { x: 318, y: 282 }];
        /**祈愿牌动画 */
        private vowAni: clientCore.Bone;
        /**竹叶动画 */
        private leafAni: clientCore.Bone;
        /**是否拥有幸运竹 */
        private isGot: boolean;
        /**名字 */
        private _hostName: string;
        constructor() {
            super();
        }

        init(data: any) {
            if (!data) data = parseInt(clientCore.MapInfo.mapData);
            this.sign = clientCore.CManager.regSign(new LuckyBambooModel(), new LuckyBambooControl());
            this._control = clientCore.CManager.getControl(this.sign) as LuckyBambooControl;
            this._model = clientCore.CManager.getModel(this.sign) as LuckyBambooModel;
            this._model.curUid = data;
            this.addPreLoad(xls.load(xls.luckBamboo));
            this.addPreLoad(this.getEventInfo());
            this.addPreLoad(res.load("res/animate/luckyBamboo/qiyuan.png"));
            this.addPreLoad(res.load("res/animate/luckyBamboo/heartleaves.png"));
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect);
            this.boxReward.visible = false;
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
        }

        async getEventInfo() {
            let msg: pb.sc_luck_bamboo_self_panel | pb.sc_luck_bamboo_other_panel;
            if (this._model.curUid == clientCore.LocalInfo.uid) {
                msg = await this._control.getSelfInfo();
                this.isWater = 1;//自己不能给自己浇水
                this.offLineReward = msg.UpItems;
            } else {
                msg = await this._control.getOtherInfo(this._model.curUid);
                this.isWater = msg.waterflag;
            }
            this._model.allExp = msg.growth;
            this.dailyReward = msg.items;
            this.isGot = msg.flag == 1;
            this._model.limit = msg.limit;
            this._model.allVow = msg.plateInfo;
        }

        async onPreloadOver() {
            clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '打开活动面板');
            this.vowAni = clientCore.BoneMgr.ins.play("res/animate/luckyBamboo/qiyuan.sk", "animation", true, this.boxBamboo);
            this.leafAni = clientCore.BoneMgr.ins.play("res/animate/luckyBamboo/heartleaves.sk", "leaves", true, this.boxBamboo);
            this.leafAni.pos(299, 566);
            this._model.getGrowInfo();
            this._model.getBambooInfo();
            if (this._model.curUid == clientCore.LocalInfo.uid) this.labName.text = clientCore.LocalInfo.userInfo.nick;
            else this.labName.text = clientCore.FriendManager.instance.getFriendInfoById(this._model.curUid).userBaseInfo.nick;
            this.updataUI();
            this.btnGift.visible = this.dailyReward && this.dailyReward.length > 0 && !!this.dailyReward[0].id;
        }

        popupOver() {
            if (!this.isGot) {
                this.mouseEnabled = false;
                net.sendAndWait(new pb.cs_luck_bamboo_get_seed()).then((msg: pb.sc_luck_bamboo_get_seed) => {
                    alert.showReward(msg.items, "", {
                        callBack: {
                            caller: this, funArr: [() => {
                                alert.showSmall("是否要将幸运竹·萌发放置到家园中？放置后，即可点击培养它哦~", {
                                    callBack: {
                                        caller: this, funArr: [() => {
                                            clientCore.DialogMgr.ins.closeAllDialog();
                                            clientCore.ModuleManager.closeAllOpenModule();
                                            clientCore.MapEditorManager.getInstance().showUI(2, 'ui');
                                            return;
                                        }]
                                    }
                                })
                            }]
                        }
                    });
                    this.mouseEnabled = true;
                }).catch(() => {
                    clientCore.DialogMgr.ins.closeAllDialog();
                    clientCore.ModuleManager.closeAllOpenModule();
                    return;
                });
            }
            if (this.offLineReward && this.offLineReward.length > 0 && !!this.offLineReward[0].id) {
                alert.showReward(this.offLineReward);
            }
        }

        private updataUI() {
            for (let i: number = 0; i <= this._model.maxLevel; i++) {
                this["imgLv" + i].visible = i == this._model.curLevel;
                this["imgVow" + i].visible = this._model.curLevel == this._model.maxLevel && this._model.allVow[i]?.uid;
            }
            for (let i: number = 8; i < 10; i++) {
                this["imgVow" + i].visible = this._model.curLevel == this._model.maxLevel && this._model.allVow[i]?.uid;
            }
            this.btnWater.visible = this._model.curLevel < this._model.maxLevel && this.isWater == 0;
            this.boxLv.visible = this._model.curLevel < this._model.maxLevel && this._model.curUid == clientCore.LocalInfo.uid;
            if (this.boxLv.visible) {
                this.labLv.value = "" + this._model.curLevel;
                this.labCoinCount.text = "" + clientCore.ItemsInfo.getItemNum(this._model.coinId);
                this.labExp.text = "" + this._model.curExp;
                this.labExpMax.text = "/" + this._model.curExpPool;
                // this.imgMask.width = (this._model.curExp / this._model.curExpPool) * 235;
                this.imgExp.width = (this._model.curExp / this._model.curExpPool) * 234;
                let nextReward = this._model.growInfo.get(this._model.curLevel + 1).reward;
                this.list.repeatX = nextReward.length;
                this.list.array = nextReward;

            }
            this.vowAni?.pos(this.vowPos[this._model.curLevel].x, this.vowPos[this._model.curLevel].y);
            this.labTalk.text = this._model.curLevel == this._model.maxLevel ? "点击幸运竹来许愿吧！" : "去给好友的幸运竹浇浇水吧~";
        }

        private listSelect(index: number) {
            if (index == -1) return;
            let reward: xls.pair = this.list.array[index];
            if (reward) {
                clientCore.ToolTip.showTips(this.list.cells[index], { id: reward.v1 });
            };
            this.list.selectedIndex = -1;
        }

        private listRender(item: ui.commonUI.item.RewardItemUI) {
            let reward: xls.pair = item.dataSource;
            clientCore.GlobalConfig.setRewardUI(item, { id: reward.v1, cnt: reward.v2, showName: false });
        }

        /**浇水 */
        private async waterBamboo(type: number) {
            if (this._waiting) return;
            this._waiting = true;
            let msg;
            if (this._model.curUid == clientCore.LocalInfo.uid) {
                msg = await this._control.waterSelf(type);
                if (msg) {
                    let ani = clientCore.BoneMgr.ins.play("res/animate/luckyBamboo/jindutiao.sk", "xiao", false, this.boxLv);
                    ani.pos(184, 50);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                    })
                }
            } else {
                msg = await this._control.waterOther(this._model.curUid);
                if (msg) {
                    let ani = clientCore.BoneMgr.ins.play("res/animate/luckyBamboo/heartleaves.sk", "heart", false, this.boxBamboo);
                    ani.pos(299, 566);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                    })
                    if (!msg.items || msg.items.length == 0) {
                        alert.showFWords("今日浇水获得幸运珠已达上限！");
                        this.btnWater.visible = false;
                        this._waiting = false;
                        return;
                    }
                }
            }
            if (msg) {
                let arr: pb.IItem[] = [];
                for (const info of msg.items) {
                    if (info.id == this._model.growId) {
                        if (this._model.curUid == clientCore.LocalInfo.uid) {
                            this._model.allExp += info.cnt;
                        }
                        if (info.cnt == 0) {
                            alert.showFWords("自己的幸运竹已满级~");
                        } else {
                            alert.showFWords(`获得${info.cnt}点幸运竹经验`);
                        }
                    }
                    else arr.push(info);
                }
                if (arr.length > 0) alert.showReward(arr);
                if (type == 1) this.isWater = 1;
                this._model.getBambooInfo();
                this.updataUI();
            }
            this.btnWater.visible = false;
            this._waiting = false;
        }

        /**每日奖励 */
        private async getReward() {
            if (this._waiting) return;
            this._waiting = true;
            let msg = await this._control.getDailyeward(this._model.curUid);
            if (msg) {
                alert.showReward(msg.items);
            }
            this.btnGift.visible = false;
            this._waiting = false;
        }

        /**点击竹子 */
        private onBambooClick(idx: number) {
            if (this._model.curUid == clientCore.LocalInfo.uid) {
                if (idx < this._model.maxLevel) {
                    if (!this.levelPanel) this.levelPanel = new LuckyBambooLevelPanel(this.sign);
                    this.levelPanel.show();
                } else {
                    if (!this.vowCosePanel) this.vowCosePanel = new LuckyBambooVowCostPanel(this.sign);
                    this.vowCosePanel.show();
                }
            } else if (idx < this._model.maxLevel) {
                return;
            } else if (this._model.limit == 0) {
                alert.showFWords("该好友暂不允许他人祈愿~");
                return;
            } else if (this.checkVowNum() == 10) {
                alert.showFWords("该好友处的祈愿已挂满~");
                return;
            } else {
                let info = _.find(this._model.allVow, (o) => { return o?.uid == clientCore.LocalInfo.uid });
                if (info) {
                    alert.showFWords("已在该好友处祈愿过了~");
                    return;
                }
                if (!this.vowCosePanel) this.vowCosePanel = new LuckyBambooVowCostPanel(this.sign);
                this.vowCosePanel.show();
            }
        }

        private checkVowNum() {
            let curVowNum = 0;
            for (let i: number = 0; i < 10; i++) {
                if (this._model.allVow[i] && this._model.allVow[i].uid) {
                    curVowNum++;
                }
            }
            return curVowNum;
        }

        /**打开好友面板 */
        private async openFriendPanel() {
            clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '点击逛一逛按钮');
            if (!this.friendPanel) this.friendPanel = new LuckyBambooFriendPanel();
            if (this._waiting) return;
            this._waiting = true;
            net.sendAndWait(new pb.cs_luck_bamboo_have_bamboo_list()).then((msg: pb.sc_luck_bamboo_have_bamboo_list) => {
                this.friendPanel.show(_.filter(msg.list, (o) => { return o.uid != this._model.curUid }));
                this._waiting = false;
            }).catch(() => {
                this._waiting = false;
            })
        }

        /**打开祈愿面板 */
        private openVowPanel(type: "write" | "check" | "other", index: number) {
            if (!this.vowPanel) this.vowPanel = new LuckyBambooVowPanel(this.sign);
            if (type == "check" && this._model.curUid != clientCore.LocalInfo.uid) type = "other";
            this.vowPanel.show(type, index);
        }

        /**奖励面板 */
        private openRewardPanel() {
            if (!this._rewardPanel) this._rewardPanel = new LuckyBambooRewardPanel();
            clientCore.DialogMgr.ins.open(this._rewardPanel);
        }

        /**显示幸运竹tip */
        private showCoinTip() {
            clientCore.ToolTip.showTips(this.imgCoin, { id: this._model.coinId });
        }

        /**试穿套装 */
        private previewSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2110200);
        }

        /**奖励总览 */
        private async preReward() {
            let rewardInfo: clientCore.RewardDetailInfo = new clientCore.RewardDetailInfo();
            for (let i: number = 0; i < this._model.growInfo.length; i++) {
                let reward = this._model.growInfo.get(i).reward;
                for (let j: number = 0; j < reward.length; j++) {
                    if (xls.get(xls.itemCloth).has(reward[j].v1)) rewardInfo.rewardArr[3].push(reward[j].v1);
                    else rewardInfo.rewardArr[4].push(reward[j].v1);
                }
            }
            clientCore.Logger.sendLog('2020年12月4日活动', '【主活动】幸运竹', '打开全部奖励一览面板');
            clientCore.ModuleManager.open("rewardDetail.RewardDetailModule", rewardInfo);
        }

        /**展示升级奖励 */
        private showLvReward() {
            this.boxReward.visible = true;
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onStageClick);
        }

        private onStageClick() {
            if (this.boxReward.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY)) {
                return;
            }
            if (this.imgGift.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY))
                return;
            this.hideLvReward();
        }

        /*隐藏升级奖励 */
        private hideLvReward() {
            BC.removeEvent(this, this, Laya.Event.CLICK, this, this.onStageClick);
            this.boxReward.visible = false;
        }

        private onClose() {
            if (this._model.curUid != clientCore.LocalInfo.uid && parseInt(clientCore.MapInfo.mapData) == clientCore.LocalInfo.uid) {
                clientCore.DialogMgr.ins.closeAllDialog();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open("luckyBamboo.LuckyBambooInfoModule", clientCore.LocalInfo.uid);
            } else {
                this.destroy();
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnWater, Laya.Event.CLICK, this, this.waterBamboo, [1]);
            BC.addEvent(this, this.btn_zhuru, Laya.Event.CLICK, this, this.waterBamboo, [2]);
            BC.addEvent(this, this.btnGift, Laya.Event.CLICK, this, this.getReward);
            BC.addEvent(this, this.btnGuang, Laya.Event.CLICK, this, this.openFriendPanel);
            BC.addEvent(this, this.imgCoin, Laya.Event.CLICK, this, this.showCoinTip);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.previewSuit);
            BC.addEvent(this, this.btnPreAll, Laya.Event.CLICK, this, this.preReward);
            BC.addEvent(this, this.imgGift, Laya.Event.CLICK, this, this.showLvReward);
            for (let i = 0; i <= 7; i++) {
                BC.addEvent(this, this["imgLv" + i], Laya.Event.CLICK, this, this.onBambooClick, [i]);
                BC.addEvent(this, this["imgVow" + i], Laya.Event.CLICK, this, this.openVowPanel, ["check", i]);
            }
            for (let i = 8; i <= 9; i++) {
                BC.addEvent(this, this["imgVow" + i], Laya.Event.CLICK, this, this.openVowPanel, ["check", i]);
            }
            EventManager.on("UPDATA_BAMBOO_INFO", this, this.updataUI);
            EventManager.on("OPEN_VOW_PANEL", this, this.openVowPanel);
            EventManager.on("LUCKYBAMBOO_REWARD_OPEN", this, this.openRewardPanel);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off("UPDATA_BAMBOO_INFO", this, this.updataUI);
            EventManager.off("OPEN_VOW_PANEL", this, this.openVowPanel);
            EventManager.off("LUCKYBAMBOO_REWARD_OPEN", this, this.openRewardPanel);
        }

        destroy() {
            super.destroy();
            this.leafAni?.dispose();
            this.vowAni?.dispose();
            this.vowPanel?.destroy();
            this.levelPanel?.destroy();
            this.friendPanel?.destroy();
            this._rewardPanel?.destroy();
            this.vowCosePanel?.destroy();
            clientCore.CManager.unRegSign(this.sign);
            this.leafAni = this._model = this._control = this.vowCosePanel = this._rewardPanel = this.friendPanel = this.levelPanel = this.vowPanel = this.vowAni = null;
        }
    }
}