namespace hiddenElfGame {
    /**
     * 隐匿的精灵小游戏
     * hiddenElfGame.HiddenElfGameModule
     * 策划案：\\newfiles\Taomee\B01互动游戏事业部\18-风信子项目部\102、策划讨论案--大家直接看\0108\【主活动最新】隐匿的妖精_connie.xlsx
     */
    export class HiddenElfGameModule extends ui.hiddenElfGame.HiddenElfGameModuleUI {

        private _ai: PlayerAI;
        private _elfLayer: Laya.Sprite; //精灵层
        private _layer: Laya.Sprite; //普通层
        private _rocker: Rocker; //摇杆
        private _otherGlass: Laya.Sprite; //其他人的放大镜
        private _glass: Glass;
        private _elf: Laya.Image; //精灵
        private _count: number; //精灵剩余个数
        private _myCount: number;
        private _otherCount: number;
        private _shadow: Laya.Image;

        //以下各种行为时间点
        private _catchTime: number = 0;
        private _ampTime: number = 0;
        private _showTime: number = 0;

        init(): void {
            this.resizeView();
            this._layer = this.createLayer();
            this._elfLayer = this.createLayer();
            //放大镜
            this._glass = new Glass();
            this._glass.init(55, this._layer, this._elfLayer);
            this._glass.pos(this._layer.width / 2, this._layer.height / 2 - 150);
            //摇杆
            this._rocker = new Rocker();
            this._rocker.configure(this._glass);
            //精灵
            this._elf = new Laya.Image();
            this._elfLayer.addChild(this._elf);

            this._myCount = this._otherCount = 0;
            this._count = 10;
            this.initView();
        }
        addEventListeners(): void {
            BC.addEvent(this, this.btnCatch, Laya.Event.CLICK, this, this.onCatch);
            BC.addEvent(this, this.btnAmp, Laya.Event.CLICK, this, this.onAmp);
            BC.addEvent(this, this.btnShow, Laya.Event.CLICK, this, this.onShow);
            BC.addEvent(this, this.btnExit, Laya.Event.CLICK, this, this.onBack);
        }
        removeEventListeners(): void {
            BC.removeEvent(this);
        }
        popupOver(): void {
            //注册虚拟玩家
            this._otherGlass = new Laya.Sprite();
            this._otherGlass.loadImage('hiddenElfGame/fangdajing.png');
            this._layer.addChild(this._otherGlass);

            let id: number = 1410001 + _.random(0, 16);
            let cfg: xls.characterId = xls.get(xls.characterId).get(id);
            this.npcTxt.changeText(cfg.name);
            this.imgNpc.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            //注册AI
            this._ai = new PlayerAI();
            this._ai.init(this._otherGlass);
            //游戏开始
            this.gameStart();
        }
        destroy(): void {
            Laya.timer.clearAll(this);
            util.TweenUtils.over('HiddenElfGameModule');
            this._rocker.dispose();
            this._rocker = null;
            this._ai.dispose();
            this._ai = null;
            this._glass.dispose();
            this._glass = null;
            this._otherGlass.destroy();
            this._otherGlass = null;
            this._shadow?.destroy();
            this._elf.destroy();
            this._layer.destroy();
            this._elfLayer.destroy();
            this._shadow = this._layer = this._elfLayer = this._elf = null;
            super.destroy();
        }

        private createLayer(): Laya.Sprite {
            let sp: Laya.Sprite = new Laya.Sprite();
            sp.x = -clientCore.LayerManager.OFFSET;
            sp.y = 150;
            sp.size(Laya.stage.width, Laya.stage.height - 150);
            this.addChildAt(sp, 0);
            return sp;
        }

        private resizeView(): void {
            let len: number = this.numChildren;
            for (let i: number = 0; i < len; i++) {
                let sp: Laya.Sprite = this.getChildAt(i) as Laya.Sprite;
                if (sp.x < 436) {
                    sp.x -= clientCore.LayerManager.OFFSET;
                } else if (sp.x >= 964) {
                    sp.x += clientCore.LayerManager.OFFSET
                }
            }
        }

        private initView(): void {
            this.imgHead.skin = clientCore.LocalInfo.headImgUrl;
            this.imgFrame.skin = clientCore.LocalInfo.frameImgUrl;
            this.txtNick.changeText(clientCore.LocalInfo.userInfo.nick);
            this.txtNum.changeText(`当前剩余：${this._count}`);
            this.txtMyCount.changeText(`捕捉：${this._myCount}`);
            this.txtOtherCount.changeText(`捕捉：${this._otherCount}`);
            this.txtShow.changeText(`x${clientCore.ItemsInfo.getItemNum(Config.SHOW_ITEM_ID)}`);
            this.txtAmp.changeText(`x${clientCore.ItemsInfo.getItemNum(Config.AMP_ITEM_ID)}`);
        }

        /** 捕捉*/
        private onCatch(): void {
            let now: number = Laya.Browser.now();
            if (now - this._catchTime < Config.CATCH_CD * 1000) {
                alert.showFWords('捕捉过于频繁，请稍后再试~');
                return;
            }
            this._catchTime = now;
            if (this._glass.intersection(new Laya.Rectangle(this._elf.x, this._elf.y, this._elf.width, this._elf.height))) {
                this._ai.stop();
                this.catchElf(0);
            }
        }

