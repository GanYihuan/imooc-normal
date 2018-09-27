var postsData = require('../../data/posts-data.js')

Page({
	// data() {
	// 小程序总是会读取data对象来做数据绑定，这个动作我们称为动作A
	// 而这个动作A的执行，是在onLoad函数执行之后发生的
	// },
	onLoad: function() {
		/* 页面初始化 options 为页面跳转带来的参数 */
		// this.data.postList = postsData.postList
		/* setData(): 等同在 data() 里面写数据 */
		this.setData({
			postList: postsData.postList
		})
	},
	onPostTap: function(event) {
		/* currentTarget: 当前鼠标点击的组件 */
		/* dataset: 自定义属性集合, 这里是 **post.wxml/data-postId** */
		var postId = event.currentTarget.dataset.postid
		// console.log("on post id is" + postId);
		wx.navigateTo({
			url: 'post-detail/post-detail?id=' + postId
		})
	},
	onSwiperTap: function(event) {
		/*
    target 和currentTarget
		target指的是当前点击的组件 和currentTarget 指的是事件捕获的组件
		target这里指的是image，而currentTarget指的是swiper
    */
		var postId = event.target.dataset.postid
		wx.navigateTo({
			url: 'post-detail/post-detail?id=' + postId
		})
	}
})
