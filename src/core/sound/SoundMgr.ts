namespace core{


    const 
        SoundManager = Laya.SoundManager,
        Browser = Laya.Browser,
        URL = Laya.URL,
        Render = Laya.Render,
        Utils = Laya.Utils,
        Loader = Laya.Loader
    /**
     * 声音
     */
    export class SoundMgr{
        constructor(){
        }

        static reset(): void{
            Laya.SoundManager.playSound=function(url,loops,complete,soundClass,startTime){
                (loops===void 0)&& (loops=1);
                (startTime===void 0)&& (startTime=0);
                if(!url) return null;
                SoundManager['_recoverWebAudio']();
                url=URL.formatURL(url);
                if (url!=SoundManager['_tMusic']){
                    if (Render.isConchApp){
                        var ext=Utils.getFileExtension(url);
                        if (ext !="wav" && ext !="ogg"){
                            alert("The sound only supports wav or ogg format,for optimal performance reason,please refer to the official website document.");
                            return null;
                        }
                    }
                    if(!SoundManager['_isActive'] || SoundManager['_muted'] || SoundManager['_soundMuted']){
                        return null;
                    }
                };
                var tSound;
                if (!Browser.onMiniGame){
                    tSound=Laya.loader.getRes(url);
                }
                if (!soundClass)soundClass=SoundManager['_soundClass'];
                if (!tSound){
                    tSound=new soundClass();
                    tSound.load(url);
                    if (!Browser.onMiniGame){
                        Loader.cacheRes(url,tSound);
                    }
                };
                var channel;
                channel=tSound.play(startTime,loops);
                if (!channel)return null;
                if(url == SoundManager['_tMusic']){
                    if(!SoundManager['_isActive'] || SoundManager['_muted'] || SoundManager['_musicMuted']){
                        channel.pause();
                        SoundManager['_blurPaused']=true;
                    }
                }
                channel.url=url;
                channel.volume=(url==SoundManager['_tMusic'])? SoundManager.musicVolume :SoundManager.soundVolume;
                channel.completeHandler=complete;
                return channel;
            }
        }
    }
}