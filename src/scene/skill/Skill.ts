

namespace scene.skill {
    /**
     * 技能对象
     */
    export class Skill {

        /** 技能ID*/
        public id: number
        /** 技能类型*/
        public type: number;
        /** 消耗*/
        public cost: number;
        /** 配置表内容*/
        private _config: xls.SkillBase;

        constructor(config: xls.SkillBase) {
            this._config = config;
            this.id = this._config.skillId;
            if (this._config.skillCost) {
                this.cost = this._config.skillCost.v2;
                this.type = SkillType.NORMAL;
                if (this._config.skillCost.v1 != 0) {
                    this.type = this._config.skillCost.v1 == 1 ? SkillType.ANGER : SkillType.PRAY;
                }
            } else {
                this.cost = 0;
                this.type = SkillType.NORMAL;
            }
        }

        public get config(): xls.SkillBase {
            return this._config;
        }

    }
}