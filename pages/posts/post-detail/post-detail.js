var postsData = require('../../../data/posts-data.js')
/* 调用 app.js */
var app = getApp()

Page({
	data: {
		isPlayingMusic: false
	},
	onLoad: function(option) {
		var postId = option.id
		this.data.currentPostId = postId
		var postData = postsData.postList[postId]
		this.setData({
			postData: postData
    })
    /*
    文章缓存状态
    var postsCollected = {
      1: "true",
      2: "false",
      ...
    }
    */
		/* [getStorageSync](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.getStorageSync.html) */
		var postsCollected = wx.getStorageSync('posts_collected')
		if (postsCollected) {
			var postCollected = postsCollected[postId]
			this.setData({
				collected: postCollected
			})
		} else {
			var postsCollected = {}
			postsCollected[postId] = false
			/* [setStorageSync](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorageSync.html) */
      wx.setStorageSync('posts_collected', postsCollected)
      /* 缓存上限 < 10MB */
      /* [clearStorageSync](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.clearStorageSync.html) */
      // wx.clearStorageSync();
		}
		if (
			app.globalData.g_isPlayingMusic &&
			app.globalData.g_currentMusicPostId === postId
		) {
			this.setData({
				isPlayingMusic: true
			})
		}
		this.setMusicMonitor()
	},
	setMusicMonitor: function() {
		/* 点击播放图标和总控开关都会触发这个函数 */
    var that = this
    /* [onBackgroundAudioPlay](https://developers.weixin.qq.com/miniprogram/dev/api/media/background-audio/wx.onBackgroundAudioPlay.html) */
		wx.onBackgroundAudioPlay(function(event) {
			var pages = getCurrentPages()
			var currentPage = pages[pages.length - 1]
			if (currentPage.data.currentPostId === that.data.currentPostId) {
        /*
				打开多个post-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到
				当前页面的postid，只处理当前页面的音乐播放。
        */
				if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
					/* 播放当前页面音乐才改变图标 */
					that.setData({
						isPlayingMusic: true
					})
				}
				// if(app.globalData.g_currentMusicPostId == that.data.currentPostId )
				// app.globalData.g_currentMusicPostId = that.data.currentPostId;
			}
			app.globalData.g_isPlayingMusic = true
		})
		wx.onBackgroundAudioPause(function() {
			var pages = getCurrentPages()
			var currentPage = pages[pages.length - 1]
			if (currentPage.data.currentPostId === that.data.currentPostId) {
				if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
					that.setData({
						isPlayingMusic: false
					})
				}
			}
			app.globalData.g_isPlayingMusic = false
			// app.globalData.g_currentMusicPostId = null;
		})
		wx.onBackgroundAudioStop(function() {
			that.setData({
				isPlayingMusic: false
			})
			app.globalData.g_isPlayingMusic = false
			// app.globalData.g_currentMusicPostId = null;
		})
	},
	onColletionTap: function(event) {
		// this.getPostsCollectedSyc();
		this.getPostsCollectedAsy()
	},
	getPostsCollectedAsy: function() {
		var that = this
		/* [getStorage](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.getStorage.html) */
		wx.getStorage({
			key: 'posts_collected',
			success: function(res) {
				var postsCollected = res.data
				var postCollected = postsCollected[that.data.currentPostId]
				/* 收藏变成未收藏，未收藏变成收藏 */
				postCollected = !postCollected
				postsCollected[that.data.currentPostId] = postCollected
				that.showToast(postsCollected, postCollected)
			}
		})
	},
	getPostsCollectedSyc: function() {
		var postsCollected = wx.getStorageSync('posts_collected')
		var postCollected = postsCollected[this.data.currentPostId]
		/* 收藏变成未收藏，未收藏变成收藏 */
		postCollected = !postCollected
		postsCollected[this.data.currentPostId] = postCollected
		this.showToast(postsCollected, postCollected)
  },
  showToast: function(postsCollected, postCollected) {
    /* [setStorageSync](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorageSync.html) */
    /* 更新文章是否的缓存值 */
		wx.setStorageSync('posts_collected', postsCollected)
		/* 更新数据绑定变量，从而实现切换图片 */
		this.setData({
			collected: postCollected
    })
    /* [showToast](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showToast.html) */
		wx.showToast({
			title: postCollected ? '收藏成功' : '取消成功',
			duration: 1000,
			icon: 'success'
		})
	},
	showModal: function(postsCollected, postCollected) {
    var that = this
    /* [showModal](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showModal.html) */
		wx.showModal({
			title: '收藏',
			content: postCollected ? '收藏该文章？' : '取消收藏该文章？',
			showCancel: 'true',
			cancelText: '取消',
			cancelColor: '#333',
			confirmText: '确认',
			confirmColor: '#405f80',
			success: function(res) {
				if (res.confirm) {
          /* [setStorageSync](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorageSync.html) */
					wx.setStorageSync('posts_collected', postsCollected)
					/* 更新数据绑定变量，从而实现切换图片 */
					that.setData({
						collected: postCollected
					})
				}
			}
		})
	},
	onShareTap: function(event) {
		var itemList = ['分享给微信好友', '分享到朋友圈', '分享到QQ', '分享到微博']
		/* [showActionSheet](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showActionSheet.html) */
		wx.showActionSheet({
			itemList: itemList,
			itemColor: '#405f80',
			success: function(res) {
        /*
        [showModal](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showModal.html)
        res.cancel 用户是不是点击了取消按钮
				res.tapIndex 数组元素的序号，从0开始
        */
				wx.showModal({
					title: '用户 ' + itemList[res.tapIndex],
					content:
						'用户是否取消？' +
						res.cancel +
						'现在无法实现分享功能，什么时候能支持呢'
				})
			}
		})
	},
	onMusicTap: function(event) {
		var currentPostId = this.data.currentPostId
		var postData = postsData.postList[currentPostId]
		var isPlayingMusic = this.data.isPlayingMusic
		if (isPlayingMusic) {
      /* [pauseBackgroundAudio](https://developers.weixin.qq.com/miniprogram/dev/api/media/background-audio/wx.pauseBackgroundAudio.html) */
			wx.pauseBackgroundAudio()
			this.setData({
				isPlayingMusic: false
			})
			// app.globalData.g_currentMusicPostId = null;
			app.globalData.g_isPlayingMusic = false
		} else {
      /* [playBackgroundAudio](https://developers.weixin.qq.com/miniprogram/dev/api/media/background-audio/wx.playBackgroundAudio.html) */
			wx.playBackgroundAudio({
				dataUrl: postData.music.url,
				title: postData.music.title,
				coverImgUrl: postData.music.coverImg
			})
			this.setData({
				isPlayingMusic: true
			})
			app.globalData.g_currentMusicPostId = this.data.currentPostId
			app.globalData.g_isPlayingMusic = true
		}
	},
	/* 定义页面分享函数 */
	onShareAppMessage: function(event) {
		return {
			title: '离思五首·其四',
			desc: '曾经沧海难为水，除却巫山不是云',
			path: '/pages/posts/post-detail/post-detail?id=0'
		}
	}
})
