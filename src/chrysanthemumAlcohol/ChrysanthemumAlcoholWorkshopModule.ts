namespace chrysanthemumAlcohol {
    /**
     * 2020.10.23
     * 金菊酿酒香--酿酒工坊界面
     * chrysanthemumAlcohol.ChrysanthemumAlcoholWorkshopModule
     */
    export class ChrysanthemumAlcoholWorkshopModule extends ui.chrysanthemumAlcohol.ChrysanthemumAlcoholWorkshopModuleUI {
        private hasTokenId: number = 0;     //是否具有酿酒道具

        private _aniRole: clientCore.Bone;

        private _list: OperateBoxRender[];

        private _model: ChrysanthemumAlcoholModel;
        private _control: ChrysanthemumAlcoholControl;

        private _gamePanel1: GamePanle1;
        private _gamePanel2: GamePanle2;
        private _makeWinePanel: MakeWinePanel;

        init(data?: any) {
            super.init(data);

            this.sign = clientCore.CManager.regSign(new ChrysanthemumAlcoholModel(), new ChrysanthemumAlcoholControl());
            this._control = clientCore.CManager.getControl(this.sign) as ChrysanthemumAlcoholControl;
            this._model = clientCore.CManager.getModel(this.sign) as ChrysanthemumAlcoholModel;
            this._control.model = this._model;

            this._gamePanel1 = new GamePanle1(this.sign);
            this._gamePanel2 = new GamePanle2(this.sign);
            this._makeWinePanel = new MakeWinePanel(this.sign);

            this.onUpdateCoin();
            clientCore.UIManager.showCoinBox();
        }

        async onPreloadOver() {
            await this._control.getInfo();

            let playName = clientCore.LocalInfo.sex == 1 ? "girl_wine.sk" : "boy_wine.sk";
            this._aniRole = clientCore.BoneMgr.ins.play("res/animate/chrysanthemumAlcohol/" + playName, 0, true, this.boxAni);
            this._aniRole.pos(25, 400);

            this._list = [];
            for (let i = 0; i < 9; i++) {
                let item = new OperateBoxRender(this["item" + i]);
                item.update({ type: 1 })
                this._list.push(item);
            }

            this.updateView();
        }

        private updateView() {
            this.hasTokenId = 0;
            if (clientCore.ItemsInfo.getItemNum(this._model.tokenId2) > 0) {
                this.hasTokenId = this._model.tokenId2;
            } else if (clientCore.ItemsInfo.getItemNum(this._model.tokenId3) > 0) {
                this.hasTokenId = this._model.tokenId3;
            }
            if (this.hasTokenId == 0) {
                this.btnMake.visible = true;
                for (let i = 0; i < this._list.length; i++) {
                    this._list[i].stopTween();
                }
            } else {
                this.btnMake.visible = false;
                for (let i = 0; i < this._list.length; i++) {
                    this._list[i].startTween();
                }
            }
            for (let i = 0; i < this._list.length; i++) {
                this._list[i].update({ type: 0 });
            }
        }

        private onSelect(index: number): void {
            if (this.hasTokenId == 0) {
                return;
            }
            for (let i = 0; i < this._list.length; i++) {
                this._list[i].stopTween();
            }
            let isAdd: boolean = this.hasTokenId == this._model.tokenId3;
            this._control.wine(this.hasTokenId, Laya.Handler.create(this, (msg: pb.sc_gloden_chrysanthemum_wine) => {
                this.mouseEnabled = false;
                let animate = clientCore.BoneMgr.ins.play("res/animate/chrysanthemumAlcohol/zhuyu.sk", 0, false, this._list[index].mainUI);
                animate.pos(65, 65);
                animate.once(Laya.Event.COMPLETE, this, () => {
                    this.mouseEnabled = true;
                    animate.dispose();
                    this.updateView();
                    if (msg.itms.length > 0) {
                        let itemData: pb.IItem = msg.itms[0];
                        this._list[index].update({ type: 1, num: itemData.cnt, isAdd: isAdd })
                        alert.showFWords("获得" + clientCore.ItemsInfo.getItemName(itemData.id) + "x" + itemData.cnt);
                    }
                });
            }));
            this.hasTokenId = 0;
        }

        private onClose(): void {
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.open('chrysanthemumAlcohol.ChrysanthemumAlcoholModule');
        }

        /** 打开花朵连连看游戏界面按**/
        private onOpenGame1(): void {
            if (!this._model.isCanGame1) {
                alert.showFWords('今日游戏次数已达上限');
                return;
            }
            this._gamePanel1.init();
            clientCore.DialogMgr.ins.open(this._gamePanel1);
            clientCore.Logger.sendLog('2020年10月23日活动', '【主活动】金菊酿酒香', '点击花朵连连看');
        }

        /** 打开划拳猜心游戏界面按**/
        private onOpenGame2(): void {
            if (!this._model.isCanGame2) {
                alert.showFWords('今日游戏次数已达上限');
                return;
            }
            this._gamePanel2.init();
            clientCore.DialogMgr.ins.open(this._gamePanel2);
            clientCore.Logger.sendLog('2020年10月23日活动', '【主活动】金菊酿酒香', '点击划拳猜心');
        }

        private onMake(): void {
            this._makeWinePanel.init();
            clientCore.DialogMgr.ins.open(this._makeWinePanel);
        }

        private onUpdateCoin(): void {
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID, clientCore.MoneyManager.LEAF_MONEY_ID, this._model.itemId1]);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.btnGame1, Laya.Event.CLICK, this, this.onOpenGame1);
            BC.addEvent(this, this.btnGame2, Laya.Event.CLICK, this, this.onOpenGame2);
            BC.addEvent(this, this.btnMake, Laya.Event.CLICK, this, this.onMake);
            BC.addEvent(this, this._makeWinePanel, "ON_UPDATE_MAKEWINE", this, this.updateView);
            BC.addEvent(this, this._makeWinePanel, "ON_CLOSE_MAKEWINE", this, this.onUpdateCoin);
            for (let i = 0; i < 9; i++) {
                BC.addEvent(this, this["item" + i], Laya.Event.CLICK, this, this.onSelect, [i]);
            }
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            for (let i = 0; i < this._list.length; i++) {
                this._list[i].destroy();
            }
            this._list = [];
            this._aniRole.dispose();
            this._aniRole = null;
            this._gamePanel1?.destroy();
            this._gamePanel1 = null;
            this._gamePanel2?.destroy();
            this._gamePanel2 = null;
            this._makeWinePanel?.destroy();
            this._makeWinePanel = null;
            this._control.dispose();
            clientCore.CManager.unRegSign(this.sign);
            this._model = this._control = null;
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}