function testPrint()
{
    Logger.log(CHANNEL_ACCESS_TOKEN);
    Logger.log(ss_GroupDB.getLastRow());

	var Today = new Date;
	var Today_date = Today.getDate();
	var Today_Month = Today.getMonth()+1;

		Logger.log(Today_date + "= Today_date.");

	if (Today_date > 30)
	{
		Logger.log(Today_date + " is out of range.");
		return;
	}
	for (var i = 0; i < ss_GroupDB.getLastRow()-1; i++)
	{
		// 確認 有enable 且 有token
		if (ss_GroupDB_data[i][columEnable] == 1 && ss_GroupDB_data[i][columnotifyToken] !="")
		{
			// 判斷 要發哪天文章
			if (Today_Month == ss_GroupDB_data[i][columStartMonth])
			{
				DateBase = 0;
			}
			else if (Today_Month == ss_GroupDB_data[i][columEndMonth])
			{
				DateBase = secondRoundBase;
			}
			else
			{
				Logger.log(Today_Month+" is not in the range between"+ ss_GroupDB_data[i][columStartMonth]+" to "+ss_GroupDB_data[i][columEndMonth]);
				continue;
			}
			var Day = Today_date + DateBase;
			
			var dayinfo = Day + ColumRecord;

			if (ss_GroupDB_data[i][dayinfo-1] == 1)
			{
				Logger.log("已發過影片 > 發文");
				SendNotifyMaterial_txt(Day, columText, ss_GroupDB_data[i][columnotifyToken]);
				SendNotifyMaterial_image(Day, columImage, ss_GroupDB_data[i][columnotifyToken]);

				ss_GroupDB.getRange(i+2, dayinfo).setValue(2);
			}
			else
			{
          Logger.log("已發過/未發過影片 跟 文字 & 圖片. Day:"+Day);
			}

			//例外處理 for day 1 (if 大家早安, 發 day 0文章)
			if (Day == 1)
			{
				Day = 0;
        dayinfo = Day + ColumRecord;

        if (ss_GroupDB_data[i][dayinfo-1] == 1)
        {
          Logger.log("已發過影片 > 發文");
          SendNotifyMaterial_txt(Day, columText, ss_GroupDB_data[i][columnotifyToken]);
          SendNotifyMaterial_image(Day, columImage, ss_GroupDB_data[i][columnotifyToken]);

          ss_GroupDB.getRange(i+2, dayinfo).setValue(2);
        }
        else
        {
          Logger.log("已發過/未發過影片 跟 文字 & 圖片. Day:"+Day);
        }
			}

		}
		else
		{
			Logger.log("Row:"+ i +" "+ ss_GroupDB_data[i][columEnable] + " " + ss_GroupDB_data[i][columnotifyToken]+ ", disable or no token");
		}
	}
}