namespace clientCore {
    /**
     * boss管理者
     */
    export class BossManager {
        /** boss对应的角色ID*/
        public static readonly BOSS_ROLD_ID: number = 1410019;
        // private _commonData: xls.bossCommomData;
        // private _bossRaidID: number = 1; //boss信息表ID xls.bossRaid
        // private _map: number[] = []; //boss出现的地图ID集合
        // private _wt: number;
        // private _et: number;
        // private _t: time.GTime;
        // private _cls: xls.bossRaid;
        private _boss: BossXM;
        /** 从哪个世界地图进入的BOSS战*/
        public mapID: number;

        public bossInfo:pb.sc_get_world_boss_info;


        constructor() { }

        public async setup(): Promise<void> {
            await Promise.all([
                xls.load(xls.bossCommomData),
                xls.load(xls.bossRaid),
                this.getBossInfo()
            ]);
        }

        // /** 检查世界boss*/
        // public async checkWorldBoss(): Promise<void> {
        //     this._cls = xls.get(xls.bossRaid).get(this._bossRaidID);
        //     if (!this._cls) {
        //         console.error(`表bossRaid中似乎没有id${this._bossRaidID}的信息~`);
        //         return;
        //     }

        //     _.forEach(this._cls.map, (element: xls.triple) => { this._map.push(element.v1); })
        //     if (MapInfo.type == 4 || (MapInfo.type == 5 && _.indexOf(this._map, MapInfo.mapID) != -1)) {
        //         let data: pb.sc_get_world_boss_info = await this.getBossInfo();
        //         // BOSS处于展示阶段
        //         if (data.showTime > 0 && data.showTime > clientCore.ServerManager.curServerTime) {
        //             this.createWorldBoss(this._cls, data.showTime);
        //             return;
        //         }
        //         this._wt = data.prepareTime;
        //         this._et = data.closeTime;
        //         let info: { open: boolean, delay: number } = this.checkActivity();
        //         // 活动期间
        //         if (info.open) {
        //             this.createWorldBoss(this._cls, info.delay);
        //             net.listen(pb.sc_world_boss_blood_notify, this, this.onBloodNotify);
        //             return;
        //         }
        //         // 活动未开始 创建定时器
        //         if (info.delay > 0) {
        //             this._t?.dispose();
        //             this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onTime);
        //             this._t.start();
        //         }
        //     }
        // }

        // private onTime(): void {
        //     let info: { open: boolean, delay: number } = this.checkActivity();
        //     if (info.open) {
        //         this.createWorldBoss(this._cls, info.delay);
        //         net.listen(pb.sc_world_boss_blood_notify, this, this.onBloodNotify);
        //     }
        // }

        /** 离开地图*/
        public leaveMap(): void {
            this._boss = null;
        }

        public createWorldBoss(data: xls.bossRaid, delay: number): void {
            this._boss = AvatarManager.ins.createBoss(data, delay);
            if (MapInfo.type != 4) {
                this._boss.clickHandler = Laya.Handler.create(this, this.onClick, null, false);
            } else {
                this._boss.pos(1512, 987);//TODO 策划说在boss地图的boss写死位置
                EventManager.event(globalEvent.BOSS_CREATE_SUC); //因为创建boss是在界面创建之后的 所以告知下
            }
        }

        public get boss(): BossXM {
            return this._boss;
        }

        private onClick(): void {
            alert.showSmall('是否要进入净化状态？', {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        this.mapID = MapInfo.mapID;
                        MapManager.enterBossMap(19);
                    }]
                }
            })
        }

        /** 获取世界boss的信息*/
        public getBossInfo(): Promise<pb.sc_get_world_boss_info> {
            return net.sendAndWait(new pb.cs_get_world_boss_info()).then((data: pb.sc_get_world_boss_info) => {
                this.bossInfo = data;
                return Promise.resolve(data);
            })
        }

        // /**
        //  * 检查活动阶段
        //  * @return 
        //  */
        // private checkActivity(): { open: boolean, delay: number } {
        //     let ct: number = clientCore.ServerManager.curServerTime;
        //     if (ct < this._wt) return { open: false, delay: this._wt - ct }; //活动未开始
        //     if (ct > this._et) return { open: false, delay: 0 }; //活动结束
        //     return { open: true, delay: this._et };
        // }

        // private onBloodNotify(msg: pb.sc_world_boss_blood_notify): void {
        //     if (msg.blood <= 0) this._boss.dieT = msg.showTime;
        //     //当前处于世界boss地图
        //     if (MapInfo.type == 4) {
        //         this._commonData = this._commonData || xls.get(xls.bossCommomData).get(1);
        //         //TODO 根据血量的差异 boss有不一样的表现
        //         EventManager.event(globalEvent.BOSS_BLOOD_REFRESH, msg.blood);
        //     }
        // }

        private static _ins: BossManager;
        public static get ins(): BossManager {
            return this._ins || (this._ins = new BossManager());
        }
    }
}