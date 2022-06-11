namespace clientAppBean {
    export class WelcomeBackAlert2Bean extends BaseLoginAlertBean {

        /**开始逻辑 */
        async start() {
            let needOpen = await this.checkIsBack();
            if (needOpen)
                this.openWelcome();
            else
                this.openNext();
        }

        private async checkIsBack() {
            if (clientCore.LocalInfo.userLv < 4) return false;
            return net.sendAndWait(new pb.cs_watch_and_pick_up_the_light_two_get_info()).then(async (data: pb.sc_watch_and_pick_up_the_light_two_get_info) => {
                if (data.flag) {
                    // return Promise.resolve(true);
                    let result = await clientCore.MedalManager.getMedal([MedalConst.WELCOME_BACK_OPEN_TWO]);
                    return result[0].value == 0;
                } else {
                    clientCore.MedalManager.setMedal([{ id: MedalConst.WELCOME_BACK_OPEN_TWO, value: 1 }]);
                    return Promise.resolve(false);
                }
            })
        }

        private openWelcome() {
            clientCore.ModuleManager.open("welcomeBack2.WelcomeBack2Module");
            EventManager.once("WELCOME_CHAT_CLOSE", this, this.chatClose);
        }

        private chatClose() {
            this.openNext();
        }
    }
}