namespace welcomeBack {
    enum step {
        talk,
        event,
        suit,
        gift,
        share,
        max
    }
    export class WelcomeBackModule extends ui.welcomeBack.WelcomeBackModuleUI {
        /**key为套装id */
        private localInfo: util.HashMap<{ name: string, femalePos: number[], malePos: number[], goodsId: number }>;
        /**商品id */
        private goodsId: number[];
        /**展示套装id */
        private suitId: number[] = [2110034, 2110012, 2110002, 2100180, 2110001, 2110033, 2100014, 2100207, 2110027, 2100093, 2100191];
        /**所有服装 */
        private suitItem: ui.welcomeBack.render.BackSuitRenderUI[];
        /**所有服装动画 */
        private suitAni: clientCore.Bone[];
        /**当前步骤 */
        private curStep: number;
        private eventAni: clientCore.Bone;
        /**步骤对应文案 */
        private stepStr: string[][] = [
            ["欢迎回家！"],
            ["你不在的时候，我们经历了这些事呢~"],
            ["你还错过了这些套装哦~"],
            ["不过，既然你回来了，那么久选一件作为露露的礼物吧！"],
            ["对了对了！为了庆祝你回来了，露露还为你的朋友们准备了礼物哦~", "大家都在等你呢~以后也请一直一直留下来哦~"]
        ];
        init(data: any) {
            this.setLocalInfo();
            this.goodsId = [];
            for (let i: number = 2225; i <= 2232; i++) {
                this.goodsId.push(i);
            }
            this.curStep = step.talk;
            this.addPreLoad(xls.load(xls.eventExchange));
            this.addPreLoad(xls.load(xls.suits));
            this.addPreLoad(res.load("res/animate/welcomeBack/click.png"));
            this.addPreLoad(res.load("res/animate/welcomeBack/exhibition.png"));
            this.panel.hScrollBarSkin = "";
            this.panel.visible = false;
        }

        onPreloadOver() {
            this.eventAni = clientCore.BoneMgr.ins.play("res/animate/welcomeBack/exhibition.sk", "animation", true, this);
            this.eventAni.pos(890, 370);
            this.creatSuitItem();
            this.showStepUI();
        }

        /**创建服装item */
        private creatSuitItem() {
            this.imgMask.visible = false;
            this.suitItem = [];
            for (let i: number = 0; i < this.suitId.length; i++) {
                let item = new ui.welcomeBack.render.BackSuitRenderUI();
                this.setItemInfo(item, this.suitId[i]);
                this.suitItem.push(item);
                if (this.localInfo.get(this.suitId[i]).goodsId > 0) {
                    this.boxSend.addChild(item);
                } else {
                    this.boxNosend.addChild(item);
                }
                item.pos(i * 217, 0);
            }
            this.imgMask.width = this.suitId.length * 217 + 50;
        }

        /**本地数据 */
        private setLocalInfo() {
            this.localInfo = new util.HashMap();
            this.localInfo.add(2110034, { name: "hhzy", femalePos: [151, 342], malePos: [155, 345], goodsId: 2227 });
            this.localInfo.add(2110012, { name: "mdjxs", femalePos: [140, 336], malePos: [154, 340], goodsId: 2226 });
            this.localInfo.add(2110002, { name: "mfwo", femalePos: [144, 319], malePos: [151, 342], goodsId: 2231 });
            this.localInfo.add(2100180, { name: "qykh", femalePos: [137, 385], malePos: [138, 345], goodsId: 0 });
            this.localInfo.add(2110001, { name: "roszm", femalePos: [145, 345], malePos: [146, 345], goodsId: 2232 });
            this.localInfo.add(2110033, { name: "thsyc", femalePos: [146, 345], malePos: [156, 327], goodsId: 2230 });
            this.localInfo.add(2100014, { name: "tlgl", femalePos: [149, 322], malePos: [154, 322], goodsId: 2228 });
            this.localInfo.add(2110027, { name: "txxz", femalePos: [150, 318], malePos: [159, 321], goodsId: 2229 });
            this.localInfo.add(2100207, { name: "xmox", femalePos: [136, 324], malePos: [139, 323], goodsId: 0 });
            this.localInfo.add(2100093, { name: "xyqd", femalePos: [147, 337], malePos: [147, 327], goodsId: 2225 });
            this.localInfo.add(2100191, { name: "ysjl", femalePos: [140, 325], malePos: [144, 295], goodsId: 0 });
        }

        /**进行下一步 */
        private next(e: Laya.Event) {
            if (this.curStep == step.gift) return;
            if (!e || e.type == Laya.Event.CLICK) {
                if (this.stepStr[this.curStep].length > 0) {
                    this.labTalk.text = this.stepStr[this.curStep].shift();
                    return;
                }
                this.curStep++;
                if (this.curStep == step.max) {
                    clientCore.ModuleManager.closeAllOpenModule();
                    if(!alert.checkAge()) clientCore.ModuleManager.open("chat.ChatModule", { chatType: 4 });
                    return;
                }
                this.showStepUI();
            }
        }

