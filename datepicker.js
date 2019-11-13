/*
 * @Author: HuMwing
 * @since: 2019-11-06 08:46:01
 * @lastTime: 2019-11-12 09:49:41
 * @LastAuthor: HuMwing
 * @message: 
 */
// components/datepicker/datepicker.js
import {
  formatDate,
  format
} from '../../utils/util.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    initDates: {
      type: Array,
      value: [Date.now(), Date.now()]
    },
    format: {
      type: String,
      value: 'yyyy-MM-dd'
    },
    canSelectNext: {
      type: Boolean,
      value: false
    },
    showRangeFormat: {
      type: String,
      value: 'yyyy/MM/dd'
    },
    showRangeSpliter: {
      type: String,
      value: '至'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dateArr: [],
    startTime: 0,
    showRange: false,
    endTime: 0,
    year: '',
    month: '',
    currentIndex: 0
  },
  lifetimes: {
    attached(){
      this.init()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(){
      let today = new Date();
      let endDate = today;
      if(this.data.initDates && this.data.initDates.length && this.data.initDates instanceof Array){
        if(typeof this.data.initDates[0] === 'string' && !/t/i.test(this.data.initDates[0])){
          today = new Date(this.data.initDates[0].replace(/-/gim, '/'));
        }else{
          today = new Date(this.data.initDates[0]);
        }
        if(typeof this.data.initDates[1] === 'string' && !/t/i.test(this.data.initDates[1])){
          endDate = new Date(this.data.initDates[1].replace(/-/gim, '/'));
        }else{
          endDate = new Date(this.data.initDates[1]);
        }
        if(today.toString() === 'Invalid Date'){
          today = new Date()
        }
        if(endDate.toString() === 'Invalid Date'){
          endDate = today
        }
        if(endDate.getTime() < today.getTime()){
          let temp = today;
          today = endDate;
          endDate = temp;
        }
      }
      this.setData({
        dateArr: this.getDates(today, true),
        year: today.getFullYear(),
        monthArr: this.getMonths(today.getTime()),
        month: (today.getMonth() + 1),
        thisMonth: today.getFullYear() + '' + (today.getMonth() + 1),
        thisDay: today.setDate(today.getDate()),
        startTime: today.setDate(today.getDate()),
        endTime: today.setDate(today.getDate()),
        formatStartTime: format(today, this.data.showRangeFormat),
        formatEndTime: format(today, this.data.showRangeFormat),
        lastDay: today.setDate(today.getDate() - 1),
        lastWeek: today.setDate(today.getDate() - 6)
      })
    },
    swiperChange({detail: {current,source}}){
      // 只要不是滑动到中间，都给滑动到中间
      if(current === 0){// 滑动到了最前面
        let data = this.getDates(this.data.dateArr[0][0].stamp)
        this.setData({
          dateArr: data,
          currentIndex: 1
        })
      }else if(current === 2){//滑动到了最后面
        let stamp = this.data.dateArr[2][0].stamp;
        if(stamp < Date.now()){
          let data = this.getDates(stamp)
          this.setData({
            dateArr: data,
            currentIndex: 1
          })
        }else{
          this.setData({
            currentIndex: 1
          })
        }
      }
      let firstDate = new Date(this.data.dateArr[this.data.currentIndex][0].stamp);
      this.setData({
        year: firstDate.getFullYear(),
        month: (firstDate.getMonth() + 1)
      })
    },
    changeDate(e){
      let {windex, dindex, nextday} = e.currentTarget.dataset;
      // 不允许选择今天以后
      if(!this.data.canSelectNext && nextday == 1){
        return;
      }
      this.singleDate = this.data.dateArr[windex][dindex].stamp;
      var selectDate = new Date(this.data.dateArr[windex][dindex].stamp);
      this.setData({
        startTime: this.singleDate,
        endTime: this.singleDate,
        year: selectDate.getFullYear(),
        month: (selectDate.getMonth() + 1)
      })
      this.valueChanged()
    },
    valueChanged(){
      this.triggerEvent('change', {
        startTime: this.data.startTime,
        formatStartTime: format(new Date(this.data.startTime), this.data.format),
        formatEndTime: format(new Date(this.data.endTime), this.data.format),
        endTime: this.data.endTime
      })
      this.setData({
        formatStartTime: format(new Date(this.data.startTime), this.data.showRangeFormat),
        formatEndTime: format(new Date(this.data.endTime), this.data.showRangeFormat)
      })
    },
    changeMonth(e){
      let type = +e.currentTarget.dataset.type;
      let m = this.data.monthArr[0]
      // 取当前月份的中间的那个元素，这个元素肯定是在当前月份，这样不用遍历查找了
      let date = new Date(m[Math.floor(m.length / 2)].stamp);
      // 获取上/下个月的月份表
      let now = date.setMonth(date.getMonth() + type)
      let toDay = new Date()
      let nowYear = toDay.getFullYear()
      let nowMonth = toDay.getMonth()
      if(date.getMonth() > nowMonth && nowYear <= date.getFullYear()){
        return;
      }
      this.setData({
        monthArr: this.getMonths(now)
      })
    },
    setDateRange(e){
      let start = e.currentTarget.dataset.start;
      let end = e.currentTarget.dataset.end;
      let setData = {};
      if(start){
        setData.endTime = end ? +end : this.data.thisDay;
        setData.startTime = +start;
        setData.monthArr = this.getMonths(this.data.thisDay)
      }
      this.setData(setData)
      if(!start){
        this.setData({
          showRange: false,
          dateArr: this.getDates(this.data.startTime)
        })
        this.valueChanged()
      }
    },
    getMonths(monthStr){
      var now = monthStr ? new Date(monthStr) : new Date();
      var monthDays = []
      monthDays.push(this.getMonthDays(now))
      this.setData({
        year: now.getFullYear(),
        month: now.getMonth() + 1
      })
      return monthDays
    },
    touchstart(e){
      this.isMoving = false;
      const query = wx.createSelectorQuery().in(this)
      query.select('.item-0').boundingClientRect()
      // 获取到选择框的可选区域大小
      query.exec((res)=> {
        this.ptop = res[0].top;
        this.pbottom = res[0].top + res[0].height;
      })
      // 获取当前的视窗大小，用于计算日期单元格的索引用
      let {windowWidth,windowHeight} = wx.getSystemInfoSync()
      this.windowWidth = windowWidth
      this.windowHeight = windowHeight
      let stamp = this.data.monthArr[0][e.currentTarget.dataset.dindex].stamp;
      // 不允许选择超过当前时间
      if(!this.data.canSelectNext && stamp > Date.now()){
        return;
      }
      // 用于当次点击的时候用，比如没有滑动的情况下
      if(!this.startTime){
        this.startTime = stamp;
        this.endTime = 0;
        this.setData({
          startTime: stamp,
          endTime: stamp
        })
      }else if(!this.endTime){
        if(stamp < this.startTime){
          this.data.startTime = stamp
          stamp = this.startTime
        }
        this.endTime = 0;
        this.startTime = 0;
        this.setData({
          startTime:this.data.startTime,
          endTime: stamp
        })
      }
    },
    stopEvent(){
      // 捕获事件，防止下层滚动
    },
    touchend(e){
      // 触摸结束后，将变量都重置
      if(this.isMoving){
        this.isMoving = false;
        this.startTime = 0;
        this.endTime = 0;
        return;
      }
    },
    touchmove({touches: [{pageX, pageY}]}){
      // 操作太快的时候会出现startTime是空
      if(!this.startTime){
        return;
      }
      this.isMoving = true;
      // 计算横向索引
      pageX = pageX < 0 ? 0 : pageX > this.windowWidth ? this.windowWidth : pageX;
      let xindex = Math.ceil(pageX / (this.windowWidth / 7))
      // 计算竖向索引
      pageY -= this.ptop
      pageY = pageY > this.pbottom ? this.pbottom : pageY < 0 ? 0 : pageY;
      // Y方向的话取4舍5入，这样不至于太灵敏
      let yindex = Math.round(pageY / (this.windowWidth / 750 * 110))
      // 计算日期单元格在数组中的索引
      let dindex = (xindex - 1) + (yindex - 1) * 7;
      // 最小是0，最大是数组长度
      dindex = dindex < this.data.monthArr[0].length - 1 ? (dindex > 0 ? dindex : 0) : this.data.monthArr[0].length - 1;
      let endTime = this.data.monthArr[0][dindex].stamp;
      // 不允许选择超过当前时间
      if(!this.data.canSelectNext && endTime > Date.now()){
        return;
      }
      // 如果结束和起始时间差距比较大，用最初的那个起始时间
      if(endTime < this.startTime){
        let temp = this.startTime
        this.data.startTime = endTime;
        endTime = temp;
      }else{
        this.data.startTime = this.startTime;
      }
      this.endTime = endTime
      this.setData({
        endTime: endTime,
        startTime: this.data.startTime
      })
    },
    getMonthDays(dateObj) {
      // 今天
      var todayDate = new Date();
      var toDayStamp = todayDate.setDate(todayDate.getDate());
      var todayStr = formatDate(todayDate);
      // 设置的月份
      var now = dateObj ? new Date(dateObj) : new Date();
      var nowMonth = now.getMonth();
      // 当月的第一天
      var firstDayDate = new Date(now.setDate(1));
      var firstDay = firstDayDate.getDate()
      // 记录下来，后面用到
      var firstDayTime = firstDayDate.getTime()
      // 当月的最后一天，这里是通过先设置下一个月，然后再下一个月设置日期为0，即为当月的最后一天
      var lastDay = new Date(new Date(now.setMonth(nowMonth + 1)).setDate(0));
      // 将时间重置回来
      now = firstDayDate;
      // 从星期一开始，将日期从星期一开始，不足的填满上个月的日期
      let start = firstDay - (firstDayDate.getDay() || 7 - 1);
      var end = lastDay.getDate()/*  + (7 - lastDay.getDay() || 7) 需要填满到星期天的话打开*/;
      let monthDays = [];
      for (; start < end; start++) {
        // 把日期设置到指定的日期，
        // 比如这个月的第一天是1号，那么往前一天就是上个月的最后一天，此时：1-1=0
        // 第二天就是：1+1=2，依此类推，这样不用管哪天是每个月的最后一天
        now.setDate(firstDay + start)
        // 今天以后的时间不显示
        if(now > toDayStamp){
          break;
        }
        var date = formatDate(now);
        var stamp = now.getTime();
        monthDays.push({
          // 天的数字
          day: now.getDate(),
          // 时间戳
          stamp: stamp,
          // 是否是当前这个月的天
          isMonthDay: start >= 0,
          // 是否是今天
          isToday: todayStr === date,
          // 是否大于今天
          nextDay: stamp > toDayStamp,
          // 格式化的天，2019-10-10这样的格式
          date: date
        })
        // 记得将日期重置回来，因为我们的计算是依据第一天，setDate会改变当前对象。
        now = new Date(firstDayTime);
      }
      return monthDays;
    },
    showRangeModal(){
      this.setData({
        showRange: true,
        // 显示的时候将之前划走的日期定位到起始日期在的月份
        monthArr: this.getMonths(this.data.startTime)
      })
    },
    hideRangeModal(){
      this.setData({
        showRange: false
      })
      // 点击模态框关闭的话也触发一下
      this.valueChanged()
      this.triggerEvent('picker-modal-close');
    },
    getDates(timeStr, init) {
      var now = timeStr ? new Date(timeStr) : new Date();
      var _toDay = now.getDate();
      var weekDay = now.getDay() || 7;
      var todayDate = new Date();
      var toDayStamp = todayDate.setDate(todayDate.getDate())
      var todayStr = formatDate(todayDate);
      // 取今天所在的星期里面的星期一，因为星期一是作为展示的第一项
      now.setDate(_toDay - (weekDay - 1))
      var toDay = now.getDate();
      var dateTime = now.getTime();
      var dateArr = [];
      // 第一轮循环，是循环swiper的item，我们这里用3个，默认当前的时间是在中间
      for (var i = -1; i < 2; i++) {
        let _week = []
        for (var j = 0; j < 7; j++) {
          // 每个swiper-item里面有7天，对应上面的星期
          now.setDate(toDay +  i * 7 + j)
          var date = formatDate(new Date(now));
          var stamp = now.getTime();
          _week.push({
            day: now.getDate(),
            stamp: stamp,
            isToday: todayStr === date,
            nextDay: stamp > toDayStamp,
            date: date
          })
          // 如果是初始化的话，就将索引设置到中间
          if(todayStr === date && init){
            this.singleDate = stamp
            this.setData({
              currentIndex: i + 1
            })
          }
          // 重置一下，不然会变成不知道是哪个月了，setDate会改变当前的对象
          now = new Date(dateTime);
        }
        dateArr.push(_week)
      }
      return dateArr
    }
  }
})
