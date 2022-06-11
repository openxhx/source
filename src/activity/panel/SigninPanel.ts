
namespace activity {
    const SPECIAL_DAY = [7, 15, 25];
    /**签到面板 */
    export class SigninPanel extends ActivityBasePanel<ui.activity.panel.DailyLoginPanel2UI>{
        private _srvInfo: pb.sc_get_sign_in_reward_status;
        private _xlsInfo: util.HashMap<xls.signin>;
        private _currMonth: number;
        /**能补签到几号 */
        private _canResignToDay: number;
        /**今日用神叶补签的次数 */
        private _leafResignNum: number;
        private _godMirrorInfo: pb.IMirrorRankInfo;
        private _person: clientCore.Person;
        private _cellArr: ui.activity.render.DaysReward2UI[];
        /**花神之镜和签到套装切换cd */
        private changeCd: number;
        init() {
            this.ui.list.vScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.ui.listDay.vScrollBarSkin = null;
            this.ui.listDay.renderHandler = new Laya.Handler(this, this.onDayRender);
            this.ui.listDay.mouseHandler = new Laya.Handler(this, this.onDayMouse);
            this.addPreLoad(xls.load(xls.signin));
            this.addPreLoad(xls.load(xls.signGlobal));
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(net.sendAndWait(new pb.cs_get_sign_in_reward_status()).then((data: pb.sc_get_sign_in_reward_status) => {
                this._srvInfo = data;
                this._leafResignNum = data.coinAdd;
            }));
            this.ui.txtNick.text = '虚位以待';
            this.addPreLoad(net.sendAndWait(new pb.cs_get_flora_of_mirror_ranking_info({ start: 0, end: 0, flag: 1 })).then((data: pb.sc_get_flora_of_mirror_ranking_info) => {
                this._godMirrorInfo = data.info[0];
            }))
            clientCore.Logger.sendLog('2022年1月28日活动', '2月签到', '打开2月签到面板');
        }

        preLoadOver() {
            this.ui.imgMask.visible = false;
            this.ui.boxMirror.visible = false;
            this.changeSuitMirror();
            this._xlsInfo = xls.get(xls.signin);
            if (this._godMirrorInfo) {
                this.ui.txtNick.text = this._godMirrorInfo.nick;
                this._person = new clientCore.Person(this._godMirrorInfo.sexy, this._godMirrorInfo.image);
                this._person.scale(0.5, 0.5);
            }
            else {
                this.ui.txtNick.text = '虚位以待';
            }
            // this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.srvUserInfo.curClothes);
            // this._person.scale(0.5, 0.5);
            // this.ui.txtNick.text = clientCore.LocalInfo.userInfo.nick;
            this.ui.cpRole.addChild(this._person);
            this._cellArr = [];
            for (let i = 0; i < SPECIAL_DAY.length; i++) {
                let cell = new ui.activity.render.DaysReward2UI();
                this.ui.spProgress.addChild(cell);
                this._cellArr.push(cell);
                BC.addEvent(this, cell, Laya.Event.CLICK, this, this.onDayMouse2, [i]);
            }
            this.updateView();
            this.setCurMonthSuit();
        }

