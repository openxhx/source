namespace christmasShow {
    //圣诞风尚
    // christmasShow.ChristmasShowModule
    export class ChristmasShowModule extends ui.christmasShow.ChristmasShowModuleUI {
        private eventInfo: pb.sc_show_clothing_score;
        private _rankList: clientCore.RankInfo[] = [];
        private person: clientCore.Person;
        private cloths: number[];
        init(data: { newscore: number, cloth: number[], addition1: number, addition2: number, addition3: number , initial:number}) {
            super.init(data);
            this.sideClose = true;
            this.addPreLoad(xls.load(xls.collocationActivity));
            this.addPreLoad(net.sendAndWait(new pb.cs_show_clothing_score()).then((msg: pb.sc_show_clothing_score) => {
                this.eventInfo = msg;
            }))
            this.addPreLoad(clientCore.RankManager.ins.getSrvRank(30).then((data) => {
                this._rankList = data;
            }));
            if (!data) {
                this.addPreLoad(net.sendAndWait(new pb.cs_show_clothing_score_remember({ activityId: 220 })).then((msg: pb.sc_show_clothing_score_remember) => {
                    this.cloths = msg.clothIdList.length == 0 ? clientCore.LocalInfo.wearingClothIdArr : msg.clothIdList;
                }))
            }
        }

        onPreloadOver() {
            this.needOpenMod = "tigerMagic.TigerMagicModule";
            if (!this._data) {
                this._data = { newscore: this.eventInfo.maxScore, cloth: this.cloths, addition1: this.eventInfo.addition1, addition2: this.eventInfo.addition2, addition3: this.eventInfo.addition3 , initial:this.eventInfo.initial};
            }
            this.person = new clientCore.Person(clientCore.LocalInfo.sex, this._data.cloth);
            this.person.scale(0.6, 0.6);
            this.role.addChild(this.person);
            this.labpoint.text = this._data.newscore.toString();
            this.labBase.text = this._data.initial.toString();
            this.labAdd1.text = this._data.addition1.toString();
            this.labAdd2.text = this._data.addition2.toString();
            this.labAdd3.text = this._data.addition3.toString();
            this.boxDetial.visible = true;
            for (let i = 0; i < 3; i++) {
                if (this._rankList[i]) {
                    this["top" + (i + 1)].skin = clientCore.ItemsInfo.getItemIconUrl((this._rankList[i].msg as pb.IRankInfo).userBase.headImage);
                } else {
                    this["top" + (i + 1)].skin = "";
                }
            }
            this.anis = new util.HashMap();
            this.setRewardInfo();
        }

        //#region 奖励情况
        private anis: util.HashMap<clientCore.Bone>;
        private setRewardInfo() {
            let haveItem = clientCore.ItemsInfo.getItemNum(9900001);
            for (let i = 0; i < 6; i++) {
                let item: ui.christmasShow.item.ShowRewardItemUI = this["reward" + i];
                let config = xls.get(xls.collocationActivity).get(i + 1);
                item.imgRed.visible = false;
                item.imgStar.visible = true;
                item.imgStar.skin = this.eventInfo.maxScore >= config.score ? "christmasShow/liang.png" : "christmasShow/an.png";
                item.labPoint.text = `评分：${this.eventInfo.maxScore}/${config.score}`;
                item.labBlessing.text = `仙豆：${haveItem > config.cost[0].v2 ? config.cost[0].v2 : haveItem}/${config.cost[0].v2}`;
                item.imgGot.visible = util.getBit(this.eventInfo.star, i + 1) == 1;
                if (i > 0) {
                    item.labPoint.visible = item.labBlessing.visible = (util.getBit(this.eventInfo.star, i) == 1 && !item.imgGot.visible);
                } else {
                    item.labPoint.visible = item.labBlessing.visible = !item.imgGot.visible;
                }
                if (this.eventInfo.maxScore >= config.score && haveItem >= 10 && item.labPoint.visible) {
                    item.imgRed.visible = true;
                    item.imgStar.visible = false;
                    if (!this.anis.has(i)) {
                        let ani = clientCore.BoneMgr.ins.play("res/animate/chrismasInteract/star.sk", 0, true, item);
                        ani.pos(83, 42);
                        this.anis.add(i, ani);
                    }
                } else if (this.anis.has(i)) {
                    this.anis.remove(i).dispose();
                }
            }
        }
        private rewardClick(idx: number) {
            if (idx > 0 && util.getBit(this.eventInfo.star, idx) == 0) {
                alert.showFWords('前置奖励还未获得~');
                this.showTips(idx);
                return;
            }
            if (clientCore.ItemsInfo.getItemNum(9900001) < 2000) {
                alert.showFWords('仙豆不足~');
                this.showTips(idx);
                return;
            }
            let config = xls.get(xls.collocationActivity).get(idx + 1);
            if (this.eventInfo.maxScore < config.score) {
                alert.showFWords('评分不足~');
                this.showTips(idx);
                return;
            }
            this["reward" + idx].mouseEnabled = false;
            net.sendAndWait(new pb.cs_show_clothing_score_star({ id: idx + 1, activityId: 220 })).then((msg: pb.sc_show_clothing_score_star) => {
                alert.showReward(msg.item);
                this.eventInfo.star = util.setBit(this.eventInfo.star, idx + 1, 1);
                this.setRewardInfo();
                this["reward" + idx].mouseEnabled = true;
                util.RedPoint.reqRedPointRefreshArr([29316, 29314]);
            }).catch(() => {
                this["reward" + idx].mouseEnabled = true;
            })
        }
        private showTips(idx: number) {
            let config = xls.get(xls.collocationActivity).get(idx + 1);
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleProperty : config.maleProperty;
            clientCore.ToolTip.showContentTips(this["reward" + idx], 0, reward);
        }
        //#endregion

        //进入排行榜
        private goRank() {
            clientCore.Logger.sendLog('2022年1月14日活动', '【主活动】齐格飞的布老虎魔法', '点击进入排行榜');
            this.needOpenMod = this.needOpenData = null;
            this.destroy();
            clientCore.ModuleManager.open("eventRank.EventRankModule", null, { openWhenClose: "christmasShow.ChristmasShowModule" });
        }

        //提交当前搭配
        private submitCurShow() {
            clientCore.Logger.sendLog('2022年1月14日活动', '【主活动】齐格飞的布老虎魔法', '点击前往搭配');
            this.needOpenMod = this.needOpenData = null;
            this.destroy();
            clientCore.ModuleManager.open('clothChange.ClothChangeModule', { activity: 220, frist: 2, second: 3, history: this.eventInfo.maxScore });
        }

        /**得分详情 */
        private showDetail() {
            this.boxDetial.visible = !this.boxDetial.visible;
        }

        /**帮助说明 */
        private showHelp() {
            alert.showRuleByID(1233);
        }

        addEventListeners() {
            BC.addEvent(this, this.boxRank, Laya.Event.CLICK, this, this.goRank);
            BC.addEvent(this, this.btnSubmit, Laya.Event.CLICK, this, this.submitCurShow);
            BC.addEvent(this, this.boxScore, Laya.Event.CLICK, this, this.showDetail);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showHelp);
            for (let i = 0; i < 6; i++) {
                BC.addEvent(this, this["reward" + i], Laya.Event.CLICK, this, this.rewardClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.person.destroy();
            for (let i = 0; i < 6; i++) {
                this.anis.remove(i)?.dispose();
            }
            this.anis.clear();
            this.anis = null;
            this.cloths = this.person = this._rankList = null;
            super.destroy();
        }
    }
}