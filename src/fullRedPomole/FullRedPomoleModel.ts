namespace fullRedPomole {
    export class FullRedPomoleModel implements clientCore.BaseModel {
        private readonly _petalIds: Array<number> = [413, 414, 415, 416, 417, 418, 419, 420, 421, 422];//奖励id号
        private readonly _needsTokens: Array<number> = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
        public readonly TOKEN_ID: number = 9900194;//代币
        public readonly RULE_ID: number = 1152;
        public readonly suitId: number = 2110412;
        /**
         * 获取每个花瓣奖励的Id号
         */
        public getRewardId(sex: number): Array<number> {
            let cfg: xls.commonAward;
            let myPair: xls.pair[];
            let results: number[] = [];
            this._petalIds.forEach(id => {
                cfg = xls.get(xls.commonAward).get(id);
                myPair = sex == 1 ? cfg.femaleAward : cfg.maleAward;
                results.push(myPair[0].v1);
            });
            return results;
        }

        public getOneRewardId(index: number, sex: number): number {
            let cfg: xls.commonAward = xls.get(xls.commonAward).get(this._petalIds[index]);
            let myPair: xls.pair[] = sex == 1 ? cfg.femaleAward : cfg.maleAward;
            return myPair[0].v1;
        }

        public getNeedToken(index: number): number {
            return this._needsTokens[index];
        }
        //获取当前拥有的代币
        public getCurMoney(): number {
            return clientCore.MoneyManager.getNumById(this.TOKEN_ID)
        }
        //获取当前能够领取的奖励
        public getCanGetId(isCumulative: boolean = true): number[] {
            const rewards: Array<number> = this.getRewardId(clientCore.LocalInfo.sex);
            let startIndex: number = null;
            let i: number, j: number;
            for (i = 0, j = rewards.length; i < j; i++) {
                if (!clientCore.ItemsInfo.checkHaveItem(rewards[i])) {
                    startIndex = i;
                    break;
                }
            }
            if (startIndex == null) {
                return null;
            }
            let curMoney: number = this.getCurMoney();
            let results: number[] = [];
            for (i = startIndex, j = this._petalIds.length; i < j; i++) {
                if (curMoney >= this._needsTokens[i]) {
                    if (!isCumulative) {
                        curMoney -= this._needsTokens[i];
                    }
                    results.push(this._petalIds[i]);
                } else {
                    break;
                }
            }
            if (results.length == 0) {
                return null;
            }
            return results;
        }
        public dispose(): void {

        }
    }
}
