namespace shop {
    export interface IShopPanel {
        show();
        hide();
        addEventListeners();
        removeEventListeners();
        setData(value:ShopItemData[]);
        getBtnBuy(index:number);
        showDirectBuy(id:number);
    }
}