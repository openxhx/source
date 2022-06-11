namespace pickingApple{
    export class PickingAppleControl implements clientCore.BaseControl{
        /**
         * 使用工具
         * @param angle 
         */
        public useTool(angle: number): void{
            net.send(new pb.cs_map_game_use_pick_pole({angle: util.tofix(angle,2)}));
        }

        /**
         * 捕获道具
         * @param pos 
         */
        public pickItem(pos: number): void{
            net.send(new pb.cs_map_game_user_pick_items({pos: pos}));
        }
    }
} 