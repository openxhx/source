namespace clientCore {
    export class Logger {
        static sendLog(first: string, second: string, third: string) {
            if (clientCore.GlobalConfig.isApp) {
                let http: Laya.HttpRequest = new Laya.HttpRequest();
                let gameId = channel.ChannelControl.ins.isOfficial ? 695 : 708;
                http.send(`http://newmisc.taomee.com/misc.js?gameid=${gameId}&stid=${first}&sstid=${second}&uid=${clientCore.LocalInfo.uid}&item=${third}`, null, 'post');
            }
        }
    }
}