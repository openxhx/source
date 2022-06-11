namespace rotateJump {
    export class ColorUtil {
        private static readonly HEX16_MAP: Array<string> = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];


        //颜色矩阵,灰色
        public static readonly grayMatrix: number[] = [
            0.3086, 0.6094, 0.0820, 0, 0, //R
            0.3086, 0.6094, 0.0820, 0, 0, //G
            0.3086, 0.6094, 0.0820, 0, 0, //B
            0, 0, 0, 1, 0, //A
        ];

        //颜色矩阵
        private static matrixTemp: number[] = [
            0, 0, 0, 0, 0, //R
            0, 0, 0, 0, 0, //G
            0, 0, 0, 0, 0, //B
            0, 0, 0, 1, 0, //A
        ];

        private static getBlackMatrixTemp(): number[] {
            this.matrixTemp[this.redIndexInMatrix] = 0;
            this.matrixTemp[this.greenIndexInMatrix] = 0;
            this.matrixTemp[this.blueIndexInMatrix] = 0;
            this.matrixTemp[this.alphaIndexInMatrix] = 1;
            return this.matrixTemp;
        }

        public static blendAddWithBlack(color: ColorData): number[] {
            let result: number[] = this.getBlackMatrixTemp();
            this.matrixTemp[this.redIndexInMatrix] = this.getAddColor(color.r, color.r) / 255;
            this.matrixTemp[this.greenIndexInMatrix] = this.getAddColor(color.g, color.g) / 255;
            this.matrixTemp[this.blueIndexInMatrix] = this.getAddColor(color.b, color.b) / 255;
            return result;
        }

        //获取叠加颜色
        //a代表下面图层颜色，b代表上面图层颜色
        private static getAddColor(a: number, b: number): number {
            let result: number;
            result = a * b / 256;
            //if(a <= 128)
            //result = a * b / 128;
            //else
            //result = 255-(255 - a) * (255 - b) / 128;
            return result;
        }

        public static rgb2Hex16(r: number, g: number, b: number): string {
            var result_string: Array<string> = new Array();
            result_string.push("#");
            result_string.push(this.HEX16_MAP[Math.floor(r / 16)]);
            result_string.push(this.HEX16_MAP[(r % 16)]);
            result_string.push(this.HEX16_MAP[Math.floor(g / 16)]);
            result_string.push(this.HEX16_MAP[(g % 16)]);
            result_string.push(this.HEX16_MAP[Math.floor(b / 16)]);
            result_string.push(this.HEX16_MAP[(b % 16)]);
            return result_string.join("");
        }

        public static readonly redIndexInMatrix: number = 0;
        public static readonly greenIndexInMatrix: number = 6;
        public static readonly blueIndexInMatrix: number = 12;
        public static readonly alphaIndexInMatrix: number = 18;
    }
}