        updateView() {
            // let now = new Date(clientCore.ServerManager.curServerTime * 1000);
            let now = util.TimeUtil.formatSecToDate(clientCore.ServerManager.curServerTime);
            this._currMonth = now.getMonth() + 1;
            this.ui.txtMonth.value = this._currMonth.toString();
            let canSign = this._srvInfo.signed == 0;
            let canResign = this._srvInfo.canSignInDays > 0;
            this._canResignToDay = this._srvInfo.hasSignedDays + this._srvInfo.canSignInDays;
            this.ui.btnSign.visible = canSign;
            this.ui.boxResign.visible = !canSign;
            this.ui.btnResign.disabled = !canResign;
            if (!canSign && !canResign) {
                //不能签到，也不能补签，只留下一个灰色的签到按钮
                this.ui.boxResign.visible = false;
                this.ui.btnSign.visible = true;
                this.ui.btnSign.disabled = true;
            }
            this.ui.txtDay.text = this._srvInfo.hasSignedDays.toString();
            this.ui.list.dataSource = _.filter(this._xlsInfo.getValues(), (o) => { return o.month == this._currMonth });
            this.ui.listDay.dataSource = SPECIAL_DAY;
            //补签代币设置
            if (this.ui.boxResign.visible) {
                let xlsResign = xls.get(xls.globaltest).get(1).retroactive;
                let xlsResignAdd = xls.get(xls.globaltest).get(1).signAdd;
                let resignCoinId = xlsResign.v1;
                let haveCoin = clientCore.ItemBagManager.getItemNum(resignCoinId) > 0;
                if (haveCoin) {
                    //有足够的补签代币
                    this.ui.imgResignCoin.skin = clientCore.ItemsInfo.getItemIconUrl(resignCoinId);
                    this.ui.txtResignCost.text = 'x1';
                }
                else {
                    //不够可以用神叶
                    let needLeaf = Math.min(xlsResign.v2 + xlsResignAdd.v1 * this._leafResignNum, xlsResignAdd.v2);
                    this.ui.imgResignCoin.skin = clientCore.ItemsInfo.getItemIconUrl(clientCore.MoneyManager.LEAF_MONEY_ID);
                    this.ui.txtResignCost.text = 'x' + needLeaf;
                    //神叶也不够，补签按钮置灰
                    if (clientCore.ItemsInfo.getItemNum(clientCore.MoneyManager.LEAF_MONEY_ID) < needLeaf) {
                        this.ui.btnResign.disabled = false;
                    }
                }
            }
            let maxDay = _.last(SPECIAL_DAY)
            let per = _.clamp(this._srvInfo.hasSignedDays / maxDay, 0, 1);
            this.ui.imgPro.width = per * this.ui.imgProBg.width;
            let config = xls.get(xls.signGlobal).get(this._currMonth);
            for (let i = 0; i < this._cellArr.length; i++) {
                let cell = this._cellArr[i];
                let day = SPECIAL_DAY[i];
                cell.txtNum.value = SPECIAL_DAY[i].toString();
                cell.imgIcon.skin = `activity/iconRwd_${Math.min(1, i)}.png`;
                cell.x = day / maxDay * this.ui.imgProBg.width - 42;
                cell.imgGot.visible = this._srvInfo.daysSign.indexOf(day) > -1;
                cell.imgIcon.gray = this._srvInfo.hasSignedDays < day;
            }
            this.ui.labDrawCost.text = clientCore.ItemsInfo.getItemNum(config.cost.v1) + `/` + config.cost.v2;
        }

        /**
         * 
         */
        private setCurMonthSuit() {
            let config: xls.signGlobal = xls.get(xls.signGlobal).get(this._currMonth);
            this.ui.imgSuit.skin = pathConfig.getSuitImg(config.clothesId, clientCore.LocalInfo.sex);
            this.ui.labSuit.text = xls.get(xls.suits).get(config.clothesId).name;
            this.ui.iconDraw.skin = clientCore.ItemsInfo.getItemIconUrl(config.cost.v1);
            this.ui.labDrawCost.text = clientCore.ItemsInfo.getItemNum(config.cost.v1) + `/` + config.cost.v2;
        }

        private onListRender(cell: ui.activity.render.DailyLoginRenderUI, idx: number) {
            let xlsInfo = cell.dataSource as xls.signin;
            let reward = clientCore.LocalInfo.sex == 1 ? xlsInfo.femaleAward : xlsInfo.maleAward;
            cell.mcReward.ico.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            cell.mcReward.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(reward.v1);
            cell.mcReward.num.value = reward.v2.toString();
            let rewarded = xlsInfo.day <= this._srvInfo.hasSignedDays;//已签到
            cell.imgGet.visible = false;
            cell.imgDark.visible = rewarded;
            cell.imgTomorrow.visible = xlsInfo.day == (this._srvInfo.hasSignedDays + 1);
            cell.imgReSign.visible = xlsInfo.day > this._srvInfo.hasSignedDays && xlsInfo.day <= this._canResignToDay && !cell.imgTomorrow.visible;//明天可领显示时，不显示补签
            cell.imgDouble.visible = xlsInfo.double == 1 && !cell.imgDark.visible;
            if (cell.imgTomorrow.visible) {
                cell.parent.addChild(cell);
            }
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let xlsInfo = this.ui.list.getItem(idx) as xls.signin;
                let reward = clientCore.LocalInfo.sex == 1 ? xlsInfo.femaleAward : xlsInfo.maleAward;
                clientCore.ToolTip.showTips(e.target, { id: reward.v1 });
            }
        }

