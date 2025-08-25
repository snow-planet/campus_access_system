"use strict";
const common_vendor = require("./common/vendor.js");
const _sfc_main = {
  data() {
    return {
      approverCount: 5,
      pendingApplicationCount: 3,
      selectedCollege: "信息中心",
      selectedCollegeIndex: 6,
      applicationFilters: {
        position: "all"
      },
      accountFilters: {
        role: "all",
        college: "all",
        roleIndex: 0,
        collegeIndex: 0
      },
      applications: [],
      accounts: [],
      showCreateAccountModal: false,
      showApplicationsModal: false,
      newAccount: {
        username: "",
        password: "",
        real_name: "",
        phone: "",
        college: "",
        position: "teacher",
        collegeIndex: -1,
        positionIndex: 0
      },
      roleOptions: ["全部类型", "后台账号", "审批人账号"],
      positionOptions: ["二级学院负责人", "保卫处"],
      collegeOptions: [
        "计算机学院",
        "外国语学院",
        "经济管理学院",
        "电子工程学院",
        "机械工程学院",
        "保卫处",
        "信息中心"
      ],
      collegeFilterOptions: [
        "全部学院",
        "计算机学院",
        "外国语学院",
        "经济管理学院",
        "电子工程学院",
        "机械工程学院",
        "保卫处",
        "信息中心"
      ]
    };
  },
  computed: {
    hasPendingApplications() {
      return this.pendingApplicationCount > 0;
    }
  },
  methods: {
    getPositionText(position) {
      const positionMap = {
        "teacher": "教师",
        "security": "安保人员",
        "other": "其他"
      };
      return positionMap[position] || "未知";
    },
    getRoleText(role) {
      const roleMap = {
        "all": "全部类型",
        "admin": "后台账号",
        "approver": "审批人",
        "user": "普通用户"
      };
      return roleMap[role] || "未知";
    },
    onCollegeChange(e) {
      this.selectedCollegeIndex = e.detail.value;
      this.selectedCollege = this.collegeOptions[e.detail.value];
      this.loadStats();
    },
    onRoleChange(e) {
      this.accountFilters.roleIndex = e.detail.value;
      const roleMap = ["all", "admin", "approver"];
      this.accountFilters.role = roleMap[e.detail.value];
    },
    onCollegeFilterChange(e) {
      this.accountFilters.collegeIndex = e.detail.value;
      if (e.detail.value === 0) {
        this.accountFilters.college = "all";
      } else {
        this.accountFilters.college = this.collegeOptions[e.detail.value - 1];
      }
    },
    onNewAccountCollegeChange(e) {
      this.newAccount.collegeIndex = e.detail.value;
      this.newAccount.college = this.collegeOptions[e.detail.value];
    },
    onNewAccountPositionChange(e) {
      this.newAccount.positionIndex = e.detail.value;
      const positionMap = ["teacher", "security"];
      this.newAccount.position = positionMap[e.detail.value];
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("zh-CN");
    },
    loadApplications() {
      this.applications = [
        {
          application_id: 1001,
          user_id: 101,
          real_name: "张三",
          phone: "13800138000",
          college: this.selectedCollege,
          position: "teacher",
          status: "pending",
          created_at: "2023-10-15 09:30:00"
        },
        {
          application_id: 1002,
          user_id: 102,
          real_name: "李四",
          phone: "13900139000",
          college: this.selectedCollege,
          position: "security",
          status: "pending",
          created_at: "2023-10-16 14:20:00"
        }
      ].filter((app) => {
        if (this.applicationFilters.position !== "all" && app.position !== this.applicationFilters.position)
          return false;
        return true;
      });
    },
    loadAccounts() {
      this.accounts = [
        {
          user_id: 1,
          username: "admin01",
          real_name: "系统管理员",
          phone: "13800138001",
          college: "信息中心",
          position: "other",
          role: "admin",
          status: "active",
          created_at: "2023-09-01 08:00:00"
        },
        {
          user_id: 2,
          username: "approver01",
          real_name: "李老师",
          phone: "13900139001",
          college: "计算机学院",
          position: "teacher",
          role: "approver",
          status: "active",
          created_at: "2023-09-05 10:30:00"
        }
      ].filter((acc) => {
        if (this.accountFilters.role !== "all" && acc.role !== this.accountFilters.role)
          return false;
        if (this.accountFilters.college !== "all" && acc.college !== this.accountFilters.college)
          return false;
        return true;
      });
    },
    resetApplicationFilters() {
      this.applicationFilters = { position: "all" };
      this.loadApplications();
    },
    resetAccountFilters() {
      this.accountFilters = {
        role: "all",
        college: "all",
        roleIndex: 0,
        collegeIndex: 0
      };
      this.loadAccounts();
    },
    approveApplication(application) {
      if (confirm(`确定要通过 ${application.real_name} 的审批人申请吗？`)) {
        common_vendor.index.showToast({ title: "已通过申请", icon: "success" });
        this.loadApplications();
        this.loadStats();
      }
    },
    rejectApplication(application) {
      if (confirm(`确定要拒绝 ${application.real_name} 的审批人申请吗？`)) {
        common_vendor.index.showToast({ title: "已拒绝申请", icon: "success" });
        this.loadApplications();
        this.loadStats();
      }
    },
    viewApplicationDetails(application) {
      common_vendor.index.showModal({
        title: "申请详情",
        content: `申请ID: ${application.application_id}
申请人: ${application.real_name}`
      });
    },
    editAccount(account) {
      common_vendor.index.showModal({
        title: "修改账号",
        content: `修改账号信息：${account.real_name}`
      });
    },
    deleteAccount(account) {
      if (confirm(`确定要删除 ${account.real_name} 的账号吗？`)) {
        common_vendor.index.showToast({ title: "账号已删除", icon: "success" });
      }
    },
    showCreateModal() {
      this.showCreateAccountModal = true;
    },
    closeCreateModal() {
      this.showCreateAccountModal = false;
      this.newAccount = {
        username: "",
        password: "",
        real_name: "",
        phone: "",
        college: "",
        position: "teacher",
        collegeIndex: -1,
        positionIndex: 0
      };
    },
    showPendingApplications() {
      this.showApplicationsModal = true;
      this.loadApplications();
    },
    closeApplicationsModal() {
      this.showApplicationsModal = false;
    },
    createAccount() {
      if (!this.newAccount.username || !this.newAccount.password || !this.newAccount.real_name || !this.newAccount.phone || !this.newAccount.college) {
        common_vendor.index.showToast({ title: "请填写所有必填字段", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "后台账号创建成功", icon: "success" });
      this.closeCreateModal();
    },
    loadStats() {
      if (this.selectedCollege === "信息中心") {
        this.approverCount = 5;
        this.pendingApplicationCount = 3;
      } else {
        this.approverCount = 0;
        this.pendingApplicationCount = 0;
      }
    }
  },
  onLoad() {
    this.loadAccounts();
    this.loadStats();
  }
};
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.selectedCollege),
    b: $data.collegeOptions,
    c: $data.selectedCollegeIndex,
    d: common_vendor.o((...args) => $options.onCollegeChange && $options.onCollegeChange(...args)),
    e: common_vendor.t($data.approverCount),
    f: $options.hasPendingApplications
  }, $options.hasPendingApplications ? {
    g: common_vendor.t($data.pendingApplicationCount)
  } : {}, {
    h: common_vendor.p({
      type: "plus",
      size: "16",
      color: "#fff"
    }),
    i: common_vendor.o((...args) => $options.showCreateModal && $options.showCreateModal(...args)),
    j: common_vendor.o((...args) => $options.showPendingApplications && $options.showPendingApplications(...args)),
    k: common_vendor.t($options.getRoleText($data.accountFilters.role)),
    l: $data.roleOptions,
    m: $data.accountFilters.roleIndex,
    n: common_vendor.o((...args) => $options.onRoleChange && $options.onRoleChange(...args)),
    o: common_vendor.t($data.accountFilters.college === "all" ? "全部学院" : $data.accountFilters.college),
    p: $data.collegeFilterOptions,
    q: $data.accountFilters.collegeIndex,
    r: common_vendor.o((...args) => $options.onCollegeFilterChange && $options.onCollegeFilterChange(...args)),
    s: common_vendor.p({
      type: "search",
      size: "16",
      color: "#fff"
    }),
    t: common_vendor.o((...args) => $options.loadAccounts && $options.loadAccounts(...args)),
    v: common_vendor.p({
      type: "refresh",
      size: "16",
      color: "#666"
    }),
    w: common_vendor.o((...args) => $options.resetAccountFilters && $options.resetAccountFilters(...args)),
    x: $data.accounts.length === 0
  }, $data.accounts.length === 0 ? {
    y: common_vendor.p({
      type: "search",
      size: "24",
      color: "#999"
    })
  } : {
    z: common_vendor.f($data.accounts, (account, k0, i0) => {
      return {
        a: common_vendor.t(account.user_id),
        b: common_vendor.t(account.username),
        c: common_vendor.t(account.real_name),
        d: common_vendor.t(account.phone),
        e: common_vendor.t(account.college || "-"),
        f: common_vendor.t($options.getPositionText(account.position)),
        g: common_vendor.t($options.getRoleText(account.role)),
        h: common_vendor.n(account.role),
        i: "d2d38065-4-" + i0,
        j: common_vendor.o(($event) => $options.editAccount(account), account.user_id),
        k: "d2d38065-5-" + i0,
        l: common_vendor.o(($event) => $options.deleteAccount(account), account.user_id),
        m: account.user_id
      };
    }),
    A: common_vendor.p({
      type: "compose",
      size: "14",
      color: "#1890ff"
    }),
    B: common_vendor.p({
      type: "trash",
      size: "14",
      color: "#ff4d4f"
    })
  }, {
    C: $data.showCreateAccountModal
  }, $data.showCreateAccountModal ? {
    D: common_vendor.p({
      type: "close",
      size: "16",
      color: "#999"
    }),
    E: common_vendor.o((...args) => $options.closeCreateModal && $options.closeCreateModal(...args)),
    F: $data.newAccount.username,
    G: common_vendor.o(($event) => $data.newAccount.username = $event.detail.value),
    H: $data.newAccount.password,
    I: common_vendor.o(($event) => $data.newAccount.password = $event.detail.value),
    J: $data.newAccount.phone,
    K: common_vendor.o(($event) => $data.newAccount.phone = $event.detail.value),
    L: common_vendor.t($data.newAccount.college || "请选择学院/部门"),
    M: $data.collegeOptions,
    N: $data.newAccount.collegeIndex,
    O: common_vendor.o((...args) => $options.onNewAccountCollegeChange && $options.onNewAccountCollegeChange(...args)),
    P: common_vendor.t($options.getPositionText($data.newAccount.position)),
    Q: $data.positionOptions,
    R: $data.newAccount.positionIndex,
    S: common_vendor.o((...args) => $options.onNewAccountPositionChange && $options.onNewAccountPositionChange(...args)),
    T: common_vendor.o((...args) => $options.closeCreateModal && $options.closeCreateModal(...args)),
    U: common_vendor.o((...args) => $options.createAccount && $options.createAccount(...args))
  } : {}, {
    V: $data.showApplicationsModal
  }, $data.showApplicationsModal ? common_vendor.e({
    W: common_vendor.p({
      type: "close",
      size: "16",
      color: "#999"
    }),
    X: common_vendor.o((...args) => $options.closeApplicationsModal && $options.closeApplicationsModal(...args)),
    Y: $data.applications.length === 0
  }, $data.applications.length === 0 ? {
    Z: common_vendor.p({
      type: "search",
      size: "24",
      color: "#999"
    })
  } : {
    aa: common_vendor.f($data.applications, (application, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(application.real_name),
        b: common_vendor.t(application.phone),
        c: common_vendor.t(application.college),
        d: common_vendor.t($options.getPositionText(application.position)),
        e: common_vendor.t($options.formatDate(application.created_at)),
        f: application.status === "pending"
      }, application.status === "pending" ? {
        g: "d2d38065-9-" + i0,
        h: common_vendor.p({
          type: "checkmark",
          size: "14",
          color: "#52c41a"
        }),
        i: common_vendor.o(($event) => $options.approveApplication(application), application.application_id)
      } : {}, {
        j: application.status === "pending"
      }, application.status === "pending" ? {
        k: "d2d38065-10-" + i0,
        l: common_vendor.p({
          type: "close",
          size: "14",
          color: "#ff4d4f"
        }),
        m: common_vendor.o(($event) => $options.rejectApplication(application), application.application_id)
      } : {}, {
        n: application.status !== "pending"
      }, application.status !== "pending" ? {
        o: "d2d38065-11-" + i0,
        p: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#666"
        }),
        q: common_vendor.o(($event) => $options.viewApplicationDetails(application), application.application_id)
      } : {}, {
        r: application.application_id
      });
    })
  }, {
    ab: common_vendor.o((...args) => $options.closeApplicationsModal && $options.closeApplicationsModal(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d2d38065"]]);
exports.MiniProgramPage = MiniProgramPage;
