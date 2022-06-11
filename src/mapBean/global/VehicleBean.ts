
namespace mapBean {
    /**
     * 花车触发
     */
    export class VehicleBean implements core.IGlobalBean {

        private _vehicle: Vehicle;
        private _map: VehicleGift[] = [];
        private _startT: number; //活动开始时间
        private _closeT: number; //活动结束时间
        private _t: time.GTime;

        async start(): Promise<void> {
            await Promise.all([
                xls.load(xls.cruise),
                xls.load(xls.cruiseGift)
            ])
            this.init();
            this.addEvenets();
        }
        destory(): void {
            this.removeEvents();
        }

        /** 初始化*/
        private init(): void {
            if (!this.checkActitity()) return;
            net.sendAndWait(new pb.cs_mimi_float_get_info()).then((msg: pb.sc_mimi_float_get_info) => {
                if (!util.TimeUtil.isSameDay(clientCore.ServerManager.curServerTime, msg.lastTime)) return;
                let passT: number = clientCore.ServerManager.curServerTime - msg.lastTime;
                let cd: number = xls.get(xls.cruise).get(1).cdTime;
                if (passT > cd && passT - cd < 60) {
                    let content: string = `米米奇将在${passT - cd}秒后在${xls.get(xls.map).get(msg.mapId).name}进行花车巡游，小花仙们快去为他欢呼吧！`;
                    this.showChat(content);
                    this.showNotice(content);
                }
            });
            time.ServerClock.instance.reg('21:00:00', this.onClock);
        }

        private onClock(): void {
            alert.stopWorlds(alert.Sign.FLOWER_VEHICLE);
            alert.stopWorlds(alert.Sign.FOLWER_VEHICLE_SHOW);
        }

        private addEvenets(): void {
            BC.addEvent(this, EventManager, globalEvent.START_CHANGE_MAP, this, this.cleanVehicle);
            BC.addEvent(this, EventManager, globalEvent.ENTER_MAP_SUCC, this, this.checkVehicle);
            BC.addEvent(this, EventManager, globalEvent.VEHICLE_SHOW, this, this.onShowGift);
            net.listen(pb.sc_mimi_float_appear_notify, this, this.onNewsNotify); //跑马灯通知
            net.listen(pb.sc_mimi_float_appear_car_start_notify, this, this.onVehicleNotify); //花车出现通知
        }

        private removeEvents(): void {
            BC.removeEvent(this);
            net.unListen(pb.sc_mimi_float_appear_notify, this, this.onNewsNotify);
            net.unListen(pb.sc_mimi_float_appear_car_start_notify, this, this.onVehicleNotify);
        }

        /** 清理花车*/
        private cleanVehicle(): void {
            this._t?.dispose();
            this._t = null;
            this._vehicle?.end();
            this.cleanGift();
            util.TweenUtils.remove('Vehicle');
        }

        /** 检查是否有花车*/
        private checkVehicle(): void {
            if (clientCore.MapInfo.type != 5 || !this.checkActitity()) return;
            net.sendAndWait(new pb.cs_mimi_float_get_info()).then((msg: pb.sc_mimi_float_get_info) => { this.initVehicle(msg); });
        }

        private initVehicle(msg: pb.sc_mimi_float_get_info): void {
            let startT: number = msg.lastTime + 60;
            let passT: number = clientCore.ServerManager.curServerTime - msg.lastTime;
            let isDraw: boolean = msg.isDraw == 1;
            if (passT >= 60) {
                util.TimeUtil.isSameDay(msg.lastTime, clientCore.ServerManager.curServerTime) && this.createVehicle(msg.mapId, msg.posIdx, startT, isDraw);
            }
        }

        private showChat(content: string): void {
            let data: pb.chat_msg_t = new pb.chat_msg_t();
            data.sendNick = '系统消息';
            data.chatType = 1;
            data.content = content;
            data.sendUid = 2;
            data.sendTime = clientCore.ServerManager.curServerTime;
            EventManager.event(globalEvent.FAKE_SYSTEM_MESSAGE_NOTICE, [data]);
        }

