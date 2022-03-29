<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-select v-model="query.shopId" clearable placeholder="请选择店铺" filterable class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in shops" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <date-range-picker v-model="query.date" class="date-item" />
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
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item label="产品数量" prop="productCount">
            <el-input v-model="form.productCount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="展现数" prop="viewCount">
            <el-input v-model="form.viewCount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="访客量" prop="viewerCount">
            <el-input v-model="form.viewerCount" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler" @sortable="custom" @sort-change="changeSort">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="shopId" :formatter="getShopName" label="店铺名称" />
        <el-table-column prop="date" :formatter="getDate" label="日期" />
        <el-table-column prop="productCount" label="产品数量" sortable :sort-orders="['ascending', 'descending']" />
        <el-table-column prop="viewCount" label="展现数" sortable :sort-orders="['ascending', 'descending']" />
        <el-table-column prop="viewerCount" label="访客量" sortable :sort-orders="['ascending', 'descending']" />
        <el-table-column prop="updateBy" label="更新者" />
        <el-table-column prop="updateTime" label="更新时间" :v-show="false" />
        <el-table-column v-if="checkPer(['admin','shopOperation:edit','shopOperation:del'])" label="操作" width="150px" align="center">
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
import crudOrder from '@/api/order/operation'
import { getAllShop } from '@/api/system/shop'
import { getAllUser } from '@/api/system/user'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { operationId: null, shopId: null, productCount: null, viewCount: null, viewerCount: null, date: null, createBy: null, updateBy: null, createTime: null, updateTime: null, shops: [] }
export default {
  name: 'ShopOperation',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '店铺运营', url: 'api/shopOperation', idField: 'operationId', sort: 'operationId,desc', crudMethod: { ...crudOrder }})
  },
  data() {
    return {
      // 下拉菜单
      shops: [],
      users: [],
      permission: {
        add: ['admin', 'shopOperation:add'],
        edit: ['admin', 'shopOperation:edit'],
        del: ['admin', 'shopOperation:del']
      },
      rules: {
        shopId: [
          { required: true, message: '店铺不能为空', trigger: 'blur' }
        ],
        productCount: [
          { required: true, message: '产品数量不能为空', trigger: 'blur' }
        ],
        viewCount: [
          { required: true, message: '展现数不能为空', trigger: 'blur' }
        ],
        viewerCount: [
          { required: true, message: '访问量不能为空', trigger: 'blur' }
        ],
        date: [
          { required: true, message: '日期不能为空', trigger: 'blur' }
        ]
      }}
  },
  mounted: function() {
    const _this = this
    getAllShop().then(res => {
      _this.shops = res
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
        this.shops = res
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
    getDate(row, col) {
      return row.date.slice(0, 10)
    },
    changeSort(val) {
      const sort = val.order
      if (sort === 'ascending') {
        this.crud.sort = [val.prop + ',asc']
      } else if (sort === 'descending') {
        this.crud.sort = [val.prop + ',desc']
      } else {
        this.crud.sort = ['operationId,desc']
      }
      this.crud.toQuery()
    }
  }
}
</script>

<style scoped>

</style>
