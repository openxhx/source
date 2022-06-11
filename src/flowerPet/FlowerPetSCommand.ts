namespace flowerPet {
    export class FlowerPetSCommand {

        /**
         * 获取上次与花宝交互时间
         * @param handler 
         */
        public getInteractiveTime(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_flower_baby_interactive_time()).then((msg: pb.sc_get_flower_baby_interactive_time) => {
                handler && handler.runWith(msg)
            })
        }

        /**
         * 花宝交互
         * @param type 1喂食，2抚摸，3饼干
         * @param handler 
         */
        public interactivePet(type: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_flower_baby_interaction({ type: type })).then((msg: pb.sc_flower_baby_interaction) => {
                handler && handler.runWith(msg);
            })
        }

        /**
         * 获取宝箱奖励
         * @param handler 
         */
        public getRewards(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_flower_baby_reward()).then((msg: pb.sc_get_flower_baby_reward) => {
                msg.rewardInfo.length > 0 && alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), "");
                handler && handler.run();
            });
        }

        /**
         * 设置花宝是否跟随
         * @param type 0不跟随，1跟随
         * @param handler 
         */
        public setFollow(type: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_set_flower_baby_follow({ flag: type })).then((msg: pb.sc_set_flower_baby_follow) => {
                clientCore.FlowerPetInfo.followStatus = type;
                clientCore.PeopleManager.getInstance().player.showFlowerPet(type == 1);
                handler && handler.run();
            });
        }

        /**
         * 设置花宝形象
         * @param type 
         * @param handler 
         */
        public selectImg(type: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_chose_baby_image({type: type})).then((msg: pb.sc_chose_baby_image)=>{
                handler?.runWith(1);
            }).catch(()=>{
                handler?.runWith(0);
            })
        }

        private static _ins: FlowerPetSCommand;
        public static get ins(): FlowerPetSCommand {
            return this._ins || (this._ins = new FlowerPetSCommand());
        }
    }
}