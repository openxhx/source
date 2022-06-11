namespace flowerSong {
    /**
     * 花漾之歌
     * flowerSong.FlowerSongModule
     * 2021.4.23
     */
    export class FlowerSongModule extends ui.flowerSong.FlowerSongModuleUI {
        private _config: xls.commonAward[];
        private _getIdx: number;
        private _openIdx: number;

        private _ani: clientCore.Bone;
        init() {
            this.addPreLoad(xls.load(xls.commonAward));
            this.imgSuit1.visible = this.boxCloth1.visible = clientCore.LocalInfo.sex == 1;
            this.imgSuit2.visible = this.boxCloth2.visible = clientCore.LocalInfo.sex == 2;
            this._ani = clientCore.BoneMgr.ins.play("res/animate/activity/fallingpetals.sk", 0, true, this);
            this._ani.pos(667, 750);
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年4月23日活动', '【主活动】花漾之歌', '打开主活动面板');
            this._config = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == 142 });
            this.updateUI();
        }

        private updateUI() {
            let curCoin = clientCore.ItemsInfo.getItemNum(9900154);
            this.labCur.text = "" + curCoin;
            this._getIdx = 0;
            this._openIdx = 0;
            for (let i: number = 1; i <= 7; i++) {
                let config = this._config[i - 1];
                let reward = clientCore.LocalInfo.sex == 1 ? config.femaleAward[0] : config.maleAward[0];
                if (curCoin >= config.num.v2) this._openIdx = i;
                if (clientCore.ItemsInfo.checkHaveItem(reward.v1)) this._getIdx = i;
                this["imgGet" + i].visible = this._getIdx >= i;
                this["imgMask" + i].visible = this._openIdx < i;
                this["diCost" + i].visible = this._getIdx < i;
                this["labCost" + i].text = "" + config.num.v2;
            }
            this.btnGet.visible = this._openIdx > 0 && this._openIdx > this._getIdx;
            this.boxCondition.visible = this._openIdx < 7 && this._openIdx == this._getIdx;
            if (this.boxCondition.visible) {
                let next = this._config[this._openIdx];
                this.labCondition.text = "再收集" + (next.num.v2 - curCoin);
            }
        }

        /**帮助说明 */
        private showRule() {
            clientCore.Logger.sendLog('2021年4月23日活动', '【主活动】花漾之歌', '点击活动规则按钮');
            alert.showRuleByID(1152);
        }

        /**试穿服装 */
        private trySuit() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110344);
        }

        /**领取奖励 */
        private getReward() {
            if (this._getIdx == this._openIdx) return;
            clientCore.Logger.sendLog('2021年4月23日活动', '【主活动】花漾之歌', '点击领取按钮');
            let list = [];
            for (let i = this._getIdx; i < this._openIdx; i++) {
                list.push(this._config[i].id);
            }
            net.sendAndWait(new pb.cs_song_of_flower_reward({ list: list })).then((msg: pb.sc_song_of_flower_reward) => {
                alert.showReward(msg.items);
                this.updateUI();
                util.RedPoint.reqRedPointRefresh(26001);
            })
        }

        /**跳转花仙乐园 */
        private goGrand() {
            clientCore.Logger.sendLog('2021年4月23日活动', '【主活动】花漾之歌', '点击收集按钮');
            this.destroy();
            clientCore.ModuleManager.open("playground.PlaygroundModule");
        }

        /**展示tips */
        private showTips(idx: number) {
            let reward = clientCore.LocalInfo.sex == 1 ? this._config[idx - 1].femaleAward[0] : this._config[idx - 1].maleAward[0];
            clientCore.ToolTip.showTips(this["diItem" + idx], { id: reward.v1 });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btnRule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.goGrand);
            BC.addEvent(this, this.btnGet, Laya.Event.CLICK, this, this.getReward);
            for (let i: number = 1; i <= 7; i++) {
                BC.addEvent(this, this["diItem" + i], Laya.Event.CLICK, this, this.showTips, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._ani?.dispose();
            this._ani = null;
            this._config = null;
            super.destroy();
        }
    }
}