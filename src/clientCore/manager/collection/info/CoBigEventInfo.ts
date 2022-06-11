namespace clientCore {
    export class CoBigEventInfo {
        public readonly srvData: pb.IReportInfo;
        public readonly xlsInfo: xls.collectChronicle;
        constructor(srv: pb.IReportInfo) {
            this.srvData = srv;
            this.xlsInfo = xls.get(xls.collectChronicle).get(this.srvData.id);
        }

        /**完成时间 按照本地时区的时间来*/
        get finishDate() {
            let d = new Date(this.srvData.finishTime);
            return d.getFullYear() + '.' + d.getMonth() + '.' + d.getDate();
        }

        /**显示文本（不管是否完成都可以用） */
        get text() {
            if (this.srvData.finishTime > 0) {
                let str = this.xlsInfo.chronicleContent;
                let data = JSON.parse(this.srvData.data);
                for (const key in data) {
                    str = str.replace('#' + key, data[key] + '#');
                }
                return str;
            }
            else {
                return this.xlsInfo.needType;
            }
        }
    }
}