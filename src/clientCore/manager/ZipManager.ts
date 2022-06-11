namespace clientCore{
      
      export class ZipManager{


            private readonly DOWNLOAD_PATH: string = "http://hot-xhx-download.61.com/downloadZips/";
            private readonly ZIP_VERSION: string = "ZIP_VERSION";
            private readonly TIMES: number = 3;//下载失败的重试次数
            private version: number;
            private total: number;
            private current: number;

            private currentTimes: number;
            

            constructor(){}
            
            public async setup(): Promise<void>{
                  if(!Laya.Render.isConchApp || Laya.Browser.onIOS)return;
                  let path: string = `${this.DOWNLOAD_PATH}version.txt?t=${Laya.Browser.now()}`;
                  this.version = await this.getVersion(path);
                  util.print("js client:",`version is ${this.version}`);

                  let localVersion: number = parseInt(window.localStorage.getItem(this.ZIP_VERSION)) || 1000;
                  if(localVersion < this.version){
                        this.currentTimes = 0;
                        this.total = this.version - localVersion;
                        this.current = 0;
                        let size: number = await this.getSize();
                        if(size > 0){
                              let desc: string = `发现新版本资源(${size}MB),建议在wifi下进行更新。也可以直接进入游戏，更新资源将在游戏进行中自动下载。`
                              alert.showSmall(desc,{
                                    callBack:{
                                          funArr: [
                                          ()=>{ //确定
                                                alert.DownloadAlert.ins.show(this.current+"/"+this.total);
                                                this.download(localVersion+1);
                                          },
                                          ()=>{ //取消 直接刷新到最新的版号
                                                window.localStorage.setItem(this.ZIP_VERSION,this.version+"");
                                          }],
                                          caller: this
                                    },
                                    needClose: false,
                                    clickMaskClose: false
                              })
                        }
                  }
            }

            /**
             * 下载
             * @param id 版号号 
             */
            private download(id: number): void{
                  let zipPath: string = `${this.DOWNLOAD_PATH}${id}.zip`;
                  util.print("js client:","start download",zipPath); 
                  NativeMgr.instance.updateByZip(zipPath,
                        Laya.Handler.create(this,(result)=>{//下载完成检查是否到最新的 没有则继续
                              if(result == "fail" && ++this.currentTimes <= this.TIMES){ //失败了 重新下吧
                                    util.print("js client:","download fail try again ",this.currentTimes); 
                                    this.download(id);
                                    return;
                              }
                              this.currentTimes = 0;
                              let ver: number = id + 1;
                              window.localStorage.setItem(this.ZIP_VERSION,ver+"");
                              if(++this.current == this.total){ //下完惹
                                    util.print("js client:","update finish"); 
                                    alert.DownloadAlert.ins.close();
                              }else{
                                    alert.DownloadAlert.ins.update(this.current+"/"+this.total,0);
                                    this.download(ver);
                              }
                        }), 
                        Laya.Handler.create(this,(progress: number)=>{ alert.DownloadAlert.ins.update(this.current+"/"+this.total,progress); },null,false));
            }


            private getVersion(url: string): Promise<number>{
                  return new Promise((suc)=>{
                        Laya.loader.load(url,Laya.Handler.create(this,(data)=>{ suc(parseInt(data)); }),null,Laya.Loader.TEXT);
                  })
            }

            private getSize(): Promise<number>{
                  return new Promise((suc)=>{
                        Laya.loader.load(this.DOWNLOAD_PATH+"/size.json?t="+Laya.Browser.now(),Laya.Handler.create(this,(data)=>{
                              let size: number = 0;
                              for(let i:number=0; i<this.total; i++) size += parseFloat(data[this.version-i]);
                              suc(size);
                        }),null,Laya.Loader.JSON);
                  })
            }

            private static _ins: ZipManager;
            public static get ins(): ZipManager{
                  return this._ins || (this._ins = new ZipManager());
            }
      }
}