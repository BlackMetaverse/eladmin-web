<template>
  <el-container style="">
    <el-header>
      <h1 class="header">当月订单销售情况</h1>
      <!-- <p class="scrollbar-demo-item"> -->
    </el-header>
    <el-main>
      <el-row style="padding:16px 16px 0;margin-bottom:32px;">
        <el-table ref="table" :data="tableData" :row-style="{background:'#EFF0F3',color:'#A2AAB4',height:'80px',fontSize:'28px'}" align="center" :height="fullHeight" style="width: 100%;font-size: 28px">
          <el-table-column type="index" label="排名" width="100px" />
          <el-table-column prop="orderTime" label="下单时间" />
          <el-table-column prop="name" label="商品" />
          <el-table-column prop="createBy" label="销售顾问" />
          <el-table-column prop="price" label="利润" />
        </el-table>
      </el-row>
    </el-main>
    <el-dialog
      title="新订单"
      :visible.sync="centerDialogVisible"
      width="60%"
      style=""
      center
    >
      <el-descriptions direction="vertical" :column="4" border style="font-size: 60px">
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
import { queryTopOrderPrice, queryNewOrder } from '@/api/order/manager'
const synth = window.speechSynthesis
export default {
  name: 'Dashboard',
  components: {
  },
  data() {
    return {
      tableData: [],
      fullHeight: document.documentElement.clientHeight - 200,
      timeOut: '',
      lastQueryTime: Date.now(),
      dialogArray: [],
      dialogValue: {},
      centerDialogVisible: false
    }
  },
  mounted() {
    // this.getOrderData()
    // 拿到表格挂载后的真实DOM
    const table = this.$refs.table
    // 拿到表格中承载数据的div元素
    const divData = table.bodyWrapper
    // 拿到元素后，对元素进行定时增加距离顶部距离，实现滚动效果(此配置为每100毫秒移动1像素)
    setInterval(() => {
      // 元素自增距离顶部1像素
      divData.scrollTop += 1
      // 判断元素是否滚动到底部(可视高度+距离顶部=整个高度)
      if (divData.clientHeight + divData.scrollTop === divData.scrollHeight) {
        // 重置table距离顶部距离
        if (divData.scrollTop === 0) {
          this.getOrderData()
        }
        divData.scrollTop = 0
      }
    }, 30)
    // 读取最新订单情况
    setInterval(() => {
      if (this.centerDialogVisible) {
        return
      }
      if (this.dialogArray.length === 0) { // 如果展示框还处于打开状态，等待下一次
        this.queryNewOrder()
        return
      } else {
        this.dialogValue = this.dialogArray.shift()
        this.speek('现在播报的是测试语言播报')
        this.centerDialogVisible = true
        setTimeout(this.closeNewOrder, 10000)
      }
      // 元素自增距离顶部1像素
    }, 10000)
  },
  methods: {
    // 获取订单数据
    getOrderData() {
      const date = new Date()
      const y = date.getFullYear()
      const m = date.getMonth()
      var beginTime = new Date(y, m, 1).getTime()
      // console.log(beginTime)
      const _this = this
      queryTopOrderPrice(beginTime).then(res => {
        _this.tableData = res
      }).catch(() => { })
    },
    queryNewOrder() {
      if (this.dialogArray.length > 0) {
        return
      }
      const startTime = this.lastQueryTime
      console.log(startTime)
      this.lastQueryTime = Date.now()
      // queryNewOrder(startTime).then(res => {
      //   this.dialogArray = res
      // }).catch(() => { })
      queryNewOrder(1646928000000).then(res => {
        this.dialogArray = res
      }).catch(() => { })
    },
    closeNewOrder() {
      this.dialogValue = {}
      this.centerDialogVisible = false
    },
    speek(text) {
      const ssu = new SpeechSynthesisUtterance(text)
      synth.speak(ssu)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

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
</style>
