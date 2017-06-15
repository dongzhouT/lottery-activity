//除chrome外，其他支持需要在服务器上运行才支持
if (!window.localStorage) {
	alert('This browser does NOT support localStorage');
}
var token; //活动令牌
var baseUrl = "http://101.200.210.97:8100/CloudPlatform/activities/";
var showPrizeFlag = false;
/*
 * config 奖项设置
 * localStorage 存储设置
 * board面板计奖函数
 */
dataSource = {};
var all = "";

function showLoading() {
	$("#loading").animate({
		'opacity': 1
	}, 100);
	$("#loading").show();
}

function hideLoading() {
	$("#loading").animate({
		'opacity': 0
	}, 100);
	$("#loading").hide();
}
window.localStorage.clear();
var config = {
	'awards': 'grateful',
	'keycode': {
		'49': {
			'class': 'first',
			'name': '一等奖',
			'content': '海尔冰箱',
			'total': 1
		},
		'50': {
			'class': 'second',
			'name': '二等奖',
			'content': '海尔空调',
			'total': 2
		},
		'51': {
			'class': 'third',
			'name': '三等奖',
			'content': '海尔电视',
			'total': 3
		},
		'52': {
			'class': 'grateful',
			'name': '感恩奖',
			'content': '海尔纪念奖',
			'total': 4
		}
	},
	get: function(key) {
		return window.localStorage.getItem(key) || ''
	},
	set: function(key, val) {
		window.localStorage.setItem(key, val);
	},
	/*
	 *移除选定某项
	 *去2个以上','  去前后','
	 */
	remove: function(key, val) {
		var key = key || config.awards,
			newval = config.get(key).replace(val, '').replace(/,{2,}/g, ',').replace(/(^,*)|(,*$)/g, '');
		config.set(key, newval);
	},
	//获取当前locals
	getCur: function() {
		return config.get(config.awards)
	},
	//追加并去掉前后','
	setCur: function(val) {
		var oldval = config.getCur(),
			newval = [oldval, val].join(',').replace(/(^,*)|(,*$)/g, '');
		config.set(config.awards, newval);
	},
	//查询当前是否有中奖记录！
	query: function(val) {
		all = "";
		for (var key in window.localStorage) {
			//			if ('first|second|third|grateful'.indexOf(key) >= 0) {
			//				return config.get(key).indexOf(val) >= 0
			//			}
			if (all != "") {
				all += ",";
			}
			all += window.localStorage[key];
		}
		var arr = all.split(',');
		return arr.indexOf("" + val) >= 0;
	},
	//清空设置
	clear: function() {
		window.localStorage.clear()
	},
	//读取本地中奖数据
	reading: function() {
		for (key in config.keycode) {
			var awards = config.keycode[key].class,
				locals = config.get(awards);
			if (!!locals) {
				var nums = locals.split(','),
					selector = $('.' + awards);
				for (var i = 0; i < nums.length; i++) {
					config.appear(selector, nums[i])
				}
			}
		}
	},
	appear: function(selector, num) {
		var data = dataSource[num],
			code = selector.find('code'),
			ratio = code.html(),
			min = ~~/(\d+)\/\d+/.exec(ratio)[1],
			max = ~~/\d+\/(\d+)/.exec(ratio)[1];
		if (min == max) {
			var awards = selector.attr('class').split(/\s+/)[0],
				reg = new RegExp('(\\d+,*){' + max + '}');
			//过滤超过max位
			config.set(awards, reg.exec(config.get(awards))[0].replace(/(^,*)|(,*$)/g, ''))
			return
		}
		var newItem = selector.find('li:eq(0)').clone().removeAttr('class').attr({
			'data-num': num
		}).css({
			'margin-left': 300
		});
		newItem.find('.num').html(data['tel'].replace(data['tel'].substr(3, 4), '****'));
		//		newItem.find('.avatar img').attr('src', data['url']);
		newItem.find('.name').html(data['nick']);
		newItem.find('.num').attr("title", data['tel']); //显示11位的电话号码
		if (min > 0) {
			newItem.prependTo(selector.find('.win'));
		} else {
			newItem.replaceAll(selector.find('li:eq(0)'))
		}
		setTimeout(function() {
			newItem.css({
				'margin-left': 0
			})
		}, 0)
		code.html(ratio.replace(/^\d+/, min + 1));
		newItem.one('click', 'button', function() {
			var awards = newItem.parent().parent().parent('.active').attr('class').replace('active', '').replace(/^\s*|\s*$/g, '');
			config.remove(awards, newItem.data('num'));
			newItem.css({
				'transition-delay': 0,
				'margin-left': 300
			});
			code.html(ratio.replace(/^\d+/, ~~/(\d+)\/\d+/.exec(code.html())[1] - 1));
			setTimeout(function() {
				if (newItem.siblings().length == 0) {
					var none = newItem.clone().addClass('none').removeAttr('style');
					none.find('.num').html('***********');
					none.find('.avatar img').attr('src', 'img/blank.gif');
					none.find('.name').html('');
					none.prependTo(selector.find('.win'))
				}
				newItem.remove()
			}, 600)
		})
	}
}
config['total'] = dataSource.length;

