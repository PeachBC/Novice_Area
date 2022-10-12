//程式碼開始
//load data from main sheet
var SS 						= SpreadsheetApp.getActive();

// load data from tab: config
var ss_config 				= SS.getSheetByName("config");
var ss_config_data 			= ss_config.getSheetValues(2, 2, 20, 2); //B2~B20
var CHANNEL_ACCESS_TOKEN 	= ss_config_data[0][0].replace(/\r?\n|\r/g, ""); //line bot token	，並消除換行符號（避免有人複製貼上時複製到換行符號）
//var sheetID 				= ss_config_data[1][0]; // google sheet ID

// load data from tab: GroupDB
var ss_GroupDB 				= SS.getSheetByName("GroupDB");
var ss_GroupDB_data 		= ss_GroupDB.getSheetValues(2, 1, 51, 70); //A2~70,51, max support group count = 50
var CHANNEL_ACCESS_TOKEN_LINENOTIFY 	= ss_GroupDB_data[0][5].replace(/\r?\n|\r/g, ""); //F2, line notify token	，並消除換行符號（避免有人複製貼上時複製到換行符號）

// index for GetValue usage
var columGroupID		= 0; // colum A GroupID
var columEnable			= 1; // colum B enable or not
var columStartMonth		= 2; // Colum C startMonth
var columEndMonth		= 3; // Colum D EndMonth
							 // Colum E 保留
var columAuto	      	= 5; // colum F auto
var columSheet	    	= 6; // colum G RegistSheet
var columnotifyToken	= 7; // Colum H notifyToken
var columRegistName		= 8; // colum I RegistName
var ColumRecord		  	= 10; // 紀錄(Day1) 開始的欄位, colum K
//offset between GetValue & SetValue
var offset_Get_Set		= 1;

//load data by Group's sheet -> material (分散式資料庫)
var columText	= 1; // text is on colum B
var columVideo	= 2; // video is on colum C
var columImage	= 4; // image/slide is start from colum E

// load data from tab: Homewrok
var colum_Homewrok_GroupID			= 0;
var colum_Homewrok_UserID			= 1;
var colum_Homewrok_UserName			= 2;
var colum_Homewrok_UserMonth		= 3;
var colum_Homework_HW				= 4;


var secondRoundBase	= 31;
var keyWord1 = "大家早安";    //關鍵字
var keyWord2 = "大家午安";    //關鍵字
var keyWord_regist = ".";    //關鍵字
var KeyWordHW = "day";   //關鍵字
var KeyWordSheet = "sheet=";   //關鍵字
var KeyWordToken = "token=";   //關鍵字
var KeyWordStartMonth = "start=";   //關鍵字
var KeyWordAuto = "auto=";   //關鍵字

