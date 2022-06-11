namespace eatTangyuan {
    /**
     * 吃元宵
     * eatTangyuan.EatTangyuanModule
     */
    export class EatTangyuanModule extends ui.eatTangyuan.EatTangyuanModuleUI {
        private setArr: number[];
        private eatArr: number[];
        private curUid: number;
        private curPoint: number;
        private curEatTimes: number;
        init(d: number) {
            this.addPreLoad(this.getNextInfo(d));
            this.addPreLoad(this.getPointInfo());
        }

        onPreloadOver() {
            clientCore.UIManager.setMoneyIds([9900307]);
            clientCore.UIManager.showCoinBox();
            this.setAllInfo();
        }

        private getPointInfo() {
            return net.sendAndWait(new pb.cs_agreeable_yuan_xiao_info()).then((msg: pb.sc_agreeable_yuan_xiao_info) => {
                this.curPoint = msg.fortune;
                this.txtSetTimes.value = this.numToStr(msg.setTime) + "/3";
                this.curEatTimes = msg.eatTime;
                this.setPoint();
            })
        }

        private setPoint() {
            this.labPoint.text = this.curPoint.toString();

            this.txtEatTimes.value = this.numToStr(this.curEatTimes) + "/30";
        }

        private numToStr(num: number) {
            if (num < 10) {
                return "abcdefghij"[num];
            } else {
                let onesPlace = num % 10;
                let tenPlace = Math.floor(num / 10);
                return "abcdefghij"[tenPlace] + "abcdefghij"[onesPlace];
            }
        }

        private setAllInfo() {
            for (let i = 0; i < 9; i++) {
                this.setOneInfo(i);
            }
        }

        private setOneInfo(index: number) {
            if (this.eatArr[index]) {
                this.setWanSkin(index + 1, 0);
                this["gai" + (index + 1)].visible = false;
            } else {
                this.setWanSkin(index + 1, this.setArr[index]);
                this["gai" + (index + 1)].visible = true;
            }
        }

        private setWanSkin(index: number, type: number) {
            this["wan" + index].skin = `eatTangyuan/wan_${type}.png`;
            if (index <= 3) this["wan" + index].height = type == 0 ? 104 : 109;
            else if (index <= 6) this["wan" + index].height = type == 0 ? 110 : 115;
            else this["wan" + index].height = type == 0 ? 115 : 134;
        }

        private getNext() {
            if (!this.curUid) return;
            this.curUid = 0;
            this.btnClose.mouseEnabled = false;
            net.sendAndWait(new pb.cs_get_agreeable_yuan_xiao_invitation()).then((msg: pb.sc_get_agreeable_yuan_xiao_invitation) => {
                if (!msg.uid) {
                    alert.showFWords("当前没有可拜访礼盒~");
                    this.btnClose.mouseEnabled = true;
                    return;
                }
                this.getNextInfo(msg.uid);
            })
        }

        private getNextInfo(uid: number) {
            return net.sendAndWait(new pb.cs_agreeable_yuan_xiao_panel({ uid: uid })).then((msg: pb.sc_agreeable_yuan_xiao_panel) => {
                this.setArr = msg.yuanxiao;
                this.eatArr = msg.eatUid;
                this.curUid = uid;
                this.btnClose.mouseEnabled = true;
                this.setAllInfo();
                this.setUseInfo();
            })
        }

        private async setUseInfo() {
            await clientCore.UserInfoDataBase.reqUserInfo([this.curUid]);
            let useInfo = clientCore.UserInfoDataBase.getUserInfo(this.curUid);
            this.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(useInfo.headImage);
            this.labName.text = useInfo.nick;
        }

        private checkCanEat() {
            return this.eatArr?.includes(0) && !this.eatArr?.includes(clientCore.LocalInfo.uid);
        }

        private eat(index: number) {
            if (this.curEatTimes >= 30) {
                alert.showFWords("次数不足~");
                return;
            }
            if (!this.checkCanEat()) {
                alert.showFWords("这份礼盒已享用过了~");
                return;
            }
            if (!this.curUid) return;
            this.mouseEnabled = false;
            net.sendAndWait(new pb.cs_agreeable_yuan_xiao_eat({ index: index - 1, uid: this.curUid })).then((msg: pb.sc_agreeable_yuan_xiao_eat) => {
                this.eatArr[index - 1] = clientCore.LocalInfo.uid;
                this.setOneInfo(index - 1);
                this.curPoint += msg.fortune;
                this.curEatTimes++;
                this.setPoint();
                clientCore.DialogMgr.ins.open(new EatResultPanel(msg));
                this.mouseEnabled = true;
            }).catch(() => {
                this.eatArr[index - 1] = 1;
                this.setOneInfo(index - 1);
                this.mouseEnabled = true;
            })
        }

        private showHelp() {
            alert.showRuleByID(1);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnHelp, Laya.Event.CLICK, this, this.showHelp);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.getNext);
            for (let i = 1; i <= 9; i++) {
                BC.addEvent(this, this["gai" + i], Laya.Event.CLICK, this, this.eat, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this.eatArr = null;
            this.setArr = null;
            super.destroy();
        }
    }
}