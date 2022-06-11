namespace seventhMoonNight {
    /**
     * 游戏地图处理
     */
    export class GameMap extends Laya.Box {
        /**每张地图的尺寸*/
        private readonly MAP_SIZE: { w: number, h: number } = {w: 1750, h: 750};
        /**一共准备了多少张地图*/
        private readonly MAP_ALL: number = 1;
        /**左右不可走距离*/
        private readonly UNWALK_DISTANCE: number = 550;
        private _model: SeventhMoonNightModel;
        private _light: Laya.Image;
        private _lightOffCenter: number;
        private readonly LIGHT_OFF_HALF: number;
        private _mapLayer: Laya.Sprite;
        private _resetProgressCallback: (num: number) => void;
        //#region 初始化的值
        /**初始化灯的Y值*/
        private readonly init_light_y: number = 200;
        /**原始速度*/
        private readonly original_speeds: number[] = [3.53, 1];
        /**平移速度*/
        private readonly H_SPEED: number = 5;
        private _curSpeed: number;//当前速度
        /**地图突变的cache*/
        private _mapImgPool: Laya.Image[];
        private _curMapChangeIndex: number;
        /**计数地图数量*/
        private _curCntIndex: number;
        private _po: Laya.Point;
        private _mapRenderList: Laya.Image[];
        private hOffx: number;
        private _isOver: boolean;
        private _gameStonesHandler: GameStonesHandler;
        private _isHited: boolean;
        /**花灯上下空白间隔*/
        private readonly lightGap: number = 28;
        /**终点动画*/
        private _eff: clientCore.Bone;
        /**水波*/
        private _waterEff: Array<{ target: Laya.Image, eff: clientCore.Bone }>;
        private _isAI: boolean;
        /**碰撞的花灯回弹处理*/
        private _gameFlowerLightSpringBack: GameFlowerLightSpringBack;
        /**开始摇晃动画*/
        private _gameFlowerLightWobbleAnimation: GameFlowerLightWobbleAnimation;

        //#endregion
        public constructor(model: SeventhMoonNightModel, resetProgressCallback: (num: number) => void) {
            super();
            this._model = model;
            this._resetProgressCallback = resetProgressCallback;
            this.LIGHT_OFF_HALF = (this.MAP_SIZE.w - this.UNWALK_DISTANCE * 2 + 135) / 2;
            this.UNWALK_DISTANCE -= (this.MAP_SIZE.w - Laya.stage.width) / 2;
            this._isOver = false;
            this._isHited = false;
            this._isAI = false;
            this._waterEff = [];
            this.init();
        }

        private init(): void {
            this.width = 1334;
            this.anchorX = 0.5;
            this._mapImgPool = [];
            this._curMapChangeIndex = 0;
            this._curCntIndex = 0;
            this._po = new Laya.Point();
            this._mapRenderList = [];
            this.init2MapLayer();
            this.init2FlowerLight();
            this._gameFlowerLightSpringBack = new GameFlowerLightSpringBack(this._light, this.onLightSpringBackOver);
            this._gameFlowerLightWobbleAnimation = new GameFlowerLightWobbleAnimation(this._light);
            this._gameStonesHandler = new GameStonesHandler(this._model, this._mapLayer, this._light, this.hitStone, this.lightGap);//创建石头障碍管理器
            this.reset2MapImgs();
            //开始摇晃
            this._gameFlowerLightWobbleAnimation.start();
        }

        //#region 初始化
        private init2MapLayer(): void {
            this._mapLayer = new Laya.Sprite();
            this._mapLayer.width = this.width;
            this._mapLayer.x = 0;
            this._mapLayer.y = 0;
            this.addChild(this._mapLayer);
        }

        /**花灯*/
        private init2FlowerLight(): void {
            this._light = new Laya.Image(clientCore.ItemsInfo.getItemIconUrl(this._model._curPlayFlower.id));
            this._light.width = this._light.height = 135;
            this._light.anchorX = 0.5;
            this._light.anchorY = 1;
            this._light.x = this.width >> 1;
            this._light.y = this.init_light_y;
            this.addChild(this._light);
            this.reset2Speed();
        }

        //#endregion
        //重置玩家当前速度(玩家偏离中心速度越慢)
        private async reset2Speed(): Promise<void> {
            return new Promise<void>(resolve => {
                if (this._isHited) {
                    this._curSpeed = 0;//碰撞后速度将为0
                } else {
                    this._po.x = this._light.width >> 1;
                    this._light.localToGlobal(this._po, false);
                    this._lightOffCenter = Math.abs((Laya.stage.width >> 1) - this._po.x);
                    this._curSpeed = ((this.LIGHT_OFF_HALF - this._lightOffCenter) / this.LIGHT_OFF_HALF) * (this.original_speeds[0]) + this.original_speeds[1];
                }
                resolve();
            });
        }

        //刷新地图
        private async reset2MapImgs(): Promise<boolean> {
            return new Promise<boolean>(resolve => {
                this.put2MapImg();
                let lastMapImg: Laya.Image;
                let isCreated: boolean = false;
                if (this._mapRenderList.length > 0) {
                    lastMapImg = this._mapRenderList[this._mapRenderList.length - 1];
                    this._po.y = 0;
                    lastMapImg.localToGlobal(this._po, false);
                    if (this._po.y <= 20) {
                        lastMapImg = this.getMapImg();
                        if (lastMapImg) {
                            lastMapImg.y = this._mapRenderList[this._mapRenderList.length - 1].y + this.MAP_SIZE.h;
                            this._mapRenderList.push(lastMapImg);
                            this._mapLayer.addChild(lastMapImg);
                            this.addWater(lastMapImg);
                            this.addStones();
                            this.addEndAnim();
                            isCreated = true;
                        }
                    }
                } else {
                    lastMapImg = this.getMapImg();
                    if (lastMapImg) {
                        lastMapImg.y = 0;
                        this._mapRenderList.push(lastMapImg);
                        this._mapLayer.addChild(lastMapImg);
                        this.addWater(lastMapImg);
                        this.addStones();
                        this.addEndAnim();
                        isCreated = true;
                    }
                }
                resolve(isCreated);
            });
        }

        //增加一个终点动画
        private addEndAnim(): void {
            if (this._curCntIndex != this._model.MAP_REPEATS_2GAME + 1) return;
            this.clearEff();
            this._eff = clientCore.BoneMgr.ins.play("res/animate/activity/qingrenjiezhumianban.sk", "game_flower", true, this._mapLayer, null, false, true);
            this._eff.pos(this.MAP_SIZE.w / 2 - 260, this._model.MAP_REPEATS_2GAME * this.MAP_SIZE.h + Laya.stage.height / 2);
        }

        //增加石头障碍物
        private addStones(): void {
            if (this._curCntIndex == this._model.MAP_REPEATS_2GAME + 1 || !this._gameStonesHandler) return;
            const arr: Array<xls.gameFlowerLight> = this._model.getStonesCfgs(this._curCntIndex);
            const initY: number = (this._curCntIndex - 1) * this.MAP_SIZE.h;
            let cell: xls.gameFlowerLight;
            for (let i: number = 0, j: number = arr.length; i < j; i++) {
                cell = arr[i];
                if (this._curCntIndex == 1) {
                    if (initY + cell.hinderPos.v2 <= Laya.stage.height / 2) continue
                }
                this._gameStonesHandler.addStone(
                    cell.hinderType,
                    {
                        x: cell.hinderPos.v1 + this.UNWALK_DISTANCE,
                        y: initY + cell.hinderPos.v2
                    }
                );
            }
        }

        /**
         * 添加水波特效
         */
        private addWater(target: Laya.Image): void {
            let cell: clientCore.Bone = clientCore.BoneMgr.ins.play("res/animate/activity/qingrenjiezhumianban.sk", "game_water", true, this._mapLayer, null, false, true);
            cell.pos(this.MAP_SIZE.w / 2 - 180, target.y + Laya.stage.height / 2 - 150);
            this._waterEff.push({target: target, eff: cell});//加入特效保存
        }

        /**小游戏完全结束*/
        private isGameSuccOver(): void {
            EventManager.event(SeventhMoonNightEventType.GAME_SUCC_LIGHTAI_FINISHED);//游戏成功
        }

        /**花灯回弹结束*/
        private onLightSpringBackOver: () => void = () => {
            this.reset2Speed();//重新计算速度
            this._gameFlowerLightWobbleAnimation.start();
        };

        //持续更新Y值
        public resetMoveY(): void {
            if (this._gameFlowerLightSpringBack.isSpringBacking) return;//播放回弹动画
            if (this._curSpeed <= 0) {
                this._gameStonesHandler.updateFrameTime();
                return;
            }
            const offY: number = this._curSpeed * (Laya.timer.delta / 1000) / (0.016);
            if (this._isOver) {
                this.hOffx = this._light.y + offY;
                if (this.hOffx > Laya.stage.height) {
                    this.hOffx = Laya.stage.height;
                }
                this._light.y = this.hOffx;
                if (!this._isAI) {
                    if (this._light.y == Laya.stage.height) {
                        this._isAI = true;
                        this._curCntIndex = this._model.MAP_REPEATS_2GAME;
                        this._curMapChangeIndex = 0;
                    }
                } else {
                    let isAiFinished: boolean = false;
                    if (-this._mapLayer.y < (this._model.MAP_REPEATS_2GAME) * this.MAP_SIZE.h) {
                        const s: number = 5;
                        this.hOffx = -(this._mapLayer.y - s);
                        if (this.hOffx >= (this._model.MAP_REPEATS_2GAME) * this.MAP_SIZE.h) {
                            this.hOffx -= (this._model.MAP_REPEATS_2GAME) * this.MAP_SIZE.h;
                            isAiFinished = true;
                        } else {
                            this.hOffx = s;
                        }
                        // this._light.y -= this.hOffx;
                        this._mapLayer.y -= this.hOffx;
                        this.reset2MapImgs().then(isok => {
                            if (isok) {
                                this._curCntIndex = this._model.MAP_REPEATS_2GAME + 1;
                                this._curMapChangeIndex = null;
                            }
                        });
                    } else {
                        isAiFinished = true;
                    }
                    if (isAiFinished) {
                        this.isGameSuccOver();
                    }
                }
                return;
            }
            if (this._light.y < Laya.stage.height / 2) {//开始时期
                this.hOffx = this._light.y + offY;
                if (this.hOffx > Laya.stage.height / 2) {
                    this.hOffx = Laya.stage.height / 2;
                }
                this._light.y = this.hOffx;
            } else if (this._curCntIndex >= this._model.MAP_REPEATS_2GAME) {
                this._mapLayer.y -= offY;
                if (-this._mapLayer.y >= this._model.MAP_REPEATS_2GAME * this.MAP_SIZE.h) {//玩家进入到了结算界面了
                    this._isOver = true;
                    EventManager.event(SeventhMoonNightEventType.GAME_SUCC);//游戏成功
                }
            } else {
                this._mapLayer.y -= offY;
            }
            this._gameStonesHandler.updateFrameTime();
            this.reset2MapImgs();
            this.reset2Progress();
        }

        //更新玩家地图进度
        private async reset2Progress(): Promise<void> {
            return new Promise<void>(resolve => {
                this._resetProgressCallback(((this._model.MAP_REPEATS_2GAME * this.MAP_SIZE.h) - Math.abs(this._mapLayer.y)) / (this._model.MAP_REPEATS_2GAME * this.MAP_SIZE.h));
                resolve();
            });
        }

        //将越界的地图放入cache中
        private put2MapImg(): void {
            if (this._mapRenderList.length > 0) {
                let cell: Laya.Image;
                for (let i: number = 0, j: number = this._mapRenderList.length; i < j; i++) {
                    cell = this._mapRenderList[i];
                    this._po.y = cell.height;
                    cell.localToGlobal(this._po, false);
                    if (this._po.y <= 0) {
                        cell.removeSelf();
                        this.clearWaterEff(cell);
                        this._mapImgPool.push(cell);
                        this._mapRenderList.splice(i, 1);
                        i--;
                        j--;
                    } else {
                        break;
                    }
                }
            }
        }

        //删除一个水效果
        private clearWaterEff(target: Laya.Image): void {
            if (!this._waterEff || this._waterEff.length == 0) return;
            let cell: { target: Laya.Image, eff: clientCore.Bone };
            for (let i: number = 0, j: number = this._waterEff.length; i < j; i++) {
                cell = this._waterEff[i];
                if (cell.target == target) {
                    if (cell.eff != null) {
                        cell.eff.dispose();
                    }
                    this._waterEff.splice(i, 1);
                    break;
                }
            }
        }

        //#region 创建地图部分
        private getMapImg(): Laya.Image {
            if (this._mapImgPool.length > 0) {
                this.changeMapIndex();
                if (this._curMapChangeIndex != null) {
                    let imgBg: Laya.Image = this._mapImgPool.shift();
                    imgBg.skin = `unpack/seventhMoonNight/map_${this._curMapChangeIndex}.png`;
                    return imgBg;
                }
                return null;
            } else {
                return this.createMapImg();
            }
        }

        private changeMapIndex(): void {
            this._curMapChangeIndex++;
            this._curCntIndex++;
            if (this._curCntIndex > this._model.MAP_REPEATS_2GAME + 1) {
                this._curCntIndex = this._model.MAP_REPEATS_2GAME + 1;
                this._curMapChangeIndex = null;
                return;
            }
            if (this._curMapChangeIndex > this.MAP_ALL) {
                this._curMapChangeIndex = 1;
            }
        }

        /**
         * 新建一个地图背景
         */
        private createMapImg(): Laya.Image {
            this.changeMapIndex();
            if (this._curMapChangeIndex != null) {
                let imgBg: Laya.Image = new Laya.Image(`unpack/seventhMoonNight/map_${this._curMapChangeIndex}.png`);
                imgBg.width = this.MAP_SIZE.w;
                imgBg.height = this.MAP_SIZE.h;
                imgBg.anchorX = 0.5;
                imgBg.x = this._mapLayer.width >> 1;
                return imgBg;
            }
            return null;
        }

        //#endregion

        /**
         * 开始游戏
         * 需要判断左右是否有石头
         */
        public play(type: IGameMapType): void {
            // if (this._gameFlowerLightSpringBack.isSpringBacking) return;//播放回弹动画中
            if (this._isOver) return;
            this.hOffx = this._light.x;
            switch (type) {
                case seventhMoonNight.IGameMapType.GO_LEFT://向左移动
                    if (this._gameStonesHandler.isHasStone(true)) return;
                    this.hOffx -= this.H_SPEED * (Laya.timer.delta / 1000) / 0.016;
                    if (this.hOffx < this.UNWALK_DISTANCE - this._light.width / 2) {
                        this.hOffx = this.UNWALK_DISTANCE - this._light.width / 2;
                        if (this.hOffx == this._light.x) {
                            return;
                        }
                    }
                    this._light.x = this.hOffx;
                    this.reset2Speed();
                    break;
                case seventhMoonNight.IGameMapType.GO_RIGHT://向右移动
                    if (this._gameStonesHandler.isHasStone(false)) return;
                    this.hOffx += this.H_SPEED * (Laya.timer.delta / 1000) / 0.016;
                    if (this.hOffx > Laya.stage.width - this.UNWALK_DISTANCE + this._light.width / 2) {
                        this.hOffx = Laya.stage.width - this.UNWALK_DISTANCE + this._light.width / 2;
                        if (this.hOffx == this._light.x) {
                            return;
                        }
                    }
                    this._light.x = this.hOffx;
                    this.reset2Speed();
                    break;
            }
        }

        //碰撞到了石头(碰撞检测回调)
        private hitStone: (isHit: boolean) => void = (isHit) => {
            if (this._isHited != isHit) {
                this._isHited = isHit;
                if (this._isHited) {
                    this._gameFlowerLightSpringBack.start();
                }
                this.reset2Speed();
            }
        };

        private clearEff(): void {
            if (this._eff) {
                this._eff.dispose();
                this._eff = null;
            }
        }

        private clearImgsArr(arr: Laya.Image[]): void {
            if (!arr || arr.length == 0) return;
            arr.forEach(item => {
                item.removeSelf();
            });
        }

        //清理所有的水效果
        private clearAllWaterEff(): void {
            if (!this._waterEff || this._waterEff.length == 0) return;
            this._waterEff.forEach((item) => {
                if (item.eff) {
                    item.eff.dispose();
                }
            });
        }

        public destroy(): void {
            this._model = null;
            this._mapLayer.removeSelf();
            this._mapLayer = null;
            this._light.removeSelf();
            this._light = null;
            this._resetProgressCallback = null;
            this.clearEff();
            this.clearImgsArr(this._mapImgPool);
            this.clearImgsArr(this._mapRenderList);
            this.clearAllWaterEff();
            this._mapImgPool = null;
            this._mapRenderList = null;
            if (this._gameStonesHandler) {
                this._gameStonesHandler.destroy();
                this._gameStonesHandler = null;
            }
            this._mapLayer.removeSelf();
            this._mapLayer = null;
            this._waterEff = null;
            if (this._gameFlowerLightSpringBack) {
                this._gameFlowerLightSpringBack.destroy();
                this._gameFlowerLightSpringBack = null;
            }
            if (this._gameFlowerLightWobbleAnimation) {
                this._gameFlowerLightWobbleAnimation.destroy();
                this._gameFlowerLightWobbleAnimation = null;
            }
            super.destroy();
        }
    }
}