namespace foster {
    import ExtArrName = clientCore.role.ExtArrName;
    export class StarPanel {
        private _ui: ui.foster.panel.StarPanelUI;
        private _currentInfo: clientCore.role.RoleInfo;
        constructor(ui: ui.foster.panel.StarPanelUI) {
            this._ui = ui;
            BC.addEvent(this, this._ui.btnStar, Laya.Event.CLICK, this, this.onUpgradeStar);
            BC.addEvent(this, this._ui.imgIcon, Laya.Event.CLICK, this, this.showTips);
        }

        show(id: number) {
            this._currentInfo = clientCore.RoleManager.instance.getRoleById(id);
            this.updateView();
        }

        private showTips() {
            let id = this._currentInfo?.nextStarNeedItem?.itemID
            if (id) {
                clientCore.ToolTip.showTips(this._ui.imgIcon, { id: id });
            }
        }

        private updateView() {
            this._ui.spCon.removeChildren();
            let view = new ui.foster.comp[`StarComp_${this._currentInfo.maxStar}UI`]();
            if (view) {
                this._ui.spCon.addChild(view);
                for (let i = 0; i < this._currentInfo.maxStar; i++) {
                    view['star_' + i].index = this._currentInfo.star > i ? 0 : 1;
                }
            }
            let needItem: clientCore.GoodsInfo = this._currentInfo.nextStarNeedItem;
            this._ui.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(needItem.itemID);
            this._ui.txtCost.value = util.StringUtils.parseNumFontValue(clientCore.ItemBagManager.getItemsData([needItem.itemID])[0].goodsInfo.itemNum, needItem.itemNum);
            let attrArr = [ExtArrName.血量, ExtArrName.攻击, ExtArrName.防御];
            if (this._currentInfo.star < this._currentInfo.maxStar) {
                for (let i = 0; i < attrArr.length; i++) {
                    const attr = attrArr[i];
                    this._ui['box_' + i].getChildByName('txtAttr').text = this._currentInfo.getAttrInfo(attr).total;
                    let nextStarAdd = this._currentInfo.getStarAttr(attr, this._currentInfo.star + 1);
                    let nowStarAdd = this._currentInfo.getStarAttr(attr, this._currentInfo.star);
                    this._ui['box_' + i].getChildByName('attr_3').text = '+' + (nextStarAdd.v1 - nowStarAdd.v1 + nextStarAdd.v2);
                    this._ui['box_' + i].getChildByName('img').skin = pathConfig.getRoleSmallAttrIco(attr);
                }
                this._ui.txtLvNow.text = this._currentInfo.star.toString();
                this._ui.txtNext.text = (this._currentInfo.star + 1).toString();
                this._ui.txtSp.text = this._currentInfo.xlsStar[`star${this._currentInfo.star + 1}Desc`];
                this._ui.boxCanUpgrade.visible = true;
                this._ui.btnStar.disabled = false;
            }
            else {
                for (let i = 0; i < attrArr.length; i++) {
                    const attr = attrArr[i];
                    this._ui['box_' + i].getChildByName('txtAttr').text = this._currentInfo.getAttrInfo(attr).total;
                    this._ui['box_' + i].getChildByName('attr_3').text = '';
                    this._ui['box_' + i].getChildByName('img').skin = pathConfig.getRoleSmallAttrIco(attrArr[i]);

                }
                this._ui.boxCanUpgrade.visible = false;
                this._ui.txtSp.text = this._currentInfo.xlsStar[`star${this._currentInfo.star}Desc`];
                this._ui.btnStar.disabled = true;
            }
        }

        private onUpgradeStar(): void {
            if (this._currentInfo.lv < this._currentInfo.nextStarNeedLv) {
                alert.showFWords('等级达到' + this._currentInfo.nextStarNeedLv + '才可升星，先去提升等级吧');
                return;
            }
            clientCore.RoleManager.instance.upgradeStar(this._currentInfo.id).then(() => {
                alert.showUpgradeNotice(3, [this._currentInfo.star, this._currentInfo.star + 1], '', 0, '星级提升');
                this.show(this._currentInfo.id);
                EventManager.event(EV_REFRESH_VIEW);
            }).catch(() => { });
        }

        destory() {
            BC.removeEvent(this);
        }
    }
}