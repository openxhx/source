
namespace flowerSpring {
    export class FlowerBossPanel extends ui.flowerSpring.panel.FlowerSpringBossPanelUI {
        private _bone: clientCore.Bone;
        sweepHanlder: Laya.Handler;

        constructor() {
            super();
        }

        show(times: number, open: boolean) {
            let config = xls.get(xls.globaltest).get(1).challengeTime;
            let isVip = clientCore.FlowerPetInfo.petType > 0;
            // let totalTime = isVip ? (config.v1 + config.v2) : config.v1;
            this.btnSweep.visible = times > 0;
            // this.txtTime.text = `剩余次数：${totalTime - times}/${totalTime}`;
            // this.btnSweep.disabled = this.btnFight.disabled = times >= totalTime;
            if (open) {
                this._bone = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(2710015), 'idle', true, this);
                this._bone.pos(512, 373);
                this._bone.scaleX = this._bone.scaleY = 1.4;
                clientCore.DialogMgr.ins.open(this);
            }

        }

        private onSweep() {
            this.sweepHanlder?.run();
        }

        private async onFight() {
            clientCore.LoadingManager.showSmall();
            await clientCore.SceneManager.ins.register();
            clientCore.LoadingManager.hideSmall(true);
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.SceneManager.ins.battleLayout(6, 60101);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private onDetail() {
            clientCore.Logger.sendLog('2020年4月3日活动', '【主活动】复活节的彩蛋', '点击活动说明按钮');
            alert.showRuleByID(1002);
            // let ruleArr = [
            //     '活动期间，玩家每日可以获得3次挑战灵魂之引的机会，获得奇妙花宝的玩家可以额外多挑战一次',
            //     '战斗中，对Boss造成伤害，可获得活动奖励，伤害越高，奖励越丰富',
            // ];
            // alert.showRulePanel(
            //     _.map(ruleArr, s => util.StringUtils.getColorText3(s, '#66472c', '#f25c58')),
            //     _.map(ruleArr, s => s.replace(/{/g, '').replace(/}/g, ''))
            // );
        }

        private onBattleArray() {
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("battleArray.BattleArrayModule", null, { openWhenClose: "flowerSpring.FlowerSpringModule", openData: true });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSweep, Laya.Event.CLICK, this, this.onSweep);
            BC.addEvent(this, this.btnFight, Laya.Event.CLICK, this, this.onFight);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnArray, Laya.Event.CLICK, this, this.onBattleArray);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._bone?.dispose();
        }
    }
}