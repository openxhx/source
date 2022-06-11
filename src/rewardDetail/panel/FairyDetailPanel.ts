
namespace rewardDetail {
    export class FairyDetailPanel extends ui.rewardDetail.panel.FairyDetailPanelUI {
        private _bone: clientCore.Bone;
        constructor() {
            super();
            this.sideClose = true;
        }

        show(id: number) {
            clientCore.DialogMgr.ins.open(this);
            //在awakeBase中找对应花精灵的所有行
            let roleId: number;
            let skillArr = [];
            let xlsRole: xls.characterId;
            if (xls.get(xls.characterId).has(id)) {
                roleId = id;
                xlsRole = xls.get(xls.characterId).get(roleId);
                skillArr = xlsRole.skillId.slice();
            }
            else {
                let xlsAwakeArr = _.filter(clientCore.role.RoleInfo.xlsAwakeData.getValues(), (o) => { return o.needCurrency == id });
                if (xlsAwakeArr.length == 0) {
                    console.warn(`${id}在awakeBase中的needCurrency没有`);
                    this.hide();
                    return;
                }
                if (xlsAwakeArr.length == 1) {
                    //只有一个 说明是花精灵
                    roleId = xlsAwakeArr[0].rroleID;
                    xlsRole = xls.get(xls.characterId).get(roleId);
                    skillArr = xlsRole.skillId.slice();
                }
                else {
                    //有多个，说明是花精灵王，要找到对应自己主角的
                    let userId = clientCore.RoleManager.instance.getSelfInfo().id;
                    let obj = _.find(xlsAwakeArr, (o) => { return o.froleID == userId });
                    if (obj) {
                        roleId = obj.rroleID;
                        xlsRole = xls.get(xls.characterId).get(roleId);
                        let xlsGod = xls.get(xls.godprayBase).get(roleId);
                        if (!xlsGod) {
                            console.log(`godpraybase中没有${roleId}`)
                            return;
                        }
                        skillArr = xlsGod.skillId.concat([xlsGod.blessSkillId]);
                    }
                    else {
                        console.warn(`在awakeBase中没有对应主角id${userId}和needCurrency${id}的数据`);
                        return;
                    }
                }
            }
            skillArr.length = 3;
            skillArr = skillArr.reverse();
            this.txtName.text = xlsRole.name;
            this.imgRole.skin = pathConfig.getRoleUI(roleId);
            this.imgAttr.skin = pathConfig.getRoleAttrIco(xlsRole.Identity);
            this.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(xlsRole.battleType);
            // this._bone?.dispose(true);
            this._bone?.dispose(); //没必要清理啦 给自动管理吧
            this._bone = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(roleId), 'idle', true, this);
            this._bone.pos(542, 348);
            for (let i = 0; i < 3; i++) {
                let cell: ui.rewardDetail.render.FairySkillRenderUI = this['skill_' + i];
                cell.visible = skillArr[i]
                if (cell.visible) {
                    let skillInfo = xls.get(xls.SkillBase).get(skillArr[i]);
                    cell.txtName.text = skillInfo.skillName;
                    cell.txtDes.text = skillInfo.skillDesc;
                    cell.imgRight.x = cell.txtName.x + cell.txtName.width + 5;
                    cell.imgIcon.skin = pathConfig.getSkillIcon(skillInfo.skillId);
                }
            }
        }

        hide() {
            clientCore.DialogMgr.ins.close(this);
        }

        destroy() {
            // this._bone?.dispose(true);
            this._bone?.dispose(); //没必要清理啦 给自动管理吧
            super.destroy();
        }
    }
}