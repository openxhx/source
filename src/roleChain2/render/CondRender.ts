namespace roleChain2 {
    /**
     * 解析条件渲染项
     */
    export class CondRender extends ui.roleChain2.render.CondRenderUI {
        constructor() {
            super();
            this.htmlTx.style.fontSize = 20;
            this.htmlTx.style.width = 268;

            this.list.renderHandler = Laya.Handler.create(this, this.rewardItem, null, false);
            this.list.mouseHandler = Laya.Handler.create(this, this.rewardMouse, null, false);
        }

        public setData(roleId: number, value: any): void {
            let color: string;
            let yes: boolean;


            if (value instanceof Array) {
                this.list.visible = true;
                this.ico.skin = "affair/icon_gift.png";
                this.txTitle.changeText("事件隐藏奖励");
                this.htmlTx.innerHTML = "";
                this.imgYes.visible = false;
                this.list.array = value;
                return;
            }


            switch (value.v1) {
                case 1:  //好感度
                    let role: clientCore.role.RoleInfo = clientCore.RoleManager.instance.getRoleById(roleId);
                    yes = role.faverLv >= value.v3;
                    color = yes ? "#734b25" : "#ff0101";
                    this.txTitle.changeText("好感度");
                    this.htmlTx.innerHTML = util.StringUtils.getColorText2([`好感度等级达到${value.v3}级   (`, "#734b25", role.faverLv + "", color, `/${value.v3})`, "#734b25"]);
                    break;
                case 2: //道具
                    this.txTitle.changeText(clientCore.ItemsInfo.getItemName(value.v2));
                    let num: number = clientCore.ItemsInfo.getItemNum(value.v2);
                    yes = num >= value.v3;
                    color = yes ? "#734b25" : "#ff0101";
                    this.htmlTx.innerHTML = util.StringUtils.getColorText2([num + "", color, "/" + value.v3, "#734b25"]);
                    break;
                case 3: //拥有某个绽放角色
                    let xlsRole: xls.characterId = xls.get(xls.characterId).get(value.v2);
                    this.txTitle.changeText(xlsRole.name);
                    yes = clientCore.RoleManager.instance.getRoleById(value.v2) != null;
                    color = yes ? "#734b25" : "#ff0101";
                    this.htmlTx.innerHTML = util.StringUtils.getColorText(`绽放${xlsRole.name}`, color);
                    break;
                case 4: //必须通过某个章节的某个步骤
                    let xlsDate: xls.date = xls.get(xls.date).get(value.v2);
                    let xlsDateStage: xls.dateStage = xls.get(xls.dateStage).get(value.v3);
                    this.txTitle.changeText(xlsDate.dateName);
                    yes = clientCore.AffairMgr.ins.checkStageComplete(roleId, value.v2, value.v3);
                    color = yes ? "#734b25" : "#ff0101";
                    this.htmlTx.innerHTML = util.StringUtils.getColorText(`通过${xlsDate.dateName}的${xlsDateStage.name}`, color);
                    break;
            }
            this.list.visible = false;
            this.imgYes.visible = yes;
            this.ico.skin = "affair/200036.png";
        }


        private rewardItem(item: ui.commonUI.item.RewardItemUI, index: number): void {
            let id: number = this.list.array[index];
            item.num.visible = false;
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(id);
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(id);
        }

        private rewardMouse(e: Laya.Event, index: number): void {
            if (e.type == Laya.Event.MOUSE_DOWN) {
                clientCore.ToolTip.showTips(e.target, { id: this.list.array[index] });
            }
        }
    }
}