namespace springFaerie {
    export class SpringFaerieMakePanel extends ui.springFaerie.panel.SpringFaerieMakePanelUI {

        private makeTime: number;
        private itemNum: number;
        private activityId: number = 229;
        private selectIndex: number = -1;
        private control: SpringFaerieControl;
        private showShare: Boolean = false;
        private drawAni:clientCore.Bone;
        private drawAni1:clientCore.Bone;
        private part1:clientCore.Bone;
        private part2:clientCore.Bone;
        private part3:clientCore.Bone;
        private part4:clientCore.Bone;
        private part5:clientCore.Bone;

        constructor(sign: number) {
            super();
            this.sideClose = true;
            this.init();
            this.sign = sign;
            this.control = clientCore.CManager.getControl(this.sign) as SpringFaerieControl;
        }

        init() {
            this.list.vScrollBarSkin = "";
            this.closeRewardBtn.visible = false;
            this.list.renderHandler = new Laya.Handler(this, this.listRender);
            this.list.mouseHandler = new Laya.Handler(this, this.mouseHandler);
            this.list.array = _.filter(xls.get(xls.magicsnowglobe).getValues(), (o) => { return (o.id>=9 && o.id<=16) });
            this.addPreLoad(res.load(`res/animate/springFaerie/parts.png`));
            this.addPreLoad(res.load(`res/animate/springFaerie/gacha.png`));
            this.addPreLoad(res.load(`res/animate/springFaerie/gachalight.png`));
            this.setMask(0);
        }

        private listRender(item: ui.springFaerie.render.itemRenderUI) {
            let xlsInfo: xls.magicsnowglobe = item.dataSource;
            item.selectImg.visible = false;
            item.numTxt.visible = false;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(xlsInfo.cost[1].v1);
            item.numTxt.text = 0 + "";
            //item.useNum.text = "0";
            item.haveNum.text = clientCore.ItemsInfo.getItemNum(xlsInfo.cost[1].v1) + "";
            item.haveNum.color = clientCore.ItemsInfo.getItemNum(xlsInfo.cost[1].v1) >= xlsInfo.cost[1].v2 ? "#33c200" : "#db243a";
            item.needNum.text = xlsInfo.cost[1].v2 + "";
        }

        private mouseHandler(e: Laya.Event, index: number) {
            if (index == this.selectIndex) {
                return;
            }
            if (e.type != Laya.Event.CLICK) {
                return;
            }
            let cell;
            let xlsInfo;
            if (this.selectIndex != -1) {
                xlsInfo = this.list.array[this.selectIndex];
                cell = this.list.getCell(this.selectIndex);
                cell["selectImg"].visible = false;
                cell["numTxt"].visible = false;
                //cell["useNum"].text = xlsInfo.cost[1].v2 + "";
            }
            this.selectIndex = index;
            xlsInfo = this.list.array[this.selectIndex];
            cell = this.list.getCell(this.selectIndex);
            cell["selectImg"].visible = true;
            cell["numTxt"].visible = true;
            //cell["useNum"].text ="0";
            this.haveNum.text = xlsInfo.cost[1].v2 + "";
            if(clientCore.ItemsInfo.getItemNum(xlsInfo.cost[1].v1) >= xlsInfo.cost[1].v2 && this.itemNum > 0){
                this.makeTime = 1;
            }else{
                cell["numTxt"].text = this.makeNum.text = this.useNum.text = "0";
                this.makeTime = 0;
                if(this.itemNum == 0){
                    alert.showFWords("桃木不足");
                }else{
                    alert.showFWords("当前材料不足");
                }
            }
            cell["numTxt"].text = this.makeNum.text = this.makeTime + "";
            this.useNum.text = xlsInfo.cost[1].v2 * this.makeTime + "";
            clientCore.ToolTip.showTips(cell, { id: xlsInfo.cost[1].v1 });
        }

        public show() {
            //clientCore.Logger.sendLog('2022年2月11日活动','【主活动】顺心如意·元宵','打开制作元宵面板');
            clientCore.DialogMgr.ins.open(this);
            this.initMake();
            this.makeNum.text = this.useNum.text = this.haveNum.text = "0";
            let scroll = this.list.scrollBar;
            this.imgBar.visible = this.imgProgress.visible = scroll.max > 0;
            clientCore.UIManager.setMoneyIds([9900310]);
            clientCore.UIManager.showCoinBox();
        }

