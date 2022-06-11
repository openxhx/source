namespace springOverture {
    /**
     * 购买分享
     * 
     */
    export class SharePanel extends ui.springOverture.panel.SharePanelUI {

        private coinId: number = 9900284;
        
        constructor() {
            super();
        }

        setData(i: number) {
            this.imgSuit.skin = `unpack/springOverture/2100340_${clientCore.LocalInfo.sex}.png`;
            this.headImg.skin = clientCore.LocalInfo.headImgUrl;
            this.levelTxt.text = "LV:" + clientCore.LocalInfo.userLv + "";
            this.nameTxt.text = clientCore.LocalInfo.userInfo.nick;
            this.tipTxt.skin = `springOverture/SharePanel/txt${i}.png`;
            clientCore.MedalManager.getMedal([MedalConst.SHARE_FIRST]).then((msg: pb.ICommonData[]) => {
                this.rewardImg.visible = msg[0].value == 0;
                SpringOvertureShareManager._isReward = msg[0].value == 1;
            })
        }

        async onShare(){
            this.closeBtn.visible = false;
            this.rewardImg.visible = false;
            this.shareBtn.visible = false;
            await SpringOvertureShareManager.showShare('horizontal');
            this.closeBtn.visible = true;
            this.rewardImg.visible =  SpringOvertureShareManager._isReward == false;
            this.shareBtn.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.closeBtn, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.shareBtn, Laya.Event.CLICK, this, this.onShare);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        onClose() {
            BC.removeEvent(this);
            clientCore.DialogMgr.ins.close(this, false);
            clientCore.UIManager.setMoneyIds([this.coinId]);
            clientCore.UIManager.showCoinBox();
        }
    }
}