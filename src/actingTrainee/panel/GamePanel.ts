namespace actingTrainee {
    /**
     * 跳跳小游戏入口
     * actingTrainee.GamePanel
     */
    export class GamePanel extends ui.actingTrainee.panel.GamePanelUI {
        private _sign: number;

        private _friendRankInfo: clientCore.RankInfo[];
        private _historyHightScore: number;

        constructor(sign: number) {
            super();
            this._sign = sign;
        }

        init(d: any) {
            this.seqPreLoad();
        }

        async seqPreLoad() {
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;
            await clientCore.RankManager.ins.getSrvRank(model.game_Id).then((rankInfos) => {
                rankInfos = rankInfos.slice(0, 10);
                this._friendRankInfo = _.sortBy(rankInfos, (o) => { return o.msg.score }).reverse();
                return Promise.resolve();
            })
            await net.sendAndWait(new pb.cs_jump_game_get_info({})).then((data: pb.sc_jump_game_get_info) => {
                this.txtScore.text = '历史最高分：' + data.historyHighScore.toString();
                this._historyHightScore = data.historyHighScore;
                this.txtTime.text = data.residueTimes + '/3';
            })
        }

        private onDetail() {
            let model = clientCore.CManager.getModel(this._sign) as ActingTraineeModel;
            alert.showRuleByID(model.ruleById2);
        }

        private onStart() {
            let resttimes = parseInt(this.txtTime.text);
            if (resttimes > 0) {
                clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '进入游戏');
                this.close();
                clientCore.ModuleManager.closeAllOpenModule();
                clientCore.ModuleManager.open('jumpGame.JumpGameModule',
                    { modelType: "activity", openType: "actingTrainee", friendArr: this._friendRankInfo, historyHighScore: this._historyHightScore, isTry: false },
                    { openWhenClose: "actingTrainee.ActingTraineeModule", openData: {} });
            }
            else {
                alert.showFWords('剩余次数不足')
            }
        }

        private onTry() {
            clientCore.Logger.sendLog('2020年9月14日活动', '【游戏】演剧练习生', '点击试玩按钮');
            this.close();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open('jumpGame.JumpGameModule',
                { modelType: "activity", openType: "actingTrainee", friendArr: this._friendRankInfo, historyHighScore: this._historyHightScore, isTry: true },
                { openWhenClose: "actingTrainee.ActingTraineeModule", openData: {} });
        }

        close() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.close);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.onStart);
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.onTry);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}