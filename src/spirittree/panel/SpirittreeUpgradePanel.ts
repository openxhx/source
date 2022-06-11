namespace spirittree {
    import StringUtils = util.StringUtils;
    export class SpirittreeUpgradePanel extends ui.spirittree.panel.TreeUpgradePanelUI {
        constructor() {
            super();
            this.sideClose = false;
            this.listNeed.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listNeed.mouseHandler = Laya.Handler.create(this, this.mouseClick, null, false);

            this.txtLvNeed.style.fontSize = 22;
            this.txtLvNeed.style.width = 361;
            this.mcTips.visible = false;
            //tips内容
            let lvInfoArr: xls.manageBuildingUpdate[] = [];
            _.map(xls.get(xls.manageBuildingUpdate).getValues(), (info) => {
                if (info.buildingTypeId == 99) {
                    lvInfoArr.push(info);
                }
            });
            let maxLv = _.last(lvInfoArr).level
            this.txtMaxLv.text = '等级:' + maxLv;
            let treeEnergy = xls.get(xls.globaltest).get(1).treeEnergy;
            let per = treeEnergy.v2 / 100;
            this.txtMaxTime.text = util.StringUtils.getDateStr(treeEnergy.v1 * (1 - per * Math.floor(maxLv / 5)));
            this.txtMaxNum.text = maxLv.toString();
        }

        mouseClick(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                if (e.target.name == "click") {
                    clientCore.ToolTip.hideTips();
                    clientCore.ToolTip.showTips(e.target, { id: this.listNeed.getItem(index).v1 });
                }
            }
        }

        setLvInfo() {
            let treeLv = clientCore.LocalInfo.treeLv;
            let treeEnergy = xls.get(xls.globaltest).get(1).treeEnergy;
            let lvInfoArr: xls.manageBuildingUpdate[] = [];
            _.map(xls.get(xls.manageBuildingUpdate).getValues(), (info) => {
                if (info.buildingTypeId == 99) {
                    lvInfoArr.push(info);
                }
            });
            let maxLv = _.last(lvInfoArr).level.toString();
            this.txtLv.text = `等级(${treeLv}/${maxLv})`;
            lvInfoArr = _.orderBy(lvInfoArr, 'level');
            let nextLv = _.clamp(treeLv + 1, 1, _.last(lvInfoArr).level);//边界

            //每5级减一个百分比
            let per = treeEnergy.v2 / 100
            this.txtTime.text = util.StringUtils.getDateStr(treeEnergy.v1 * (1 - per * Math.floor(treeLv / 5)));
            this.txtNextTime.text = util.StringUtils.getDateStr(treeEnergy.v1 * (1 - per * Math.floor(nextLv / 5)));

            this.txtNextTime.color = this.txtTime.text == this.txtNextTime.text ? '#805329' : '#fa7279';

            this.txtNum.text = treeLv.toString();
            this.txtNextNum.text = nextLv.toString();
            this.txtNextNum.color = treeLv == nextLv ? '#805329' : '#fa7279';

            let nextLvReqInfo = _.find(lvInfoArr, { 'level': nextLv });
            this.listNeed.dataSource = nextLvReqInfo.item.concat([{ v1: 820001, v2: nextLvReqInfo.energy }]);
            this.listNeed.repeatX = this.listNeed.length;
            let needUserLv = nextLvReqInfo.limit.v2;
            let nowUserLv = clientCore.LocalInfo.userLv;
            let isFullColor = nowUserLv >= needUserLv ? '#805329' : '#f9606e';
            this.txtLvNeed.innerHTML = StringUtils.getColorText2([`玩家等级到达${needUserLv}级(`, '#805329', nowUserLv.toString(), isFullColor, `/${needUserLv})`, '#805329']);

            let currPlantNum = _.find(lvInfoArr, { 'level': treeLv }).plantLimit;
            let nextPlantNum = _.find(lvInfoArr, { 'level': nextLv }).plantLimit;
            this.txtPlant.text = currPlantNum.toString();
            this.txtNextPlant.text = nextPlantNum.toString();
            this.txtNextPlant.color = currPlantNum == nextPlantNum ? '#805329' : '#fa7279';

            this.imgLv.skin = nowUserLv >= needUserLv ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            this.imgItem.skin = this.checkItemEnough() ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            this.btnUpgrade.disabled = !(nowUserLv >= needUserLv && this.checkItemEnough());
            return '下一级自动获得结晶时间:' + this.txtNextTime.text;
        }

        private checkItemEnough() {
            for (let o of this.listNeed.array) {
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

        private onListRender(cell: ui.spirittree.render.UpgradeItemRenderUI, idx: number) {
            let data = cell.dataSource as xls.pair;
            cell.txtnum.style.fontSize = 20;
            cell.txtnum.style.align = 'center';
            cell.txtnum.style.width = 133;
            cell.getChildByName('click')['skin'] = clientCore.ItemsInfo.getItemIconBg(data.v1);
            if (data.v1 == 820001) {
                cell.imgIcon.skin = 'spirittree/1600001.png';
                let isFullColor = clientCore.BuildQueueManager.allEnergy >= data.v2 ? '#805329' : '#f9606e';
                cell.txtnum.innerHTML = StringUtils.getColorText2([clientCore.BuildQueueManager.allEnergy.toString(), isFullColor, '/' + data.v2, '#805329']);
            }
            else {
                cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.v1);
                let isFullColor = clientCore.ItemsInfo.getItemNum(data.v1) >= data.v2 ? '#805329' : '#f9606e';
                cell.txtnum.innerHTML = StringUtils.getColorText2([clientCore.ItemsInfo.getItemNum(data.v1).toString(), isFullColor, '/' + data.v2, '#805329']);
            }
        }

        private onUpgrade() {
            net.send(new pb.cs_spirit_tree_upgrade_level());
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        private showTips() {
            this.mcTips.visible = true;
            BC.addOnceEvent(this, Laya.stage, Laya.Event.MOUSE_DOWN, this, this.hideTips);
        }

        private hideTips() {
            this.mcTips.visible = false;
        }

        private async onLvChange() {
            this.btnUpgrade.mouseEnabled = false;
            await this.playAni(this.ani1);
            this.setLvInfo();
            await this.playAni(this.ani2);
            this.btnUpgrade.mouseEnabled = !this.btnUpgrade.disabled;
        }

        private playAni(ani: Laya.FrameAnimation) {
            return new Promise((ok) => {
                ani.on(Laya.Event.COMPLETE, this, ok);
                ani.play(0, false);
            })
        }

        public addEventListeners() {
            BC.addEvent(this, this.btnUpgrade, Laya.Event.CLICK, this, this.onUpgrade);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnTips, Laya.Event.CLICK, this, this.showTips);
            EventManager.on(globalEvent.TREE_LEVEL_CHANGE, this, this.onLvChange);
        }

        public removeEventListeners() {
            BC.removeEvent(this);
            EventManager.off(globalEvent.TREE_LEVEL_CHANGE, this, this.onLvChange);
        }
    }
}