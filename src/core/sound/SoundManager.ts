namespace core {
    const musicVol_key = 'musicVol';
    const soundVol_key = 'soundVol';
    export class SoundManager {
        private static _ins: SoundManager;

        /** 当前BGM地址*/
        private static _bgmPath: string = "";
        /** BGM循环次数*/
        private static _bgmLoops: number = 0;

        private static _preBgmPath: string = "";


        /**按钮音效 */
        private _btnSoundChannel: Laya.SoundChannel;


        static get instance() {
            return this._ins || new SoundManager();
        }

        /**根据本地缓存初始化声音设置 */
        initByLocalCache() {
            let lo_musicVol = Laya.LocalStorage.getItem(musicVol_key);
            let lo_soundVol = Laya.LocalStorage.getItem(soundVol_key);
            this.musicVol = lo_musicVol ? parseFloat(lo_musicVol) : 1;
            this.soundVol = lo_soundVol ? parseFloat(lo_soundVol) : 1;
            //注册场景得到焦点
            Laya.stage.on(Laya.Event.FOCUS, this, this.onFocus);
        }

        private onFocus(): void {
            SoundManager._bgmPath != "" && !Laya.SoundManager["_musicChannel"] && this.playBgm(SoundManager._bgmPath, SoundManager._bgmLoops == 0);
        }

        constructor() {
            // SoundMgr.reset();
        }

        get musicVol() {
            return Laya.SoundManager.musicVolume;
        }

        set musicVol(p: number) {
            Laya.LocalStorage.setItem(musicVol_key, p.toString());
            Laya.SoundManager.musicVolume = p;
            Laya.SoundManager.setMusicVolume(p);
        }

        set bgmMute(b: boolean) {
            Laya.SoundManager.musicMuted = b;
        }

        get bgmMute() {
            return Laya.SoundManager.musicMuted;
        }

        get soundVol() {
            return Laya.SoundManager.soundVolume;
        }

        set soundVol(p: number) {
            Laya.LocalStorage.setItem(soundVol_key, p.toString());
            Laya.SoundManager.soundVolume = p;
            Laya.SoundManager.setSoundVolume(p);
        }

        set soundMute(b: boolean) {
            Laya.SoundManager.soundMuted = b;
        }

        get soundMute() {
            return Laya.SoundManager.soundMuted;
        }

        /**播放bgm */
        playBgm(str: string, loop: boolean = true, complete: laya.utils.Handler = null) {
            SoundManager._bgmLoops = loop ? 0 : 1;
            if (SoundManager._bgmPath != str) {
                SoundManager._preBgmPath = SoundManager._bgmPath;
                SoundManager._bgmPath = str;
                Laya.SoundManager.playMusic(str, SoundManager._bgmLoops, complete);
            }
        }
        /** 还原，播放之前播放的背景音乐 */
        recover() {
            if (SoundManager._preBgmPath && SoundManager._preBgmPath != "") {
                this.playBgm(SoundManager._preBgmPath);
            }
        }

        pauseBgm() {
            let bgmChannel: Laya.SoundChannel = Laya.SoundManager["_musicChannel"];
            bgmChannel?.pause();
        }

        resumeBgm() {
            let bgmChannel: Laya.SoundChannel = Laya.SoundManager["_musicChannel"];
            if (bgmChannel) {
                bgmChannel.loops = SoundManager._bgmLoops;
                bgmChannel.resume();
            }
        }

        /**当前播放的bgm */
        get currBgm() {
            return Laya.SoundManager["_musicChannel"]?.url;
        }

        playSound(url: string, loops: number = 1) {
            return Laya.SoundManager.playSound(url, loops);
        }

        playSoundAwait(url: string, loops: number) {
            return new Promise((ok) => {
                Laya.SoundManager.playSound(url, loops, new Laya.Handler(this, ok));
            })
        }

        playBattleSound(url: string, rate: number): void {
            Laya.SoundManager.playbackRate = rate;
            this.playSound(url);
            Laya.SoundManager.playbackRate = 1;
        }

        playBtnSound(str: string) {
            if (this._btnSoundChannel) {
                this._btnSoundChannel.url = pathConfig.getSoundUrl(str);
                this._btnSoundChannel.position == 0;
            }
            else {
                this._btnSoundChannel = Laya.SoundManager.playSound(pathConfig.getSoundUrl(str), 1);
            }
        }
    }
}