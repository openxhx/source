
namespace adventure {
    export class AdvUnlockPanel extends ui.adventure.panel.AdvUnlockPanelUI {
        private _id: number;
        constructor() {
            super();
            this.list.vScrollBarSkin = null;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
        }

        show(info: xls.chapterBase) {
            this._id = info.chapter_id;
            this.list.dataSource = info.require;
            clientCore.DialogMgr.ins.open(this);
            this.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(info.chapterUnlockCost.v1);
            this.txtNeed.text = info.chapterUnlockCost.v2.toString();
            this.imgBg.skin = `res/adventure/bgRight/${info.chapter_id}.png`;
            let chpInfo = clientCore.AdventureManager.instance.getOneChaperInfo(info.chapter_id);
            this.imgBoss.skin = `res/adventure/bossImg/${chpInfo?.bossId}.png`;
            this.btnUnlock.disabled = clientCore.ItemsInfo.getItemLackNum({ itemID: info.chapterUnlockCost.v1, itemNum: info.chapterUnlockCost.v2 }) > 0;
        }

        private onListRender(cell: Laya.Box, idx: number) {
            let ok = false;
            let conTxt = '';
            let req = cell.dataSource as xls.pair;
            if (req.v1 == 1) {
                let needChp = req.v2.toString();
                let chpId = parseInt(needChp.substr(1, 2));
                let stgId = parseInt(needChp.substr(3, 4));
                conTxt = `通关关卡${chpId}-${stgId}`;
                let stageInfo = clientCore.AdventureManager.instance.getOneStageInfo(req.v2);
                ok = stageInfo && stageInfo.state != clientCore.STAGE_STATU.NO_COMPLETE;
            }
            else if (req.v1 == 2) {
                conTxt = `主角等级要求:{${clientCore.LocalInfo.userLv}}/${req.v2}`;
                ok = clientCore.LocalInfo.userLv >= req.v2;
            }
            (cell.getChildByName('imgState') as Laya.Image).skin = ok ? 'commonBtn/btn_l_g_yes.png' : 'commonBtn/btn_l_r_no.png';
            let txt = cell.getChildByName('txtCon') as Laya.HTMLDivElement;
            txt.style.font = '汉仪中圆简';
            txt.style.fontSize = 25;
            txt.style.width = 350;
            txt.innerHTML = util.StringUtils.getColorText3(`${idx + 1}.${conTxt}`, '#805329', ok ? '#805329' : '#ff0000');
        }

        private onUnlock() {
            clientCore.AdventureManager.instance.unlockChapter(this._id).then(() => {
                this.onClose();
            });
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnUnlock, Laya.Event.CLICK, this, this.onUnlock);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        onClose() {
            clientCore.DialogMgr.ins.close(this);
        }
    }
}