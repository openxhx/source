/// <reference path="../util/HashMap.ts" />
namespace xls {
    let allXls: util.HashMap<util.HashMap<any>> = new util.HashMap();
    //这里特殊处理下，laya加载资源时会保留?后面的字段，所以先进游戏时给他随机一个固定数字，
    const ranNum = Date.now();

    export function load(xlsClass: any, ignoreCache: boolean = false): Promise<void> {
        let url = getXlsPath(xlsClass['name']);
        if (ignoreCache)
            url += `?${ranNum}`;
        return res.load(url);
    }

    export function get<T>(a: { new(): T }): util.HashMap<T> {
        let xlsName = a['name'];
        if (!allXls.has(xlsName)) {
            let url = getXlsPath(xlsName);
            let xlsRes = res.get(url) || res.get(url + `?${ranNum}`);
            if (xlsRes) {
                let xlsData = new util.HashMap<T>();
                for (let json of xlsRes) {
                    let elem: T = json;
                    xlsData.add(elem[Object.keys(elem)[0]], elem);
                }
                allXls.add(xlsName, xlsData);
            }
        }
        return allXls.get(xlsName);
    }

    function getXlsPath(xlsName: any) {
        return pathConfig.getXlsJsonPath(xlsName);
    }

}

