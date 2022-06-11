namespace cp {


    /**
     * cp支持者
     */
    export class CpSupporter {
        constructor() { }


        /**
         * 打开一个支持项目
         * @param name 
         */
        async open(name: string, data: any): Promise<void> {
            let array: string[] = name.split('.');
            let url: string = `atlas/${array[0]}.png`;
            let mod: ISupporter<any> = new cp[array[1]];
            !res.get(url) && mod.addPreLoad(res.load(url));
            mod.show(data);
        }
    }
}