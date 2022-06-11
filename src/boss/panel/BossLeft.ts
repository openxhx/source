namespace boss {
    /**
     * 左侧
     */
    export class BossLeft {
        private _model: BossModel;
        private _control: BossControl;
        private _commonData: xls.bossCommomData;
        private _ui: ui.boss.panel.BossLeftUI;
        private _rewardPanel: RewardPanel;
        private _maxE: number; //最大激励数
        constructor(view: ui.boss.panel.BossLeftUI, sign: number) {
            this._commonData = xls.get(xls.bossCommomData).get(1);
            this._model = clientCore.CManager.getModel(sign) as BossModel;
            this._control = clientCore.CManager.getControl(sign) as BossControl;
            this._ui = view;

            this._ui.rankView.list.vScrollBarSkin = "";
            this._ui.rankView.list.renderHandler = Laya.Handler.create(this, this.rankItem, null, false);
            this._ui.rankView.list.array = null;
            this._ui.imgFrame.skin = clientCore.LocalInfo.frameImgUrl;
            this._ui.imgIco.skin = clientCore.LocalInfo.headImgUrl;
            this._ui.imgExp.width = clientCore.LocalInfo.getLvInfo().expPercent * 167;
            this._ui.txLv.changeText(clientCore.LocalInfo.userLv + "");
            this._ui.txName.changeText(clientCore.LocalInfo.userInfo.nick);

            this._ui.btnLike.visible = false;

            this.addEvents();
        }

        private addEvents(): void {
            BC.addEvent(this, this._ui.btnExcitation, Laya.Event.CLICK, this, this.onExcitation);
            BC.addEvent(this, this._ui.rankView.btnReward, Laya.Event.CLICK, this, this.onReward);
            BC.addEvent(this, this._ui.rankView.btnShop, Laya.Event.CLICK, this, this.onShop);
            BC.addEvent(this,this._ui.btnLike,Laya.Event.CLICK,this,this.onLikeClick);
        }

        private onLikeClick(){
            clientCore.ModuleManager.open("bossTopThree.BossTopThreeModule","click");
        }

        public fightOver(){
            this._ui.btnExcitation.visible = false;
            this._ui.btnLike.visible = true;
        }

        private removeEvents(): void {
            BC.removeEvent(this);
        }

        private rankItem(item: ui.boss.render.RankItemUI, index: number): void {
            let data: pb.WorldBossRank = item.dataSource;
            let top3: boolean = data.rank <= 3;
            item.txName.changeText(data.userInfo.nick);
            item.txDamage.changeText(data.score + "");
            item.txLv.changeText(clientCore.LocalInfo.parseLvInfoByExp(data.userInfo.exp).lv + "");
            item.imgRank.visible = top3;
            item.txRank.visible = !top3;
            if (top3) {
                item.imgRank.skin = `boss/top${data.rank}.png`;
            } else {
                item.txRank.changeText(data.rank + "");
            }
        }

        update(): void {
            this._ui.txExcitation.changeText(`能力提升${this._commonData.encourage.v1 * this._model.excitation}%`);
            this._maxE = this._commonData.encourage.v2 / this._commonData.encourage.v1;
            this._ui.btnExcitation.visible = this._model.excitation < this._maxE;
        }

        async updateRank(): Promise<void> {
            let rank: pb.sc_get_world_boss_damage_rank = await this._control.damageRank();
            if (!rank) return;
            this._ui.rankView.list.array = rank.allRank;
            this._ui.rankView.txRank.changeText(rank.userRank.rank == 0 ? "默默无闻" : rank.userRank.rank + "");
            this._ui.rankView.txDamage.changeText(rank.userRank.score + "");
            this._model.myDamage = rank.userRank.score;
        }

        // private createTestRankInfo(){
        //     let arr:pb.IWorldBossRank[] = [];
        //     for(let i = 1;i<11;i++){
        //         let info = new pb.WorldBossRank();
        //         info.rank = i;
        //         info.score = (12 - i )* 300 + 10000;
        //         info.userInfo = new pb.UserBase();
        //         info.userInfo.userid = i;
        //         info.userInfo.nick = "玩家"+i;
        //         arr.push(info);
        //     }
        //     this._ui.rankView.list.array = arr;
        // }

        dispose(): void {
            this.removeEvents();
            this._model = this._control = this._commonData = this._ui = null;
        }

        set rankVisible(value: boolean) {
            this._ui.rankView.visible = value;
        }

        get rankVisible(): boolean {
            return this._ui.rankView.visible;
        }

        /** 激励*/
        private onExcitation(): void {
            if (this._model.excitation >= this._maxE) {
                alert.showFWords("激励次数已达上限~");
                return;
            }
            let cost: number = this._commonData.encourageCost[this._model.excitation];
            if (cost == void 0) return;
            if (cost == 0) {
                this.excitation();
            } else {
                alert.showSmall(`是否花费${cost}神叶进行激励？`, {
                    callBack: {
                        caller: this,
                        funArr: [() => { clientCore.MoneyManager.checkLeaf(cost) && this.excitation(); }]
                    }
                })
            }
        }

        private excitation(): void {
            let status: number = this._model.status;
            if (status == 0 || status == 3) {
                alert.showFWords('不在可激励时间范围内~');
                return;
            }
            this._control.excitation(Laya.Handler.create(this, () => {
                this._model.excitation++;
                this._ui.txExcitation.changeText(`能力提升${this._commonData.encourage.v1 * this._model.excitation}%`);
                this._ui.btnExcitation.visible = this._model.excitation < this._maxE;
            }))
        }

        /** 奖励显示*/
        private onReward(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击奖励详情');
            this._rewardPanel = this._rewardPanel || new RewardPanel();
            this._rewardPanel.show();
        }

        /** 打开商场*/
        private onShop(): void {
            clientCore.Logger.sendLog('活动', '世界BOSS', '点击活动商店');
            clientCore.ModuleManager.open("commonShop.CommonShopModule", 2);
        }

        /** 更新我的战斗排行*/
        public updateMyRank(damge: number): void {
            let array: pb.WorldBossRank[] = this._ui.rankView.list.array;
            if (!array || array.length <= 0) return;
            this._model.myDamage += damge;
            let len: number = array.length;
            let msg: pb.WorldBossRank;
            for (let i: number = 0; i < len; i++) {
                let element: pb.WorldBossRank = array[i];
                if (element.userInfo.userid == clientCore.LocalInfo.uid) {//不可能倒退吧？
                    element.score = this._model.myDamage;
                    this._ui.rankView.list.changeItem(i, element);
                    break;
                }
                if (element.score < this._model.myDamage) {
                    msg = this.creMsg(i + 1);
                    break;
                }
            }
            this._ui.rankView.txDamage.changeText(this._model.myDamage + "")
            if (msg) {
                let index: number = msg.rank;
                array = _.filter(array, (element) => { return element.userInfo.userid != msg.userInfo.userid; });
                array.splice(msg.rank - 1, 0, msg);

                if(array.length > 10){
                    array = array.slice(0,10);
                }

                len = array.length;
                for (let i: number = index; i < len; i++) {
                    array[i].rank = i + 1;
                }
                this._ui.rankView.list.array = array;
                this._ui.rankView.txRank.changeText(msg.rank + "");
            }
        }

        private creMsg(rank: number): pb.WorldBossRank {
            let msg: pb.WorldBossRank = new pb.WorldBossRank();
            msg.rank = rank;
            msg.score = this._model.myDamage;
            let userInfo: pb.UserBase = new pb.UserBase();
            userInfo.nick = clientCore.LocalInfo.userInfo.nick;
            userInfo.exp = clientCore.LocalInfo.userInfo.exp;
            userInfo.userid = clientCore.LocalInfo.uid;
            msg.userInfo = userInfo;
            return msg;
        }
    }
}