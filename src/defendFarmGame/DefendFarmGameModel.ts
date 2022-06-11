namespace defendFarmGame {
    export interface ModuleInfo {
        modelType: string;  //模块类型
        openType: string;   //打开方式
        stageId?: number;   //关卡id
        gameId: number;     //游戏id
        type?: number;      //关卡类型
    }
    /**
     * 冒险游戏model
     * **/
    export class DefendFarmGameModel implements clientCore.BaseModel {
        public readonly redPointId: number = 19401; //红点id

        public type: number;                //类型
        public stageId: number;             //关卡id
        public gameId: number;              //游戏id
        public score: number;               //分数

        public modelType: string;           //模块类型（接口方式）
        public openType: string;            //打开方式（入口来源）

        private _gameInfo: xls.miniGameBase; //关卡信息
        public monsterDataList: any;

        constructor() {
            this.monsterDataList = [
                { type: 3, speed: 120, pro: 0.3, life: 2 },
                { type: 2, speed: 200, pro: 0.5, life: 1 },
                { type: 1, speed: 80, pro: 1, life: 1 }
            ]
        }

        initData(data: ModuleInfo): void {
            this.modelType = data.modelType;
            this.openType = data.openType;
            this.stageId = data.stageId;
            this.gameId = data.gameId;
            this.type = data.type;
        }

        /** 获取关卡信息**/
        public get gameInfo(): xls.miniGameBase {
            this._gameInfo = this._gameInfo || xls.get(xls.miniGameBase).get(this.gameId);
            return this._gameInfo;
        }

        dispose(): void {
            this._gameInfo = null;
            this.monsterDataList = null;
        }
    }
}