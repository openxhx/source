namespace alert {
    export class QuickBuyInfo {
        public buyItemID: number;
        public buyItemName: string = "";
        public buyItemIntro: string = "";
        public haveNum: number = 0;
        public needCheck: boolean = true;//是否需要自动检查物品数量是否足够
        public needLeaf: boolean = false;//是否展示神叶不足?

        public tokenID: number;//代币ID
        public singlePrice: number = 1;
        public limitNum: number = 0;//有限量的，剩余多少个，0表示没有限制（所以如果限量数量为0，外面就需要拦截）

        public caller: any;
        public cancelFun: Function;
        public sureFun: Function;

        public defaultBuyNum: number = 1;//默认打开的时候显示购买多少
        public stepNum: number = 1;//点击加减的时候，一次变化多少个
        public minNum: number = 0;//最小购买数 如果是0 则变为默认购买数

        public needFairyPetLevel: number = 0;

        public maxCanBuyNum: number = 0;

        constructor(id: number) {
            this.buyItemID = id;
            this.buyItemName = clientCore.ItemsInfo.getItemName(id);
            this.buyItemIntro = clientCore.ItemsInfo.getItemCaptions(id);
        }
    }
}