
namespace roleChain2 {
    import RoleInfo = clientCore.role.RoleInfo;
    const CARD_WIDTH: number = 130;//卡牌宽度
    const CENTRAL_X: number = 230;//scale=1的卡牌位置
    export class RoleAwakePanel extends ui.roleChain2.panel.AwakePanelUI implements IBaseRolePanel {
        /**当前基础角色id */
        private _currRoleId: number;
        /**当前选择的觉醒角色id */
        private _currSelectId: number;
        private _cardList: ui.roleChain2.render.cardUI[];
        private _cacheList: ui.roleChain2.render.cardUI[];
        private _scroll: Laya.HScrollBar;
        private _startFlg: boolean;
        private _getWayPanel: GetFairyPanel;

        constructor() {
            super();
            this._cardList = [];
            this._cacheList = [];
            this._scroll = new Laya.HScrollBar();
            this._scroll.rollRatio = 0.8;
            this.boxCardCon.addChild(this._scroll);
            BC.addEvent(this, this.btnAwake, Laya.Event.CLICK, this, this.onAwakeClick);
            BC.addEvent(this, this.btnSetMain, Laya.Event.CLICK, this, this.onSetMainClick);
            BC.addEvent(this, this._scroll, Laya.Event.CHANGE, this, this.onScrollChange);
            BC.addEvent(this, this._scroll, Laya.Event.START, this, this.onScrollStart);
            BC.addEvent(this, this._scroll, Laya.Event.END, this, this.onScrollEnd);
        }
        show(id: number) {
            if (!this.boxCardCon.scrollRect)
                this.boxCardCon.scrollRect = new Laya.Rectangle(0, 0, this.boxCardCon.width, this.boxCardCon.height)
            //id相同 只需要刷新下左边面板就行（一般是好感度变化 才会是id相同的情况 ）
            if (this._currRoleId != id) {
                this._currRoleId = id;
                let awakeIds: number[] = _.map(_.filter(RoleInfo.xlsAwakeData.getValues(), ['froleID', id]), 'rroleID');
                awakeIds.unshift(id);//基础角色也要插到最前面
                this._scroll.setScroll(-CENTRAL_X, (awakeIds.length - 1) * CARD_WIDTH - CENTRAL_X, -CENTRAL_X);
                this._scroll.target = this.boxCardCon;
                this.pushToPool();
                for (let i = 0; i < awakeIds.length; i++) {
                    let id = awakeIds[i];
                    let card = this.getFromPool();
                    card.flip.gotoAndStop(0);
                    this.setCardInfo(card, id)
                    card.pos(i * CARD_WIDTH, card.height / 2 + 20, true);
                    this.boxCardCon.addChild(card)
                    this._cardList.push(card);
                    card.offAll();
                    card.on(Laya.Event.CLICK, this, this.onCardClick, [id, i]);
                }
                this.onScrollChange();
                //如果已经有主打了,切换到主打面板,否则就显示基础角色(curAwake初始就是基础角色id)
                let baseRoleInfo = clientCore.RoleManager.instance.getRoleById(id);
                this.tweenToIdx(awakeIds.indexOf(baseRoleInfo.srvData.curAwake));
                this.setViewByRoleId(baseRoleInfo.srvData.curAwake);
            }
            else {
                let baseRoleInfo = clientCore.RoleManager.instance.getRoleById(id);
                this.setViewByRoleId(baseRoleInfo.srvData.curAwake);
            }
        }

        private onScrollChange() {
            let sortArr = this._cardList.slice();
            for (let i = 0; i < this._cardList.length; i++) {
                let card = this._cardList[i];
                card.x = i * CARD_WIDTH - this._scroll.value;
                let s = _.clamp(1 - Math.abs(card.x - 230) / 600, 0.3, 1);
                card.scale(s, s, true);
            }
            //调整层级 选中的最上
            sortArr = _.sortBy(sortArr, 'scaleX');
            for (const iterator of sortArr) {
                this.boxCardCon.addChild(iterator);
            }
        }

        private onScrollStart() {
            this._startFlg = true;
            this.resetCardDetail();
        }

        private resetCardDetail() {
            for (const card of this._cardList) {
                card.boxView.visible = true;
                card.boxDetail.visible = false;
                card.imgIcon.skin = 'roleChain2/card/detail.png';
            }
        }

        private onScrollEnd() {
            if (this._startFlg) {
                this._startFlg = false;
                let Absdiff = 100000;
                let diff = 0;
                let idx = 0;
                for (let box of this._cardList) {
                    let tmp = box.x - CENTRAL_X;
                    if (Math.abs(tmp) < Absdiff) {
                        Absdiff = Math.abs(tmp);
                        diff = tmp;
                        idx = this._cardList.indexOf(box);
                    }
                }
                this.tweenToIdx(idx);
            }
        }

