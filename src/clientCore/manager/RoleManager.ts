/// <reference path="../dataInfo/RoleInfo.ts" />

namespace clientCore {
    import RoleInfo = role.RoleInfo;
    export class RoleManager {
        private static _instance: RoleManager;
        private _roleMap: util.HashMap<RoleInfo>;
        private _xlsLoadOver: boolean;

        public static get instance(): RoleManager {
            if (!RoleManager._instance) {
                RoleManager._instance = new RoleManager();
            }
            return RoleManager._instance;
        }

        /**判断是否是主角 */
        public static isMajor(id: number) {
            return id > 1400000 && id < 1409999;
        }

        /**进游戏时就会初始化一次 */
        public async initXml() {
            if (this._xlsLoadOver) {
                return Promise.resolve();
            }
            this._roleMap = new util.HashMap();
            let pArr = [];
            pArr.push(xls.load(xls.globaltest));
            pArr.push(xls.load(xls.characterId));
            pArr.push(xls.load(xls.characterBless));
            pArr.push(xls.load(xls.characterStar));
            pArr.push(xls.load(xls.characterStarNeed));
            pArr.push(xls.load(xls.characterLevel));
            pArr.push(xls.load(xls.awakeBase));
            pArr.push(xls.load(xls.awakeStrengthen));
            pArr.push(xls.load(xls.SkillBase));
            pArr.push(xls.load(xls.godprayBase));
            pArr.push(xls.load(xls.characterHobby));
            pArr.push(xls.load(xls.characterTask));

            await Promise.all(pArr).then(() => {
                RoleInfo.xlsIdData = xls.get(xls.characterId);
                RoleInfo.xlsBlessData = xls.get(xls.characterBless);
                RoleInfo.xlsStarData = xls.get(xls.characterStar);
                RoleInfo.xlsStarNeedData = xls.get(xls.characterStarNeed);
                RoleInfo.xlsLevelData = xls.get(xls.characterLevel);
                RoleInfo.xlsGlobalData = xls.get(xls.globaltest).getValues()[0];
                RoleInfo.xlsAwakeData = xls.get(xls.awakeBase);
                RoleInfo.xlsAwakenStrData = xls.get(xls.awakeStrengthen);
                RoleInfo.xlsSkillData = xls.get(xls.SkillBase);
                RoleInfo.xlsPrayData = xls.get(xls.godprayBase);
                this._xlsLoadOver = true;
            });
            return this.reqSrvData();
        }

        /**
         * 打开角色选择界面
         * @param list 待选id数组
         * @param initSelectId 初始选择的id(没有传0)
         * @param filterIds filterIds中的所有互斥id将被过滤并显示为灰色
         * @param mustSelect 是否必须选一个
         */
        async openRoleSelect(data: { list: number[], initSelectId: number, filterIds: number[], mustSelect: boolean }): Promise<number> {
            await this.initXml();
            let mod = await ModuleManager.open('selectRole.SelectRoleModule', data);
            let self = this;
            return new Promise<number>((ok) => {
                mod.on(Laya.Event.CLOSE, self, () => {
                    ok(data['select']);
                });
            });
        }

        private async reqSrvData() {
            return net.sendAndWait(new pb.cs_get_all_role_info()).then((data: pb.sc_get_all_role_info) => {
                for (let info of data.roles) {
                    let role = new RoleInfo(info);
                    this._roleMap.add(info.roleId, role);
                }
            })
        }

        public addRoleInfoByNotice(infos: pb.IRole[]) {
            for (const info of infos) {
                let role = new RoleInfo(info);
                this._roleMap.add(info.roleId, role);
            }
        }

        /** 更新好感度*/
        public updateRoleFavor(data: pb.sc_favor_info_change_notify): void {
            let role: role.RoleInfo = this.getRoleById(data.roleId);
            if (role) {
                //好感度等级变化辽
                let lvChanged = role.faverLv != data.favorLvl;
                if (lvChanged)
                    alert.showUpgradeNotice(3, [role.faverLv, data.favorLvl]);
                role.updateFaverInfo(data);
                EventManager.event(globalEvent.FAVOR_UPDATE, lvChanged);
            }
        }

        /**返回角色信息（若未获得 返回null） */
        public getRoleById(id: number): RoleInfo {
            return this._roleMap.get(id);
        }

        /** 返回未解锁的所有角色 */
        public getLockedRoles(): number[] {
            return _.map(RoleInfo.xlsIdData.getValues(), (o) => { return o.characterId }).filter((id) => {
                return !this._roleMap.has(id) && !RoleManager.isMajor(id);
            });
        }

        /** 获取玩家所有角色（全部） */
        public getAllRoles(): RoleInfo[] {
            return this._roleMap.getValues();
        }

        /** 获取玩家所有基础角色（排除觉醒的） */
        public getAllBaseRoles(): RoleInfo[] {
            let ori = this._roleMap.getValues();
            let expect = _.map(RoleInfo.xlsAwakeData.getValues(), 'rroleID');
            let rtn = _.filter(ori, (info) => {
                return expect.indexOf(info.id) == -1;
            });
            return rtn;
        }

