/**
 * Created by lynx on 2015/5/21.
 */
namespace util {
    export class StringUtils {
        private static _formatRegExp: RegExp = new RegExp("{(\\d+)(?:\\:([a-zA-Z])+([0-9])*)?}", "g");

        /**
         * 把数字按split 隔nth分割(从右边开始算nth)
         * splitNumber(123456789,'!',3) => 123!456!789
         * @param n 
         * @param split 
         * @param nth 
         */
        static splitNumber(n: number, split: string, nth: number) {
            let str: string = n.toString();
            let len: number = str.length - 1;
            let valueStr: string = "";
            for (let i: number = len; i >= 0; i--) {
                if (len - i != 0 && (len - i) % nth == 0) {
                    valueStr = split + valueStr;
                }
                valueStr = str[i] + valueStr;
            }
            return valueStr;
        }
        /**
         * 整数数前面补0
         * @param n 整数
         * @param len 一共要多少位
         */
        static fillZero(n: number, len: number): string {
            let str = n.toString();
            if (len > str.length) {
                for (let i = 0; i < len - str.length; i++) {
                    str = '0' + str;
                }
            }
            return str;
        }

        /**
         * 数字转中文 [0-100)
         * @param n 
         */
        static num2Chinese(n: number): string {
            let ten = Math.floor(n / 10);
            let one = n - ten * 10;
            let str = '';
            if (n < 10) {
                str = this.getChinese(n);
            }
            else {
                if (one == 0) {
                    str = this.getChinese(ten) + '十';
                }
                else {
                    str = this.getChinese(ten) + '十' + this.getChinese(one);
                }
            }
            if (n > 9 && n < 20) {
                str = str.substring(1);
            }
            return str;
        }

        private static getChinese(n: number): string {
            let arr = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            return arr[n];
        }

        public static getDayChinese(n: number): string {
            let arr = ["零", "一", "二", "三", "四", "五", "六", "日"];
            return arr[n];
        }
        /**
         * 秒数转  时 分 秒 中间用传入的分隔符隔开
         * @param time 秒数
         * @param split 分割符
         */
        static getDateStr(time: number, split: string = ':'): string {
            let h = Math.floor(time / 3600);
            let m = Math.floor((time - h * 3600) / 60);
            let s = Math.floor(time % 60);
            let sh = h < 10 ? '0' + h : h;
            let sm = m < 10 ? '0' + m : m;
            let ss = s < 10 ? '0' + s : s;
            return `${sh}${split}${sm}${split}${ss}`;
        }

        /**
         * 获取时分秒的
         * @param time 时间戳（秒）
         * @param mod 字符模板 比如要获取的是'时--秒'格式.可以传入 {hour}--{sec}
         */
        static getDateStr2(time: number, mod: string = '{hour}:{min}:{sec}'): string {
            let h = Math.floor(time / 3600);
            let m = Math.floor((time - h * 3600) / 60);
            let s = Math.floor(time % 60);
            let sh = h < 10 ? '0' + h : h.toString();
            let sm = m < 10 ? '0' + m : m.toString();
            let ss = s < 10 ? '0' + s : s.toString();
            let rtn = mod.replace('{hour}', sh).replace('{min}', sm).replace('{sec}', ss);
            return rtn;
        }

        static getTimeStr(second: number): string {
            let h = Math.floor(second / 3600);
            let m = Math.floor((second - h * 3600) / 60);
            let s = Math.floor(second % 60);
            let out: string = "";
            h > 0 && (out += h + "h");
            m > 0 && (out += m + "m");
            s > 0 && (out += s + "s");
            return out;
        }

        /**获取时分秒 */
        static getTimeStr2(second: number): string {
            let d = Math.floor(second / 86400);
            second -= (d * 86400);
            let h = Math.floor(second / 3600);
            let m = Math.floor((second - h * 3600) / 60);
            let s = Math.floor(second % 60);
            let out: string = "";
            d > 0 && (out += d + '天');
            h > 0 && (out += h + "时");
            m > 0 && (out += m + "分");
            out += s + "秒";
            return out;
        }

        static getTime(time: number, mod: string = '{day}:{hour}:{min}:{sec}'): string {
            let d: number = Math.floor(time / 86400);
            time -= (d * 86400);
            let h: number = Math.floor(time / 3600);
            let m: number = Math.floor((time - h * 3600) / 60);
            let s: number = Math.floor(time % 60);
            let sh: string = h < 10 ? '0' + h : h.toString();
            let sm: string = m < 10 ? '0' + m : m.toString();
            let ss: string = s < 10 ? '0' + s : s.toString();
            return mod.replace('{day}', d + "").replace('{hour}', sh).replace('{min}', sm).replace('{sec}', ss);
        }

        public static format(input: string, ...values): string {
            return StringUtils.getFormat(input, values);
        }

        public static getFormat(input: string, values: Array<any>): string {
            if (input == null)
                return "";
            var self = this;
            var result: string = input.replace(StringUtils._formatRegExp, (subString: string, ...args: any[]) => {
                var value: any = values[parseInt(args[0])];
                if (args.length > 1) {
                    var type: string = args[1];
                    switch (type) {
                        case "D":
                            return StringUtils._formatDNumber(value, parseInt(args[2]));
                        case "X":
                            return StringUtils._formatXNumber(value, parseInt(args[2]));
                        case "F":
                            return StringUtils._formatFNumber(value, parseInt(args[2]));
                        default:
                            return value;
                    }
                }
                return value;
            });
            return result;
        }

        private static _formatDNumber(d: any, n: number): string {
            var result: string = d.toString();
            while (result.length < n) {
                result = "0" + result;
            }
            return result;
        }

