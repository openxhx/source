namespace produce.panel {
    import StringUtils = util.StringUtils;
    /**
     * 升级信息
     */
    export class UpgradePanel extends ui.produce.panel.UpgradePanelUI {
        private _info: clientCore.MapItemInfo;

        private _canUpgrade: boolean;

        constructor() {
            super();
            this.list.renderHandler = Laya.Handler.create(this, this.listRender, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.mouseClick, null, false);

            this.txTarget.style.fontSize = 22;
            this.txTarget.style.width = 361;
        }

        mouseClick(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "click") {
                    clientCore.ToolTip.hideTips();
                    clientCore.ToolTip.showTips(e.target, { id: this.list.getItem(index).v1 });
                }
            }
        }

        private hideBox(): void {
            this.mcTips.visible = false;
        }

        public show(info: clientCore.MapItemInfo): void {
            clientCore.DialogMgr.ins.open(this);
            this.refreshInfo(info);
            this.mcTips.visible = false;

        }

        public refreshInfo(info: clientCore.MapItemInfo) {
            this._info = info;

            this.txtName.changeText(info.name);
            this.txtDes.text = info.captions;
            let maxLv = clientCore.BuildingUpgradeConf.getMaxLevel(info.type);
            this.txtLv.text = `等级(${info.level}/${maxLv})`;
            this.imgIcon.skin = info.type == 1 ? pathConfig.getBuildingIconPath(info.id) : pathConfig.getSeedIconPath(info.id);

            //时间和上限
            let upgradeInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getCurUpgradeInfoByTypeAndLevel(info.upgradeType, info.level);
            let formulaInfo: xls.manageBuildingFormula = xls.get(xls.manageBuildingFormula).get(info.produceFormulaID);
            let passT: number = Math.floor(formulaInfo.timeS * (1 - upgradeInfo.efficiency / 100));
            this.txTime.text = util.StringUtils.getTimeStr2(passT);
            this.txLimit.text = upgradeInfo.stackLimit.toString();
            let nextInfo: xls.manageBuildingUpdate = clientCore.BuildingUpgradeConf.getNextUpgradeInfoByTypeAndLevel(info.upgradeType, info.level);
            passT = Math.floor(formulaInfo.timeS * (1 - nextInfo.efficiency / 100));
            this.txNextTime.text = util.StringUtils.getTimeStr2(passT).toString();
            this.txNextLimit.text = nextInfo.stackLimit.toString();
            this.txNextTime.color = this.txNextTime.text == this.txTime.text ? '#805329' : '#fa7279';
            this.txNextLimit.color = this.txNextLimit.text == this.txLimit.text ? '#805329' : '#fa7279';

            //等级限制
            let targerName: string = nextInfo.limit.v1 == 1 ? "主角" : "精灵树";
            let myLv: number = nextInfo.limit.v1 == 1 ? clientCore.LocalInfo.userLv : clientCore.LocalInfo.treeLv;
            this._canUpgrade = myLv >= nextInfo.limit.v2;
            let isFullColor = myLv >= nextInfo.limit.v2 ? '#805329' : '#f9606e';
            this.txTarget.innerHTML = StringUtils.getColorText2([`${targerName}等级达到${nextInfo.limit.v2}级(`, '#805329', `${myLv}`, isFullColor, `/${nextInfo.limit.v2})`, '#805329'])
            //材料显示
            this.list.array = nextInfo.item.concat([{ v1: 820001, v2: nextInfo.energy }]);
            this.list.repeatX = this.list.length;
            //是否可以升级
            this.imgLv.skin = myLv >= nextInfo.limit.v2 ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            this.imgItem.skin = this.checkItemEnough() ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            this.btnUpgrade.disabled = !(this._canUpgrade && this.checkItemEnough());

            //tips内容
            let lvInfoArr: xls.manageBuildingUpdate[] = [];
            _.map(xls.get(xls.manageBuildingUpdate).getValues(), (info) => {
                if (info.buildingTypeId == 99) {
                    lvInfoArr.push(info);
                }
            });
            this.txtMaxLv.text = '等级:' + maxLv;
            let maxInfo = clientCore.BuildingUpgradeConf.getNextUpgradeInfoByTypeAndLevel(info.upgradeType, maxLv - 1);
            this.txtMaxTime.text = util.StringUtils.getTimeStr2(Math.floor(formulaInfo.timeS * (1 - maxInfo.efficiency / 100)));
            this.txtMaxNum.text = maxInfo.stackLimit.toString();
            this.txtMaxName.text = info.name;
        }

        private checkItemEnough() {
            for (let o of this.list.array) {
                if (o.v1 == 820001) {
                    if (clientCore.BuildQueueManager.allEnergy < o.v2) {
                        return false
                    }
                }
                else {
                    if (clientCore.ItemsInfo.getItemNum(o.v1) < o.v2)
                        return false;
                }
            }
            return true;
        }

        private showTips() {
            this.mcTips.visible = true;
            BC.addOnceEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.hideBox);
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnTips, Laya.Event.CLICK, this, this.showTips);
            BC.addEvent(this, this.btnUpgrade, Laya.Event.CLICK, this, this.onUpgrade2);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public destroy(): void {
            super.destroy();
            this._info = null;
        }

        private listRender(item: ui.produce.item.UpgradeItemRenderUI, index: number): void {
            let data: xls.pair = item.dataSource;
            item.txtnum.style.fontSize = 20;
            item.txtnum.style.align = 'center';
            item.txtnum.style.width = 133;
            item.getChildByName('click')['skin'] = clientCore.ItemsInfo.getItemIconBg(data.v1);
            let myNum: number;
            if (data.v1 == 820001) {
                item.imgIcon.skin = 'produce/1600001.png';
                myNum = clientCore.BuildQueueManager.allEnergy;
                let isFullColor = clientCore.BuildQueueManager.allEnergy >= data.v2 ? '#805329' : '#f9606e';
                item.txtnum.innerHTML = StringUtils.getColorText2([clientCore.BuildQueueManager.allEnergy.toString(), isFullColor, '/' + data.v2, '#805329']);

            }
            else {
                item.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
                myNum = clientCore.ItemsInfo.getItemNum(data.v1);
                let isFullColor = clientCore.ItemsInfo.getItemNum(data.v1) >= data.v2 ? '#805329' : '#f9606e';
                item.txtnum.innerHTML = StringUtils.getColorText2([clientCore.ItemsInfo.getItemNum(data.v1).toString(), isFullColor, '/' + data.v2, '#805329']);
            }
            let isEn: boolean = myNum >= data.v2;
            this._canUpgrade = isEn ? this._canUpgrade : isEn;
        }

        private onUpgrade(): void {
            net.sendAndWait(new pb.cs_build_upgrade_level({ getTime: this._info.getTime }))
                .then(async (data: pb.sc_build_upgrade_level) => {
                    await this.playAni(this.ani1);
                    this._info.level = data.build.attrs.hAttrs.level;
                    this.event("UPGRADE_SUCC", data.build.getTime);
                    await this.playAni(this.ani2);
                }).catch(() => { });
        }
        private onUpgrade2(): void {
            // 部分玩家升级后显示不正确 但后端实际上是升级成功的 所以会不会是await导致显示不正确？
            net.sendAndWait(new pb.cs_build_upgrade_level({ getTime: this._info.getTime }))
                .then((data: pb.sc_build_upgrade_level) => {
                    this._info.level = data.build.attrs.hAttrs.level;
                    this.event("UPGRADE_SUCC", data.build.getTime);
                    this.ani2.play(0, false);
                }).catch(() => { });
        }
        private playAni(ani: Laya.FrameAnimation) {
            return new Promise((ok) => {
                ani.on(Laya.Event.COMPLETE, this, ok);
                ani.play(0, false);
            })
        }

        private hide(): void {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}