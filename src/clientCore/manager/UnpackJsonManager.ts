namespace clientCore {
    export class UnpackJsonManager {
        private static _unpackHash: util.HashMap<string[]>;
        constructor() {

        }
        public static setUp() {
            UnpackJsonManager._unpackHash = new util.HashMap();
            UnpackJsonManager.parseUnpackUrl();
        }
        private static parseUnpackUrl() {
            let json = Laya.loader.getRes('unpack.json');
            for (const url of json) {
                let name = url.split('/')[1];
                if (this._unpackHash.has(name)) {
                    this._unpackHash.get(name).push(url);
                }
                else {
                    this._unpackHash.add(name, [url]);
                }
            }
        }
        public static getUnpackUrls(name: string): string[] {
            return this._unpackHash.get(name);
        }
    }
}