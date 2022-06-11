namespace util {

    /**
     * 显示图片数字
     * @param spTex 承载对象
     * @param resPath 资源路径（确保资源已经载入）
     * @param numStr 显示内容
     * @param space 间距
     */
    export function showTexWord(spTex: Laya.Sprite, resPath: string, numStr: string, space?: number): void {
        if (!spTex || numStr == "") return;
        spTex.graphics.clear();
        var x: number = 0;
        var tex: Laya.Texture;
        var url: string;
        for (var ele of numStr) {
            url = resPath + "/" + ele + ".png";
            tex = Laya.loader.getRes(url);
            if (!tex) console.error("没有字体资源:", url)
            spTex.graphics.drawTexture(tex, x, 0, tex.sourceWidth, tex.sourceHeight);
            x += tex.sourceWidth;
            space && (x += space);
        }
        spTex.width = x;
    }

    /**
     * 替换字符串文字 xxx{0}xx
     * @param str 
     * @param args 
     */
    export function getLang(str: string, ...args): string {
        for (let i = 0; i < args.length; i++) {
            str = str.replace(/\{[0-9]\}/, args[i]);
        }
        return str;
    }

    export function getLang2(str: string, args: any[]) {
        for (let i = 0; i < args.length; i++) {
            str = str.replace(/\{[0-9]\}/, args[i]);
        }
        return str;
    }

    /**
     * 将数字替换成带逗号的字符串 如 1000000 -> 1,000,000
     * @param value 
     */
    export function pareseNumb(value: number): string {
        let str: string = value.toString();
        let len: number = str.length - 1;
        let valueStr: string = "";
        for (let i: number = len; i >= 0; i--) {
            if (len - i != 0 && (len - i) % 3 == 0) {
                valueStr = "," + valueStr;
            }
            valueStr = str[i] + valueStr;
        }
        return valueStr;
    }

    /**
     * 战斗log
     * @param value 
     */
    export function fightLog(value: string): void {
        console.log("战斗提示：" + value);
    }

    export function fightErrLog(value: string): void {
        console.log("战斗错误：" + value);
    }


    /**
     * 保留小数后多少位
     * @param value 
     * @param cnt 
     */
    export function tofix(value: number, cnt: number): number {
        let v: number = Math.pow(10, cnt);
        return Math.floor(value * v) / v;
    }
    export function tofix2(value: number, cnt: number): string {
        let f: number = Math.round(value * 100) / 100;
        let s: string = f.toString();
        let rs: number = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + cnt) {
            s += '0';
        }
        return s;
    }
}