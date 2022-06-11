namespace mapBean{
    /**
     * 迎福纳彩贺新年活动Bean
     */
    export class NewYearBean implements core.IGlobalBean{

        /**福袋坐标 */
        private _allpos: xls.pair[] = [
            { v1: 3640, v2: 1000 }, { v1: 3934, v2: 1054 }, { v1: 2620, v2: 1076 }, { v1: 2700, v2: 1274 }, { v1: 2466, v2: 1174 },
            { v1: 2320, v2: 1292 }, { v1: 2164, v2: 1170 }, { v1: 2000, v2: 1244 }, { v1: 2300, v2: 994 }, { v1: 2000, v2: 970 },
            { v1: 1784, v2: 800 }, { v1: 534, v2: 700 }, { v1: 1454, v2: 1366 }, { v1: 1146, v2: 1140 }, { v1: 1244, v2: 1308 },
            { v1: 1000, v2: 1304 }, { v1: 772, v2: 1210 }, { v1: 482, v2: 1212 }, { v1: 700, v2: 1386 }, { v1: 1030, v2: 1494 },
            { v1: 1086, v2: 1722 }, { v1: 766, v2: 1620 }, { v1: 790, v2: 1840 }, { v1: 552, v2: 1720 }, { v1: 2080, v2: 1936 },
            { v1: 1782, v2: 1906 }, { v1: 1756, v2: 2126 }, { v1: 1472, v2: 1956 }, { v1: 530, v2: 1516 }, { v1: 2102, v2: 740 }
        ];
        private _fu: clientCore.FuAvatar;
        private _npc: clientCore.NpcAvatar;
        private _monster: clientCore.NianAvatar;

        private _t: time.GTime;

        async start(): Promise<void>{
            await Promise.all([
                res.load('atlas/commonNewYear.atlas',Laya.Loader.ATLAS),
                xls.load(xls.godTree)
            ]);
            this.addEvents();
        }
        destory(): void{
            this.removeEvents();
        }
        addEvents(): void{
            BC.addEvent(this, EventManager, globalEvent.START_CHANGE_MAP, this, this.startChangeMap);
            BC.addEvent(this, EventManager, globalEvent.ENTER_MAP_SUCC, this, this.enterMap);
            BC.addEvent(this, EventManager, globalEvent.COLLISION_FU, this, this.collisionFu);

            //通知
            net.listen(pb.sc_new_year_npc_out_time_flag_notify,this,this.synTimeOut);
        }
        removeEvents(): void{
            BC.removeEvent(this);
        }
        /** 开始切换地图*/
        private startChangeMap(): void{
            this._fu?.dispose();
            this._fu = null;
            this._npc?.dispose();
            this._npc = null;
            this._t?.dispose();
            this._t = null;
            this.clearMonster();
        }
        /** 切换地图成功*/
        private enterMap(): void{
            if(!this.checkActivity())return;
            if(clientCore.MapInfo.isOthersHome && clientCore.FriendManager.instance.checkIsFriend(parseInt(clientCore.MapInfo.mapData))){ //在好友地图
                this.createFu();
            }else if(clientCore.MapInfo.type == 5){//在世界地图
                this.createNpc();
                this.checkNian();
            }
        }

        /** 当前地图NPC过期了*/
        private synTimeOut(): void{
            clientCore.NewYearManager.instance.npcCache = {};
            this._npc?.dispose();
            this._npc = null;
            this.createNpc();
        }
        
        private createFu(): void{
            let pos: xls.pair = this._allpos[_.random(0,this._allpos.length - 1)];
            this._fu = clientCore.AvatarManager.ins.createFu('commonNewYear/fudai.png');
            this._fu.pos(pos.v1,pos.v2);
        }

        /** 撞福袋*/
        private collisionFu(): void{
            this._fu = null;
            this.createFu();
            this.sendFindFu();
        }

        /** 找福*/
        private sendFindFu(): void{
            net.sendAndWait(new pb.cs_new_years_active_find_fu()).then((msg: pb.sc_new_years_active_find_fu)=>{
                alert.showReward(msg.items);
            });
        }

        /** 创建npc*/
        private createNpc(): void{
            let mapId: number = clientCore.MapInfo.mapID;
            net.sendAndWait(new pb.cs_new_years_refresh_npc({mapId: mapId})).then((msg: pb.sc_new_years_refresh_npc)=>{
                let array: xls.triple[] = clientCore.GlobalConfig.config.newYearNpcSite;
                let pos: xls.triple = _.find(array,(element: xls.triple)=>{ return element.v1 == mapId; });
                this._npc = clientCore.AvatarManager.ins.createNpc(msg.npcId);
                this._npc.pos(pos.v2,pos.v3);
            })
        }

        /** 检查年兽*/
        private checkNian(): void{
            net.sendAndWait(new pb.cs_new_years_monster_map_id()).then((msg: pb.sc_new_years_monster_map_id)=>{
                if(msg.mapId == clientCore.MapInfo.mapID){ //年兽会在当前地图刷新
                    this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON,1000,this,this.onTime);
                    this._t.start();
                }else{
                    clientCore.MapManager.curMap.mapPick.hidePicks(118);
                }
            });
        }

        private onTime(): void{
            let bTime: boolean = this.checkNianTime();
            //在活动时间内 创建年兽
            bTime && !this._monster && this.createMonster();
            //不在活动时间内 年兽消失
            if(this._monster && !bTime){
                this.clearMonster();
                clientCore.MapManager.curMap.mapPick.hidePicks(118);
            }
        }

        /** 清理年兽*/
        private clearMonster(): void{
            this._monster?.dispose();
            this._monster = null;
        }

        /** 创建年兽*/
        private createMonster(): void{
            let array: xls.triple[] = clientCore.GlobalConfig.config.newYearMonsterSite;
            let pos: xls.triple = _.find(array,(element: xls.triple)=>{ return element.v1 == clientCore.MapInfo.mapID; });
            this._monster = clientCore.AvatarManager.ins.createNian();
            this._monster.pos(pos.v2,pos.v3);
        }

        /** 检查年兽时间*/
        private checkNianTime(): boolean{
            let now: number = clientCore.ServerManager.curServerTime;
            let st: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 12:00:00');
            let et: number = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 14:00:00');
            if(now >= st && now <= et)return true;
            st = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 18:00:00'); 
            et = util.TimeUtil.formatTimeStrToSec(util.TimeUtil.formatDate(now) + ' 20:00:00');
            if(now >= st && now <= et)return true;
            return false;
        }

        /** 检查活动时间*/
        private checkActivity(): boolean{
            let now: number = clientCore.ServerManager.curServerTime;
            let cfg: xls.eventControl = xls.get(xls.eventControl).get(118);
            let array: string[] = cfg.eventTime.split('_');
            let st: number = util.TimeUtil.formatTimeStrToSec(array[0]);
            let et: number = util.TimeUtil.formatTimeStrToSec(array[1]);
            return now >= st && now <= et;
        }
    }
}