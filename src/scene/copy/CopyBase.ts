
namespace scene.copy {
    /**
     * 战斗副本
     */
    export class CopyBase {

        /** 地图资源的地址*/
        public path: string;

        /** 是否是重新开始*/
        public isReStart: boolean;
        /**战斗完毕后需要打开的模块全路径和参数 */
        public openMod: { moduleName: string, data?: any };

        constructor() { }

        /** 副本初始化*/
        public init(): void {
            clientCore.UIManager.commonMoney.visible = false;
            clientCore.MapManager.showGarden(false);
        }

        /** 进入地图*/
        public $enterMap(): void {
            clientCore.LayerManager.joyLayer.visible = false;
            this.enterCopy();
            this.playMusic();
            this.showBattleUI();
        }

        /**
         * 成功进入副本 - 复写实现
         */
        protected enterCopy(): void {
        }

        /**
         * 显示战斗UI - 复写实现
         */
        protected showBattleUI(): void {
        }

        /**
         * 退出副本- 复写实现
         */
        protected exitCopy(haveExtraOpen: boolean = false): void {
        }

        /**
         * 播放副本音乐
         */
        protected playMusic(): void {

        }

        public dispose(haveExtraOpen: boolean = false): void {
            this.exitCopy(haveExtraOpen);
            battle.BattleConfig.autoFight = false;
            clientCore.LayerManager.joyLayer.visible = true;
            clientCore.UIManager.commonMoney.visible = true;
            !this.isReStart && this.openMod && this.openMod.moduleName && clientCore.ModuleManager.open(this.openMod.moduleName, this.openMod.data)
            clientCore.MapManager.showGarden(true);
        }
    }
}