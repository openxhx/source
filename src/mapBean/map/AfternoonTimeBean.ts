namespace mapBean {
    /**
     * 感恩午后时光
     */
    export class AfternoonTimeBean implements core.IMapBean {
        private week: number;
        private time0: number = util.TimeUtil.formatTimeStrToSec("2021-11-19 00:00:00");
        private time1: number = util.TimeUtil.formatTimeStrToSec("2021-11-26 00:00:00");
        private _destroy: boolean = false;
        private _mainUI: ui.afternoonTimeBean.AfternoonTimeBeanUI;
        private waterDrop: clientCore.Bone;
        private locking: clientCore.Bone;
        private allpos: number[][] = [[686, 205], [632, 441], [440, 204], [523, 416]];

        private type: string;
        private npcAni: clientCore.Bone;

        async start(ui?: any, data?: any) {
            await Promise.all([
                clientCore.ModuleManager.loadatlas('afternoonTimeBean')
            ]);
            if (!this._destroy) {
                this.type = data;
                if (this.type == "1") {
                    await res.load("res/animate/afternoonTime/dew.png");
                    await res.load("res/animate/afternoonTime/word.png");
                    await res.load("res/animate/afternoonTime/taget.png");
                    await res.load("res/animate/afternoonTime/lusha.png");
                } else if (this.type == "2") {
                    await res.load("res/animate/afternoonTime/lulu.png");
                } else if (this.type == "3") {
                    await res.load("res/animate/afternoonTime/luna.png");
                    await res.load("res/animate/afternoonTime/basket.png");
                }
                this.init();
            }
        }
        /**初始化 */
        init() {
            this._mainUI = new ui.afternoonTimeBean.AfternoonTimeBeanUI();
            if (this.type == "1") this._mainUI.pos(220, 400);
            else if (this.type == "2") this._mainUI.pos(500, 700);
            else if (this.type == "3") this._mainUI.pos(1100, 850);
            clientCore.MapManager.curMap.upLayer.addChild(this._mainUI);
            BC.addEvent(this, this._mainUI.btnBox, Laya.Event.CLICK, this, this.goBrewTea);
            BC.addEvent(this, this._mainUI.btnExchange, Laya.Event.CLICK, this, this.goExchange);
            if (this.type == "1") {
                if (clientCore.ServerManager.curServerTime < this.time0) this.week = 1;
                else if (this.time0 < clientCore.ServerManager.curServerTime && clientCore.ServerManager.curServerTime < this.time1) this.week = 2;
                else this.week = 3;
                Laya.timer.loop(1800, this, this.showWater);
                EventManager.once('PickUpPanelClose', this, this.aniLocking);//监听
                this._mainUI.labTalk.text = "多么美好的下午，要一起喝一杯下午茶吗？";
                this.npcAni = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/lusha.sk", 0, true, this._mainUI.imgNpc);
                this.npcAni.pos(30, 70);
                this._mainUI.imgSuit.skin = pathConfig.getSuitImg(2110529, clientCore.LocalInfo.sex);
            } else if (this.type == "2") {
                this._mainUI.labTalk.text = "你要一起来涂色吗？很好玩的哦~";
                this.npcAni = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/lulu.sk", 0, true, this._mainUI.imgNpc);
                this.npcAni.scaleX = this.npcAni.scaleY = 0.7;
                this.npcAni.pos(30, 100);
                this._mainUI.imgSuit.skin = pathConfig.getSuitImg(2110530, clientCore.LocalInfo.sex);
            } else if (this.type == "3") {
                // res.load("res/itemUI/funnyProp/3200022.png").then(() => {
                // clientCore.PeopleManager.getInstance().player.activityProp("res/itemUI/funnyProp/3200022.png");
                // })
                this._mainUI.labTalk.text = "感恩节到了，请你来吃感恩节饼干噢~";
                this.npcAni = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/luna.sk", 1, true, this._mainUI.imgNpc);
                this.npcAni.scaleX = -1.2;
                this.npcAni.scaleY = 1.2;
                this.npcAni.pos(0, 90);
                this._mainUI.imgSuit.skin = pathConfig.getSuitImg(2110531, clientCore.LocalInfo.sex);
            }
            this._mainUI.boxTip.visible = this.type == "2";
        }

        touch(): void {
        }

        redPointChange(): void {
        }

        destroy(): void {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.showWater);
            this.waterDrop?.dispose();
            this.locking?.dispose();
            this.npcAni?.dispose();
            this.waterDrop = null;
            this.locking = null;
            this.npcAni = null;
            this._destroy = true;
            this._mainUI?.removeSelf();
            this._mainUI?.destroy();
        }
        /**兑换 */
        private goExchange() {
            if (this.type == "1") {
                clientCore.Logger.sendLog('2021年11月12日活动', '【活动】感恩午后时光', '点击场景露莎旁的兑换奖励');
                clientCore.ModuleManager.open('afternoonTime.ExchangePanel', { suitId: 2110529, startId: 2970, endId: 2977 });
            } else if (this.type == "2") {
                clientCore.Logger.sendLog('2021年11月19日活动', '【活动】感恩午后时光露露', '点击场景露露旁的兑换奖励');
                clientCore.ModuleManager.open('afternoonTime.ExchangePanel', { suitId: 2110530, startId: 2978, endId: 2985 });
            } else if (this.type == "3") {
                clientCore.Logger.sendLog('2021年11月19日活动', '【活动】感恩午后时光露娜', '点击场景露娜旁的兑换奖励');
                clientCore.ModuleManager.open('afternoonTime.ExchangePanel', { suitId: 2110531, startId: 2986, endId: 2994 });
            }
        }
        /**根据花露数量跳转页面 */
        private goBrewTea() {
            if (this.type == "1") {
                clientCore.Logger.sendLog('2021年11月12日活动', '【活动】感恩午后时光', '点击美丽湖东场景中的露莎');
                net.sendAndWait(new pb.cs_thanks_afternoon_info({ week: this.week })).then((item: pb.sc_thanks_afternoon_info) => {
                    if (clientCore.ItemsInfo.getItemNum(9900262) >= 10 || item.dailyTea >= 10)
                        clientCore.ModuleManager.open('afternoonTime.BrewTeaPanel');
                    else
                        clientCore.ModuleManager.open('afternoonTime.PickUpPanel');
                });
            } else if (this.type == "2") {
                clientCore.Logger.sendLog('2021年11月19日活动', '【活动】感恩午后时光露露', '点击美丽湖东场景中的露露');
                clientCore.ModuleManager.open('afternoonTime.ClourPanel');
            } else if (this.type == "3") {
                clientCore.Logger.sendLog('2021年11月26日活动', '【活动】感恩午后时光露娜', '点击美丽湖东场景中的露娜');
                clientCore.ModuleManager.open('afternoonTime.CookPanel');
            }
        }
        /**水滴创建 */
        private showWater() {
            var i = Math.floor(Math.random() * 4);
            this.waterDrop = clientCore.BoneMgr.ins.play(`res/animate/afternoonTime/dew.sk`, `dew${i + 1}`, false, clientCore.MapManager.mapUpLayer);
            this.waterDrop.pos(this.allpos[i][0], this.allpos[i][1]);
            this.waterDrop.scaleX = 1.5;
            this.waterDrop.scaleY = 1.5;
            this.waterDrop.once(Laya.Event.COMPLETE, this, function () {
                if (this.waterDrop != null) {
                    this.waterMonitor();
                    this.waterDrop = null;
                }
            });
        }
        /**水滴碰撞 */
        private waterMonitor() {
            let people = clientCore.PeopleManager.getInstance().getMyPosition();
            people.y -= 20;
            if (people.distance(this.waterDrop.x, this.waterDrop.y + 100) < 100) {
                this.getWater(people);
            }
        }
        /**水滴获取 */
        private getWater(people) {
            net.sendAndWait(new pb.cs_thanks_afternoon_get_item({ week: this.week })).then((data: pb.sc_thanks_afternoon_get_item) => {
                var addWater: clientCore.Bone;
                addWater = clientCore.BoneMgr.ins.play(`res/animate/afternoonTime/word.sk`, 0, false, clientCore.PersonLayer.ins.progressLayer);
                addWater.pos(people.x, people.y - 120);
                addWater.once(Laya.Event.COMPLETE, this, function () {
                    addWater = null;
                })
            }).catch((e) => {
                Laya.timer.clear(this, this.showWater);
            });
        }
        /**提示 */
        private async aniLocking() {
            this.locking = clientCore.BoneMgr.ins.play(`res/animate/afternoonTime/taget.sk`, 0, false, clientCore.MapManager.mapUpLayer);
            this.locking.pos(580, 320);
        }

    }

}