        /**展示当前UI */
        private showStepUI() {
            if (this.curStep == step.talk || this.curStep == step.share) {
                this.bgTalk.pos(900, 90);
                this.bgTalk.scaleX = this.labTalk.scaleX = 1;
                this.imgNpc.x = 400;
            } else {
                this.bgTalk.pos(150, 10);
                this.bgTalk.scaleX = this.labTalk.scaleX = -1;
                this.imgNpc.x = 0;
            }
            this.imgTip.visible = this.curStep != step.share;
            this.boxTip2.visible = !this.imgTip.visible;
            this.imgEvent.visible = this.curStep == step.event;
            this.eventAni.visible = false;
            this.labTalk.text = this.stepStr[this.curStep].shift();
            if (this.curStep == step.suit) {
                this.panel.visible = true;
            } else if (this.curStep == step.gift) {
                this.screenGift();
            } else {
                this.panel.visible = false;
                if (this.curStep == step.event) {
                    this.mouseEnabled = false;
                    this.ani1.play(0, false);
                    this.ani1.once(Laya.Event.COMPLETE, this, () => {
                        this.eventAni.visible = true;
                        this.mouseEnabled = true;
                    })
                }
            }
        }

        /**筛选可赠送套装 */
        private async screenGift() {
            this.mouseEnabled = false;
            let aniArr: clientCore.Bone[] = [];
            let temp1 = [];
            let temp2 = [];
            this.imgMask.visible = true;
            for (let i: number = 0; i < this.suitItem.length; i++) {
                if (this.suitItem[i].dataSource > 0) {
                    let ani = clientCore.BoneMgr.ins.play("res/animate/welcomeBack/click.sk", "animation", true, this.suitItem[i]);
                    ani.pos(210, 370);
                    aniArr.push(ani);
                    temp1.push(this.suitItem[i]);
                } else {
                    temp2.push(this.suitItem[i]);
                }
            }
            await util.TimeUtil.awaitTime(1000);
            for (let k: number = 0; k < temp2.length; k++) {
                temp2[k].visible = false;
                temp2[k].x = 0;
            }
            for (let j: number = 0; j < temp1.length; j++) {
                Laya.Tween.to(temp1[j], { x: j * 217 }, 1000);
            }
            await util.TimeUtil.awaitTime(1000);
            this.imgMask.width = temp1.length * 217 + 50;
            this.imgMask.visible = false;
            this.panel.scrollTo(0);
            this.panel.refresh();
            for (let m: number = 0; m < temp1.length; m++) {
                aniArr[m].dispose();
            }
            for (let n: number = 0; n < temp1.length; n++) {
                let xlsConfig = xls.get(xls.eventExchange).get(temp1[n].dataSource);
                this.setItemInfo(temp1[n], xlsConfig.femaleProperty[0].v1);
            }
            aniArr = null;
            temp1 = null;
            temp2 = null;
            this.mouseEnabled = true;
        }

        /**免费获得套装 */
        private getSuit(id: number) {
            let suitId = xls.get(xls.eventExchange).get(id).femaleProperty[0].v1;
            let suitName = xls.get(xls.suits).get(suitId).name;
            alert.showSmall(`确认选择${suitName}作为你的回归奖励吗？`, {
                callBack: {
                    caller: this, funArr: [() => {
                        net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_get_reward({ type: 1, giftId: id })).then((data: pb.sc_watch_and_pick_up_the_light_get_reward) => {
                            let arr: pb.IItem[] = [];
                            let cloths = clientCore.SuitsInfo.getSuitInfo(data.item[0].id).clothes;
                            for (let i: number = 0; i < cloths.length; i++) {
                                let item = new pb.Item();
                                item.id = cloths[i];
                                item.cnt = 1;
                                arr.push(item);
                            }
                            alert.showReward(arr);
                            this.curStep++;
                            this.showStepUI();
                            clientCore.MedalManager.setMedal([{ id: MedalConst.WELCOME_BACK_OPEN, value: 1 }]);
                        })
                    }]
                }
            })
        }

        /**服装展示 */
        private setItemInfo(item: ui.welcomeBack.render.BackSuitRenderUI, suitId: number) {
            let localConfig = this.localInfo.get(suitId);
            item.dataSource = localConfig.goodsId;
            item.boxInfo.visible = this.curStep == step.gift && localConfig.goodsId > 0;
            if (item.boxInfo.visible) {
                let xlsConfig = xls.get(xls.eventExchange).get(localConfig.goodsId);
                item.imgName.skin = "welcomeBack/name_" + localConfig.name + ".png";
                BC.addEvent(this, item.btnTry, Laya.Event.CLICK, this, this.previewSuit, [xlsConfig.femaleProperty[0].v1]);
                BC.addEvent(this, item.btnWant, Laya.Event.CLICK, this, this.getSuit, [localConfig.goodsId]);
            }
            let pos = clientCore.LocalInfo.sex == 1 ? localConfig.femalePos : localConfig.malePos;
            item.imgSuit.skin = `unpack/welcomeBack/img_${localConfig.name}_${clientCore.LocalInfo.sex}.png`;
            item.imgSuit.pos(pos[0], pos[1]);
        }

        /**预览套装 */
        private previewSuit(id: number) {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', id);
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.next);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.localInfo.clear();
            this.localInfo = null;
            for (let i: number = 0; i < this.suitItem.length; i++) {
                this.suitItem[i].destroy();
            }
            this.suitItem = null;
        }
    }
}