/**
 * 封装环信工具类
 */
var App;
var Main;
//初始化环信
var conn = new WebIM.connection({
	https: WebIM.config.https,
	url: WebIM.config.xmppURL,
	isAutoLogin: WebIM.config.isAutoLogin,
	isMultiLoginSessions: WebIM.config.isMultiLoginSessions
});
conn.listen({
	onOpened: function(message) { //连接成功回调
		// 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
		// 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
		// 则无需调用conn.setPresence();
		console.log('连接成功回调  %o', JSON.stringify(message));
		//App.$emit('registAction', message);
	},
	onClosed: function(message) {
		console.log('连接关闭回调  %o', JSON.stringify(message));
		//console.log('连接关闭回调');
	},
	onTextMessage: function(message) {
		console.log('收到文本消息  %o', JSON.stringify(message));
		App.onTextMessage(message);
	},
	onEmojiMessage: function(message) {
		console.log('收到表情消息  %o', JSON.stringify(message));
	},
	onPictureMessage: function(message) {
		//console.log('收到图片消息  %o', message);
		App.onPictureMessage(message);
	},
	onCmdMessage: function(message) {
		console.log('收到命令消息  %o', JSON.stringify(message));
	},
	onAudioMessage: function(message) {
		console.log('收到音频消息  %o', JSON.stringify(message));
	},
	onLocationMessage: function(message) {
		console.log('收到位置消息  %o', JSON.stringify(message));
	},
	onFileMessage: function(message) {
		console.log('收到文件消息  %o', JSON.stringify(message));
	},
	onVideoMessage: function(message) {
		console.log('收到视频消息');
	},
	onPresence: function(message) {
		console.log('收到联系人订阅请求、处理群组、聊天室被踢解散等消息  %o', JSON.stringify(message));
		if(message.type == 'createGroupACK') {
			conn.createGroupAsync({
				from: message.from,
				success: function(option) {
					console.log('Create Group Succeed');
					console.log('创建群 名称:' + option.subject + ',' + '成功!');
					toast.success({
						title: '创建群 名称:' + option.subject + ',' + '成功!',
						duration: 2000
					});
					setTimeout(function() {
						App.refreshFriendAndGroupListAction();
					}, 2000);
				}
			});
		} else if(message.type == 'joinPublicGroupSuccess') {
			console.log('收到添加群员请求');
			var arr = message.fromJid.split('/');
			var m_temp = arr[arr.length - 1];
			if(m_temp != 'webim') {
				console.log(arr[arr.length - 1] + '加入该群成功');
			}
		} else if(message.type == 'deleteGroupChat') {
			//解散群触发 有后回调  已在后面
			//{"from":"1496225999726","to":"test4","fromJid":"zj1406187962#layimtest_1496225999726@conference.easemob.com/test4","toJid":"zj1406187962#layimtest_test4@easemob.com","type":"deleteGroupChat","chatroom":false,"destroy":true,"reason":"","presence_type":"unavailable","original_type":"notify"}
			var m = '群组:' + message.from + '被管理员解散';
			toast.success({
				title: m,
				duration: 2000
			});
			setTimeout(function() {
				App.refreshFriendAndGroupListAction();
			}, 2000);
		} else if(message.type == 'subscribe') {
			//收到好友申请
			//{"from":"test3","to":"test9","fromJid":"zj1406187962#layimtest_test3@easemob.com","toJid":"zj1406187962#layimtest_test9@easemob.com/webim","type":"subscribe","chatroom":false,"status":"加个好友呗!","code":null,"presence_type":"","original_type":"subscribe"}
			App.onPresenceTypeSubscribe(message)
		} else if(message.type == 'subscribed') {
			var m = '已经和' + message.from + '成为好友';
			console.log(m);
			toast.success({
				title: m,
				duration: 2000
			});
			setTimeout(function() {
				App.refreshFriendAndGroupListAction();
			}, 2000);
		}

	},
	onRoster: function(message) {
		console.log('处理好友申请  %o', JSON.stringify(message));
		if(message[0].subscription === 'none' && message[0].ask === 'subscribe') {
			console.log('好友申请提交成功')
			toast.success({
				title: "好友申请提交成功",
				duration: 2000
			});
		}
	},
	onInviteMessage: function(message) {
		console.log('处理群组邀请  %o', JSON.stringify(message));
		//{"type":"invite","from":"test10","roomid":"1496225999726","reason":""}
		if(message.type == 'invite') {
			var m = message.from + '邀请你加入了群组:' + message.roomid;
			console.log(m);
			toast.success({
				title: m,
				duration: 2000
			});
			setTimeout(function() {
				App.refreshFriendAndGroupListAction();
			}, 2000);
		}
	},
	onOnline: function() {
		App.onOnline();
	},
	onOffline: function() {
		App.onOffline();
	},
	onError: function(message) {
		console.log('onError:%o', JSON.stringify(message));
		var errorText = '操作失败';
		$.each(errorCodeArr, function(i, d) {
			if(d.code == message.type) {
				errorText = d.text || d.detail;
				return false;
			}
		});
		console.log('失败回调  %o  %o', message.type, errorText);
		toast.hide();
		//alert(errorText)
		//alert('请重新登录')
	},
	onBlacklistUpdate: function(list) {
		console.log('黑名单变动');
		// 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
		console.log(list);
	}
});