        private showNotice(content: string): void {
            let info: alert.ScrollWordInfo = new alert.ScrollWordInfo();
            info.bgPath = 'res/alert/worldNotice/108.png';
            info.width = 752;
            info.y = 25;
            info.value = content;
            info.sizeGrid = '0,0,0,0';
            info.fontColor = '#ffebb5';
            info.fontSize = 20;
            info.sign = alert.Sign.FLOWER_VEHICLE;
            alert.showWorlds(info);
        }

        private onNewsNotify(msg: pb.sc_mimi_float_appear_notify): void {
            let content: string = `米米奇将在四分钟后在${xls.get(xls.map).get(msg.mapId).name}为大家带来礼物，小花仙们快去找到米米奇吧！`;
            this.showChat(content);
            for (let i: number = 0; i < 5; i++) { this.showNotice(content); }
        }

        /**
         * 花车出现通知
         */
        private onVehicleNotify(msg: pb.sc_mimi_float_appear_car_start_notify): void {
            alert.stopWorlds(alert.Sign.FLOWER_VEHICLE);
            this.cleanGift();
            this.createVehicle(msg.mapId, msg.posIdx, clientCore.ServerManager.curServerTime, false);
        }

        /**
         * 创建花车
         * @param id 地图ID
         * @param pos 礼物位置
         * @param startT 开始时间
         * @param isDraw 是否已经领取了奖励
         */
        private createVehicle(id: number, pos: number, startT: number, isDraw: boolean): void {
            if (this.checkActitity() && clientCore.MapInfo.type == 5 && id == clientCore.MapInfo.mapID) {
                let site: xls.pair[] = this.getPoints(id);
                if (!site) return;
                let point: xls.pair = site[pos - 1];
                this._vehicle = this._vehicle || new Vehicle();
                this._vehicle.start(point, startT, isDraw);
            }
        }

        private onShowGift(x: number, y: number, draw: boolean): void {
            this.showGift(x, y, draw);
            this.showTime();
        }

        /** 定时器检查礼物是否需要消失*/
        private showTime(): void {
            this._t?.dispose();
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
            this._t.start();
        }

        private onTime(): void {
            if (!this.checkActitity()) { //活动结束了 
                this.cleanVehicle();
            }
        }

        private showGift(x: number, y: number, draw: boolean): void {
            let item: VehicleGift = new VehicleGift();
            item.init(x, y, draw);
            this._map.push(item);
        }

        private cleanGift(): void {
            _.forEach(this._map, (element: VehicleGift) => { element.dispose(); });
            this._map.length = 0;
        }

