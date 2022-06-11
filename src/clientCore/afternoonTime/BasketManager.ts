

namespace clientCore {
    /**
     * 饼干花篮管理类
     */
    export class BasketManager {

        /** 以所有者的id为key*/
        private basketMap: util.HashMap<Basket> = new util.HashMap<Basket>();
        private infoMap: util.HashMap<number> = new util.HashMap<number>();
        private _waiting: number[];
        private _waitMsg: boolean;
        public _getCookNum: number;
        public _getTeaNum: number;
        public add(key: number, value: Basket): void {
            this.basketMap.add(key, value);
        }

        public remove(key: number): void {
            this.basketMap.remove(key);
        }

        public addInfo(key: number, value: number) {
            this.infoMap.add(key, value);
        }

        private static _ins: BasketManager;
        public static get ins(): BasketManager {
            return this._ins || (this._ins = new BasketManager());
        }

        init() {
            this._waiting = [];
            BC.addEvent(this, EventManager, globalEvent.ENTER_MAP_SUCC, this, this.refreshInfo);
            Laya.timer.loop(3000, this, this.refreshInfo);
            net.listen(pb.sc_thanks_afternoon_cookie_notify, this, this.worldNotice);
            this.getInfo();
            EventManager.on(globalEvent.PRODUCE_GET_ALL_PRODUCTION, this, this.goAfternoonTime);//监听一键领取事件
            Laya.timer.loop(60000, this, this.resetNum)
        }

        private getInfo() {
            net.sendAndWait(new pb.cs_thanks_afternoon_info({ week: 3 })).then((msg: pb.sc_thanks_afternoon_info) => {
                this._getCookNum = msg.getCookie;
                this._getTeaNum = msg.dailyTea;
            })
        }

        public async refreshInfo() {
            if (MapInfo.mapID == 11) {
                PeopleManager.getInstance().player.creatBasket();
                let ids = _.map(PeopleManager.getInstance().getAllPlayerIdInMap(), (o) => { return parseInt(o) });
                ids.push(LocalInfo.uid);
                await this.updata(ids);
            } else {
                this.basketMap.get(LocalInfo.uid) && (this.basketMap.get(LocalInfo.uid).visible = false);
            }
        }

        public getBasketNum(id: number) {
            if (!this.infoMap.has(id)) {
                this.updata([id]);
                return 10;
            }
            return this.infoMap.get(id);
        }

        private async updata(ids: number[]) {
            if (this._waitMsg) {
                this._waiting = this._waiting.concat(ids);
                return;
            }
            this._waitMsg = true;
            let msg = await this.requestNum(ids);
            for (let i = 0; i < ids.length; i++) {
                this.infoMap.add(ids[i], msg.num[i]);
                this.basketMap.get(ids[i]) && this.basketMap.get(ids[i]).update(msg.num[i]);
            }
            this._waitMsg = false;
            if (this._waiting.length > 0) {
                this.updata(this._waiting.slice());
                this._waiting = [];
            }
        }

        private requestNum(ids: number[]): Promise<pb.sc_thanks_afternoon_get_cookie_num> {
            return net.sendAndWait(new pb.cs_thanks_afternoon_get_cookie_num({ uid: ids })).then((msg: pb.sc_thanks_afternoon_get_cookie_num) => {
                return Promise.resolve(msg);
            })
        }

        private worldNotice() {
            //跑马灯
            let str = "您的饼干篮已被取走部分饼干，回赠的饼干将自动进入您的背包哦~";
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/105.png';
            info.width = 752;
            info.y = 23;
            info.value = str;
            info.sizeGrid = '0,189,0,378';
            alert.showWorlds(info);
        }

        /**感恩午后一键领取，制茶花朵集齐 */
        private goAfternoonTime() {
            if (clientCore.ItemsInfo.checkHaveItem(2110529)) {
                EventManager.off(globalEvent.PRODUCE_GET_ALL_PRODUCTION, this, this.goAfternoonTime);//监听一键领取事件
                return;
            }
            if (this._getTeaNum < 10) {
                let times: number = this._getTeaNum == 10 ? 10 : this._getTeaNum + 1
                let config = xls.get(xls.activityshop).get(times);
                if ((clientCore.ItemsInfo.getItemNum(config.meterial[1].v1) >= config.meterial[1].v2) && this._getTeaNum != 10) {
                    alert.showSmall(`制茶所需得花朵已集齐，是否要返回制茶？`, {
                        callBack: {
                            caller: this, funArr: [() => {
                                clientCore.MapManager.enterWorldMap(11, new Laya.Point(230, 600)).then(() => {
                                    clientCore.ModuleManager.open('afternoonTime.BrewTeaPanel');
                                })
                            }]
                        }
                    })
                }
            }
            else {
                EventManager.off(globalEvent.PRODUCE_GET_ALL_PRODUCTION, this, this.goAfternoonTime);//监听一键领取事件
            }
        }

        private resetNum() {
            let now: number = clientCore.ServerManager.curServerTime - 60;
            if (!util.TimeUtil.isToday(now)) {
                this.getInfo();
            }
        }

    }
}