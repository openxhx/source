namespace newYearEggGame {
    /**
     * 敲蛋游戏model
     * **/
    export class NewYearEggGameModel implements clientCore.BaseModel{

        private _gameInfo: xls.gameWhack;   //关卡信息

        /** 获取关卡信息**/
        public get gameInfo(): xls.gameWhack {
            this._gameInfo = this._gameInfo || xls.get(xls.gameWhack).get(3790001);
            return this._gameInfo;
        }

        /** 获取指定怪物信息**/
        public getGameWhackMole(id: number): xls.gameWhackMole {
            return xls.get(xls.gameWhackMole).get(id);
        }

        dispose(): void {
            this._gameInfo = null;
        }
    }
}