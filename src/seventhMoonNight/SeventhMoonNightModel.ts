namespace seventhMoonNight {
    export class SeventhMoonNightModel implements clientCore.BaseModel {
        /**主面板说明*/
        public readonly MAIN_RULE_ID: number = 1204;
        /**套装ID*/
        public readonly SUIT_ID: number = 2110465;
        /**Money*/
        public readonly MONEY_ID: number = 9900002;
        /**诗文的数量*/
        public readonly POEMS_COUNT: number = 12;

        /**界面信息*/
        public panelInfo: IPanelVo;

        //#region 制作花灯相关
        /**每天制作的最大数量*/
        public readonly DAILY_CREATE_MAX: number = 20;
        /**已经使用的原料下标*/
        private _usedMaterialIndexs: number[];
        /**当前的原料*/
        public curCreateMaterials: ICreateVo;
        /**制造花灯所需的原料*/
        private readonly CREATE_MATERIALS: Array<Array<IMaterialCreateVo>> = [
            [{id: 700001, cnt: 10}, {id: 710002, cnt: 20}],
            [{id: 700002, cnt: 10}, {id: 710003, cnt: 20}],
            [{id: 700003, cnt: 10}, {id: 710004, cnt: 20}],
            [{id: 700004, cnt: 10}, {id: 710005, cnt: 20}],
            [{id: 700005, cnt: 10}, {id: 710009, cnt: 20}]
        ];
        /**花灯的种类*/
        public readonly HUA_LIGHTS: number[] = [9900216, 9900217, 9900218];
        /**制作花灯语言*/
        public readonly LanBase_Creates: string[] = ["主人还差一点材料啊，没关系，我们尝试换2种材料吧~", "好了哦~要看看我做的花灯吗？"];

        //#endregion

        //#region Game
        /**游戏语言*/
        public readonly LanBase_Game: string[] = ["愿我的花灯能抵达彼岸", "希望拾到这盏花灯的人，获得我的祝福会开心~"];
        /**本次所使用的祈祷原料*/
        public _curPlayItems: IPlayFlowerUsingItemVo;
        /**本次使用的花灯*/
        public _curPlayFlower: IPlayFlowerUsingItemVo;
        /**放花灯所使用的材料*/
        private readonly PLAY_FLOWERLIGHT_ITEMS: IPlayFlowerUsingItemVo[] = [
            {
                index: 0,
                id: 9900001,
                cnt: 100,
                status: PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS,
                selected: false
            },
            {
                index: 1,
                id: 9900002,
                cnt: 10,
                status: PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS,
                selected: false
            },
            {
                index: 2,
                id: 9900193,
                cnt: 2,
                status: PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS,
                selected: false
            }
        ];
        /**小游戏倒计时*/
        public readonly COUNTDOWN_TIME_ALL_2GAME: number = 60;
        /**小游戏重复的屏数*/
        public readonly MAP_REPEATS_2GAME: number = 12;//15
        /**石头障碍的取值范围*/
        public readonly STONES_OBSTACLE: Array<Array<number>> = [
            [4, 4], [10, 8], [-1, -1]
        ];
        /**石头障碍物的留白信息*/
        public readonly GAMESTONES_BLANKS: Array<IGameStoneBlankVo> = [
            {left: 25, right: 26, bottom: 21},
            {left: 35, right: 33, bottom: 24},
            {left: 46, right: 42, bottom: 31}
        ];

        //#endregion

        constructor() {
            this._usedMaterialIndexs = [];
        }

        /**
         * 获取诗句领取的红点 ( 0: 无红点 , 1: 有红点 )
         */
        public getPoemReds(): number[] {
            let back: number[] = [];
            for (let i: number = 0, j: number = 6; i < j; i++) {
                if (util.getBit(this.panelInfo.rewardFlag, i + 1) != 1) {
                    if (util.getBit(this.panelInfo.poems, i * 2 + 1) == 1 && util.getBit(this.panelInfo.poems, i * 2 + 2) == 1) {
                        back.push(1);
                        continue;
                    }
                }
                back.push(0);
            }
            return back;
        }

        /**0: 不可领取, 1: 可领取, 2: 已领取*/
        public getPoemRewardStatus(index: number): number {
            if (util.getBit(this.panelInfo.rewardFlag, index) == 1) return 2;
            if (util.getBit(this.panelInfo.poems, 2 * index - 1) == 1 && util.getBit(this.panelInfo.poems, 2 * index) == 1) {
                return 1;
            }
            return 0;
        }

        /**
         * 最后(第七个诗句)奖励是否可以领取
         */
        public isPoem7CanGetting(): boolean {
            if (util.getBit(this.panelInfo.rewardFlag, 7) == 1) return false;//已经领取
            for (let i: number = 0, j: number = 6; i < j; i++) {
                if (util.getBit(this.panelInfo.poems, i * 2 + 1) != 1 || util.getBit(this.panelInfo.poems, i * 2 + 2) != 1) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 获取本地图的石头障碍物
         */
        public getStonesCfgs(mapIndex: number): Array<xls.gameFlowerLight> {
            let cell: Array<number>;
            let min: number = 1, max: number;
            for (let i: number = 0, j: number = this.STONES_OBSTACLE.length; i < j; i++) {
                cell = this.STONES_OBSTACLE[i];
                if (i != j - 1) {
                    if (mapIndex <= cell[0]) {
                        max = cell[1];
                        break;
                    } else {
                        min = cell[1] + 1;
                    }
                } else {
                    max = xls.get(xls.gameFlowerLight).getValues()[xls.get(xls.gameFlowerLight).length - 1].ty;
                }
            }
            //开始随机
            let bigIndex: number;
            while (true) {
                bigIndex = this.randomNumBoth(min, max + 1);
                if (bigIndex != max + 1) {
                    break;
                }
            }
            //获取随机石头列表
            let arr: Array<xls.gameFlowerLight> = xls.get(xls.gameFlowerLight).getValues();
            let back: Array<xls.gameFlowerLight> = [];
            let isFined: boolean = false;
            let cfg: xls.gameFlowerLight;
            for (let i: number = 0, j: number = arr.length; i < j; i++) {
                cfg = arr[i];
                if (cfg.ty == bigIndex) {
                    isFined = true;
                    back.push(cfg);
                } else {
                    if (isFined) {
                        break;
                    }
                }
            }
            return back;
        }

        /**
         * 获取诗句拥有的状态
         */
        public getPoemsHavedStatus(): number[] {
            let results: number[] = [];
            for (let i: number = 0; i < this.POEMS_COUNT; i++) {
                results.push(util.getBit(this.panelInfo.poems, i + 1));
            }
            return results;
        }

        /**是否存在某诗句*/
        public isHasPoem(index: number): boolean {
            return util.getBit(this.panelInfo.poems, index) == 1;
        }

        /**
         * 诗句是否全部集齐
         */
        public isPoemsAllCollection(): boolean {
            let isOk: boolean = true;
            for (let i: number = 0; i < this.POEMS_COUNT; i++) {
                if (util.getBit(this.panelInfo.poems, i + 1) != 1) {
                    isOk = false;
                    break;
                }
            }
            return isOk;
        }

        /**
         * 获取当前原料2个
         */
        public getCurCreateMaterial(): Array<IMaterialCreateVo> {
            const len: number = this.CREATE_MATERIALS.length;
            let index: number;
            if (this._usedMaterialIndexs.length <= len - 1) {
                while (true) {
                    index = this.randomNumBoth(0, len);
                    if (index == len) continue;
                    if (this._usedMaterialIndexs.indexOf(index) < 0) {
                        this._usedMaterialIndexs.push(index);
                        this.curCreateMaterials = {
                            material: this.CREATE_MATERIALS[index],
                            index: index
                        };
                        return this.curCreateMaterials.material;
                    }
                }
            } else {
                while (true) {
                    index = this.randomNumBoth(0, len);
                    if (index == len) continue;
                    break;
                }
                this._usedMaterialIndexs.length = 0;
                this.curCreateMaterials = {
                    material: this.CREATE_MATERIALS[index],
                    index: index
                };
                this._usedMaterialIndexs.push(index);
                return this.curCreateMaterials.material;
            }
        }

        /**
         * 当前材料是否足够
         */
        public isMaterialEnough(): boolean {
            let cell: IMaterialCreateVo;
            for (let i: number = 0, j: number = this.curCreateMaterials.material.length; i < j; i++) {
                cell = this.curCreateMaterials.material[i];
                if (clientCore.ItemsInfo.getItemNum(cell.id) < cell.cnt) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 今日建造是否到达最大数量
         */
        public isDailyCreateMax(): boolean {
            return this.panelInfo.hua >= this.DAILY_CREATE_MAX;
        }

        /**
         * 获取 放花灯控制面板 的列表数据
         */
        public getPlayFlowerLightListData(status: PlayFlowerLightHandlerPanelStatusType): IPlayFlowerListVo {
            let i: number, j: number;
            let arr: IPlayFlowerUsingItemVo[] = [];
            switch (status) {
                case PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER:
                    for (i = 0, j = this.HUA_LIGHTS.length; i < j; i++) {
                        arr.push({
                            index: i,
                            id: this.HUA_LIGHTS[i],
                            cnt: clientCore.ItemsInfo.getItemNum(this.HUA_LIGHTS[i]),
                            status: PlayFlowerLightHandlerPanelStatusType.SELECTEING_FLOWER,
                            selected: this._curPlayFlower != null && this._curPlayFlower.id == this.HUA_LIGHTS[i]
                        });
                    }
                    break;
                case PlayFlowerLightHandlerPanelStatusType.SELECTEING_ITEMS:
                    let cell: IPlayFlowerUsingItemVo;
                    for (i = 0, j = this.PLAY_FLOWERLIGHT_ITEMS.length; i < j; i++) {
                        cell = this.PLAY_FLOWERLIGHT_ITEMS[i];
                        arr.push({
                            index: cell.index,
                            id: cell.id,
                            cnt: cell.cnt,
                            status: cell.status,
                            selected: this._curPlayItems != null && this._curPlayItems.id == cell.id
                        });
                    }
                    break;
            }
            return {
                status: status,
                info: arr
            }
        }

        /**
         * 玩家是否有一盏花灯
         */
        public isHasAnyFlowerLight(): boolean {
            let isHas: boolean = false;
            for (let i: number = 0, j: number = this.HUA_LIGHTS.length; i < j; i++) {
                if (clientCore.ItemsInfo.checkHaveItem(this.HUA_LIGHTS[i])) {
                    isHas = true;
                    break;
                }
            }
            return isHas;
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

        dispose(): void {
            this._usedMaterialIndexs = null;
            if (this.curCreateMaterials) {
                this.curCreateMaterials.material = null;
                this.curCreateMaterials = null;
            }
        }
    }
}