//from
//{
//	'level': 2,
//	'title': '三等奖',
//	'number': 3,
//	'content': '电视'
//}
//To
//		'haha':{
//			'class': 'grateful',
//			'name': '感恩奖',
//			'content':'海尔纪念奖',
//			'total': 4
//		}
//初始化奖项
function initPrize() {
	var len = prize.length;
	config.keycode = {};
	for (var i = 0; i < len; i++) {
		var p = prize[i];
		if (i == 0) {
			config.keycode[49] = {};
			config.keycode[49].class = "first";
			config.keycode[49].name = p.title;
			config.keycode[49].content = p.content;
			config.keycode[49].total = p.number;
			$(".first .pz-title").html(p.title);
			$(".first .pz-content").html(p.content);
			$(".first .pz-number").html("0/" + p.number);
		} else if (i == 1) {
			config.keycode[50] = {};
			config.keycode[50].class = "second";
			config.keycode[50].name = p.title;
			config.keycode[50].content = p.content;
			config.keycode[50].total = p.number;
			$(".second .pz-title").html(p.title);
			$(".second .pz-content").html(p.content);
			$(".second .pz-number").html("0/" + p.number);
		} else if (i == 2) {
			config.keycode[51] = {};
			config.keycode[51].class = "third";
			config.keycode[51].name = p.title;
			config.keycode[51].content = p.content;
			config.keycode[51].total = p.number;
			$(".third .pz-title").html(p.title);
			$(".third .pz-content").html(p.content);
			$(".third .pz-number").html("0/" + p.number);
		} else if (i == 3) {
			config.keycode[52] = {};
			config.keycode[52].class = "grateful";
			config.keycode[52].name = p.title;
			config.keycode[52].content = p.content;
			config.keycode[52].total = p.number;
			$(".grateful .pz-title").html(p.title);
			$(".grateful .pz-content").html(p.content);
			$(".grateful .pz-number").html("0/" + p.number);
		}
	}
	//从最低奖项开始抽奖
	if (len == 1) {
		config.awards = config.keycode[49].class;
	} else if (len == 2) {
		config.awards = config.keycode[50].class;
	} else if (len == 3) {
		config.awards = config.keycode[51].class;
	} else if (len == 4) {
		config.awards = config.keycode[52].class;
	}
	if (len <= 4 && len > 0) {
		$(".first,.second,.third,.grateful").removeClass('active');
		$(".first,.second,.third,.grateful").eq(len - 1).addClass('active');
	}
}

function initCustomer() {
	dataSource = [];
	for (var i = 0; i < customer.length; i++) {
		var cus = customer[i];
		var temp = {};
		temp.nick = cus.nickname;
		temp.url = "";
		temp.tel = cus.phone;
		dataSource.push(temp);
	}
	config['total'] = dataSource.length;
}
/* 
 * 加载完毕后
 */
function loader() {
	$('#copyleft').fadeOut();
	$('#content, .trigger').addClass('active');
	//空格控制
	var action = $('.counter ul:not(.none) li').filter(function(i) {
			return i > 0
		}),
		lock = true,
		boot = Lucky(action);
	$(document).on('keydown.lazyloader', function(e) {
		if (e.keyCode == 32) { //空格
			if (lock) {
				lock = boot.aStart();
			} else {
				lock = boot.lottery();
				//				console.log($('.grateful li:not(.none)').length)
				//当删除未领奖的时候，默认启用一次抽一次
				config.awards == 'grateful' && taxis($('.grateful li:not(.none)').length % 5);
			}
		}
	})

	function taxis(i) {
		var i = i || 0;
		setTimeout(function() {
			if (++i < 5) {
				boot.aStart();
				boot.lottery();
				taxis(i);
			}
		}, 2500)
	}
}

