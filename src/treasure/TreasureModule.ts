namespace treasure {
    //每次需要替换这里的4个勋章，每层2个（位置，奖励各一个），共2层
    const FLOOR_POS_MEDAL = [MedalConst.TREASRE_FLOOR_1_POSTION, MedalConst.TREASRE_FLOOR_2_POSTION];
    const FLOOR_REWARD_MEDAL = [MedalConst.TREASRE_FLOOR_1_REWARD, MedalConst.TREASRE_FLOOR_2_REWARD];
    //每层展示的套装id
    const FLOOR_SUIT_1 = [2110180, 2110005];
    const FLOOR_SUIT_2 = [2110173, 2100264];
    const BG_SHOW_ID = 1000061;//背景秀id 没有填0
    //显示活动时间
    const EVENT_TXT = '本期活动时间：12月4日——12月30日';
    //抽奖id
    const DRAW_MODULE = [901, 902];
    const KEY_ID = 1511017;
    enum FLOOR {
        ONE,
        TWO
    }
    /**
     * 宝藏探险,约定第二层的第一位为最大的宝箱
     * treasure.TreasureModule
     * nictao
     */
    export class TreasureModule extends ui.treasure.TreasureModuleUI {
        private _floor1Info: { pos: pb.ICommonData, reward: pb.ICommonData };
        private _floor2Info: { pos: pb.ICommonData, reward: pb.ICommonData };
        private _currFloor: FLOOR;
        private _floor2Opened: boolean;
        private _peopleSk: clientCore.Bone;
        private _keySk: clientCore.Bone;
        private _prevPanel: Floor2PrevPanel;
        init(d: any) {
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(clientCore.MedalManager.getMedal(FLOOR_POS_MEDAL.concat(FLOOR_REWARD_MEDAL)).then((data) => {
                this._floor1Info = { pos: data[0], reward: data[2] };
                this._floor2Info = { pos: data[1], reward: data[3] };
            }))
            this.addPreLoad(res.load(`res/animate/treasure/${clientCore.LocalInfo.sex == 1 ? 'B' : 'G'}player.png`));
            this.addPreLoad(res.load(`res/animate/treasure/Mbox.png`));
            this.addPreLoad(res.load(`res/animate/treasure/Bbox.png`));
            this.addPreLoad(res.load(`res/animate/treasure/key.png`));
            this.txtTime.text = EVENT_TXT;
            this.floor1.visible = false;
            this.floor2.visible = false;
        }

        async onPreloadOver() {
            await this.createFloorData();
            this._floor2Opened = clientCore.SuitsInfo.getSuitInfo(FLOOR_SUIT_1[0])?.allGet || clientCore.SuitsInfo.getSuitInfo(FLOOR_SUIT_1[1])?.allGet;
            this._currFloor = this._floor2Opened ? FLOOR.TWO : FLOOR.ONE;
            this.updateBoxView();
            this.updateItemView();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.showCoinBox();
            this._peopleSk = clientCore.BoneMgr.ins.play(`res/animate/treasure/${clientCore.LocalInfo.sex == 2 ? 'B' : 'G'}player.sk`, 0, false, this.spPeople, null, false, true)
            this._peopleSk.on(Laya.Event.START, this, () => {
                this._peopleSk.skeleton.play(0, false, true, 0, 1);
            });
            if (BG_SHOW_ID > 0) {
                let bgshowInfo = xls.get(xls.bgshow).get(BG_SHOW_ID);
                this.txtBgShow.text = bgshowInfo?.name ?? '';
            }
            this.floor1.imgPrevSuit.skin = `res/otherLoad/treasure/floor2_${clientCore.LocalInfo.sex == 1 ? 'female' : 'male'}_2.png`;
            clientCore.Logger.sendLog('2020年12月4日活动', '【付费】宝藏探险', '打开活动面板');
        }

        private updateBoxView() {
            this.floor1.visible = this._currFloor == FLOOR.ONE;
            this.floor2.visible = this._currFloor == FLOOR.TWO;
            this.boxBgShow.visible = this._currFloor == FLOOR.TWO && BG_SHOW_ID > 0;
            for (let i = 1; i <= 2; i++) {
                this['imgSuit_' + i].skin = `res/otherLoad/treasure/floor${this._currFloor + 1}_${clientCore.LocalInfo.sex == 1 ? 'female' : 'male'}_${i}.png`;
                let suitId = this._currFloor == FLOOR.ONE ? FLOOR_SUIT_1[i - 1] : FLOOR_SUIT_2[i - 1];
                this['txtSuit_' + i].text = clientCore.SuitsInfo.getSuitInfo(suitId).suitInfo.name + '套装';
            }
            if (this.floor1.visible)
                this.updateBox(this.floor1.boxContain, this._floor1Info.pos, this._floor1Info.reward);
            if (this.floor2.visible)
                this.updateBox(this.floor2.boxContain, this._floor2Info.pos, this._floor2Info.reward);
            this._floor2Opened = clientCore.SuitsInfo.getSuitInfo(FLOOR_SUIT_1[0])?.allGet || clientCore.SuitsInfo.getSuitInfo(FLOOR_SUIT_1[1])?.allGet;
            if (!this.floor1.ani1.isPlaying && this._floor2Opened) {
                this.floor1.ani1.play(0, true);
            }
            this.floor1.boxNotOpen.visible = !this._floor2Opened;
            let floorInfo = this._currFloor == FLOOR.ONE ? this._floor1Info : this._floor2Info;
            //本层所有宝箱打开后就置灰抽奖按钮
            this.btnOpen.disabled = util.get1num(floorInfo.pos.value) == util.get1num(floorInfo.reward.value);
        }

        private updateItemView() {
            this.txtKeyNum.text = clientCore.ItemsInfo.getItemNum(KEY_ID).toString();
            let suitArr = this._currFloor == FLOOR.ONE ? FLOOR_SUIT_1 : FLOOR_SUIT_2;
            for (let i = 0; i < 2; i++) {
                let suitInfo = clientCore.SuitsInfo.getSuitInfo(suitArr[i]);
                this['txtSutiNum_' + (i + 1)].text = suitInfo.hasCnt + '/' + suitInfo.clothes.length;
            }
        }

        private updateBox(box: Laya.Box, posMedal: pb.ICommonData, rwdMedal: pb.ICommonData) {
            for (let i = 0; i < box.numChildren; i++) {
                let img = box.getChildAt(i) as Laya.Image;
                img.visible = util.getBit(posMedal.value, i + 1) == 1;
                img.skin = util.getBit(rwdMedal.value, i + 1) == 1 ? 'treasure/bao_xiang_yi_da_kai.png' : 'treasure/bao_xiang_ke_da_kai.png';
                //最大宝箱特殊处理
                if (img.name == 'big') {
                    img.visible = true;
                    img.skin = util.getBit(rwdMedal.value, 31) == 1 ? 'treasure/bao_xiangx2.png' : 'treasure/bao_xiangx2_zhi_neng_dui_xiang_li.png';
                }
            }
        }

        private createFloorData() {
            //没有创建过位置信息，根据奖励个数选择点
            if (this._floor1Info.pos.value == 0 && this._floor2Info.pos.value == 0) {
                //创建第一层
                let floor1RewardNum = _.filter(xls.get(xls.godTree).getValues(), o => o.module == DRAW_MODULE[0]).length;
                let arr1 = _.shuffle(util.createArrayQue(1, this.floor1.boxContain.numChildren));//根据UI宝箱数量创建一个数组,然后随机
                arr1 = arr1.slice(0, floor1RewardNum);//根据配表奖励数量 裁剪掉
                this._floor1Info.pos.value = _.reduce(arr1, (prev, curr) => { return util.setBit(prev, curr, 1) }, 0);
                //创建第二层,第31位为大宝箱
                let floor2RewardNum = _.filter(xls.get(xls.godTree).getValues(), o => o.module == DRAW_MODULE[1]).length;
                let arr2 = _.shuffle(util.createArrayQue(1, this.floor2.boxContain.numChildren - 1));
                arr2 = arr2.slice(0, floor2RewardNum - 1);
                //第二层的
                this._floor2Info.pos.value = _.reduce(arr2, (prev, curr) => { return util.setBit(prev, curr, 1) }, 0);
                this._floor2Info.pos.value = util.setBit(this._floor2Info.pos.value, 31, 1);
                return clientCore.MedalManager.setMedal([this._floor1Info.pos, this._floor2Info.pos]);
            }
            else {
                return Promise.resolve();
            }
        }

        private changeFloor(floor: FLOOR) {
            this._currFloor = floor;
            this.updateBoxView();
            this.updateItemView();
        }

        private onOpenBox() {
            if (clientCore.ItemsInfo.getItemNum(KEY_ID) == 0) {
                alert.showSmall(clientCore.ItemsInfo.getItemName(KEY_ID) + '不足,是否前往购买？', { callBack: { caller: this, funArr: [this.onBuyKey] } });
                return;
            }
            let modId = this._currFloor == FLOOR.ONE ? DRAW_MODULE[0] : DRAW_MODULE[1];
            let floorInfo = this._currFloor == FLOOR.ONE ? this._floor1Info : this._floor2Info;
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: modId, times: 1 })).then((data: pb.sc_common_activity_draw) => {
                //奖励
                let xlsInfo = xls.get(xls.godTree).get(data.item[0].id);
                if (xlsInfo) {
                    let animateBitPos: number;
                    //特殊处理第二层的套装奖励,直接设勋章31位
                    let isSpecialSuit = xls.get(xls.suits).has(xlsInfo.item.v1);
                    if (isSpecialSuit) {
                        animateBitPos = 31;
                    }
                    else {
                        //更新数据
                        for (let bit = 1; bit < 32; bit++) {
                            let isBox = util.getBit(floorInfo.pos.value, bit) == 1;
                            let haveRwd = util.getBit(floorInfo.reward.value, bit) == 1;
                            //这个位置是宝箱，且没有显示已领取
                            if (isBox && !haveRwd) {
                                animateBitPos = bit;
                                break;
                            }
                        }
                    }
                    floorInfo.reward.value = util.setBit(floorInfo.reward.value, animateBitPos, 1);
                    let rwdPair = clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale
                    this.playAni(animateBitPos, [clientCore.GoodsInfo.create(rwdPair)]);
                }
                else {
                    console.warn('抽奖回包错误' + data.item[0].id)
                }
            }).catch(() => {
                this.mouseEnabled = true;
            })
        }

        private async playAni(animateBitPos: number, reward: clientCore.GoodsInfo[]) {
            //人动画
            await this.playPeople();
            let parentBox = this._currFloor == FLOOR.ONE ? this.floor1.boxContain : this.floor2.boxContain;
            let targetSp = parentBox.getChildAt(Math.min(animateBitPos - 1, parentBox.numChildren - 1)) as Laya.Sprite;
            await this.playKeyFly(targetSp);
            await this.playKeyStart(targetSp);
            await this.playBoxAni(targetSp);
            alert.showReward(reward);
            this.updateBoxView();
            this.mouseEnabled = true;
        }

        private playPeople() {
            return new Promise((ok) => {
                this._peopleSk.play(0, false, new Laya.Handler(this, () => {
                    ok();
                }));
            })
        }

        private playKeyStart(targetSp: Laya.Sprite) {
            let pos = new Laya.Point(targetSp.x, targetSp.y);
            let parent = targetSp.parent as Laya.Sprite
            parent.localToGlobal(pos, false, this)
            let keyStart = clientCore.BoneMgr.ins.play('res/animate/treasure/key.sk', 0, false, this);
            keyStart.pos(pos.x + targetSp.width / 2, pos.y);
            return new Promise((ok) => {
                keyStart.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private playKeyFly(targetSp: Laya.Sprite) {
            this._peopleSk.skeleton.play(0, false, true, 0, 1);
            this._keySk = clientCore.BoneMgr.ins.play('res/animate/treasure/Mkey.sk', 0, true, this);
            this._keySk.pos(this.spPeople.x + 10, this.spPeople.y - 50);
            let pos = new Laya.Point(targetSp.x, targetSp.y);
            let parent = targetSp.parent as Laya.Sprite
            parent.localToGlobal(pos, false, this)
            let targetPos = [pos.x + targetSp.width / 2, pos.y + targetSp.height / 2];
            return new Promise((ok) => {
                Laya.Tween.to(this._keySk, { x: targetPos[0], y: targetPos[1] }, 700, Laya.Ease.cubicOut, new Laya.Handler(this, () => {
                    this._keySk.dispose();
                    ok();
                }))
            })
        }

        private playBoxAni(targetSp: Laya.Sprite) {
            targetSp.visible = false;
            let boxAni = clientCore.BoneMgr.ins.play(`res/animate/treasure/${targetSp.name == 'big' ? 'Bbox' : 'Mbox'}.sk`, 0, false, targetSp.parent as Laya.Sprite);
            boxAni.x = targetSp.x + targetSp.width / 2;
            boxAni.y = targetSp.y + targetSp.height;
            return new Promise((ok) => {
                boxAni.once(Laya.Event.COMPLETE, this, () => {
                    ok();
                    targetSp.visible = true;
                });
            })
        }

        private onRule() {
            clientCore.Logger.sendLog('2020年12月4日活动', '【付费】宝藏探险', '查看规则说明');
            let rule = this._currFloor == FLOOR.ONE ? 1112 : 1113;
            alert.showRuleByID(rule)
        }

        private onTry(idx: number) {
            let arr = this._currFloor == FLOOR.ONE ? FLOOR_SUIT_1 : FLOOR_SUIT_2;
            alert.showPreviewModule(arr[idx]);
        }

        private onTry2(idx: number) {
            alert.showPreviewModule(FLOOR_SUIT_2[idx]);
        }

        private onTryBg() {
            alert.showPreviewModule(BG_SHOW_ID);
        }

        private onBuyKey() {
            alert.alertQuickBuy(KEY_ID, 1, true);
        }

        private async onPrevFloor2() {
            let needEvent = this._prevPanel ? false : true;
            this._prevPanel = this._prevPanel || new Floor2PrevPanel();
            clientCore.DialogMgr.ins.open(this._prevPanel)
            if (needEvent) {
                this._prevPanel.boxBg.visible = BG_SHOW_ID > 0;
                for (let i = 0; i < 2; i++) {
                    this._prevPanel['txtSuit_' + i].text = clientCore.SuitsInfo.getSuitInfo(FLOOR_SUIT_2[i]).suitInfo.name + '套装';
                    this._prevPanel['imgSuit_' + i].skin = `res/otherLoad/treasure/prev_${clientCore.LocalInfo.sex == 1 ? 'female' : 'male'}_${i + 1}.png`;
                }
                if (BG_SHOW_ID > 0) {
                    this._prevPanel['txtBg'].text = xls.get(xls.bgshow).get(BG_SHOW_ID)?.name ?? '';
                }
                let reward = _.filter(xls.get(xls.godTree).getValues(), o => o.module == DRAW_MODULE[1]);
                for (let i = 0; i < 4; i++) {
                    let img = this._prevPanel.boxReward.getChildAt(i) as Laya.Image;
                    img.skin = clientCore.ItemsInfo.getItemIconUrl(reward[i].item.v1);
                    clientCore.ToolTip.addTips(img, { id: reward[i].item.v1 })
                }
                BC.addEvent(this, this._prevPanel.btnTry_0, Laya.Event.CLICK, this, this.onTry2, [0]);
                BC.addEvent(this, this._prevPanel.btnTry_1, Laya.Event.CLICK, this, this.onTry2, [1]);
                BC.addEvent(this, this._prevPanel.btnTryBg, Laya.Event.CLICK, this, this.onTryBg);
                BC.addEvent(this, this._prevPanel.btnClose, Laya.Event.CLICK, this, this.onClosePrev);
            }
        }

        private onClosePrev() {
            clientCore.DialogMgr.ins.close(this._prevPanel);
        }

        addEventListeners() {
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.updateItemView);
            BC.addEvent(this, EventManager, globalEvent.CLOTH_CHANGE, this, this.updateItemView);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnOpen, Laya.Event.CLICK, this, this.onOpenBox);
            BC.addEvent(this, this.btnTry_1, Laya.Event.CLICK, this, this.onTry, [0]);
            BC.addEvent(this, this.btnTry_2, Laya.Event.CLICK, this, this.onTry, [1]);
            BC.addEvent(this, this.floor1.imgNextFloor, Laya.Event.CLICK, this, this.changeFloor, [FLOOR.TWO]);
            BC.addEvent(this, this.floor2.btnReturn, Laya.Event.CLICK, this, this.changeFloor, [FLOOR.ONE]);
            BC.addEvent(this, this.btnBuyKey, Laya.Event.CLICK, this, this.onBuyKey);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.floor1.boxNotOpen, Laya.Event.CLICK, this, this.onPrevFloor2);
            BC.addEvent(this, this.btnTryBg, Laya.Event.CLICK, this, this.onTryBg);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._floor1Info = null;
            this._floor2Info = null;
            super.destroy();
            clientCore.UIManager.releaseCoinBox();
            this._peopleSk?.dispose(true);
            this._prevPanel?.destroy();
        }

    }
}