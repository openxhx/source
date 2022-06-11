namespace util {
    export class TimerInfo {
        public totalTime: number;
        public restTime: number;
        public repeatNum: number;
        public caller: any;
        public callBackFun: Function;
        public stop:boolean = false;

        public run(){
            this.restTime--;
            if(this.restTime <= 0)
            {
                //回调执行
                this.callBackFun.call(this.caller,this.repeatNum);
                this.repeatNum--;
                if(this.repeatNum > 0){
                    this.restTime = this.totalTime;
                }
                else
                {
                    this.stop = true;
                }
            }
        }
    }
}