        initMake() {
            this.makeTime = 0;
            this.itemNum = clientCore.ItemsInfo.getItemNum(9900310);
            this.numTxt0.text = this.makeTime + "/1";
            this.selectPanel.visible = this.make.visible = this.rewardPanel.visible = this.tip.visible = false;
            this.makePanel.visible = this.openBtn.visible = true;
            this.gaiLv0.text = this.gaiLv1.text = this.gaiLv2.text = this.gaiLv3.text = "概率:0%";
        }

        public hide() {
            clientCore.UIManager.releaseCoinBox();
            clientCore.DialogMgr.ins.close(this, false);
        }

        onCloseClick(i: number) {
            if (i == 1) {
                clientCore.UIManager.releaseCoinBox();
                clientCore.DialogMgr.ins.close(this, false);
            } else {
                this.setMask(0);
                this.selectPanel.visible = false;
                this.makePanel.visible = true;
            }
        }

        //打开选择物品面板
        OpenItemSelect() {
            this.selectPanel.visible = true;
            this.makePanel.visible = false;
            this.initList();
            this.setMask(1);
        }

        setMask(i:number){
            if(i==0){
                this.width = this.makePanel.width;
                this.height = this.makePanel.height;
                this.makePanel.x = this.width/2;
                this.makePanel.y = this.height/2;
            }else{
                this.width = this.stage.width;
                this.height = this.stage.height;
                this.selectPanel.x = this.stage.width/2;
                this.selectPanel.y = this.stage.height/2;
            }
        }

        initList() {
            this.list.selectedIndex = this.list.selectedIndex - 1;
            this.makeNum.text = this.useNum.text = this.haveNum.text = "0";
            this.selectIndex = -1;
            this.makeTime = 0;
        }

        //制作桃符
        makeItem() {
            if (this.makeTime == 0) {
                alert.showFWords("先选择制作材料");
                return;
            }
            this.makePanel.visible = false;
            this.tip.visible = true;
            this.drawAni = clientCore.BoneMgr.ins.play('res/animate/springFaerie/gacha.sk', 0, true, this ,null  , true);
            for(let i=0 ; i<5 ; i++){
                this["part" + (i+1)] = clientCore.BoneMgr.ins.play('res/animate/springFaerie/parts.sk', i, true, this , null);
                this["part" + (i+1)].pos(this.width/2 , this.height/2);
            }
            this.drawAni.pos(this.width/2 , this.height/2);
            this.drawAni.on(Laya.Event.CLICK ,this ,  this.drawOver);
        }

        drawOver(){
            this.tip.visible = false;
            this.drawAni?.dispose();
            for(let i=1 ; i<=5 ; i++){
                this["part" + i].off(Laya.Event.CLICK ,this, this.drawOver);
                this["part" + i]?.dispose(true);
                //this["part" + i] = null;
            }
            this.drawAni1 = clientCore.BoneMgr.ins.play('res/animate/springFaerie/gachalight.sk', 0, false, this ,null );
            this.drawAni1.pos(this.width/2 , this.height/2);
            this.drawAni1.once(Laya.Event.COMPLETE, this, () => {
                this.drawAni1.dispose();
                this.showReward();
            });
        }

        async showReward(){
            this.sideClose = false;
            let msg = await this.control.makeTaoFu(this.selectIndex + 1, this.makeTime);
            let num = msg.Taofu;
            for (let i = 0; i < 4; i++) {
                this["rewardNum" + i].text = num[i];
            }
            this.rewardPanel.visible = true;
            if (msg.item != null) {
                if (msg.item.length > 0) {
                    alert.showReward(msg.item);
                }
            }
            this.showShare = num[3] > 0;
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.closeReward);
        }

