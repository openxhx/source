namespace rotateJump {
    export interface ModuleInfo {
        modelType: string;  //模块类型
        openType: string;   //打开方式
        stageId?: number;   //关卡id
        type?: number;      //关卡类型
    }
    /**
     * 冒险游戏model
     * **/
    export class RotateJumpGameModel implements clientCore.BaseModel {
        public type: number;                //类型
        public stageId: number;             //关卡id
        public score: number;               //分数

        public modelType: string;           //模块类型（接口方式）
        public openType: string;            //打开方式（入口来源）

        constructor() {

        }

        initData(data: ModuleInfo): void {
            this.modelType = data.modelType;
            this.openType = data.openType;
            this.stageId = data.stageId;
            this.type = data.type;
        }

        /**获取所需积分**/
        public get needSource(): number {
            return 1;
        }

        dispose(): void {
        }
    }
}