namespace selfInfo {
    export class Settingpanel extends ui.selfInfo.SettingPanelUI {
        constructor() {
            super();
            this.slideMusic.bar.stateNum = this.slideSound.bar.stateNum = 1;
            this.sideClose = true;
            this.popupOver();
        }

        popupOver() {
            this.slideMusic.value = Math.round(core.SoundManager.instance.musicVol * 100);
            this.slideSound.value = Math.round(core.SoundManager.instance.soundVol * 100);
            this.clip_notice.index = clientCore.GlobalConfig.allowNotice ? 1 : 0;
            this.clipHidePlayer.index = clientCore.PeopleManager.showPlayerFlag ? 1 : 0;
            this.clipLimitChat.index = clientCore.GlobalConfig.isAllowStrangerChat ? 1 : 0;
        }

        private onMusicChange() {
            core.SoundManager.instance.musicVol = this.slideMusic.value / 100;
        }

        private onSoundChange() {
            core.SoundManager.instance.soundVol = this.slideSound.value / 100;
        }

        private onNoticeChange() {
            this.clip_notice.index = 1 - this.clip_notice.index;
            clientCore.GlobalConfig.allowNotice = this.clip_notice.index == 1;
        }

        private onStrangerChat(): void {
            let status: number = 1 - this.clipLimitChat.index;
            net.sendAndWait(new pb.cs_receive_private_chat_info({ flag: status })).then(() => {
                this.clipLimitChat.index = status;
                clientCore.GlobalConfig.isAllowStrangerChat = status == 1;
            })
        }

        private changeHidePlayerState() {
            this.clipHidePlayer.index = 1 - this.clipHidePlayer.index;
            clientCore.PeopleManager.showPlayerFlag = this.clipHidePlayer.index == 1;
        }

        private onRelogin() {
            alert.showSmall('确定要退出当前登录吗?', {
                callBack: {
                    caller: this, funArr: [() => {
                        window.location.reload();
                    }]
                }
            })
        }

        addEventListeners() {
            BC.addEvent(this, this.btnRelogin, Laya.Event.CLICK, this, this.onRelogin);
            BC.addEvent(this, this.slideMusic, Laya.Event.CHANGED, this, this.onMusicChange);
            BC.addEvent(this, this.slideSound, Laya.Event.CHANGED, this, this.onSoundChange);
            BC.addEvent(this, this.clip_notice, Laya.Event.CLICK, this, this.onNoticeChange);
            BC.addEvent(this, this.clipHidePlayer, Laya.Event.CLICK, this, this.changeHidePlayerState);
            BC.addEvent(this, this.clipLimitChat, Laya.Event.CLICK, this, this.onStrangerChat);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}