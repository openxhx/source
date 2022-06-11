

namespace clientCore{    
    /**
     * 科技树管理者
     */
    export class ScienceTreeManager{

        private _treeNodes: util.HashMap<TreeNode>;
        
        /** 是否开启*/
        public isOpen: boolean = false;

        constructor(){}

        public async setup(): Promise<void>{
            const data:pb.sc_get_science_tree_info = await net.sendAndWait(new pb.cs_get_science_tree_info());
            await MedalManager.getMedal([MedalConst.SCIENCE_OPEN_STATUS]).then((data:pb.ICommonData[])=>{
                this.isOpen = _.find(data,{"id": MedalConst.SCIENCE_OPEN_STATUS}).value == 1;
            })
            this._treeNodes = new util.HashMap<TreeNode>();
            _.forEach(data.infos,(element)=>{
                let treeNode:TreeNode = TreeNode.create(element);
                this._treeNodes.add(treeNode.id,treeNode);
            })
        }

        /** 开启树*/
        public open(): void{
            this.isOpen = true;
            let data: pb.CommonData = new pb.CommonData();
            data.id = MedalConst.SCIENCE_OPEN_STATUS;
            data.value = 1; //0-未开启 1-开启
            MedalManager.setMedal([data])
        }

        /**
         * 根据科技点ID和等级获取配置
         * @param id 
         * @param lv 
         */
        public getXls(id:number,lv:number): xls.scienceTree{
            let array:xls.scienceTree[] = xls.get(xls.scienceTree).getValues();
            let len:number = array.length;
            for(let i:number=0;i<len; i++){
                let element:xls.scienceTree = array[i];
                if(element && element.sciId == id && element.sciLevel == lv){
                    return element;
                }
            }
            return null;
        }

        /**
         * 获得节点
         * @param id 
         */
        public getTreeNode(id:number): TreeNode{
            return this._treeNodes.get(id);
        }

        public checkTreeNode(id:number):boolean{
            return this._treeNodes.has(id);
        }

        public changeTreeNode(data:pb.treeInfo): void{
            let info:TreeNode = this._treeNodes.get(data.sciId);
            if(!info){
                info = TreeNode.create(data);
                this._treeNodes.add(info.id,info);
            }else{
                info.lv = data.sciLevel;  
                info.xlsData = this.getXls(info.id,info.lv);  
            }
        }   

        /**
         * 科技点增量
         * 1.家园种植上限提升
           2.所有花种产量提升
           3.小屋生产时有的几率获得额外1个产品
           4.特殊产品售价提升
           5.特殊产品出产几率提升
           6.杂草出现几率降低
           7.所有花种种植时间缩短
           8.水域花种产量额外提升
           9.地面花种产量额外提升
           10.所有小屋生产时间缩短
           11.订单仙豆奖励
           12.订单经验奖励提升
           13.所有产品售价提升
         */
        public increment(type: number): number{
            let cnt: number = 0;
            let array: TreeNode[] = this._treeNodes.getValues();
            _.forEach(array,(element:TreeNode)=>{
                let index: number = element.effects.indexOf(type);
                if(index != -1){
                    cnt += element.xlsData.sciEffect[index]
                }
            })
            return cnt;
        }

        private static _ins: ScienceTreeManager;
        public static get ins(): ScienceTreeManager{
            return this._ins || (this._ins = new ScienceTreeManager());
        }
    }

    export class TreeNode{
        public id: number;
        public lv: number;
        public name: string;
        public maxLv: number;
        public xlsData: xls.scienceTree;
        public effects: number[];

        constructor(){}

        parseMax(): void{
            this.maxLv = 0;
            let array:xls.scienceTree[] = xls.get(xls.scienceTree).getValues();
            _.forEach(array,(element:xls.scienceTree)=>{
                element.sciId == this.id && (this.maxLv++);
            })
        }

        static create(element:pb.ItreeInfo): TreeNode{
            let treeNode:TreeNode = new TreeNode();
            treeNode.id = element.sciId;
            treeNode.lv = element.sciLevel;
            treeNode.xlsData = ScienceTreeManager.ins.getXls(element.sciId,element.sciLevel);
            let unlock:xls.scienceTreeUnlock = xls.get(xls.scienceTreeUnlock).get(element.sciId);
            treeNode.effects = unlock.sciType;
            treeNode.name = unlock.sciName;
            treeNode.parseMax();
            return treeNode;
        }
    }
}