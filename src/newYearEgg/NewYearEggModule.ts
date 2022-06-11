namespace newYearEgg {
    /**
     * 敲蛋小游戏
     * newYearEgg.NewYearEggModule
     */
    export class NewYearEggModule extends ui.newYearEgg.NewYearEggModuleUI {

        private suitId: number = 2110564;
        private itemId: number[] = [9900286, 9900287, 9900288, 9900289];
        private exchangePanel: ClothExchangePanel;
        private _bone: clientCore.Bone;
        private leftTime:number;

        constructor() {
            super();
        }

        init() {
            this.tipMc.visible = false;
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(res.load('res/animate/eggGame/chaifudai.png'));
            this.addPreLoad(res.load('res/animate/eggGame/zhuyemian_flower.png'));
            this.suit_nan.visible = clientCore.LocalInfo.sex == 2;
            this.suit_nv.visible = clientCore.LocalInfo.sex == 1;
            // this.goBtn.visible = false;
            this.initUI();
            clientCore.Logger.sendLog('2021年12月31日活动', '【主活动】元蛋', '打开主活动面板');
        }

        onPreloadOver(): void {
            this._bone = clientCore.BoneMgr.ins.play(`res/animate/eggGame/zhuyemian_flower.sk`, 0, true, this);
            this._bone.x = this.width/2;
            this._bone.y = this.height;
        }

        private async initUI() {
            for (let i: number = 0; i < 4; i++) {
                this["numTxt" + i].text = clientCore.ItemsInfo.getItemNum(this.itemId[i]) + "";
                this["img" + i].gray = clientCore.ItemsInfo.getItemNum(this.itemId[i]) <= 0;
            }
            net.sendAndWait(new pb.cs_get_server_common_data({commonList:[140000229]})).then((data: pb.sc_get_server_common_data) => {
                this.leftTxt.text = (3 - data.times[0]) + "/3";
                this.leftTime = 3 - data.times[0];
            });
            this.openBtn.skin = clientCore.SuitsInfo.getSuitInfo(2110563).allGet?`newYearEgg/tag.png`:`newYearEgg/openbtn.png`;
        }

        //隐藏tips
        private hideTips(e: Laya.Event) {
            if (e.type == Laya.Event.CLICK) {
                if (!this.tipMc.hitTestPoint(e.stageX, e.stageY)) {
                    this.tipMc.visible = false;
                }
            }
        }

        private showSuitTip(e: Laya.Event) {
            e.stopPropagation();
            this.tipMc.visible = true;
        }

        /**展示套装详情 */
        private onTryClick() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", this.suitId);
        }

        private onStartGame() {
            clientCore.Logger.sendLog('2021年12月31日活动', '【主活动】元蛋', '点击开始砸蛋');
            this.destroy();
            clientCore.ModuleManager.open("newYearEggGame.NewYearEggGameModule");
        }

        private openGift() {
            if (clientCore.SuitsInfo.getSuitInfo(2110563).allGet) {
                return;
            }
            if (this.leftTime<=0) {
                alert.showFWords("今日开启次数已用完~");
                return;
            }
            if (this.checkOpen()) {
                clientCore.Logger.sendLog('2021年12月31日活动', '【主活动】元蛋', '点击拆福蛋');
                let bone = clientCore.BoneMgr.ins.play(`res/animate/eggGame/chaifudai.sk`, 0, false, this);
                this.giftMc.visible = false;
                let rewardArr;
                bone.x = this.giftMc.x;
                bone.y = this.giftMc.y + this.giftMc.height/2;
                net.sendAndWait(new pb.cs_yuan_egg_open({})).then((msg: pb.sc_yuan_egg_open) => {
                    rewardArr = msg.item;
                    this.initUI();
                });
                bone.once(Laya.Event.COMPLETE, this, () => {
                    bone.dispose();
                    alert.showReward(rewardArr);
                    this.giftMc.visible = true;
                });
            } else {
                alert.showFWords("集齐“元”、“旦”、“快”、“乐”四个字才能打开~");
            }
        }

        private checkOpen(): Boolean {
            for (let i = 0; i < 4; i++) {
                if (clientCore.ItemsInfo.getItemNum(this.itemId[i]) <= 0) {
                    return false;
                }
            }
            return true;
        }

        //兑换材料
        private async onExchange() {
            clientCore.Logger.sendLog('2021年12月31日活动', '【主活动】元蛋', '点击兑换服装');
            if (!this.exchangePanel) {
                clientCore.LoadingManager.showSmall();
                await res.load("atlas/newYearEgg/ExchangePanel.atlas", Laya.Loader.ATLAS);
                await res.load("unpack/newYearEgg/ExchangePanel/bg1.png");
                await res.load(`unpack/newYearEgg/ExchangePanel/2110550_${clientCore.LocalInfo.sex}.png`);
                clientCore.LoadingManager.hideSmall();
                this.exchangePanel = new ClothExchangePanel();
                this.exchangePanel.init({ suitId: 2110564, startId: 3050, endId: 3057, iconId: 9900282 });
            }
            clientCore.Logger.sendLog('2021年12月10日活动', '【活动】神秘的雪堆', '点击兑换奖励');
            clientCore.DialogMgr.ins.open(this.exchangePanel);
        }

        private goExchange() {
            clientCore.Logger.sendLog('2021年12月31日活动', '【主活动】元蛋', '点击前往交换');
            this.destroy();
            clientCore.ModuleManager.open("friends.FriendMainModule");
        }

        private showRule() {
            alert.showRuleByID(1227);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.hideTips);
            BC.addEvent(this, this.giftMc, Laya.Event.CLICK, this, this.showSuitTip);
            BC.addEvent(this, this.tryBtn, Laya.Event.CLICK, this, this.onTryClick);
            BC.addEvent(this, this.startBtn, Laya.Event.CLICK, this, this.onStartGame);
            BC.addEvent(this, this.openBtn, Laya.Event.CLICK, this, this.openGift);
            BC.addEvent(this, this.exchangeBtn, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this.goBtn, Laya.Event.CLICK, this, this.goExchange);
            BC.addEvent(this, this.helpBtn, Laya.Event.CLICK, this, this.showRule);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            this._bone?.dispose();
            super.destroy();
        }
    }
}