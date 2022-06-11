namespace girlMemories {
    export class GirlMemoriesModel implements clientCore.BaseModel {
        //每日线索数量
        public readonly DAILY_CULE_NUM: number;
        /**规则ID号 */
        public readonly RULE_ID: number = 1201;
        /**找茬规则ID号 */
        public readonly ClueAnalysisPanel_RULE_ID: number = 1202;
        /**线人来报规则ID号(删除) */
        public readonly InformationComePanel_RULE_ID: number = null;
        private readonly ACTIVITY_TIMERS: string[] = ["2021-7-20 00:00:00", "2021-8-12 23:59:59"];
        /**代币 */
        public readonly MONEY_ID: number;
        public readonly ITEMS_LIST: Array<Array<number>> = [
            [131341, 131337, 131340, 131339, 131336, 131338],
            [131349, 131345, 131348, 131347, 131344, 131346]
        ];
        //需要的线索
        public readonly NEED_CLUES: Array<number> = [10, 20, 30, 40, 50, 75];
        //套装ID号
        public readonly SUIT_ID: number = 2110443;

        //#region 找茬相关
        //找茬(各个图片的差别位置坐标)
        public readonly QuickspotPOSs: Array<IQuickspotVO> = [
            { a: { x: 286, y: 122 }, b: { x: 353, y: 215 }, c: { x: 180, y: 335 } },
            { a: { x: 193, y: 70 }, b: { x: 395, y: 120 }, c: { x: 390, y: 262 } },
            { a: { x: 230, y: 120 }, b: { x: 185, y: 242 }, c: { x: 392, y: 305 } },
            { a: { x: 175, y: 107 }, b: { x: 143, y: 330 }, c: { x: 360, y: 200 } },
            { a: { x: 160, y: 145 }, b: { x: 45, y: 320 }, c: { x: 345, y: 288 } },
            { a: { x: 135, y: 110 }, b: { x: 62, y: 250 }, c: { x: 230, y: 343 } }
        ];
        //找茬误差半径
        public readonly QuickspotErrorRadius: number = 50;
        //找茬时间段
        public readonly QuickspotCDTimeParagraph: Array<number> = [60, 40, 20];
        //找茬错误扣除时间
        public readonly QuickspotErrorDeductionTime: number = 10;
        //#endregion
        /**剧情ID号 */
        public readonly plotID: number = 80532;
        /**拼凑 */
        public readonly plotPCID: number = 80533;


        public constructor() {
            this.DAILY_CULE_NUM = clientCore.SearchClubsMapManager.ins.DAILY_CULE_NUM;
            this.MONEY_ID = clientCore.SearchClubsMapManager.ins.MONEY_ID;
            const cfg: xls.eventControl = xls.get(xls.eventControl).get(172);
            this.ACTIVITY_TIMERS = cfg.eventTime.split("_");
        }

        //获取当前的活动时间的类型
        private checkDateType(): clientCore.SearchClubsDateType {
            const now: number = clientCore.ServerManager.curServerTime;
            let sd: number = util.TimeUtil.formatTimeStrToSec(this.ACTIVITY_TIMERS[0]);
            if (now < sd) {
                return clientCore.SearchClubsDateType.NONE_START;
            }
            let ed: number = util.TimeUtil.formatTimeStrToSec(this.ACTIVITY_TIMERS[1]);
            if (now > ed) {
                return clientCore.SearchClubsDateType.OBSOLETE;
            }
            return clientCore.SearchClubsDateType.GAMEING;
        }
        /**
         * 获取没有领取的碎片index(从0开始)
         */
        public getJigSawIndex(): number {
            const index: number = clientCore.LocalInfo.sex - 1;
            const arr: Array<number> = this.ITEMS_LIST[index];
            let itemId: number;
            for (let i: number = 0, j: number = arr.length; i < j; i++) {
                itemId = arr[i];
                if (!clientCore.ItemsInfo.checkHaveItem(itemId)) {
                    return i;
                }
            }
            return null;
        }
        //6个碎片相对应的奖励
        public getJigSawItemId(index: number): number {
            const i: number = clientCore.LocalInfo.sex - 1;
            const arr: Array<number> = this.ITEMS_LIST[i];
            return arr[index];
        }
        //今日线索完成标记位 (统计个数)
        public getStatisticsClueFinish(): number {
            let result: number = 0;
            for (let i: number = 0; i < this.DAILY_CULE_NUM; i++) {
                if (util.getBit(clientCore.SearchClubsMapManager.ins.searchData.clueFinish, i + 1) == 1) {
                    result++;
                }
            }
            return result;
        }
        //今日线索已领取标记位 (统计个数)
        public getStatisticsClueReward(): number {
            let result: number = 0;
            for (let i: number = 0; i < this.DAILY_CULE_NUM; i++) {
                if (util.getBit(clientCore.SearchClubsMapManager.ins.searchData.clueReward, i + 1) == 1) {
                    result++;
                }
            }
            return result;
        }

        public dispose(): void {

        }
    }
}