function EaseMobTool() {

};

/**
 * 登录 用户名和密码
 */
EaseMobTool.prototype.login = function(param) {
	var options = {
		apiUrl: WebIM.config.apiURL,
		user: param.user,
		pwd: param.pwd,
		appKey: WebIM.config.appkey,
		success: param.success,
		error: param.error
	};
	conn.open(options);
};
/**
 * 注册
 */
EaseMobTool.prototype.registerUser = function(p) {
	var options = {
		username: p.user,
		password: p.pwd,
		nickname: p.user,
		appKey: WebIM.config.appkey,
		success: p.success,
		error: p.error,
		apiUrl: WebIM.config.apiURL
	};
	console.log(options)
	console.log(JSON.stringify(options))
	conn.registerUser(options);
};
/**
 * 获取好友列表
 */
EaseMobTool.prototype.getRoster = function(success) {
	conn.getRoster({
		success: function(roster) {
			var arr = [];
			for(var i = 0, l = roster.length; i < l; i++) {
				var ros = roster[i];
				//ros.subscription值为both/to为要显示的联系人，此处与APP需保持一致，才能保证两个客户端登录后的好友列表一致
				if(ros.subscription === 'both' || ros.subscription === 'to') {
					arr.push({
						name: ros.name,
						id: ros.name,
						type: 'friend',
						msgNum: 0,
					})
				}
			}
			success(arr);
			toast.loading({
				title: "获取群组列表",
				duration: 2000
			})
		},
	});
};

/**
 * 获取群组列表
 */
EaseMobTool.prototype.getListGroups = function(success) {
	var option = {
		success: function(rooms) {
			console.log('查询的群组%o', rooms);
			var arr = [];
			$.each(rooms, function(i, group) {
				arr.push({
					id: group.roomId,
					name: group.name,
					type: 'group',
					msgNum: 0,
				});
			});
			success(arr);
			toast.hide();
		},
		error: function() {
			console.log('List groups error');
			toast.hide();
			toast.fail({
				title: "获取群组列表失败",
				duration: 2000
			});

		}
	};
	conn.listRooms(option);
};

/**
 * 创建一个群组
 */
EaseMobTool.prototype.createGroup = function(param) {
	var option = {
		subject: param.subject, // 群名称
		description: param.description, // 群简介
		members: param.members, // 以数组的形式存储需要加群的好友ID
		optionsPublic: param.optionsPublic, // 允许任何人加入
		optionsModerate: param.optionsModerate, // 加入需审批
		optionsMembersOnly: param.optionsMembersOnly, // 不允许任何人主动加入
		optionsAllowInvites: param.optionsAllowInvites // 允许群人员邀请
	};
	console.log('要创建的群参数：%o', JSON.stringify(option));
	conn.createGroup(option);
};
/**
 * 获取群组信息
 */
EaseMobTool.prototype.queryGroupInfo = function(id) {
	conn.queryRoomInfo({
		roomId: id,
		// settings 表示入群的权限，具体值待定
		// members[0]里面包含群主信息，其结构为{affiliation: 'owner', jid: appKey + '_' + username + '@easemob.com'}
		// jid中的username就是群主ID
		// fields的结构为：
		/*
		 {
		 affiliations: '2',                  
		 description: '12311231313',         // 群简介
		 maxusers: '200',                    // 群最大成员容量
		 name: '123',                        // 群名称
		 occupants: '2',                     
		 owner: 'easemob-demo#chatdemoui_mengyuanyuan'               // 群主jid
		 }
		 */
		success: function(settings, members, fields) {
			console.log('settings: %o', settings);
			console.log('members: %o', members);
			console.log('fields: %o', fields);
		},
		error: function() {
			console.log('Error!');
		}
	});
};
/**
 * 查询群组成员
 */
