namespace util {

    export class Md5Util {

        private static _md5: md5 = new md5();

        constructor() { }

        /** 将内容进行md5加密*/
        public static encrypt(value: string): string {
            return this._md5.hex_md5(value);
        }
    }
}