        private static _formatXNumber(d: any, n: number): string {
            return StringUtils._formatDNumber(d.toString(16).toUpperCase(), n);
        }

        private static _formatFNumber(d: any, n: number): string {
            return d.toFixed(2);
        }

        public static parseToIntArray(s: string, splitter: string = ','): Array<any> {
            if (StringUtils.isBlank(s))
                return [];
            var strs: Array<any> = s.split(splitter);
            var length: number = strs.length;
            var result: Array<any> = new Array<any>(length);
            for (var i: number = 0; i < length; i++) {
                result[i] = parseInt(strs[i]);
            }
            return result;
        }

        public static parseToFloatArray(s: string, splitter: string = ','): Array<any> {
            if (StringUtils.isBlank(s))
                return [];
            var strs: Array<any> = s.split(splitter);
            var length: number = strs.length;
            var result: Array<any> = new Array<any>(length);
            for (var i: number = 0; i < length; i++) {
                result[i] = parseFloat(strs[i]);
            }
            return result;
        }

        public static sParseInt(s: string): number {
            if (s != null && s != "")
                return parseInt(s.replace(/[^0-9.]/ig, ""));
            return 0;
        }

        public static isBlank(input: string): boolean {
            return (input == null || input == "");
        }

        public static textToHtml(input: string): string {
            var result: string = input;
            result = result.replace(/\this.n/g, "<br/>");
            return result;
        }

        public static trim(str: string): string {
            if (str == null)
                return '';

            var startIndex: number = 0;
            while (StringUtils.isWhitespace(str.charAt(startIndex)))
                ++startIndex;

            var endIndex: number = str.length - 1;
            while (StringUtils.isWhitespace(str.charAt(endIndex)))
                --endIndex;

            if (endIndex >= startIndex)
                return str.slice(startIndex, endIndex + 1);
            else
                return "";
        }

        public static isWhitespace(character: string): boolean {
            switch (character) {
                case " ":
                case "\t":
                case "\r":
                case "\n":
                case "\f":
                    return true;

                default:
                    return false;
            }
        }

        public static equalsIgnoreCase(left: Object, right: Object): boolean {
            if (left == right) {
                return true;
            } else if (left == null || right == null) {
                return false;
            } else {
                var leftS: string = left.toString();
                var rightS: string = right.toString();
                return (leftS.length == rightS.length && leftS.toLowerCase() == rightS.toLowerCase());
            }
        }

        public static getColorText(str: String, color: string): string {
            return `<span style="color:${color};font-family:汉仪中圆简;">${str}</span>`;
        }

        // public static getHrefColorText(str:string,color:string):string{
        //     return `<span style="color:${color};font:50px;font-family:汉仪中圆简;href='www.baidu.com'">${str}</span>`;
        // }

        /**
         * 获取html文件 
         * @param array 格式[value1,color1,value2,color2.....]
         */
        public static getColorText2(array: string[]): string {
            let htmlStr: string = "";
            let len: number = array.length;
            for (let i: number = 0; i < len; i += 2) {
                htmlStr += this.getColorText(array[i], array[i + 1]);
            }
            return htmlStr;
        }

        /**
         * 将一段文本转化成2中颜色的html文本，其中需要换色的用大括号包起来（不支持多重嵌套）
         * @param str 文本 e.g.  普通文本{我要换色}普通文本
         * @param oriColor 基础颜色
         * @param replaceColor 需要换的色
         */
        public static getColorText3(str: string, oriColor: string, replaceColor: string) {
            let openTag = color => `<span style="color:${color};font-family:汉仪中圆简;">`
            let closeTag = '</span>'

            str = str.replace(/<br>/g,closeTag+"<br>"+openTag(oriColor));

            let rtn = _.startsWith(str, '{') ? openTag(replaceColor) : openTag(oriColor);
            for (const childStr of str) {
                if (childStr == '{') {
                    //需要替换颜色 
                    rtn += closeTag;
                    rtn += openTag(replaceColor);
                }
                else if (childStr == '}') {
                    //切换回原来颜色
                    rtn += closeTag;
                    rtn += openTag(oriColor);
                }
                else {
                    rtn += childStr;
                }
            }

            rtn += closeTag;
            // rtn = rtn.replace(/\\\n/g,"<br/>");
            return rtn;
        }

        /**
         * 文本过滤emoji
         * @param value 
         */
        public static filterEmoji(value: string): string {
            return value.replace(/[\u2190-\u21FF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\u3000-\u303F]|[\u1F300-\u1F64F]|[\u1F680-\u1F6FF]/g, "");
        }

        /**
         * 判断名字是否合法（只包含常见汉子，英文大小写，数字）
         * @param str 
         */
        public static testName(str: string) {
            let reg = /^[\u4e00-\u9fa5A-Za-z0-9]+$/;
            return reg.test(str);
        }

        /**
         * needNum的数量为0，则只显示数量，不带斜杠
         * @param haveNum 
         * @param needNum 
         */
        public static parseNumFontValue(haveNum: number, needNum: number = 0): string {
            if (needNum == 0) {
                return haveNum.toString();
            }
            let str = "";
            if (haveNum >= needNum) {
                str += this.getOneChar("abcdefghij", haveNum);
            }
            else {
                str += this.getOneChar("klmnopqrst", haveNum);
            }
            str += "/";
            str += needNum.toString();
            return str;
        }
        public static getOneChar(charStr: string, value: number): string {
            let str = "";
            let vStr = value.toString();
            for (let i = 0; i < vStr.length; i++) {
                let v = vStr.charAt(i);
                str += charStr.charAt(parseInt(v));
            }
            return str;
        }
    }
}