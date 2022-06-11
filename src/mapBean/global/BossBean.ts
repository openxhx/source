namespace mapBean {
    /**
     * boss
     */
    export class BossBean implements core.IGlobalBean {
        private _bossRaidID: number = 1; //boss信息表ID xls.bossRaid
        private _map: number[] = []; //boss出现的地图ID集合
        private _wt: number;
        private _et: number;
        private _t: time.GTime;
        private _cls: xls.bossRaid;

        constructor() { }

        start(): void {
            this.addEvents();
        }

        private addEvents(): void {
            BC.addEvent(this, EventManager, globalEvent.START_CHANGE_MAP, this, this.cleanWorldBoss);
            BC.addEvent(this, EventManager, globalEvent.ENTER_MAP_SUCC, this, this.checkWorldBoss);
        }

        private removeEvent(): void {
            BC.removeEvent(this);
        }

        /** 检查世界boss*/
        private async checkWorldBoss(): Promise<void> {
            clientCore.MapInfo.type == 4 && clientCore.Logger.sendLog('活动', '世界BOSS', '进入BOSS地图');
            this._cls = xls.get(xls.bossRaid).get(this._bossRaidID);
            if (!this._cls) {
                console.error(`表bossRaid中似乎没有id${this._bossRaidID}的信息~`);
                return;
            }
            _.forEach(this._cls.map, (element: xls.triple) => { this._map.push(element.v1); });
            if (clientCore.MapInfo.type == 4 || (clientCore.MapInfo.type == 5 && _.indexOf(this._map, clientCore.MapInfo.mapID) != -1)) {
                let data: pb.sc_get_world_boss_info = await clientCore.BossManager.ins.getBossInfo();
                let currT: number = clientCore.ServerManager.curServerTime;
                if (data.showTime > 0) {
                    if (data.showTime > currT) {// BOSS处于展示阶段
                        clientCore.BossManager.ins.createWorldBoss(this._cls, Math.max(data.showTime, data.closeTime));
                    } else if (clientCore.MapInfo.type != 4 && currT < data.closeTime) {
                        clientCore.BossManager.ins.createWorldBoss(this._cls, data.closeTime);
                    }
                    return;
                }
                this._wt = data.prepareTime;
                this._et = data.closeTime;
                let info: { open: boolean, delay: number } = this.checkActivity();
                // 活动期间
                if (info.open) {
                    clientCore.BossManager.ins.createWorldBoss(this._cls, info.delay);
                    net.listen(pb.sc_world_boss_blood_notify, this, this.onBloodNotify);
                    return;
                }
                // 活动未开始 创建定时器
                if (info.delay > 0) {
                    this._t?.dispose();
                    this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
                    this._t.start();
                }
            }
        }

        private onTime(): void {
            let info: { open: boolean, delay: number } = this.checkActivity();
            if (info.open) {
                this._t?.dispose();
                this._t = null;
                clientCore.BossManager.ins.createWorldBoss(this._cls, info.delay);
                net.listen(pb.sc_world_boss_blood_notify, this, this.onBloodNotify);
            }
        }

        /**
         * 检查活动阶段
         * @return 
         */
        private checkActivity(): { open: boolean, delay: number } {
            let ct: number = clientCore.ServerManager.curServerTime;
            if (ct < this._wt) return { open: false, delay: this._wt - ct }; //活动未开始
            if (ct > this._et) return { open: false, delay: 0 }; //活动结束
            return { open: true, delay: this._et };
        }

        private onBloodNotify(msg: pb.sc_world_boss_blood_notify): void {
            if (parseFloat(msg.blood) <= 0) clientCore.BossManager.ins.boss.dieT = msg.showTime;
            //当前处于世界boss地图
            clientCore.MapInfo.type == 4 && EventManager.event(globalEvent.BOSS_BLOOD_REFRESH, msg);
        }

        /** 清理一次BOSS信息*/
        cleanWorldBoss(): void {
            net.unListen(pb.sc_world_boss_blood_notify, this, this.onBloodNotify);
            clientCore.BossManager.ins.leaveMap();
            this._t?.dispose();
            this._map.length = 0;
            this._cls = this._t = null;
        }

        destory(): void {
            this.removeEvent();
            this.cleanWorldBoss();
        }
    }
}