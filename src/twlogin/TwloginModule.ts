namespace twlogin{
    /**
     * 台湾登录界面
     */
    export class TwloginModule extends ui.twlogin.TaiwanLoginUI{
        constructor(){ super(); }
        addEventListeners(): void{
            BC.addEvent(this,this.btnGoogle,Laya.Event.CLICK,this,this.onLogin,[1]);
            BC.addEvent(this,this.btnFacebook,Laya.Event.CLICK,this,this.onLogin,[2]);
            BC.addEvent(this,this.lbRule,Laya.Event.CLICK,this,this.onRule);
        }
        removeEventListeners(): void{
            BC.removeEvent(this);
        }
        private onLogin(type:number): void{
            EventManager.event(globalEvent.TAIWAN_LOGIN, type);
        }
        private onRule(): void{
            clientCore.NativeMgr.instance.openUrl('http://www.61.com.tw/about/service.html');
        }
    }
}