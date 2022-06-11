namespace clientCore {
    /**
     * 线索搜寻
     */
    export class SearchClubsMapManager {
        private _list: Array<SearchClubsMapData>;
        public readonly DAILY_CULE_NUM: number = 10;
        public readonly MONEY_ID: number = 9900203;
        public readonly cherry_blossoms_id: number = 9900206;
        public searchData: SearchClubsVo;
        public readonly MAP_ID: number = 12;
        //每次显示4个
        private readonly EVERY_SHOW_CNT: number = 4;
        //活动的开始和结束时间(补充)
        private readonly ACTIVITY_TIMERS: string[] = ["2021-7-20 00:00:00", "2021-8-12 23:59:59"];
        //地图元素坐标值
        private readonly mapItemPos: Array<{ x: number, y: number }> = [
            { x: 1900, y: 480 }, { x: 2859, y: 1162 },
            { x: 415, y: 744 }, { x: 835, y: 680 }, { x: 2532, y: 1505 },
            { x: 370, y: 1515 }, { x: 1560, y: 1545 },
            { x: 915, y: 1203 }, { x: 2112, y: 132 }
        ];


        private getInitPanel(): Promise<pb.sc_memories_of_girls_info> {
            return net.sendAndWait(new pb.cs_memories_of_girls_info()).then((msg: pb.sc_memories_of_girls_info) => {
                return Promise.resolve(msg);
            });
        }

        /**
         * 初始化数据
         */
        public async resetData(): Promise<void> {
            return new Promise<void>(resolve => {
                this.getInitPanel().then(data => {
                    this.searchData = { flag: data.flag, clueFinish: data.clueFinish, clueReward: data.clueReward };
                    resolve();
                });
            });
        }

        public getStatistics(num: number): number {
            let result: number = 0;
            for (let i: number = 0; i < this.DAILY_CULE_NUM; i++) {
                if (util.getBit(num, i + 1) == 1) {
                    result++;
                }
            }
            return result;
        }

        //获取元素坐标下标
        private getMapItemsPosIndexs(cnt: number): number[] {
            let backs: number[] = [];
            let index: number;
            let i: number, j: number, finded: boolean;
            while (backs.length < cnt) {
                index = this.randomNumBoth(0, this.mapItemPos.length - 1);
                if (backs.length == 0) {
                    backs.push(index);
                } else {
                    finded = false;
                    for (i = 0, j = backs.length; i < j; i++) {
                        if (backs[i] == index) {
                            finded = true;
                            break;
                        }
                    }
                    if (!finded) {
                        backs.push(index);
                    }
                }
            }
            return backs;
        }

        //向地图加入樱花图标
        private addAnimalToMap(mapid: number = 12): void {
            this.clearItems();
            if (mapid != this.MAP_ID) {
                return;
            }
            let i: number, j: number;
            let indexs: number[] = [];//显示的点
            for (i = 0, j = this.DAILY_CULE_NUM; i < j; i++) {
                if (util.getBit(this.searchData.clueReward, i + 1) != 1) {
                    indexs.push(i);
                    if (indexs.length >= this.EVERY_SHOW_CNT) {
                        break;
                    }
                }
            }
            if (indexs.length == 0) {//今日都已经领取了
                return;
            }
            let cell: Laya.Image;
            let model: SearchClubsMapData;
            let pos: { x: number, y: number };
            const posIndexs: number[] = this.getMapItemsPosIndexs(indexs.length);
            for (i = 0, j = indexs.length; i < j; i++) {
                cell = new Laya.Image(clientCore.ItemsInfo.getItemIconUrl(this.cherry_blossoms_id));
                cell.width = 135;
                cell.height = 135;
                cell.anchorX = cell.anchorY = 0.5;
                pos = this.mapItemPos[posIndexs[i]];
                cell.x = pos.x;
                cell.y = pos.y;
                model = {
                    index: indexs[i],
                    state: util.getBit(this.searchData.clueFinish, indexs[i] + 1) == 1 ? 1 : 0,
                    target: cell
                };
                MapManager.curMap.pickLayer.addChild(cell);
                this._list.push(model);
                BC.addEvent(this, cell, Laya.Event.CLICK, this, this.onClickHandler, [model]);
            }
        }

        //处理事件
        private onClickHandler(data: SearchClubsMapData): void {
            clientCore.ModuleManager.open("searchCherryClues.SearchCherryCluesModule", data);//进入到游戏
        }

        private clearItems(): void {
            BC.removeEvent(this);
            if (this._list.length > 0) {
                this._list.forEach(item => {
                    if (item.target) {
                        item.target.removeSelf();
                    }
                });
            }
            this._list.length = 0;
        }


        private constructor() {
            this._list = [];
        }

        /**
         * 随机算法
         */
        private randomNumBoth(min: number, max: number): number {
            const Range: number = max - min;
            if (Range != 0.0) {
                const Rand: number = Math.random();
                const num: number = min + Math.round(Rand * Range); //四舍五入
                return num;
            } else {
                return min;
            }
        }

        //添加事件
        public addEvent(): void {
            BC.addEvent("map_search_12", EventManager, globalEvent.ENTER_MAP_SUCC, this, this.onEnterSucc);
            BC.addEvent("map_search_12", EventManager, globalEvent.GIRLMOMORIES_CLEAR_CLUE, this, this.onClearClue);
        }

        private removeEvent(): void {
            BC.removeEvent("map_search_12");
        }

        //清除一个
        private onClearClue(data: SearchClubsMapData): void {
            let cell: SearchClubsMapData;
            if (data.state == 2) {//已经领取了奖励
                for (let i: number = 0, j: number = this._list.length; i < j; i++) {
                    cell = this._list[i];
                    if (cell.index == data.index) {
                        BC.removeEvent(this, cell.target, Laya.Event.CLICK, this, this.onClickHandler);
                        cell.target.removeSelf();
                        this._list.splice(i, 1);
                        break;
                    }
                }
                //是否需要再添加一个(预留)
            } else {
                for (let i: number = 0, j: number = this._list.length; i < j; i++) {
                    cell = this._list[i];
                    if (cell.index == data.index) {
                        cell = data;//更新数据
                        break;
                    }
                }
            }
        }

        //成功进入地图判断
        private onEnterSucc(): void {
            if (MapInfo.mapID == this.MAP_ID) {
                const type: SearchClubsDateType = this.checkDateType();
                if (type == SearchClubsDateType.GAMEING) {
                    this.getInitPanel().then((data) => {
                        this.searchData = { flag: data.flag, clueFinish: data.clueFinish, clueReward: data.clueReward };
                        this.addAnimalToMap(MapInfo.mapID);
                    });
                } else {
                    this.searchData = { flag: 1, clueFinish: 0, clueReward: 0 };//初始化
                    this.clearItems();
                    this.removeEvent();
                }
            } else {
                this.clearItems();
                this.removeEvent();
            }
        }
        //获取当前的活动时间的类型
        private checkDateType(): SearchClubsDateType {
            const now: number = clientCore.ServerManager.curServerTime;
            let sd: number = util.TimeUtil.formatTimeStrToSec(this.ACTIVITY_TIMERS[0]);
            if (now < sd) {
                return SearchClubsDateType.NONE_START;
            }
            let ed: number = util.TimeUtil.formatTimeStrToSec(this.ACTIVITY_TIMERS[1]);
            if (now > ed) {
                return SearchClubsDateType.OBSOLETE;
            }
            return SearchClubsDateType.GAMEING;
        }


        private static _ins: SearchClubsMapManager;
        public static get ins(): SearchClubsMapManager {
            return this._ins || (this._ins = new SearchClubsMapManager());
        }
    }
}