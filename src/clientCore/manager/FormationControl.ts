
namespace clientCore {
    /**
     * 阵容消息控制
     */
    export class FormationControl {
        private static _instance;
        /** 布阵角色id数组（摆格子那里用，定长6，空位置0） */
        seatArr: number[];
        /** 神祇技能id数组（定长3，空位置0） */
        praySkillArr: number[];
        /** 角色槽位数组（定长5，空位置0，未解锁undefined 主角相关信息直接从RoleManager里面拿） */
        slotArr: number[];

        private _checkFlg = false;
        static get instance(): FormationControl {
            if (!FormationControl._instance) {
                FormationControl._instance = new FormationControl();
            }
            return FormationControl._instance;
        }

        async initXml() {
            await RoleManager.instance.initXml();
            await xls.load(xls.SkillBase);
            await this.initInfo();
            return Promise.resolve();
        }

        async initInfo() {
            if (this._checkFlg)
                return Promise.resolve();
            await net.sendAndWait(new pb.cs_get_battle_array_seat()).then((data: pb.sc_get_battle_array_seat) => {
                this.seatArr = data.roleId.slice();
            });
            await net.sendAndWait(new pb.cs_get_god_pray_skill()).then((data: pb.sc_get_god_pray_skill) => {
                this.praySkillArr = data.skillId.slice();
            });
            await net.sendAndWait(new pb.cs_get_lineup_panel()).then((data: pb.sc_get_lineup_panel) => {
                this.slotArr = data.roleId.slice();//第一位主角信息不要，直接从roleManager里面拿
                this.slotArr.length = 5;
            });
            net.listen(pb.sc_get_lineup_panel, this, this.onLineUpdate);
            this._checkFlg = true;
            return Promise.resolve();
        }

        /**设置角色槽位 */
        setSlotArray(id: number, idx: number) {
            return net.sendAndWait(new pb.cs_set_lineup_panel({ pos: idx + 2, roleId: id })).then(() => {
                this.handleSeat(this.slotArr[idx], id);
                this.slotArr[idx] = id;//成功则替换本地数组
                EventManager.event(globalEvent.EV_SLOT_INFO_UPDATE);
                return Promise.resolve();
            });
        }

        setSeatArray(data: number[]) {
            if (!_.isEqual(data, this.seatArr)) {
                net.sendAndWait(new pb.cs_set_battle_array_seat({ roleId: data })).then(() => {
                    this.seatArr = data;//成功则替换本地数组
                });
            }
        }

        setSkillArray(data: number[]) {
            if (!_.isEqual(data, this.praySkillArr)) {
                net.sendAndWait(new pb.cs_set_god_pray_skill({ skillId: data })).then(() => {
                    this.praySkillArr = data;//成功则替换本地数组
                    EventManager.event(globalEvent.EV_SKILL_INFO_UPDATE);
                });
            }
        }

        private onLineUpdate(data: pb.sc_get_lineup_panel) {
            this.slotArr = data.roleId.slice();//第一位主角信息不要，直接从roleManager里面拿
            this.slotArr.length = 5;
            EventManager.event(globalEvent.EV_SLOT_INFO_UPDATE);
        }

        private handleSeat(before: number, after: number) {
            for (let i = 0; i < this.seatArr.length; i++) {
                if (this.seatArr[i] == before) {
                    this.seatArr[i] = after;
                    break;
                }
            }
        }

        /**根据所选id获取能选择的角色数组 */
        getPartnerArrBySelectId(id: number) {
            let selfId = clientCore.RoleManager.instance.getSelfInfo().id;
            let arr = _.map(clientCore.RoleManager.instance.getAllRoles(), (role) => {
                return role.id;
            })
            let mutuxIdArr = _.map(FormationControl.instance.slotArr, (roleId) => {
                if (roleId) {
                    return clientCore.RoleManager.instance.getRoleById(roleId).xlsId.mutexId;
                }
            })
            //排除主角、已上阵的同互斥id
            arr = _.filter(arr, (roleId) => {
                if (roleId == selfId)
                    return false;
                let mutuxId = clientCore.RoleManager.instance.getRoleById(roleId).xlsId.mutexId;
                if (mutuxIdArr.indexOf(mutuxId) > -1)
                    return false;
                return true;
            })
            //自身可以被换下 所以强行push进去 
            if (id > 0)
                arr.push(id);
            return _.uniq(arr);
        }

        getPraySkillArrBySelectId(id: number) {
            let prayArr = [clientCore.RoleManager.instance.getSelfInfo().id].concat(clientCore.RoleManager.instance.getSelfInfo().srvData.allPray);
            let arr = _.compact(_.map(prayArr, (prayid) => {
                let skillId = xls.get(xls.godprayBase).get(prayid).blessSkillId;
                //当前选择了的技能，也需要放入列表（可以下掉）
                if (skillId == id)
                    return skillId;
                //别的槽已选择的不放入列表
                if (FormationControl.instance.praySkillArr.indexOf(skillId) == -1)
                    return skillId;
            }));
            return _.compact(arr);
        }

        getPraySkills(): number[] {
            let _array: number[] = [];
            let _paryArr: number[] = [clientCore.RoleManager.instance.getSelfInfo().id].concat(clientCore.RoleManager.instance.getSelfInfo().srvData.allPray);
            _.forEach(_paryArr, (id: number) => {
                let skillId: number = xls.get(xls.godprayBase).get(id).blessSkillId;
                _array.push(skillId);
            })
            return _array;
        }
    }
}