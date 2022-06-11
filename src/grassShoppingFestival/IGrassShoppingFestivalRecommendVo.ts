namespace grassShoppingFestival {
    //推荐列表数据结构
    export interface IGrassShoppingFestivalRecommendVo {
        //对应商品序号
        goodIndex: number;
        //推荐的口才值
        eloquenceValue: number;
        //横幅
        bannarIndex: number;
        //推荐奖励
        recommendRewards: IGrassShoppingFestivalReward;

    }
    //推荐奖励
    export interface IGrassShoppingFestivalReward {
        //男or女, 推荐奖励
        rewards: Array<number>;
        //奖励对应的数量
        cnts: Array<number>;
    }
}