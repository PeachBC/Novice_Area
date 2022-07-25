
//主動傳送 Line Bot 訊息給使用者
function pushMessage(CHANNEL_ACCESS_TOKEN, userID, pushContent) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': userID,
      'messages': [{
        'type': 'text',
        'text':pushContent,
      }],
    }),
  });
}

//主動傳送 Line Bot image給使用者
function pushImage(CHANNEL_ACCESS_TOKEN, targetID, imageURL, thumbnailURL) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': targetID,
      'messages': [{
        'type': 'image',
		'originalContentUrl': imageURL, // 圖片網址
		'previewImageUrl': thumbnailURL //縮圖網址
      }],
    }),
  });
}

//主動傳送 Line Bot video給使用者
function pushVideo(CHANNEL_ACCESS_TOKEN, targetID, videoURL, thumbnailURL) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': targetID,
      'messages': [{
        'type': 'video',
		'originalContentUrl': videoURL, // 影片網址
		'previewImageUrl': thumbnailURL //縮圖網址
      }],
    }),
  });
}
