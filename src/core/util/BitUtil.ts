/**
 * Created by wq on 2015/8/19.
 */
namespace util {
    /**
     * 读取uint类型某位的值, bit从1开始
     */
    export function getBit(value: number, bit: number): number {
        return (value & (1 << (bit - 1))) >> (bit - 1);
    }

    /**
     * add by robinliu 2016 9 26
     * 设置value 第bit(从1开始)位的值为v(0|1)
     * 谨记bit<32
     */
    export function setBit(value: number, bit: number, v: 0 | 1): number {
        if (bit > 32) {
            console.error("bit out " + bit);
            return;
        }
        if (v == 1) {
            return value | v << (bit - 1);
        }
        else {
            return value &= (~0) ^ (1 << (bit - 1))
        }
    }

    /**获取1的个数 */
    export function get1num(value: number) {
        let count = 0
        while (value) {
            value = value & (value - 1);
            count++;
        }
        return count;
    }
    /**bit从1开始 */
    export function getBitArray(value:number,startBit:number,endBit:number):number[]{
        let arr:number[] = [];
        for(let i = startBit;i<=endBit;i++){
            arr.push(getBit(value,i));
        }
        return arr;
    }
}