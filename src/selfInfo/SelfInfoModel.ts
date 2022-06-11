namespace selfInfo {
    export class SelfInfoModel implements clientCore.BaseModel {
        public uid: number = 0;
        public isSelf: boolean = false;

        private _userBaseInfo: pb.IUserBase;
        private _cpUserBaseInfo: pb.IUserBase;
        private _mentorInfo: clientCore.mentor.MentorNoticeInfo;
        private _godMirrorInfo: pb.IMirrorRankInfo[] = [];

        /***************战斗详细界面数据***************/
        public battle_hasData: boolean = false;
        public battle_godPray: number;
        public battle_awake: number;
        public battle_stageId: number;
        public battle_tower: number;
        public battle_self: BattleInfoData;
        public battle_roles: BattleInfoData[];

        constructor() {
        }

        public init(d: any): void {
            if (d) {
                if (d.uid) {
                    this.uid = d.uid;
                }
                if (d.info) {
                    this.uid = d.info.uid;
                    this._mentorInfo = d.info;
                }
            }
            this.uid = this.uid || clientCore.LocalInfo.uid;
            this.isSelf = this.uid == clientCore.LocalInfo.uid;
        }

        public updateBattleInfo(data: any): void {
            if (data && data.roles && data.roles.length > 0) {
                this.battle_hasData = true;
                this.battle_godPray = data.godPray;
                this.battle_awake = data.awake;
                this.battle_stageId = data.stageId;
                this.battle_tower = data.tower;
                this.battle_self = data.roles.shift();
                this.battle_self.prayData = xls.get(xls.godprayBase).get(this.battle_self.id);
                this.battle_roles = data.roles;
                for (let i = 0; i < this.battle_roles.length; i++) {
                    if (this.battle_roles[i] && this.battle_roles[i].id) {
                        this.battle_roles[i].prayData = xls.get(xls.characterId).get(this.battle_roles[i].id);
                    }
                }
            }
        }

        public get userBaseInfo(): pb.IUserBase {
            return this._userBaseInfo;
        }

        public set userBaseInfo(value: pb.IUserBase) {
            this._userBaseInfo = value;
        }

        public get cpUserBaseInfo(): pb.IUserBase {
            return this._cpUserBaseInfo;
        }

        public set cpUserBaseInfo(value: pb.IUserBase) {
            this._cpUserBaseInfo = value;
        }

        public get mentorInfo(): clientCore.mentor.MentorNoticeInfo {
            return this._mentorInfo;
        }

        public get godMirrorInfo(): pb.IMirrorRankInfo[] {
            return this._godMirrorInfo;
        }

        public set godMirrorInfo(value: pb.IMirrorRankInfo[]) {
            this._godMirrorInfo = value;
        }

        dispose(): void {
            this.battle_roles = [];
            this._godMirrorInfo = [];
            this._mentorInfo = null;
        }
    }
}