namespace scene.unit {
    /**
     * 队伍
     */
    export class Team {
        /** 阵营id*/
        private _campID: number;
        /** 领队id*/
        private _leaderID: number;
        /** 单元集合*/
        private _units: Fighter[] = [];
        /** 队伍实际大小*/
        private _size: number;
        /** 队伍的最大容量*/
        private _maxSize: number;

        /**
         * 队伍的最大容量(默认6)
         * @param maxSize[default 6]
         */
        constructor(maxSize?: number) {
            this._maxSize = maxSize == void 0 ? 6 : maxSize;
            this._units.length = maxSize = this._maxSize;
            this._size = 0;
        }

        public get leaderID(): number {
            return this._leaderID;
        }
        public set leaderID(value: number) {
            this._leaderID = value;
        }

        /**
         * 添加一个成员
         * @param index 添加位置
         * @param unit 对象
         */
        public addUnit(unit: Fighter, index: number): void {
            if (index > this._maxSize) {
                console.error("addTeamError:", "队伍的最大容量为" + this._maxSize);
                return;
            }
            let _unit: Fighter = this._units[index];
            if (_unit) {
                console.error("addTeamError:", "该位置已经有单元了！！");
                return;
            };
            this._size++;
            this._units[index] = unit;
        }

        /**
         * 移除队伍成员
         * @param unit 
         */
        public removeUnit(unit: Fighter): void {
            let index: number = this._units.indexOf(unit);
            if (index == -1) {
                console.error("removeTeamError:", "将要移除的单位不在队伍中！！");
                return;
            }
            this._size--;
            this._units[index] = null;
            unit.dispose();
        }

        /**
         * 根据位置获取队伍成员
         * @param index 
         */
        public getUnit(index: number): Fighter {
            return this._units[index];
        }

        /**
         * 队伍现有成员
         */
        public get size(): number {
            return this._size;
        }

        /**
         * 队伍动作
         */
        public teamAction(type: ActionEnum): void {
            _.forEach(this._units, (element: Fighter) => {
                element && element.playAction(type);
            })
        }

        /**
         * 清理队伍
         */
        public clear(): void {
            _.forEach(this._units, (element: Fighter) => {
                element && this.removeUnit(element);
            });
        }
    }
}