/// <reference path="MainUIBase.ts" />
namespace clientCore {

    export class OnsenRyokanMainUI extends MainUIBase {

        private _ui: ui.main.onsenRyokan.OnsenRyokanMainUIUI;
        private _nextHuaTime: number;
        private _nextPanTime: number;
        private _nextSleepTime: number;
        constructor() { super(); }
        public setUp() {
            if (this._ui) return;
            this._ui = new ui.main.onsenRyokan.OnsenRyokanMainUIUI();
            this.resizeView();
        }
        public open() {
            this.init();
            this.addEvents();
            UIManager.showTalk();
            LayerManager.uiLayer.addChild(this._ui);
            // this._ui.x = (LayerManager.uiLayer.width - this._ui.width) / 2;
        }

        public init() {
            this._ui.btnIn.visible = true;
            this._ui.btnOut.visible = false;
            this._ui.boxTime.visible = false;
            this._ui.btnJiu.visible = false;
            this._ui.labHua.text = "" + OnsenRyokanManager.ins.hangUpNum;
            this._ui.labHua.color = OnsenRyokanManager.ins.hangUpNum >= OnsenRyokanManager.ins.maxHangUpNum ? "#ff3200" : "#fcff00";
            this._ui.labMax.text = "/" + OnsenRyokanManager.ins.maxHangUpNum;
        }

        /**打开小游戏 */
        private openGame() {
            clientCore.Logger.sendLog('2022年1月7日活动', '【主活动】温泉会馆', '点击托盘');
            ModuleManager.open("onsenRyokanGame.OnsenRyokanGameModule");
        }

        /**选择泳装 */
        private openCloth() {
            ModuleManager.open("onsenRyokanCloth.OnsenRyokanClothModule");
        }

        /**离开温泉 */
        private outHotSpring() {
            net.sendAndWait(new pb.cs_quit_hot_spring()).then((msg: pb.sc_quit_hot_spring) => {
                if (msg.items.length > 0) {
                    alert.showReward(msg.items);
                    OnsenRyokanManager.ins.hangUpNum = msg.flowerCnt;
                    this._ui.labHua.text = "" + msg.flowerCnt;
                    this._ui.labHua.color = OnsenRyokanManager.ins.hangUpNum >= OnsenRyokanManager.ins.maxHangUpNum ? "#ff3200" : "#fcff00";
                }
                let max = OnsenRyokanManager.ins.maxHangUpNum;
                if (msg.items.length == 0 && msg.flowerCnt >= max) {
                    alert.showFWords("今日泡温泉可获得落樱已达上限");
                }
                this._ui.boxTime.visible = false;
                this._ui.btnIn.visible = true;
                this._ui.btnOut.visible = false;
                this._ui.btnClose.visible = true;
                this._ui.btnJiu.visible = false;
            })
        }

        /**进入温泉 */
        private onInHot() {
            clientCore.Logger.sendLog('2022年1月7日活动', '【主活动】温泉会馆', '点击进入温泉');
            this._ui.btnClose.visible = false;
            this._ui.btnIn.visible = false;
            this._ui.btnOut.visible = true;
            this._nextHuaTime = OnsenRyokanManager.ins.selfBeginTime + 7;
            this._nextPanTime = OnsenRyokanManager.ins.selfBeginTime + 60;
            this._nextSleepTime = OnsenRyokanManager.ins.selfBeginTime + 15;
        }

        /**拾取落樱 */
        private pickHua() {
            clientCore.Logger.sendLog('2022年1月7日活动', '【主活动】温泉会馆', '点击飘落的花瓣');
            net.sendAndWait(new pb.cs_click_hot_spring_flowers()).then((msg: pb.sc_click_hot_spring_flowers) => {
                if (msg.items.length > 0) {
                    alert.showReward(msg.items);
                    OnsenRyokanManager.ins.huaTimes = msg.flowerCnt;
                    // this._ui.labHua.text = "" + msg.flowerCnt;
                }
                // let max = xls.get(xls.itemBag).get(9900142).dailyMax;
                // if (msg.items.length == 0 && msg.flowerCnt >= max) {
                //     alert.showFWords("今日可获得落樱已达上限");
                // }
                // OnsenRyokanManager.ins.huaTimes++;
                this._nextHuaTime = msg.bTime + 7;
            })
        }

        /**点击睡着的花仙 */
        private hitSleep(uid: number) {
            clientCore.Logger.sendLog('2022年1月7日活动', '【主活动】温泉会馆', '点击睡着的小人');
            net.sendAndWait(new pb.cs_hot_spring_click_sleep()).then((msg: pb.sc_hot_spring_click_sleep) => {
                OnsenRyokanManager.ins.sleepTimes = msg.num;
                this._nextSleepTime = msg.time + 15;
                PeopleManager.getInstance().getOther(uid)._swim.showAlert(msg.items);
            })
        }

        private onSleepOut() {
            this._nextSleepTime = clientCore.ServerManager.curServerTime + 15;
        }

        public close() {
            this.removeEvents();
            this._ui.removeSelf();
        }

