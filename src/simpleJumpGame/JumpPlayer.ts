namespace simpleJumpGame {
    export class JumpPlayer extends ui.simpleJumpGame.item.PlayerItemUI {

        private maxProgress: number = 80;
        private _curProgress: number = 0;

        public maxSpeedX: number = -10;
        public maxSpeedY: number = -24;

        private _standBone: clientCore.Bone;
        private _squatBone: clientCore.Bone;
        private _flyBone: clientCore.Bone;
        private _fallBone: clientCore.Bone;
        constructor() {
            super();

            this.boxProgress.visible = false;
            if (clientCore.LocalInfo.sex == 1)/**女 */ {
                this._standBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/womanidle.sk", 0, true, this);
                this._squatBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/womansquat.sk", 0, true, this);
                this._flyBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/womanjump.sk", 0, true, this);
                this._fallBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/womanfall.sk", 0, true, this);
            }
            else {
                this._standBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/manidle.sk", 0, true, this);
                this._squatBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/mansquat.sk", 0, true, this);
                this._flyBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/manjump.sk", 0, true, this);
                this._fallBone = clientCore.BoneMgr.ins.play("res/animate/jumpGame/manfall.sk", 0, true, this);
            }
        }

        get curProgress(): number {
            return this._curProgress;
        }

        set curProgress(num: number) {
            this._curProgress = num;
            this._curProgress = this._curProgress > this.maxProgress ? this.maxProgress : this._curProgress;
            this.imgProgress.width = 103 * (this._curProgress / this.maxProgress);
        }

        get speedX(): number {
            // return this.maxSpeedX * (this._curProgress/this.maxProgress);
            return this.maxSpeedX;
        }

        get speedY(): number {
            return this.maxSpeedY * (this._curProgress / this.maxProgress);
        }
        stand() {
            this._squatBone.visible = false;
            this._squatBone.stop();
            this._flyBone.visible = false;
            this._flyBone.stop();
            this._fallBone.visible = false;
            this._fallBone.stop();
            this._standBone.visible = true;
            this._standBone.play(0, true);
        }
        /**蹲。蓄力 */
        squat() {
            this.boxProgress.visible = true;
            this._curProgress = 3;
            this.imgProgress.width = 103 * (this._curProgress / this.maxProgress);
            this._standBone.visible = false;
            this._standBone.stop();
            this._squatBone.visible = true;
            this._squatBone.play(0, false);
        }
        jump() {
            this.boxProgress.visible = false;
            this._squatBone.visible = false;
            this._squatBone.stop();
            this._flyBone.visible = true;
            this._flyBone.pos(0, 27);
            this._flyBone.play(0, true);
        }
        fall() {
            this._flyBone.visible = false;
            this._fallBone.stop();
            this._fallBone.visible = true;
            this._fallBone.pos(0, 27);
            this._fallBone.play(0, true);
        }

        isFall(): boolean {
            return this._fallBone.visible == true;
        }
        destroy() {
            super.destroy();
            this._standBone?.dispose();
            this._squatBone?.dispose();
            this._flyBone?.dispose();
            this._fallBone?.dispose();
        }
    }
}