namespace summerWaterWorld {
    /**
     * 夏日水世界
     * 2021.5.28
     * summerWaterWorld.SummerWaterWorldModule
     */
    export class SummerWaterWorldModule extends ui.summerWaterWorld.SummerWaterWorldModuleUI {
        private _config: xls.commonAward[];
        private _curCoin: number;
        private _openIdx: number;
        private _gotIdx: number[];
        init() {
            this.addPreLoad(xls.load(xls.commonAward));
            this.img_suit_1.visible = clientCore.LocalInfo.sex == 1;
            this.img_suit_2.visible = clientCore.LocalInfo.sex == 2;
            for (let i: number = 1; i <= 3; i++) {
                this[`img_npc_${i}_1`].visible = true;
                this[`img_npc_${i}_2`].visible = false;
                this['img_muban_' + i].skin = 'summerWaterWorld/mu_ban_1.png';
            }
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【主活动】夏日水世界', '打开主活动面板');
            this._config = _.filter(xls.get(xls.commonAward).getValues(), (o) => { return o.type == 152 });
            this._curCoin = clientCore.ItemsInfo.getItemNum(9900170);
            this.lab_drop.text = "" + this._curCoin;
            this._gotIdx = [];
            this._openIdx = 0;
            for (let i: number = 1; i <= 9; i++) {
                this.updateItem(i);
            }
            let flag = this._openIdx / 3;
            for (let i: number = 1; i <= 3; i++) {
                let cover = _.intersection(this._gotIdx, [i * 3 - 2, i * 3 - 1, i * 3]).length;
                if (cover == 3) {
                    this['img_water_' + i].height = 0;
                    continue;
                }
                if (i <= flag) {
                    this['img_water_' + i].height = 322;
                } else if (i > Math.floor(flag + 1)) {
                    this['img_water_' + i].height = 0;
                } else {
                    let _max = this._config[i * 3 - 1].num.v2;
                    let _min = i == 1 ? 0 : this._config[i * 3 - 4].num.v2;
                    this['img_water_' + i].height = (this._curCoin - _min) / (_max - _min) * 322;
                }
            }
        }

        private updateItem(idx: number, needAni: boolean = false) {
            let item: ui.summerWaterWorld.item.WaterboxItemUI = this["item_" + idx];
            let config = this._config[idx - 1];
            let reward = clientCore.LocalInfo.sex == 1 ? config.femaleAward[0] : config.maleAward[0];
            if (this._curCoin >= config.num.v2 && this._openIdx < idx) this._openIdx = idx;
            let isGot = clientCore.ItemsInfo.checkHaveItem(reward.v1);
            item.reward_flag.visible = isGot;
            item.cost.text = "" + config.num.v2;
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(reward.v1);
            item.box_cost.visible = this._curCoin < config.num.v2;
            item.btn_get.visible = !item.box_cost.visible && !isGot;
            if (isGot && !this._gotIdx.includes(idx)) {
                this._gotIdx.push(idx);
                this.checkAni(idx, needAni);
            }
        }

        private checkAni(idx: number, needAni: boolean = false) {
            let flag = Math.ceil(idx / 3);
            let cover = _.intersection(this._gotIdx, [flag * 3 - 2, flag * 3 - 1, flag * 3]).length;
            this['img_muban_' + flag].skin = `summerWaterWorld/mu_ban_${cover}.png`;
            if (cover == 3) {
                this[`img_npc_${flag}_1`].visible = false;
                this['img_water_' + flag].height = 0;
                if (needAni) {
                    let aniName = ["kukulu", "fenni", "lulu"][flag - 1];
                    let x = [454, 689, 925][flag - 1];
                    let y = [696, 697, 711][flag - 1];
                    let ani = clientCore.BoneMgr.ins.play(`unpack/summerWaterWorld/${aniName}.sk`, 0, false, this);
                    ani.pos(x, y);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                        if (!this.destroyed) {
                            this[`img_npc_${flag}_2`].visible = true;
                        }
                    })
                } else {
                    this[`img_npc_${flag}_2`].visible = true;
                }
            }
        }

        /**帮助说明 */
        private showRule() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【主活动】夏日水世界', '点击活动规则按钮');
            alert.showRuleByID(1152);
        }

        /**试穿服装 */
        private trySuit() {
            clientCore.ModuleManager.open("rewardDetail.PreviewModule", 2110375);
        }

        /**跳转花仙乐园 */
        private goGrand() {
            clientCore.Logger.sendLog('2021年5月28日活动', '【主活动】夏日水世界', '点击收集按钮');
            this.destroy();
            clientCore.ModuleManager.open("playground.PlaygroundModule");
        }

        /**领取奖励 */
        private getReward(idx: number) {
            clientCore.Logger.sendLog('2021年5月28日活动', '【主活动】夏日水世界', '点击领取按钮');
            net.sendAndWait(new pb.cs_song_of_flower_reward({ list: [this._config[idx - 1].id] })).then((msg: pb.sc_song_of_flower_reward) => {
                alert.showReward(msg.items, "", {
                    callBack: {
                        caller: this, funArr: [() => {
                            this.updateItem(idx, true);
                        }]
                    }
                });
                util.RedPoint.reqRedPointRefresh(27101);
            })
        }

        /**展示tips */
        private showTips(idx: number) {
            let reward = clientCore.LocalInfo.sex == 1 ? this._config[idx - 1].femaleAward[0] : this._config[idx - 1].maleAward[0];
            clientCore.ToolTip.showTips(this["item_" + idx], { id: reward.v1 });
        }

        /**item点击 */
        private itemClick(idx: number) {
            if (!this._gotIdx.includes(idx) && idx <= this._openIdx) {
                this.getReward(idx);
            } else {
                this.showTips(idx);
            }
        }

        addEventListeners() {
            BC.addEvent(this, this.btn_try, Laya.Event.CLICK, this, this.trySuit);
            BC.addEvent(this, this.btn_rule, Laya.Event.CLICK, this, this.showRule);
            BC.addEvent(this, this.btn_x, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btn_get, Laya.Event.CLICK, this, this.goGrand);
            for (let i: number = 1; i <= 9; i++) {
                BC.addEvent(this, this["item_" + i], Laya.Event.CLICK, this, this.itemClick, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            this._config = null;
            this._gotIdx = null;
            super.destroy();
        }
    }
}