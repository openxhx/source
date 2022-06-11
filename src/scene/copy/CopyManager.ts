namespace scene.copy {
    /**
     * 副本管理
     */
    export class CopyManager {

        /** 当前副本*/
        private _currCopy: CopyBase;

        public static fightSuccFlag: boolean;

        constructor() { }


        /** 创建冒险副本*/
        public createRisk(roles: pb.Irole_pos[], anima: number, stageId: number): void {
            let copy: child.CopyRisk = new child.CopyRisk();
            let xlsStage: xls.stageBase = xls.get(xls.stageBase).get(stageId);
            copy.path = `res/battle/bg/${xlsStage.bgid}.png`;
            copy.myRoles = roles;
            copy.anima = anima;
            copy.stageId = stageId;
            this.open(copy);
        }

        /** 创建秘闻录副本*/
        public createMwl(roles: pb.Irole_pos[], anima: number, stageId: number): void {
            let copy: child.CopyMwl = new child.CopyMwl();
            let xlsStage: xls.stageBase = xls.get(xls.stageBase).get(stageId);
            copy.path = `res/battle/bg/${xlsStage.bgid}.png`;
            copy.myRoles = roles;
            copy.anima = anima;
            copy.stageId = stageId;
            this.open(copy);
        }

        /** 创建活动（试炼）副本*/
        public createAct(roles: pb.Irole_pos[], anima: number, stageId: number): void {
            let copy: child.CopyAct = new child.CopyAct();
            let xlsStage: xls.stageBase = xls.get(xls.stageBase).get(stageId);
            copy.path = `res/battle/bg/${xlsStage.bgid}.png`;
            copy.myRoles = roles;
            copy.anima = anima;
            copy.stageId = stageId;
            this.open(copy);
        }

        /** 创建金币副本*/
        public createGold(roles: pb.Irole_pos[], anima: number, stageId: number): void {
            let copy: child.CopyGold = new child.CopyGold();
            let xlsStage: xls.stageBase = xls.get(xls.stageBase).get(50101);
            copy.path = `res/battle/bg/${xlsStage.bgid}.png`;
            copy.myRoles = roles;
            copy.anima = anima;
            copy.stageId = stageId;
            this.open(copy);
        }

        /** 创建约会副本*/
        public createAffair(roles: pb.Irole_pos[], anmia: number, stageId: number): void {
            let copy: child.CopyAffair = new child.CopyAffair();
            let data: xls.dateStage = xls.get(xls.dateStage).get(stageId);
            copy.path = `res/battle/bg/${data.bgid}.png`;
            copy.roles = roles;
            copy.anima = anmia;
            copy.stageId = stageId;
            this.open(copy);
        }

        /** 创建活动boss副本*/
        public createBoss(roles: pb.Irole_pos[], anima: number, stageId: number): void {
            let copy: child.CopyBoss = new child.CopyBoss();
            let data: xls.stageBase = xls.get(xls.stageBase).get(stageId);
            copy.path = `res/battle/bg/${data.bgid}.png`;
            copy.myRoles = roles;
            copy.anima = anima;
            copy.stageId = stageId;
            this.open(copy);
        }

        /**
         * 打开副本
         * @param copy 
         */
        private open(copy: CopyBase): void {
            clientCore.SystemOpenManager.fightSuccFlag = false;
            this._currCopy = copy;
            copy.init();
            map.MapScene.ins.changeMap(copy.path, Laya.Handler.create(copy, copy.$enterMap));
            clientCore.GlobalConfig.battleCopy = true;
        }

        /** 关闭副本吧*/
        public close(haveExtraOpen: boolean = false): void {
            this._currCopy && this._currCopy.dispose(haveExtraOpen);
            this._currCopy = null;
            map.MapScene.ins.dispose();
            clientCore.GlobalConfig.battleCopy = false;
        }

        public get currCopy(): CopyBase {
            return this._currCopy;
        }

        private static _ins: CopyManager;
        public static get ins(): CopyManager {
            return this._ins || (this._ins = new CopyManager());
        }
    }
}