namespace previewBG {
    /**
     * 背景秀,舞台，坐骑预览
     */
    export class PreviewBGModule extends ui.previewBG.PreviewBGModuleUI {
        sideClose: boolean = true;
        private _rider: clientCore.Bone;
        private _person: clientCore.Person;
        constructor() {
            super();
            this.htmlTxt.style.font = '汉仪中圆简';
            this.htmlTxt.style.width = 441;
            this.htmlTxt.style.fontSize = 24;
            this.bgShow.scale(0.9, 0.9);
        }

        /**
         * @param data 
         * id 背景秀的道具id
         * condition条件 需要黄字体的需要用{}包括 不可以嵌套
         * limit现在条件
         */
        init(data: { id: number | number[], condition: string, limit: string }): void {
            if (data.condition) {
                this.htmlTxt.visible = true;
                this.htmlTxt.innerHTML = `<span style='font-family:汉仪中圆简;fontSize:40;color:#ffffff'>${data.condition[0]}</span>`
                    + util.StringUtils.getColorText3(data.condition.substr(1), "#ffffff", "#fffc00");
            }
            else {
                this.htmlTxt.visible = false;
            }

            let ids = _.isArray(data.id) ? data.id : [data.id];
            let nameArr = [];
            for (const id of ids) {
                nameArr.push(clientCore.ItemsInfo.getItemName(id));
            }
            //背景秀
            let bgshow = clientCore.BgShowManager.filterDecoIdByType(ids, clientCore.CLOTH_TYPE.Bg);
            if (bgshow) {
                let cfg: xls.bgshow = xls.get(xls.bgshow).get(bgshow);
                let img = new Laya.Image();
                img.skin = clientCore.ItemsInfo.getItemUIUrl(cfg.id);
                if (cfg.fullScreen) {
                    img.pivotX = cfg.showParameters[0] / 2;
                    img.pivotY = cfg.showParameters[1] / 2;
                } else {
                    img.anchorY = img.anchorX = 0.5;
                }
                this.bgShow.addChild(img);
            }
            //舞台
            let stage = clientCore.BgShowManager.filterDecoIdByType(ids, clientCore.CLOTH_TYPE.Stage);
            if (stage) {
                let cfg: xls.bgshow = xls.get(xls.bgshow).get(stage);
                if (cfg.dynamic) {
                    clientCore.BgShowManager.instance.createDynamicStage(stage, this.bgShow, 1);
                } else {
                    let img = new Laya.Image();
                    img.anchorY = img.anchorX = 0.5;
                    img.skin = clientCore.ItemsInfo.getItemUIUrl(stage);
                    this.bgShow.addChild(img);
                }
            }
            //套装和坐骑
            let suitIds = _.filter(ids, id => xls.get(xls.suits).has(id));
            let riderId = clientCore.BgShowManager.filterDecoIdByType(ids, clientCore.CLOTH_TYPE.Rider);
            if (suitIds.length > 0 || riderId > 0 || stage || bgshow) {
                this._person = new clientCore.Person(clientCore.LocalInfo.sex, clientCore.LocalInfo.getFaceIdArr());
                this.bgShow.addChild(this._person);
                this._person.upByIdArr(suitIds.length == 0 ? clientCore.LocalInfo.wearingClothIdArr : clientCore.SuitsInfo.getSuitInfo(suitIds[0]).clothes);
                this._person.scale(clientCore.PeopleManager.BASE_SCALE * 2.5, clientCore.PeopleManager.BASE_SCALE * 2.5);
                this._person.playAnimate(riderId > 0 ? 'zuoxia' : 'huxi', true);
                if (riderId > 0)
                    this._rider = clientCore.BoneMgr.ins.playRiderBone(riderId, this._person);
            }
            this.rewardTxt.changeText(nameArr.join('，'));
            //限制
            let isShow: boolean = data.limit && data.limit != "";
            this.limitTxt.visible = isShow;
            isShow && this.limitTxt.changeText(data.limit);
        }

        addEventListeners(): void {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.destroy);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._rider?.dispose();
            this._person?.destroy();
            clientCore.BgShowManager.instance.hideDynamicStage();
        }
    }
}