function Lucky(args) {
	var args = args,
		timers = [],
		flicker = $('.flicker > img'),
		winName = $(".winner-name");
	return {
		//顺序运动
		aStart: function() {
			this.avatar();
			$.each(args, function(i, n) {
				var single = $(n);
				if (single.data('bingo') == undefined) {
					single.data('bingo', Bingo(single));
				}
				timers[i] = setTimeout(function() {
					single.data('bingo').start();
				}, i * 150)
			});
			return !1;
		},
		/*
			 *抽奖
			 /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/
			 
			 (new Date().getTime() * 9301 + 49297) % 233280 /233280.0 * Max

			 ~~(Math.random() * max)
			 ~~(Math.random() * (min - max + 1) + max)
			 ( new Date().getTime() * 7 - 13 ) % totalCount + 1

		     ~~(Math.random()*(max-min+1))

			 Math.round( Math.random() * 1000 + .5) 
		     Math.floor(Math.random() * 730) + 1

			 //数组排序  [].sort(function () { return 0.5 - Math.random(); })
			*/
		lottery: function() {
			for (var x in timers) {
				try {
					if (timers.length > ~~x + 1) {
						clearTimeout(timers[x])
					}
				} catch (e) {}
			}
			var lucky = this.randit();
			value = [];
			for (var i = 0; i < lucky.length; i++) {
				(i > 0 && i < 3 || i > 6) && value.push(lucky.charAt(i))
			}
			$.each(args, function(i, n) {
				var single = $(n),
					bingo = single.data('bingo');
				bingo.endTo(~~value[i], i * 200, !i)
			})
			return !0;
		},
		/*
		 * 随机抽取！
		 */
		randit: function() {
			var result = Math.round(Math.random() * config.total + .5) - 1;
			tel = dataSource[result]['tel'];
			var i = 0;
			for (key in window.localStorage) {
				var arr = window.localStorage[key].split(',');
				i += arr.length;
			}
			if (i >= dataSource.length) {
				console.log("end i=" + i);
			} else {
				if (config.query(result)) {
					return this.randit();
				}
			}

			//html5存储序列号
			var addflag = false;
			if (!config.query(result)) {
				//如果没有获奖，则加入获奖池中。功能：去重
				config.setCur(result);
				addflag = true;
			}
			setTimeout(function() {
				//停止头像
				clearTimeout(timers[args.length]);
				//				flicker.attr('src', dataSource[result]['url']);
				winName.html(dataSource[result]['nick']);
				if (addflag) {
					config.appear($('.' + config.awards), result);
				} else {
					alert("获奖人数已达到上限，中奖人数：" + all.split(',').length + "，参与人数：" + "" + dataSource.length + ",无法再进行抽奖!");
				}

			}, 1000);

			return tel;
		},
		/*
		 * 头像变换！
		 */
		avatar: function() {
			var result = Math.round(Math.random() * config.total + .5) - 1;
			//			url = dataSource[result]['url'];
			//			flicker.attr('src', url);
			//名字变换
			winName.html(dataSource[result]['nick']);
			timers[args.length] = setTimeout(arguments.callee, 100)
		}
	}
}
/*
 * 摇奖机Bingo
 * 从下至上循环摇动，控制backgroundPositionY
 * arg $对象
 */
function Bingo(arg) {
	var code = '3458', //网络识别号 [ 2 ]{ 3, 4, 5, 8 }
		//RegExp( /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/ )
		loop = 0, //循环次数
		running = 0, //0 - 9
		timer = null; //控制摇动时间
	/*
	 * 增加随机步数selfAuto
	 * 保证每次跳跃次数不一致
	 * 范围 Math.random() * 10   --  [ 0 - 9 ]
	 */
	function selfAuto() {
		running += ~~(Math.random() * 10);
		format();
	}
	/*
	 * 格式化format
	 * running 保持0-9区间
	 */
	function format() {
		if (running >= 10) {
			loop++;
			running -= 10;
		}
	}
	return {
		start: function() {
			selfAuto();
			arg.css({
					'background-position-y': -120 * (10 * loop + running)
				})
				//[50, 100]
			timer = setTimeout(arguments.callee, Math.random() * 50 + 50)
		},
		stop: function() {
			clearTimeout(timer)
		},
		endTo: function(num, timer) {
			this.stop();
			timer = timer || 200;
			//网络识别号 [ 2 ]{ 3, 4, 5, 8 }
			if (arguments[2] != undefined && arguments[2]) {
				var to = code.indexOf(num),
					from = (10 * loop + running) % 4;
				if (to >= from) {
					running += to - from;
				} else {
					running += 4 + to - from;
				}
				format();
			} else {
				if (num < running) {
					loop++;
				}
				running = num;
			}
			arg.animate({
				'background-position-y': -120 * (10 * loop + running)
			}, timer)
		}
	}
}
//倒计时时间  x秒
var time = 30;
var timerInterval;
var timeIndex = 0;
//显示倒计时
function showTime() {
	$("#timer").html(time + 'S');
	timeIndex++;
	if (timeIndex > 6) {
		timeIndex = 1;
	}
	var timeString = "";
	for (var i = 0; i < timeIndex; i++) {
		timeString += ".";
	}
	$("#point").html(timeString);
	time--;
	if (time < 0) {
		$(".timer-title").html("摇奖结束");
		clearInterval(timerInterval);
		//调用活动结束接口
		startAty("2");
		$("#step2").animate({
			'opacity': 0
		}, 1000);
		setTimeout(loader, 1000);
	}
}
//处理活动信息
var loginData;

