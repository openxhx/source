///<reference path="SceneBase.ts"/>

namespace scene.map {
    /**
     * 地图场景
     */
    export class MapScene extends SceneBase {

        /** 黑幕*/
        private _black: Laya.Sprite;
        /** 人物上层特效*/
        private _upEffect: Laya.Sprite;
        /** 角色层*/
        private _roleLayer: Laya.Sprite;
        /** 血条层*/
        private _barLayer: Laya.Sprite;
        /** buff层*/
        private _buffLayer: Laya.Sprite;
        /** 文字层*/
        private _textLayer: Laya.Sprite;
        /** 人物下层特效*/
        private _downEffect: Laya.Sprite;
        /** 飘字层*/
        private _flyWord: Laya.Sprite;
        /** 动态飘字层*/
        private _flyTexture: Laya.Sprite;
        /** 脚底圆环层*/
        private _circleLayer: Laya.Sprite;

        constructor() {
            super();
            this._black = new Laya.Sprite();
            this._black.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
            this._black.alpha = 0;
            this._sceneContainer.addChild(this._black);
            this._downEffect = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._circleLayer = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._roleLayer = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._barLayer = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._buffLayer = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._upEffect = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._textLayer = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._flyWord = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._flyTexture = this._sceneContainer.addChild(new Laya.Sprite()) as Laya.Sprite;
        }

        /**
         * 切换地图
         * @param path 地图资源地址 
         * @param complete 完成回调
         */
        public async changeMap(path: string, complete?: Laya.Handler) {
            await res.load(path);
            this._map.source = Laya.loader.getRes(path);
            complete && complete.run();
        }

        /** 展示黑色*/
        public showBlack(): Promise<void> {
            return new Promise((suc) => {
                this._black.alpha = 1;
                Laya.Tween.from(this._black, { alpha: 0 }, 200, Laya.Ease.quadInOut, Laya.Handler.create(this, () => {
                    suc();
                }))
            })
        }

        public hideBlack(): void {
            this._black.alpha = 0;
        }

        /**
         * 移动地图 
         * @param costT 时间（毫秒）
         * @param complete 
         */
        public mapMove(costT: number, complete?: Laya.Handler): void {
            this._passT = 0;
            let _startX: number = this._map.x;
            // let _distance: number = this._map.width / 4; // 预留1/4站位的宽度;
            let _distance: number = Math.max(this._map.width - Laya.stage.width, 0) / 3;
            let _sheep: number = _distance / costT;
            Laya.timer.loop(17, this, this.onTime, [_startX, costT, _sheep, complete]);
        }

        /** 经过的时间（毫秒）*/
        private _passT: number;
        private onTime(startX: number, costT: number, sheep: number, complete: Laya.Handler): void {
            if (battle.BattleConfig.isPause) return; //暂停了
            this._passT += (10 * battle.BattleConfig.rate);
            this._map.x = startX - this._passT * sheep;
            if (this._passT >= costT || Laya.stage.width - this._map.x >= this._map.width) { //预计时间到了 或者走到底了
                Laya.timer.clear(this, this.onTime);
                complete && complete.run();
                complete = null;
                return;
            }
        }

        /**
         * 添加一个骨骼战斗对象
         * @param data 
         */
        public addBoneFigter(data: unit.FightVo): unit.BoneFighter {
            let figher: unit.BoneFighter = unit.BoneFighter.create();
            figher.init(data);
            figher.x = data.x;
            figher.y = data.y;
            figher.addToScene();
            unit.UnitManager.ins.addUnit(figher, data.pos);
            return figher;
        }

        /** 创建一波角色*/
        public addWaves(camp: unit.CampEnum, roles: pb.Irole_pos[], type?: number): void {
            let isMy: boolean = camp == unit.CampEnum.MY;
            let ponits: Array<number[]> = isMy ? battle.BattleConstant.myPoints : battle.BattleConstant.otherPoints;
            _.forEach(roles, (element: pb.role_pos) => {
                let vo: unit.FightVo = unit.FightVo.gain(element);
                let array: number[] = ponits[element.positionId - 1];
                vo.roleID = element.roleId;
                vo.scale = 1;
                switch (camp) {
                    case unit.CampEnum.MY:
                        let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(vo.roleID);
                        vo.skinID = role.id == vo.roleID ? role.skinId : vo.roleID;
                        vo.identity = role.Identity;
                        vo.career = role.xlsId.battleType;
                        break;
                    case unit.CampEnum.MONSTER:
                        let monster: xls.monsterBase = xls.get(xls.monsterBase).get(vo.roleID);
                        vo.skinID = monster.monAppear;
                        vo.identity = monster.Identity;
                        vo.scale = monster.monSize / 100;
                        vo.showHp = type == 1;
                        break;
                    case unit.CampEnum.OTHER:
                        vo.skinID = vo.roleID;
                        vo.identity = 1; //TODO 
                        break;
                }
                let offx: number = isMy ? 0 : 2 * clientCore.LayerManager.OFFSET; //因为适配 所以右侧需要有相应的调整
                vo.campID = camp;
                vo.direction = isMy ? unit.DirectionEnum.RIGHT : unit.DirectionEnum.LEFT;
                vo.x = array[0] + offx;
                vo.y = array[1];
                let figher: unit.BoneFighter = this.addBoneFigter(vo);
                element.curBuff.length > 0 && battle.BattleManager.promiseBuffs.concat(buff.BuffManager.ins.processSelfBuffs(figher, element.curBuff));
            })
        }

        /**
         * 清理层
         * @param layer 
         */
        private clearLayer(layer: Laya.Sprite): void {
            layer.removeChildren(0, layer.numChildren)
        }

        public dispose(): void {
            //移除定时器
            Laya.timer.clear(this, this.onTime);
            //清理队伍
            unit.UnitManager.ins.clear();
            //场上显示对象清理
            this._map.source = null;
            this._map.x = 0;
            this.clearLayer(this._circleLayer);
            this.clearLayer(this._downEffect);
            this.clearLayer(this._roleLayer);
            this.clearLayer(this._barLayer);
            this.clearLayer(this._buffLayer);
            this.clearLayer(this._textLayer);
            this.clearLayer(this._upEffect);
            this.clearLayer(this._flyWord);
            this.clearLayer(this._flyTexture);
            //恢复家园BGM
            core.SoundManager.instance.playBgm(pathConfig.getBgmUrl('home'));
        }

        public get circleLayer(): Laya.Sprite {
            return this._circleLayer;
        }
        public get downEffect(): Laya.Sprite {
            return this._downEffect;
        }
        public get roleLayer(): Laya.Sprite {
            return this._roleLayer;
        }
        public get barLayer(): Laya.Sprite {
            return this._barLayer;
        }
        public get buffLayer(): Laya.Sprite {
            return this._buffLayer;
        }
        public get textLayer(): Laya.Sprite {
            return this._textLayer;
        }
        public get upEffect(): Laya.Sprite {
            return this._upEffect;
        }
        public get flyWord(): Laya.Sprite {
            return this._flyWord;
        }
        public get flyTexture(): Laya.Sprite {
            return this._flyTexture;
        }

        private static _ins: MapScene;
        public static get ins(): MapScene {
            return this._ins || (this._ins = new MapScene());
        }
    }
}