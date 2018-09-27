var util = require('../../utils/util.js')
var app = getApp()

Page({
	/*
	RESTFul API JSON
	SOAP XML
  */
	data: {
		inTheaters: {},
		comingSoon: {},
		top250: {},
		searchResult: {},
		containerShow: true,
		searchPanelShow: false
	},
	onLoad: function(event) {
		var inTheatersUrl =
			app.globalData.doubanBase + '/v2/movie/in_theaters' + '?start=0&count=3'
		var comingSoonUrl =
			app.globalData.doubanBase + '/v2/movie/coming_soon' + '?start=0&count=3'
		var top250Url =
			app.globalData.doubanBase + '/v2/movie/top250' + '?start=0&count=3'
		this.getMovieListData(inTheatersUrl, 'inTheaters', '正在热映')
		this.getMovieListData(comingSoonUrl, 'comingSoon', '即将上映')
		this.getMovieListData(top250Url, 'top250', '豆瓣Top250')
	},
	getMovieListData: function(url, settedKey, categoryTitle) {
		var that = this
		wx.request({
			url: url,
			/* OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT */
			method: 'GET',
			header: {
				'Content-Type': 'json'
			},
			success: function(res) {
				// console.log(res)
				that.processDoubanData(res.data, settedKey, categoryTitle)
			},
			fail: function(error) {
				/* 断网的时候调用 */
				console.log(error)
			}
		})
	},
	processDoubanData: function(moviesDouban, settedKey, categoryTitle) {
		var movies = []
		for (var idx in moviesDouban.subjects) {
			var subject = moviesDouban.subjects[idx]
			var title = subject.title
			if (title.length >= 6) {
				title = title.substring(0, 6) + '...'
			}
			var temp = {
				/* [1,1,1,1,1] [1,1,1,0,0] */
				stars: util.convertToStarsArray(subject.rating.stars),
				title: title,
				average: subject.rating.average,
				coverageUrl: subject.images.large,
				movieId: subject.id
			}
			movies.push(temp)
		}
		/* js 动态赋值 */
		var readyData = {}
		readyData[settedKey] = {
			categoryTitle: categoryTitle,
			movies: movies
		}
		this.setData(readyData)
	},
	onMoreTap: function(event) {
		var category = event.currentTarget.dataset.category
		wx.navigateTo({
			url: 'more-movie/more-movie?category=' + category
		})
	},
	onMovieTap: function(event) {
    /*
    target 指的是当前点击的组件, 这里指的是 image
    currentTarget 指的是事件捕获的组件, 这里指的是 swiper
    dataset: 自定义属性集合
    */
		var movieId = event.currentTarget.dataset.movieid
		wx.navigateTo({
			url: 'movie-detail/movie-detail?id=' + movieId
		})
	},
	onCancelImgTap: function(event) {
		this.setData({
			containerShow: true,
			searchPanelShow: false,
			searchResult: {}
		})
	},
	onBindFocus: function(event) {
		this.setData({
			containerShow: false,
			searchPanelShow: true
		})
	},
	onBindBlur: function(event) {
		var text = event.detail.value
		var searchUrl = app.globalData.doubanBase + '/v2/movie/search?q=' + text
		this.getMovieListData(searchUrl, 'searchResult', '')
	}
})