        /**获取当前使用的神祇id */
        public getCurrPrayId() {
            let arr = this._roleMap.getValues();
            let lead = _.find(arr, (role, idx) => {
                if (role.srvData.isLead) {
                    return role;
                }
            });
            return lead.srvData.curPray;
        }

        /** 获取玩家自身角色信息 
         * 
         * ！！！注意！！！  
         * 
         * 如果要拿自身角色的属性,动画SK，稀有度，不能直接用这个info取, 需要从xlsPray里面取(神祇数据)
         * 
         *  */
        public getSelfInfo() {
            return _.find(this._roleMap.getValues(), (role) => {
                if (role.srvData.isLead) {
                    return role;
                }
            });
        }

        /** 获取玩家某一属性所有角色 */
        public getRolesByIdentity(index: number): RoleInfo[] {
            let ori = this._roleMap.getValues();
            let rtn = _.filter(ori, (info) => {
                //如果是主角
                if (info.id == this.getSelfInfo().id)
                    return info.xlsPray.Identity == index;
                else
                    return info.xlsId.Identity == index;

            });
            return rtn;
        }
        //---------------------------------------------------------------------------------------------------------
        //
        //                                         玩家操作
        //                          
        //---------------------------------------------------------------------------------------------------------

        /**
         * 使用道具给角色升级
         * @param roleId 角色id
         * @param items 数组或单个对象
         */
        public upgrageLv(roleId: number, items: pb.IItem[]): Promise<any>
        public upgrageLv(roleId: number, items: pb.IItem): Promise<any>
        public upgrageLv(roleId: number, items: pb.IItem | pb.IItem[]): Promise<any> {
            let data = new pb.cs_role_update_lvl();
            data.roleId = roleId;
            data.items = items instanceof Array ? items : [items];
            data.items = _.filter(data.items, o => o.cnt > 0);
            if (data.items.length == 0)
                return Promise.resolve();
            else
                return net.sendAndWait(data).then((e: pb.sc_role_update_lvl) => {
                    let oldSrvInfo = this._roleMap.get(e.roleId).srvData;
                    let info = _.cloneDeep(oldSrvInfo);
                    info.exp = e.exp;
                    let newInfo = new RoleInfo(info);
                    this._roleMap.add(e.roleId, newInfo);
                });
        }

        public upgradeStar(roleId: number) {
            let data = new pb.cs_role_update_star();
            data.roleId = roleId;
            return net.sendAndWait(data).then((e: pb.sc_role_update_star) => {
                let oldSrvInfo = this._roleMap.get(e.roleId).srvData;
                let info = _.cloneDeep(oldSrvInfo);
                info.star = e.star;
                let newInfo = new RoleInfo(info);
                this._roleMap.add(e.roleId, newInfo);
            });
        }

        /**赠送礼物 */
        public giveGift(roleId: number, itemId: number,cut: number) {
            let data = new pb.cs_role_give_gift();
            data.giftId = itemId;
            data.roleId = roleId;
            data.giftCnt = cut;
            return net.sendAndWait(data).then((data: pb.sc_role_give_gift) => {
                // let oldSrvInfo = this._roleMap.get(roleId).srvData;
                // let info = _.cloneDeep(oldSrvInfo);
                // // info.favor = e.favor;
                // // info.favorTaskId = e.favorTaskId;
                // let newInfo = new RoleInfo(info);
                // this._roleMap.add(roleId, newInfo);
            });
        }

        public upgrageBless(roleId: number) {
            let data = new pb.cs_role_bless_update();
            data.roleId = roleId;
            return net.sendAndWait(data).then((e: pb.sc_role_bless_update) => {
                let oldSrvInfo = this._roleMap.get(roleId).srvData;
                let info = _.cloneDeep(oldSrvInfo);
                info.attrs = e.attrs;
                let newInfo = new RoleInfo(info);
                this._roleMap.add(roleId, newInfo);
            })
        }

        public upgradeBlessStage(roleId: number) {
            let data = new pb.cs_role_bless_upgrade();
            data.roleId = roleId;
            return net.sendAndWait(data).then((e: pb.sc_role_bless_upgrade) => {
                let oldSrvInfo = this._roleMap.get(roleId).srvData;
                let info = _.cloneDeep(oldSrvInfo);
                info.blessLvl = e.bLevel;
                let newInfo = new RoleInfo(info);
                this._roleMap.add(roleId, newInfo);
            })
        }

        /**
         * 觉醒（绽放）角色
         * @param awakeId awakeBase表中的id
         */
        public awake(awakeId: number) {
            if (RoleInfo.xlsAwakeData.has(awakeId)) {
                let data = new pb.cs_role_awaken_update({ awakenId: awakeId });
                // return Promise.resolve();
                return net.sendAndWait(data).then((e: pb.sc_role_awaken_update) => {
                    let info = new RoleInfo(e.role);
                    this._roleMap.add(info.id, info);
                    util.RedPoint.reqRedPointRefresh(2701);
                })
            }
        }

