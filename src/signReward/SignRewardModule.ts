/**
 * signReward.SignRewardModule
 */
 namespace signReward {
    export class SignRewardModule extends ui.signReward.SignRewardPanelUI {

        state1: number = 0; //普通奖励领取标记
        state2: number = 0; //奇妙奖励领取标记
        curDay: number = 10; //显示的第一天(1-10)
        flafArr: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //是否点击确认领取 1没有
        private mainAni:clientCore.Bone;
        private a1:clientCore.Bone;
        private b1:clientCore.Bone;
        private a2:clientCore.Bone;
        private b2:clientCore.Bone;
        private a3:clientCore.Bone;
        private b3:clientCore.Bone;

        init() {
            this.addPreLoad(xls.load(xls.signinbydate));
            this.addPreLoad(net.sendAndWait(new pb.cs_hua_12anniversary_panel()).then((data: pb.sc_hua_12anniversary_panel) => {
                this.state1 = data.normalBabyFlag;
                this.state2 = data.vipBabyFlag;
            }));
            this.addPreLoad(res.load(`res/animate/signReward/available.png`));
            this.addPreLoad(res.load(`res/animate/signReward/Not available.png`));
            this.addPreLoad(res.load(`res/animate/signReward/shineaction.png`));
        }
        onPreloadOver() {
            this.initPanel();
            clientCore.Logger.sendLog('2021年4月8日活动', '【活动】小花仙品牌十二周年福利', '打开活动面板');
        }

        initPanel() {
            var i: number = 0;
            for (i = 1; i <= 9; i++) {
                if (util.getBit(this.state1, i) == 0 && clientCore.FlowerPetInfo.petType == 0 || (clientCore.FlowerPetInfo.petType > 0 && util.getBit(this.state2, i) == 0)) {
                    this.curDay = i;
                    break;
                }
            }
            for (let i = 0; i < 3; i++) {
                if (clientCore.FlowerPetInfo.petType > 0 && util.getBit(this.state2, this.curDay + i) == 0
                    || clientCore.FlowerPetInfo.petType == 0 && util.getBit(this.state1, this.curDay + i) == 0) {
                    let xlsInfo = xls.get(xls.signinbydate);
                    let second = util.TimeUtil.formatTimeStrToSec(xlsInfo.get(this.curDay + i).StartTime)
                    if (clientCore.ServerManager.curServerTime >= second) {
                        this.setDay(1, i, this["day" + (i + 1)]);
                    } else {
                        this.setDay(3, i, this["day" + (i + 1)]);
                    }
                } else {
                    this.setDay(2, i, this["day" + (i + 1)]);
                }
            }
            this.mainAni = clientCore.BoneMgr.ins.play('res/animate/signReward/shineaction.sk', 0, true, this.ani ,null  , false);
            this.mainAni.pos(this.width/2 , this.height/2);
            this.weekImg.skin = "signReward/week_4.png"
        }

        setDay(state: number, index: number, ui: ui.signReward.render.dailySignUI)//state:1,未领取 2，已领取 3，时间未到
        {
            for (let i = 1; i <= 3; i++) {
                if (state == i) {
                    ui["state" + i].visible = true;
                    ui["dayTxt" + i].text = this.curDay + index;
                } else {
                    ui["state" + i].visible = false;
                }
            }
            if (state == 1) {
                ui.npcImg1.skin = `signReward/npc${this.curDay + index}.png`;
                if(!this["a" + (index+1)]){
                    this["a" + (index+1)] = clientCore.BoneMgr.ins.play('res/animate/signReward/available.sk', 0, true, ui.ani1 ,null  , false);
                    this["a" + (index+1)].y = this["a" + (index+1)].y + 31;
                    this["a" + (index+1)].x = this["a" + (index+1)].x - 2;
                    ui.ani1.skin = "";
                }
                
            } else if (state == 2) {
                let xlsInfo = xls.get(xls.signinbydate);
                let reward = clientCore.LocalInfo.sex == 1 ? xlsInfo.get(this.curDay + index).normal_reward_fe : xlsInfo.get(this.curDay + index).normal_reward_ma;
                for (let i = 0; i < 3; i++) {
                    ui["icon" + i].skin = clientCore.ItemsInfo.getItemIconUrl(reward[i].v1);
                    ui["numTxt" + i].text = "X" + reward[i].v2
                }
                let reward2 = xlsInfo.get(this.curDay + index).vip_reward;
                ui["icon3"].skin = clientCore.ItemsInfo.getItemIconUrl(reward2[0].v1);
                ui["numTxt3"].text = "X" + reward2[0].v2
                ui.flag.visible = this.flafArr[this.curDay + index - 1] == 0;
                ui.sureBtn.visible = this.flafArr[this.curDay + index - 1] == 1;
                ui.npcImg2.skin = `signReward/npcb${this.curDay + index}.png`;
                ui.talkImg.skin = `signReward/talk${this.curDay + index}.png`;

            } else {
                let xlsInfo = xls.get(xls.signinbydate);
                ui.npcImg3.skin = `signReward/npc${this.curDay + index}.png`
                let month = xlsInfo.get(this.curDay + index).StartTime.slice(6, 7);
                let day = xlsInfo.get(this.curDay + index).StartTime.slice(8, 10);
                ui.lockTime.text = parseInt(month) + "月" + parseInt(day) + "日解锁";
                if(!this["b" + (index+1)]){
                    this["b" + (index+1)] = clientCore.BoneMgr.ins.play('res/animate/signReward/Not available.sk', 0, true, ui.ani2 ,null  , false);
                    this["b" + (index+1)].x = this["b" + (index+1)].x + 126;
                    this["b" + (index+1)].y = this["b" + (index+1)].y + 327;
                    ui.ani2.skin = "";
                }
            }

        }

        getReward(i: number) {
            this.flafArr[this.curDay + i - 2] = 1;
            this.setDay(2, i - 1, this["day" + i]);
        }

        sureGetReward(i: number) {
            net.sendAndWait(new pb.cs_hua_12anniversary_get_reward({ flag: clientCore.FlowerPetInfo.petType == 0 ? 1 : 2, index: this.curDay + i - 1 })).then((data: pb.sc_hua_12anniversary_get_reward) => {
                alert.showReward(data.itmes);
                this.state1 = util.setBit(this.state1, this.curDay + i - 1, 1);
                if (clientCore.FlowerPetInfo.petType > 0) {
                    this.state2 = util.setBit(this.state2, this.curDay + i - 1, 1);
                }
                this.flafArr[this.curDay + i - 2] = 0;
                this.setDay(2, i - 1, this["day" + i]);
                let needRight = true;
                for (let i = 0; i < 3; i++) {
                    if (clientCore.FlowerPetInfo.petType > 0 && util.getBit(this.state2, this.curDay + i) == 0
                        || clientCore.FlowerPetInfo.petType == 0 && util.getBit(this.state1, this.curDay + i) == 0) {
                            needRight = false;
                    }
                }
                if (needRight) {
                    this.changeRight();
                }
            })
        }

        changeLeft() {
            if (this.curDay <= 1) {
                return;
            }
            this.curDay--;
            for (let i = 0; i < 3; i++) {
                if (clientCore.FlowerPetInfo.petType > 0 && util.getBit(this.state2, this.curDay + i) == 0
                    || clientCore.FlowerPetInfo.petType == 0 && util.getBit(this.state1, this.curDay + i) == 0) {
                    if (this.flafArr[this.curDay + i - 1] == 0) {  //没点领取
                        let xlsInfo = xls.get(xls.signinbydate);
                        let second = util.TimeUtil.formatTimeStrToSec(xlsInfo.get(this.curDay + i).StartTime)
                        if (clientCore.ServerManager.curServerTime >= second) {
                            this.setDay(1, i, this["day" + (i + 1)]);
                        } else {
                            this.setDay(3, i, this["day" + (i + 1)]);
                        }
                    } else {    //点过领取
                        this.setDay(2, i, this["day" + (i + 1)]);
                    }
                } else {
                    this.setDay(2, i, this["day" + (i + 1)]);
                }
            }
        }

        changeRight() {
            if (this.curDay >= 10) {
                return;
            }
            this.curDay++;
            for (let i = 0; i < 3; i++) {
                if (clientCore.FlowerPetInfo.petType > 0 && util.getBit(this.state2, this.curDay + i) == 0
                    || clientCore.FlowerPetInfo.petType == 0 && util.getBit(this.state1, this.curDay + i) == 0) {
                    let xlsInfo = xls.get(xls.signinbydate);
                    let second = util.TimeUtil.formatTimeStrToSec(xlsInfo.get(this.curDay + i).StartTime)
                    if (clientCore.ServerManager.curServerTime >= second) {
                        this.setDay(1, i, this["day" + (i + 1)]);
                    } else {
                        this.setDay(3, i, this["day" + (i + 1)]);
                    }
                } else {
                    this.setDay(2, i, this["day" + (i + 1)]);
                }
            }
        }

        addEventListeners(): void {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.destroy);
            for (let i = 1; i <= 3; i++) {
                BC.addEvent(this, this["day" + i].getBtn, Laya.Event.CLICK, this, this.getReward, [i]);
                BC.addEvent(this, this["day" + i].sureBtn, Laya.Event.CLICK, this, this.sureGetReward, [i]);
            }
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changeLeft);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changeRight);
        }

        private onRule() {
            alert.showRuleByID(1210);
        }

        private onTry(): void {
            alert.showCloth(1);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy() {
            this.mainAni?.dispose();
            for(let i=1 ; i<=3 ; i++){
                this["a" + i]?.dispose(true);
                this["b" + i]?.dispose(true);
            }
            super.destroy();
            EventManager.event('SignRewardClose');//通知强弹
        }
    }
}