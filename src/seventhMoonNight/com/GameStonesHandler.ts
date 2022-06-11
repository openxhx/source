namespace seventhMoonNight {
    /**
     * 小游戏石头障碍处理器
     */
    export class GameStonesHandler {
        private _model: SeventhMoonNightModel;
        private _parent: Laya.Sprite;
        private _light: Laya.Image;
        private _hitCallback: (isHit: boolean) => void;
        private _cache: GameStoneCell[];
        private _renderStones: GameStoneCell[];
        private _po: Laya.Point;
        private _hitPo: Laya.Point;
        private _lightGap: number;
        private _hPo: Laya.Point;

        constructor(model: SeventhMoonNightModel, parent: Laya.Sprite, light: Laya.Image, hitCallback: (isHit: boolean) => void, lightGap: number) {
            this._model = model;
            this._parent = parent;
            this._light = light;
            this._hitCallback = hitCallback;
            this._lightGap = lightGap;
            this._po = new Laya.Point();
            this._hitPo = new Laya.Point();
            this._hPo = new Laya.Point();
            this._cache = [];
            this._renderStones = [];
        }

        //每一帧执行
        public updateFrameTime(): void {
            this.removeInvalidStones();
            this.hitCheck();
        }

        /**
         * 判断灯的左边是否有石头
         */
        public isHasStone(isLightLeft: boolean): boolean {
            if (this._renderStones.length == 0) return false;
            let cell: GameStoneCell = this.isHitCheck(false);
            if (!cell) return false;
            const stoneTy: number = cell.stoneType;
            const blankData: IGameStoneBlankVo = this._model.GAMESTONES_BLANKS[stoneTy - 1];//获取石头留白(减少碰撞检测范围)
            this._hPo.x = this._light.width / 2;
            this._light.localToGlobal(this._hPo, false);
            this._parent.globalToLocal(this._hPo, false);
            if (isLightLeft) {
                if (this._hPo.x > cell.x && this._hPo.x - this._light.width / 2 <= cell.x + cell.width / 2 - blankData.right) {
                    return true;
                }
            } else {
                if (this._hPo.x < cell.x && this._hPo.x + this._light.width / 2 >= cell.x - cell.width / 2 + blankData.left) {
                    return true;
                }
            }
            return false;
        }

        //是否产生了碰撞(如存在,返回该石头)
        private isHitCheck(isSimp: boolean): GameStoneCell {
            if (this._renderStones.length > 0) {
                this._hitPo.x = this._light.width / 2;
                this._hitPo.y = this._light.height - this._lightGap;
                this._light.localToGlobal(this._hitPo, false);
                this._parent.globalToLocal(this._hitPo, false);
                let stone: GameStoneCell;
                let stoneTy: number;
                let blankData: IGameStoneBlankVo;
                for (let i: number = 0, j: number = this._renderStones.length; i < j; i++) {
                    stone = this._renderStones[i];
                    stoneTy = stone.stoneType;
                    blankData = this._model.GAMESTONES_BLANKS[stoneTy - 1];//获取石头留白(减少碰撞检测范围)
                    if (this._hitPo.y >= stone.y - stone.height) {
                        if (this._hitPo.x + this._light.width / 2 >= stone.x - stone.width / 2 + blankData.left && this._hitPo.x - this._light.width / 2 <= stone.x + stone.width / 2 - blankData.right) {
                            this._hitPo.x = this._light.width / 2;
                            this._hitPo.y = this._lightGap;
                            this._light.localToGlobal(this._hitPo, false);
                            this._parent.globalToLocal(this._hitPo, false);
                            if (this._hitPo.y <= stone.y - blankData.bottom) {
                                if (isSimp) {
                                    if (this._hitPo.y >= stone.y - blankData.bottom) {
                                        continue;
                                    }
                                }
                                return stone;
                            }
                        }
                    }
                }
            }
            return null;
        }

        //碰撞检测
        private async hitCheck(): Promise<void> {
            return new Promise<void>(resolve => {
                this._hitCallback(this.isHitCheck(true) != null);
                resolve();
            });
        }

        /**
         * 添加一个石头
         */
        public addStone(type: number, po: { x: number, y: number }): void {
            let stone: GameStoneCell;
            if (this._cache.length > 0) {
                stone = this._cache.shift();
                stone.reset(type);
            } else {
                stone = new GameStoneCell(type);
            }
            stone.x = po.x;
            stone.y = po.y;
            this._renderStones.push(stone);
            this._parent.addChild(stone);
        }

        //清除无效的石头
        private removeInvalidStones(): void {
            if (this._renderStones.length == 0) return;
            let cell: GameStoneCell;
            for (let i: number = 0, j: number = this._renderStones.length; i < j; i++) {
                cell = this._renderStones[i];
                this._po.y = cell.height;
                cell.localToGlobal(this._po, false);
                if (this._po.y <= 0) {
                    cell.removeSelf();
                    this._renderStones.splice(i, 1);
                    this._cache.push(cell);
                    i--;
                    j--;
                } else {
                    break;
                }
            }
        }

        private clearCache(): void {
            if (this._cache.length > 0) {
                for (let i: number = 0, j: number = this._cache.length; i < j; i++) {
                    this._cache[i].destroy();
                }
            }
            this._cache = null;
        }

        private clearRenderList(): void {
            if (this._renderStones.length > 0) {
                for (let i: number = 0, j: number = this._renderStones.length; i < j; i++) {
                    this._renderStones[i].destroy();
                }
            }
            this._renderStones = null;
        }


        destroy(): void {
            this._model = this._parent = null;
            this.clearCache();
            this.clearRenderList();
            this._hitCallback = null;
            this._po = this._hitPo = this._hPo = null;
        }
    }
}