<template>
  <el-container style="background-color: #ea4335;">
    <el-main style="background-color: #ea4335;">
      <el-row style="padding:4px 4px 0;margin-bottom:8px;background-color: #ea4335;" :gutter="20">
        <h1 style="font-size: 40px;color: black" class="header">拼拼乐本月利润排行榜</h1>
      </el-row>
      <el-row style="background-color: #ea4335;" :gutter="20">
        <h2 style="font-size: 32px;color: black" class="header">当月总利润：{{ monthProfit.profit || 0 }} 当月完成比例：{{ monthProfit.profitScale || 0 }}%</h2>
      </el-row>
      <el-row style="padding:16px 16px 0;margin-bottom:32px;background-color: #ea4335;" :gutter="20">
        <el-col :xs="24" :sm="24" :lg="12">
          <el-table ref="table" class="pt-table" :data="tableData" border align="center" center size="medium" style="font-size: 28px;color: black">
            <el-table-column prop="sort" label="排名" width="100px" />
            <el-table-column prop="nickName" label="姓名" />
            <el-table-column prop="profit" label="当月总利润" />
            <el-table-column prop="profitScale" label="完成当月比例" />
          </el-table>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <el-table ref="table" class="pt-table" :data="tableData2" border align="center" center size="medium" style="font-size: 28px;color: black">
            <el-table-column prop="sort" label="排名" width="100px" />
            <el-table-column prop="nickName" label="姓名" />
            <el-table-column prop="profit" label="当月总利润" />
            <el-table-column prop="profitScale" label="完成当月比例" />
          </el-table>
        </el-col>
      </el-row>
    </el-main>
    <el-dialog
      title="新订单"
      :visible.sync="centerDialogVisible"
      width="60%"
      style="background-color: #ea4335;"
      center
    >
      <el-descriptions direction="vertical" :column="4" border style="background-color: #ea4335;font-size: 60px">
        <el-descriptions-item label="下单时间">{{ dialogValue.orderTime || '' }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ dialogValue.name || '' }}</el-descriptions-item>
        <el-descriptions-item label="销售顾问"> {{ dialogValue.createBy || '' }}</el-descriptions-item>
        <el-descriptions-item label="单价"> {{ dialogValue.price || '' }}</el-descriptions-item>
        <el-descriptions-item label="成本"> {{ dialogValue.cost || '' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-container>
</template>

<script>
import { queryTopOrderPrice, queryNewOrder, queryMonthTotalProfit } from '@/api/order/manager'
const synth = window.speechSynthesis

const speak = (msg) => {
  const u = new SpeechSynthesisUtterance()
  u.lang = 'zh-CN'
  u.text = msg
  synth.cancel()
  synth.speak(u)
}

export default {
  name: 'Dashboard',
  components: {
  },
  data() {
    return {
      tableData: [],
      tableData2: [],
      fullHeight: document.documentElement.clientHeight - 200,
      timeOut: '',
      lastQueryTime: Date.now(),
      dialogArray: [],
      dialogValue: {},
      centerDialogVisible: false,
      monthProfit: {}
    }
  },
  mounted() {
    this.getOrderData()
    this.queryMonthTotalProfit()
    setInterval(() => {
      this.getOrderData()
    }, 10000)
    setInterval(() => {
      this.queryMonthTotalProfit()
    }, 60000)
    // 读取最新订单情况
    setInterval(() => {
      if (this.centerDialogVisible) {
        return
      }
      if (this.dialogArray.length === 0) { // 如果展示框还处于打开状态，等待下一次
        this.queryNewOrder()
        return
      } else {
        const tellValue = this.dialogArray.shift()
        this.dialogValue = tellValue
        this.centerDialogVisible = true
        // 设置时间
        const date = tellValue.createTime.replace(/-/g, '/')
        this.lastQueryTime = new Date(date).getTime()
        // 语音播报
        speak('爆单啦！爆单啦！恭喜' + tellValue.createBy + '，成交金额' + tellValue.price + '元，拍货' + tellValue.cost + '元，利润' + (tellValue.price - tellValue.cost) + '元。越努力，越幸运，拼拼乐，有拼才有乐！')
        setTimeout(this.closeNewOrder, 20000)
      }
      // 元素自增距离顶部1像素
    }, 5000)
  },
  methods: {
    // 获取订单数据
    getOrderData() {
      const date = new Date()
      const y = date.getFullYear()
      const m = date.getMonth()
      var beginTime = new Date(y, m, 1).getTime()
      const _this = this
      queryTopOrderPrice(beginTime).then(res => {
        _this.tableData = res.slice(0, 15)
        // if (_this.tableData.length < 15) {
        //   _this.tableData.push([15 - _this.tableData.length])
        // }
        _this.tableData2 = res.slice(15, 30)
        // for (let i = _this.tableData2.length; i < 15; i++) {
        //   _this.tableData2.push({ sort: ' ' })
        // }
        // speak('1111')
      }).catch(() => { })
    },
    queryMonthTotalProfit() {
      const date = new Date()
      const y = date.getFullYear()
      const m = date.getMonth()
      var beginTime = new Date(y, m, 1).getTime()
      const _this = this
      queryMonthTotalProfit(beginTime).then(res => {
        _this.monthProfit = res
      }).catch(() => { })
    },
    queryNewOrder() {
      console.log('queryNewOrder')
      if (this.dialogArray.length > 0) {
        return
      }
      const startTime = this.lastQueryTime
      queryNewOrder(startTime).then(res => {
        this.dialogArray = res
      }).catch(() => { })
    },
    closeNewOrder() {
      this.dialogValue = {}
      this.centerDialogVisible = false
    },
    getRowClass({ row, column, rowIndex, columnIndex }) {
      return 'background:#3f5c6d2c;color:#000;'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">

//   .pt-table,
//   .pt-table .el-table__inner-wrapper .el-table__body-wrapper table tbody,
//   .pt-table .el-table__inner-wrapper .el-table__body-wrapper table tbody tr,
//   .pt-table .el-table__inner-wrapper .el-table__body-wrapper table tbody tr td {
//     background-color: #ea4335 !important;
//     border-bottom: none !important;
//     // color: #ea4335;
//   }
//   /** 表头背景色 **/
//   .pt-table .el-table__inner-wrapper .el-table__header-wrapper table thead tr,
//   .pt-table .el-table__inner-wrapper .el-table__header-wrapper table thead tr th
//   {
//     background-color: #ea4335 !important;
//     border-bottom: none !important;
//     // color: #ea4335;
//   }
//   /** 取消伪类带出来的背景色（因为底部多了一条线） **/
//   .pt-table .el-table__inner-wrapper::before{
//     width: 0;
//   }

//   /* 表格内背景颜色 */
//   .el-table th, .el-table tr,.el-table td{
//     border: 0;
//     background-color: transparent;
//   }
//   /* 双数行背景颜色 */
//   .el-table--striped .el-table__body tr.el-table__row--striped td {
//     background-color: #ea4335;
//     background-color: #ea4335
//   }
//  /* 使表格背景透明 */
//   .el-table th, .el-table tr {
//     background-color: transparent;
//   }

//   /* 删除表格下横线 */
//   .el-table::before {
//     left: 0;
//     bottom: 0;
//     width: 100%;
//     height: 0px;
//   }

  /* 表格表头字体颜色 */
  .el-table thead {
    color: black;
    font-weight: 360;
    // background-color: #ea4335;
  }

  .el-table th,
  .el-table tr {
    // background: transparent !important;
    background: #ea4335 !important;
  }
  // 2.修改移入到每行的背景色
  .el-table__body tr:hover > td {
    background: #ea4335 !important;
  }
  // 3.修改表格边框颜色
  // 右边和下边
  .el-table--border:after,
  .el-table--group:after,
  .el-table:before {
    background-color: black !important;
  }
  // 左边和上边
  .el-table--border,
  .el-table--group {
    border-color: black !important;
  }
  .el-table td,
  .el-table th.is-leaf {
    border-bottom: 2px solid black !important;
  }
  // 头部的下边框
  .el-table--border th,
  .el-table--border th.gutter:last-of-type {
    border-bottom: 2px solid black !important;
  }
  // 列表中间的竖线
  .el-table--border td,
  .el-table--border th {
    border-right: 2px solid black !important;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    // height: 50px;
    // margin: 10px;
    text-align: center;
    border-radius: 4px;
    background: var(--el-color-primary-light-9);
    color: black;
  }

  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
      position: absolute;
      top: 0;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width:1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }

  // .el-table th{
  //   color: #ffffff; /* 字体颜色 */
  //   font-size: 16px;
  //   background-color: transparent !important;/* 背景透明 */
  //   border: 0;
  //   height: 30px;
  //   line-height: 30px;
  // }
  // .el-table tr, .el-table td {
  //   color: #e5dada;
  //   font-size: 12px;
  //   background-color: transparent !important;/* 背景透明 */
  //   border: 0;
  //   height: 30px;
  //   line-height: 30px;
  // }

</style>
