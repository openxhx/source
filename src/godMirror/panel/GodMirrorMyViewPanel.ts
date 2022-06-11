namespace godMirror {
    export class GodMirrorMyViewPanel extends ui.godMirror.panel.GodMyViewPanelUI {

        show() {
            this.setRender(this.mcLeft, GodMirrorModel.leftView);
            this.setRender(this.mcRight, GodMirrorModel.rightView);
            this.onTimer()
            clientCore.DialogMgr.ins.open(this);
            Laya.timer.loop(1000, this, this.onTimer);
        }

        onClose() {
            Laya.timer.clear(this, this.onTimer);
            clientCore.DialogMgr.ins.close(this);
        }

        private setRender(cell: ui.godMirror.render.GodMirrorSelfViewRenderUI, data: pb.IMirrorRankInfo) {
            setGodMirrorRender(cell.mvView, data);
            cell.mvView.btnLeft.visible = cell.mvView.btnRight.visible = false;
            cell.mvView.scale(1, 1);
            cell.mvView.imgBg.skin = 'unpack/godMirror/3.png';
            cell.mvView.imgRank.visible = false;
            cell.mvView.txtRank.visible = true;
            if (data)
                cell.btnBoardLeftCast.gray = data.redPacket < 100;
        }

        private setRenderTime(cell: ui.godMirror.render.GodMirrorSelfViewRenderUI, data: pb.IMirrorRankInfo, upTime: number) {
            let haveView = !(_.isUndefined(data) || _.isNull(data));
            let uploadCd = GodMirrorModel.uploadCd;
            let showTime = GodMirrorModel.getShowTime(upTime);
            cell.btnUp.visible = !haveView;
            cell.btnVote.disabled = !haveView;
            cell.boxUpTime.visible = uploadCd > 0 && !haveView;
            cell.boxShowTime.visible = showTime > 0 && haveView;
            cell.btnUp.disabled = uploadCd > 0;
            if (uploadCd) {
                cell.txtUpTime.text = util.StringUtils.getDateStr(uploadCd);
            }
            if (showTime) {
                cell.txtShowTime.text = '剩余展示时间:' + util.StringUtils.getDateStr(showTime);
            }
            cell.btnBoardLeftCast.visible = cell.btnVote.visible = haveView;
        }

        private onTimer() {
            this.setRenderTime(this.mcLeft, GodMirrorModel.leftView, GodMirrorModel.leftUpTime);
            this.setRenderTime(this.mcRight, GodMirrorModel.rightView, GodMirrorModel.rightUpTime);
        }

        private onUp() {
            this.onClose();
            this.event(Laya.Event.OPEN);
        }

        private async onVote(isLeft: boolean) {
            if (isLeft) {
                GodMirrorModel.leftView = await GodMirrorModel.getSupport(GodMirrorModel.leftView);
                this.setRender(this.mcLeft, GodMirrorModel.leftView);
            }
            else {
                GodMirrorModel.rightView = await GodMirrorModel.getSupport(GodMirrorModel.rightView);
                this.setRender(this.mcRight, GodMirrorModel.rightView);
            }
        }

        private onBoard(type: number) {
            let data = type == 1 ? GodMirrorModel.leftView : GodMirrorModel.rightView;
            if (data.redPacket < 100) {
                alert.showFWords('拉票红包超过100才能使用定时宣传');
                return;
            }
            this.onClose();
            this.event(Laya.Event.COMPLETE, type);
        }

        addEventListeners() {
            BC.addEvent(this, this.mcLeft.btnUp, Laya.Event.CLICK, this, this.onUp);
            BC.addEvent(this, this.mcRight.btnUp, Laya.Event.CLICK, this, this.onUp);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.mcLeft.btnVote, Laya.Event.CLICK, this, this.onVote, [true]);
            BC.addEvent(this, this.mcRight.btnVote, Laya.Event.CLICK, this, this.onVote, [false]);
            BC.addEvent(this, this.mcLeft.btnBoardLeftCast, Laya.Event.CLICK, this, this.onBoard, [1]);
            BC.addEvent(this, this.mcRight.btnBoardLeftCast, Laya.Event.CLICK, this, this.onBoard, [2]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
            Laya.timer.clear(this, this.onTimer);
        }

        destroy() {
            super.destroy();
            destoryRender(this.mcLeft.mvView)
            destoryRender(this.mcRight.mvView)
        }
    }
}