namespace secretPercious{
    export class SecretPerciousControl implements clientCore.BaseControl{
        

        public getInfo(sign: number): Promise<void>{
            return net.sendAndWait(new pb.cs_get_secret_treasure_info()).then((msg: pb.sc_get_secret_treasure_info)=>{
                let model: SecretPerciousModel = clientCore.CManager.getModel(sign) as SecretPerciousModel;
                model.init(msg);
            });
        }

        public getReward(pos: number,handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_get_secret_treasure_reward({idx: pos})).then((msg: pb.sc_get_secret_treasure_reward)=>{
                util.RedPoint.reqRedPointRefresh(22301);
                alert.showReward(msg.items);
                handler?.run();
            });
        }

        public augur(handler: Laya.Handler): void{
            net.sendAndWait(new pb.cs_devine_secret_treasure()).then((msg: pb.sc_devine_secret_treasure)=>{
                handler?.runWith(msg);
            });
        }
    }
}