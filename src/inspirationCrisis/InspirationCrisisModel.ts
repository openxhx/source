namespace inspirationCrisis {
    export class InspirationCrisisModel implements clientCore.BaseModel {
        public readonly activityId: number = 69;    //活动id
        public readonly redPointId: number = 15201; //红点id
        public readonly ruleById: number = 1061;    //规则id
        public readonly moodId: number = 9900069;   //心情id
        public readonly suitId: number = 2110058;   //套装ID
        public readonly mc_Id: number = 80210;      //动画id
        public readonly supply_itemId: number = 700009;      //兑换道具id

        public supplyTimes: number = 0;     //兑换次数
        public readonly supplyTimesMax: number = 1;  //兑换次数上限
        public readonly expendItemNum: number = 10;  //兑换消耗道具数量
        public buyTimes: number = 0;        //购买次数
        public readonly buyTimesMax: number = 4;     //购买次数上限
        public gameTimes: number = 0;       //游戏已玩次数
        public readonly gameTimesMax: number = 3;     //游戏次数上限
        private _moodMax: number = -1;      //心情最大上限（用于进度条）

        public readonly moonTxtList = [
            { name: "抓狂", min: 0, max: 95, txt: "啊啊啊，写不出来啊！" },
            { name: "沮丧", min: 95, max: 310, txt: "唔，头发都快掉光了。" },
            { name: "平静", min: 310, max: 630, txt: "静下心整理一下思路吧！" },
            { name: "兴奋", min: 630, max: 9999, txt: "这下文思如泉涌啦！" }
        ];

        updateBuyTimes(): void {
            clientCore.MedalManager.setMedal([{ id: MedalDailyConst.SCHOOL_TEACHERS_DAY_BUY, value: this.buyTimes }]);
        }

        /** 更新界面数据 **/
        updateInfo(msg: pb.sc_inspire_crisis_panel) {
            this.buyTimes = msg.buyTimes;
            this.supplyTimes = msg.flag;
            this.gameTimes = msg.gameTimes;
        }

        /** 获取指定id道具是否已经获得 **/
        getHasItem(id: number): boolean {
            return clientCore.ItemsInfo.getItemNum(id) > 0;
        }

        /** 获取指定id道具skin地址 **/
        getItemSkin(id: number): string {
            return clientCore.ItemsInfo.getItemIconUrl(id);
        }

        /** 获取奖励数据列表 **/
        getRewardArr(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取购买数据列表 **/
        getBuyInfo(): xls.commonBuy[] {
            return _.filter(xls.get(xls.commonBuy).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取套装所有散件信息 **/
        getSuitList(): xls.commonAward[] {
            return _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == this.activityId });
        }

        /** 获取心情数量 **/
        public get moodNum(): number {
            return clientCore.ItemsInfo.getItemNum(this.moodId);
        }

        /** 获取兑换道具数量 **/
        public get supplyItemNum(): number {
            return clientCore.ItemsInfo.getItemNum(this.supply_itemId);
        }

        /** 获取可兑换心情数量 **/
        public get canSupplyMood(): number {
            return clientCore.FlowerPetInfo.petType > 0 ? 60 : 40;
        }

        /** 获取心情进度最大值 **/
        public get moodMax(): number {
            if (this._moodMax == -1) {
                let arr = this.getRewardArr();
                this._moodMax = arr[arr.length - 1].num.v2;
            }
            return this._moodMax;
        }

        /** 是否可以兑换 **/
        public get isCanSupply(): boolean {
            return this.supplyTimes < this.supplyTimesMax;
        }

        /** 是否可以购买 **/
        public get isCanBuy(): boolean {
            return this.buyTimes < this.buyTimesMax;
        }

        /** 是否可以进行游戏 **/
        public get isCanGame(): boolean {
            return this.gameTimes < this.gameTimesMax;
        }

        dispose() {

        }
    }
}