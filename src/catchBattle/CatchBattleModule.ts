namespace catchBattle {
    /**
     * 接东西对战
     * catchBattle.CatchBattleModule
     */
    export class CatchBattleModule extends ui.catchBattle.CatchBattleModuleUI {
        private gameFrame: number = 0;
        private onGame: boolean;
        private onSerching: boolean;
        private nextItemIdx: number = 0;
        private roleSpeed: number = 5;
        private itemSpeed: number = 5;
        private itemPool: Laya.Image[];
        private onShowItem: util.HashMap<number>;//key 是cakeInfo的索引，value是itemPool的索引
        private cakeInfo: pb.IcakeInfo[];
        private selfPoint: number = 0;
        private otherPoint: number = 0;
        private selfSleep: boolean = false;
        private otherSleep: boolean = false;
        private otherInfo: pb.IuserInfo;
        private actionCache: pb.IcakeOnceInfo[];

        private selfAni: clientCore.Bone;
        private otherAni: clientCore.Bone;
        onPreloadOver() {
            this.imgHeadSelf.skin = clientCore.LocalInfo.headImgUrl;
            this.LabNameSelf.text = clientCore.LocalInfo.userInfo.nick;
            this.roleSelf.imgSelf.visible = true;
            this.selfAni = clientCore.BoneMgr.ins.play(`unpack/catchBattle/player${clientCore.LocalInfo.sex == 1 ? "F" : "M"}.sk`, 2, true, this.roleSelf.imgRole);
            this.selfAni.scaleX = -1;
            this.labTime.text = "倒计时:" + 60;
        }

        popupOver() {
            clientCore.DialogMgr.ins.open(new GameReadyPanel());
            this.onSerching = true;
        }

        private onLeftClick() {
            if (!this.onGame) return;
            if (this.selfSleep) return;
            if (this.roleSelf.scaleX == -1) return;
            this.roleSelf.scaleX = -1;
            this.sendActionToServer(this.roleSelf.x, 1, 2);
        }

        private onRightClick() {
            if (!this.onGame) return;
            if (this.selfSleep) return;
            if (this.roleSelf.scaleX == 1) return;
            this.roleSelf.scaleX = 1;
            this.sendActionToServer(this.roleSelf.x, 1, 0);
        }

        private onFrame() {
            if (!this.onGame) return;
            this.gameFrame++;
            this.labTime.text = "倒计时:" + Math.ceil((3000 - this.gameFrame) / 50);
            //检查缓存操作
            this.checkActionCache();
            //判断游戏时间
            if (this.gameFrame >= 3000) {//时间结束
                this.onTimeOver();
            }
            //角色移动
            if (!this.selfSleep) {
                this.roleSelf.x += this.roleSelf.scaleX * this.roleSpeed;
                this.roleSelf.x = _.clamp(this.roleSelf.x, 0, 954);
            }
            if (!this.otherSleep) {
                this.roleOther.x += this.roleOther.scaleX * this.roleSpeed;
                this.roleOther.x = _.clamp(this.roleOther.x, 0, 954);
            }
            //道具下落
            if (this.itemPool) {
                for (let i = 0; i < this.itemPool.length; i++) {
                    if (this.itemPool[i].visible) {
                        this.itemPool[i].y += this.itemSpeed;
                        if (this.checkGetItem(this.itemPool[i].x, this.itemPool[i].y, this.roleSelf.x)) {
                            let index = this.removeShowItem(i);
                            this.onGetItem(clientCore.LocalInfo.uid, index);
                            this.sendActionToServer(this.roleSelf.x, 2, index);
                        } else if (this.itemPool[i].y > 750) {
                            this.removeShowItem(i);
                        }
                    }
                }
            }
            //检查生成道具
            if (this.nextItemIdx < this.cakeInfo.length) {
                if (this.gameFrame >= this.cakeInfo[this.nextItemIdx].frame) {
                    let itemIdx = this.getItemImg(this.cakeInfo[this.nextItemIdx].type);
                    this.itemPool[itemIdx].pos(954 * this.cakeInfo[this.nextItemIdx].pos / 100, 0);
                    this.itemPool[itemIdx].visible = true;
                    this.onShowItem.add(this.nextItemIdx, itemIdx);
                    this.nextItemIdx++;
                }
            }
        }

        private sendActionToServer(pos: number, action: number, param: number) {
            net.send(new pb.cs_cake_once_over({ uidList: [clientCore.LocalInfo.uid, this.otherInfo.uid], frame: this.gameFrame, pos: pos, action: action, param: param }));
        }

        private onTimeOver() {
            this.onGame = false;
            let result = 2;
            if (this.selfPoint > this.otherPoint) result = 1;
            else if (this.selfPoint < this.otherPoint) result = 0;
            net.send(new pb.cs_cake_game_over({ uidList: [clientCore.LocalInfo.uid, this.otherInfo.uid], status: result, num: this.selfPoint }));
        }

        private removeShowItem(idx: number) {
            this.itemPool[idx].visible = false;
            let index = this.onShowItem.getValues().indexOf(idx);
            let key = parseInt(this.onShowItem.getKeys()[index]);
            this.onShowItem.remove(key);
            return key;
        }

        private getItemImg(type: number) {
            if (!this.itemPool) this.itemPool = [];
            for (let i = 0; i < this.itemPool.length; i++) {
                if (!this.itemPool[i].visible) {
                    this.itemPool[i].skin = this.getItemUrl(type);
                    return i;
                }
            }
            let img = new Laya.Image(this.getItemUrl(type));
            img.anchorX = 0.5;
            img.anchorY = 1;
            img.visible = false;
            this.boxGame.addChild(img);
            this.itemPool.push(img);
            return this.itemPool.length - 1;
        }

        private getItemUrl(type: number) {
            return `catchBattle/item_${type}.png`;
        }

        private checkGetItem(itemX: number, itemY: number, roleX: number) {
            return Math.abs(itemX - roleX) < 58 && itemY >= 565 && itemY <= 595;
        }

        private onGetItem(uid: number, index: number) {
            let item = this.cakeInfo[index];
            if (!item) return;
            if (uid == clientCore.LocalInfo.uid) {
                if (item.type == 1) {
                    this.selfSleep = true;
                    this.selfAni.play(1, false, Laya.Handler.create(this, () => {
                        this.selfAni.play(2, true);
                        this.selfSleep = false;
                    }))
                    Laya.timer.once(2000, this, () => { this.selfSleep = false })
                } else {
                    this.selfAni.play(0, false, Laya.Handler.create(this, () => {
                        this.selfAni.play(2, true);
                    }))
                    let point = [1, 3, 5][item.type - 2];
                    this.creatPointTip(this.roleSelf.x, point);
                    this.selfPoint += point;
                    this.labPointSelf.text = this.selfPoint.toString();
                }
            } else {
                if (item.type == 1) {
                    this.otherSleep = true;
                    this.otherAni.play(1, false, Laya.Handler.create(this, () => {
                        this.otherAni.play(2, true);
                        this.otherSleep = false;
                    }))
                    Laya.timer.once(2000, this, () => { this.otherSleep = false })
                } else {
                    this.otherAni.play(0, false, Laya.Handler.create(this, () => {
                        this.otherAni.play(2, true);
                    }))
                    let point = [1, 3, 5][item.type - 2];
                    this.creatPointTip(this.roleOther.x, point);
                    this.otherPoint += point;
                    this.labPointOther.text = this.otherPoint.toString();
                    // if (this.onShowItem.get(index)) {
                    //     let itemIdx = this.onShowItem.remove(index);
                    //     this.itemPool[itemIdx].visible = false;
                    // }
                }
            }
        }

        private creatPointTip(pos: number, point: number) {
            let tip = new Laya.Label("+" + point);
            tip.fontSize = 26;
            tip.color = "#ea8f24";
            tip.stroke = 3;
            tip.strokeColor = "#ffffff";
            this.boxGame.addChild(tip);
            tip.pos(pos, 580);
            Laya.Tween.to(tip, { y: 550 }, 1000, null, Laya.Handler.create(this, () => {
                tip.destroy();
            }))
        }

        private onGetOther(msg: pb.sc_pvp_match_user_notify) {
            this.otherInfo = msg.UserInfo[0];
            this.imgHeadOther.skin = clientCore.ItemsInfo.getItemIconUrl(this.otherInfo.image);
            this.labNameOther.text = this.otherInfo.nickName;
            this.otherAni = clientCore.BoneMgr.ins.play(`unpack/catchBattle/player${this.otherInfo.sex == 1 ? "F" : "M"}.sk`, 2, true, this.roleOther.imgRole);
            this.otherAni.scaleX = -1;
            if (this.otherInfo.uid != 0) {//真实玩家
                net.send(new pb.cs_pvp_prepare({ uidList: [clientCore.LocalInfo.uid, this.otherInfo.uid] }));
            }
            this.onSerching = false;
        }

        private onGetCakeInfo(msg: pb.sc_cake_order_notify) {
            this.cakeInfo = msg.CakeInfo;
        }

        private onGameStart() {
            clientCore.DialogMgr.ins.closeAllDialog();
            this.onGame = true;
            this.onShowItem = new util.HashMap();
            Laya.timer.loop(20, this, this.onFrame);
        }

        private checkActionCache() {
            if (this.actionCache) {
                for (let i = 0; i < this.actionCache.length;) {
                    if (this.actionCache[i].frame <= this.gameFrame) {
                        this.doAction(this.actionCache.shift());
                    } else {
                        ++i;
                    }
                }
            }
        }

        private onGetAction(msg: pb.sc_cake_once_over_notify) {
            if (msg.info[0].uid != this.otherInfo.uid) return;
            if (msg.info[0].frame > this.gameFrame) {
                if (!this.actionCache) this.actionCache = [];
                this.actionCache.push(msg.info[0]);
                this.actionCache.sort((a, b) => { return a.frame - b.frame })
                return;
            }
            this.doAction(msg.info[0]);
        }

        private doAction(action: pb.IcakeOnceInfo) {
            if (action.action == 1) {//转向
                this.roleOther.scaleX = 1 - action.param;
                this.roleOther.x = action.pos + (this.gameFrame - action.frame) * this.roleSpeed;
            } else {//得分
                this.onGetItem(action.uid, action.param);
            }
        }

        private onGameOver(msg: pb.sc_cake_game_over_notify) {
            clientCore.DialogMgr.ins.open(new GameOverPanel(msg, this.selfPoint, this.otherPoint, this.otherInfo));
        }

        private onOtherLeave() {
            if (this.onSerching) {
                clientCore.DialogMgr.ins.closeAllDialog();
                this.destroy();
            }
        }

        private onKeyPressDown(e: Laya.Event) {
            switch (e.keyCode) {
                case Laya.Keyboard.A:
                case Laya.Keyboard.LEFT:
                    this.onLeftClick();
                    break;
                case Laya.Keyboard.D:
                case Laya.Keyboard.RIGHT:
                    this.onRightClick();
                    break;
            }
        }

        addEventListeners() {
            net.listen(pb.sc_pvp_match_user_notify, this, this.onGetOther);
            net.listen(pb.sc_pvp_prepare_notify, this, this.onGameStart);
            net.listen(pb.sc_cake_order_notify, this, this.onGetCakeInfo);
            net.listen(pb.sc_cake_game_over_notify, this, this.onGameOver);
            net.listen(pb.sc_pvp_user_offline_notify, this, this.onOtherLeave);
            net.listen(pb.sc_cake_once_over_notify, this, this.onGetAction);
            BC.addEvent(this, this.btnLeft, Laya.Event.CLICK, this, this.onLeftClick);
            BC.addEvent(this, this.btnRight, Laya.Event.CLICK, this, this.onRightClick);
            this.on(Laya.Event.KEY_DOWN, this, this.onKeyPressDown);
            // BC.addEvent(this, this, Laya.Event.KEY_DOWN, this, this.onKeyPressDown);
        }

        removeEventListeners() {
            net.unListen(pb.sc_pvp_match_user_notify, this, this.onGetOther);
            net.unListen(pb.sc_pvp_prepare_notify, this, this.onGameStart);
            net.unListen(pb.sc_cake_order_notify, this, this.onGetCakeInfo);
            net.unListen(pb.sc_cake_game_over_notify, this, this.onGameOver);
            net.unListen(pb.sc_pvp_user_offline_notify, this, this.onOtherLeave);
            net.unListen(pb.sc_cake_once_over_notify, this, this.onGetAction);
            this.off(Laya.Event.KEY_DOWN, this, this.onKeyPressDown);
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.onShowItem?.clear();
            if (this.itemPool) {
                for (let i = 0; i < this.itemPool.length; i++) {
                    this.itemPool[i].destroy();
                }
            }
            this.actionCache = this.onShowItem = this.itemPool = this.cakeInfo = null;
            clientCore.ModuleManager.open("anniversary2022.Anniversary2022Module");
        }
    }
}