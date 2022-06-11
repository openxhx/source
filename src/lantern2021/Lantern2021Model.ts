namespace lantern2021{
    export class Lantern2021Model implements clientCore.BaseModel{
        /** 本次活动ID*/
        readonly ACTIVITY_ID: number = 120;
        /** 奖励兑换需要的道具ID*/
        readonly EXCHANGE_ITEM_ID: number = 9900132;

        /** 是否领取了每日奖励*/
        dailyFlag: boolean;
        /** 本日兑换任务*/
        tasks: number[];
        /** 已经猜灯谜的次数*/
        answerTimes: number;
        /** 灯谜*/
        questions: number[];
        /** 灯谜标记位*/
        answerIdx: number;


        init(msg: pb.sc_lantern_festival_panel): void{
            this.dailyFlag = msg.daliyGetFlag == 1;
            this.answerTimes = msg.answerTimes;
            this.tasks = msg.exchangeIdList;
            this.answerIdx = msg.answerFlag;
            this.questions = msg.questionIdList;
        }

        dispose(): void{
            this.tasks.length = this.questions.length = 0;
            this.tasks = this.questions = null;
        }

        /**
         * 检查该位置的灯谜是否可答
         * @param pos 
         */
        checkBit(pos: number): boolean{
            return util.getBit(this.answerIdx,pos) == 0;
        }

        setBit(pos: number,value: 0 | 1): void{
            this.answerIdx = util.setBit(this.answerIdx,pos,value);
        }
    }
}