//接收使用者訊息
function doPost(e) {
	var userData = JSON.parse(e.postData.contents);

	// 取出 replayToken
	var replyToken = userData.events[0].replyToken;
	var groupID = userData.events[0].source.groupId;
    var sourceType =(typeof userData.events[0].source !== 'undefined' )? userData.events[0].source.type: 'undefined';
	var userId =  (sourceType != 'undefined' && (sourceType=='group'|| sourceType=='user' || sourceType=='room'))? userData.events[0].source.userId : '';

	var Today = new Date;
	var Today_date = Today.getDate();
	var Today_Month = Today.getMonth()+1;
	var DateBase = 0;
	var userName = "測試人員QQ";

	// 確認關鍵字
	var clientMessage = userData.events[0].message.text;
	var retValue_sheet = checkSheet(clientMessage.toLowerCase());
	var retValue_token = checkToken(clientMessage.toLowerCase());
	var retValue_auto = checkAuto(clientMessage.toLowerCase());
	var retValue_startmonth = checkStartMonth(clientMessage.toLowerCase());
	// check which group is trigger bot
	var groupRow = checkGroup(groupID, userId);
	if (clientMessage.toLowerCase() != keyWord1.toLowerCase() && clientMessage.toLowerCase() != keyWord2.toLowerCase() && clientMessage.toLowerCase() != keyWord_regist.toLowerCase() && retValue_sheet != 1 && retValue_token != 1 && retValue_startmonth != 1 && retValue_auto != 1)
	{
		//load data by Group's sheet -> Homewrok (分散式資料庫)
		var sheetid_main 			= ss_GroupDB_data[groupRow][columSheet]; // google sheet ID
		var ss_Homewrok_main 		= SpreadsheetApp.openById(sheetid_main).getSheetByName("Homewrok");
		var ss_Homewrok_data_Main 	= ss_Homewrok_main.getSheetValues(2, 1, 999, 70); //A2~70,100, max support people count = 999

		// 判斷會員輸入的是第幾天 做打卡登記
		var retValue = checkHW_day(clientMessage.toLowerCase()); // user input
		Logger.log(retValue);
		if (retValue > 0)
		{
			// 註冊發文者ID
			var retRow = checkUser(groupID, userId, userName, Number(retValue), groupRow);
			var DayBase = 0;

			// 判斷 要打卡哪天文章
			if (Today_Month == ss_Homewrok_data_Main[retRow-2][colum_Homewrok_UserMonth])
			{
				DayBase = 0;
			}
			else if (Today_Month == ss_Homewrok_data_Main[retRow-2][colum_Homewrok_UserMonth]+1)
			{
				DayBase = secondRoundBase-1;
			}
			else
			{
				return;
			}
			ss_Homewrok_main.getRange(retRow, Number(retValue)+DayBase+colum_Homework_HW).setValue("v");		// 打卡
			Logger.log("CheckIn for Day: "+ (Number(retValue)+DayBase));
		}
		else
		{
			Logger.log("Ignore, due to invalid day info");
		}
		return;
	}

	// keyWord_regist 註冊用 for notify token
	if (clientMessage.toLowerCase() == keyWord_regist.toLowerCase())
	{
		// just for regist;
		return;
	}

	//regist for sheet
	if (retValue_sheet == 1)
	{
		ss_GroupDB.getRange(groupRow+2, columSheet + offset_Get_Set).setValue(clientMessage.slice(45,89));
		return;
	}

	//regist for token
	if (retValue_token == 1)
	{
		ss_GroupDB.getRange(groupRow+2, columnotifyToken + offset_Get_Set).setValue(clientMessage.slice(6,50));
		return;
	}

	//setup checkAuto
	if(retValue_auto == 1)
	{
		ss_GroupDB.getRange(groupRow+2, columAuto + offset_Get_Set).setValue(clientMessage.slice(5,6));
		return;
	}

	//setup for start month & end month
	if (retValue_startmonth == 1)
	{
		switch(clientMessage.slice(6,8))
		{
			case "01":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(1);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(2);
				break;
			case "02":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(2);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(3);
				break;
			case "03":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(3);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(4);
				break;
			case "04":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(4);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(5);
				break;
			case "05":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(5);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(6);
				break;
			case "06":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(6);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(7);
				break;
			case "07":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(7);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(8);
				break;
			case "08":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(8);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(9);
				break;
			case "09":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(9);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(10);
				break;
			case "10":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(10);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(11);
				break;
			case "11":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(11);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(12);
				break;
			case "12":
				ss_GroupDB.getRange(groupRow+2, columStartMonth + offset_Get_Set).setValue(12);
				ss_GroupDB.getRange(groupRow+2, columEndMonth+ offset_Get_Set).setValue(1);
				break;
			default:
				break;
		}
	}

	if (Today_date > 30)
	{
        Logger.log(Today_date + " is out of range.");
		return;
	}

	// 確認 是否enable 且 有token
	if (ss_GroupDB_data[groupRow][columEnable] != 1 || ss_GroupDB_data[groupRow][columnotifyToken] =="")
	{
		Logger.log("disable");
		return;
	}

	// 判斷 要發哪天文章
	if (Today_Month == ss_GroupDB_data[groupRow][columStartMonth])
	{
		DateBase = 0;
	}
	else if (Today_Month == ss_GroupDB_data[groupRow][columEndMonth])
	{
		DateBase = secondRoundBase;
	}
	else
	{
		Logger.log(Today_Month+" is not in the range between"+ ss_GroupDB_data[groupRow][columStartMonth]+" to "+ss_GroupDB_data[groupRow][columEndMonth]);
		return;
	}

	var Day = Today_date + DateBase;

	//例外處理 for day 1 (if 大家早安, 發 day 0文章)
	if (Day == 1 && clientMessage.toLowerCase() == keyWord1.toLowerCase())
	{
		Day = 0;
	}

	var dayinfo = Day + ColumRecord;

	// 判斷是否發過文
	if (ss_GroupDB_data[groupRow][dayinfo-1] != "")
	{
		Logger.log("已回應過文, skip");
		return;
	}

	// 發文
	//SendReplyMaterial_txt(Day, columText, replyToken, groupRow);
	SendReplyMaterial_video(Day, columVideo, replyToken, groupRow);

	// 發文後 做紀錄
	ss_GroupDB.getRange(groupRow+2, dayinfo).setValue(1);
}

