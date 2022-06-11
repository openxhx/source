namespace countdownBlessing {
    const SUIT_ID: number = 2110221;
    const GLOBAL_REWARD: number = 5000213;
    const COIN_ID: number = 9900117;
    /**
     * 倒数计时的祝福
     * countdownBlessing.CountdownBlessingModule
     * 2020.12.31
     */
    export class CountdownBlessingModule extends ui.countdownBlessing.CountdownBlessingModuleUI {
        private clockPanel: ClockPanel;
        private _info: pb.sc_get_barrage_all_info;
        private globalCondition: number;
        private _waiting: boolean;
        private _hanabi: clientCore.Bone;
        init(d: any) {
            this.globalCondition = channel.ChannelControl.ins.isOfficial ? 50000 : 50000;
            this.labMaxCnt.text = "/" + this.globalCondition;
            this.labMax.text = "5万大奖"
            this.addPreLoad(xls.load(xls.commonAward));
            this.addPreLoad(xls.load(xls.blessOfGodness));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_barrage_all_info()).then((data: pb.sc_get_barrage_all_info) => {
                this._info = data;
            }));
            this.labInput.maxChars = 30;
            this.boxColors.visible = this.imgBlessing.visible = this.imgGou.visible = false;
            this.imgFemale.visible = clientCore.LocalInfo.sex == 1;
            this.imgMale.visible = clientCore.LocalInfo.sex == 2;
            this.listReward.renderHandler = new Laya.Handler(this, this.listRender);
            this.listColors.vScrollBarSkin = "";
            this.listColors.renderHandler = new Laya.Handler(this, this.blessingRender);
            this.listColors.mouseHandler = new Laya.Handler(this, this.blessingMouse);
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
        }

        private blessingRender(item: ui.countdownBlessing.render.BlessingImgRenderUI) {
            let data: xls.blessOfGodness = item.dataSource;
            item.icon.skin = `res/blessing/${data.id}.png`;
        }

        private blessingMouse(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let data: xls.blessOfGodness = this.listColors.getCell(index).dataSource;
                this.imgBlessing.skin = `res/blessing/${data.id}.png`;
                this.imgBlessing.dataSource = data.id;
            }
        }

        private listRender(item: ui.countdownBlessing.render.BlessingRewardItemUI) {
            let data: xls.commonAward = item.dataSource;
            item.box3.visible = data.num.v2 == 3;
            item.box6.visible = data.num.v2 == 6;
            item.box9.visible = data.num.v2 == 9;
            item.box12.visible = data.num.v2 == 12;
            item.labCondition.text = data.num.v2 + "次";
            item.btnGet.visible = this._info.sCnt >= data.num.v2 && !this._info.cReward.includes(data.id);
            item["imgEgg" + data.num.v2].visible = !this._info.cReward.includes(data.id);
            item["boxOpen" + data.num.v2].visible = this._info.cReward.includes(data.id);
            BC.addEvent(this, item.btnGet, Laya.Event.CLICK, this, this.getReward, [1, data.id]);
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年12月31日活动', '【活动】倒计时的祝福', '打开活动面板');
            this._hanabi = clientCore.BoneMgr.ins.play("res/animate/countdownBlessing/fireworks.sk", "animation", true, this.panelBlessing);
            this._hanabi.pos(350, 460);
            let reward = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == 108 });
            this.listReward.array = reward;
            this.listColors.array = xls.get(xls.blessOfGodness).getValues();
            // this.listColors.repeatY
            if (this._info.stime + 60 <= clientCore.ServerManager.curServerTime) this.sendCd = 0;
            else this.sendCd = 60 - clientCore.ServerManager.curServerTime + this._info.stime;
            this._blessingInfo = this._info.barrages;
            this._newBlessingInfo = [];
            this.lineLimit = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.setSendCd();
            this.setUI();
            this.updataClock();
            this.showNext();
            if (this._info.rpNick != "") {
                this.labName.text = this._info.rpNick;
                this.redbox.visible = true;
            } else {
                this.redbox.visible = false;
            }
            Laya.timer.loop(1000, this, this.onTime);
            Laya.timer.loop(20, this, this.onFrame);
        }

        private setUI() {
            this.labCost.text = "x" + (1 - this._info.free);
            this.labSendCnt.text = "" + this._info.sCnt;
            this.labCurCnt.text = "" + this._info.tCnt;
            this.btnGet.visible = this._info.allReward == 1;
            this.imgGot.visible = this._info.allReward == 2;
            this.boxProgress.visible = this._info.tCnt < this.globalCondition;
            this.labGlobleReward.visible = !this.boxProgress.visible;
        }

        private setSendCd() {
            if (this.sendCd < 0) this.sendCd = 0;
            if (this.sendCd >= 10) this.labTime.text = "00:" + this.sendCd;
            else this.labTime.text = "00:0" + this.sendCd;
        }

        private updataClock() {
            this.labClockCnt.text = "" + clientCore.ItemsInfo.getItemNum(COIN_ID);
        }

        //#region 弹幕展示
        private _blessingPool: ui.countdownBlessing.render.BlessingItemUI[];
        private sendCd: number;
        private _blessingInfo: pb.IBarrage[];
        private _newBlessingInfo: pb.IBarrage[];
        private curShowIndex: number = 0;
        private lineLimit: number[];
        private showNext() {
            if (this._blessingInfo.length == 0 && this._newBlessingInfo.length == 0) return;
            let item = this.getBlessingItem();
            let info: pb.IBarrage;
            if (this._newBlessingInfo && this._newBlessingInfo.length > 0) {
                info = this._newBlessingInfo.shift();
                this._blessingInfo.unshift(info);
            }
            else {
                if (this.curShowIndex >= this._blessingInfo.length) this.curShowIndex = 0;
                info = this._blessingInfo[this.curShowIndex];
            }
            this.curShowIndex++;
            if (info.type == 1) {
                item.icon.visible = false;
                item.txt.text = info.content;
                item.txt.color = info.sUid == clientCore.LocalInfo.uid ? "#ff94ab" : "#5deaff";
                item.width = info.content.length * 25 + 50;
            } else {
                item.icon.visible = true;
                item.icon.skin = `res/blessing/${info.content}.png`;
                item.txt.text = "";
                item.width = 500;
            }
            for (let i: number = 0; i < this.lineLimit.length; i++) {
                if (this.lineLimit[i] == 0) {
                    item.pos(750, i * 50);
                    this.lineLimit[i] = item.width;
                    break;
                }
            }
            Laya.timer.once(500, this, this.showNext);
        }

        private getBlessingItem(): ui.countdownBlessing.render.BlessingItemUI {
            if (!this._blessingPool) this._blessingPool = [];
            for (let i: number = 0; i < this._blessingPool.length; i++) {
                if (!this._blessingPool[i].visible) {
                    this._blessingPool[i].visible = true;
                    return this._blessingPool[i];
                }
            }
            let item = new ui.countdownBlessing.render.BlessingItemUI();
            this.panelBlessing.addChild(item);
            this._blessingPool.push(item);
            item.pos(800, 0);
            return item;
        }
        //#endregion

        /**领取奖励
         * 1次数奖励 2全服奖励 3红包
         */
        private getReward(type: 1 | 2 | 3, id?: number) {
            if (this._waiting) return;
            this._waiting = true;
            net.sendAndWait(new pb.cs_get_barrage_gift_bag({ type: type, id: id })).then((data: pb.sc_get_barrage_gift_bag) => {
                if (data.ans == 0) {
                    alert.showReward(data.items);
                    if (type == 1) {
                        this._info.cReward.push(id);
                        this.listReward.refresh();
                        util.RedPoint.reqRedPointRefresh(21801);
                    }
                    else if (type == 2) {
                        this.btnGet.visible = false;
                        this.imgGot.visible = true;
                        this._info.allReward = 2;
                        util.RedPoint.reqRedPointRefresh(21802);
                    }
                    else if (type == 3) this.redbox.visible = false;
                } else {
                    if (type == 3) alert.showFWords("来晚一步");
                }
                this._waiting = false;
            }).catch(() => {
                this._waiting = false;
            })
        }

        /**发送弹幕
         * 1普通 2炫彩
         * 炫彩弹幕内容传配置id
         */
        private sendBlessing() {
            if (!this.imgGou.visible && this._info.free == 0 && clientCore.ItemsInfo.getItemNum(COIN_ID) == 0) {
                alert.showSmall("祝福时钟不足，是否前往获得？", { callBack: { funArr: [this.getClock], caller: this } });
                return;
            }
            if (this.imgGou.visible && clientCore.ItemsInfo.getItemNum(9900003) < 10) {
                alert.showSmall("灵豆不足，是否前往补充？", { callBack: { funArr: [() => { clientCore.ToolTip.gotoMod(50); }], caller: this } });
                return;
            }
            if (this._waiting) return;
            if (this.imgGou.visible) {
                if (!this.imgBlessing.dataSource) {
                    alert.showFWords("请先选择一句祝福语！");
                    return;
                }
                alert.showSmall("是否花费10灵豆发送炫彩祝福？", { callBack: { funArr: [this.sureSend], caller: this } });
            } else {
                if (this.labInput.text == "") {
                    alert.showFWords("请先写一句祝福语！");
                    return;
                }
                this.sureSend();
            }
        }

        private sureSend() {
            this._waiting = true;
            let type = this.imgGou.visible ? 2 : 1;
            let content = "";
            if (type == 1) content = this.labInput.text;
            else content = "" + this.imgBlessing.dataSource;
            net.sendAndWait(new pb.cs_send_barrage({ content: content, type: type })).then((data: pb.sc_send_barrage) => {
                this.sendCd = 60;
                this.btnSend.disabled = true;
                if (type == 1) this._info.free = 0;
                this._info.sCnt++;
                this.imgBlessing.skin = "";
                this.imgBlessing.dataSource = null;
                this.labInput.text = "";
                this.labLimit.text = "0/30";
                this.updataClock();
                this.setUI();
                this.listReward.refresh();
                this._waiting = false;
            }).catch(() => {
                this._waiting = false;
            })
        }

        /**收到新弹幕 */
        private onGetBlessing(msg: pb.sc_barrage_notify) {
            for (let i: number = 0; i < msg.barrages.length; i++) {
                if (msg.barrages[i].sUid == clientCore.LocalInfo.uid) {
                    this._newBlessingInfo.unshift(msg.barrages[i]);
                } else {
                    this._newBlessingInfo.push(msg.barrages[i]);
                }
            }
            this._info.tCnt = msg.tCnt;
            this.labCurCnt.text = "" + msg.tCnt;
        }

        /**收到红包 */
        private onGetRedpacket(msg: pb.sc_barrage_red_packet_appear_notify) {
            this.labName.text = msg.rpNick;
            this.redbox.visible = true;
        }

        /**红包消失 */
        private onRedpacketDisappear() {
            this.redbox.visible = false;
        }

        /**试穿套装 */
        private onTry() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', SUIT_ID);
        }

        /**帮助说明 */
        private onDetail() {
            alert.showRuleByID(1121);
        }

        /**排行榜 */
        private onRank() {
            this.destroy();
            clientCore.Logger.sendLog('2020年12月31日活动', '【活动】倒计时的祝福', '点击炫彩祝福排行榜');
            clientCore.ModuleManager.open('countdownBlessing.CountdownBlessingRankModule', null, { openWhenClose: 'countdownBlessing.CountdownBlessingModule' });
        }

        /**炫彩弹幕选择 */
        private selectColorsBlessing() {
            this.imgGou.visible = !this.imgGou.visible;
            this.boxColors.visible = this.imgBlessing.visible = this.imgGou.visible;
            if (this.imgGou.visible) {
                this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(9900003);
                this.labCost.text = "x10";
                this.labInput.text = "";
                this.labLimit.text = "0/30";
                this.labInput.mouseEnabled = false;
            } else {
                this.imgCost.skin = clientCore.ItemsInfo.getItemIconUrl(9900117);
                this.labCost.text = "x" + (1 - this._info.free);
                this.imgBlessing.skin = "";
                this.imgBlessing.dataSource = null;
                this.labInput.mouseEnabled = true;
            }
        }

        /**获取时钟 */
        private getClock() {
            if (!this.clockPanel) this.clockPanel = new ClockPanel();
            clientCore.DialogMgr.ins.open(this.clockPanel);
            // this.clockPanel.once(Laya.Event.CLOSE, this, this.updataClock);
        }

        /**祝福字数更新 */
        private updataBlessing() {
            this.labLimit.text = this.labInput.text.length + "/30";
        }

        private onTime() {
            if (this.sendCd > 0) {
                this.btnSend.disabled = this.sendCd > 1;
                this.sendCd--;
                this.setSendCd();
            }
        }

        private onFrame() {
            if (!this._blessingPool) return;
            //速度最低为4/20毫秒 可以上调
            let speed = 4;
            for (let i: number = 0; i < this._blessingPool.length; i++) {
                if (this._blessingPool[i].visible && this._blessingPool[i].x <= 750) {
                    this._blessingPool[i].x -= speed;
                    if (this._blessingPool[i].x < -this._blessingPool[i].width) {
                        this._blessingPool[i].visible = false;
                        this._blessingPool[i].x = 800;
                    }
                }
            }
            for (let i: number = 0; i < this.lineLimit.length; i++) {
                if (this.lineLimit[i] > 0) {
                    this.lineLimit[i] -= speed;
                    if (this.lineLimit[i] < 0) this.lineLimit[i] = 0;
                }
            }
        }

        addEventListeners() {
            net.listen(pb.sc_barrage_notify, this, this.onGetBlessing);
            net.listen(pb.sc_barrage_red_packet_appear_notify, this, this.onGetRedpacket);
            net.listen(pb.sc_barrage_red_packet_disappear_notify, this, this.onRedpacketDisappear);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnGuanbi, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnRank, Laya.Event.CLICK, this, this.onRank);
            BC.addEvent(this, this.btnSend, Laya.Event.CLICK, this, this.sendBlessing, [1]);
            BC.addEvent(this, this.boxColor, Laya.Event.CLICK, this, this.selectColorsBlessing);
            BC.addEvent(this, this.redbox, Laya.Event.CLICK, this, this.getReward, [3]);
            BC.addEvent(this, this.btnAddClock, Laya.Event.CLICK, this, this.getClock);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward, [2]);
            BC.addEvent(this, this.labInput, Laya.Event.INPUT, this, this.updataBlessing);
            EventManager.on("BLESSING_FREASH_COIN", this, this.updataClock);
        }

        removeEventListeners() {
            net.unListen(pb.sc_barrage_notify, this, this.onGetBlessing);
            net.unListen(pb.sc_barrage_red_packet_appear_notify, this, this.onGetRedpacket);
            net.unListen(pb.sc_barrage_red_packet_disappear_notify, this, this.onRedpacketDisappear);
            Laya.timer.clearAll(this);
            BC.removeEvent(this);
            EventManager.off("BLESSING_FREASH_COIN", this, this.updataClock);
        }

        destroy() {
            super.destroy();
            if (this._blessingPool) {
                for (let i: number = 0; i < this._blessingPool.length; i++) {
                    this._blessingPool[i].destroy();
                }
            }
            this._hanabi.dispose();
            this._hanabi = null;
            this._blessingPool = null;
            this._blessingInfo = null;
            this._info = null;
            this._newBlessingInfo = null;
            clientCore.UIManager.releaseCoinBox();
        }
    }
}