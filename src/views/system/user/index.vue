<script setup lang="ts">
/**
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineoptions}
 */
import { UploadFile } from "element-plus";
import {
  getUserPage,
  getUserForm,
  deleteUsers,
  addUser,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  downloadTemplateApi,
  exportUser,
  importUser,
} from "@/api/user";
import { listDeptOptions } from "@/api/dept";
import { listRoleOptions } from "@/api/role";

import { UserForm, UserQuery, UserPageVO } from "@/api/user/types";
import { ref } from "vue";

defineOptions({
  name: "User", // 组件名称 User
  inheritAttrs: false, // 避免与父组件属性冲突
});

const deptTreeRef = ref(ElTree); // 部门树
const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单

const loading = ref(false); // 加载状态 默认不加载
const ids = ref([]); // 选中id集合
const total = ref(0); // 总条数
const dialog = reactive<DialogOption>({
  visible: false, // 弹窗显示状态 默认不显示
});

const queryParams = reactive<UserQuery>({
  // 查询参数
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页条数
});
const userList = ref<UserPageVO[]>(); // 用户列表

const formData = reactive<UserForm>({
  // 表单数据
  status: 1, // 状态 默认启用 1
});

const rules = reactive({
  // 表单校验规则
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  nickname: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  deptId: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
  roleIds: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
});

const searchDeptName = ref(); // 部门名称
const deptList = ref<OptionType[]>(); // 部门列表
const roleList = ref<OptionType[]>(); // 角色列表
const importDialog = reactive<DialogOption>({
  // 导入弹窗
  title: "用户导入", // 弹窗标题
  visible: false, // 弹窗显示状态 默认不显示
});

/**
 * 导入选择的部门ID
 */
const importDeptId = ref<number>(); // 导入部门ID
const excelFile = ref<File>(); // 导入文件
const excelFilelist = ref<File[]>([]); // 导入文件列表

watchEffect(
  // 监听搜索部门名称的变化
  () => {
    // 监听搜索部门名称的变化
    deptTreeRef.value.filter(searchDeptName.value); // 调用ElTree的filter方法 过滤部门树 传入搜索部门名称
  },
  {
    // 配置
    flush: "post", // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/**
 * 部门筛选
 */
function handleDeptFilter(value: string, data: any) {
  if (!value) {
    // 如果没有搜索条件
    return true;
  }
  return data.label.indexOf(value) !== -1; // 如果搜索条件在部门名称中，返回true
}

/**
 * 部门树节点
 */
function handleDeptNodeClick(data: { [key: string]: any }) {
  queryParams.deptId = data.value; // 设置部门ID
  handleQuery(); // 查询 用户列表 重新加载数据 根据部门ID 查询用户列表
}

/**
 * 获取角色下拉列表
 */
async function getRoleOptions() {
  listRoleOptions().then((response) => {
    roleList.value = response.data;
  });
}

/**
 * 修改用户状态
 */
function handleStatusChange(row: { [key: string]: any }) {
  const text = row.status === 1 ? "启用" : "停用";
  ElMessageBox.confirm("确认要" + text + row.username + "用户吗?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      return updateUserStatus(row.id, row.status);
    })
    .then(() => {
      ElMessage.success(text + "成功");
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1;
    });
}

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  getUserPage(queryParams)
    .then(({ data }) => {
      userList.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  handleQuery();
}

/** 行选中事件 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/**重置密码 */
function resetPassword(row: { [key: string]: any }) {
  ElMessageBox.prompt(
    "请输入用户「" + row.username + "」的新密码",
    "重置密码",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  )
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning("请输入新密码");
        return false;
      }
      updateUserPassword(row.id, value).then(() => {
        ElMessage.success("密码重置成功，新密码是：" + value);
      });
    })
    .catch(() => {});
}

/** 打开表单弹窗 */
async function openDialog(userId?: number) {
  await getDeptOptions();
  await getRoleOptions();
  dialog.visible = true;
  if (userId) {
    dialog.title = "修改用户";
    getUserForm(userId).then(({ data }) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增用户";
  }
}

/** 关闭表单弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单 */
function resetForm() {
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined;
  formData.status = 1;
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  userFormRef.value.validate((valid: any) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;
      if (userId) {
        updateUser(userId, formData)
          .then(() => {
            ElMessage.success("修改用户成功");
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        addUser(formData)
          .then(() => {
            ElMessage.success("新增用户成功");
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 3000);

/** 删除用户 */
function handleDelete(id?: number) {
  const userIds = [id || ids.value].join(",");
  if (!userIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    deleteUsers(userIds).then(() => {
      ElMessage.success("删除成功");
      resetQuery();
    });
  });
}

/**
 * 获取部门下拉项
 */
async function getDeptOptions() {
  listDeptOptions().then((response) => {
    deptList.value = response.data;
  });
}

/** 下载导入模板 */
function downloadTemplate() {
  downloadTemplateApi().then((response: any) => {
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    });
    const a = document.createElement("a");
    const href = window.URL.createObjectURL(blob); // 下载链接
    a.href = href;
    a.download = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    ); // 获取后台设置的文件名称
    document.body.appendChild(a);
    a.click(); // 点击下载
    document.body.removeChild(a); // 下载完成移除元素
    window.URL.revokeObjectURL(href); // 释放掉blob对象
  });
}

/**
 * Excel文件change事件
 *
 * @param file
 */
function handleExcelChange(file: UploadFile) {
  if (!/\.(xlsx|xls|XLSX|XLS)$/.test(file.name)) {
    ElMessage.warning("上传Excel只能为xlsx、xls格式");
    excelFile.value = undefined;
    excelFilelist.value = [];
    return false;
  }
  excelFile.value = file.raw;
}

/** 打开导入弹窗 */
async function openImportDialog() {
  await getDeptOptions();
  importDeptId.value = undefined;
  importDialog.visible = true;
}

/** 关闭导入弹窗 */
function closeImportDialog() {
  importDialog.visible = false;
  excelFile.value = undefined;
  excelFilelist.value = [];
}

/** 导入用户提交 */
function handleImport() {
  if (importDeptId.value) {
    if (!excelFile.value) {
      ElMessage.warning("上传Excel文件不能为空");
      return false;
    }
    importUser(importDeptId.value, excelFile.value).then((response) => {
      ElMessage.success(response.data);
      closeImportDialog();
      resetQuery();
    });
  }
}

/** 导出用户 */
function handleExport() {
  exportUser(queryParams).then((response: any) => {
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    });
    const a = document.createElement("a");
    const href = window.URL.createObjectURL(blob); // 下载的链接
    a.href = href;
    a.download = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    ); // 获取后台设置的文件名称
    document.body.appendChild(a);
    a.click(); // 点击导出
    document.body.removeChild(a); // 下载完成移除元素
    window.URL.revokeObjectURL(href); // 释放掉blob对象
  });
}

