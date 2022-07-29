function testPrint()
{
    Logger.log(CHANNEL_ACCESS_TOKEN);
    Logger.log(sheetID);


	var now = new Date();
	var nowDate = now.getDate();
	var nowMonth = now.getMonth()+1;
	Logger.log(nowDate);
	Logger.log(nowMonth);
}

function testDay()
{
	Logger.log(CHANNEL_ACCESS_TOKEN);
	Logger.log(sheetID);

	// colum C = StartDate, Colum E = StartTime
	var hd = new Date ((+new Date(ss_GroupDB_data[0][2])) + (+new Date(ss_GroupDB_data[0][4])) - (+new Date('1899/12/30 00:00:00'))).valueOf() ;

	var td=new Date().valueOf();	// current date
	var sec=1000;
	var min=60*sec;
	var hour=60*min;
	var day=24*hour;
	var diff=td-hd;
	var days=Math.floor(diff/day);
	var hours=Math.floor(diff%day/hour);
	var minutes=Math.floor(diff%day%hour/min);
	Logger.log('%s days %s hours %s minutes',days,hours,minutes);

	var day = days;
	if (hour > 0 ||  minutes > 0)
	{
		day++;
		Logger.log("day diff:"+day);
	}
	var broadcastTargetID = ss_GroupDB_data[0][0]; // hard code as A2
	Logger.log(broadcastTargetID);
}
