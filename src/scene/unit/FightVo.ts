
namespace scene.unit {
    /**
     * 战斗角色的数据
     */
    export class FightVo {

        private static _pool: Array<FightVo> = [];

        /** 阵营*/
        campID: number;
        /** id*/
        roleID: number;
        /** 血量*/
        blood: number;
        /** 等级*/
        level: number;
        /** 怒气*/
        anger: number;
        /** 位置*/
        pos: number;
        /** 方向*/
        direction: number;
        /** 缩放大小*/
        scale: number;
        /** 皮肤ID*/
        skinID: number;
        /** 属性*/
        identity: number;
        /** 职业*/
        career: number;
        /** 数据载入完成*/
        suc: Function;
        /** 作为怪物 是否显示大血条*/
        showHp: boolean;

        x: number;
        y: number;

        constructor() { }

        public static gain(msg: pb.role_pos): FightVo {
            let data: FightVo = new FightVo();
            data.anger = msg.anger;
            data.blood = msg.blood;
            data.roleID = msg.roleId;
            data.pos = msg.positionId;
            return data;
        }
    }
}