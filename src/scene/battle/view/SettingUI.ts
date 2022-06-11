namespace scene.battle.view {
    /**
     * 战斗设置
     */
    export class SettingUI extends ui.fight.SettingUI {
        public sideClose = false;

        // private _copyRate: number;

        public show(): void {
            clientCore.DialogMgr.ins.open(this);
            //暂停战斗 
            // this._copyRate = animation.AnimationControl.ins.rate;
            // BattleConfig.isPause = true;
            // animation.AnimationControl.ins.rate = 0.000000001; //设置最慢速率 达到暂停效果 不知道为啥直接设置暂停没有用
            animation.AnimationControl.ins.pasue();
            //音效初始化
            this.btnMusic.skin = BattleConfig.playMusic ? "fight/btn_music.png" : "fight/btn_music1.png";
            this.btnSound.skin = BattleConfig.playSound ? "fight/btn_sound.png" : "fight/btn_sound1.png";
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnBack, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnExit, Laya.Event.CLICK, this, this.onExit);
            BC.addEvent(this, this.btnMusic, Laya.Event.CLICK, this, this.onMusic);
            BC.addEvent(this, this.btnSound, Laya.Event.CLICK, this, this.onSound);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public hide(): void {
            // animation.AnimationControl.ins.rate = this._copyRate;
            // BattleConfig.isPause = false;
            animation.AnimationControl.ins.resume();
            clientCore.DialogMgr.ins.close(this);
        }

        private onExit(): void {
            if (clientCore.GuideMainManager.instance.isGuideAction) {
                alert.showFWords("新手引导阶段，不能退出！");
                return;
            }
            this.hide();
            battle.BattleSCommand.ins.battleFinish(FinishType.BACK);
        }

        private onMusic(): void {
            BattleConfig.playMusic = !BattleConfig.playMusic;
            this.btnMusic.skin = BattleConfig.playMusic ? "fight/btn_music.png" : "fight/btn_music1.png";
            BattleConfig.playMusic ? core.SoundManager.instance.resumeBgm() : core.SoundManager.instance.pauseBgm();
        }

        private onSound(): void {
            BattleConfig.playSound = !BattleConfig.playSound;
            this.btnSound.skin = BattleConfig.playSound ? "fight/btn_sound.png" : "fight/btn_sound1.png";
        }
    }
}