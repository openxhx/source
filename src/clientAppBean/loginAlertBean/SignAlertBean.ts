namespace clientAppBean{
    /**
     * 签到强弹
     */
    export class SignAlertBean extends BaseLoginAlertBean{
        async start(): Promise<void>{
            if(clientCore.SystemOpenManager.ins.getIsOpen(7) == false){
                this.openNext();
                return;
            }

            let isSign: boolean = await net.sendAndWait(new pb.cs_get_sign_in_reward_status()).then((data: pb.sc_get_sign_in_reward_status) => {
                return Promise.resolve(data.signed == 0);
            })
            isSign ? this.openSign() : this.openNext();
        }

        private openSign(): void{
            clientCore.ModuleManager.open("activity.ActivityModule");
            EventManager.once(globalEvent.SIGN_ALERT_CLOSE, this, this.openNext);
        }
    }
}