namespace afternoonTime {
    /**
     * 11.5
     * 主活动感恩午后时光
     * afternoonTime.AfternoonTimeModule
     */
    export class AfternoonTimeModule extends ui.afternoonTime.AfternoonTimeModuleUI {
        private week: number;
        private time0: number = util.TimeUtil.formatTimeStrToSec("2021-11-19 00:00:00");
        private time1: number = util.TimeUtil.formatTimeStrToSec("2021-11-26 00:00:00");
        private ruleId: number = 1217;
        private anilulu: clientCore.Bone;
        private anilusha: clientCore.Bone;
        private aniluna:clientCore.Bone;


        init() {
            if (clientCore.ServerManager.curServerTime < this.time0) this.week = 1;
            else if (this.time0 < clientCore.ServerManager.curServerTime && clientCore.ServerManager.curServerTime < this.time1) this.week = 2;
            else this.week = 3;
            this.addPreLoad(this.getData(this.week));
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年11月12日活动', '【活动】感恩午后时光', '打开感恩午后时光主面板');
            for (let i = 0; i <= 3; i++) {
                this['imgBg' + i].visible = false;
            }
            switch (this.week) {
                case 1:
                    this.lusa.visible = true;
                    this.luna.visible = false;
                    this.lulu.visible = false;
                    break;
                case 2:
                    this.lusa.visible = true;
                    this.luna.visible = false;
                    this.lulu.visible = true;
                    this.ani2.play(0, true);
                    break;
                case 3:
                    this.lusa.visible = true;
                    this.luna.visible = true;
                    this.lulu.visible = true;
                    break;
            }
            this.aniluna = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/luna.sk", 1, true, this.imgluna);
            this.aniluna.scaleX = -1.2;
            this.aniluna.scaleY = 1.2;
            this.anilulu = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/lulu.sk", 0, true, this.imglulu);
            this.anilulu.scaleX = -0.7;
            this.anilulu.scaleY = 0.7;
            this.anilusha = clientCore.BoneMgr.ins.play("res/animate/afternoonTime/lusha.sk", 0, true, this.imglusa);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.onRule);
            BC.addEvent(this, this.btnLight, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this.lusa, Laya.Event.CLICK, this, this.onGo, ["lusa"]);
            BC.addEvent(this, this.lulu, Laya.Event.CLICK, this, this.onGo, ["lulu"]);
            BC.addEvent(this, this.luna, Laya.Event.CLICK, this, this.onGo, ["luna"]);
            for (let i = 0; i <= 3; i++) {
                BC.addEvent(this, this['btnIcon' + i], Laya.Event.CLICK, this, this.onIcon, [i]);
            }
        }
        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this.ani1.clear();
            this.ani2.clear();
            this.anilulu?.dispose();
            this.anilusha?.dispose();
            super.destroy();
        }
        /**获取面板信息并初始化UI */
        private getData(week) {
            return net.sendAndWait(new pb.cs_thanks_afternoon_info({ week: week })).then((data: pb.sc_thanks_afternoon_info) => {
                if (data.teaTime >= 10) {
                    this.btnIcon0.gray = false;
                    this.imgTrue0.visible = true;
                }
                else {
                    this.btnIcon0.gray = true;
                    this.imgTrue0.visible = false;
                }
                if (data.colorTime >= 10) {
                    this.btnIcon1.gray = false;
                    this.imgTrue1.visible = true;
                }
                else {
                    this.btnIcon1.gray = true;
                    this.imgTrue1.visible = false
                }
                if (data.cookieTime >= 10) {
                    this.btnIcon2.gray = false;
                    this.imgTrue2.visible = true;
                }
                else {
                    this.btnIcon2.gray = true;
                    this.imgTrue2.visible = false
                }
                this.lab0.text = `与露莎仙女烹制${data.teaTime}/10杯下午茶`;
                if (this.week < 2) this.lab1.text = `11月19日开启`;
                else this.lab1.text = `涂色成功${data.colorTime}/10次`;
                if (this.week < 3) this.lab2.text = `11月26日开启`;
                else this.lab2.text = `请别人吃饼干${data.cookieTime}/10次`;
                this.btnLight.visible = false;
                this.imgBg4.skin = "afternoonTime/di_0.png";
                if (data.teaTime >= 10 && data.colorTime >= 10 && data.cookieTime >= 10 && data.flag == 0) {
                    this.btnLight.visible = true;
                    this.ani1.play(0, true);
                    this.imgBg4.skin = "afternoonTime/di_1.png";
                }
            })
        }
        /**规则 */
        private onRule() {
            alert.showRuleByID(this.ruleId);
        }
        /**Icon按钮 */
        private onIcon(num) {
            if (this['imgBg' + num].visible) this['imgBg' + num].visible = false
            else this['imgBg' + num].visible = true;
        }
        /**兑换 */
        private onReward() {
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_thanks_afternoon_reward()).then((item: pb.sc_thanks_afternoon_reward) => {
                alert.showReward(item.item);
                this.mouseEnabled = true;
                this.ani1.clear();
                this.getData(this.week);
            })
        }
        /**跳转 */
        private onGo(name: string) {
            switch (name) {
                case "lusa":
                    this.destroy();
                    clientCore.MapManager.enterWorldMap(11, new Laya.Point(230, 600));
                    clientCore.Logger.sendLog('2021年11月12日活动', '【活动】感恩午后时光', '点击主面板上的露莎');
                    break;
                case "lulu":
                    this.destroy();
                    clientCore.MapManager.enterWorldMap(11, new Laya.Point(930, 880));
                    clientCore.Logger.sendLog('2021年11月12日活动', '【活动】感恩午后时光', '点击主面板上的露露');
                    break;
                case "luna":
                    this.destroy();
                    clientCore.MapManager.enterWorldMap(11, new Laya.Point(1500, 1000));
                    clientCore.Logger.sendLog('2021年11月12日活动', '【活动】感恩午后时光', '点击主面板上的露娜');
                    break;
            }
        }

    }
}