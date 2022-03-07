<template>
  <el-dialog
    append-to-body
    :close-on-click-modal="false"
    :before-close="crud.cancelCU"
    :visible="crud.status.cu > 0"
    :title="crud.status.title"
    width="500px"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      size="small"
      label-width="80px"
    >
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          style="width: 370px;"
        />
      </el-form-item>
      <el-form-item
        label="排序"
        prop="shopSort"
      >
        <el-input-number
          v-model.number="form.shopSort"
          :min="0"
          :max="999"
          controls-position="right"
          style="width: 370px;"
        />
      </el-form-item>
      <el-form-item label="岗位" prop="jobs">
        <el-select
          v-model="jobDatas"
          style="width: 178px"
          multiple
          placeholder="请选择"
          @change="changeJob"
        >
          <el-option
            v-for="item in jobs"
            :key="item.name"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="form.pid !== 0"
        label="状态"
        prop="enabled"
      >
        <el-radio
          v-for="item in shopStatus"
          :key="item.id"
          v-model="form.enabled"
          :label="item.value === 'true'"
        >
          {{ item.label }}
        </el-radio>
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="text"
        @click="crud.cancelCU"
      >
        取消
      </el-button>
      <el-button
        :loading="crud.status.cu === 2"
        type="primary"
        @click="crud.submitCU"
      >
        确认
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import CRUD, { form } from '@crud/crud'
import { getAllJob } from '@/api/system/job'

let shopJobs = []

const defaultForm = {
  id: null,
  name: '',
  shopSort: 999,
  enabled: true,
  jobs: []
}
export default {
  mixins: [form(defaultForm)],
  props: {
    shopStatus: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      jobDatas: [],
      jobs: [],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        shopSort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      [CRUD.HOOK.afterToCU](crud, form) {
        console.log('afterToCU')
        this.getJobs()
        // form.enabled = form.enabled.toString()
      },
      // 新增前将多选的值设置为空
      [CRUD.HOOK.beforeToAdd]() {
        console.log('beforeToAdd')

        this.jobDatas = []
      },
      // 初始化编辑时候的角色与岗位
      [CRUD.HOOK.beforeToEdit](crud, form) {
        this.getJobs()
        this.jobDatas = []
        shopJobs = []
        const _this = this
        form.jobs.forEach(function(job, index) {
          _this.jobDatas.push(job.id)
          const data = { id: job.id }
          shopJobs.push(data)
        })
      },
      // 提交前做的操作
      [CRUD.HOOK.afterValidateCU](crud) {
        if (this.jobDatas.length === 0) {
          this.$message({
            message: '岗位不能为空',
            type: 'warning'
          })
          return false
        }
        crud.form.jobs = shopJobs
        return true
      },
      changeJob(value) {
        shopJobs = []
        value.forEach(function(data, index) {
          const job = { id: data }
          shopJobs.push(job)
        })
      },
      getJobs() {
        getAllJob().then(res => {
          console.log(res.content)
          this.jobs = res.content
        }).catch(() => { })
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
