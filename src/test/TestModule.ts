namespace test {
    const TEST_MOD_LOCALSAVE = 'TEST_MOD_LOCALSAVE';
    const TEST_PARAM_LOCALSAVE = 'TEST_PARAM_LOCALSAVE';
    const TEST_ANI_LOCALSAVE = 'TEST_ANI_LOCALSAVE';
    export class TestModule extends ui.test.TestModuleUI {
        init() {
            let localMod = Laya.LocalStorage.getItem(TEST_MOD_LOCALSAVE);
            let localParam = Laya.LocalStorage.getItem(TEST_PARAM_LOCALSAVE);
            let localAni = Laya.LocalStorage.getItem(TEST_ANI_LOCALSAVE);
            this.txtMod.text = localMod == null ? '' : localMod;
            this.txtModParam.text = localParam == null ? '' : localParam;
            this.txtAnimate.text = localAni == null ? '' : localAni;

        }

        private onOpenAni() {
            let ani = this.txtAnimate.text.trim();
            if (ani != '') {
                this.destroy();
                clientCore.AnimateMovieManager.showAnimateMovie(ani, null, null);
                Laya.LocalStorage.setItem(TEST_ANI_LOCALSAVE, ani);
            }
        }

        private onOpenMod() {
            let mod = this.txtMod.text.trim();
            let param = this.txtModParam.text.trim();
            Laya.LocalStorage.setItem(TEST_MOD_LOCALSAVE, mod);
            Laya.LocalStorage.setItem(TEST_PARAM_LOCALSAVE, param);
            if (mod != '') {
                this.destroy();
                if (param != '') {
                    let paramObj;
                    try {
                        paramObj = JSON.parse(param)
                    } catch (error) {
                        clientCore.ModuleManager.open(mod, param);
                    }
                    if (paramObj) {
                        clientCore.ModuleManager.open(mod, paramObj);
                    }
                }
                else {
                    clientCore.ModuleManager.open(mod);
                }
            }
        }

        private onOpenQuickBuy() {
            // if (this.txtBuyId.text)
            // alert.quickBuy(parseInt(this.txtBuyId.text), 1, 1, { caller: this, funArr: [this.onQuickBuyOk] });
        }

        private onQuickBuyOk() {
            alert.showFWords('快捷购买成功!');
        }

        private onChangeMap() {
            if (this.txtMapId) {
                this.destroy();
                clientCore.MapManager.enterWorldMap(parseInt(this.txtMapId.text));
            }
        }

        private onCloth() {
            let panel = new ClothTestPanel();
            this.visible = false;
            clientCore.DialogMgr.ins.open(panel, false);
            let self = this;
            panel.once(Laya.Event.CLOSE, this, () => {
                self.visible = true;
            })
        }

        private onCheckRed() {
            let id = parseInt(this.txtRed.text);
            if (!xls.get(xls.littleRed).get(id)) {
                alert.showFWords('littleRed表中找不到' + id);
                return;
            }
            let isRed = util.RedPoint.checkShow([id]);
            this.btnRedState.skin = isRed ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
        }

        private onCheckAllRed() {
            alert.showFWords('所有红点数据打印到控制台了!');
            console.table(Array.from(util.RedPoint['redHash'].entries()));
        }

        private onChangeRed() {
            let id = parseInt(this.txtRed.text);
            if (!xls.get(xls.littleRed).get(id)) {
                alert.showFWords('littleRed表中找不到' + id);
                return;
            }
            let nowRed = util.RedPoint.checkShow([id]);
            nowRed = !nowRed;
            if (nowRed)
                util.RedPoint.updateAdd([id])
            else
                util.RedPoint.updateSub([id]);
            this.btnRedState.skin = nowRed ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
        }

        private async onRefreshRed() {
            let id = parseInt(this.txtRed.text);
            if (!xls.get(xls.littleRed).get(id)) {
                alert.showFWords('littleRed表中找不到' + id);
                return;
            }
            await util.RedPoint.reqRedPointRefresh(id);
            let isRed = util.RedPoint.checkShow([id]);
            this.btnRedState.skin = isRed ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
        }

        onKeyDown(e: Laya.Event) {
            if (e.keyCode == Laya.Keyboard.ESCAPE) {
                this.destroy();
            }
        }

        private onCheckOpen() {
            let id = parseInt(this.txtOpen.text);
            let xlsInfo = xls.get(xls.systemTable).get(id);
            if (xlsInfo) {
                let open = clientCore.SystemOpenManager.ins.getIsOpen(id);
                this.txtOpenName.text = xlsInfo.name;
                this.btnOpenState.skin = open ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            }
        }

        private onChangeOpen() {
            let id = parseInt(this.txtOpen.text);
            let xlsInfo = xls.get(xls.systemTable).get(id);
            if (xlsInfo) {
                let open = !clientCore.SystemOpenManager.ins.getIsOpen(id);
                this.txtOpenName.text = xlsInfo.name;
                clientCore.SystemOpenManager.ins.debugOpen(id, open);
                this.btnOpenState.skin = open ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            }
        }

        private onCheckAllOpen() {
            console.table(clientCore.SystemOpenManager.ins['_openHash'].toArray());
        }

        private onOpenAll() {
            for (const id of xls.get(xls.systemTable).getKeys()) {
                clientCore.SystemOpenManager.ins.debugOpen(parseInt(id), true);
            }
        }

        private onOpenLimitRecharge() {
            clientCore.LittleRechargManager.instacne.activeWindowById(parseInt(this.txtLimitRecharge.text));
        }

        private clearBag() {
            net.sendAndWait(new pb.cs_del_all_mts()).then((msg: pb.sc_del_all_mts) => {
                alert.showFWords('删除完成');
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnOpenAni, Laya.Event.CLICK, this, this.onOpenAni);
            BC.addEvent(this, this.btnOpenMod, Laya.Event.CLICK, this, this.onOpenMod);
            BC.addEvent(this, this.btnQuickBuy, Laya.Event.CLICK, this, this.onOpenQuickBuy);
            BC.addEvent(this, this.btnMap, Laya.Event.CLICK, this, this.onChangeMap);
            BC.addEvent(this, this.btnCloth, Laya.Event.CLICK, this, this.onCloth);
            //红点
            BC.addEvent(this, this.btnCheckRed, Laya.Event.CLICK, this, this.onCheckRed);
            BC.addEvent(this, this.btnCheckAll, Laya.Event.CLICK, this, this.onCheckAllRed);
            BC.addEvent(this, this.btnRedState, Laya.Event.CLICK, this, this.onChangeRed);
            //系统开放
            BC.addEvent(this, this.btnOpenState, Laya.Event.CLICK, this, this.onChangeOpen);
            BC.addEvent(this, this.btnCheckOpen, Laya.Event.CLICK, this, this.onCheckOpen);
            BC.addEvent(this, this.btnCheckAllOpen, Laya.Event.CLICK, this, this.onCheckAllOpen);
            BC.addEvent(this, this.btnOpenAll, Laya.Event.CLICK, this, this.onOpenAll);
            //
            BC.addEvent(this, this.btnRefresh, Laya.Event.CLICK, this, this.onRefreshRed);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_DOWN, this, this.onKeyDown);
            //限时充值
            BC.addEvent(this, this.btnOpenLimitCharge, Laya.Event.CLICK, this, this.onOpenLimitRecharge);
            //清空仓库
            BC.addEvent(this, this.btnClearBag, Laya.Event.CLICK, this, this.clearBag);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}