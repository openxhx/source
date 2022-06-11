namespace drawReward {
    /**
     * drawReward.DrawClothModule
     */
    export class DrawClothModule extends ui.drawReward.DrawClothModuleUI {
        private _person: clientCore.Person;
        private _played: boolean = false;
        constructor() {
            super();
            this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
            this._person.pos(this.imgPos.x, this.imgPos.y, true);
            this._person.scale(0.7, 0.7);
            let spMask = new Laya.Sprite();
            spMask.graphics.drawCircle(0, 0, 480, '0xffffff');
            this._person.mask = spMask;
            this.boxSuit.visible = false;
            this.boxMain.addChildAt(this._person, 2);

        }

        async init(d: any[]) {
            super.init(d);
            this.show(d);
            if (this.aniBall)
                this.aniBall.visible = false;
            if (this.aniNew)
                this.aniNew.visible = false;
            this.boxAni.visible = true;
            this.boxMain.visible = false;
            await this.waitAniLabel();
            this.boxMain.visible = true;
            await this.waitAniOver();
            this.boxAni.visible = false;
            this.playOtherAni();
        }

        private waitAniLabel() {
            return new Promise((ok) => {
                this.ani1.play(0, false);
                this.ani1.once(Laya.Event.LABEL, this, ok);
            })
        }

        private waitAniOver() {
            return new Promise((ok) => {
                this.ani1.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private playOtherAni() {
            this.txtDecomp.text = '';
            if (!this._played) {
                this._played = true;
                try {
                    if (!this._data[1]) {
                        this.aniNew.visible = true;
                        this.aniNew?.play(0, false);
                    }else{
                        this.txtDecomp.text = `重复获得分解为${this._data[1].name} x${this._data[1].num}`;
                    }
                    this.aniBall.visible = true;
                    this.aniBall?.play(0, false);
                }
                catch (e) {
                    if (this.aniBall)
                        this.aniBall.visible = false;
                    if (this.aniNew)
                        this.aniNew.visible = false;
                }
            }
        }

        show(data) {
            let id = data[0];
            //cloth
            this.imgCloth.skin = clientCore.ItemsInfo.getItemIconUrl(id);
            this.txtName.text = xls.get(xls.itemCloth).get(id)?.name;
            //suit
            let clothInfo = clientCore.ClothData.getCloth(id);
            if (clothInfo) {
                let suidId = clothInfo.suitId;
                let suitInfo = clientCore.SuitsInfo.getSuitInfo(suidId);
                this.txtSuit.text = this.txtSuit1.text = suitInfo.suitInfo.name + '套装';
                this.listStar.repeatX = this.listStar1.repeatX = suitInfo.suitInfo.quality;
                let clothes = suitInfo.clothes;
                let have = _.filter(clothes, (id) => { return clientCore.LocalInfo.checkHaveCloth(id) }).length;
                let total = clothes.length
                this.txtNum.text = have.toString();
                this.txtTotal.text = total.toString();
                //person
                this._person.downAllCloth();
                this._person.upByIdArr(clothes);
                this.imgMask.x = (_.clamp(have / total, 0, 1) - 1) * 242;
                //suit
                this.txtDes.text = suitInfo.suitInfo.describe;
                this.boxDes.visible = suitInfo.suitInfo.describe != '';
            }
        }

        private onClick() {
            if (this.boxAni.visible) {
                this.playOtherAni();
                this.boxAni.visible = false;
                this.boxMain.visible = true;
                return;
            }
            if (this.boxSuit.visible || this._data[1] != undefined) {
                this.destroy();
            }
            else {
                let clothInfo = clientCore.ClothData.getCloth(this._data[0]);
                if (clothInfo) {
                    if (clientCore.SuitsInfo.getSuitInfo(clothInfo.suitId).allGet) {
                        //展示套装收齐面板
                        this.boxSuit.visible = true;
                        this._person.mask = null;
                        this._person.pos(667, 375);
                        this.boxSuit.addChildAt(this._person, 2);

                        this.aniNew1?.play(0, false);
                        this.aniGet?.play(0, false);

                        // this.playBgMovie();
                    }
                    else {
                        this.destroy();
                    }
                }
                else {
                    this.destroy();
                }
            }
        }

        // playBgMovie(){
        //     console.log("start play movie 1111111111111111111111111111");
        //     this.aniBg.alpha = 1;
        //     this.aniBg.play(0, false);
        //     this.aniBg.once(Laya.Event.COMPLETE, this, ()=>{
        //         console.log("tween light start");
        //         Laya.Tween.to(this.aniBg,{alpha:0},500);
        //     });
        //     this.aniLight.play(0,false);
        //     this.aniLight.once(Laya.Event.STOPPED, this, ()=>{
        //         console.log("play again");
        //         this.playBgMovie();
        //     });
        // }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClick);
        }

        removeEventListeners() {
            BC.removeEvent(this)
        }

        destroy() {
            // Laya.Tween.clearAll(this.aniBg);
            // this.aniBg.offAll();
            // this.aniLight.offAll();
            super.destroy();
            this._person?.destroy();
            this._person = null;
        }
    }
}