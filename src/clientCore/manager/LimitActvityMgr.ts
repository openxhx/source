namespace clientCore {
    /**
     * 限时活动管理类
     */
    export class LimitActivityMgr {

        static async setup(): Promise<void> {
            await xls.load(xls.limitActivity);
            await xls.load(xls.commonAward);
            BC.addEvent(this, EventManager, globalEvent.ITEM_BAG_CHANGE, this, this.awardStateChange);
            BC.addEvent(this, EventManager, globalEvent.MATERIAL_CHANGE, this, this.awardStateChange);
            BC.addEvent(this, EventManager, globalEvent.CLOTH_CHANGE, this, this.awardStateChange);
        }

        /**
         * 检查活动
         * @param value 
         * @return 返回 0-活动未开始 1-活动中 2-活动结束了、活动下架了
         */
        static checkActivity(cfg: xls.limitActivity): number {
            let data: xls.eventControl = xls.get(xls.eventControl).get(cfg.relationActivity);
            if (!data) {
                console.log(`序号${cfg.id}没有关联活动、或关联的活动并不存在。`);
                return 2;
            }
            if (data.eventOff) return 2;
            if (data.eventTime) {
                let array: string[] = data.eventTime.split("_");
                let st: number = util.TimeUtil.formatTimeStrToSec(array[0]);
                let et: number = util.TimeUtil.formatTimeStrToSec(array[1]);
                let ct: number = clientCore.ServerManager.curServerTime;
                if (ct < st) return 0;
                if (ct > et) return 2;
            }
            return 1;
        }

        /**判断是否有commonAward中对应奖励可领取,并自动更新主UI */
        static awardStateChange() {
            let needCheckArr = _.filter(xls.get(xls.limitActivity).getValues(), o => o.commonAwardRed == 1);//需要检查兑换
            needCheckArr = _.filter(needCheckArr, o => this.checkActivity(o) == 1)//在活动时间中
            let needRed = false;
            for (const actInfo of needCheckArr) {
                if (this.checkCanExchangeByType(actInfo.relationActivity)) {
                    needRed = true;
                    break;
                }
            }
            EventManager.event(globalEvent.HAVE_COMMONAWARD_TO_GET, needRed);
        }


        /**根据commonAward中的type字段判断是否有可兑换的奖励 */
        static checkCanExchangeByType(actType: number) {
            let arr = _.filter(xls.get(xls.commonAward).getValues(), o => o.type == actType);
            if (arr) {
                for (const data of arr) {
                    let clothId = clientCore.LocalInfo.sex == 1 ? data.femaleAward[0].v1 : data.maleAward[0].v1;
                    let have = clientCore.ItemsInfo.getItemNum(clothId) > 0;
                    if (!have && clientCore.ItemsInfo.getItemLackNum({ itemID: data.num.v1, itemNum: data.num.v2 }) <= 0) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}