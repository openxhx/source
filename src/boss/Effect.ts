namespace boss {
    /**
     * 技能
     */
    export class Effect {

        private _owner: clientCore.PersonUnit;
        private _res_path: string = 'res/raidBoss/1/effect/';
        private _speed: number = 0.8;

        constructor() { }

        show(owner: clientCore.PersonUnit, target: Laya.Point, type: number): void {
            this._owner = owner;
            let bone: clientCore.Bone = clientCore.BoneMgr.ins.play(`${this._res_path}eff0.sk`, 0, false, clientCore.MapManager.effectLayer);
            bone.pos(owner.x, owner.y + 90);
            bone.scaleX = bone.scaleY = 0.25;
            this.launch(type, target);

            let bone1 = clientCore.BoneMgr.ins.play(`${this._res_path}eff0-1.sk`, 0, false, clientCore.MapManager.effectLayer);
            bone1.pos(owner.x, owner.y - 140);
            bone1.scaleX = bone1.scaleY = 0.25;
        }

        /**
         * 射击
         * @param type 1-1次攻击 2-10次攻击
         * @param target 
         */
        private launch(type: number, target: Laya.Point): void {
            let path: string = type == 1 ? `${this._res_path}eff1.sk` : `${this._res_path}eff2.sk`;
            let bone: clientCore.Bone = clientCore.BoneMgr.ins.play(path, 0, true, clientCore.MapManager.effectLayer);
            let dx: number = target.x - this._owner.x;
            let dy: number = target.y - this._owner.y;
            let dis: number = Math.sqrt(Math.pow(Math.abs(dx), 2) + Math.pow(Math.abs(dy), 2));
            bone.pos(this._owner.x, this._owner.y);
            bone.scaleX = -0.25;
            bone.scaleY = 0.25;
            bone.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
            // Laya.Tween.to(bone, { x: target.x, y: target.y }, Math.floor(dis / this._speed), null, Laya.Handler.create(this, () => {
            //     bone.dispose();
            //     this.hit(type, target);
            // }));
            util.TweenUtils.creTween(bone, { x: target.x, y: target.y }, Math.floor(dis / this._speed), null, this, () => {
                bone.dispose();
                this.hit(type, target);
            });
        }

        /**
         * 受击
         * @param type 
         * @param target 
         */
        private hit(type: number, target: Laya.Point): void {
            let path: string = type == 1 ? `${this._res_path}eff1-0.sk` : `${this._res_path}eff2-0.sk`;
            let bone: clientCore.Bone = clientCore.BoneMgr.ins.play(path, 0, false, clientCore.MapManager.effectLayer);
            bone.on(Laya.Event.COMPLETE, this, this.dispose);

            if (type == 1) {
                bone.pos(target.x, target.y);
            }
            else if (type == 2) {
                bone.pos(target.x, target.y + 250);
                bone.scaleX = bone.scaleY = 0.5;
            }
        }

        private dispose(): void {
            this._owner = null;
            Laya.Pool.recover("Effect", this);
        }

        public static create(): Effect {
            return Laya.Pool.getItemByClass("Effect", Effect);
        }
    }
}