function doLogin(data) {
	loginData = data;
	if (data.retCode == "000000") {
		//					if (data.data.activity.status == 1) {
		$("#step1").hide();
		$("#step2").show();
		$("#timer").html(time + 'S');
		timerInterval = setInterval("showTime()", 1000);
		startAty("1");
		prize = data.data.prize;
		initPrize();
		//					}
	} else {
		alert(data.retInfo);
	}
}
//开始暂停活动
function startAty(status) {
	var requestUrl = baseUrl + token + "/activate";
	//	console.log("startAty:" + requestUrl);
	$.ajax({
		type: "post",
		url: requestUrl,
		async: true,
		crossDomain: true,
		dataType: "json",
		data: {
			"status": status
		},
		success: function(data) {
			//			if (status == "2") {
			//				getCustomers();
			//			}
			getCustomers();
		},
		error: function(obj, msg, msg2) {
			//			if (status == "2") {
			//				getCustomers();
			//			}
			getCustomers();
		}
	});
}
//获取参加活动的顾客信息
function getCustomers() {
	var requestUrl = baseUrl + token + "/customers/";
	$.ajax({
		type: "get",
		url: requestUrl,
		async: true,
		crossDomain: true,
		dataType: "json",
		success: function(data) {
			readCustomerData(data);
			showPrizeFlag = true;
		},
		error: function(obj, msg, msg2) {
			console.log("getCustomers fail:" + msg);
		}
	});
}
var customerData;
//读取参与者信息
function readCustomerData(data) {
	customerData = data;
	customer = data.list;
	initCustomer();
}
$(document).ready(function() {
	var per = $('#loader .inner');
	$("#loader").addClass("ready");
	per.css('width', '100%');
	setTimeout(function() {
		per.css('transform', 'scale(1, 1)')
	}, 550);
	setTimeout(function() {
		$("#loader").animate({
			'opacity': 0
		}, 'fast', function() {
			$(this).remove()
		});
		$('#copyleft').addClass('active');
	}, 750);
	$("#step1").show();
	$("#step2").hide();
	$("#aty-enter").on('click', function() {
		token = $("#token").val();
		var resqUrl = baseUrl + token + "/content";
		$.ajax({
			type: "get",
			url: resqUrl,
			async: true,
			crossDomain: true,
			dataType: "json",
			beforeSend: function() {
				showLoading();
			},
			success: function(data) {
				doLogin(data);
				hideLoading();
			},
			error: function(obj, msg, msg2) {
				alert(msg);
				hideLoading();
				console.log("errorMsg:" + obj + "," + msg + "," + msg2);
			}
		});
	});
	//				setTimeout(loader, 5000);
	$('.trigger').on('click', function() {
		if (!$(this).data('active')) {
			$('.zone-container').addClass('active');
			$('#content .counter-container').animate({
				'margin-left': -293
			}, 'fast');
			$('#content .flicker').animate({
				'margin-left': 100
			}, 'fast');

			$('#content .win-div').animate({
				'margin-left': 0
			}, 'fast');
			$(this).data('active', true);
		} else {
			$('.zone-container').removeClass('active');
			$('#content .counter-container').animate({
				'margin-left': -443
			}, 'fast');
			$('#content .flicker').animate({
				'margin-left': -50
			}, 'fast');
			$('#content .win-div').animate({
				'margin-left': -148
			}, 'fast');
			$(this).data('active', false);
		}
	});
	config.reading();
	/*
	 *更换壁纸、设置全局抽奖奖项
	 *键盘操作[1: 一等奖, 2: 二等奖, 3: 三等奖, 4: 感恩奖，0: 全显]
	 *CTRL + DEL 重置
	 */
	$(document).on('keydown', function(e) {
		var k = config.keycode[e.keyCode];
		if (!!k) {
			config.awards = k.class;
			$('.' + config.awards).addClass('active').siblings().removeClass('active')
				//background
		} else if (e.keyCode == 48) {
			config.awards = 'grateful';
			$('.board > div').addClass('active');
		} else if (e.ctrlKey && e.keyCode == 46) {
			config.clear();
			window.location.reload();
		} else if (e.keyCode == 13) {
			//回车打开列表
			if (showPrizeFlag) {
				$('.trigger').click();
			}

		}
	})
});