namespace clientCore {
    /**
     * 场景
     */
    export class SceneManager {

        private _initialized: boolean = false;
        /**
         * 退出时会打开哪个模块，每次打开战斗时会清空，所以要在battleLayout方法后赋值这个标记
         * 目前只有bossCopy使用 
         */
        public modMark: ModOpenConfig;
        private static _ins: SceneManager;
        public static get ins(): SceneManager {
            return this._ins || (this._ins = new SceneManager());
        }

        public register() {
            if (this._initialized) return;
            let _array: Array<Promise<void>> = [
                xls.load(xls.SkillBase),
                xls.load(xls.BuffBase),
                xls.load(xls.monsterBase),
                xls.load(xls.characterVoice),
                res.load("fonts/font.atlas"),
                res.load("atlas/fight.atlas"),
                res.load("atlas/battleResult.atlas"),
                this.loadJs("scene")
            ];
            return Promise.all(_array).then(() => {
                this._initialized = true;
            })
        }

        /**
        * 战斗布局
        * @param modudeType 战斗模式，进入前会清空
        * 1冒险
        * 2秘闻录
        * 3活动（普通的活动）
        * 4约会
        * 5金币
        * 6活动boss
        * @param levelID 关卡id
        */
        public battleLayout(modudeType: number, levelID: number) {
            //为了解决引用问题 这里用window下的scene执行
            this.modMark = null;//清空标记
            window['scene'].battle.BattleSCommand.ins.battleLayout(modudeType, levelID);
        }

        private loadJs(packName: string) {
            return util.LoadScript(`js/${packName}.js`).then((jsFile) => {
                let js = jsFile + "\n //@ sourceURL=src/" + packName + ".js";
                window["eval"](js);
            });
        }

    }
}