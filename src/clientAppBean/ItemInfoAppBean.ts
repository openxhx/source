namespace clientAppBean {
    export class ItemInfoAppBean implements core.IAppBean {
        async start(data: any) {
            let loadArr = [
                xls.load(xls.materialBag),
                xls.load(xls.uiUrl),
                xls.load(xls.shop),
                xls.load(xls.itemBag),
                xls.load(xls.babySize)
                // xls.load(xls.itemCloth)
            ];
            await Promise.all(loadArr).then(() => {
                clientCore.ItemsInfo.setUp();
            });
            await clientCore.MoneyManager.setUp();
            await clientCore.ItemBagManager.setUp();
            await clientCore.MaterialBagManager.setUp();
            await clientCore.CollocationManager.setUp();
        }
    }
}
