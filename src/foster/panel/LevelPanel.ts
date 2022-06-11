
namespace foster {
    export const EXP_ITEM = [1500001, 1500002, 1500003, 1500004];//增加经验的物品
    import ExtArrName = clientCore.role.ExtArrName;
    export class LevelPanel {
        private _ui: ui.foster.panel.LevelPanelUI;
        private _roleInfo: clientCore.role.RoleInfo;
        private _isSelf: boolean;
        private _expAdd: { id: number, num: number };
        private _timer: Laya.Timer;
        private _nowExpinfo: { lv: number, currExp: number, nextLvNeed: number, expPercent: number };
        private _netReqing: boolean;
        private _expProgress: util.ProgressUtil;
        private _aniIdx: number;
        private _oneClickPanel: OneClickLevelUpPanel;

        constructor(ui: ui.foster.panel.LevelPanelUI) {
            this._ui = ui;
            this._ui.attr.attrList.renderHandler = new Laya.Handler(this, this.onListAttrRender);
            this._ui.attr.attrListSelf.renderHandler = new Laya.Handler(this, this.onListAttrSelfRender);
            this._ui.exp.list.renderHandler = new Laya.Handler(this, this.onListExpRender);
            this._ui.exp.list.mouseHandler = new Laya.Handler(this, this.onExpItemMouse);
            this._expProgress = new util.ProgressUtil(this._ui.title.imgProgress, 354);
            this._ui.exp.list.dataSource = EXP_ITEM;
            this._timer = new Laya.Timer();
            BC.addEvent(this, this._ui.skill.imgIcon_1, Laya.Event.CLICK, this, this.showTips, [0]);
            BC.addEvent(this, this._ui.skill.imgIcon_2, Laya.Event.CLICK, this, this.showTips, [1]);
            BC.addEvent(this, this._ui.exp.btnOneClick, Laya.Event.CLICK, this, this.oneClickUpLv);
            EventManager.on(globalEvent.ITEM_BAG_CHANGE, this, this.onItemChange);
        }

        private onItemChange() {
            this._ui.exp.list.refresh();
        }

        show(roleId: number) {
            if (!this._roleInfo || this._roleInfo.id != roleId) {
                this._roleInfo = clientCore.RoleManager.instance.getRoleById(roleId);
                this._isSelf = roleId == clientCore.RoleManager.instance.getSelfInfo().id;
                this._ui.boxTips.visible = false;
                this.setAllUI();
                this._oneClickPanel?.show(roleId, false);
            }
        }


        private setAllUI() {
            let expInfo: { lv: number, currExp: number, nextLvNeed: number, expPercent: number };
            if (this._roleInfo.id == clientCore.RoleManager.instance.getSelfInfo().id)
                expInfo = clientCore.LocalInfo.getLvInfo()
            else
                expInfo = clientCore.role.RoleInfo.parseLvInfoByExp(this._roleInfo.exp);
            this._expProgress.set(expInfo.expPercent);
            this.setTitleUI();
            this.setAttrUI();
            this.setSkillUI();
            this.setRoleSk();
            this.setLayout();
        }

        private setRoleSk() {
            let sk = new Laya.Skeleton();
            sk.load(pathConfig.getRoleBattleSk(this._roleInfo.skinId), new Laya.Handler(this, this.onSkLoad, [sk]), 0);
        }

        private removeAllSk() {
            if (this._ui) {
                let numchild = this._ui.skill.boxSk.numChildren;
                for (let i = 0; i < numchild; i++) {
                    this._ui.skill.boxSk.getChildAt(i)?.destroy(true);
                }
                this._ui.skill.boxSk.removeChildren();
            }
        }