EaseMobTool.prototype.queryRoomMember = function(id, success) {
	// 查询群组成员
	// 查询出来的member的结构为{affiliation: 'member', jid: 'easemob-demo#chatdemoui_wjy6@easemob.com'}
	// 注意，这里的jid格式，成员的用户名是chatdemoui_之后，@easemob.com之前的字符串，如本例的wjy6是用户名
	var member = '';
	var arr = [];
	conn.queryRoomMember({
		roomId: id,
		success: function(members) {
			for(var o in members) {
				member = members[o];
				arr.push(member);
			}
			success(arr);
		}
	});
};

var httpTool = new EaseMobTool();

var errorCodeArr = [{
		"code": "0",
		"detail": "WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR",
	},
	{
		"code": "1",
		"detail": "WEBIM_CONNCTION_OPEN_ERROR",
	},
	{
		"code": "2",
		"detail": "WEBIM_CONNCTION_AUTH_ERROR",
	},
	{
		"code": "3",
		"detail": "WEBIM_CONNCTION_OPEN_USERGRID_ERROR",
	},
	{
		"code": "4",
		"detail": "WEBIM_CONNCTION_ATTACH_ERROR",
	},
	{
		"code": "5",
		"detail": "WEBIM_CONNCTION_ATTACH_USERGRID_ERROR",
	},
	{
		"code": "6",
		"detail": "WEBIM_CONNCTION_REOPEN_ERROR",
	},
	{
		"code": "7",
		"detail": "WEBIM_CONNCTION_SERVER_CLOSE_ERROR",
		"text": "客户端网络中断 (net::ERR_INTERNET_DISCONNECTED)"
	},
	{
		"code": "8",
		"detail": "WEBIM_CONNCTION_SERVER_ERROR",
		"text": "多端登录，被踢下线"
	},
	{
		"code": "9",
		"detail": "WEBIM_CONNCTION_IQ_ERROR",
	},
	{
		"code": "10",
		"detail": "WEBIM_CONNCTION_PING_ERROR",
	},
	{
		"code": "11",
		"detail": "WEBIM_CONNCTION_NOTIFYVERSION_ERROR",
	},
	{
		"code": "12",
		"detail": "WEBIM_CONNCTION_GETROSTER_ERROR",
	},
	{
		"code": "13",
		"detail": "WEBIM_CONNCTION_CROSSDOMAIN_ERROR",
	},
	{
		"code": "14",
		"detail": "WEBIM_CONNCTION_LISTENING_OUTOF_MAXRETRIES",
	},
	{
		"code": "15",
		"detail": "WEBIM_CONNCTION_RECEIVEMSG_CONTENTERROR",
	},
	{
		"code": "16",
		"detail": "WEBIM_CONNCTION_DISCONNECTED",
		"text": "服务端关闭了websocket链接"
	},
	{
		"code": "17",
		"detail": "WEBIM_CONNCTION_AJAX_ERROR",
	},
	{
		"code": "18",
		"detail": "WEBIM_CONNCTION_JOINROOM_ERROR",
	},
	{
		"code": "19",
		"detail": "WEBIM_CONNCTION_GETROOM_ERROR",
	},
	{
		"code": "20",
		"detail": "WEBIM_CONNCTION_GETROOMINFO_ERROR",
	},
	{
		"code": "21",
		"detail": "WEBIM_CONNCTION_GETROOMMEMBER_ERROR",
	},
	{
		"code": "22",
		"detail": "WEBIM_CONNCTION_GETROOMOCCUPANTS_ERROR",
	},
	{
		"code": "23",
		"detail": "WEBIM_CONNCTION_LOAD_CHATROOM_ERROR",
	},
	{
		"code": "24",
		"detail": "WEBIM_CONNCTION_NOT_SUPPORT_CHATROOM_ERROR",
	},
	{
		"code": "25",
		"detail": "WEBIM_CONNCTION_JOINCHATROOM_ERROR",
	},
	{
		"code": "26",
		"detail": "WEBIM_CONNCTION_QUITCHATROOM_ERROR",
	},
	{
		"code": "27",
		"detail": "WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR",
	},
	{
		"code": "28",
		"detail": "WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR",
	},
	{
		"code": "29",
		"detail": "WEBIM_CONNCTION_SESSIONID_NOT_ASSIGN_ERROR",
	},
	{
		"code": "30",
		"detail": "WEBIM_CONNCTION_RID_NOT_ASSIGN_ERROR",
	},
	{
		"code": "31",
		"detail": "WEBIM_CONNCTION_CALLBACK_INNER_ERROR",
		"text": "处理下行消息出错，try/catch抛出异常"
	},
	{
		"code": "32",
		"detail": "WEBIM_CONNCTION_CLIENT_OFFLINE",
		"text": "客户端断线"
	},
	{
		"code": "33",
		"detail": "WEBIM_CONNCTION_CLIENT_LOGOUT",
		"text": "客户端退出登录"
	},
	{
		"code": "34",
		"detail": "WEBIM_CONNCTION_CLIENT_TOO_MUCH_ERROR",
		"text": "同一浏览器打开标签页超过上限"
	},
	{
		"code": "35",
		"detail": "WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP",
	},
	{
		"code": "36",
		"detail": "WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP",
	},
	{
		"code": "37",
		"detail": "WEBIM_CONNECTION_ACCEPT_JOIN_GROUP",
	},
	{
		"code": "38",
		"detail": "WEBIM_CONNECTION_DECLINE_JOIN_GROUP",
	},
	{
		"code": "39",
		"detail": "WEBIM_CONNECTION_CLOSED",
	},
	{
		"code": "100",
		"detail": "WEBIM_UPLOADFILE_BROWSER_ERROR",
	},
	{
		"code": "101",
		"detail": "WEBIM_UPLOADFILE_ERROR",
	},
	{
		"code": "102",
		"detail": "WEBIM_UPLOADFILE_NO_LOGIN",
	},
	{
		"code": "103",
		"detail": "WEBIM_UPLOADFILE_NO_FILE",
	},
	{
		"code": "200",
		"detail": "WEBIM_DOWNLOADFILE_ERROR",
	},
	{
		"code": "201",
		"detail": "WEBIM_DOWNLOADFILE_NO_LOGIN",
	},
	{
		"code": "202",
		"detail": "WEBIM_DOWNLOADFILE_BROWSER_ERROR",
	},
	{
		"code": "300",
		"detail": "WEBIM_MESSAGE_REC_TEXT",
	},
	{
		"code": "301",
		"detail": "WEBIM_MESSAGE_REC_TEXT_ERROR",
	},
	{
		"code": "302",
		"detail": "WEBIM_MESSAGE_REC_EMOTION",
	},
	{
		"code": "303",
		"detail": "WEBIM_MESSAGE_REC_PHOTO",
	},
	{
		"code": "304",
		"detail": "WEBIM_MESSAGE_REC_AUDIO",
	},
	{
		"code": "305",
		"detail": "WEBIM_MESSAGE_REC_AUDIO_FILE",
	},
	{
		"code": "306",
		"detail": "WEBIM_MESSAGE_REC_VEDIO",
	},
	{
		"code": "307",
		"detail": "WEBIM_MESSAGE_REC_VEDIO_FILE",
	},
	{
		"code": "308",
		"detail": "WEBIM_MESSAGE_REC_FILE",
	},
	{
		"code": "309",
		"detail": "WEBIM_MESSAGE_SED_TEXT",
	},
	{
		"code": "310",
		"detail": "WEBIM_MESSAGE_SED_EMOTION",
	},
	{
		"code": "311",
		"detail": "WEBIM_MESSAGE_SED_PHOTO",
	},
	{
		"code": "312",
		"detail": "WEBIM_MESSAGE_SED_AUDIO",
	},
	{
		"code": "313",
		"detail": "WEBIM_MESSAGE_SED_AUDIO_FILE",
	},
	{
		"code": "314",
		"detail": "WEBIM_MESSAGE_SED_VEDIO",
	},
	{
		"code": "315",
		"detail": "WEBIM_MESSAGE_SED_VEDIO_FILE",
	},
	{
		"code": "316",
		"detail": "WEBIM_MESSAGE_SED_FILE",
	},
	{
		"code": "317",
		"detail": "WEBIM_MESSAGE_SED_ERROR",
	},
	{
		"code": "400",
		"detail": "STATUS_INIT",
	},
	{
		"code": "401",
		"detail": "STATUS_DOLOGIN_USERGRID",
	},
	{
		"code": "402",
		"detail": "STATUS_DOLOGIN_IM",
		"text": "取到token 但是没有连上xmpp server"
	},
	{
		"code": "403",
		"detail": "STATUS_OPENED",
	},
	{
		"code": "404",
		"detail": "STATUS_CLOSING",
	},
	{
		"code": "405",
		"detail": "STATUS_CLOSED",
	},
	{
		"code": "406",
		"detail": "STATUS_ERROR",
	}
];