function checkGroup(groupID, userID) {
  for (var i = 0; i < ss_GroupDB.getLastRow(); i++) {
    if (ss_GroupDB_data[i][columGroupID] == groupID && ss_GroupDB_data[i][columRegistName] !="") {
      Logger.log('ignore to regist groupID(%s) due to it has regist before at row(%d)', groupID, i);
      return i;
    }
  }
	// 如果群組未註冊過
	// 註冊群組ID
	ss_GroupDB.insertRowAfter(ss_GroupDB.getLastRow());
	ss_GroupDB.getRange(ss_GroupDB.getLastRow() + 1, columGroupID + offset_Get_Set).setValue(groupID);

	var now = new Date();
	var nowDate = now.getDate();
	var nowMonth = now.getMonth()+1;

	ss_GroupDB.getRange(ss_GroupDB.getLastRow(), columEnable + offset_Get_Set).setValue(1);		// enable 
	//ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 3).setValue(nowMonth+1);	// 開始月份
	//ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 4).setValue(nowMonth+2);	// 結束月份
	//ss_GroupDB.getRange(ss_GroupDB.getLastRow(), 9).setValue(nowMonth+"/"+nowDate);		// 註冊時間

	// get UserName
	var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/group/'+groupID+'/member/'+userID+'/', {
      "method": "GET",
      "headers": {
        "Authorization": "Bearer "+CHANNEL_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
    });

  var namedata = JSON.parse(response); // 解析 json
  var user_name = namedata.displayName; // 抓取 json 裡的 displayName
  ss_GroupDB.getRange(ss_GroupDB.getLastRow(), columRegistName + offset_Get_Set).setValue(user_name);		// 註冊UserName

	return ss_GroupDB.getLastRow();
}

function checkUser(groupID, userID, userName, hwDay, groupRow)
{
  //load data by Group's sheet -> Homewrok (分散式資料庫)
  var sheetid 				= ss_GroupDB_data[groupRow][columSheet]; // google sheet ID
  var ss_Homewrok 				= SpreadsheetApp.openById(sheetid).getSheetByName("Homewrok");
  var ss_Homewrok_data 		= ss_Homewrok.getSheetValues(2, 1, 999, 70); //A2~70,100, max support people count = 999

	for (var i = 0; i < ss_Homewrok.getLastRow(); i++)
	{
		if (ss_Homewrok_data[i][colum_Homewrok_UserID] == userID) {
			Logger.log('ignore to regist userID(%s) due to it has regist before at row(%d)', userID, i);
			return i+2;
		}
	}
	// 如果未註冊過, 註冊 並打卡
	ss_Homewrok.insertRowAfter(ss_Homewrok.getLastRow());
	ss_Homewrok.getRange(ss_Homewrok.getLastRow() + 1, 1).setValue(groupID);	// 註冊GroupID
	ss_Homewrok.getRange(ss_Homewrok.getLastRow(), 2).setValue(userID);		// 註冊UserID
	//ss_Homewrok.getRange(ss_Homewrok.getLastRow(), 3).setValue(userName);	// 註冊UserName

	var now = new Date();
	var nowMonth = now.getMonth()+1;

	ss_Homewrok.getRange(ss_Homewrok.getLastRow(), 4).setValue(nowMonth);		// 開始月份
	ss_Homewrok.getRange(ss_Homewrok.getLastRow(), (hwDay+colum_Homework_HW)).setValue("v");			// 打卡
	Logger.log("CheckIn for Day: "+ (hwDay));

	// get UserName
	var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/group/'+groupID+'/member/'+userID+'/', {
      "method": "GET",
      "headers": {
        "Authorization": "Bearer "+CHANNEL_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
    });

    var namedata = JSON.parse(response); // 解析 json
    var user_name = namedata.displayName; // 抓取 json 裡的 displayName
	ss_Homewrok.getRange(ss_Homewrok.getLastRow(), 3).setValue(user_name);	// 註冊UserName

	return ss_Homewrok.getLastRow();
}

function CheckAndNotify()
{
	var Today = new Date;
	var Today_date = Today.getDate();
	var Today_Month = Today.getMonth()+1;
	var Today_hour = Today.getHours();
	var Today_min = Today.getMinutes();

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

      // auto post
      var bAuto = ss_GroupDB_data[i][columAuto];
      var bPostByAuto=0;
      if(bAuto == 1)
      {
        if(9 != Today_hour || 10 != Today_min)
        {
          Logger.log(Today_hour+":"+Today_min + " != 9:10");
          continue;
        }
        else
        {
          bPostByAuto = 1;
        }
      }
      Logger.log(bPostByAuto);

			if (ss_GroupDB_data[i][dayinfo-1] == 1 || (bAuto == 1 && bPostByAuto == 1))
			{
				Logger.log("已發過影片 > 發文");
				SendNotifyMaterial_txt(Day, columText, ss_GroupDB_data[i][columnotifyToken], i);
				SendNotifyMaterial_image(Day, columImage, ss_GroupDB_data[i][columnotifyToken], i);

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

				if (ss_GroupDB_data[i][dayinfo-1] == 1 || bPostByAuto == 1)
				{
					Logger.log("已發過影片 > 發文");
					SendNotifyMaterial_txt(Day, columText, ss_GroupDB_data[i][columnotifyToken], i);
					SendNotifyMaterial_image(Day, columImage, ss_GroupDB_data[i][columnotifyToken], i);

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

//程式碼結束