onMounted(() => {
  getDeptOptions(); // 初始化部门
  handleQuery(); // 初始化用户列表数据
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <el-card shadow="never">
          <el-input v-model="searchDeptName" placeholder="部门名称" clearable>
            <template #prefix>
              <i-ep-search />
            </template>
          </el-input>

          <el-tree
            ref="deptTreeRef"
            class="mt-2"
            :data="deptList"
            :props="{ children: 'children', label: 'label', disabled: '' }"
            :expand-on-click-node="false"
            :filter-node-method="handleDeptFilter"
            default-expand-all
            @node-click="handleDeptNodeClick"
          />
        </el-card>
      </el-col>

      <el-col :lg="20" :xs="24">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                style="width: 200px"
              >
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleQuery"
                ><i-ep-search />搜索</el-button
              >
              <el-button @click="resetQuery">
                <i-ep-refresh />
                重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between">
              <div>
                <el-button
                  v-hasPerm="['sys:user:add']"
                  type="success"
                  @click="openDialog()"
                  ><i-ep-plus />新增</el-button
                >
                <el-button
                  v-hasPerm="['sys:user:delete']"
                  type="danger"
                  :disabled="ids.length === 0"
                  @click="handleDelete()"
                  ><i-ep-delete />删除</el-button
                >
              </div>
              <div>
                <el-dropdown split-button>
                  导入
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="downloadTemplate">
                        <i-ep-download />下载模板</el-dropdown-item
                      >
                      <el-dropdown-item @click="openImportDialog">
                        <i-ep-top />导入数据</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button class="ml-3" @click="handleExport"
                  ><template #icon><i-ep-download /></template>导出</el-button
                >
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="userList"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              label="编号"
              align="center"
              prop="id"
              width="100"
            />
            <el-table-column
              key="username"
              label="用户名"
              align="center"
              prop="username"
            />
            <el-table-column
              label="用户昵称"
              width="120"
              align="center"
              prop="nickname"
            />

            <el-table-column
              label="性别"
              width="100"
              align="center"
              prop="genderLabel"
            />

            <el-table-column
              label="部门"
              width="120"
              align="center"
              prop="deptName"
            />
            <el-table-column
              label="手机号码"
              align="center"
              prop="mobile"
              width="120"
            />

            <el-table-column label="状态" align="center" prop="status">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :inactive-value="0"
                  :active-value="1"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="createTime"
              width="180"
            />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="scope">
                <el-button
                  v-hasPerm="['sys:user:reset_pwd']"
                  type="primary"
                  size="small"
                  link
                  @click="resetPassword(scope.row)"
                  ><i-ep-refresh-left />重置密码</el-button
                >
                <el-button
                  v-hasPerm="['sys:user:edit']"
                  type="primary"
                  link
                  size="small"
                  @click="openDialog(scope.row.id)"
                  ><i-ep-edit />编辑</el-button
                >
                <el-button
                  v-hasPerm="['sys:user:delete']"
                  type="primary"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  ><i-ep-delete />删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      append-to-body
      @close="closeDialog"
    >
      <el-form
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptList"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <dictionary v-model="formData.gender" type-code="gender" />
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input
            v-model="formData.mobile"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog
      v-model="importDialog.visible"
      :title="importDialog.title"
      width="600px"
      append-to-body
      @close="closeImportDialog"
    >
      <el-form label-width="80px">
        <el-form-item label="部门">
          <el-tree-select
            v-model="importDeptId"
            placeholder="请选择部门"
            :data="deptList"
            filterable
            check-strictly
          />
        </el-form-item>

        <el-form-item label="Excel">
          <el-upload
            class="upload-demo"
            action=""
            drag
            :auto-upload="false"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :file-list="excelFilelist"
            :on-change="handleExcelChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload">
              <i-ep-upload-filled />
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">xls/xlsx files</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleImport">确 定</el-button>
          <el-button @click="closeImportDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
