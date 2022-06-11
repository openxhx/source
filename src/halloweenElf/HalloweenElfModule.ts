namespace halloweenElf {
    /**
    * 万圣节讨糖主活动
    * halloweenElf.HalloweenElfModule
    * 2021.10.29
    */
    export class HalloweenElfModule extends ui.halloweenElf.HalloweenElfModuleUI {
        private pumpkinPie: number = 9900258;
        private data: any;
        init() {
            this.addPreLoad(this.getInfo());
        }

        onPreloadOver() {
            this.upDataUI();
            clientCore.Logger.sendLog('2021年10月29日活动', '【活动】南瓜节讨糖大赛', '点击前往抓住南瓜小精灵');
        }

        addEventListeners() {
            BC.addEvent(this, this.btnBeg, Laya.Event.CLICK, this, this.onBeg);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGoHome, Laya.Event.CLICK, this, this.onGoHome);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }

        private onGoHome():void{
            this.destroy();
            clientCore.DialogMgr.ins.closeAllDialog();
            clientCore.ModuleManager.closeAllOpenModule();
            clientCore.MapManager.enterHome(clientCore.LocalInfo.uid);

        }

        private onBeg(): void {
            this.destroy();
            clientCore.ModuleManager.open('halloweenCandy.HalloweenCandyModule');
        }

        /**获取面板信息 */
        private getInfo() {
            return net.sendAndWait(new pb.cs_halloween_candy_megagame_info()).then((data: pb.sc_halloween_candy_megagame_info) => {
                this.data = data;
            })
        }

        private upDataUI(): void {
            this.lblSelf.text = `${this.data.todayTime}/10`;
            this.lblFriend.text = `${this.data.uid.length}/20`;
            this.lblNum.text = `拥有：        ${clientCore.ItemsInfo.getItemNum(this.pumpkinPie)}`;
        }


    }
}