        private onSkLoad(sk: Laya.Skeleton) {
            this.removeAllSk();
            this._aniIdx = 0;
            if (sk && sk.templet) {
                let totalAniNum = sk.getAnimNum();
                sk.play(this._aniIdx, false);
                sk.on(Laya.Event.STOPPED, this, () => {
                    this._aniIdx = (this._aniIdx + 1) % totalAniNum;
                    if (sk.templet)
                        sk.play(this._aniIdx, false);
                })
                sk.scale(0.7, 0.7);
            }
            if (this._ui)
                this._ui.skill.boxSk.addChild(sk);
        }

        private setLayout() {
            let selfYPos = [0, 124, 408, 644];
            let otherYPos = [0, 85, 255, 434];
            var uiArr = [this._ui.title, this._ui.attr, this._ui.skill, this._ui.exp];
            for (let i = 1; i < uiArr.length; i++) {
                uiArr[i].y = this._isSelf ? selfYPos[i] : otherYPos[i];
            }
            this._ui.exp.visible = !this._isSelf;
        }

        /**title部分UI（战斗力 等级 经验值） */
        private setTitleUI() {
            let titleUI = this._ui.title;
            let expInfo: { lv: number, currExp: number, nextLvNeed: number, expPercent: number }
            if (this._roleInfo.id == clientCore.RoleManager.instance.getSelfInfo().id)
                expInfo = clientCore.LocalInfo.getLvInfo()
            else
                expInfo = clientCore.role.RoleInfo.parseLvInfoByExp(this._roleInfo.exp);
            titleUI.txLv.text = expInfo.lv.toString();
            titleUI.txProgress.changeText(expInfo.currExp + "/" + (expInfo.nextLvNeed + expInfo.currExp));
            titleUI.txtPray.text = this._roleInfo.srvData.allPray.length.toString();
            this.showPower(titleUI, this._roleInfo.fight);
            titleUI.boxPray.visible = this._isSelf;
            titleUI.boxExp.y = this._isSelf ? 68 : 35;
            titleUI.drawCallOptimize = true;
            this._expProgress.increase(expInfo.expPercent, 0, 0.5);
            this._nowExpinfo = expInfo;

        }

        /** 属性列表部分UI */
        private setAttrUI() {
            let attrUI = this._ui.attr;
            attrUI.attrList.visible = !this._isSelf;
            attrUI.attrListSelf.visible = this._isSelf;
            if (this._isSelf)
                attrUI.attrListSelf.dataSource = clientCore.role.EXT_ARRAY;
            else {
                //搞人的特殊排序
                attrUI.attrList.dataSource = [ExtArrName.血量, ExtArrName.命中, ExtArrName.攻击, ExtArrName.闪避, ExtArrName.防御, ExtArrName.暴击, -1, ExtArrName.抗暴];
            }
            attrUI.boxNormal.visible = !this._isSelf;
            attrUI.boxSelf.visible = this._isSelf;
        }

        /**技能部分UI */
        private setSkillUI() {
            let skillUI = this._ui.skill;
            for (let i = 1; i <= 2; i++) {
                let skill = this._roleInfo.skillInfos[i - 1];
                skillUI['imgIcon_' + i].skin = pathConfig.getSkillIcon(skill.skillId);
                skillUI['txtName_' + i].text = skill.skillName;
            }
        }

        private showTips(idx: number) {
            this._ui.boxTips.visible = true;
            let skill = this._roleInfo.skillInfos[idx];
            this._ui.txtSkillType.text = skill.skillName;
            this._ui.txtDes.text = skill.skillDesc;
            let pos = (this._ui.skill['imgIcon_' + (idx + 1)] as Laya.Sprite).localToGlobal(new Laya.Point(), false, this._ui);
            this._ui.boxTips.pos(pos.x, pos.y, true);
            BC.addOnceEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.hideTips);
        }

        private hideTips() {
            this._ui.boxTips.visible = false;
        }

        private oneClickUpLv() {
            if (this._roleInfo.lv >= clientCore.LocalInfo.userLv) {
                alert.showFWords('其他角色等级不能超过主角');
                return;
            }
            let beforeLv = this._roleInfo.lv;
            this._oneClickPanel = this._oneClickPanel || new OneClickLevelUpPanel();
            this._oneClickPanel.show(this._roleInfo.id);
            this._oneClickPanel.once(Laya.Event.CLOSE, this, this.onRoleExpChanged, [beforeLv]);
        }

