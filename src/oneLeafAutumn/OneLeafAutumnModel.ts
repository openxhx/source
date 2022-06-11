namespace oneLeafAutumn {
    export class OneLeafAutumnModel implements clientCore.BaseModel {
        public readonly activityId: number = 70;        //活动id
        public readonly suitId: number = 2100221;       //套装id
        public readonly bgShowId: number = 1000044;     //背景秀id
        public readonly tips_Id: number = 1018;         //规则说明id
        public readonly probability_id: number = 11;    //概率公式提示id
        public readonly max_lucky: number = 100;        //最大幸运值
        public readonly rechargeIDArr = [21, 22];

        public times: number = 0; //已经抽卡的次数
        public openedCardInfo: pb.IOpenedCard[];
        public cardFlag: number;
        public quickCardFlag: number;
        public luckNum: number;
        public isFirstOpen: number;
        public cardInfo: number[];

        constructor() {

        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_flower_field_market_orange_get_info) {
            this.openedCardInfo = msg.openedCardInfo;
            this.cardFlag = msg.cardFlag;
            this.quickCardFlag = msg.quickCardFlag;
            this.luckNum = msg.luckNum;
            this.isFirstOpen = msg.isFirstOpen;
            this.cardInfo = msg.cardInfo;
        }

        /** 获取开牌数据 **/
        getOpenCardDraw(): xls.openCardDraw {
            return xls.get(xls.openCardDraw).get(this.activityId);
        }

        /** 获取开牌数据 **/
        godTree(id): xls.godTree {
            return xls.get(xls.godTree).get(id);
        }

        /** 获取秋雨手饰id **/
        public get shoushiId(): number {
            return clientCore.LocalInfo.sex == 1 ? 4002522 : 4002524;
        }

        /** 获取是否已经获得秋雨手饰 **/
        public get hasShoushi(): boolean {
            return clientCore.ItemsInfo.getItemNum(this.shoushiId) > 0;
        }

        dispose(): void {
            this.openedCardInfo = [];
            this.cardInfo = [];
        }
    }
}