        private pushToPool() {
            for (const iterator of this._cardList) {
                this._cacheList.push(iterator);
                iterator.offAll();
                iterator.removeSelf();
            }
            this._cardList = [];
        }

        private getFromPool() {
            if (this._cacheList.length > 0) {
                return this._cacheList.pop();
            }
            else {
                return new ui.roleChain2.render.cardUI();
            }
        }

        private setCardInfo(card: ui.roleChain2.render.cardUI, id: number) {
            let xlsInfo = RoleInfo.xlsIdData.get(id);
            card.dataSource = id;
            card.imgRoleRect.skin = pathConfig.getRoleRectImg(id);
            card.imgAttr.skin = pathConfig.getRoleAttrIco(xlsInfo.Identity);
            card.txtName.text = xlsInfo.name;
            let needGray = clientCore.RoleManager.instance.getRoleById(id) == null;
            card.filters = needGray ? util.DisplayUtil.darkFilter : [];
            card.imgDeco_0.skin = card.imgDeco_1.skin = pathConfig.getRoleQualityDeco(xlsInfo.quality);
            card.imgFrame.skin = pathConfig.getRoleQuality(xlsInfo.quality);
            card.imgFrameBg.skin = pathConfig.getRoleQualityBG(xlsInfo.quality);
            card.imgBattleType.skin = pathConfig.getRoleBattleTypeIcon(xlsInfo.battleType);
            card.imgAttr.skin = pathConfig.getRoleAttrIco(xlsInfo.Identity);
            card.txtName.text = xlsInfo.name;
            if (needGray) {
                card.listStar.dataSource = [];
                card.txtFight.text = '';
                card.txtLv.text = '';
                card.imgRed.visible = _.findIndex(clientCore.RoleManager.instance.getAwakeConditions(id), (o) => { return o.ok }) > -1;
            }
            else {
                card.imgRed.visible = false;
                let roleInfo = clientCore.RoleManager.instance.getRoleById(id);
                card.txtFight.text = '战斗力' + roleInfo.fight.toString();
                card.txtLv.text = 'Lv.' + roleInfo.lv;
                card.listStar.dataSource = _.map(new Array(5), (v, idx) => {
                    let a = (idx + 1) * 2;
                    let b = a - 1;
                    if (a <= roleInfo.star) {
                        return { 'index': 2 };
                    }
                    else if (b <= roleInfo.star) {
                        return { 'index': 1 };
                    }
                    else {
                        return { 'index': 0 };
                    }
                })
            }
            //详情信息
            let roleInfo = clientCore.RoleManager.instance.getRoleById(id);
            if (roleInfo) {
                for (let i = 0; i < card.boxNum.numChildren; i++) {
                    (card.boxNum.getChildAt(i) as Laya.Label).text = roleInfo.getAttrInfo(clientCore.role.EXT_ARRAY[i]).total.toString();
                }
                for (let i = 0; i < 2; i++) {
                    if (roleInfo.skillInfos && roleInfo.skillInfos[i])
                        card['imgIcon_' + i].skin = pathConfig.getSkillIcon(roleInfo.skillInfos[i].skillId);
                    else
                        card['imgIcon_' + i].skin = '';
                }
            }
            else {
                //没有获取的读表
                let attrArr = ['hpBasicAdd', 'defBasicAdd', 'atkBasicAdd', 'hitBasicAdd', 'dodBasicAdd', 'critBasicAdd', 'resiBasicAdd'];
                for (let i = 0; i < card.boxNum.numChildren; i++) {
                    (card.boxNum.getChildAt(i) as Laya.Label).text = xlsInfo[attrArr[i]].v2;
                }
                for (let i = 0; i < 2; i++) {
                    card['imgIcon_' + i].skin = pathConfig.getSkillIcon(xlsInfo.skillId[i]);
                }
            }
            //花精灵王信息(如果是基础角色，隐藏)
            let awakeInfo = _.find(RoleInfo.xlsAwakeData.getValues(), { 'rroleID': id });
            if (awakeInfo) {
                card.boxFairy.visible = roleInfo == null;
                card.imgQues.visible = roleInfo == null;
                card.imgFairy.skin = pathConfig.getFairyIconPath(awakeInfo.needCurrency);
                card.imgNotHave.visible = clientCore.ItemBagManager.getItemNum(awakeInfo.needCurrency) == 0;
            }
            else {
                card.boxFairy.visible = false;
            }
        }

        private tweenToIdx(idx: number) {
            Laya.Tween.clearAll(this._scroll);
            this._scroll.stopScroll();
            Laya.Tween.to(this._scroll, { value: idx * CARD_WIDTH - CENTRAL_X }, 200);
            this.setViewByRoleId(this._cardList[idx].dataSource); //TODO 
        }