        private onDayRender(cell: ui.activity.render.DaysRewardUI, idx: number) {
            let day = cell.dataSource as number;
            cell.txtDay.text = day + '天';
            cell.imgGet.visible = this._srvInfo.daysSign.indexOf(day) > -1;
            cell.btnGet.visible = !cell.imgGet.visible;
            cell.btnGet.disabled = this._srvInfo.hasSignedDays < day;
            let str = ['sevenDaysSign', 'fifteenDaysSign', 'twentyfiveDaysSign'][SPECIAL_DAY.indexOf(day)];
            let reward = xls.get(xls.globaltest).get(1)[str] as xls.pair[];
            cell.list.dataSource = _.map(reward, (rwd) => {
                return {
                    'ico': { skin: clientCore.ItemsInfo.getItemIconUrl(rwd.v1) },
                    'imgBg': { skin: clientCore.ItemsInfo.getItemIconBg(rwd.v1) },
                    'txtName': { visible: false },
                    'num': { value: rwd.v2 }
                }
            })
        }

        private onDayMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK && e.target.name == 'btnGet') {
                let day = e.currentTarget['dataSource']
                this.getDayReward(day);
            }
        }

        private onDayMouse2(idx: number) {
            let day = SPECIAL_DAY[idx];
            if (this._srvInfo.hasSignedDays >= day && this._srvInfo.daysSign.indexOf(day) == -1) {
                this.getDayReward(day);
            }
            else {
                let reward: xls.pair[];
                if (day == 7) {
                    reward = clientCore.GlobalConfig.config.sevenDaysSign;
                } else if (day == 15) {
                    reward = clientCore.GlobalConfig.config.fifteenDaysSign;
                } else if (day == 25) {
                    let rwd = clientCore.ServerManager.curServerTime >= util.TimeUtil.formatTimeStrToSec('2020/10/1 00:00:00') ? clientCore.GlobalConfig.config.daysSignTemporary : clientCore.GlobalConfig.config.twentyfiveDaysSign
                    reward = rwd;
                }
                clientCore.ModuleManager.open("panelCommon.RewardShowModule", { reward: clientCore.GoodsInfo.createArray(reward), info: "" });
            }
        }

        private getDayReward(day: number) {
            net.sendAndWait(new pb.cs_get_user_days_sign_reward({ days: day })).then((data: pb.sc_get_user_days_sign_reward) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardInfo));
                this._srvInfo.daysSign.push(day);
                this._srvInfo.daysSign = _.uniq(this._srvInfo.daysSign);
                util.RedPoint.reqRedPointRefresh(3301);
                this.updateView();
            })
        }

        private onSign() {
            net.sendAndWait(new pb.cs_user_sign_in()).then((data: pb.sc_user_sign_in) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardInfo));
                this._srvInfo.canSignInDays -= 1;
                this._srvInfo.hasSignedDays += 1;
                this._srvInfo.signed = 1;
                util.RedPoint.reqRedPointRefresh(3301);
                this.updateView();
            })
        }

        private onReSign() {
            net.sendAndWait(new pb.cs_user_add_sign()).then((data: pb.sc_user_add_sign) => {
                alert.showReward(clientCore.GoodsInfo.createArray(data.rewardInfo));
                this._srvInfo.canSignInDays -= 1;
                this._srvInfo.hasSignedDays += 1;
                this._leafResignNum = data.coinAdd;
                util.RedPoint.reqRedPointRefresh(3301);
                this.updateView();
            })
        }

        private onDraw() {
            let config = xls.get(xls.signGlobal).get(this._currMonth);
            let has = clientCore.ItemsInfo.getItemNum(config.cost.v1);
            let suitId = xls.get(xls.signGlobal).get(this._currMonth).clothesId;
            if (has < config.cost.v2) {
                alert.showFWords('所需代币不足~');
                return;
            }
            if (clientCore.SuitsInfo.checkHaveSuits(suitId)) {
                alert.showFWords('抽奖机被你抽空啦~');
                return;
            }
            Laya.stage.mouseEnabled = false;
            this.ui.imgMask.visible = true;
            let ani = clientCore.BoneMgr.ins.play('res/animate/activity/niudan.sk', 0, false, this.ui);
            ani.pos(440, 340);
            ani.once(Laya.Event.COMPLETE, this, () => {
                ani.dispose();
                this.ui.imgMask.visible = false;
                let drawId = xls.get(xls.signGlobal).get(this._currMonth).period;
                net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: drawId, times: 1 })).then(async (data: pb.sc_common_activity_draw) => {
                    Laya.stage.mouseEnabled = true;
                    this.ui.labDrawCost.text = clientCore.ItemsInfo.getItemNum(config.cost.v1) + `/` + config.cost.v2;
                    let xlsInfo = xls.get(xls.godTree).get(data.item[0].id);
                    let reward = clientCore.LocalInfo.sex == 1 ? xlsInfo.item : xlsInfo.itemMale;
                    await alert.showDrawClothReward(reward.v1);
                }).catch(() => {
                    Laya.stage.mouseEnabled = true;
                })
            })
        }

        private trySuit() {
            let suitId = xls.get(xls.signGlobal).get(this._currMonth).clothesId;
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', suitId);
        }

        private changeSuitMirror() {
            this.changeCd = 5;
            this.ui.boxMirror.visible = !this.ui.boxMirror.visible;
            this.ui.boxSuit.visible = !this.ui.boxMirror.visible;
            this.ui.dot1.skin = this.ui.boxMirror.visible ? "activity/whiteDot.png" : "activity/blackDot.png";
            this.ui.dot2.skin = this.ui.boxSuit.visible ? "activity/whiteDot.png" : "activity/blackDot.png";
        }

        private onScrollChange() {
            let scroll = this.ui.list.scrollBar;
            this.ui.imgBar.y = scroll.value / scroll.max * (this.ui.imgProgress.height - this.ui.imgBar.height) + this.ui.imgProgress.y;
            this.ui.imgTop.visible = scroll.value > 0;
        }

        private onMirror() {
            clientCore.Logger.sendLog('2020年8月28日活动', '【系统】花神之镜', '点击花神之镜按钮（签到面板）');
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('godMirror.GodMirrorModule');
        }

        /**按秒刷新 */
        private onTime() {
            if (--this.changeCd < 0) {
                this.changeSuitMirror();
            }
        }

        addEvent() {
            Laya.timer.loop(1000, this, this.onTime);
            BC.addEvent(this, this.ui.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this, this.ui.btnSign, Laya.Event.CLICK, this, this.onSign);
            BC.addEvent(this, this.ui.btnResign, Laya.Event.CLICK, this, this.onReSign);
            BC.addEvent(this, this.ui.btnMirror, Laya.Event.CLICK, this, this.onMirror);
            BC.addEvent(this, this.ui.btnDraw, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.ui.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.ui.dot1, Laya.Event.CLICK, this, this.changeSuitMirror);
            BC.addEvent(this, this.ui.dot2, Laya.Event.CLICK, this, this.changeSuitMirror);
        }

        removeEvent() {
            Laya.timer.clear(this, this.onTime);
            BC.removeEvent(this);
        }

        destory() {
            this._person?.destroy();
            for (const o of this._cellArr) {
                o.destroy();
            }
            this._cellArr = [];
        }
    }
}