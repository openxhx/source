namespace kitchen {
    export class KitchenModule extends ui.kitchen.KitchenModuleUI {
        private _model: KitchenModel;
        private _control: KitchenControl;
        //菜谱研制
        private _curMaterials: number[];
        private allTarget: xls.pair[];
        //菜品制作
        private onHelp: boolean;
        //子面板
        private ingredientPanel: IngredientPanel;
        private foodBookPanel: FoodBookPanel;
        private resultPanel: MakeResultPanel;
        private foodMakePanel: FoodMakePanel;
        private friendHelpPanel: FriendHelpPanel;
        private selectMakePanel: SelectMakePanel;
        //动画
        private aniCreat: clientCore.Bone;
        private aniRole: clientCore.Bone;
        private aniMake: util.HashMap<clientCore.Bone>;
        //材料
        private totalMtr: number[];
        //长按标记
        private mtrHold: boolean;
        private holdTime: number;
        //制作id
        private getReward;
        constructor() {
            super();
            this.labRightTip.style.font = '汉仪中圆简';
            this.labRightTip.style.wordWrap = true;
            this.labRightTip.style.width = 225;
            this.labRightTip.style.fontSize = 25;
            this.labRightTip.style.leading = 10;
            this.labRightTip.style.bold = true;
            this.labRightTip.style.color = "#805329";
        }

        init(data: any) {
            this.sign = clientCore.CManager.regSign(new KitchenModel(), new KitchenControl());
            this._control = clientCore.CManager.getControl(this.sign) as KitchenControl;
            this._model = clientCore.CManager.getModel(this.sign) as KitchenModel;
            this.addPreLoad(xls.load(xls.diningRecipe));
            this.addPreLoad(xls.load(xls.diningBase));
            this.addPreLoad(xls.load(xls.diningLevelUp));
            this.addPreLoad(this.getBaseInfo());
            this.addPreLoad(res.load("res/animate/restaurant/bowl.png"));
            this.addPreLoad(res.load("res/animate/restaurant/chef.png"));
            this.addPreLoad(res.load("res/animate/restaurant/star.png"));
            this.ingredientPanel = new IngredientPanel();
            this.foodBookPanel = new FoodBookPanel(this.sign);
            this.resultPanel = new MakeResultPanel();
            this.foodMakePanel = new FoodMakePanel(this.sign);
            this.friendHelpPanel = new FriendHelpPanel(this.sign);
            this.selectMakePanel = new SelectMakePanel(this.sign);
            this.totalMtr = clientCore.MaterialBagManager.getFoodByType(1);
            this.totalMtr.push(9900310);
            this.list.hScrollBarSkin = "";
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.listSelect);
        }

        onPreloadOver() {
            clientCore.Logger.sendLog('2020年9月18日活动', '花灵餐厅', '进入厨房');
            this._model.creatMaterialConfig();
            this.ingredientPanel.init();
            this.foodBookPanel.init();
            this.setUI();
            if (this._model.serverFoodInfo.length > 0) {
                this.changeView();
                this.btnChange.onRedChange(false);
                this.btnChange.enableRed = false;
            } else {
                this.aniRole = clientCore.BoneMgr.ins.play("res/animate/restaurant/chef.sk", "animation", true, this.boxCreatAni);
                this.aniRole.pos(1057 + 110, 173 + 410);
                this.aniRole.scaleX = this.aniRole.scaleY = 1;
            }
            Laya.timer.loop(1000, this, this.secondDo);
        }

        /**秒级刷新 */
        private secondDo() {
            for (let i: number = 1; i <= 3; i++) {
                this.refreashGuo(i);
            }
            if (this._model.helpTimeEnd > clientCore.ServerManager.curServerTime) {
                this.labHelpTime.text = "倒计时:" + util.TimeUtil.formatSecToStr(this._model.helpTimeEnd - clientCore.ServerManager.curServerTime);
            }
            if (this._model.fHelpTime > clientCore.ServerManager.curServerTime) {
                this.labBeHelpTime.text = "倒计时:" + util.TimeUtil.formatSecToStr(this._model.fHelpTime - clientCore.ServerManager.curServerTime);
            } else if (this._model.fHelp) {
                this._model.fHelp = null;
                this.setHelpUI();
            }
        }

        popupOver() {
            EventManager.event("ON_KITCHEN_OPEN_CLOSE", false);
        }

        private async getBaseInfo() {
            let msg = await this._control.getRecipeInfo();
            this._model.curLevel = msg.rlevel;
            this._model.fHelp = msg.fHelp;
            this._model.fHelpTime = msg.fHelpEnd;
            this._model.helpTimeEnd = msg.toHelpEnd;
            this._model.helpTimeBegin = msg.toHelpBegin;
            this._model.bHelpF = msg.toHelp;
            this._model.fGodPray = msg.godPray;
            this._model.serverWokInfo = msg.wokList;
            this._model.serverFoodInfo = new util.HashMap();
            for (let i: number = 0; i < msg.recipeInfo.length; i++) {
                this._model.serverFoodInfo.add(msg.recipeInfo[i].id, msg.recipeInfo[i] as pb.RecipeInfo)
            }
        }

        private setUI() {
            this.setCreatUI();
            this.setMakeUI();
            this.setHelpUI();
        }

        private listRender(item: ui.kitchen.render.KitchenMaterialRenderUI) {
            let id = item.dataSource;
            item.icon.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            item.num.value = clientCore.ItemsInfo.getItemNum(id).toString();
            item.imgYes.visible = this._curMaterials?.includes(id);
        }

        private listSelect(e: Laya.Event, index: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = this.list.getCell(index).dataSource;
                if (clientCore.ItemsInfo.getItemNum(id) == 0) {
                    clientCore.ToolTip.showTips(this.list.getCell(index), { id: id });
                } else {
                    this.addMaterial(this.list.getCell(index).dataSource);
                }
            }
        }

        /**好友帮厨相关UI */
        private setHelpUI() {
            //自己帮助别人
            if (this._model.bHelpF) {
                this.boxHelp.visible = true;
                this.imgHelpHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._model.bHelpF.headImage);
                this.labhelpName.text = this._model.bHelpF.nick;
                if (this._model.helpTimeEnd > clientCore.ServerManager.curServerTime) {
                    this.labHelpTime.text = "倒计时:" + util.TimeUtil.formatSecToStr(this._model.helpTimeEnd - clientCore.ServerManager.curServerTime);
                } else {
                    this.labHelpTime.text = "已完成";
                }
            } else {
                this.boxHelp.visible = false;
            }
            //好友帮助自己
            if (this._model.fHelp) {
                this.onHelp = true;
                this.imgBeHelpHead.skin = clientCore.ItemsInfo.getItemIconUrl(this._model.fHelp.headImage);
                this.imgBeHelpHead.width = this.imgBeHelpHead.height = 90;
                this.beHelpNameBg.visible = true;
                this.labName.text = this.labBeHelpName.text = this._model.fHelp.nick;
                this.labBeHelpEffect.visible = this.labBeHelpTime.visible = true;
                this.labHelpTip.visible = false;
                if (this._model.fHelpTime > clientCore.ServerManager.curServerTime) {
                    this.labBeHelpTime.text = "倒计时:" + util.TimeUtil.formatSecToStr(this._model.fHelpTime - clientCore.ServerManager.curServerTime);
                } else {
                    this._model.fHelp = null;
                    this.setHelpUI();
                }
                this.tipBeHelp.skin = "kitchen/imgTip3.png";
                this.labBeHelpEffect.text = "效益：烹饪时间缩短" + xls.get(xls.diningBase).get(1).kitchenHelp + "%";
                if (this.boxMake.visible) {
                    this.aniRole?.dispose();
                    this.aniRole = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(this._model.fGodPray), "idle", true, this.boxMakeAni);
                    this.aniRole.pos(817 + 110, 155 + 410);
                    this.aniRole.scaleX = this.aniRole.scaleY = 1.2;
                    this.labName.pos(817 + 110, 330);
                }
            } else {
                this.onHelp = false;
                this.tipBeHelp.skin = "kitchen/imgTip1.png";
                this.imgBeHelpHead.skin = "kitchen/imgAdd.png";
                this.imgBeHelpHead.width = this.imgBeHelpHead.height = 72;
                this.beHelpNameBg.visible = false;
                this.labName.text = this.labBeHelpName.text = "";
                this.labHelpTip.visible = true;
                this.labBeHelpEffect.visible = this.labBeHelpTime.visible = false;
                if (this.aniRole?.scaleX == 1.2) {
                    this.aniRole.dispose();
                    this.aniRole = clientCore.BoneMgr.ins.play("res/animate/restaurant/chef.sk", "animation", true, this.boxMakeAni);
                    this.aniRole.pos(817 + 110, 155 + 410);
                    this.aniRole.scaleX = this.aniRole.scaleY = 1;
                }
            }
        }

        /**研究相关UI */
        private setCreatUI() {
            this.resetMtrIcon();
            this.checkTarget();
            this.labUpTip.text = "点我看看~";
            this.list.array = this.totalMtr.sort((a: number, b: number) => { return clientCore.ItemsInfo.getItemNum(b) - clientCore.ItemsInfo.getItemNum(a) });
            this.btnTry.visible = this._curMaterials?.length == 5;
            this.btnChange.enableRed = true;
            this.btnChange.onRedChange(util.RedPoint.checkShow([15302, 15303]));
            // this.btnChange.visible = util.RedPoint.checkShow([15302, 15303]);
        }

        /**制作相关UI */
        private setMakeUI() {
            for (let i: number = 1; i <= 3; i++) {
                let limit = _.find(xls.get(xls.diningLevelUp).getValues(), (o) => { return o.stockpot == i });
                if (limit.level > this._model.curLevel) {
                    this["guo" + i].imgClose.visible = this["guo" + i].imgLock.visible = true;
                    this["guo" + i].labLimit.text = limit.level + "级";
                    this["guo" + i].btnStart.visible = this["guo" + i].boxMaking.visible = this["guo" + i].imgOpen.visible = false;
                } else {
                    this["guo" + i].imgLock.visible = false;
                    this.refreashGuo(i);
                }
                BC.addEvent(this, this["guo" + i].btnSpeed, Laya.Event.CLICK, this, this.accMake, [i]);
                BC.addEvent(this, this["guo" + i].btnStart, Laya.Event.CLICK, this, this.startMake, [i]);
                BC.addEvent(this, this["guo" + i].icon, Laya.Event.CLICK, this, this.getFood, [i]);
            }
        }

        /**收获食物 */
        private getFood(idx: number) {
            let data = _.find(this._model.serverWokInfo, (o) => { return o.wokPos == idx });
            if (data.endTime > clientCore.ServerManager.curServerTime) return;
            net.sendAndWait(new pb.cs_gain_kitchen_food_finished({ wokPos: idx })).then((msg: pb.sc_gain_kitchen_food_finished) => {
                this.getReward = msg.items;
                alert.showReward(msg.items , '', { callBack: { caller: this, funArr: [this.showScore]} });
                EventManager.event("ADD_COOK_COUNT", [1, msg.items[0].cnt]);
                let serverInfo = this._model.serverFoodInfo.get(msg.items[0].id);
                serverInfo.counts += msg.items[0].cnt;
                let local = _.find(this._model.serverWokInfo, (o) => { return o.wokPos == msg.wokInfo.wokPos });
                local.id = msg.wokInfo.id;
                local.beginTime = msg.wokInfo.beginTime;
                local.endTime = msg.wokInfo.endTime;
                local.oneTime = msg.wokInfo.oneTime;
                local.total = msg.wokInfo.total;
                this.refreashGuo(idx);
                util.RedPoint.reqRedPointRefresh(15302);
            });
        }

        showScore(){
            var arr:number[] = [3700026 , 3700027 , 3700028 , 3700029];
            var score:number[] = [10 , 20 , 30 , 50]
            let i = arr.indexOf(this.getReward[0].id);
            if( i != -1){
                alert.showFWords("桃运积分+" + score[i]*this.getReward[0].cnt);
            }
        }

        /**开始食物制作 */
        private startMake(idx: number) {
            this.selectMakePanel.show(idx);
        }

        /**加速食物制作 */
        private accMake(idx: number) {
            let data = _.find(this._model.serverWokInfo, (o) => { return o.wokPos == idx });
            if (data.endTime < clientCore.ServerManager.curServerTime) return;
            let configCost = xls.get(xls.diningBase).get(1).speedCost.v2;
            let cost = Math.ceil((data.endTime - clientCore.ServerManager.curServerTime) / 60) * configCost;
            alert.showSmall(`确定消耗${cost}神叶进行加速？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_accelerate_cooking_food_in_kitchen({ wokPos: idx })).then((msg: pb.sc_accelerate_cooking_food_in_kitchen) => {
                            let local = _.find(this._model.serverWokInfo, (o) => { return o.wokPos == msg.wokInfo.wokPos });
                            local.id = msg.wokInfo.id;
                            local.beginTime = msg.wokInfo.beginTime;
                            local.endTime = msg.wokInfo.endTime;
                            local.oneTime = msg.wokInfo.oneTime;
                            local.total = msg.wokInfo.total;
                            this.refreashGuo(idx);
                        });
                    }]
                }
            });
        }

        /**更新锅的状态 */
        private refreashGuo(idx: number) {
            if (this["guo" + idx].imgLock.visible) return;
            let data = _.find(this._model.serverWokInfo, (o) => { return o.wokPos == idx });
            if (data && data.id > 0) {
                if (!this.aniMake) this.aniMake = new util.HashMap();
                this["guo" + idx].boxMaking.visible = this["guo" + idx].imgOpen.visible = true;
                this["guo" + idx].imgClose.visible = this["guo" + idx].btnStart.visible = false;
                this["guo" + idx].icon.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
                let totleTime = data.endTime - data.beginTime;
                let lastTime = data.endTime - clientCore.ServerManager.curServerTime;
                let configCost = xls.get(xls.diningBase).get(1).speedCost.v2;
                if (lastTime > 0) {
                    if (!this.aniMake.has(idx)) {
                        let ani = clientCore.BoneMgr.ins.play("res/animate/restaurant/bowl.sk", "animation2", true, this["guo" + idx].imgOpen);
                        ani.scaleX = ani.scaleY = 0.7;
                        ani.pos(105, 110);
                        this.aniMake.add(idx, ani);
                    }
                    this["guo" + idx].labTime.text = "剩余时间:" + util.TimeUtil.formatSecToStr(lastTime);
                    this["guo" + idx].labAccCost.text = "加速" + Math.ceil(lastTime / 60) * configCost;
                    this["guo" + idx].imgProgress.visible = this["guo" + idx].boxTime.visible = this["guo" + idx].btnSpeed.visible = this["guo" + idx].labAccCost.visible = true;
                    this["guo" + idx].num.visible = false;
                    this["guo" + idx].imgCurPro.width = (totleTime - lastTime) / totleTime * this["guo" + idx].imgProgress.width;
                    this["guo" + idx].labStatus.text = "烹饪中...";
                } else {
                    this["guo" + idx].imgProgress.visible = this["guo" + idx].boxTime.visible = this["guo" + idx].btnSpeed.visible = this["guo" + idx].labAccCost.visible = false;
                    this["guo" + idx].num.value = data.total.toString();
                    this["guo" + idx].num.visible = true;
                    this["guo" + idx].labStatus.text = "制作完成";
                }
            } else {
                this["guo" + idx].btnStart.visible = this["guo" + idx].imgClose.visible = true;
                this["guo" + idx].boxMaking.visible = this["guo" + idx].imgOpen.visible = false;
            }
        }

        /**添加研制的食材 */
        private addMaterial(id: number) {
            core.SoundManager.instance.playSound('res/sound/stand.ogg');
            if (!this._curMaterials) this._curMaterials = [];
            if (clientCore.ItemsInfo.getItemNum(id) == 0) {
                alert.showFWords("当前背包中没有该种食材");
                return;
            }
            let idx = this._curMaterials.indexOf(id);
            if (idx >= 0) {
                this.onIconClick(idx + 1);
                return;
            }
            let pos = this._curMaterials.indexOf(0);
            if (pos < 0) pos = this._curMaterials.length;
            if (pos >= 5) return;
            this._curMaterials[pos] = id;
            this.list.refresh();
            this["icon_" + (pos + 1)].skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this["btnAdd" + (pos + 1)].visible = false;
            //检查成功率
            if (!this.allTarget) this.allTarget = [];
            let mtr = this._model.materialXls.get(id);
            if (mtr) {
                for (let i: number = 0; i < mtr.food.length; i++) {
                    if (this._model.serverFoodInfo.has(mtr.food[i])) continue;
                    let idx = _.findIndex(this.allTarget, (o) => { return o.v1 == mtr.food[i] });
                    if (idx < 0) {
                        let newTarget = new xls.pair();
                        newTarget.v1 = mtr.food[i];
                        newTarget.v2 = 1;
                        this.allTarget.push(newTarget);
                    } else {
                        this.allTarget[idx].v2++;
                    }
                }
            }
            this.checkTarget();
        }

        private onIconClick(idx: number) {
            core.SoundManager.instance.playSound('res/sound/stand.ogg');
            if (!this._curMaterials || !this._curMaterials[idx - 1]) {
                alert.showFWords("请点击列表中的材料进行添加~");
                return;
            }
            this.btnTry.visible = false;
            /**取消研制的食材 */
            let id = this._curMaterials[idx - 1];
            this._curMaterials[idx - 1] = 0;
            this.list.refresh();
            this["icon_" + idx].skin = "";
            this["btnAdd" + idx].visible = true;
            //检查成功率
            let mtr = this._model.materialXls.get(id);
            if (mtr) {
                for (let i: number = 0; i < mtr.food.length; i++) {
                    let idx = _.findIndex(this.allTarget, (o) => { return o.v1 == mtr.food[i] });
                    idx >= 0 && this.allTarget[idx].v2--;
                }
            }
            this.checkTarget();
        }
        private rightDes: string[] = [
            "据我的经验，成功的几率为<font color='#dc143c'>0</font>",
            "据我的经验，成功的几率不足<font color='#dc143c'>10%</font>…",
            "<font color='#dc143c'>20%</font>的概率，只能说可以试试…",
            "<font color='#dc143c'>30%</font>的成功率，失败也算成功之母嘛",
            "<font color='#dc143c'>50%</font>的成功率，看起来离成功很接近",
            "不错，万全的准备，不过也需要点运气~"
        ];
        /**检查成功率 */
        private checkTarget() {
            if (!this._curMaterials) this._curMaterials = [];
            let trueMtr = _.filter(this._curMaterials, (o) => { return o > 0 });
            if (trueMtr.length < 5) {
                this.labRightTip.innerHTML = "放入<font color='#dc143c'>5种</font>材料尝试研究食谱吧~";
                return;
            }
            if (this._model.serverFoodInfo.length == xls.get(xls.diningRecipe).length) {
                this.labRightTip.innerHTML = "所有菜谱都研究出来了";
                this.btnTry.visible = false;
                return;
            }
            this.btnTry.visible = trueMtr.length == 5;
            this.allTarget.sort((a: xls.pair, b: xls.pair) => { return b.v2 - a.v2 });
            if (this.allTarget.length == 0) {
                this.labRightTip.innerHTML = this.rightDes[0];
            } else {
                this.labRightTip.innerHTML = this.rightDes[this.allTarget[0].v2];
            }
        }
        private iconPos = [[340, 243], [457, 115], [603, 154], [751, 110], [867, 236]];
        /**进行食谱研究 */
        private async tryCooking() {
            core.SoundManager.instance.playSound('res/sound/stand.ogg');
            if (!this._curMaterials || this._curMaterials.length < 5) {
                alert.showFWords("请放入足够的食材~");
                return;
            }
            this.mouseEnabled = false;
            let trueMtr = _.filter(this._curMaterials, (o) => { return o > 0 });
            let trueIng = _.filter(this.ingredientPanel._curIngredient, (o) => { return o > 0 });
            let targetId: number = this.allTarget.length > 0 ? this.allTarget[0].v1 : 0;
            net.sendAndWait(new pb.cs_conduct_trial_for_recipe({ id: targetId, itemIds: trueMtr, extraIds: trueIng })).then((msg: pb.sc_conduct_trial_for_recipe) => {
                if (msg.result == 0) {
                    EventManager.event("ADD_COOK_COUNT", [0, 1]);
                    this._model.serverFoodInfo.add(this.allTarget[0].v1, new pb.RecipeInfo({ id: this.allTarget[0].v1, counts: 0 }));
                }
                this.ani1.play(0, false);
                this.ani1.once(Laya.Event.COMPLETE, this, () => {
                    this.imgGuo.visible = false;
                    this.boxMtr.visible = false;
                    this.aniCreat = clientCore.BoneMgr.ins.play("res/animate/restaurant/bowl.sk", "animation", false, this.boxCreatAni);
                    this.aniCreat.pos(this.imgGuo.x + 285, this.imgGuo.y + 290);
                    this.aniCreat.once(Laya.Event.COMPLETE, this, () => {
                        this.aniCreat.dispose();
                        this.aniCreat = null;
                        this.imgGuo.visible = this.boxMtr.visible = true;
                        let id = 0;
                        if (msg.result == 0) {
                            id = this.allTarget[0].v1;
                            this._model.serverFoodInfo.add(id, new pb.RecipeInfo({ id: id, counts: 0 }));
                        } else {
                            id = msg.items[0].id;
                        }
                        this.resultPanel.show(msg.result, id);
                        this.allTarget = [];
                        this._curMaterials = [];
                        this.resetMtrIcon();
                        this.ingredientPanel.onCreatBack();
                        this.btnTry.visible = false;
                        this.labUpTip.text = "点我看看~";
                        this.labRightTip.innerHTML = "放入<font color='#dc143c'>5种</font>材料尝试研究食谱吧~";
                        this.list.array = this.totalMtr.sort((a: number, b: number) => { return clientCore.ItemsInfo.getItemNum(b) - clientCore.ItemsInfo.getItemNum(a) });
                        this.mouseEnabled = true;
                    })
                })
            }).catch(() => {
                this.mouseEnabled = true;
            });
        }

        private resetMtrIcon() {
            for (let i: number = 1; i <= 5; i++) {
                this["icon_" + i].skin = "";
                this["btnAdd" + i].visible = true;
                this["icon_" + i].pos(this.iconPos[i - 1][0], this.iconPos[i - 1][1]);
                this["icon_" + i].scale(1, 1);
                this["icon_" + i].visible = true;
            }
        }

        /**打开食谱 */
        private openBook() {
            this.foodBookPanel.show();
        }

        /**打开辅料面板 */
        private openIngredientPanel() {
            this.ingredientPanel.show();
        }

        /**切换制作和研究界面 */
        private changeView() {
            this.aniRole?.dispose();
            this.boxCreat.visible = !this.boxCreat.visible;
            this.boxMake.visible = !this.boxMake.visible;
            // this.imgMakeRed.visible = false;
            if (this.boxCreat.visible) {
                this.imgChange.skin = "kitchen/T_y_qianwangzhizuo.png";
                this.btnBook.y = 355;
                this.btnShop.y = 473;
                this.aniRole = clientCore.BoneMgr.ins.play("res/animate/restaurant/chef.sk", "animation", true, this.boxCreatAni);
                this.aniRole.pos(1057 + 110, 173 + 410);
                this.aniRole.scaleX = this.aniRole.scaleY = 1;
                this.list.array = this.totalMtr.sort((a: number, b: number) => { return clientCore.ItemsInfo.getItemNum(b) - clientCore.ItemsInfo.getItemNum(a) });
                this.btnChange.enableRed = true;
                this.btnChange.onRedChange(util.RedPoint.checkShow([15302, 15303]));
            } else {
                this.btnChange.onRedChange(false);
                this.btnChange.enableRed = false;
                this.imgChange.skin = "kitchen/T_y_peifangyanjiu.png";
                this.btnBook.y = 455;
                this.btnShop.y = 573;
                if (this._model.fHelp) {
                    this.aniRole = clientCore.BoneMgr.ins.play(pathConfig.getRoleBattleSk(this._model.fGodPray), "idle", true, this.boxMakeAni);
                    this.aniRole.pos(817 + 110, 155 + 410);
                    this.aniRole.scaleX = this.aniRole.scaleY = 1.2;
                } else {
                    this.aniRole = clientCore.BoneMgr.ins.play("res/animate/restaurant/chef.sk", "animation", true, this.boxMakeAni);
                    this.aniRole.pos(817 + 110, 155 + 410);
                    this.aniRole.scaleX = this.aniRole.scaleY = 1;
                }
            }
        }

        /**打开商店 */
        private goShopping() {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.ModuleManager.open("commonShop.CommonShopModule", 7, { openWhenClose: "restaurant.RestaurantModule" });
        }

        /**打开制作面板 */
        private openMakePanel(foodId: number, guo: number) {
            this.foodMakePanel.show(foodId, guo);
        }

        /**开始给好友帮厨 */
        private startHelp(msg: pb.sc_kitchen_help_cooking_food_notify) {
            if (msg.type == 1) {
                this._model.bHelpF = _.find(clientCore.FriendManager.instance.friendList, (o) => { return o.userBaseInfo.userid == msg.uid }).userBaseInfo;
                this._model.helpTimeBegin = msg.bTime;
                this._model.helpTimeEnd = msg.eTime;
            } else if (msg.uid == this._model.fHelp.userid) {
                this._model.fHelp = null;
                this._model.fHelpTime = 0;
            }
            this.setHelpUI();
        }

        /**邀请好友帮厨 */
        private invitFriend() {
            if (this._model.fHelp) return;
            this.friendHelpPanel.show();
        }

        /**结束帮厨 */
        private overHelp() {
            net.sendAndWait(new pb.cs_kitchen_help_cooking_food({ type: 2, uid: this._model.bHelpF.userid })).then((msg: pb.sc_kitchen_help_cooking_food) => {
                alert.showReward(msg.items);
                this._model.bHelpF = undefined;
                this._model.helpTimeEnd = this._model.helpTimeBegin = 0;
                this.setHelpUI();
                util.RedPoint.reqRedPointRefresh(15303);
            });
        }

        /**查看当前帮厨奖励 */
        private checkCurHelpReward() {
            let xlsData = xls.get(xls.diningBase).get(1).kitchenHelpAward;
            let count = Math.floor((clientCore.ServerManager.curServerTime - this._model.helpTimeBegin) / 1800);
            if (count == 0) {
                alert.showFWords("还未获得奖励~");
                return;
            }
            let reward = [];
            for (let i: number = 0; i < xlsData.length; i++) {
                let newRwd = new xls.pair();
                newRwd.v1 = xlsData[i].v1;
                newRwd.v2 = xlsData[i].v2 * count;
                reward.push(newRwd);
            }
            clientCore.ModuleManager.open("panelCommon.RewardShowModule", { reward: clientCore.GoodsInfo.createArray(reward), info: "" });
        }

        private onCloseClick() {
            this.destroy();
            if (!clientCore.ModuleManager.checkModuleOpen("restaurant.RestaurantModule")) {
                 clientCore.ModuleManager.open("restaurant.RestaurantModule");
             }
        }

        /**显示制作页面 */
        private showMakeView() {
            if (this.boxMake.visible) return;
            this.changeView();
        }

        /**检查辅料 */
        private checkIngredient() {
            let trueIng = _.filter(this.ingredientPanel._curIngredient, (o) => { return o > 0 });
            if (trueIng.length > 0) this.labUpTip.text = "本次研究成功率提高~";
            else this.labUpTip.text = "点我看看~";
        }

        addEventListeners() {
            net.listen(pb.sc_kitchen_help_cooking_food_notify, this, this.startHelp);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onCloseClick);
            for (let i: number = 1; i < 6; i++) {
                BC.addEvent(this, this["icon_" + i], Laya.Event.CLICK, this, this.onIconClick, [i]);
            }
            BC.addEvent(this, this.btnTry, Laya.Event.CLICK, this, this.tryCooking);
            BC.addEvent(this, this.btnBook, Laya.Event.CLICK, this, this.openBook);
            BC.addEvent(this, this.btnShop, Laya.Event.CLICK, this, this.goShopping);
            BC.addEvent(this, this.btnIngredient, Laya.Event.CLICK, this, this.openIngredientPanel);
            BC.addEvent(this, this.btnChange, Laya.Event.CLICK, this, this.changeView);
            BC.addEvent(this, this.btnOverHelp, Laya.Event.CLICK, this, this.overHelp);
            BC.addEvent(this, this.imgBeHelpHead, Laya.Event.CLICK, this, this.invitFriend);
            BC.addEvent(this, this.imgHelpReward, Laya.Event.CLICK, this, this.checkCurHelpReward);
            EventManager.on("GO_MAKE_FOOD", this, this.openMakePanel);
            EventManager.on("REFRESH_WOK_INFO", this, this.refreashGuo);
            EventManager.on("REFRESH_HELP_INFO", this, this.setHelpUI);
            EventManager.on("OPEN_MAKE_VIEW", this, this.showMakeView);
            EventManager.on("CHECK_INGREDIENT", this, this.checkIngredient);
        }

        removeEventListeners() {
            Laya.timer.clear(this, this.secondDo);
            net.unListen(pb.sc_kitchen_help_cooking_food_notify, this, this.startHelp);
            BC.removeEvent(this);
            EventManager.offAllCaller(this);
        }

        destroy() {
            EventManager.event("ON_KITCHEN_OPEN_CLOSE", true);
            if (this.aniMake) {
                for (let i = 1; i <= 3; i++) {
                    this.aniMake.get(i)?.dispose();
                }
                this.aniMake.clear();
                this.aniMake = null;
            }
            this.aniCreat?.dispose();
            this.aniRole?.dispose();
            this.aniCreat = this.aniRole = null;
            this.ingredientPanel?.destroy();
            this.foodBookPanel?.destroyData();
            this.foodBookPanel = this.ingredientPanel = this._curMaterials = null;
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            super.destroy();
        }
    }
}