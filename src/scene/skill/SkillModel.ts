

namespace scene.skill {

    export class SkillModel {

        private _skillMap: util.HashMap<Skill>;
        private _skillXls: util.HashMap<any>;

        constructor() {
            this._skillMap = new util.HashMap<Skill>();
            this._skillXls = xls.get(xls.SkillBase);
        }

        /**
         * 获取技能数据
         * @param id 
         */
        public getSkill(id: number): Skill {
            let _skill: Skill = this._skillMap.get(id);
            if (!_skill) {
                _skill = new Skill(this._skillXls.get(id));
                this._skillMap.add(id, _skill);
            }
            return _skill;
        }

        private static _ins: SkillModel;
        public static get ins(): SkillModel {
            return this._ins || (this._ins = new SkillModel());
        }
    }
}