namespace library {
    /**
     * 数据项
     */
    export class LibraryModel {

        public static ins: LibraryModel;

        private _msg: pb.sc_get_rebuilding_the_library_info;

        constructor() { LibraryModel.ins = this; }


        /** 获取当前活动天数*/
        public getCurrDay(): number {
            let cls: xls.eventControl = xls.get(xls.eventControl).get(9);
            let t: string[] = cls.eventTime.split("_");
            // let st: number = new Date(t[0].replace(/\-/g, '/')).getTime() / 1000;
            let st = util.TimeUtil.formatTimeStrToSec(t[0]);
            // let ct: number = new Date(t[1].replace(/\-/g, '/')).getTime() / 1000;
            let ct = util.TimeUtil.formatTimeStrToSec(t[1]);
            let currT: number = clientCore.ServerManager.curServerTime
            if (currT >= ct) return 0;
            let dt: number = currT - st;
            return Math.ceil(dt / 86400);
        }

        /** 解析信息*/
        public formatLibrary(data: pb.sc_get_rebuilding_the_library_info): void {
            this._msg = data;
        }

        /**
         * 设置数据
         * @param type 1-收集 2-兑换 3-商店
         * @param index 
         */
        public setLibraryInfo(type: number, index: number): void {
            switch (type) {
                case 1:
                    this._msg.materialGetStatus = util.setBit(this._msg.materialGetStatus, index, 1);
                    break;
                case 2:
                    this._msg.exchangeStatus = util.setBit(this._msg.exchangeStatus, index, 1);
                    break;
            }
        }

        /**
         * 检查是否完成
         * @param type 1-收集 2-兑换 3-商店
         * @param index 位置
         */
        public checkFinish(type: number, index: number): boolean {
            switch (type) {
                case 1:
                    return util.getBit(this._msg.materialGetStatus, index) == 1;
                case 2:
                    return util.getBit(this._msg.exchangeStatus, index) == 1;
            }
        }

        public giftTimes(index: number): number {
            return this._msg["giftBagBuyTimes" + index];
        }

        public setGiftTimes(index: number): void {
            this._msg["giftBagBuyTimes" + index]++;
        }

        public getExchange(lv: number): string {
            let day: number = this.getCurrDay();
            let array: xls.rebuildChange[] = xls.get(xls.rebuildChange).getValues();
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let ele: xls.rebuildChange = array[i];
                if (ele.time == day && ele.level.v1 <= lv && ele.level.v2 >= lv) return ele.task;
            }
        }

        /** 重置神秘商店*/
        public resetShop(): void {
            for (let i: number = 1; i < 4; i++) { this._msg["giftBagBuyTimes" + i] = 0; }
        }

        public dispose(): void {
            LibraryModel.ins = null;
        }

        public get shopTime(): number {
            return this._msg.strikeMysteriousStartTime;
        }

        public set shopTime(value: number) {
            this._msg.strikeMysteriousStartTime = value;
        }
    }
}