        private onTime() {
            if (OnsenRyokanManager.ins.selfBeginTime) {
                this._ui.labTime.changeText(util.TimeUtil.formatSecToStr(ServerManager.curServerTime - OnsenRyokanManager.ins.selfBeginTime));
                this._ui.boxTime.visible = true;

                if (OnsenRyokanManager.ins.huaTimes < OnsenRyokanManager.ins.maxHuaTimes && ServerManager.curServerTime >= this._nextHuaTime && !OnsenRyokanManager.ins.hua?.visible) {
                    OnsenRyokanManager.ins.showHua();
                }

                if (OnsenRyokanManager.ins.panTimes < OnsenRyokanManager.ins.maxPanTimes && ServerManager.curServerTime >= this._nextPanTime && !this._ui.btnJiu.visible) {
                    OnsenRyokanManager.ins.showPan();
                    this._ui.btnJiu.visible = true;
                }

                if (OnsenRyokanManager.ins.sleepTimes < OnsenRyokanManager.ins.maxSleepTimes && ServerManager.curServerTime >= this._nextSleepTime && !OnsenRyokanManager.ins.sleepUID) {
                    OnsenRyokanManager.ins.showSleepAni();
                }
            }
        }

        public show() {
            this._ui.boxUI.visible = true;
        }

        public isHide(): boolean {
            return !this._ui.boxUI.visible;
        }
        public hide() {
            this._ui.boxUI.visible = false;
        }

        /**托盘交互结束 */
        private gameOver(bTime: number) {
            this._nextPanTime = bTime + 30;
            this._ui.btnJiu.visible = false;
            OnsenRyokanManager.ins.hidePan();
        }

        private onOverDay() {
            OnsenRyokanManager.ins.hangUpNum = 0;
            OnsenRyokanManager.ins.sleepTimes = 0;
            OnsenRyokanManager.ins.panTimes = 0;
            OnsenRyokanManager.ins.huaTimes = 0;
            this._ui.labHua.text = "" + OnsenRyokanManager.ins.hangUpNum;
            this._ui.labHua.color = OnsenRyokanManager.ins.hangUpNum >= OnsenRyokanManager.ins.maxHangUpNum ? "#ff3200" : "#fcff00";
        }

        private addEvents(): void {
            Laya.timer.loop(1000, this, this.onTime);
            BC.addEvent(this, this._ui.btnJiu, Laya.Event.CLICK, this, this.openGame);
            BC.addEvent(this, this._ui.btnIn, Laya.Event.CLICK, this, this.openCloth);
            BC.addEvent(this, this._ui.btnOut, Laya.Event.CLICK, this, this.outHotSpring);
            BC.addEvent(this, this._ui.btnClose, Laya.Event.CLICK, this, this.onExit);
            BC.addEvent(this, this._ui.btnExchange, Laya.Event.CLICK, this, this.onExchange);
            BC.addEvent(this, this._ui.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, EventManager, globalEvent.STAGE_RESIZE, this, this.resizeView);
            EventManager.on("SELF_IN_HOT", this, this.onInHot);
            EventManager.on("ONSENRYOKAN_GAME_OVER", this, this.gameOver);
            EventManager.on("ONSENRYOKAN_PICK_HUA", this, this.pickHua);
            EventManager.on("ONSENRYOKAN_PICK_PAN", this, this.openGame);
            EventManager.on("ONSENRYOKAN_HIT_SLEEP", this, this.hitSleep);
            EventManager.on("ONSENRYOKAN_OUT_SLEEP", this, this.onSleepOut);
            EventManager.on(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        private removeEvents(): void {
            Laya.timer.clear(this, this.onTime);
            BC.removeEvent(this);
            EventManager.off("SELF_IN_HOT", this, this.onInHot);
            EventManager.off("ONSENRYOKAN_GAME_OVER", this, this.gameOver);
            EventManager.off("ONSENRYOKAN_PICK_HUA", this, this.pickHua);
            EventManager.off("ONSENRYOKAN_PICK_PAN", this, this.openGame);
            EventManager.off("ONSENRYOKAN_HIT_SLEEP", this, this.hitSleep);
            EventManager.off("ONSENRYOKAN_OUT_SLEEP", this, this.onSleepOut);
            EventManager.off(globalEvent.ON_OVER_DAY, this, this.onOverDay);
        }

        private resizeView(): void {
            let offset = (Laya.stage.width - Laya.stage.designWidth) / 2;
            // this._ui.btnJiu.x += offset;
            // this._ui.btnRule.x += offset;
            // this._ui.btnExchange.x += offset;
            // // this._ui.btnClose.x -= offset;
            // this._ui.boxHua.x += offset;

            let len: number = this._ui.boxUI.numChildren;
            for (let i: number = 0; i < len; i++) {
                let child: Laya.Sprite = this._ui.boxUI.getChildAt(i) as Laya.Sprite;
                if (child.x >= 1119) {
                    child.x += offset * 2;
                } else if (child.x >= 735) {
                    child.x += offset;
                }
            }
        }

        private onExit(): void {
            MapManager.enterHome(clientCore.LocalInfo.uid);
        }
        /**兑换奖励 */
        private onExchange(): void {
            ModuleManager.open('onsenRyokanExchange.OnsenRyokanExchangeModule');
        }
        /**帮助说明 */
        private onRule(): void {
            // clientCore.Logger.sendLog('2021年3月19日活动', '【主活动】温泉会馆', '打开规则面板');
            alert.showRuleByID(1135);
            // ModuleManager.open('answer.AnswerRuleModule');
        }
    }
}