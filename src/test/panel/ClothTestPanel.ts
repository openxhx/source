namespace test {
    export class ClothTestPanel extends ui.test.ClothTestUI {
        private _people: clientCore.Person;
        // private _person2: clientCore.Person2;
        private _sex: number = 1;

        constructor() {
            super()
            this.sideClose = false;
            this.createPeople();
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
        }

        private createPeople() {
            if (this._people) {
                this._people.destroy();
            }
            this._people = new clientCore.Person(this._sex);
            let info = new pb.UserBase();
            info.sex = this._sex;
            info.curClothes = [];
            this._people.scale(0.7, 0.7);
            // this._people.playAnimate('fly',true) 
            this.imgRole.addChild(this._people);
            this.list.dataSource = this.getNowClothList();
        }

        private onListRender(cell: Laya.Box, idx: number) {
            let obj = clientCore.ClothData.getCloth(cell.dataSource);
            let str = '';
            if (obj) {
                str = cell.dataSource + '  ' + obj.name;
                (cell.getChildByName('imgIcon') as Laya.Image).skin = clientCore.ItemsInfo.getItemIconUrl(cell.dataSource);
            }
            else {
                str = cell.dataSource + '信息丢失了';
                (cell.getChildByName('imgIcon') as Laya.Image).skin = ''
            }
            (cell.getChildByName('txt') as Laya.Label).text = str;
        }

        private onSuit() {
            let suitId = parseInt(this.txtSuit.text);
            if (clientCore.SuitsInfo.getSuitInfo(suitId).clothes) {
                this._people.downAllCloth();
                this._people.upByIdArr(clientCore.SuitsInfo.getSuitInfo(suitId, this._sex).clothes);
                this.list.dataSource = this.getNowClothList();
            }
            else {
                window.alert(suitId + '没有!');
            }
        }

        private onCloth() {
            let clothId = parseInt(this.txtCloth.text);
            if (clientCore.ClothData.getCloth(clothId)) {
                this._people.upById(clothId);
                this.list.dataSource = this.getNowClothList();
                console.log(clientCore.ClothData.getCloth(clothId).partArr);
            }
            else {
                window.alert(clothId + '没有!');
            }
        }

        private onDownAll() {
            this._people.downAllCloth();
            this.list.dataSource = this.getNowClothList();
        }

        private getNowClothList() {
            return this._people.getWearginIds();
        }

        private onSexChange() {
            let sex = this.sex.selectedIndex + 1
            if (this._sex != sex) {
                this._sex = sex;
                this.createPeople();
            }
        }

        //#region 坐骑
        private rider: clientCore.Bone;
        private onRiderChange() {
            let id = parseInt(this.txtRider.text);
            this._people.playAnimate(id != 0 ? 'zuoxia' : 'static', true);
            if (id) {
                this.rider?.dispose();
                this._people.scale(0.4, 0.4);
                this.rider = clientCore.BoneMgr.ins.playRiderBone(id, this._people);
                this.rider.visible = true;
                this.txtPos.text = `x:${this.rider.x} y:${this.rider.y}`;
            }
            else {
                this._people.scale(0.7, 0.7);
                if (this.rider)
                    this.rider.visible = false;
            }
        }

        private onRiderPosChange(e: Laya.Event) {
            if (this.rider?.visible) {
                switch (e.keyCode) {
                    case Laya.Keyboard.W:
                        this.rider.y -= 1;
                        break;
                    case Laya.Keyboard.S:
                        this.rider.y += 1;
                        break;
                    case Laya.Keyboard.A:
                        this.rider.x -= 1;
                        break;
                    case Laya.Keyboard.D:
                        this.rider.x += 1;
                        break;
                    default:
                        break;
                }
                this.txtPos.text = `x:${this.rider.x} y:${this.rider.y}`;
            }
        }
        //#endregion

        //#region 舞台
        private m_stage: clientCore.Bone;
        private async onStageChange() {
            let id = parseInt(this.txtStage.text);
            if (id) {
                this.m_stage?.dispose();
                this.m_stage = await clientCore.BgShowManager.instance.createDynamicStage(id, this.imgRole);
                this.m_stage.visible = true;
                this.txtPosStage.text = `x:${this.m_stage.x} y:${this.m_stage.y}`;
            }
            else {
                if (this.m_stage)
                    this.m_stage.visible = false;
            }
        }

        private onStagePosChange(e: Laya.Event) {
            if (this.m_stage?.visible) {
                switch (e.keyCode) {
                    case Laya.Keyboard.UP:
                        this.m_stage.y -= 1;
                        break;
                    case Laya.Keyboard.DOWN:
                        this.m_stage.y += 1;
                        break;
                    case Laya.Keyboard.LEFT:
                        this.m_stage.x -= 1;
                        break;
                    case Laya.Keyboard.RIGHT:
                        this.m_stage.x += 1;
                        break;
                    default:
                        break;
                }
                this.txtPosStage.text = `x:${this.m_stage.x} y:${this.m_stage.y}`;
            }
        }
        //#endregion

        addEventListeners() {
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnCloth, Laya.Event.CLICK, this, this.onCloth);
            BC.addEvent(this, this.btnDown, Laya.Event.CLICK, this, this.onDownAll);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.sex, Laya.Event.CHANGE, this, this.onSexChange);
            BC.addEvent(this, this.btnUpRider, Laya.Event.CLICK, this, this.onRiderChange);
            BC.addEvent(this, this.btnStage, Laya.Event.CLICK, this, this.onStageChange);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_DOWN, this, this.onRiderPosChange);
            BC.addEvent(this, Laya.stage, Laya.Event.KEY_DOWN, this, this.onStagePosChange);
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this, false);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this.rider?.dispose();
            this.m_stage?.dispose();
            this._people.destroy();
        }
    }
}