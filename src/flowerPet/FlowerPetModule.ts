namespace flowerPet {
    /**
     * 花宝
     * flowerPet.FlowerPetModule
     */
    export class FlowerPetModule extends ui.flowerPet.FlowerPetModuleUI {

        /** 上一次喂食时间*/
        private _feedTime: number;
        /** 上一次抚摸时间*/
        private _touchTime: number;
        /** 花宝等级*/
        private _petLv: number = -1;
        /** 消息处理*/
        private _sCommand: FlowerPetSCommand;

        private _bone: clientCore.Bone;
        private _nextTypeBone: clientCore.Bone;

        private _gifts: pb.IItemInfo[];

        private _selectIndex: number = -1;

        private _rewards: number[];

        private _imgPanel: ImagePanel;

        /** 随机文字*/
        private _talkArr: string[] = [
            "欢迎回家哦，美丽的小花仙~",
            "等我长大了，就可以送你更好的礼物啦！",
            "我也想跟你一起去看看外面的世界呢~",
            "如果升级到更高级的花宝，就可以帮朋友们照顾花园了哦~"
        ];

        constructor() { super(); }

        public init(data?: any) {
            super.init(data);
            this._sCommand = FlowerPetSCommand.ins;
            this.feedView.ico.skin = "flowerPet/s_y_Feed.png";
            this.petView.txDesc.text = '';
            this.touchView.boxTime.visible = false;
            this.feedView.boxTime.visible = false;
            this.list.selectEnable = true;
            this.list.renderHandler = new Laya.Handler(this, this.listRender, null, false);
            this.list.selectHandler = new Laya.Handler(this, this.listSelect, null, false);
            this.list.array = new Array(3);
            !clientCore.FlowerPetInfo.checkBuyHistory(3) && clientCore.FlowerPetInfo.petType == 2 && data == "show" ? this.ani1.gotoAndStop(this.ani1.count) : this.ani1.gotoAndStop(0);
            this.rewardView.list.renderHandler = Laya.Handler.create(this, this.rewardHandler, null, false);
            this.rewardView.list.mouseHandler = Laya.Handler.create(this, this.rewardMouse, null, false);

            this.addPreLoad(xls.load(xls.babyFree));
            this.addPreLoad(xls.load(xls.babyReward));
            this.addPreLoad(xls.load(xls.babyPay));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_flower_baby_interactive_time()).then((msg: pb.sc_get_flower_baby_interactive_time) => {
                this._feedTime = msg.feedTime;
                this._touchTime = msg.dautTime;
            }))
            this.addPreLoad(net.sendAndWait(new pb.cs_get_flower_baby_reward_status()).then((msg: pb.sc_get_flower_baby_reward_status) => {
                this._rewards = msg.babyTypeList;
                //如果是普通花宝且没有领取的话 则需要前端加入到数组
                if (msg.flag == 0 && clientCore.FlowerPetInfo.petType == 0 && this._rewards.length == 0) {
                    this._rewards.push(0);
                }
                this.rewardView.visible = msg.flag == 0 || this._rewards.length > 0;
                this.btnNextBox.visible = !clientCore.RealManager.ins.isLoginDay(clientCore.ServerManager.curServerTime + 86400) && msg.weekFlag == 0;
            }))
            this.updateView();
            this.petView.imgSuit.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/flowerPet/male.png' : 'unpack/flowerPet/female.png';
        }

        private _tmpX: number = -1;
        private onMouseDown(e: Laya.Event) {
            this._tmpX = e.currentTarget.mouseX;
        }

        private onMouseUp(e: Laya.Event) {
            if (this._tmpX > 0) {
                let nowX = e.currentTarget.mouseX;
                if (Math.abs(nowX - this._tmpX) > 20) {
                    this.changePage(nowX < this._tmpX ? 1 : 0)
                }
                this._tmpX = -1;
            }
        }

        private changePage(page: number) {
            this.privilegeView.listPage.dataSource = page == 1 ? [1, 0] : [0, 1];
            let w = this.privilegeView.panel.width;
            Laya.Tween.to(this.privilegeView.imgContain, { x: -page * w }, 100);
        }

        private setScrollListener(listen: boolean) {
            if (listen) {
                BC.addEvent(this, this.privilegeView.panel, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                BC.addEvent(this, this.privilegeView.panel, Laya.Event.MOUSE_UP, this, this.onMouseUp);
                BC.addEvent(this, this.privilegeView.panel, Laya.Event.ROLL_OUT, this, this.onMouseUp);
            }
            else {
                BC.removeEvent(this, this.privilegeView.panel, Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
                BC.removeEvent(this, this.privilegeView.panel, Laya.Event.MOUSE_UP, this, this.onMouseUp);
                BC.removeEvent(this, this.privilegeView.panel, Laya.Event.ROLL_OUT, this, this.onMouseUp);
            }
        }

        private getNextReward() {
            let days = this.getRewardDays();
            alert.showSmall(`亲爱的玩家，您将会领到下次可登录之前不能登录天数的花宝每日奖励，总计${days.allDay}天，其中特权${days.vipDay}天.`, {
                callBack: {
                    caller: this, funArr: [() => {
                        this.btnNextBox.visible = false;
                        net.sendAndWait(new pb.cs_baby_future_reward({ day: days.allDay, vipDay: days.vipDay })).then((msg: pb.sc_baby_future_reward) => {
                            alert.showReward(msg.item);
                        }).catch(() => {
                            this.btnNextBox.visible = true;
                        })
                    }]
                }
            })
        }

        private getRewardDays(): { vipDay: number, allDay: number } {
            let timeFlag = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) + 86400;
            let allDay = 0;
            let vipDay = 0;
            //总的不能登录日期
            while (!clientCore.RealManager.ins.isLoginDay(timeFlag)) {
                allDay++;
                if (timeFlag <= clientCore.FlowerPetInfo.expireTime) vipDay++;
                timeFlag += 86400;
            }
            return { vipDay: vipDay, allDay: allDay };
        }

        public addEventListeners(): void {
            this.btnShow.visible = clientCore.GlobalConfig.isPayFunctionOpen;
            BC.addEvent(this, this.btnShow, Laya.Event.CLICK, this, this.onShowPrivilege);
            BC.addEvent(this, this.btnFollow, Laya.Event.CLICK, this, this.onFollow);
            BC.addEvent(this, this.touchView, Laya.Event.CLICK, this, this.onTouch);
            BC.addEvent(this, this.feedView, Laya.Event.CLICK, this, this.onFeed);
            BC.addEvent(this, this.btnCookie, Laya.Event.CLICK, this, this.onCookie);
            BC.addEvent(this, this.btnBox, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.privilegeView.btnBuy, Laya.Event.CLICK, this, this.onShop);
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.petView.imgBG, Laya.Event.CLICK, this, this.onTalk);
            BC.addEvent(this, this.btnImage, Laya.Event.CLICK, this, this.openImage);
            BC.addEvent(this, this.btnNextBox, Laya.Event.CLICK, this, this.getNextReward);
            BC.addEvent(this, EventManager, globalEvent.FLOWER_PET_CHANGE, this, this.updatePetInfo);
            net.listen(pb.sc_buy_flower_baby, this, this.onBuyFlowerPet);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
            net.unListen(pb.sc_buy_flower_baby, this, this.onBuyFlowerPet);
        }

        public initOver(): void {
            this.updateCookie();
            this.updatePetInfo(true);
            this.updateFollow();
            this._rewards.length > 0 && this.showRewardBox(this._rewards.shift());
            // this.updatePrivilege(clientCore.FlowerPetInfo.petType);
            let type: number = clientCore.FlowerPetInfo.petType;
            this.list.selectedIndex = Math.min(type, 2);

            this.updateCdTime();
            this.updateExpireTime();
            this.showFlowerPet();
            this.petView.boxBar.visible = clientCore.FlowerPetInfo.petType == 0;
            this.petView.boxTalk.visible = false; //刚进不显示说话内容
            switch (clientCore.FlowerPetInfo.petType) {
                case 0:
                    clientCore.Logger.sendLog('付费系统', '月卡', '打开月卡花宝购买界面')
                    break;
                case 1:
                    clientCore.Logger.sendLog('付费系统', '月卡', '打开季卡花宝购买界面')
                    break;
                case 2:
                    clientCore.Logger.sendLog('付费系统', '月卡', '打开年卡花宝购买界面')
                    break;
                case 3:
                    clientCore.Logger.sendLog('付费系统', '月卡', '打开年卡花宝购买界面')
                    break;
                default:
                    break;
            }
        }

        /**
         * 购买花宝成功通知
         */
        private onBuyFlowerPet(msg: pb.sc_buy_flower_baby): void {
            let currType = clientCore.FlowerPetInfo.petType;
            let now: number = msg.babyType;
            clientCore.FlowerPetInfo.petType = now;
            clientCore.FlowerPetInfo.expireTime = parseInt(msg.babyVipTime);
            clientCore.FlowerPetInfo.addBuyHistory(now);
            this._rewards = msg.babyTypeList;
            this.list.refresh();
            // this.updatePrivilege();
            // this.list.selectedIndex = Math.min(msg.babyVipType,2);
            this.updateExpireTime();
            currType != now && this.updateFlowerPet();
            this.showRewardBox(this._rewards.shift());
            EventManager.event(globalEvent.FLOWER_PET_VIP_CHANGE_NOTICE);
        }

        private listRender(item: ui.flowerPet.item.TabItemUI, index: number): void {
            let type: number = clientCore.FlowerPetInfo.petType;
            item.imgLock.visible = type < index;
            item.cpPet.index = index == this.list.selectedIndex ? 0 : 1;
            item.cpPet.skin = `flowerPet/${['clipqipiao', 'clipshanliang', 'clipshanyao'][index]}.png`;
        }

        private listSelect(index: number): void {
            if (this._selectIndex == index) return;
            let type: number = clientCore.FlowerPetInfo.petType;
            if (type < index) {
                this.list.selectedIndex = this._selectIndex;
                return;
            }
            this._selectIndex = index;
            this.updatePrivilege(index);
        }

        /**
         * 更新到期时间
         */
        private updateExpireTime(): void {
            let isPayPet: boolean = clientCore.FlowerPetInfo.petType != 0;
            this.boxTime.visible = isPayPet;
            if (isPayPet) {
                let t: string = util.TimeUtil.analysicYear(clientCore.ServerManager.curServerTime) + " 00:00:00";
                // let zeroT: number = new Date(t).getTime();
                let zeroT = util.TimeUtil.formatTimeStrToSec(t);
                let diffTime: number = clientCore.FlowerPetInfo.expireTime - zeroT;
                this.txTime.changeText(`${Math.floor(diffTime / 24 / 3600)}`)
            }
        }

        /**
         * 展示特权
         */
        private onShowPrivilege(): void {
            this.ani1.play(0, false);
            this.ani1.wrapMode = this.ani1.wrapMode == Laya.AnimationBase.WRAP_REVERSE ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            this.updateView();
            this.ani1.once(Laya.Event.COMPLETE, this, this.updateView);
        }

        /**更新面板 */
        private updateView() {
            let showDetail = this.privilegeView.y < 500;//是否展示右边的详情
            if (showDetail) {
                let needShowDetail = !clientCore.FlowerPetInfo.checkBuyHistory(3) && clientCore.FlowerPetInfo.petType == 2;
                this.petView.boxSuit.visible = needShowDetail;
                this.petView.boxOther.visible = !needShowDetail;
                this.boxBtn.visible = !needShowDetail;
            }
            else {
                this.petView.boxSuit.visible = false;
                this.petView.boxOther.visible = true;
                this.boxBtn.visible = true;
            }
        }
        /**
         * 更新特权界面信息
         */
        private updatePrivilege(index: number): void {
            // let type: number = Math.min(clientCore.FlowerPetInfo.petType + 1, 3); // 0 1 2 3 
            let type: number = Math.min(index + 1, 3);
            this.privilegeView.imgPrice.skin = `flowerPet/price${index + 1}.png`;
            this.privilegeView.imgSmallTitle.skin = `flowerPet/imgSmallTitle${type}.png`;
            this.privilegeView.imgTitle.skin = `flowerPet/title${type}.png`
            this.privilegeView.imgReward.skin = `flowerPet/rwd${type}.png`;
            this.privilegeView.imgTime.skin = `flowerPet/time${type}.png`;
            this.privilegeView.imgContain.removeChildren();
            // if (type < 2) {
            //     this.privilegeView.imgContain.addChild(new Laya.Image(`unpack/flowerPet/content${type}.png`));
            //     this.privilegeView.listPage.visible = false;
            //     this.setScrollListener(false);
            // }
            // else {
            for (let i = 1; i <= 2; i++) {
                let img = new Laya.Image(`unpack/flowerPet/content${type}_${i}.png`);
                img.x = (i - 1) * this.privilegeView.panel.width;
                this.privilegeView.imgContain.addChild(img);
            }
            this.privilegeView.listPage.visible = true;
            this.privilegeView.listPage.repeatX = 2;
            this.setScrollListener(true);
            this.changePage(0);
            // }
            this.updateView();
            this.showSelectPet(index);
        }

        private privilegeRender(item: ui.commonUI.item.RewardItemUI, index: number): void {
        }

        private privilegeMouse(e: Laya.Event, index: number): void {
        }

        /**
         * 跟随
         */
        private onFollow(): void {
            let type: number = 1 - clientCore.FlowerPetInfo.followStatus;
            this._sCommand.setFollow(type, Laya.Handler.create(this, this.updateFollow));
            clientCore.Logger.sendLog('花宝成长系统', '花宝展示', type == 0 ? '点击花宝收回按钮' : '点击花宝跟随按钮');
        }

        /**
         * 更新花宝信息
         */
        private updatePetInfo(isInit?: boolean): void {
            let array: xls.babyFree[] = xls.get(xls.babyFree).getValues();
            let len: number = array.length;
            let totalExp: number = 0;
            let currLv: number = this._petLv;
            for (let i: number = 0; i < len; i++) {
                let element: xls.babyFree = array[i];
                if (element.exp > clientCore.FlowerPetInfo.freeExp) {
                    totalExp = element.exp;
                    break;
                }
                this._petLv = element.id;
            }
            if (currLv != -1 && currLv != this._petLv) {
                this.updateFlowerPet();
                !isInit && this.showRewardBox(clientCore.FlowerPetInfo.petType);
            }
            this.petView.txLv.changeText(this._petLv + "");
            totalExp = totalExp || clientCore.FlowerPetInfo.freeExp;
            let progress: number = clientCore.FlowerPetInfo.freeExp / totalExp;
            let w: number = 362 * progress;
            this.petView.imgBar.width = w;
            this.petView.imgStar.x = 61 + w;
        }

        private async onTalk(): Promise<void> {
            this.showTalk();
            await this.playAnimate("talk");
            this._bone.play("idle", true);
        }

        /**
         * 打开形象
         */
        private openImage(): void {
            this._imgPanel = this._imgPanel || new ImagePanel();
            this._imgPanel.show();
        }

        /**
         * 花宝形态更新
         */
        private updateFlowerPet(): void {
            //更换花宝 
            this.showFlowerPet();
            //主场景上花宝更换
            // clientCore.PeopleManager.getInstance().player.changeFlowerPet(clientCore.FlowerPetInfo.petType, this._petLv);
            //cd清理
            this._feedTime = this._touchTime = 0;
            this.updateProgress(this.touchView, 1);
            this.updateProgress(this.feedView, 1);
            this.petView.boxBar.visible = clientCore.FlowerPetInfo.petType == 0;
        }

        private showRewardBox(type: number): void {
            //宝箱更新 可以再领
            this.rewardView.visible = true;
            this.showReward(type);
        }

        /**
         * 展示花宝说话
         */
        private showTalk(): void {
            Laya.timer.clear(this, this.onDelay);
            Laya.timer.once(3000, this, this.onDelay);
            this.petView.boxTalk.visible = true;
            this.petView.txDesc.text = this._talkArr[_.random(0, this._talkArr.length - 1)];
        }

        private onDelay(): void {
            this.petView.boxTalk.visible = false;
        }

        private updateCdTime(): void {
            this.onCd();
            Laya.timer.loop(1000, this, this.onCd);
        }

        private onCd(): void {
            let currTime: number = clientCore.ServerManager.curServerTime;
            let feedCd: number = clientCore.FlowerPetInfo.getCd(0, this._petLv) * 60;
            let touchCd: number = clientCore.FlowerPetInfo.getCd(1, this._petLv) * 60;
            let passFeedT: number = currTime - this._feedTime;
            let passTouchT: number = currTime - this._touchTime;
            passFeedT <= feedCd && this.updateProgress(this.feedView, passFeedT / feedCd);
            passTouchT <= touchCd && this.updateProgress(this.touchView, passTouchT / touchCd);

            let restFeedT = feedCd - passFeedT;
            let restTouchT = touchCd - passTouchT;
            if (restFeedT > 0) {
                this.feedView.txtTime.text = util.StringUtils.getDateStr(restFeedT);
                this.feedView.boxTime.visible = true;
            }
            else {
                this.feedView.boxTime.visible = false;
            }

            if (restTouchT > 0) {
                this.touchView.txtTime.text = util.StringUtils.getDateStr(restTouchT);
                this.touchView.boxTime.visible = true;
            }
            else {
                this.touchView.boxTime.visible = false;
            }
        }

        private updateProgress(target: ui.flowerPet.panel.ProgressBarUI, progress: number): void {
            progress = Math.max(0.01, progress)
            let mask: Laya.Sprite = target.bar;
            mask.alpha = 0.5;
            mask.graphics.clear();
            mask.graphics.drawPie(0, 0, 52, -90 + 360 * progress, -90, "#000000");
        }

        private onShop(): void {
            // clientCore.RechargeManager.pay(Math.min(clientCore.FlowerPetInfo.petType + 26, 28)).then((msg) => {
            //     let array: pb.IItem[] = msg.extItms.concat(msg.items);
            //     array.length > 0 && alert.showReward(clientCore.GoodsInfo.createArray(array));
            // })
            clientCore.RechargeManager.pay(Math.min(this._selectIndex + 26, 28)).then((msg) => {
                let array: pb.IItem[] = msg.extItms.concat(msg.items);
                array.length > 0 && alert.showReward(clientCore.GoodsInfo.createArray(array));
            })
        }

        /**
         * 喂食
         */
        private onFeed(): void {
            clientCore.Logger.sendLog('花宝成长系统', '花宝互动', '点击喂食饼干按钮')
            if (clientCore.ServerManager.curServerTime - this._feedTime < clientCore.FlowerPetInfo.getCd(0, this._petLv) * 60) {
                alert.showFWords("喂食CD中~");
                return;
            }
            this._sCommand.interactivePet(1, Laya.Handler.create(this, (msg: pb.sc_flower_baby_interaction) => {
                this._feedTime = msg.time;
                this.waitAnimate("feed", msg.itemInfo);
            }))
        }

        /**
         * 抚摸
         */
        private onTouch(): void {
            clientCore.Logger.sendLog('花宝成长系统', '花宝互动', '点击互动喂食按钮')
            if (clientCore.ServerManager.curServerTime - this._touchTime < clientCore.FlowerPetInfo.getCd(1, this._petLv) * 60) {
                alert.showFWords("抚摸CD中~");
                return;
            }
            this._sCommand.interactivePet(2, Laya.Handler.create(this, (msg: pb.sc_flower_baby_interaction) => {
                this._touchTime = msg.time;
                this.waitAnimate("touch", msg.itemInfo);
                core.SoundManager.instance.playSound(pathConfig.getPetSound("touch", clientCore.FlowerPetInfo.petType));
            }))
        }

        private async waitAnimate(name: string, array: pb.IItemInfo[]): Promise<void> {
            this._gifts && this._gifts.length > 0 && alert.showReward(clientCore.GoodsInfo.createArray(this._gifts));
            this._gifts = null;
            this._gifts = array;
            this._bone && this._bone.offAll();
            await this.playAnimate(name);
            if (array.length > 0) {
                core.SoundManager.instance.playSound(pathConfig.getPetSound("gift", clientCore.FlowerPetInfo.petType));
                await this.playAnimate("gift");
                alert.showReward(clientCore.GoodsInfo.createArray(array));
                this._gifts = null;
            }
            this._bone.skeleton["_clearCache"]();
            this._bone.play("idle", true);
        }

        /**
         * 使用饼干
         */
        private onCookie(): void {
            let itemCut: number = clientCore.ItemsInfo.getItemNum(1560001); //1560001 饼干
            if (itemCut <= 0) {
                alert.showFWords("饼干数量不足~");
                return;
            }
            this._sCommand.interactivePet(3, Laya.Handler.create(this, (msg: pb.sc_flower_baby_interaction) => {
                this.updateCookie();
                this.waitAnimate("eat", msg.itemInfo);
            }))
        }

        private updateCookie(): void {
            let count: number = clientCore.ItemsInfo.getItemNum(1560001);
            this.txCookie.color = count == 0 ? "#e30d0a" : "#ffffff";
            this.txCookie.changeText("" + count);
        }

        private updateFollow(): void {
            this.btnFollow.skin = clientCore.FlowerPetInfo.followStatus == 0 ? "flowerPet/btn_follow.png" : "flowerPet/btn_Take back.png";
        }

        private rewardHandler(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let data: xls.triple = this.rewardView.list.array[index];
            clientCore.GlobalConfig.setRewardUI(item, { id: data.v1, cnt: data.v2, showName: false });
        }

        private rewardMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let data: xls.triple = this.rewardView.list.array[index];
            data && clientCore.ToolTip.showTips(e.target, { id: data.v1 });
        }

        private node(parent: Laya.Sprite, name: string): any {
            return parent.getChildByName(name);
        }

        private showReward(type: number): void {
            let array: xls.triple[] = clientCore.FlowerPetInfo.getRewards(type, this._petLv);
            let len: number = array.length;
            let spaceX: number = this.rewardView.list.spaceX;
            let width: number = len * 106.4 + (len - 1) * spaceX;
            this.rewardView.width = this.rewardView.list.width = width;
            this.rewardView.bg.width = width + 12;
            this.rewardView.list.array = array;
        }

        /**
         * 领取奖励
         */
        private onReward(): void {
            if (!this.rewardView.visible) {
                alert.showFWords("奖励已领取了哦~");
                return;
            }
            this._sCommand.getRewards(Laya.Handler.create(this, () => {
                if (this._rewards.length > 0) {
                    this.showReward(this._rewards.shift());
                } else {
                    this.rewardView.visible = false;
                    util.RedPoint.reqRedPointRefresh(5201);
                }
            }))
        }

        private showFlowerPet(): void {
            // this.clearFlowerPet();
            this._bone?.dispose();
            this._bone = null;
            let showType: clientCore.ShowType = clientCore.FlowerPetInfo.getShow(clientCore.FlowerPetInfo.petType, this._petLv);
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(showType.big, showType.little), "idle", true, this.petView.petSp);
            this._bone.pos(0, 0);
            this.petView.petSp.on(Laya.Event.CLICK, this, this.playAnimate, ["talk"]);
        }

        private showSelectPet(index: number): void {
            this._nextTypeBone?.dispose();
            this._nextTypeBone = clientCore.BoneMgr.ins.play(pathConfig.getflowerPetRes(3, index + 2), 'idle', true, this.privilegeView.petSp);
            this._nextTypeBone.scaleX = this._nextTypeBone.scaleY = 0.65;
        }

        private clearFlowerPet(): void {
            this._bone && this._bone.dispose();
            this._bone = null;
            this._nextTypeBone?.dispose();
            this._bone = null;
        }

        /**
         * 播放
         * @param name feed|eat|touch|talk 仅有这四个
         */
        private playAnimate(name: string): Promise<void> {
            return new Promise((suc) => {
                if (this._bone) {
                    this._bone.once(Laya.Event.STOPPED, this, () => { suc(); });
                    this._bone.play(name, false);
                }
            })
        }

        public destroy(): void {
            this.ani1?.offAll();
            super.destroy();
            this.clearFlowerPet();
            this._sCommand = null;
            Laya.timer.clearAll(this);
        }
    }
}