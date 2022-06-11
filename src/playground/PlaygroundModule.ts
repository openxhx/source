namespace playground {
    /**
     * 花仙乐园
     */
    export class PlaygroundModule extends ui.playground.PlaygroundModuleUI {
        //各种常量
        private readonly MYSTERIOUS_TIME: number = 60;
        /**相机*/
        private _camera: Camera;
        /**当前地图*/
        private _curMap: Map;
        /**人物*/
        private _unit: Unit;

        private _config: xls.gardenCommonData;
        private _model: PlaygroundModel;
        private _control: PlaygroundControl;
        /** 骰子摇动后 需要等待所以动作和事件完成*/
        private _wait: boolean = false;

        //各种子面板
        private _dailyPanel: DailyPanel;
        private _previewPanel: PreviewPanel;
        private _buyPanel: BuyPanel;
        private _choicePanel: ChoicePanel;
        private _randomPanel: RandomPanel;
        private _topicPanel: TopicPanel;
        private _activityPanel: ActivityPanel;
        private _achievementPanel: AchievementPanel;
        //时间器
        private _t: time.GTime;
        private _passTime: number;
        //飘字的对象池
        private _pool: Laya.Sprite[] = [];
        //动画
        private _bone: clientCore.Bone;
        private _light: clientCore.Bone;
        //各种临时变量
        private _cacheRandom: number;
        private _cacheChoice: string;
        private _achievement: pb.sc_flower_land_reward_notify;
        private _limitFate: number;
        private _openDaily: boolean = false;
        constructor() { super(); }

        init(data: { type: number, time: number }): void {
            super.init(data);
            this.sign = clientCore.CManager.regSign(new PlaygroundModel(), new PlaygroundControl());
            this._model = clientCore.CManager.getModel(this.sign) as PlaygroundModel;
            this._control = clientCore.CManager.getControl(this.sign) as PlaygroundControl;
            this.resizeView();
            //加载配表
            this.addPreLoad(xls.load(xls.gardenCommonData));
            this.addPreLoad(xls.load(xls.gardenChoose));
            this.addPreLoad(xls.load(xls.flowerGarden));
            this.addPreLoad(xls.load(xls.gardenRandom));
            //加载面板信息
            this.addPreLoad(new Promise(async (suc) => {
                let msg: pb.sc_flower_land_panel = await this._control.getInfo();
                this._model.initMsg(msg);
                this._cacheRandom = msg.destiny;
                this._cacheChoice = msg.chose;
                suc();
            }))
            this.addPreLoad(clientCore.MedalManager.getMedal([MedalDailyConst.PLAYGORUND_DAILY_OPEN]).then((o) => {
                this._openDaily = o[0].value == 0;
            }))
        }

        async seqPreLoad(): Promise<void> {
            let type: number = this._data ? this._data.type : MAP_TYPE.MAJOR;
            await this.changeMap(type);
            this._data = null;
        }

        popupOver() {
            if (this._openDaily) {
                this.onDaily();
                clientCore.MedalManager.setMedal([{ id: MedalDailyConst.PLAYGORUND_DAILY_OPEN, value: 1 }]);
            }
        }

        onPreloadOver(): void {
            this._config = xls.get(xls.gardenCommonData).get(1);
            clientCore.UIManager.showCoinBox();
            clientCore.UIManager.setMoneyIds([this._config.mysteryDebris, clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            clientCore.UIManager.refrehMoneyEvent(new Laya.Handler(this, this.onMoney));
            this.updateDiceCnt();
            this.updateEnergy();
            this.initBuffInfo();
            this.updateRedPoint(1);
            this.checkActivity();
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('lalaLand'));
            clientCore.Logger.sendLog('2020年5月22日活动', '【常驻活动】花仙乐园', '打开活动面板');
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.onBack);
            BC.addEvent(this, this.btnPreview, Laya.Event.CLICK, this, this.openPreview);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.onBuyDice);
            BC.addEvent(this, this.btnDaily, Laya.Event.CLICK, this, this.onDaily);
            BC.addEvent(this, this.btnNormal, Laya.Event.CLICK, this, this.onShakeDice, [1]);
            BC.addEvent(this, this.btnChoice, Laya.Event.CLICK, this, this.onChoice);
            BC.addEvent(this, this.btnActivity, Laya.Event.CLICK, this, this.onActivity);
            BC.addEvent(this, this.barView, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.goShop);
            BC.addEvent(this, EventManager, PlaygroundConst.START_FATE_EVENT, this, this.startFateEvent);
            BC.addEvent(this, EventManager, PlaygroundConst.UPDATE_RED_POINT, this, this.updateRedPoint);
            BC.addEvent(this, EventManager, PlaygroundConst.GO_MODULE, this, this.goModule);
            BC.addEvent(this, EventManager, PlaygroundConst.GO_MONEY_MODULE, this, this.goMoneyModule);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.onItemNotify);
            BC.addEvent(this, EventManager, globalEvent.CLOTH_CHANGE, this, this.onClothNotify);

            net.listen(pb.sc_flower_land_reward_notify, this, this.openAchievement);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
            net.unListen(pb.sc_flower_land_reward_notify, this, this.openAchievement);
        }
        destroy(): void {
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('home'));
            util.TweenUtils.remove('PLAYGROUND');
            clientCore.UIManager.releaseCoinBox();
            clientCore.UIManager.releaseEvent();
            clientCore.CManager.unRegSign(this.sign);
            _.forEach(this._pool, (element) => { element?.destroy(); })
            this._pool.length = 0;
            this._pool = null;
            this.cleanMap();
            this._bone?.dispose();
            this._bone = null;
            this._t?.dispose();
            this._t = null;
            this._light?.dispose();
            this._light = null;
            this._achievementPanel = this._activityPanel = this._randomPanel = this._topicPanel = null;
            this._dailyPanel = this._previewPanel = this._buyPanel = this._choicePanel = this._model = this._control = null;
            this._achievement = null;
            super.destroy();
        }
        onBack(): void {
            //在神秘花园则退出到主地图
            if (this._curMap.type == MAP_TYPE.SECONDARY) {
                if (this._wait) {
                    alert.showFWords('请等待事件执行结束再退出哦~');
                    return;
                }
                alert.showSmall('是否确认离开神秘花园？需要再次跳至神秘花园入口处才可再次进入~', {
                    callBack: {
                        caller: this,
                        funArr: [() => { this.changeMap(MAP_TYPE.MAJOR); }]
                    }
                })
                return;
            }
            this.destroy();
        }
        onMoney(e: Laya.Event): void {
            if (e.type != Laya.Event.CLICK) return;
            let itemID: number = e.currentTarget['dataSource'];
            switch (itemID) {
                case clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID:
                    this.goMoneyModule();
                    break;
                case clientCore.MoneyManager.LEAF_MONEY_ID:
                    alert.alertQuickBuy(clientCore.MoneyManager.LEAF_MONEY_ID, 1);
                    break;
                default:
                    let array: xls.shop[] = xls.get(xls.shop).getValues();
                    let len: number = array.length;
                    let quickSell: boolean = false;
                    let buyCnt: number = 0;
                    for (let i: number = 0; i < len; i++) {
                        let element: xls.shop = array[i];
                        if (element.itemId == itemID && element.quickSell == 1) {
                            quickSell = true;
                            buyCnt = element.unitNum;
                            break;
                        }
                    }
                    quickSell ? alert.alertQuickBuy(itemID, buyCnt, true) : clientCore.ToolTip.showTips(e.target, { id: itemID });
                    break;
            }
        }
        private onClothNotify(): void {
            this.updateRedPoint(1);
        }
        private showRule(): void {
            alert.showRuleByID(1010);
        }

        /** 前往灵豆购买*/
        private goMoneyModule(): void {
            if (this._wait) return;
            let type: number = this._curMap.type;
            let time: number = Math.max(this.MYSTERIOUS_TIME - this._passTime, 0);
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeModuleByName('playground');
            clientCore.ModuleManager.open('moneyShop.MoneyShopModule', null, {
                openWhenClose: 'playground.PlaygroundModule',
                openData: { type: type, time: time }
            });
        }

        private goShop(): void {
            if (this._wait) return;
            let type: number = this._curMap.type;
            let time: number = Math.max(this.MYSTERIOUS_TIME - this._passTime, 0);
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeModuleByName('playground');
            clientCore.ModuleManager.open('commonShop.CommonShopModule', 6, {
                openWhenClose: 'playground.PlaygroundModule',
                openData: { type: type, time: time }
            });
        }

        private resizeView(): void {
            let rect: number[] = [468, 763];
            let len: number = this.numChildren;
            for (let i: number = 0; i < len; i++) {
                let sprite: Laya.Sprite = this.getChildAt(i) as Laya.Sprite;
                if (!sprite) continue;
                if (sprite.x < rect[0]) {
                    sprite.x -= clientCore.LayerManager.OFFSET
                } else if (sprite.x > rect[1]) {
                    sprite.x += clientCore.LayerManager.OFFSET;
                }
            }
        }

        private goModule(id: number): void {
            if (this._curMap.type == MAP_TYPE.SECONDARY) {
                alert.showSmall('是否离开神秘花园？', {
                    callBack: {
                        caller: this,
                        funArr: [() => { this.jumpModule(id); }]
                    }
                })
            } else {
                this.jumpModule(id);
            }
        }

        private jumpModule(id: number): void {
            let info: xls.moduleOpen = xls.get(xls.moduleOpen).get(id);
            if (!info) return;
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open(info.name, null, {
                openWhenClose: 'playground.PlaygroundModule',
                openData: { type: MAP_TYPE.MAJOR }
            })
        }

        /**
         * 道具变化通知 用来更新骰子
         * @param items 
         */
        private onItemNotify(items: pb.IItemInfo[]): void {
            let len: number = items.length;
            let change: boolean = false;
            for (let i: number = 0; i < len; i++) {
                let element: pb.IItemInfo = items[i];
                if (element.itemId == 1540006) { //普通骰子
                    change = true;
                    this._model.normalCnt = element.itemCnt;
                } else if (element.itemId == 1540007) { //遥控骰子
                    this._model.specialCnt = element.itemCnt;
                    change = true;
                }
            }
            change && this.updateDiceCnt();
        }

        private initBuffInfo(): void {
            if (this._cacheRandom != 0) {
                let data: xls.gardenRandom = xls.get(xls.gardenRandom).get(this._cacheRandom);
                data && this.showFateBuff(true, data.uiDescription);
            } else if (this._cacheChoice) {
                let array: string[] = this._cacheChoice.split('/');
                let data: xls.gardenChoose = xls.get(xls.gardenChoose).get(parseInt(array[0]));
                data && this.showFateBuff(true, data.uiDescription.split('/')[parseInt(array[1]) - 1]);
            }
        }

        private async createMap(type: MAP_TYPE): Promise<void> {
            this._curMap = new Map();
            this.addChildAt(this._curMap, 0);
            await this._curMap.init(type);
        }

        private cleanMap(): void {
            clientCore.DialogMgr.ins.closeAllDialog();
            this._camera?.dispose();
            this._curMap?.dispose();
            this._unit?.dispose();
            this._curMap = this._camera = this._unit = null;
        }

        /**
         * 切换地图
         * @param type 
         */
        private async changeMap(type: MAP_TYPE): Promise<void> {
            //如果是切换到神秘花园 则缓存主地图的位置 同时将神秘花园的步数设置为0
            //返回主地图则将位置还原
            if (type == MAP_TYPE.MAJOR) {
                this._model.step = this._model.majorStep;
            } else {
                this._model.majorStep = this._model.step;
                this._model.step = await this._control.enterGarden();
            }
            this._bone?.dispose();
            this._bone = null;
            this.cleanMap();
            clientCore.LoadingManager.showSmall();
            await this.createMap(type);
            this.createUnit();
            this.createCamera();
            this.changeUI(type);
            clientCore.LoadingManager.hideSmall();
        }

        private changeUI(type: MAP_TYPE): void {
            let isSecondary: boolean = type == MAP_TYPE.SECONDARY; //是否在神秘花园中
            this.timeView.visible = isSecondary;
            this.btnChoice.gray = isSecondary;
            this.imgTitle.skin = `playground/title_${type}.png`;
            this.boxTitle.visible = isSecondary;
            // isSecondary ? clientCore.UIManager.setMoneyIds([9900002, 9900003]) : clientCore.UIManager.setMoneyIds([9900001, 9900002, 9900003]);
            if (isSecondary) {
                this._passTime = this._data ? this.MYSTERIOUS_TIME - this._data.time : 0;
                this._t?.dispose();
                this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                this.onTime();
                this._data && this._t.start();
                this.openMysteriousRule();
            }
        }

        private onTime(): void {
            let t: number = this.MYSTERIOUS_TIME - this._passTime++;
            if (t < 0) { //时间到了
                this._t.dispose();
                this._t = null;
                return;
            }
            this.timeView.timeTxt.changeText(util.StringUtils.getDateStr2(t, '{min}:{sec}'));
        }

        /** 创建玩家*/
        private createUnit(): void {
            let start: Laya.Point = this._curMap.gridPos(this._model.step);
            this._unit = new Unit(this._curMap);
            //确认朝向
            let next: number = this._model.step >= this._curMap.gridLength() ? 1 : this._model.step + 1;
            let nextPos: Laya.Point = this._curMap.gridPos(next);
            let angle: number = Math.atan2(nextPos.y - start.y, nextPos.x - start.x);
            let angle2: number = angle * 180 / Math.PI;
            this._unit.direction(angle2 <= 90 && angle2 > -90 ? DIRECTION.RIGHT : DIRECTION.LEFT);
            //确认位置
            this._unit.pos(start.x, start.y);
        }

        /** 创建相机*/
        private createCamera(): void {
            this._camera = new Camera();
            this._camera.init(this._curMap);
            this._camera.lookObj(this._unit);
            this._camera.go();
        }

        /**
         * 摇骰子
         * @param type 1-普通 2-特殊
         */
        private onShakeDice(type: number, score: number): void {
            if (this._curMap.type == MAP_TYPE.SECONDARY && this._passTime > this.MYSTERIOUS_TIME && !this._wait) {
                // alert.showFWords('时间已耗尽不能移动~');
                alert.showSmall('时间已耗尽，是否回到花仙乐园？', {
                    callBack: {
                        caller: this,
                        funArr: [() => { this.changeMap(MAP_TYPE.MAJOR); }]
                    }
                });
                return;
            }
            if (this._wait) {
                this._curMap.type == MAP_TYPE.MAJOR && alert.showFWords('请等待事件结束~');
                return;
            }
            if (type == 1 && this._model.normalCnt <= 0 || type == 2 && this._model.specialCnt <= 0) {
                // alert.showFWords('骰子数量不足啦~');
                this.onBuyDice();
                return;
            }
            //当在神秘花园的时候 投掷骰子后开始计时
            this._curMap.type == MAP_TYPE.SECONDARY && !this._t.started && this._t.start();
            this.waitEvent(true);
            this._control.shakeDice(type, score >> 0, this._curMap.type, new Laya.Handler(this, (msg: pb.sc_flower_land_event) => {
                if (!msg) {
                    this.waitEvent(false);
                    return;
                }
                //当回复这个骰子点数的话 说明这次行动是无效的
                let score: number = msg.pointNum;
                let array: number[]
                if (score <= 0) {
                    array = this.calculaStep(msg.score, 1);
                    score = array.length;
                }
                core.SoundManager.instance.playSound(pathConfig.getSoundUrl(`touzi_${type == 1 ? 'pt' : 'yk'}`));

                //大于6 则是网络波动导致前一次移动无效
                if (score > 6) {
                    alert.showFWords('受网络波动，矫正中~');
                    this._model.normalCnt = msg.normalDiceNum;
                    this._model.specialCnt = msg.specialDiceNum;
                    this.updateDiceCnt();
                    if (this._limitFate == 3 && type == 1) { this._limitFate = 0; }
                    this.handleShakeDice(msg, array);
                    return;
                }

                this._bone?.dispose();
                this._bone = clientCore.BoneMgr.ins.play(`res/animate/playground/${type == 1 ? 'dice' : 'highdice'}.sk`, score + '', false, this.spDice, null, false, true);
                this._bone.scaleX = this._bone.scaleY = 1.2;
                this._bone.once(Laya.Event.COMPLETE, this, async () => {
                    this._model.normalCnt = msg.normalDiceNum;
                    this._model.specialCnt = msg.specialDiceNum;
                    this.updateDiceCnt();
                    //展示0.8s
                    await util.TimeUtil.awaitTime(800);
                    if (this._bone) {
                        this._bone?.dispose();
                        this._bone = null;
                        if (msg.pointNum) {
                            alert.showFWords('掷出的骰子大小未满足条件~');
                            this.waitEvent(false);
                            return;
                        }
                        if (this._limitFate == 3 && type == 1) { this._limitFate = 0; }
                        this.handleShakeDice(msg, array);
                    }
                });
            }))
        }

        /**
         * 计算玩家需要跳的步数
         * @param target 目标
         * @param flag 0-向后跳 1-向前跳
         */
        private calculaStep(target: number, flag: number): number[] {
            let array: number[] = [];
            if (flag == 1) {
                if (target < this._model.step) { //过界的处理
                    let len: number = this._curMap.gridLength();
                    for (let i: number = this._model.step + 1; i <= len; i++) { array.push(i); }
                    for (let i: number = 1; i <= target; i++) { array.push(i); }
                } else {
                    for (let i: number = this._model.step + 1; i <= target; i++) { array.push(i); }
                }
            } else {
                if (target > this._model.step) {//过界的处理
                    let len: number = this._curMap.gridLength();
                    for (let i: number = this._model.step - 1; i >= 1; i--) { array.push(i); }
                    for (let i: number = len; i >= target; i--) { array.push(i); }
                } else {
                    for (let i: number = this._model.step - 1; i >= target; i--) { array.push(i); }
                }
            }
            return array;
        }

        private async handleShakeDice(msg: pb.sc_flower_land_event, array: number[]): Promise<void> {
            //缓存分数
            this._model.severEnergy = msg.curEnergy;
            //处理跳
            await this.jumpTo(msg.score, 1, array);
            //处理事件
            await this.handleEvents(msg.eventList, true);
            //结束
            this.waitEvent(false);
        }

        /**
         * 启动命运事件
         * @param events 
         */
        private async startFateEvent(events: pb.Ievent[], context: string, curEnergy: number): Promise<void> {
            this._model.severEnergy = curEnergy;
            this._limitFate = 0;
            this.waitEvent(true);
            context && this.showFateBuff(true, context);
            await this.handleEvents(events, false);
            this.waitEvent(false);
        }

        /**
         * 是否显示命运buff
         * @param isShow 
         * @param id 
         */
        private showFateBuff(isShow: boolean, context?: string): void {
            if (this.boxBuff.visible == isShow || this._limitFate > 0) return;
            this.boxBuff.visible = isShow;
            isShow && this.buffTxt.changeText(context);
        }

        /**
         * 处理事件集
         * @param events 
         * @param needClean 是否需要清理buff显示
         */
        private async handleEvents(events: pb.Ievent[], needClean: boolean): Promise<void> {
            let array: pb.Ievent[] = events.concat();
            let len: number = events.length;
            if (len <= 0) return;
            for (let i: number = 0; i < len; i++) { await this.handleEvent(array[i]); }
            //清理下命运buff显示
            needClean && this.showFateBuff(false);
        }

        /**
         * 处理事件
         * 随机跳转:params v1 步数 v2 0-向后跳 1-向前跳
         * 神秘宝箱:params v1 数量 v2 2-普通骰子 3-遥控骰子 4-能量
         * @param event 
         */
        private async handleEvent(event: pb.Ievent): Promise<void> {
            if (event.item.length > 0) {
                this._curMap.type == MAP_TYPE.MAJOR ? alert.showReward(clientCore.GoodsInfo.createArray(event.item))
                    : _.forEach(event.item, (element) => { alert.showFWords(`获得 ${clientCore.ItemsInfo.getItemName(element.id)}x${element.cnt}`); });
            }

            let type: number = event.params[0].v2;
            let value: number = event.params[0].v1;
            if (event.type == 1) { //花园事件
                switch (event.eventId) {
                    case EVENT_TYPE.GARDEN:
                        await this.changeMap(MAP_TYPE.SECONDARY);
                        break;
                    case EVENT_TYPE.RANDOM:
                        let diff: number = value - this._model.step;
                        this.boxRandom.visible = true;
                        this.randomTypeTxt.skin = `playground/random_wd_${diff > 0 ? 2 : 1}.png`;
                        util.showTexWord(this.randomTxt, 'playground', Math.abs(diff) + '');
                        this.randomTxt.pivotX = this.randomTxt.width / 2;
                        await util.TimeUtil.awaitTime(1000);
                        if (this._closed) return;
                        this.boxRandom.visible = false;
                        await this.jumpTo(value, type);
                        break;
                    case EVENT_TYPE.MYSTERIOUS:
                        type == 4 && this.addEnergy(value, 2);
                        break;
                    case EVENT_TYPE.FORECAST:
                        this.openRandom();
                        break;
                    case EVENT_TYPE.CHOICE:
                        this.openTopic(type);
                        break;
                    case EVENT_TYPE.CLOTH_PART:
                        if (this._curMap.type == MAP_TYPE.SECONDARY) {
                            type == 4 ? this.addEnergy(value, 0) : this._curMap.changeEvent(this._model.step);
                        }
                        break;
                    case EVENT_TYPE.ENERGY:
                        this.addEnergy(value, 0);
                        break;
                    default:
                        break;
                }
            } else {
                /**
                 *  命运事件
                 *  0-无事发生
                    1-玩家前进/后退x格
                    2-玩家下次必须掷出指定x数，不然无法移动（可以使用遥控骰子）
                    3-玩家下一次普通骰子只能掷出偶数/奇数（对遥控骰子无效）
                    4-玩家减少/增加x点能量
                    5-玩家获得1个骰子
                    6-玩家获得指定id和数量的道具
                 */
                switch (event.eventId) {
                    case 1:
                        await this.jumpTo(value, type);
                        break;
                    case 2:
                        break;
                    case 3:
                        this._limitFate = 3;
                        break;
                    case 4:
                        console.log(`energy type:${type} value:${value}`);
                        this.addEnergy(type == 4 ? value : -value, event.type == 2 ? 3 : 4);
                        break;
                    case 6:
                        break;
                }
            }
        }

        /** 等待事件*/
        private waitEvent(isWait: boolean): void {
            this.btnNormal.gray = isWait;
            this.btnChoice.gray = isWait || this._curMap.type == MAP_TYPE.SECONDARY;
            this._wait = isWait;
        }

        /**
         * 跳到某个节点
         * @param target 
         * @param flag 0-后跳 前跳
         */
        private async jumpTo(target: number, flag: number, array?: number[]): Promise<void> {
            if (this._model.step == target) return;
            array = array || this.calculaStep(target, flag);
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                await this.jumpOnce(array[i]);
            }
            //跳到空白格子能量+1
            this._curMap.checkBlank(target) && this._curMap.type == MAP_TYPE.MAJOR && this.addEnergy(1, 1);
            this._achievement && this.showAchievement(this._achievement);
        }

        /** 跳一次*/
        private async jumpOnce(index: number): Promise<void> {
            return new Promise((suc) => {
                let len: number = this._curMap.gridLength();
                let step: number = index;
                if (index > len) {
                    step = index - len;
                } else if (index < 0) {
                    step = len + index;
                }
                this._unit.jump(this._curMap.gridPos(step), new Laya.Handler(this, () => {
                    this._model.step = step;
                    suc();
                }));
            })
        }

        /** 打开预览*/
        private async openPreview(): Promise<void> {
            let path: string = 'atlas/playgroundPre.atlas';
            if (!Laya.loader.getRes(path)) {
                clientCore.LoadingManager.showSmall();
                await res.load(path, Laya.Loader.ATLAS);
                clientCore.LoadingManager.hideSmall();
            }
            this._previewPanel = this._previewPanel || new PreviewPanel();
            this._previewPanel.show(this.sign);
        }

        /** 购买骰子*/
        private onBuyDice(): void {
            if (this._wait) return;
            this._buyPanel = this._buyPanel || new BuyPanel();
            this._buyPanel.show();
        }

        /** 特殊骰子选择点数*/
        private onChoice(): void {
            if (this._curMap.type == MAP_TYPE.SECONDARY) {
                alert.showFWords('当前地图不能使用遥控骰子~');
                return;
            }
            if (this._wait) {
                alert.showFWords('请等待事件完成~');
                return;
            }
            if (this._model.specialCnt <= 0) {
                this.onBuyDice();
                return;
            }
            this._choicePanel = this._choicePanel || new ChoicePanel();
            this._choicePanel.show(new Laya.Handler(this, this.onShakeDice));
        }

        private async onActivity(): Promise<void> {
            // if (this._wait) return;
            // let msg: pb.sc_flower_land_get_active_reward_panel = await this._control.queryActivity();
            // if (this._closed) return;
            // this._activityPanel = this._activityPanel || new ActivityPanel();
            // this._activityPanel.show(this.sign, msg);
            if (this._wait) return;
            this.onBack();
            clientCore.ModuleManager.open("springFaerie.SpringFaerieModule");
        }

        /** 每日领取*/
        private onDaily(): void {
            if (this._wait) return;
            this._dailyPanel = this._dailyPanel || new DailyPanel();
            this._dailyPanel.show(this.sign);
        }

        /** 打开命运占卜*/
        private async openRandom(): Promise<void> {
            let path: string = 'atlas/playgroundRom.atlas';
            if (!Laya.loader.getRes(path)) {
                clientCore.LoadingManager.showSmall();
                await res.load(path, Laya.Loader.ATLAS);
                clientCore.LoadingManager.hideSmall();
            }
            this._randomPanel = this._randomPanel || new RandomPanel();
            this._randomPanel.show(this.sign);
        }

        /**
         * 打开命运抉择
         * @param id 抉择ID 对应gardenChoose
         */
        private openTopic(id: number): void {
            this._topicPanel = this._topicPanel || new TopicPanel();
            this._topicPanel.show(this.sign, id);
        }

        /** 打开成就*/
        private openAchievement(msg: pb.sc_flower_land_reward_notify): void {
            if (this._wait) {
                this._achievement = msg;
                return;
            }
            this.showAchievement(msg);
        }

        /** 展示成就*/
        private showAchievement(msg: pb.sc_flower_land_reward_notify): void {
            this._achievementPanel = this._achievementPanel || new AchievementPanel();
            this._achievementPanel.show(msg.type);
            this._achievementPanel.once(Laya.Event.CLOSE, this, () => { alert.showReward(clientCore.GoodsInfo.createArray(msg.items)); });
            this._achievement = null;
        }

        /** 骰子数量更新*/
        private updateDiceCnt(): void {
            this.normalTxt.changeText('' + this._model.normalCnt);
            this.specialTxt.changeText('' + this._model.specialCnt);
        }

        /**
         * 能量增减
         * @param value 
         * @param type 类型 1-空白格子 2-神秘奖励 3-命运占卜 4-命运抉择
         */
        private addEnergy(value: number, type: number): void {
            // let energy: number = _.clamp(this._model.energy + value, 0, this._config.energyLimit);
            // if (energy == this._model.energy) {
            //     alert.showFWords('能量瓶已满，不能获得更多能量了~');
            //     return;
            // }
            if (this._model.severEnergy < 0) {
                console.log("需要服务器返回的当前能量");
                return;
            }
            let plus: number = this._model.severEnergy - this._model.energy;
            if (this._model.energy >= this._config.energyLimit && plus >= 0) {
                this._model.severEnergy = -1;
                alert.showFWords('能量瓶已满，不能获得更多能量了~');
                return;
            }
            if (this._model.severEnergy == this._model.energy) {
                this._model.severEnergy = -1;
                return;
            }
            console.log('current energy: ' + this._model.energy);
            this._model.energy += plus;
            this._model.severEnergy = -1;
            this.flyWord(plus, type);
            this.updateEnergy();
        }

        /** 能量更新*/
        private updateEnergy(): void {
            let prop: number = this._model.energy / this._config.energyLimit;
            this.barView.imgBar.mask.y = 219 * (1 - prop);
            this.barView.imgBarMax.visible = prop == 1;
            this.barView.txProgress.changeText(prop < 1 ? this._model.energy + "/" + this._config.energyLimit : '领取');
            this.updateRedPoint(3);
            if (prop >= 1) { //充满了
                if (!this._light) {
                    this._light = clientCore.BoneMgr.ins.play('res/animate/playground/lightspot.sk', 0, true, this.barView);
                    this._light.pos(102, 275);
                }
            } else {
                this._light?.dispose();
                this._light = null;
            }
        }

        private flyWord(value: number, type: number): void {
            let sp: Laya.Sprite = this.showTexWord(value + '', type);
            sp.pos(Laya.stage.width / 2 - clientCore.LayerManager.OFFSET, Laya.stage.height / 2 - 22.5);
            this.addChild(sp);
            util.TweenUtils.creTween(sp, { y: sp.y - 20 }, 800, null, this, () => { !this._closed && this._pool.push(sp.removeSelf() as Laya.Sprite); }, 'PLAYGROUND');
        }

        private showTexWord(value: string, type: number): Laya.Sprite {
            let x: number = 0;
            let texture: Laya.Texture;
            let sp: Laya.Sprite = this._pool.shift() || new Laya.Sprite();
            sp.graphics.clear();
            texture = Laya.loader.getRes(`playground/energy_${type}.png`);
            if (texture) {
                sp.graphics.drawTexture(texture, x, 0, texture.sourceWidth, texture.sourceHeight);
                x += texture.sourceWidth + 10;
            }
            texture = Laya.loader.getRes(parseInt(value) > 0 ? 'playground/energy+.png' : 'playground/energy-.png');
            sp.graphics.drawTexture(texture, x, 0, texture.sourceWidth, texture.sourceHeight);
            x += texture.sourceWidth;
            for (let element of value) {
                texture = Laya.loader.getRes(`playground/${element}.png`);
                if (!texture) continue;
                sp.graphics.drawTexture(texture, x, 0, texture.sourceWidth, texture.sourceHeight);
                x += texture.sourceWidth;
            }
            sp.pivotX = x / 2;
            return sp;
        }

        /** 能量兑换*/
        private onExchange(): void {
            if (this._wait) return;
            if (this._model.energy >= this._config.energyLimit) {
                this._control.exchangeDice(new Laya.Handler(this, () => {
                    this._model.energy = 0;
                    this.updateEnergy();
                }))
            } else {
                alert.showFWords('能量瓶集满后可领取普通骰子x1');
            }
        }

        /**
         * 更新红点
         * @param type 
         */
        private updateRedPoint(type: number): void {
            let isShow: boolean = false;
            switch (type) {
                case 1: //服装领取
                    let info: { suitInfo: xls.suits, clothes: number[], allGet: boolean, hasCnt: number } = clientCore.SuitsInfo.getSuitInfo(PlaygroundConst.CLOTH_2);
                    // let bgshow: boolean = clientCore.ItemsInfo.checkHaveItem(PlaygroundConst.BG_SHOW);
                    // isShow = info.hasCnt == xls.get(xls.gardenCommonData).get(1).clothNumber && !bgshow;
                    isShow = info.hasCnt == xls.get(xls.gardenCommonData).get(1).clothNumber;
                    break;
                case 2: //限时活动
                    break;
                case 3: //能量瓶子
                    isShow = this._model.energy >= this._config.energyLimit;
                    break;
            }
            this['r_' + type].visible = isShow;
        }

        /** 第一次打开神秘花园的规则弹窗*/
        private async openMysteriousRule(): Promise<void> {
            let data: pb.ICommonData[] = await clientCore.MedalManager.getMedal([MedalConst.OPEN_MYSTERIOUS_GARDEN]);
            if (data[0].value == 0) {
                let view: ui.playground.panel.RulePanelUI = new ui.playground.panel.RulePanelUI();
                view.sideClose = true;
                view.once(Laya.Event.CLICK, this, () => { clientCore.DialogMgr.ins.close(view); });
                clientCore.DialogMgr.ins.open(view);
                clientCore.MedalManager.setMedal([{ id: MedalConst.OPEN_MYSTERIOUS_GARDEN, value: 1 }]);
            }
        }

        /** 检查活跃活动*/
        private checkActivity(): void {
            let times: string[] = this._config.eventTime.split('_');
            let st: number = util.TimeUtil.formatTimeStrToSec(times[0]);
            let et: number = util.TimeUtil.formatTimeStrToSec(times[1]);
            let nt: number = clientCore.ServerManager.curServerTime;
            this.decActivity.visible = this.btnActivity.visible = this.activityIcon.visible = nt >= st && nt <= et;
        }
    }
}