        private onCardClick(id: number, idx: number, e: Laya.Event) {
            if (this._currSelectId == id) {
                if (e.target.name == 'boxFairy') {
                    this._getWayPanel = this._getWayPanel || new GetFairyPanel();
                    clientCore.DialogMgr.ins.open(this._getWayPanel);
                    this._getWayPanel.show(id);
                }
                else {
                    this.flipAni(this._cardList[idx]);
                }
            }
            else {
                this.resetCardDetail();
                this.tweenToIdx(idx);

                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSelectRoleLusha") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }
        }

        private flipAni(cell: ui.roleChain2.render.cardUI) {
            cell.flip.wrapMode = cell.boxView.visible ? Laya.AnimationBase.WRAP_POSITIVE : Laya.AnimationBase.WRAP_REVERSE;
            return new Promise((ok) => {
                cell.flip.once(Laya.Event.COMPLETE, this, ok);
                cell.flip.play(0, false);
            })
        }

        /**
         * 设置视图
         * @param roleId 角色id(右边卡牌的id)
         */
        private setViewByRoleId(roleId: number) {
            if (this._currSelectId != roleId) {
                this._currSelectId = roleId;
                EventManager.event(EV_SHOW_ROLE_BIG_IMAGE, roleId);
            }
            if (roleId == this._currRoleId) {
                //显示的基础角色，隐藏觉醒相关功能,只能设为主打
                this.btnAwake.visible = false;
                this.boxCondition.visible = false;
                this.btnSetMain.visible = clientCore.RoleManager.instance.getRoleById(this._currRoleId).srvData.curAwake != roleId;
                return;
            }

            //额外信息
            let haveAwake = clientCore.RoleManager.instance.getRoleById(roleId) != null;
            this.btnAwake.visible = !haveAwake;
            this.boxCondition.visible = !haveAwake;
            this.btnSetMain.visible = haveAwake;
            //没有觉醒的话 显示觉醒条件
            if (!haveAwake) {
                let strArr = clientCore.RoleManager.instance.getAwakeConditions(this._currSelectId);
                let allConditionOk = true;
                for (let i = 0; i < 3; i++) {
                    this['txtCon_' + i].visible = i < strArr.length;
                    this['imgOkBg_' + i].visible = i < strArr.length;
                    this['imgOk_' + i].visible = i < strArr.length;
                    this['txtConNum_' + i].visible = i < strArr.length;
                    if (i < strArr.length) {
                        let con = strArr[i];
                        this['txtCon_' + i].text = con.title;
                        this['txtConNum_' + i].text = con.num;
                        this['txtConNum_' + i].color = con.ok ? '#00ff00' : '#000000';
                        this['imgOk_' + i].visible = con.ok;
                        if (!con.ok)
                            allConditionOk = false;
                    }
                }
                this.btnAwake.disabled = !allConditionOk;
            }
            else {
                //觉醒了的话 判断是否当前的是主打
                let role = clientCore.RoleManager.instance.getRoleById(this._currRoleId);
                this.btnSetMain.visible = role.srvData.curAwake != roleId;
            }
        }

        private onAwakeClick() {
            let xlsAwake = _.find(xls.get(xls.awakeBase).getValues(), { 'rroleID': this._currSelectId });
            if (!xlsAwake) {
                console.warn('角色：' + this._currSelectId + '没有对应的awakeBase表配置');
                return;
            }

            clientCore.RoleManager.instance.awake(xlsAwake.awakeID).then(() => {
                let awakeAniPanel = new AwakeAnimatePanel();
                awakeAniPanel.setData(xlsAwake);
                awakeAniPanel.once(Laya.Event.CLOSE, this, () => {
                    this.setViewByRoleId(this._currSelectId);
                    EventManager.event(EV_SHOW_ROLE_BIG_IMAGE, this._currSelectId);
                    EventManager.event(EV_REFRESH_LEFT_HEAD);
                    for (const card of this._cardList) {
                        this.setCardInfo(card, card.dataSource);
                    }
                })
                clientCore.DialogMgr.ins.open(awakeAniPanel);
                if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickSureAwakeBtn") {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                }
            }).catch(() => { });
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickAwakeBtn") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private async onSetMainClick() {
            await clientCore.RoleManager.instance.setAwakeMain(this._currRoleId, this._currSelectId);
            this.setViewByRoleId(this._currSelectId);
            alert.showFWords('主打设置成功！');
        }

        destroy() {
            this._scroll.destroy();
            BC.removeEvent(this);
            super.destroy();
        }
        dispose(): void {

        }
    }
}