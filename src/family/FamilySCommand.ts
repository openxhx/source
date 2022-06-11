namespace family {
    /**
     * 家族协议控制
     */
    export class FamilySCommand {

        constructor() { }

        /**
         * 获取家族成员列表
         * @param familyId 
         * @param page 
         * @param handler 
         */
        public getMembers(page: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_family_joined_member_info({ fmlId: clientCore.FamilyMgr.ins.familyId, page: page })).then((msg: pb.sc_family_joined_member_info) => {
                handler && handler.runWith([msg.memberList]);
            })
        }

        /**
         * 获取申请列表
         * @param page 
         * @param handler 
         */
        public getApplys(page: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_family_applied_member_info({ fmlId: clientCore.FamilyMgr.ins.familyId, page: page })).then((msg: pb.sc_family_applied_member_info) => {
                handler && handler.runWith([msg.applyList]);
            });
        }

        /**
         * 处理家族成员操作
         * @param memberId 成员ID
         * @param type 1通过申请，2拒绝申请，3一键通过，4一键拒绝，5踢出家族
         * @param handler 
         */
        public acceptionOpt(type: number, handler: Laya.Handler, memberId?: number): void {
            net.sendAndWait(new pb.cs_member_acception_opt({ memberId: memberId, opt: type, fmlId: clientCore.FamilyMgr.ins.familyId })).then((msg: pb.sc_member_acception_opt) => {
                handler && handler.runWith(msg);
            })
        }

        /**
         * 设置申请条件
         * @param minLv 等级下限
         * @param accept 1开启自动同意，0关闭自动同意
         */
        public setApplyCondition(minLv: number, accept: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_set_family_apply_condition({ fmlId: clientCore.FamilyMgr.ins.familyId, minLvl: minLv, accept: accept })).then(() => {
                alert.showFWords("申请条件设置成功");
                handler && handler.run();
            });
        }

        /** 获取申请条件*/
        public getApplySet(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_family_apply_condition({ fmlId: clientCore.FamilyMgr.ins.familyId })).then((msg: pb.cs_get_family_apply_condition) => {
                handler && handler.runWith(msg);
            })
        }

        /** 离开家族*/
        public leaveFamily(): void {
            net.sendAndWait(new pb.cs_family_apply_operation({ fmlId: clientCore.FamilyMgr.ins.familyId, opt: 2 })).then(() => {
                clientCore.FamilyMgr.ins.leaveFamily();
            })
        }

        /**
         * 任命成员
         * @param memberId 
         * @param post 
         * @param handler 
         */
        public appointMember(memberId: number, post: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_member_position_change({ fmlId: clientCore.FamilyMgr.ins.familyId, memberId: memberId, position: post })).then((msg: pb.sc_member_position_change) => {
                handler && handler.run();
            });
        }

        /** 获取建筑*/
        public getBuilds(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_family_build_list({ fmlId: clientCore.FamilyMgr.ins.familyId })).then((msg: pb.sc_get_family_build_list) => {
                handler && handler.runWith([msg.builds]);
            });
        }

        /**
         * 建筑解锁
         * @param buildId 
         * @param handler 
         */
        public unlockBuild(buildId: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_unlock_family_build({ fmlId: clientCore.FamilyMgr.ins.familyId, buildId: buildId })).then((msg: pb.sc_unlock_family_build) => {
                handler && handler.run();
            })
        }

        /**
         * 家族捐献
         * @param buildId 建筑ID
         * @param level 捐献等级
         * @param handler 
         */
        public donateBuild(buildId: number, level: number): void {
            net.sendAndWait(new pb.cs_family_donate({ fmlId: clientCore.FamilyMgr.ins.familyId, buildId: buildId, level: level })).then((msg: pb.sc_family_donate) => {
                EventManager.event(FamilyConstant.DONATE_COMPLETE, msg);
                util.RedPoint.reqRedPointRefresh(801);
            });
        }

        /**
         * 修改家族文本信息
         * @param type 0 家族宣言
         * @param context 
         */
        public changeContext(type: number, context: string): void {
            net.send(new pb.cs_change_family_info({ type: type, content: context }));
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

        /** 获取家族订单*/
        public getOrders(): Promise<void> {
            return net.sendAndWait(new pb.cs_get_family_order_info()).then((msg: pb.sc_get_family_order_info) => {
                clientCore.FamilyMgr.ins.initOrders(msg);
            })
        }


        /**
         * 交付订单
         * @param getTime 
         */
        public deliveryOrder(getTime: number): void {
            net.sendAndWait(new pb.cs_submit_family_order({ gettime: getTime })).then((msg: pb.sc_submit_family_order) => {
                let ins: clientCore.FamilyMgr = clientCore.FamilyMgr.ins;
                ins.deleteOrder(getTime);
                _.forEach(msg.order, (element: pb.IfmlOrder) => {
                    ins.orderMap.add(element.gettime, element);
                })
                alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), "");
                EventManager.event(FamilyConstant.UPDATE_ORDER);
            })
        }

        /**
         * 删除一个订单
         * @param getTime 
         */
        public deleteOrder(getTime: number): void {
            net.sendAndWait(new pb.cs_del_family_order({ gettime: getTime })).then((msg: pb.sc_del_family_order) => {
                let ins: clientCore.FamilyMgr = clientCore.FamilyMgr.ins;
                ins.deleteOrder(getTime);
                _.forEach(msg.order, (element: pb.IfmlOrder) => {
                    ins.orderMap.add(element.gettime, element);
                })
                EventManager.event(FamilyConstant.UPDATE_ORDER);
            })
        }

        /**
         * 神叶立即完成订单
         * @param getTime 
         */
        public leafOrder(getTime: number): void {
            net.sendAndWait(new pb.cs_submit_family_order_leaves({ gettime: getTime })).then((msg: pb.sc_submit_family_order_leaves) => {
                let ins: clientCore.FamilyMgr = clientCore.FamilyMgr.ins;
                ins.deleteOrder(getTime);
                _.forEach(msg.order, (element: pb.IfmlOrder) => {
                    ins.orderMap.add(element.gettime, element);
                })
                alert.showReward(clientCore.GoodsInfo.createArray(msg.rewardInfo), "");
                EventManager.event(FamilyConstant.UPDATE_ORDER);
            });
        }

        /**
         * 获取事件列表
         * @param start 
         * @param end
         * @param handler 
         */
        public getChangelog(start: number, end: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_family_change_log({ familyId: clientCore.FamilyMgr.ins.familyId, start: start, end: end })).then((msg: pb.sc_get_family_change_log) => {
                handler && handler.runWith([msg.logInfo]);
            });
        }

        /**
         * 获取职位信息列表
         * @param handler 
         */
        public getSpecialInfo(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_family_special_info({ familyId: clientCore.FamilyMgr.ins.familyId })).then((msg: pb.sc_get_family_special_info) => {
                handler && handler.runWith([msg.specialList]);
            });
        }

        private static _ins: FamilySCommand;
        public static get ins(): FamilySCommand {
            return this._ins || (this._ins = new FamilySCommand());
        }
    }
}