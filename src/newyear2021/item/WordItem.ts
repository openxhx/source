namespace newyear2021{

    export class WordItem extends Laya.Image{
        constructor(){
            super();
            this.size(34,34);
        }

        set yellow(value: boolean){
            if(value){
                let colorFilter: Laya.ColorFilter = new Laya.ColorFilter();
                colorFilter.setColor('#ebdc9a');
                this.filters = [colorFilter];
            }else{
                this.filters = [];
            }
        }
    }
}