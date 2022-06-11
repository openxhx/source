namespace spacetimeDetective {
    export class SpacetimeDetectiveModel implements clientCore.BaseModel {
        //主规则
        public readonly MAIN_RULE_ID: number = 1203;
        //战斗规则
        public readonly CHALLENGERABBIT_RULE_ID: number = null;
        //套装
        public readonly SUIT_ID: number = 2110442;
        //代币
        public readonly MONEY_IDs: number[] = [9900207, 9900002];//回忆火苗,神叶
        /**章节信息 */
        public capterInfo: ICapterVo;
        /**活动时间 */
        public readonly ACTIVITY_TIME: string[] = ["2021-7-20 00:00:00", "2021-8-12 23:59:59"];
        /**每日上限 */
        public readonly DAILY_UPLIMIT: number = 200;
        public readonly ITEMS: Array<Array<Array<number>>> = [
            [
                [137779, 137780], [137775, 137782], [137776, 137778], [137781, 137774], [137773, 137777]//女
            ],
            [
                [137789, 137790], [137785, 137792], [137786, 137788], [137791, 137783], [137784, 137787]//男
            ]
        ];
        //#region 气泡语言
        //鲁鲁修的气泡语言
        public readonly SELF_BUBBLE_TALKs: string[] = [
            "好黑啊，得想办法点亮这里的灯。",
            "那么，该从哪里开始调查呢？",
            "我才不会输给你！",
            "这种小把戏，我最擅长啦！",
            "这后面会藏着什么秘密呢？",
            "好温暖的感觉！",
            "这是……",
            "继续前进吧",
            "希望这些笔记能帮到爱德文。",
            "看来必须要战斗了。"
        ];
        //其他人物的气泡对话
        public readonly OTHER_BUBBLE_TALKs: string[] = [
            "我也不知道为什么会到这儿来。",
            "解开我的题目，或者付出你的代价！",
            "打开我！打开我！打开我！"
        ];

        public readonly RED_BTN_CFG: Array<IButtonCfg> = [
            {
                skin: "spacetimeDetective/txtb_lightfire.png",
                offX: 45,
                offY: 15,
                hasConsume: true
            },//点亮灯火
            {
                skin: "spacetimeDetective/txtb_cancel.png",
                offX: 75,
                offY: 28,
                hasConsume: false
            },//放弃(放弃解锁)
            {
                skin: "spacetimeDetective/txtb_pay.png",
                offX: 75,
                offY: 15,
                hasConsume: true
            },//缴钱(答题)
        ];
        public readonly GREEN_BTN_BOTTOM_GCF: Array<IButtonCfg> = [
            {
                skin: "spacetimeDetective/txtb_touchfire.png",
                offX: 45,
                offY: 28,
                hasConsume: false
            },//触摸火光 0
            {
                skin: "spacetimeDetective/txtb_enter.png",
                offX: 75,
                offY: 28,
                hasConsume: false
            },//进入 1
            {
                skin: "spacetimeDetective/txtb_pickup.png",
                offX: 75,
                offY: 28,
                hasConsume: false
            },//拾取 2
            {
                skin: "spacetimeDetective/txtb_nextchapter.png",
                offX: 28,
                offY: 28,
                hasConsume: false
            },//前往下一章 3
            {
                skin: "spacetimeDetective/txtb_viewnote.png",
                offX: 45,
                offY: 28,
                hasConsume: false
            },//查看笔记 4
            {
                skin: "spacetimeDetective/txtb_battle.png",
                offX: 75,
                offY: 28,
                hasConsume: false
            },//战斗 5
        ];
        public readonly GREEN_BTN_UP_GCF: Array<IButtonCfg> = [
            {
                skin: "spacetimeDetective/txtb_unlock.png",
                offX: 75,
                offY: 28,
                hasConsume: false
            },//解锁
            {
                skin: "spacetimeDetective/txtb_answer.png",
                offX: 75,
                offY: 28,
                hasConsume: false
            },//答题
        ];
        //#endregion
        /**
         * 点亮花费
         * 回忆火苗 , 神叶
         */
        public readonly LIGHTING_PAY: Array<Array<number>> = [
            [30, 100], [75, 200], [125, 300], [175, 400], [225, 500]
        ];
        /**各个章节的名称 */
        public readonly CAPTER_NAMEs: string[] = [
            "表参道", "格林威治", "竹下通", "西敏寺", "流光浮廊"
        ];
        /**
         * 各个章节对应的场景地图,从1开始
         */
        public readonly CAPTER_SCENEs: Array<number> = [1, 2, 1, 2, 3];
        /**答题缴钱 */
        public readonly ANSWER_FIRE_PAY: number = 10;
        /**已经回答了的任务 */
        public QUESTION_IDs: number[] = [];
        /**剧情 */
        public readonly PLOTs: number[] = [80535, 80536, 80537, 80538, 80539];
        /**
         * 获取当前性别的目标Items
         */
        private getTargetSexItems(sex: number = null): Array<Array<number>> {
            if (sex == null) {
                sex = clientCore.LocalInfo.sex;
            }
            return this.ITEMS[sex - 1];
        }
        /**
         * 获取当前章节序号(从0开始)
         */
        public getCurrentCapter(): number {
            const items: Array<Array<number>> = this.getTargetSexItems();
            let cells: Array<number>;
            for (let i: number = 0, j: number = items.length; i < j; i++) {
                cells = items[i];
                if (!clientCore.ItemsInfo.checkHaveItem(cells[0])) {
                    return i;
                }
            }
            return null;
        }
        /**
         * 获取本次需要打开的门
         */
        public getOpenDoor(cnt: number = 2): Array<number> {
            let results: number[] = [];
            let index: number;
            while (results.length < cnt) {
                index = this.andomNumBoth(1, 4);
                if (index > 3) {
                    continue;
                }
                if (results.length == 0) {
                    results.push(index);
                } else {
                    if (results.indexOf(index) < 0) {
                        results.push(index);
                    }
                }
            }
            return results;
        }


        constructor() {
            const cfg: xls.eventControl = xls.get(xls.eventControl).get(173);
            this.ACTIVITY_TIME = cfg.eventTime.split("_");
        }
        /**
         * 获取一个问题ID
         */
        public getQuestionId(): number {
            let id: number;
            while (true) {
                id = this.andomNumBoth(134, 156);
                if (id == 156) continue;
                if (this.QUESTION_IDs.length == 156 - 134) {
                    this.QUESTION_IDs.length = 0;
                    this.QUESTION_IDs.push(id);
                    return id;
                }
                if (this.QUESTION_IDs.indexOf(id) >= 0) continue;
                this.QUESTION_IDs.push(id);
                return id;
            }
        }

        /**
         * 随机算法
         */
        private andomNumBoth(min: number, max: number): number {
            const Range: number = max - min;
            if (Range != 0.0) {
                const Rand: number = Math.random();
                const num: number = min + Math.round(Rand * Range); //四舍五入
                return num;
            } else {
                return min;
            }
        }
        dispose(): void {
            this.QUESTION_IDs = null;
        }
    }
}