        private onRoleExpChanged(beforeLv: number) {
            this._roleInfo = clientCore.RoleManager.instance.getRoleById(this._roleInfo.id);
            if (this._roleInfo.lv > beforeLv) {
                this.setTitleUI();
                this._ui.attr.attrList.refresh();
                alert.showUpgradeNotice(3, [beforeLv, this._roleInfo.lv], '', 0, '等级提升');
                EventManager.event(EV_REFRESH_VIEW);
                this._ui.exp.list.refresh();
            }
        }

        private showPower(titleUI: ui.foster.comp.TitleCompUI, value: number): void {
            titleUI.spPower.graphics.clear();
            let valueStr: string = this.pareseNumb(value);
            let x: number = 0;
            for (let ele of valueStr) {
                let tex: Laya.Texture = Laya.loader.getRes("foster/" + ele + ".png");
                if (tex) {
                    let w: number = tex.sourceWidth;
                    let h: number = tex.sourceHeight;
                    let y: number = ele == "," ? tex.sourceHeight : tex.sourceHeight - h;
                    titleUI.spPower.graphics.drawTexture(tex, x, y, w, h);
                    x += w;
                }
            }
        }

        private pareseNumb(value: number): string {
            let str: string = value.toString();
            let len: number = str.length - 1;
            let valueStr: string = "";
            for (let i: number = len; i >= 0; i--) {
                if (len - i != 0 && (len - i) % 3 == 0) {
                    valueStr = "," + valueStr;
                }
                valueStr = str[i] + valueStr;
            }
            return valueStr;
        }

        private onListAttrRender(cell: ui.foster.render.AttrItemUI, idx: number) {
            if (cell.dataSource > 0) {
                cell.visible = true;
                let info = this._roleInfo.getAttrInfo(cell.dataSource);
                cell.num1.text = util.StringUtils.splitNumber(info.total, ',', 3);
                cell.imgBg.skin = idx % 2 == 0 ? 'foster/skillbg1.png' : 'foster/skillbg2.png';
                cell.ico.skin = pathConfig.getRoleSmallAttrIco(cell.dataSource);
            }
            else {
                cell.visible = false;
            }
        }

        private onListAttrSelfRender(cell: ui.foster.render.AttrItemSelfUI, idx: number) {
            let info = this._roleInfo.getAttrInfo(cell.dataSource);
            cell.num1.text = util.StringUtils.splitNumber(info.total, ',', 3);
            cell.imgBg.skin = idx < 3 ? 'foster/skillbg1.png' : 'foster/skillbg2.png';
            cell.ico.skin = pathConfig.getRoleSmallAttrIco(clientCore.role.EXT_ARRAY[idx]);
            cell.num2.text = '+(' + util.StringUtils.splitNumber(info.starAdd, ',', 3) + ')';
            cell.num3.text = '+(' + util.StringUtils.splitNumber(info.pray, ',', 3) + ')';
        }

        private onListExpRender(cell: ui.foster.render.ExpRenderUI, idx: number) {
            let id = cell.dataSource as number;
            let item = clientCore.ItemBagManager.getItemsData([id])[0];
            clientCore.GlobalConfig.setRewardUI(cell.mcReward, { id: id, cnt: item.goodsInfo.itemNum, showName: false });
            // cell.imgIconBg.skin = clientCore.ItemsInfo.getItemIconBg(item.goodsInfo.itemID);
            // cell.txtHave.text = item.goodsInfo.itemNum.toString();
            cell.txtAddExp.text = item.xlsInfo.value.toString();
            // cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(item.goodsInfo.itemID);
        }

