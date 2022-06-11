namespace amusementPark {
    export class AmusementParkModel implements clientCore.BaseModel {
        private _gameOpenData: any;
        private _gameRuleIdData: any =
            {
                "1": 1092,  //花朵连连看--linkGame.LinkGameModule
                "2": 1085,  //水果连连看--linkLinkGame2.LinkLinkGameModule
                "3": 1084,  //方块消消乐--dragBlockGame.DragBlockGameModule
                "4": 1088,  //跳一跳--jumpGame.JumpGameModule
                "5": 1086,  //砍树训练--secretTrainingGame.SecretTrainingGameModule
                "6": 1091,  //甜甜圈---rotateJump.RotateJumpGameModule
                "7": 1090,  //打地鼠--mouseGame.MouseGameModule
                "8": 1087,  //打砖块--cleanGame.CleanGameModule
                "9": 1093,  //怪物翻牌--cardGame.CardGameModule
                "10": 1089,  //射箭训练--shootCat.ShootCatModule
                "12": 1177,  //--shootCat.ShootCatModule
                "13": 1178  //射箭训练--shootCat.ShootCatModule
            }

        constructor() {
            this._gameOpenData = {};
        }

        /**传入游戏开放状态**/
        public setGameOpen(id: number, value: number) {
            this._gameOpenData[id] = value;
        }

        /**查看指定游戏开放状态**/
        public getGameOpen(id: number): number {
            if (this._gameOpenData[id] == undefined) {
                return -1;
            }
            return this._gameOpenData[id];
        }

        /**获取指定游戏的帮助id**/
        public getRuleIdBy(gameId: number): number {
            return this._gameRuleIdData[gameId];
        }

        /**获取指定类型游戏列表**/
        public getGameArr(type: number): xls.park[] {
            return _.filter(xls.get(xls.park).getValues(), (element: xls.park) => { return element.type == type; });
        }

        /**获取指定游戏模块名称**/
        public getGameUrl(id: number): string {
            return xls.get(xls.moduleOpen).get(id).name;
        }

        dispose(): void {
            this._gameOpenData = null;
        }
    }
}