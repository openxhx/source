namespace roleChain2 {
    export class RoleChainVoice {
        private static _ins: RoleChainVoice

        static get instance() {
            this._ins = this._ins ?? new RoleChainVoice();
            return this._ins;
        }
        private _channel: Laya.SoundChannel;

        /**
         * 播放角色语音
         * @param roleId 角色id
         * @param action 什么动作触发语音
         * @param extraData 额外数据
         */
        playSound(roleId: number, action: 'changeRole' | 'gift' | 'favorLvUp' | 'clickRole', extraData?: any) {
            let roleInfo = clientCore.RoleManager.instance.getRoleById(roleId);
            if (!roleInfo)
                return;
            let friendLv = _.clamp(roleInfo.faverLv, 1, 10);
            let suffix: string | number;
            let prefix: string
            switch (action) {
                case 'changeRole':
                    prefix = 'greeting';
                    let hour = (new Date()).getHours();
                    if (hour < 5)
                        suffix = 3
                    else if (hour < 11)
                        suffix = 1
                    else if (hour < 18)
                        suffix = 2;
                    else
                        suffix = 3;
                    break;
                case 'gift':
                    //根据送礼增加的好感度不同
                    prefix = 'gift';
                    if (extraData <= 14)
                        suffix = 1
                    else if (extraData <= 35)
                        suffix = 2
                    else
                        suffix = 3;
                    console.log(`送礼语音，增加了${extraData}点好感度，播放${prefix + suffix}`)
                    break;
                case 'favorLvUp':
                    prefix = ['', '', 'friendly1', 'friendly1', 'friendly1', 'story1', 'friendly2', 'friendly2', 'story2', 'friendly3', 'stroy3'][friendLv];
                    suffix = '';
                    break;
                case 'clickRole':
                    prefix = 'chat';
                    if (friendLv <= 4)
                        suffix = _.random(1, 2, false);
                    else if (friendLv <= 7)
                        suffix = _.random(3, 4, false);
                    else
                        suffix = _.random(5, 6, false);
                    break;
                default:
                    break;
            }
            this._channel?.stop();
            this._channel = core.SoundManager.instance.playSound(`res/sound/role/${roleId}/${prefix}${suffix}.ogg`, 1);
            let voiceXls = xls.get(xls.characterVoice).getValues();
            let obj = _.find(voiceXls, (o) => {
                return o.characterId == roleId && o.oggId == (prefix + suffix);
            })
            EventManager.event('VOICE_SHOW_TALK', obj ? obj.voiceText : '');
        }

        destory() {
            this._channel?.stop();
        }
    }
}