        private onExpItemMouse(e: Laya.Event, idx: number) {
            if (this._netReqing)
                return;
            let expId = this._ui.exp.list.dataSource[idx];
            if (e.type == Laya.Event.MOUSE_DOWN) {
                this.startUseExp(expId);
            }
            if (this._expAdd && expId == this._expAdd.id) {
                if (e.type == Laya.Event.MOUSE_OUT || e.type == Laya.Event.MOUSE_UP) {
                    this.endUseExp();
                }
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickUserExpPotion") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private startUseExp(id: number) {
            if (clientCore.ItemBagManager.getItemNum(id) == 0) {
                alert.showFWords('物品不足')
                if (clientCore.LocalInfo.userLv >= 8)
                    clientCore.LittleRechargManager.instacne.activeWindowById(5);
                return;
            }
            this._expAdd = { id: id, num: 0 };
            this._timer.loop(500, this, this.addExpItem);
        }

        private addExpItem() {
            if (clientCore.ItemBagManager.getItemNum(this._expAdd.id) <= this._expAdd.num) {
                this.endUseExp();
                return;
            }
            this._expAdd.num += 1;
            let singleExp = clientCore.ItemBagManager.getItemsData([this._expAdd.id])[0].xlsInfo.value;
            let totalAddExp = singleExp * this._expAdd.num;
            let afterExpInfo = clientCore.role.RoleInfo.parseLvInfoByExp(this._roleInfo.exp + totalAddExp);
            let loop = Math.min((afterExpInfo.lv - this._nowExpinfo.lv), 1)
            if (afterExpInfo.lv >= clientCore.LocalInfo.userLv) {
                this.endUseExp();
                return;
            }
            if (afterExpInfo && afterExpInfo.lv < 100) {
                let cell = this._ui.exp.list.getCell(EXP_ITEM.indexOf(this._expAdd.id));
                let itemNum = clientCore.ItemsInfo.getItemNum(this._expAdd.id);
                cell['mcReward']['num'].value = itemNum - this._expAdd.num + '';
                console.log(this._expAdd.num);
                this._expProgress.increase(afterExpInfo.expPercent, loop, 0.5).then(() => {
                    this._nowExpinfo = afterExpInfo;
                    //改变list
                    this.setFakeExpInfo();
                });
            }
        }

        private setFakeExpInfo() {
            this._ui.title.txProgress.text = `${this._nowExpinfo.currExp}/${this._nowExpinfo.nextLvNeed + this._nowExpinfo.currExp}`;
            this._ui.title.txLv.text = this._nowExpinfo.lv.toString();
        }

        private endUseExp() {
            if (this._expAdd.num == 0) {
                this._expAdd.num = 1;
            }
            this._timer.clearAll(this);
            this.netReqLvUp(this._expAdd.id, this._expAdd.num);
            this._expAdd = null;
        }

        private async netReqLvUp(id: number, num: number) {
            this._netReqing = true;
            let beforeLv = this._roleInfo.lv;
            if (beforeLv >= clientCore.LocalInfo.userLv) {
                alert.showFWords('其他角色等级不能超过主角');
                this._netReqing = false;
                return;
            }
            await clientCore.RoleManager.instance.upgrageLv(this._roleInfo.id, { id: id, cnt: num }).then(() => {
                this._roleInfo = clientCore.RoleManager.instance.getRoleById(this._roleInfo.id);
                this.setTitleUI();
                this._ui.attr.attrList.refresh();
                if (this._roleInfo.lv > beforeLv) {
                    alert.showUpgradeNotice(3, [beforeLv, this._roleInfo.lv], '', 0, '等级提升');
                    EventManager.event(EV_REFRESH_VIEW);
                    this._ui.exp.list.refresh();
                }
            }).catch(() => { });
            this._netReqing = false;
        }

        public getExpPotion() {
            return this._ui.exp.list.getCell(0);
        }

        destory() {
            this._oneClickPanel?.destroy();
            EventManager.off(globalEvent.ITEM_BAG_CHANGE, this, this.onItemChange);
            this._timer.clearAll(this);
        }
    }
}