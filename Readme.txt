SRS
1.透過機器人的協助 主被動發 文字/影片/圖片
2.透過機器人的協助 檢查每日是否有繳交作業

SDS
Key Design 1
-透過message api reply msg的機制，偵測經營者的關鍵字，並主動發出影片
-因為message api post msg 有數量限制 每個月僅能500則 (若發一則文 給群組N個人，計數為N則)
Key Design 2
-透過line notify機制，以及GAS提供的 simple trigger的功能，每分鐘做polling，確認FLAG是否改變，若改變代表經營者已經觸發影片，會緊接著發 對應的文字 與 圖片
Key Design 3
-透過message api的功能，檢查會員的輸入，倘若符合關鍵字，則判斷為 交付當天的作業，便會做紀錄