        public awakeUpgrade(roleId: number) {
            if (this.getRoleById(roleId)) {
                let data = new pb.cs_role_awaken_upgrade({ roleId: roleId });
                return net.sendAndWait(data).then((e: pb.sc_role_awaken_upgrade) => {
                    let oldSrvInfo = this._roleMap.get(roleId).srvData;
                    let info = _.cloneDeep(oldSrvInfo);
                    info.awakenLvl = e.awakenLvl;
                    let newInfo = new RoleInfo(info);
                    this._roleMap.add(roleId, newInfo);
                });
            }
        }

        /**设置普通角色主打 
         * @param baseRoleId 基础角色id
         * @param awakeRoleId 觉醒
        */
        public setAwakeMain(baseRoleId: number, awakeRoleId: number) {
            return net.sendAndWait(new pb.cs_role_awaken_used({ roleId: awakeRoleId })).then(() => {
                let oldSrvInfo = this._roleMap.get(baseRoleId).srvData;
                let info = _.cloneDeep(oldSrvInfo);
                info.curAwake = awakeRoleId;
                let newInfo = new RoleInfo(info);
                this._roleMap.add(baseRoleId, newInfo);
            }).catch(() => { });
        }

        /**打印属性（调试用） */
        public showAttr(id: number) {
            if (this.getRoleById(id)) {
                let obj = {};
                for (const type of clientCore.role.EXT_ARRAY) {
                    obj[clientCore.role.ExtArrName[type]] = this.getRoleById(id).getAttrInfo(type);
                }
                console.table(obj);
            }
            else {
                console.log('没有id对应的角色')
            }
        }

        /**判断某个角色是否能觉醒 
         * @param id 觉醒前id
        */
        public checkRoleCanAwake(id: number) {
            let xlsAwake = _.find(RoleInfo.xlsAwakeData.getValues(), (o) => { return o.froleID == id })
            if (xlsAwake) {
                //表中有 开始判断条件
                //已经觉醒了的需要过滤
                let xlsCanAwakeInfoArr = _.filter(RoleInfo.xlsAwakeData.getValues(), (o) => { return o.froleID == id && this.getRoleById(o.rroleID) == null });
                for (const info of xlsCanAwakeInfoArr) {
                    let allAwakeInfo = this.getAwakeConditions(info.rroleID);//所有能觉醒的信息
                    if (_.findIndex(allAwakeInfo, (o) => { return o.ok }) > -1)
                        return true;
                }
                return false
            }
            else {
                //觉醒表中找不到
                return false
            }
        }

        /**获取一个觉醒后角色所需的所有条件信息 
         * @param 觉醒后的角色id
        */
        public getAwakeConditions(id: number) {
            let awakeInfo = _.find(RoleInfo.xlsAwakeData.getValues(), (o) => { return o.rroleID == id });
            let conditionArr = awakeInfo.awakenCondition.concat([{ v1: 999, v2: 1 }]);//999代表花精灵王
            let strArr = _.map(conditionArr, (awakeCon) => {
                return this.getAwakeSingleConditionInfo(awakeInfo.rroleID, awakeCon.v1, awakeCon.v2);
            })
            return strArr;
        }

        /** 获取单个觉醒条件的相关信息
         * @param id 觉醒后id
         * @param type 条件类型: 1等级 2好感度  999花精灵王
         * @param num 条件数量
         * 
         * @returns [条件名称，条件进度，是否满足（boolean）]
         */
        public getAwakeSingleConditionInfo(id: number, type: number, num: number) {
            let str1 = '';
            let str2 = '';
            let ok: boolean;
            let awakeInfo = _.find(RoleInfo.xlsAwakeData.getValues(), (o) => { return o.rroleID == id })
            let currBaseRoleInfo = this.getRoleById(awakeInfo.froleID);
            if (!awakeInfo || currBaseRoleInfo == null)
                return { title: '', num: '', ok: false };
            switch (type) {
                case 1:
                    str1 = '角色等级达到'
                    str2 = `${currBaseRoleInfo.lv}/${num}`;
                    ok = currBaseRoleInfo.lv >= num;
                    break;
                case 2:
                    str1 = '角色好感度达到'
                    str2 = `${currBaseRoleInfo.faver}/${num}`;
                    ok = currBaseRoleInfo.faver >= num;
                    break;
                case 999:
                    str1 = '拥有:' + clientCore.ItemsInfo.getItemInfo(awakeInfo.needCurrency).name
                    str2 = clientCore.ItemBagManager.getItemNum(awakeInfo.needCurrency) + '/1';
                    ok = clientCore.ItemBagManager.getItemNum(awakeInfo.needCurrency) > 0;
                default:
                    break;
            }
            return { title: str1, num: str2, ok: ok };
        }
    }
}