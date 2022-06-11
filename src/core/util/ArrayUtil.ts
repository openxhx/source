namespace util {
    export function arraysAreEqual(arr1: any[], arr2: any[]): boolean {
        if (arr1.length != arr2.length) {
            return false;
        }
        let isd: boolean;
        isd = arr1.every((item) => {
            if (arr2.indexOf(item) == -1) {
                return false;
            }
            return true;
        });
        if (!isd) {
            return false;
        }
        isd = arr2.every((item) => {
            if (arr1.indexOf(item) == -1) {
                return false;
            }
            return true;
        });
        return isd;
    }

    /**
     * 创建数字序列(包含两端)
     * @param from 
     * @param to 
     */
    export function createArrayQue(from: number, to: number) {
        let arr = [];
        for (let i = from; i <= to; i++) {
            arr.push(i);
        }
        return arr;
    }
}
