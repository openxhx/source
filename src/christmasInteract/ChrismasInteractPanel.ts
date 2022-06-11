namespace christmasInteract {
    export class ChrismasInteractPanel extends ui.christmasInteract.ChristmasInteractPanelUI {
        private isSelect: boolean;
        init() {
            this.sideClose = false;
            this.boxResult.visible = false;
        }

        private getReward(idx: number) {
            if (this.isSelect) return;
            this.isSelect = true;
            this["ball" + idx].visible = false;
            let ani = clientCore.BoneMgr.ins.play("res/animate/chrismasInteract/ball.sk", idx - 1, false, this);
            ani.pos(this["ball" + idx].x + 56, this["ball" + idx].y + 106);
            ani.once(Laya.Event.COMPLETE, this, () => {
                ani.dispose();
                this.boxResult.pos(this["ball" + idx].x - 14, this["ball" + idx].y + 38);
                net.sendAndWait(new pb.cs_christmas_greetings_draw()).then(async (msg: pb.sc_christmas_greetings_draw) => {
                    this.labCount3.text = msg.item[0].cnt.toString();
                    if (msg.item[0].cnt <= 3) {
                        this.tip.skin = "";
                    } else if (msg.item[0].cnt <= 6) {
                        this.tip.skin = "christmasInteract/shuang_bei.png";
                    } else {
                        this.tip.skin = "christmasInteract/san_bei.png";
                    }
                    this["ball" + idx].visible = true;
                    this.boxResult.visible = true;
                    await util.TimeUtil.awaitTime(1000);
                    let panel = alert.showReward(msg.item);
                    panel.once(Laya.Event.CLOSE, this, () => {
                        clientCore.ChrismasInteractManager.curCount += msg.item[0].cnt;
                        if (clientCore.ChrismasInteractManager.curCount >= 200) {
                            alert.showSmall("今日获得祝福已达上限，点击场景礼盒将只会变为雪人！");
                        }
                        this.destroy();
                    })
                }).catch(() => {
                    for (let i: number = 1; i <= 3; i++) {
                        this["ball" + i].visible = true;
                    }
                })
            })
        }

        addEventListeners() {
            for (let i: number = 1; i <= 3; i++) {
                BC.addEvent(this, this["ball" + i], Laya.Event.CLICK, this, this.getReward, [i]);
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