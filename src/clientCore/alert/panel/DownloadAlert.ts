
namespace alert{
    /**
     * 下载面板
     */
    export class DownloadAlert extends ui.alert.DownloadPanelUI{

        constructor(){ super(); }

        show(desc: string): void{
            clientCore.DialogMgr.ins.open(this);
            this.update(desc,0);
        }

        close(): void{
            clientCore.DialogMgr.ins.close(this);
        }

        /**
         * 更新界面数据
         * @param desc 说明文字
         * @param progress type为1时有值 下载进度  
         */
        update(desc: string,progress: number): void{
            this.imgProgress.width = 533 * progress / 100;
            this.txProgress.changeText(`${progress}%(${desc})`);
        }

        private static _ins: DownloadAlert;
        public static get ins(): DownloadAlert{
            return this._ins || (this._ins = new DownloadAlert());
        }
    }
}