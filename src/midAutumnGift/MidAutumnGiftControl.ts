namespace midAutumnGift {
    export class MidAutumnGiftControl {
        /**
         * 获取面板信息
         */
        public GetEventInfo() {
            let model = MidAutumnGiftModel.instance;
            if (!model.checkEventOpen()) return;
            return net.sendAndWait(new pb.cs_three_fairy_gifts_info()).then((msg: pb.sc_three_fairy_gifts_info) => {
                model.gameTimes = msg.gameTime;
                model.rightCnt = msg.answerTime;
                model.isGetReward = msg.isGetReward;
            })
        }

        /**
         * 游戏开启
         */
        public GameStart() {
            net.send(new pb.cs_jump_game_star());
        }

        /**
         * 游戏结束
         */
        public GameEnd(items: pb.Item[]) {
            return net.sendAndWait(new pb.cs_jump_game_over({ item: items })).then((msg: pb.sc_jump_game_over) => {
                return Promise.resolve(msg);
            })
        }

        /**
         * 答题
         */
        public SendAnswer(activity: number, id: number, chose: number, param: number) {
            return net.sendAndWait(new pb.cs_mini_answer({ activity: activity, id: id, chose: chose})).then((msg: pb.sc_mini_answer) => {
                return Promise.resolve(msg);
            })
        }

        /**
         * 获得奖励
         */
        public GetReward(idx:number) {
            return net.sendAndWait(new pb.cs_three_fairy_gifts_reward({ index:idx })).then((msg: pb.sc_three_fairy_gifts_reward) => {
                return Promise.resolve(msg);
            })
        }

        /**
         * 购买结晶
         */
        public BuyStone(){
            return net.sendAndWait(new pb.cs_three_fairy_gifts_buy()).then((msg: pb.sc_three_fairy_gifts_buy) => {
                return Promise.resolve(msg);
            })
        }

        /**
         * 绽放花宝
         */
        public BlossPet(){
            return net.sendAndWait(new pb.cs_get_hua_film_reward()).then((msg: pb.sc_get_hua_film_reward) => {
                alert.showReward(msg.item);
            })
        }

        private static _control: MidAutumnGiftControl;
        private constructor() { };
        public static get instance(): MidAutumnGiftControl {
            if (!this._control) {
                this._control = new MidAutumnGiftControl();
            }
            return this._control;
        }
    }
}