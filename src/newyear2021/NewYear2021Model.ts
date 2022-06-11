namespace newyear2021{
    export class NewYear2021Model implements clientCore.BaseModel{
        /** 本次活动ID*/
        readonly ACTIVITY_ID: number = 118;
        /** 奖励兑换活动ID*/
        readonly EXCHANGE_EVENT_ID: number = 119;
        /** 奖励兑换需要的道具ID*/
        readonly EXCHANGE_ITEM_ID: number = 9900131;
        /** 春联字符道具ID*/
        readonly COUPLET_ITEM_ID: number = 1511026;
        /** 寻福总次数*/
        readonly MAX_FIND_FU: number = 10;
        /** 可以获得红包总次数*/
        readonly MAX_REDPACKET: number = 3;

        /** 找福次数*/
        findFuTimes: number;
        /** 对联领取进度*/
        coupletStep: number;
        /** 对联奖励领取情况*/
        rewardIdx: number;
        /** 今日获得红包次数*/
        redPacketTimes: number;

        constructor(){}

        initMsg(msg: pb.sc_new_years_active_panel): void{
            this.findFuTimes = msg.findFuTimes;
            this.redPacketTimes = msg.redPacketTimes;
            this.coupletStep = msg.wordStep;
            this.rewardIdx = msg.rewardFlag;
        }

        /** 判断当前位置是否可以领奖*/
        checkReward(index: number): boolean{
            return index <= Math.floor(this.coupletStep/7) && util.getBit(this.rewardIdx,index) == 0;
        }

        dispose(): void{
        }
    }
}