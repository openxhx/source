namespace clientCore {
    export class LimitRechargeManager {
        private static _ins: LimitRechargeManager
        private constructor() {

        }

        public static get instance(): LimitRechargeManager {
            if (!this._ins) this._ins = new LimitRechargeManager();
            return this._ins;
        }
        public timeAmbulatoryTime: number;
        public timeAmbulatoryInfo: number[];

        /** 上一次获取信息的0点时间*/
        private _gettime: number;
        /** 上一次获得的购买次数*/
        private _times: number[];
        /**获取购买次数信息*/
        async getInfo(): Promise<number[]>{
            if(this._gettime && util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime) == this._gettime) return this._times;
            return net.sendAndWait(new pb.cs_time_cloister_pay_product_times()).then((msg: pb.sc_time_cloister_pay_product_times) => {
                this._gettime = util.TimeUtil.floorTime(clientCore.ServerManager.curServerTime);
                this._times = msg.times;
                return Promise.resolve(msg.times);
            })
        }

        async gettimes(pos: number): Promise<number>{
            let times: number[] = await this.getInfo();
            return times[pos];
        }

        settimes(pos: number,value: number): void{
            if(!this._times)return;
            this._times[pos] = value;
        }
    }
}