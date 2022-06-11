namespace clientCore {
    /**
     * BOSS西蒙
     */
    export class BossXM extends Avatar {
        private _dieT: number;
        private _body: Bone;
        private _effect: Bone[];

        private _res_path_: string = "res/raidBoss/1/";
        private _status: number;
        private _cls: xls.bossRaid; //配置信息

        private _isLeave: boolean = false; //离开了？

        public clickHandler: Laya.Handler;

        constructor() { super(); }

        init(data: xls.bossRaid): void {
            super.init(data);
            this._effect = [];
            this._cls = data;
            this._dieT = 0;
            this._type = AvatarEnum.BOSS;
            this._isLeave = false;
            this.pos(data.map[0].v2, data.map[0].v3);
            this.set_skin(`${this._res_path_}BOSS.sk`);
        }

        update(): void {
            if (!this._isLeave && this._dieT > 0 && ServerManager.curServerTime >= this._dieT) {
                this._isLeave = true;
                let bone: Bone = BoneMgr.ins.play(`${this._res_path_}ef5.sk`, 0, false, this._display);
                bone.on(Laya.Event.COMPLETE, this, this.dispose);
                return;
            }
        }

        dispose(): void {
            this.cleanEffect();
            this.clickHandler?.recover();
            this._body?.dispose();
            this._cls = this._effect = this.clickHandler = this._body = null;
            super.dispose();
        }

        set_skin(value: string, nameOrIndex: any = 0) {
            this._body?.dispose();
            this._body = BoneMgr.ins.play(value, nameOrIndex, true, this._display, null, true);
            this._body.on(Laya.Event.CLICK, this, () => { this.clickHandler?.run(); });
        }

        setScale(s: number) {
            if (this._body) {
                this._body.scaleX = this._body.scaleY = s;
            }
        }

        set status(value: number) {
            if (this._status == value) return;
            this._status = value;
            this.cleanEffect();
            switch (value) {
                case 0:  //准备阶段
                    this.creBone(`${this._res_path_}ef.sk`, AvatarLayer.ins.up);
                    break;
                case 1: //阶段1
                    this.creBone(`${this._res_path_}ef2-0.sk`, AvatarLayer.ins.up);
                    this.creBone(`${this._res_path_}ef2.sk`, AvatarLayer.ins.down);
                    break;
                case 2: //阶段2
                    this.creBone(`${this._res_path_}ef1.sk`, AvatarLayer.ins.up);
                    break;
                case 3: //阶段3 
                    this.creBone(`${this._res_path_}ef4.sk`, AvatarLayer.ins.up);
                    break;
                case 4: //被净化了
                    this.set_skin(`res/battle/role/${clientCore.BossManager.BOSS_ROLD_ID}.sk`, "idle");
                    this.setScale(1.5);
                    break;
            }
        }

        get dieT(): number {
            return this._dieT;
        }

        set dieT(value: number) {
            this._dieT = value;
        }

        get cls(): xls.bossRaid {
            return this._cls;
        }

        private cleanEffect(): void {
            _.forEach(this._effect, (element) => { element.dispose(); })
            this._effect.length = 0;
        }

        /**
         * 创建
         * @param path 
         * @param parent 
         */
        private creBone(path: string, parent: Laya.Sprite): Bone {
            let bone: Bone = BoneMgr.ins.play(path, 0, true, parent);
            bone.pos(this._x, this._y);
            this._effect.push(bone);
            return bone;
        }
    }
}