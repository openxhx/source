namespace clientCore {
    export enum STAGE_STATU {
        /**没通关 */
        NO_COMPLETE,
        /**通关了 没领奖 */
        COMPLETE,
        /**领奖励 */
        REWARDED,
    }
    export enum STAGE_TYPE {
        /**普通战斗 */
        NORMAL = 1,
        /**剧情 */
        PLOT = 2,
        /**boss战斗 */
        BOSS = 3,
        /**小游戏 */
        GAME = 4
    }
    export class StageInfo {

        readonly srvData: pb.Istage_info;
        readonly xlsData: xls.stageBase;

        constructor(data: pb.Istage_info) {
            this.srvData = data;
            this.xlsData = xls.get(xls.stageBase).get(data.stageId);
        }

        /**所属的chatperId */
        get chatperId() {
            return this.xlsData.chapter;
        }

        get id() {
            return this.srvData.stageId;
        }

        get state(): STAGE_STATU {
            return this.srvData.isPass;
        }

        get type(): STAGE_TYPE {
            return this.xlsData.type;
        }

        /** 波数*/
        get waveCount(): number {
            let _count: number = 0;
            for (let i: number = 1; i < 4; i++) {
                this.xlsData["wave" + i].length > 0 && (_count++);
            }
            return _count;
        }

        updateSrvData(data: pb.Istage_info) {
            for (const key in this.srvData) {
                this.srvData[key] = data[key];
            }
        }
    }
}