        /** 检查是否在活动时间内*/
        private checkActitity(): boolean {
            let ct: number = clientCore.ServerManager.curServerTime;
            let event: xls.eventControl = xls.get(xls.eventControl).get(45);
            let arr: string[] = event.eventTime.split("_");
            let dst: number = util.TimeUtil.formatTimeStrToSec(arr[0]);
            let det: number = util.TimeUtil.formatTimeStrToSec(arr[1]);
            if (ct < dst || ct > det) return false; //不在活动日期
            let array: string[] = xls.get(xls.cruise).get(1).everydayTime.split('_');
            this._startT = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' ' + array[0]);
            this._closeT = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(ct) + ' ' + array[1]);
            return ct >= this._startT && ct <= this._closeT;
        }

        /**
         * 获取地图的礼物掉落点
         * @param mapId 
         */
        private getPoints(mapId: number): xls.pair[] {
            let array: xls.cruiseGift[] = _.filter(xls.get(xls.cruiseGift).getValues(), (element) => { return element.mapId == mapId; });
            if (array.length <= 0) return null;
            return array[0].site;
        }
    }

    export class Vehicle extends Laya.Sprite {
        private readonly speed: number = 0.05;
        private _bone: clientCore.Bone;
        private _gift: clientCore.Bone;
        private _site: xls.pair; //礼物的落点

        private _startT: number;
        private _passT: number;
        private _expectT: number;
        private _isLaunch: boolean; //是否投放了
        private _isDraw: boolean;
        private _sound: Laya.SoundChannel;
        constructor() {
            super();
        }

        start(site: xls.pair, startT: number, isDraw: boolean): void {
            if (this.parent) return;
            this._isDraw = isDraw;
            this._isLaunch = false;
            this._startT = startT * 1000;
            this._passT = clientCore.ServerManager.curServerTime * 1000 - this._startT;
            this._expectT = (clientCore.MapInfo.mapWidth - site.v1) / this.speed;
            this._bone = clientCore.BoneMgr.ins.play('res/animate/activity/huache.sk', 0, true, this);
            this._site = site;
            this._sound = core.SoundManager.instance.playSound('res/sound/vehicle_pass.ogg', 0);
            core.SoundManager.instance.pauseBgm();
            this.pos(clientCore.MapInfo.mapWidth, 300);
            let layer: Laya.Sprite = clientCore.MapManager.upLayer;
            Laya.timer.frameLoop(1, this, this.onFrame);
            layer.addChild(this);
        }
        end(): void {
            Laya.timer.clear(this, this.onFrame);
            this._bone?.dispose();
            this._bone = null;
            this._gift?.dispose();
            this._gift = null;
            this._sound?.stop();
            this._sound = null;
            core.SoundManager.instance.recover();
            this.removeSelf();
        }
        private onFrame(): void {
            this._passT += Laya.timer.delta;
            this.x = clientCore.MapInfo.mapWidth - this._passT * this.speed;
            if (!this._isLaunch) {
                let dt: number = this._passT - this._expectT;
                if (dt >= 0) {
                    this._isLaunch = true;
                    dt <= 1000 ? this.showGiftAni() : this.eventGift();
                }
            }
            this.x < -768 && this.end();
        }
        private showGiftAni(): void {
            core.SoundManager.instance.playSound('res/sound/gift_down.ogg');
            this._gift = clientCore.BoneMgr.ins.play('res/animate/activity/drop.sk', 0, true, clientCore.MapManager.curMap.giftLayer);
            this._gift.pos(this._site.v1, this.y);
            util.TweenUtils.creTween(this._gift, { y: this._site.v2 }, 2000, Laya.Ease.backInOut, this, this.callFunc, 'Vehicle');
        }
        private callFunc(): void {
            core.SoundManager.instance.playSound('res/sound/gift_land.ogg');
            this.eventGift();
        }
        private eventGift(): void {
            this._gift?.dispose();
            this._gift = null;
            EventManager.event(globalEvent.VEHICLE_SHOW, [this._site.v1, this._site.v2, this._isDraw]);
        }
    }

    /**
     * 花车礼物
     */
    export class VehicleGift {
        private _bone: clientCore.Bone;
        private _draw: boolean;

        constructor() { }

        init(x: number, y: number, draw: boolean): void {
            this._draw = draw;
            this._bone = clientCore.BoneMgr.ins.play('res/animate/activity/gift.sk', 0, true, clientCore.MapManager.curMap.giftLayer, null, true);
            this._bone.on(Laya.Event.CLICK, this, this.onGift);
            this._bone.pos(x, y);
        }

        private onGift(): void {
            if (this._draw) {
                alert.showFWords('奖励已领取，请期待米米奇新的巡游~');
                return;
            }
            net.sendAndWait(new pb.cs_mimi_float_draw_award()).then((msg: pb.sc_mimi_float_draw_award) => {
                this._draw = true;
                alert.showReward(msg.itms);
            });
        }

        dispose(): void {
            this._bone?.dispose();
            this._bone = null;
        }
    }
}