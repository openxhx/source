namespace operaDrama {
    const CAST_ARR = [
        ['罗切斯莫德.柯尼', '伊紫', '伊紫'],
        ['何波吉亚.阿诺德', '苏丸', '小豆豆嗷'],
        ['罗切斯莫德.诺兰', '喵叔', '潦草'],
        ['何波吉亚.萨尔玛', '霓烁烁丶', '酒小九'],
        ['红衣主教', '斯尔克', '斯尔克'],
        ['罗切斯莫德公爵', '伊尔使者', '伊尔使者']

    ]
    export class OperaStartPanel extends ui.operaDrama.panel.OperaStartPanelUI {
        async show() {
            this.ani2.gotoAndStop(1);
            clientCore.LoadingManager.showDark();
            clientCore.DialogMgr.ins.open(this, false);
            await util.TimeUtil.awaitTime(700);
            clientCore.LoadingManager.hideDark();
            for (let i = 0; i < 6; i++) {
                this.showView(i);
                await util.TimeUtil.awaitTime(750);
                await this.showAni();
            }
            await util.TimeUtil.awaitTime(500);
            clientCore.OperaManager.instance.startAniFlg = true;
            clientCore.DialogMgr.ins.close(this, false);
        }

        private showView(idx: number) {
            this.ani1.gotoAndStop(idx % 2);
            this.imgRole.skin = `res/otherLoad/operaDrama/dramaStart/${idx + 1}.png`;
            let arr = CAST_ARR[idx];
            this.txtRole.text = arr[0];
            this.txtCast.text = channel.ChannelControl.ins.isOfficial ? arr[1] : arr[2];
        }

        private showAni() {
            return new Promise((ok) => {
                this.ani2.play(0, false);
                this.ani2.on(Laya.Event.COMPLETE, this, ok)
            })
        }
    }
}