        //选择完物品
        selectItemOk() {
            this.make.visible = this.makeTime > 0;
            this.openBtn.visible = this.makeTime == 0;
            this.setMask(0);
            this.selectPanel.visible = false;
            this.makePanel.visible = true;
            if (this.makeTime > 0) {
                let id: number = this.list.array[this.selectIndex].cost[1].v1;
                this.selectImg.skin = clientCore.ItemsInfo.getItemIconUrl(id);
                this.numTxt0.text = this.makeTime + "/1";
                this.numTxt1.text = this.makeTime * this.list.array[this.selectIndex].cost[1].v2 + "/" + this.list.array[this.selectIndex].cost[1].v2;
                let xlsInfo: xls.magicsnowglobe = this.list.array[this.selectIndex];
                for(let i=0 ; i<4 ; i++){
                    this["gaiLv" + i].text ="概率:" + xlsInfo.weight[i] + "%";
                }
            }else{
                this.gaiLv0.text = this.gaiLv1.text = this.gaiLv2.text = this.gaiLv3.text = "概率:0%";
            }
        }

        changeModule() {
            EventManager.event("CLOSE_SPRING");
            clientCore.ModuleManager.open('playground.PlaygroundModule');
        }

        //添加物品
        addItemNum() {
            if (this.selectIndex == -1) {
                alert.showFWords("请先选择材料~");
                return;
            }
            if (this.itemNum < this.makeTime + 1) {
                alert.showFWords("桃木不足~");
                return;
            }
            let xlsInfo = this.list.array[this.selectIndex];
            if (clientCore.ItemsInfo.getItemNum(xlsInfo.cost[1].v1) < xlsInfo.cost[1].v2 * (this.makeTime + 1)) {
                alert.showFWords(clientCore.ItemsInfo.getItemName(xlsInfo.cost[1].v1) + "不足~");
                return;
            }
            this.makeTime = this.makeTime + 1;
            let cell = this.list.getCell(this.selectIndex);
            cell["numTxt"].text = this.makeNum.text = this.makeTime + "";
            //cell["useNum"].text = 
            this.useNum.text = xlsInfo.cost[1].v2 * this.makeTime + "";
        }

        //减少物品
        reduceItemNum() {
            if (this.selectIndex == -1) {
                alert.showFWords("请先选择材料~");
                return;
            }
            if (this.makeTime == 0) {
                return;
            }
            this.makeTime = this.makeTime - 1;
            let xlsInfo = this.list.array[this.selectIndex];
            let cell = this.list.getCell(this.selectIndex);
            cell["numTxt"].text = this.makeNum.text = this.makeTime + "";
            //cell["useNum"].text = 
            this.useNum.text = xlsInfo.cost[1].v2 * this.makeTime + "";
        }

        private onScrollChange() {
            let scroll = this.list.scrollBar;
            if (scroll.max > 0) {
                this.imgBar.y = scroll.value / scroll.max * (this.imgProgress.height - this.imgBar.height) + this.imgProgress.y;
            }
        }

        private closeReward() {
            this.initMake();
            this.sideClose = true;
            if (this.showShare) {
                EventManager.event("SHOW_SHARE");
            }
            BC.removeEvent(this, this, Laya.Event.CLICK, this, this.closeReward);
        }

        showTip(){
            clientCore.ToolTip.showTips(this.taomuIcon, {id:9900310});
        }

        addEventListeners() {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.onCloseClick, [0]);
            BC.addEvent(this, this.taomuIcon, Laya.Event.CLICK, this, this.showTip);
            BC.addEvent(this, this.closeBtn1, Laya.Event.CLICK, this, this.onCloseClick, [1]);
            BC.addEvent(this, this.openBtn, Laya.Event.CLICK, this, this.OpenItemSelect);
            BC.addEvent(this, this.make, Laya.Event.CLICK, this, this.OpenItemSelect);
            BC.addEvent(this, this.putBtn, Laya.Event.CLICK, this, this.makeItem);
            BC.addEvent(this, this.okBtn, Laya.Event.CLICK, this, this.selectItemOk);
            BC.addEvent(this, this.reduceBtn, Laya.Event.CLICK, this, this.reduceItemNum);
            BC.addEvent(this, this.addBtn, Laya.Event.CLICK, this, this.addItemNum);
            BC.addEvent(this, this.goBtn, Laya.Event.CLICK, this, this.changeModule);
            BC.addEvent(this, this.list.scrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            clientCore.UIManager.releaseCoinBox();
            this.drawAni?.dispose();
            this.drawAni1?.dispose();
            for(let i=1 ; i<=5 ; i++){
                this["part" + i]?.dispose(true);
            }
            super.destroy();
        }
    }
}