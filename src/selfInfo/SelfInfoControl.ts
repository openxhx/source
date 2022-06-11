namespace selfInfo {
    export class SelfInfoControl implements clientCore.BaseControl {
        public model: SelfInfoModel;

        /** 获取角色详情数据*/
        public getUserInfo(): Promise<pb.sc_get_user_base_info> {
            return net.sendAndWait(new pb.cs_get_user_base_info({ uids: [this.model.uid] }))
                .then((msg: pb.sc_get_user_base_info) => {
                    if (this.model) {
                        this.model.userBaseInfo = msg.userInfos[0];
                        clientCore.UserInfoTip.refreshUserInfo(this.model.userBaseInfo);
                    }
                    return Promise.resolve(msg);
                });
        }

        /** 获取角色cp详情数据*/
        public getCPUserInfo(cpId: number): Promise<pb.sc_get_user_base_info> {
            return net.sendAndWait(new pb.cs_get_user_base_info({ uids: [cpId] }))
                .then((msg: pb.sc_get_user_base_info) => {
                    if (this.model) {
                        this.model.cpUserBaseInfo = msg.userInfos[0];
                    }
                    return Promise.resolve(msg);
                });
        }

        /** 获取花神之镜数据*/
        public getMirrorInfo(): Promise<pb.sc_get_flora_of_mirror_user_info> {
            return net.sendAndWait(new pb.cs_get_flora_of_mirror_user_info({ uid: this.model.uid }))
                .then((msg: pb.sc_get_flora_of_mirror_user_info) => {
                    if (this.model) {
                        this.model.godMirrorInfo = msg.info;
                    }
                    return Promise.resolve(msg);
                });
        }

        /**拜师 */
        public teachersRelation(type: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_apply_teachers_relation({ type: type, otherId: this.model.mentorInfo.uid })).then((msg: pb.sc_apply_teachers_relation) => {
                handler?.runWith(msg);
            });
            net.sendAndWait(new pb.cs_apply_teachers_relation({})).then((msg: pb.sc_apply_teachers_relation) => {
                handler?.runWith(msg);
            });
        }

        /******************背包信息模块******************/
        /**获取指定道具信息 */
        public getBagItem(itemId: number, num: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_use_gift_bag_item({ itemId: itemId, num: num })).then((msg: pb.sc_use_gift_bag_item) => {
                handler?.runWith(msg);
            });
        }


        /******************战斗信息模块******************/
        /** 获取战斗详情信息*/
        public getBattleInfo(): Promise<pb.sc_get_battle_roles_show> {
            return net.sendAndWait(new pb.cs_get_battle_roles_show({ uid: this.model.uid })).then((msg: pb.sc_get_battle_roles_show) => {
                if (this.model) {
                    this.model.updateBattleInfo(msg);
                }
                return Promise.resolve(msg);
            });
        }

        /**上阵/下阵 */
        public rolesShow(pos: number, roleId: number, handler: Laya.Handler) {
            net.sendAndWait(new pb.cs_set_battle_roles_show({ pos: pos + 1, roleId: roleId })).then((msg: pb.sc_set_battle_roles_show) => {
                if (this.model) {
                    if (roleId > 0) {
                        let data = clientCore.RoleManager.instance.getRoleById(roleId);
                        this.model.battle_roles[pos] = { id: roleId, level: data.lv, star: data.star, power: data.fight, prayData: data.xlsId };
                    } else {
                        this.model.battle_roles[pos] = {};
                    }
                }
                handler?.runWith(msg);
            });
        }

        public dispose(): void {
            this.model = null;
        }
    }
}