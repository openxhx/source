namespace pray {
    /**
     * 神祈模块
     */
    export class PrayModule extends ui.pray.PrayUI {

        private _roleInfo: clientCore.role.RoleInfo;
        private _attrPanel: panel.AttrPanel;
        private _xlsPray: xls.godprayBase;
        private _arc: component.HuaArc2;
        private _suitPanel: panel.SuitPanel;


        private _prays: pb.Ipray_info[];
        private _currentPrayInfo: pb.Ipray_info;

        private _currentSpriteId: number; //当前选择的花精灵王ID
        private _darkFilter: (Laya.ColorFilter | Laya.GlowFilter)[];
        private prayId:number[] = [1400025 , 1400026];
        constructor() { super(); }

        public init(d: any): void {
            super.init(d);
            //以下开始
            this.addPreLoad(this.getRolePrays());
            this.addPreLoad(xls.load(xls.clothStore));
            this.addPreLoad(xls.load(xls.collectSuits));
            this._darkFilter = [
                new Laya.ColorFilter([1, 0, 0, 0, -50, 0, 1, 0, 0, -50, 0, 0, 1, 0, -50, 0, 0, 0, 1, 0]),
                new Laya.ColorFilter([0.702755905511811, 0, 0, 0, 18.875, 0, 0.702755905511811, 0, 0, 18.875, 0, 0, 0.702755905511811, 0, 18.875, 0, 0, 0, 1, 0])
            ];
            (this._darkFilter[0] as Laya.ColorFilter).adjustBrightness(-10);
            this._darkFilter.push(new Laya.GlowFilter('0xf7ffcb', 10, 0, 0));
        }

        /**
         * 获取玩家神祈
         */
        private getRolePrays(): Promise<void> {
            return new Promise((success) => {
                net.sendAndWait(new pb.cs_get_leading_role_pray()).then((msg: pb.sc_get_leading_role_pray) => {
                    this._prays = msg.prayLists;
                    // for(let i:number=0 ; i<this._prays.length ; i++){
                    //     if(this.prayId.indexOf(this._prays[i].prayId) != -1){
                    //         this._prays.splice(i,1);
                    //     }
                    // }
                    success();
                });
            })
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnOpen, Laya.Event.CLICK, this, this.openPanel);
            BC.addEvent(this, this.btnCost, Laya.Event.CLICK, this, this.openSpriteInfo);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.closeView);
            BC.addEvent(this, this.btnProcess, Laya.Event.CLICK, this, this.onProcess);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.changePray, [0]);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.changePray, [1]);
            BC.addEvent(this, this.btnBuy, Laya.Event.CLICK, this, this.openSuit);

            BC.addEvent(this, EventManager, globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI, this, this.findGuideHoleInfo)
        }

        private findGuideHoleInfo() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.moduleName == "prayModule") {
                let objName = clientCore.GuideMainManager.instance.curGuideInfo.objectName;
                if (objName != "") {
                    var obj: any;
                    obj = this[objName];
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, obj);
                }
                else {
                    EventManager.event(globalEvent.NEW_PLAYER_GUIDE_DRAW_HOLE_INFO, null);
                }
            }
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        popupOver() {
            if (clientCore.GuideMainManager.instance.curGuideInfo.showMaskBehavior == "waitPrayModuleOpen") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_SHOW_MASK_UI);
            }
        }

        public initOver(): void {
            this._roleInfo = clientCore.RoleManager.instance.getSelfInfo();
            this.initArc();
            this.updateDirBtn();
        }

        public destroy(): void {
            super.destroy();
            this._arc && this._arc.dispose();
            this._attrPanel && this._attrPanel.destroy();
            this._suitPanel = this._roleInfo = this._xlsPray = this._arc = this._attrPanel = null;
            for (let key in this._cache) {
                this._cache[key] = null;
            }
            this._cache = null;
        }

        private initArc(): void {
            this._arc = new component.HuaArc2(1095, 750, 1, 0.4);
            this.addChildAt(this._arc.list, 1);
            this._arc.hScrollBarSkin = "";
            this._arc.list.spaceX = 100;
            this._arc.itemRender = ui.pray.item.PaintItemUI;
            this._arc.renderHandler = Laya.Handler.create(this, this.prayRender, null, false);
            this._arc.showHandler = Laya.Handler.create(this, this.showPary, null, false);
            this._arc.array = this._prays.sort((a, b) => {
                if (a.prayId < b.prayId) {
                    return -1;
                }
                return 1;
            });
            this._arc.setRollRation(0.91);
            // 跳转到
            let len: number = this._prays.length;
            let index: number = 0;
            for (let i: number = 0; i < len; i++) {
                if (this._prays[i].prayId == this._roleInfo.srvData.curPray) {
                    index = i;
                    break
                }
            }
            if (clientCore.GuideMainManager.instance.isGuideAction &&
                clientCore.GuideMainManager.instance.curGuideInfo.mainID == 15) {
                for (let i: number = 0; i < len; i++) {
                    if (this._prays[i].prayId == 1400005 || this._prays[i].prayId == 1400006) {
                        index = i;
                        break
                    }
                }
            }
            this._arc.showIndex = index;
        }

        private prayRender(item: ui.pray.item.PaintItemUI, index: number): void {
            let info: pb.Ipray_info = this._prays[index];
            item.img.gray = info.havePray == 0;
            item.img.skin = pathConfig.getPrayUI(info.prayId);
        }

        private changePray(type: number): void {
            type == 0 ? this._arc.showIndex++ : this._arc.showIndex--;
        }

        private updateDirBtn(): void {
            this.btnLeft.visible = this._arc.showIndex != 0;
            this.btnRight.visible = this._arc.showIndex < this._arc.list.length - 1;
        }

        /** 打开详细属性*/
        private openPanel(): void {
            core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
            this._attrPanel = this._attrPanel || new panel.AttrPanel();
            !this._attrPanel.parent && this.addChild(this._attrPanel);
            this._attrPanel.show(this._xlsPray.SkinId);
        }

        /** 打开花精灵王信息*/
        private openSpriteInfo(): void {
            if (this._currentSpriteId == 0) return;
            clientCore.ToolTip.showTips(this.btnCost, { id: this._currentSpriteId });
        }

        /** 打开套装购买*/
        private openSuit(): void {
            let prayId: number = this._currentPrayInfo.prayId;
            let xlsPray: xls.godprayBase = xls.get(xls.godprayBase).get(prayId);
            if (xlsPray.suitId != 0) {
                let info = clientCore.SuitsInfo.getSuitInfo(xlsPray.suitId);
                if (info.allGet) {
                    alert.showFWords('小花仙你已经集齐该套装了哦~');
                    return;
                }
            }
            let info =   _.filter(xls.get(xls.collectSuits).getValues(), (o) => { return o.suitsId == xlsPray.suitId })[0]?.channelType ?? "";
            if(info.length > 0){
                let temp = info.split('/');
                if(parseInt(temp[temp.length-1])  == 14){
                    this._suitPanel = this._suitPanel || new panel.SuitPanel();
                    this._suitPanel.show(prayId);
                }else{
                    // this.destroy();
                    // clientCore.ModuleManager.closeAllOpenModule();
                    clientCore.ToolTip.gotoMod(parseInt(temp[temp.length-1]));
                }
            }
        }

        private showPary(index: number): void {
            this._currentPrayInfo = this._prays[index];
            this._xlsPray = xls.get(xls.godprayBase).get(this._currentPrayInfo.prayId);
            this.txName.changeText(this._xlsPray.name);
            this.imgAttrIco.skin = pathConfig.getRoleAttrIco(this._xlsPray.Identity);
            this.imgCareer.skin = pathConfig.getRoleBattleTypeIcon(this._xlsPray.battleType);
            let xlsPray: xls.godprayBase = xls.get(xls.godprayBase).get(this._currentPrayInfo.prayId);
            let info =   _.filter(xls.get(xls.collectSuits).getValues(), (o) => { return o.suitsId == xlsPray.suitId })[0]?.channelType ?? "";
            let temp = info.split('/');
            this.noBuy.visible = temp.length < 2;
            this.canBuy.visible = temp.length >=2;
            if (xlsPray.suitId != 0) {
                let info = clientCore.SuitsInfo.getSuitInfo(xlsPray.suitId);
                if (info.allGet) {
                    this.canBuy.visible = false;
                    this.noBuy.visible = true;
                    this.noBuy.text = "已获得";
                }else{
                    this.noBuy.text = "暂无获得途径";
                }
            }
            this.updateAttr();
            this.updateSkill();
            this.updateState();
            this.updateSpriteInfo(index);
            this.updateDirBtn();
        }

        /** 更新花精灵王*/
        private updateSpriteInfo(index: number): void {
            let xlsData: xls.awakeBase = this.getAwakeById(this._currentPrayInfo.prayId);
            let havePray = this._prays[index].havePray;
            this._currentSpriteId = 0;
            if (xlsData) {
                let id: number = xlsData.needCurrency;
                let num: number = clientCore.ItemsInfo.getItemNum(id);
                this.btnCost.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                this.btnCost.filters = havePray ? [] : this._darkFilter;
                this.btnCost.scaleX = this.btnCost.scaleY = 0.7;
                this.imgNoPray.visible = havePray == 0;
                this.imgBot.skin = havePray ? 'pray/di_huajingling1.png' : 'pray/di_huajingling.png';
                this._currentSpriteId = id;
            }
            this.boxNeedPet.visible = index != 0;
        }

        /** 更新属性*/
        private updateAttr(): void {
            let obj: any = this._roleInfo.getAttrInfo(clientCore.role.ExtArrName.血量);
            this.txHp.changeText(util.pareseNumb(obj.total));
            obj = this._roleInfo.getAttrInfo(clientCore.role.ExtArrName.攻击);
            this.txAtk.changeText(util.pareseNumb(obj.total));
            obj = this._roleInfo.getAttrInfo(clientCore.role.ExtArrName.防御);
            this.txDef.changeText(util.pareseNumb(obj.total));
        }

        /** 更新技能*/
        private updateSkill(): void {
            let skills: number[] = this._xlsPray.skillId.concat(this._xlsPray.blessSkillId);
            for (let i: number = 1; i <= 3; i++) {
                let skillId: number = skills[i - 1];
                let xlsData: xls.SkillBase = xls.get(xls.SkillBase).get(skillId);
                if (xlsData) {
                    this["skill" + i].skin = i == 3 ? pathConfig.getPraySkillIcon(skillId) : pathConfig.getSkillIcon(skillId);
                }
            }
        }

        /** 更新状态*/
        private updateState(): void {
            if (this._currentPrayInfo.havePray == 1) { // 已经解锁
                this.btnProcess.disabled = this._currentPrayInfo.prayId == this._roleInfo.srvData.curPray;
                this.btnProcess.fontSkin = "pray/t_b_swzd.png";
                this.btnProcess.fontX = 80;
                this.btnBuy.disabled = false;
            } else {
                this.btnProcess.fontSkin = "pray/t_b_sq.png";
                this.btnProcess.fontX = 100;
                this.btnProcess.disabled = !this._currentPrayInfo.haveSpi;
                this.btnBuy.disabled = true;
            }

            if (!this.btnBuy.disabled) {
                let xlsPray: xls.godprayBase = xls.get(xls.godprayBase).get(this._currentPrayInfo.prayId);
                this.btnBuy.disabled = xlsPray.suitId == 0;
            }
        }

        /** 处理神祈*/
        private onProcess(): void {
            if (!this._currentPrayInfo.havePray) {
                // 解锁神祈
                net.sendAndWait(new pb.cs_role_god_pray({ prayId: this._xlsPray.SkinId })).then((msg: pb.sc_role_god_pray) => {
                    let len: number = this._prays.length;
                    for (let i: number = 0; i < len; i++) {
                        let element: pb.Ipray_info = this._prays[i];
                        if (element.prayId == this._xlsPray.SkinId) {
                            element.havePray = 1;
                            this._arc.list.changeItem(i, element);
                            break;
                        }
                    }
                    this._roleInfo.srvData.allPray.push(this._xlsPray.SkinId);
                    this.showPary(this._arc.showIndex);

                    if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickPrayIcon") {
                        EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
                    }

                });
            } else {
                // 设当前皮肤为主打
                net.sendAndWait(new pb.cs_use_pray_skin({ prayId: this._xlsPray.SkinId })).then((msg: pb.sc_use_pray_skin) => {
                    this._roleInfo.changePray(this._xlsPray.SkinId)
                    this.showPary(this._arc.showIndex);
                })
            }
        }

        /** 根据觉醒前的ID 获取awake表信息*/
        private _cache: Object = {};
        private getAwakeById(id: number): xls.awakeBase {
            let data: xls.awakeBase = this._cache[id];
            if (!data) {
                let _array: xls.awakeBase[] = xls.get(xls.awakeBase).getValues();
                let _len: number = _array.length;
                for (let i: number = 0; i < _len; i++) {
                    data = _array[i];
                    if (data.rroleID == id) {
                        break;
                    }
                }
            }
            return data;
        }

        private closeView(): void {
            this.destroy();
            //本来这里直接完成即可，但是这里由于打开模块延迟，16-1判断队伍面板是否打开，由于模块还没有添加到map里面
            //所以导致16-1跳16-3失败，所有特殊处理，直接从这里跳
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClosePrayModule") {
                clientCore.GuideMainManager.instance.skipStep(16, 3);
                clientCore.GuideMainManager.instance.startGuide();
            }
        }
    }
}