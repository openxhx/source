namespace adventureMission {
    export class MissionPreparePanel extends ui.adventureMission.PreparePanelUI {
        private _teamIdx: number;
        private _fight: number;
        private _teamArr: number[];
        private _exploreInfo: xls.exploreBase;
        private _currTime: number = 1;
        private _rwdLimitArr: ui.adventureMission.render.RewardLimitUI[];
        private _rwdLimitPool: ui.adventureMission.render.RewardLimitUI[];

        constructor() {
            super();
            this._rwdLimitArr = [];
            this._rwdLimitPool = [];
            this.listReward.renderHandler = new Laya.Handler(this, this.onRewardListRender);
            BC.addEvent(this, this.btnUp, Laya.Event.CLICK, this, this.onChangeTime, [1]);
            BC.addEvent(this, this.btnDown, Laya.Event.CLICK, this, this.onChangeTime, [-1]);
            BC.addEvent(this, this.btnGo, Laya.Event.CLICK, this, this.onStartExplore);
        }

        resetTime() {
            this._currTime = 1;
        }

        show(teamIdx: number, teamArr: number[], exploreInfo: xls.exploreBase) {
            this._teamArr = teamArr;
            this._teamIdx = teamIdx;
            this._exploreInfo = exploreInfo;
            this.listReward.dataSource = exploreInfo.exploreReward;
            this._fight = _.sum(_.map(_.compact(this._teamArr), (roleId) => {
                return clientCore.RoleManager.instance.getRoleById(roleId).fight;
            }));
            this.onChangeTime(0);
            this.showRewardLimit();
            this.btnGo.fontSkin = `adventureMission/${_.compact(teamArr).length == 3 ? 'T_y_lijichufa' : 'T_y_yijianpaiqian'}.png`;
        }

        private showRewardLimit() {
            let width = 542;
            let rwds = this._exploreInfo.exploreReward;
            //进度条
            let total = _.last(rwds).v3;
            this.maskProgress.x = (_.clamp(this._fight / total, 0, 1) - 1) * width;
            //如果上次显示的比这次要显示的星星数多 回收一些
            let removeNum = this._rwdLimitArr.length - rwds.length;
            if (removeNum > 0)
                for (let i = 0; i < removeNum; i++) {
                    this.pushRwdLimitToPool(this._rwdLimitArr.pop());
                }
            //星星
            for (let i = 0; i < rwds.length; i++) {
                let fight = rwds[i].v3;
                let star = i < this._rwdLimitArr.length ? this._rwdLimitArr[i] : this.getRwdLimitFromPool();
                star.x = Math.min(fight / total, 1) * width + this.imgProgress.x;
                star.y = this.imgProgress.y;
                star.txt.text = fight.toString();
            }
        }

        private getRwdLimitFromPool(): ui.adventureMission.render.RewardLimitUI {
            let o;
            if (this._rwdLimitPool.length > 0)
                o = this._rwdLimitPool.pop();
            else
                o = new ui.adventureMission.render.RewardLimitUI();
            this.addChild(o);
            this._rwdLimitArr.push(o)
            return o;
        }

        private pushRwdLimitToPool(o: ui.adventureMission.render.RewardLimitUI) {
            o.removeSelf();
            this._rwdLimitPool.push(o);
        }

        private onRewardListRender(cell: ui.adventureMission.render.rewardRenderUI, idx: number) {
            cell.mcReward.skin = clientCore.ItemsInfo.getItemIconUrl(cell.dataSource.v1);
            cell.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(cell.dataSource.v1);
            let ratio = this._fight / cell.dataSource.v3;//系数 = 当前总战斗力/要求的战斗力 若小于1则为0,最多2
            ratio = ratio < 1 ? 0 : ratio;
            ratio = ratio > 2 ? 2 : ratio;
            if(cell.dataSource.v1 == 730011 && ratio>1){
                ratio = 1;
            }
            //奖励预览公式： 系数 * 每小时奖励数 * 小时
            cell.txtNum.text = Math.floor(cell.dataSource.v2 * ratio * this._currTime).toString();
            //当一个奖励也没有时 不显示奖励预览
            if (idx == 0)
                this.boxPreview.visible = ratio > 0;
        }

        private onChangeTime(diff: number) {
            this._currTime = _.clamp(diff + this._currTime, 1, 8);
            this.txtHour.text = this._currTime.toString();
            this.listReward.refresh();
        }

        private onStartExplore() {
            if (_.compact(this._teamArr).length < 3) {
                EventManager.event('AUTO_SELECT_MISSION_ROLE');
            }
            else {
                clientCore.AdventureMissonManager.instance.beginExplore({
                    exploreId: this._exploreInfo.id,
                    team: this._teamIdx,
                    time: this._currTime,
                    roleId: this._teamArr
                })
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy()
            for (const iterator of this._rwdLimitArr) {
                iterator.destroy();
            }
            for (const iterator of this._rwdLimitPool) {
                iterator.destroy();
            }
        }
    }
}