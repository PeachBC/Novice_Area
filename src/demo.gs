function testPrint()
{
  var string = "qweDay2QQQ"; // user input
  var retValue = checkHW_day(string);

  if (retValue > 0)
  {
    Logger.log("CheckIn for day:"+ retValue);
  }
  else
  {
    Logger.log("Ignore, due to invalid day info");
  }

  var groupID = "TestGroup";
  var userID = "TestUsuer";
  var userName = "測試人員QQ";
  var retRow = checkUser(groupID, userID, userName);

  Logger.log("row:"+retRow);
  Logger.log("colum_Homewrok_UserID:"+ss_Homewrok_data[retRow][colum_Homewrok_UserID] );

  ss_Homewrok.getRange(retRow, Number(retValue)+4).setValue("v");			// 打卡
}