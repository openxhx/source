namespace familyAc {

    export class FamilyAcSCommand {

        constructor() { }

        /**
         * 获取家族列表
         * @param type 0推荐列表 1全部
         * @param page 分页 从1开始
         * @param handler 
         */
        public getFamilyList(type: number, page: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_family_lists({ type: type, page: page })).then((msg: pb.sc_get_family_lists) => {
                handler && handler.runWith([msg.familyLists]);
            });
        }


        /**
         * 创建家族
         * @param name 家族名称
         * @param mainifesto 家族宣言
         * @param badgeId 徽章ID
         * @param boardId 底板ID
         * @param handler 
         */
        public createFamily(name: string, mainifesto: string, badgeId: number, boardId: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_create_family({ familyName: name, declaration: mainifesto, badgeType: badgeId, badgeBase: boardId })).then((msg: pb.sc_create_family) => {
                handler && handler.runWith(msg);
                util.RedPoint.reqRedPointRefresh(801);
            });
        }

        /**
         * 获取玩家的衣服
         * @param userId 
         */
        public getCloths(userId: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_family_user_clothes({ userid: userId })).then((msg: pb.sc_get_family_user_clothes) => {
                handler && handler.runWith([msg.userInfo.sex, msg.userInfo.curClothes]);
            });
        }

        /**
         * 申请加入家族的相关操作
         * @param type 0申请加入，1取消申请
         * @param familyId 家族ID
         * @param handler 
         */
        public applyOperation(type: number, familyId: string, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_family_apply_operation({ opt: type, fmlId: familyId })).then((msg: pb.sc_family_apply_operation) => {
                handler && handler.run();
            });
        }

        /**
         * 搜索家族
         * @param name 
         */
        public searchFamily(name: string, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_search_family_info({ familyName: name })).then((msg: pb.sc_search_family_info) => {
                handler && handler.runWith([msg.familyInfo]);
            });
        }

        /**
         * C处理邀请
         * @param type 1-接受 2-拒绝
         * @param handler 
         */
        public handleInvite(type: number, familyId: string, handler?: Laya.Handler): void {
            net.sendAndWait(new pb.cs_handle_family_invitation({ fmlId: familyId, flag: type })).then((msg: pb.sc_handle_family_invitation) => {
                handler && handler.run();
                util.RedPoint.reqRedPointRefresh(802);
            });
        }

        private static _ins: FamilyAcSCommand;
        public static get ins(): FamilyAcSCommand {
            return this._ins || (this._ins = new FamilyAcSCommand());
        }
    }
}