        /** 扩大*/
        private onAmp(): void {
            let now: number = Laya.Browser.now();
            let cd: number = Config.USE_AMP_CD - Math.floor((now - this._ampTime) / 1000);
            if (cd > 0) {
                alert.showFWords(`道具还剩${cd}秒CD时间，请稍后再试~`);
                return;
            }
            if (this._glass.scale == Config.AMP_SCALE) {
                alert.showFWords('正处于放大效果，请稍后再试~');
                return;
            }
            this._ampTime = now;
            this.useItem(Config.AMP_ITEM_ID);
        }

        /** 显影*/
        private onShow(): void {
            if (this._elf && this._elf.visible) {
                let now: number = Laya.Browser.now();
                let cd: number = Config.USE_SHOW_CD - Math.floor((now - this._showTime) / 1000);
                if (cd > 0) {
                    alert.showFWords(`道具还剩${cd}秒CD时间，请稍后再试~`);
                    return;
                }
                if (this._shadow && this._shadow.parent) {
                    alert.showFWords('正在显影，请稍后再试~');
                    return;
                }
                this._showTime = now;
                this.useItem(Config.SHOW_ITEM_ID);
            }
        }

        private showShadow(): void {
            if (!this._shadow) {
                this._shadow = new Laya.Image('hiddenElfGame/effect.png');
                this._shadow.anchorX = this._shadow.anchorY = 0.5;
            }
            if (!this._shadow.parent) {
                this._layer.addChild(this._shadow);
                this._shadow.pos(this._elf.x + this._elf.width / 2, this._elf.y + this._elf.height / 2);
                Laya.timer.once(Config.SHOW_TIME * 1000, this, () => {
                    this._shadow.removeSelf();
                });
            }
        }

        private startOnce(): void {
            this._elf.visible = true;
            this._elf.skin = `hiddenElfGame/yao${_.random(1, 3)}.png`;
            this._elf.pos(_.random(0, this._elfLayer.width - this._elf.width), _.random(0, this._elfLayer.height - this._elf.height));
            this._ai.start(this._layer.width - 146, this._layer.height - 287, _.random(5, 10), new Laya.Point(this._elf.x, this._elf.y), new Laya.Handler(this, () => { this.catchElf(1); }));
        }

        /**
         * 抓住精灵
         * @param type 0-我方 1-对方 
         */
        private catchElf(type: number): void {
            this.txtNum.changeText(`当前剩余：${--this._count}`);
            this._elf.visible = false;
            if (type == 0) {
                this.txtMyCount.changeText(`捕捉：${++this._myCount}`);
                this.fly(this._elf.x, this._elf.y + 150, this._elf.skin);
                alert.showFWords(`${clientCore.LocalInfo.userInfo.nick}成功捕捉到一只妖精`);
                core.SoundManager.instance.playSound(pathConfig.getSoundUrl('bubble'));
            } else {
                this.txtOtherCount.changeText(`捕捉：${++this._otherCount}`);
                alert.showFWords(`${this.npcTxt.text}成功捕捉到一只妖精`);
            }
            this._count > 0 ? this.startOnce() : this.gameOver();
        }

        private fly(x: number, y: number, path: string): void {
            let img: Laya.Image = new Laya.Image(path);
            img.pos(x, y);
            this.addChild(img);
            util.TweenUtils.creTween(img, { x: 66 - clientCore.LayerManager.OFFSET, y: 30, scaleX: 0.5, scaleY: 0.5 }, 1000, Laya.Ease.sineInOut, this, () => { !this._closed && img.destroy(); }, 'HiddenElfGameModule');
        }

        private gameStart(): void {
            net.sendAndWait(new pb.cs_hidden_monster_start()).then(() => {
                this.startOnce();
            }).catch(() => {
                alert.showFWords('进入游戏失败~');
                this.destroy();
                clientCore.ModuleManager.open('hiddenElf.HiddenElfModule');
            })
        }

        private gameOver(): void {
            net.sendAndWait(new pb.cs_hidden_monster_over({ num: this._myCount })).then((msg: pb.sc_hidden_monster_over) => {
                alert.showReward(msg.items);
                this.destroy();
                clientCore.ModuleManager.open('hiddenElf.HiddenElfModule');
            })
        }

        private useItem(id: number): Promise<void> {
            if (clientCore.ItemsInfo.checkHaveItem(id) == false) {
                alert.showFWords('道具不足~');
                this.txtShow.changeText(`x${clientCore.ItemsInfo.getItemNum(Config.SHOW_ITEM_ID)}`);
                this.txtAmp.changeText(`x${clientCore.ItemsInfo.getItemNum(Config.AMP_ITEM_ID)}`);
                return;
            }
            return net.sendAndWait(new pb.cs_hidden_monster_use_prop({ propId: id })).then(() => {
                this.useSuccess(id);
            });
        }

        private useSuccess(id: number): void {
            if (id == Config.AMP_ITEM_ID) {
                this._glass.amp()
                this._rocker.update();
                this.txtAmp.changeText(`x${clientCore.ItemsInfo.getItemNum(Config.AMP_ITEM_ID)}`);
            } else {
                this.showShadow();
                this.txtShow.changeText(`x${clientCore.ItemsInfo.getItemNum(Config.SHOW_ITEM_ID)}`);
            }
        }

        /** 退出游戏*/
        private onBack(): void {
            alert.showSmall('退出后不会获得奖励，是否确认退出当前游戏？', {
                callBack: {
                    caller: this,
                    funArr: [() => {
                        this.destroy();
                        clientCore.ModuleManager.open('hiddenElf.HiddenElfModule');
                    }]
                }
            });
        }
    }
}