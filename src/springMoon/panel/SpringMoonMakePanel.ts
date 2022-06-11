namespace springMoon {
    export class MakeKitePanel extends ui.springMoon.panel.MakeKitPanelUI {
        public _loginDay: number;
        public _step: number;
        public _type: number;
        public _color: number;
        private tempChoose: number;
        private rewards: number[];
        initView(loginDay: number, step: number, type: number, color: number) {
            this._loginDay = loginDay;
            this._step = step;
            this._type = type;
            this._color = color;
            this.rewards = clientCore.LocalInfo.sex == 1 ? [9900001, 115278, 133657, 128576] : [9900001, 115287, 133665, 128584];
            for (let i: number = 1; i <= 4; i++) {
                this["icon" + i].skin = clientCore.ItemsInfo.getItemIconUrl(this.rewards[i - 1]);
            }
            this.setUI();
        }


        show() {
            this.setUI();
            clientCore.DialogMgr.ins.open(this, false);
        }

        private setUI() {
            if (this._step == 0) this.imgProgress.width = 0;
            else this.imgProgress.width = this["reward" + this._step].x;
            this.imgOver1.visible = this.imgKite1.visible = this._type == 1;
            this.imgOver2.visible = this.imgKite2.visible = this._type == 2;
            if (this._step > 0) this["imgKite" + this._type].skin = `springMoon/zhi_yuan${this._type}_shang_se${this._color}.png`;
            this.boxOver.visible = this._step == 4;
            this.boxMake.visible = this._step < 4;
            if (this.boxMake.visible) {
                this.diKite.visible = this._step < 3;
                this.boxChoose.visible = this._step < 2 && this._loginDay > this._step;
                this.diChoose3.visible = this._step == 1 && this._loginDay >= 2;
                if (this.boxChoose.visible) {
                    if (this._step == 1) {
                        for (let i: number = 1; i <= 3; i++) {
                            this["iconColor" + i].skin = `springMoon/ys${this._type}_${i}.png`;
                        }
                    }
                    this.iconColor1.visible = this.iconColor2.visible = this.iconColor3.visible = this._step == 1;
                    this.iconKite1.visible = this.iconKite2.visible = this._step == 0;
                }
                let tempStep = this._step < this._loginDay ? this._step + 1 : this._step;
                this.tip.skin = `springMoon/tip_${tempStep}.png`;
                this.curIcon.skin = `springMoon/icon_${tempStep}.png`;
                this.boxNext.visible = this._step < 3 || this._loginDay < 4;
                if (this.boxNext.visible) {
                    this.typeNext.skin = `springMoon/txt_${tempStep + 1}.png`;
                    this.imgNext.skin = (this._step < this._loginDay - 1) ? "springMoon/xia_ge_bu_zhou.png" : "springMoon/ming_ri_kai_qi.png";
                    this.nextIcon.skin = `springMoon/icon_${tempStep + 1}.png`;
                }
                this.btnSure.visible = this._step < this._loginDay;
            }
            for (let i: number = 1; i <= 4; i++) {
                this["imgGot" + i].visible = i <= this._step;
            }
        }

        /**选择 */
        private choose(idx: number) {
            if (this.tempChoose == idx) return;
            if (!this.btnSure.visible) return;
            if (this.tempChoose) this["diChoose" + this.tempChoose].skin = "springMoon/wei_xuan_zhong.png";
            this.tempChoose = idx;
            this["diChoose" + this.tempChoose].skin = "springMoon/xuan_zhong.png";
            if (this._step == 0) {
                this["imgKite" + idx].skin = `springMoon/zhi_yuan${idx}_shang_se0.png`;
                this.imgKite1.visible = idx == 1;
                this.imgKite2.visible = idx == 2;
            } else {
                this["imgKite" + this._type].skin = `springMoon/zhi_yuan${this._type}_shang_se${idx}.png`;
            }
        }

        /**确认步骤 */
        private sureStep() {
            if (this._step < 2 && !this.tempChoose) {
                alert.showFWords("请先做出选择~");
                return;
            }
            this.btnSure.visible = false;
            net.sendAndWait(new pb.cs_mid_feastial_kite_operator({ step: this._step + 1, param: this.tempChoose })).then((msg: pb.sc_mid_feastial_kite_operator) => {
                alert.showReward(msg.itms);
                this._step++;
                let ani: clientCore.Bone;
                let type: string;
                if (this._step == 1) {
                    this["diChoose" + this.tempChoose].skin = "springMoon/wei_xuan_zhong.png";
                    this._type = this.tempChoose;
                    type = "绘制";
                    ani = clientCore.BoneMgr.ins.play("res/animate/springMoon/kite.sk", "lline", false, this.boxMake);
                }
                else if (this._step == 2) {
                    this["diChoose" + this.tempChoose].skin = "springMoon/wei_xuan_zhong.png";
                    this._color = this.tempChoose;
                    type = "上色";
                    ani = clientCore.BoneMgr.ins.play("res/animate/springMoon/kite.sk", "colour", false, this.boxMake);
                }
                else if (this._step == 3) {
                    type = "裁剪";
                    ani = clientCore.BoneMgr.ins.play("res/animate/springMoon/kite.sk", "cut", false, this.boxMake);
                }
                else if (this._step == 4) {
                    alert.showFWords("放飞完成！");
                    this.setUI();
                }
                this.tempChoose = 0;
                if (ani) {
                    ani.pos(725, 230);
                    ani.once(Laya.Event.COMPLETE, this, () => {
                        ani.dispose();
                        if (!this._closed) {
                            alert.showFWords(type + "完成！");
                            this.setUI();
                        }
                    })
                }
            })
        }

        private hide() {
            this.tempChoose = 0;
            clientCore.DialogMgr.ins.close(this, false);
        }

        private showTips(idx: number) {
            clientCore.ToolTip.showTips(this["icon" + idx], { id: this.rewards[idx - 1] });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.sureStep);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["diChoose" + i], Laya.Event.CLICK, this, this.choose, [i]);
            }
            for (let i: number = 1; i <= 4; i++) {
                BC.addEvent(this, this["icon" + i], Laya.Event.CLICK, this, this.showTips, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}