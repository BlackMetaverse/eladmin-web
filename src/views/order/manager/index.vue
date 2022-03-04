<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-select v-model="query.shopId" clearable placeholder="请选择店铺" filterable class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in shops" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select v-model="query.createBy" clearable placeholder="请选择员工" filterable class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in users" :key="item.username" :label="item.nickName" :value="item.username" />
        </el-select>
        <date-range-picker v-model="query.orderTime" class="date-item" />
        <el-select v-model="query.orderStatus" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in dict.dict.order_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="90px">
          <el-form-item label="店铺" prop="shopId">
            <el-select v-model="form.shopId" style="width: 370px" filterable placeholder="请选择店铺" @change="changeShop">
              <el-option
                v-for="item in shops"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="原始订单ID">
            <el-input v-model="form.sourceOrderId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input v-model="form.price" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="成本" prop="cost">
            <el-input v-model="form.cost" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="下单时间">
            <el-date-picker
              v-model="form.orderTime"
              type="datetime"
              placeholder="选择日期时间"
            />
          </el-form-item>
          <el-form-item label="订单状态" prop="orderStatus">
            <el-select v-model="form.orderStatus" placeholder="订单状态">
              <el-option
                v-for="item in dict.order_status"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <!-- <el-table-column prop="orderId" label="ID" /> -->
        <el-table-column prop="shopId" :formatter="getShopName" label="店铺名称" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="sourceOrderId" label="原始订单ID" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="cost" label="成本" />
        <el-table-column prop="userName" label="下单人" />
        <el-table-column prop="orderTime" label="下单时间" />
        <el-table-column prop="orderStatus" :formatter="getOrderStatus" label="订单状态" />
        <el-table-column prop="updateBy" label="更新者" show-overflow-tooltip="false" />
        <el-table-column prop="updateTime" label="更新时间" :v-show="false" />
        <el-table-column v-if="checkPer(['admin','order:edit','order:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudOrder from '@/api/order/manager'
import { getAllShop } from '@/api/system/shop'
import { getAllUser } from '@/api/system/user'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { orderId: null, shopId: null, name: null, sourceOrderId: null, price: null, cost: null, orderTime: null, orderStatus: null, createBy: null, updateBy: null, createTime: null, updateTime: null, shops: [], order_status: [] }
export default {
  name: 'Order',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '订单', url: 'api/order', idField: 'orderId', sort: 'orderId,desc', crudMethod: { ...crudOrder }})
  },
  dicts: ['order_status'],
  data() {
    return {
      // 下拉菜单
      shops: [],
      users: [],
      order_status: [],
      permission: {
        add: ['admin', 'order:add'],
        edit: ['admin', 'order:edit'],
        del: ['admin', 'order:del']
      },
      rules: {
        shopId: [
          { required: true, message: '店铺ID不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '价格不能为空', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '成本不能为空', trigger: 'blur' }
        ],
        orderStatus: [
          { required: true, message: '订单状态不能为空', trigger: 'blur' }
        ]
      }}
  },
  mounted: function() {
    this.order_status = this.dict.order_status
    const _this = this
    getAllShop().then(res => {
      _this.shops = res.content
    }).catch(() => { })
    getAllUser().then(res => {
      _this.users = res.content
    }).catch(() => { })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.beforeToCU](crud, form) {
      this.getShops()
      if (form.orderStatus == null) {
        form.orderStatus = this.order_status[0].value
      }
    },
    [CRUD.HOOK.beforeSubmit]() {
      return true
    },
    changeShop(value) {
      console.log(value)
      this.shopId = value.id
    },
    getShops() {
      getAllShop().then(res => {
        this.shops = res.content
        console.log(this.shops)
      }).catch(() => { })
    },
    getShopName(row, col) {
      for (var i in this.shops) {
        if (this.shops[i].id === row.shopId) {
          return this.shops[i].name
        }
      }
    },
    getOrderStatus(row, col) {
      for (var i in this.order_status) {
        if (this.order_status[i].value === row.orderStatus) {
          return this.order_status[i].label
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
