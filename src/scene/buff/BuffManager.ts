namespace scene.buff {
    /**
     * buff管理者
     */
    export class BuffManager {
        /** 所有存在的buff*/
        private _buffMap: util.HashMap<BuffList>;

        constructor() { this._init(); }
        private _init(): void {
            this._buffMap = new util.HashMap<BuffList>();
        }

        public addBuff(BF: Buff): void {
            let key: string = this.getKey(BF.binder);
            let _buffs: BuffList = this._buffMap.get(key);
            if (!_buffs) {
                _buffs = new BuffList();
                this._buffMap.add(key, _buffs);
            }
            _buffs.addBuff(BF);
        }

        public removeBuff(BF: Buff): void {
            let _buffs: BuffList = this._buffMap.get(this.getKey(BF.binder));
            if (_buffs) {
                _buffs.removeBuff(BF.msg.buffId);
            }
        }

        /**
         * 移除某个角色身上的多个buff
         * @param uid
         * @param buffIds 
         */
        public removeMultiBuffs(fighter: unit.Fighter, buffIds: number[]): void {
            let buffs: BuffList = this._buffMap.get(this.getKey(fighter));
            if (!buffs) return;
            _.forEach(buffIds, (buffId: number) => {
                buffs.removeBuff(buffId);
            })
        }

        /**
         * 移除角色身上的所有buff
         * @param uid 
         */
        public removeBuffs(fighter: unit.Fighter): void {
            let key: string = this.getKey(fighter);
            let _buffs: BuffList = this._buffMap.get(key);
            if (_buffs) {
                _buffs.removeBuffs();
                this._buffMap.remove(key);
            }
        }

        /**
         * 获得一个buff
         * @param fighter 
         * @param buffID 
         */
        public getBuff(fighter: unit.Fighter, buffID: number): Buff {
            let _buffs: BuffList = this._buffMap.get(this.getKey(fighter));
            if (_buffs) {
                return _buffs.getBuff(buffID);
            }
            return null;
        }

        /**
         * 获得战斗单元的所有buff
         * @param fighter 
         */
        public getBuffs(fighter:unit.Fighter): BuffList{
            return this._buffMap.get(this.getKey(fighter));
        }

        /**
         * 处理自身的一系列buff???
         * @param fighter 
         * @param msgs 
         */
        public processSelfBuffs(fighter: unit.Fighter, msgs: pb.Ibuff_effect[]): Promise<void>[] {
            this.removeBuffs(fighter);
            let _array: Promise<void>[] = [];

            _.forEach(msgs, (element: pb.cur_buff) => {
                _array.push(this.processSelfBuff(fighter, element));
            });
            return _array;
        }

        public processBuffs(fighter: unit.Fighter, msgs: pb.Ibuff_effect[]): void {
            _.forEach(msgs, (element: pb.buff_effect) => {
                this.processBuff(fighter, element);
            })
        }

        /**
         * 处理一个buff效果
         * @param msg 
         */
        public processBuff(fighter: unit.Fighter, msg: pb.Ibuff_effect): Promise<void> {
            return new Promise((success) => {
                msg.replace.length > 0 && this.removeMultiBuffs(fighter, msg.replace);
                let _buff: Buff = Buff.create();
                _buff.binder = fighter;
                _buff.msg = msg;
                _buff.config = xls.get(xls.BuffBase).get(msg.buffId);
                if (!_buff.config) {
                    console.error("配置表缺失buffID: " + msg.buffId);
                    _buff.dispose();
                    return;
                }
                _buff.success = success;
                this.addBuff(_buff);
            })
        }

        /**
         * 处理一个自身的buff效果
         * @param fighter 
         * @param msg 
         */
        public processSelfBuff(fighter: unit.Fighter, msg: pb.Icur_buff): Promise<void> {
            return new Promise((success) => {
                let _buff: Buff = Buff.create();
                _buff.binder = fighter;
                _buff.msg = msg;
                _buff.config = xls.get(xls.BuffBase).get(msg.buffId);
                if (!_buff.config) {
                    console.error("配置表缺失buffID: " + msg.buffId);
                    _buff.dispose();
                    return;
                }
                _buff.success = success;
                this.addBuff(_buff);
            })
        }

        /** 获取buff的key值 以单元的阵营和位置联合作为key*/
        public getKey(fighter: unit.Fighter): string {
            return fighter.data.campID + "_" + fighter.data.pos;
        }

        private static _ins: BuffManager;
        public static get ins(): BuffManager {
            return this._ins || (this._ins = new BuffManager());
        }
    }
}