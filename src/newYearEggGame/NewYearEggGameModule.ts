namespace newYearEggGame {
    /**
     * 敲蛋小游戏
     * newYearEggGame.NewYearEggGameModule
     */
    export class NewYearEggGameModule extends ui.newYearEggGame.NewYearEggGameModuleUI {

        private _eggArr: Array<Egg> = new Array();
        private _t: time.GTime;
        private _passT: time.GTime; //用于倒计时
        private _totalT: number = 60; //持续时间
        private _flyPool: FlyText[] = [];
        private _source: number;
        private _isOver: boolean;
        private _passTime: number;
        private _showTime: number;
        private itemId: number[] = [9900282,9900286, 9900287, 9900288, 9900289];

        private _model: NewYearEggGameModel;
        private _control: NewYearEggGameControl;

        constructor() {
            super();
        }

        init( ) {
            this.sign = clientCore.CManager.regSign(new NewYearEggGameModel(), new NewYearEggGameControl());
            this._control = clientCore.CManager.getControl(this.sign) as NewYearEggGameControl;
            this._model = clientCore.CManager.getModel(this.sign) as NewYearEggGameModel;
            this.addPreLoad(xls.load(xls.gameWhack));
            this.addPreLoad(xls.load(xls.gameWhackMole));
            this.addPreLoad(res.load('res/animate/eggGame/huabao1.png'));
            this.addPreLoad(res.load('res/animate/eggGame/huabao2.png'));
            this.addPreLoad(res.load('res/animate/eggGame/huabao3.png'));
            this.addPreLoad(res.load('res/animate/eggGame/huabao4.png'));
            
        }

        onPreloadOver(): void {
            this._source = 0;
            for (let i: number = 0; i < 8; i++) {
                let normal: Laya.Image = this['item' + i].getChildByName('normal');
                this._eggArr.push(new Egg(normal));
                BC.addEvent(this, normal, Laya.Event.CLICK, this, this.onClick, [i]);
            }
            for (let i: number = 0; i < 5; i++) {
                this["numTxt" + i].text = clientCore.ItemsInfo.getItemNum(this.itemId[i]) + "";
            }
            this.updateSource(0);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void {
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            _.forEach(this._flyPool, (element) => { element?.destroy(); });
            this._flyPool.length = 0;
            this._t?.dispose();
            this._passT?.dispose();
            this._flyPool = this._passT = this._t = null;
            util.TweenUtils.remove('NewYearEggGameModule');
            _.forEach(this._eggArr, (element) => { element?.dispose(); });
            this._eggArr.length = 0;
            this._eggArr = null;
            super.destroy();
            clientCore.ModuleManager.open("newYearEgg.NewYearEggModule");
        }

        popupOver(): void {
            this._showTime = -1000;
            this._passTime = 0;
            this._t = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 10, this, this.onRandom);
            this._t.start();

            this._passT = time.GTimeManager.ins.getTime(globalEvent.TIME_ON, 1000, this, this.onPassTime);
            this._passT.start();

            this.gameStart();
        }

        private onClose(): void {
            this._t?.stop();
            this._passT?.stop();
            alert.showSmall('是否离开小游戏？现在离开无法获得奖励~', {
                callBack: {
                    funArr: [this.destroy, () => {
                        if (!this._isOver) {
                            this._t?.start();
                            this._passT?.start();
                        }
                    }],
                    caller: this
                }
            })
        }

        private gameStart(): void {
            this._isOver = false;
            this._control.startGame();
        }

        private onRandom(): void {
            let temp = 1;
            if(this._totalT < 20){
                temp = 0.5;
            }else if(this._totalT < 40){
                temp = 0.8;
            }
            if (this._passTime - this._showTime >= 1000 * temp) {
                let array: number[] = [];
                _.forEach(this._model.gameInfo.probability, (element) => {
                    for (let i: number = 0; i < element.v2; i++) { array.push(element.v1); }
                });
                let data: xls.gameWhackMole = this._model.getGameWhackMole(array[_.random(0, array.length - 1)]);
                this._eggArr[_.random(0, 7)].show(data, 1);
                this._showTime = this._passTime;
            }
            this._passTime += 10;
        }

        private onPassTime(): void {
            if (--this._totalT <= 0) {
                this._t?.stop();
                this._passT?.stop();
                this.gameOver();
            }
            this.timeTxt.changeText(this._totalT + '');
        }

        private onClick(index: number): void {
            console.log("click mouse: " + index);
            let egg: Egg = this._eggArr[index];
            let item: Laya.Panel = this['item' + index];
            if (egg && !egg.isHide) {
                this.showHammer(item.x + 103.4, item.y - 48);
                egg.click(this, item.x + item.width / 2, item.y + item.height);
                egg.isHide = true;
                if (egg.source == 0) return;
                this.updateSource(egg.source);
                this.showFlyText(egg.source, item.x + item.width / 2, item.y);
            }
        }

        private showHammer(x: number, y: number): void {
            this.hammerAni.offAll();
            this.hammerAni.visible = true;
            this.hammerAni.play(0, false);
            this.hammerAni.pos(x, y);
            this.hammerAni.once(Laya.Event.COMPLETE, this, () => { this.hammerAni.visible = false; });
        }

        private showFlyText(value: number, x: number, y: number): void {
            let fly: FlyText = this._flyPool.shift() || new FlyText();
            fly.show(value, x, y);
            this.addChild(fly);
            util.TweenUtils.creTween(fly, { y: y - 80, alpha: 0.4 }, 800, null, this, () => {
                fly.removeSelf();
                this._flyPool.push(fly);
            }, 'MouseGameModule');
        }

        private updateSource(value: number): void {
            this._source += value;
            this.numTxt0.changeText(this._source + '');
        }

        private gameOver(): void {
            this._t?.stop();
            this._passT?.stop();
            this._control.overGame(Math.max(this._source , 0));
            super.destroy();
        }
    }
}