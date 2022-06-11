namespace clientCore {
    export class CustomHeadManager {

        private curChannle: string;
        private tempSecretId: string;
        private tempSecretKey: string;
        private expiredTime: number;

        init() {

        }


        /**保存当前头像 */
        static async creatHead(width: number, height: number, x: number, y: number): Promise<boolean> {
            // let canvas = this.equalCanvas(Laya.stage.drawToCanvas(160, 160, -500, -100));
            // let base64 = canvas.toBase64('image/png', 0.9);
            // clientCore.LocalInfo.srvUserInfo.uploadImage = base64;
            // clientCore.LocalInfo.srvUserInfo.headImage = 0;
            // EventManager.event(globalEvent.USER_HEAD_IMAGE_CHANGE);
            return Promise.resolve(true);
            // return net.sendAndWait(new pb.cs_set_user_upload_head_image({ imageStr: base64 })).then(() => {
            //     alert.showFWords('保存成功');
            //     clientCore.LocalInfo.srvUserInfo.uploadImage = base64;
            //     clientCore.LocalInfo.srvUserInfo.headImage = 0;
            //     EventManager.event(globalEvent.USER_HEAD_IMAGE_CHANGE);
            //     return Promise.resolve(true);
            // })
        }

        /**获得自定义头像Url */
        static base64ToUrl(value: string) {
            let url = Laya.Browser.window.URL.createObjectURL(this.base64ToBlob(value, 'png'));
            return url;
        }

        /**获取临时密钥 */
        private getAuthorization() {
            let dec: string;
            let http: Laya.HttpRequest = new Laya.HttpRequest();
            http.once(Laya.Event.COMPLETE, this, (data: any) => {
                if (data) {
                    console.info(data);
                }
            })
            http.http.withCredentials = true;
            let postStr: string = ``;
            http.send('http://127.0.0.1:3000/sts', postStr, "post");
        }

        /**
         * 完成合适的canvas
         * @param canvas 
         */
        private static equalCanvas(canvas: Laya.HTMLCanvas): Laya.HTMLCanvas {
            if (Laya.Browser.onIOS) return canvas;
            let sp: Laya.Sprite = new Laya.Sprite();
            let texture: Laya.Texture = canvas.getTexture();
            sp.graphics.drawTexture(texture);
            let mask: Laya.Sprite = new Laya.Sprite();
            mask.graphics.clear();
            mask.graphics.drawPie(80, 80, 80, 0, 360, "#000000");
            // sp.addChild(mask);
            sp.mask = mask;
            // sp.scaleY = -1;
            return sp.drawToCanvas(texture.width, texture.height, 0, 0);
        }

        private static base64ToBlob(urlData, type) {
            let arr = urlData.split(',');
            let mime = arr[0].match(/:(.*?);/)[1] || type;
            // 去掉url的头，并转化为byte
            let bytes = window.atob(arr[1]);
            // 处理异常,将ascii码小于0的转换为大于0
            let ab = new ArrayBuffer(bytes.length);
            // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
            let ia = new Uint8Array(ab);
            for (let i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i);
            }
            return new Blob([ab], {
                type: mime
            });
        }
    }
}