namespace collection {
    /**
     * CG 面板
     */

    import CollectManager = clientCore.CollectManager;
    /**收藏角色面板 */
    export class CoRolePanel implements ICollectionPanel {
        ui: ui.collection.panel.RolePanelUI;
        private _selectIdx: number = -1;
        private _rwdPanel: CoRoleRewardPanel
        constructor() {
            this.ui = new ui.collection.panel.RolePanelUI();
            this.ui.panel.hScrollBarSkin = null;
            this.ui.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.ui.list.selectHandler = new Laya.Handler(this, this.onListSelect);
            this.ui.list.selectEnable = true;
            this.addEvent();
        }

        async show() {
            await CollectManager.instance.reqInfo(clientCore.CO_TYPE.ROLE);
            this.ui.list.dataSource = CollectManager.instance.getCoRoleInfos();
            this.ui.list.selectedIndex = 0;
            this.ui.list.scrollTo(0);
        }

        private onListRender(cell: ui.collection.render.CgIconRenderUI, idx: number) {
            let info: clientCore.CoRoleInfo = cell.dataSource;
            let progress = info.progress;
            cell.img.skin = pathConfig.getCollectionRoleIcon(cell.dataSource.id);
            cell.imgRed.visible = !info.rewarded && (progress.have >= progress.total);
        }

        waitLoad() {
            return Promise.resolve();
        }

        private onListSelect(idx: number) {
            if (this._selectIdx > -1) {
                let item = this.ui.list.getCell(this._selectIdx);
                item['ani1'].wrapMode = Laya.AnimationBase.WRAP_REVERSE;
                item['ani1'].play(0, false);
                // this.ui.list.getCell(this._selectIdx) && (this.ui.list.cells[this._selectIdx]['ani1'].wrapMode = Laya.AnimationBase.WRAP_REVERSE);
                // this.ui.list.getCell(this._selectIdx) && this.ui.list.cells[this._selectIdx]['ani1'].play(0, false);
            }
            this._selectIdx = idx;
            this.ui.list.getCell(this._selectIdx)['ani1'].wrapMode = Laya.AnimationBase.WRAP_POSITIVE;
            this.ui.list.getCell(this._selectIdx)['ani1'].play(0, false);
            this.showView();
        }

        private onChangePage(diff: number) {
            let tmp = _.clamp(diff + this._selectIdx, 0, this.ui.list.length - 1);
            if (tmp != this._selectIdx) {
                this.ui.list.selectedIndex = tmp;
                this.ui.list.scrollTo(tmp);
            }
        }
        private async onGetRwd() {
            let data = await CollectManager.instance.getCoRoleReward(this._selectIdx + 1);
            if (data) {
                this._rwdPanel = this._rwdPanel || new CoRoleRewardPanel();
                this._rwdPanel.show(data);
                this.showView(false);
                this.ui.list.refresh();
            }
        }

        private async showView(setImgs: boolean = true) {
            let info = this.ui.list.selectedItem as clientCore.CoRoleInfo;
            this.ui.txtTitle.text = info.xlsInfo.cgTitle;
            this.ui.txtProgress.text = `${info.progress.have}/${info.progress.total}`;
            this.ui.imgMask.x = -113 + 113 * (info.progress.have / info.progress.total);
            this.ui.btnRwd.index = info.rewarded ? 1 : 0;
            this.ui.btnRwd.disabled = info.progress.have < info.progress.total || info.rewarded;
            //图片
            if (!setImgs)
                return;
            this.ui.boxImgCon.removeChildren();
            let basePath = pathConfig.getCollectionRoleBase(info.id);
            await res.load(basePath + 'position.json');
            let json = res.get(basePath + 'position.json');
            if (json) {
                let bgImg = new Laya.Image(basePath + 'bg.png');
                this.ui.boxImgCon.addChild(bgImg);
                for (const id in json) {
                    if (id == 'bg')
                        continue;
                    let img = new Laya.Image(basePath + `${id}.png`);
                    img.pos(json[id][0], json[id][1], true);
                    if (!clientCore.RoleManager.instance.getRoleById(parseInt(id))) {
                        img.alpha = 0.5;
                    }
                    else {
                        img.alpha = 1;
                    }
                    this.ui.boxImgCon.addChild(img);
                }
            }

        }

        private addEvent() {
            BC.addEvent(this, this.ui.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.ui.btnNext, Laya.Event.CLICK, this, this.onChangePage, [1]);
            BC.addEvent(this, this.ui.btnPre, Laya.Event.CLICK, this, this.onChangePage, [-1]);
            BC.addEvent(this, this.ui.btnRwd, Laya.Event.CLICK, this, this.onGetRwd);
        }

        private removeEvent() {
            BC.removeEvent(this);
        }

        private onClose() {
            EventManager.event(EV_CHAGE_PANEL, PANEL.BASE);
        }

        destory() {
            this._rwdPanel?.destroy();
            this.removeEvent();
        }
    }
}