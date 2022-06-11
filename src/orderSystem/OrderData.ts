namespace orderSystem {
    export class OrderData {

        private _config: xls.orderBase;
        private _data: pb.IOrder;
        private _dialogueList: string[];
        private _weightList: number[];
        private _maxWeight: number;
        private _time: number;

        constructor(config: xls.orderBase, data: pb.IOrder) {
            this._config = config;
            this._data = data;
            // if(this._data.refreshInterval > 0){
            //     this._data.refreshInterval = 15;
            // }
            this._time = clientCore.ServerManager.curServerTime + data.refreshInterval;
            this.setDialogueConfig();
        }

        private setDialogueConfig() {
            this._weightList = this._config.dialogueProb;

            this._dialogueList = this._config.npcDialogue;
            this._maxWeight = 0;

            for (let i: number = 0; i < this._weightList.length; i++) {
                this._maxWeight += this._weightList[i];
            }
        }

        public get config(): xls.orderBase {
            return this._config;
        }

        public get data(): pb.IOrder {
            return this._data;
        }

        public get getTime(): number {
            return this._data.getTime;
        }

        public getDialogue(): string {
            let ran: number = Math.floor(Math.random() * this._maxWeight);
            let count: number = 0;
            for (let i: number = 0; i < this._weightList.length; i++) {
                count += this._weightList[i];
                if (ran < count) {
                    return this._dialogueList[i];
                }
            }
            return "";
        }

        public checkTime(): boolean {
            if (this._time - clientCore.ServerManager.curServerTime < 0) {
                this._data.refreshInterval = 0;
                return true;
            } else {
                return false;
            }
        }

        public getRemainTime(): string[] {
            let time: number = this._time - clientCore.ServerManager.curServerTime;
            time = Math.max(0, time);
            return util.StringUtils.getDateStr(time, ':').split(':');
        }

        public checkItem(): boolean {
            let len: number = this._data.orderItemInfo.length;
            let info: pb.IOrderItemInfo;
            for (let i: number = 0; i < len; i++) {
                info = this._data.orderItemInfo[i];
                if (clientCore.ItemsInfo.getItemNum(info.needCollectItemId) < info.needItemTotalCnt) {
                    return false;
                }
            }
            return true;
        }
    }
}