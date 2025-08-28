"use strict";
const common_vendor = require("./common/vendor.js");
const api_uniAdmin = require("./api/uniAdmin.js");
const _sfc_main = {
  data() {
    return {
      currentUser: null,
      approverCount: 5,
      pendingApplicationCount: 3,
      selectedCollege: "信息技术学院",
      selectedCollegeIndex: 0,
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
        "信息技术学院",
        "治安学院",
        "交通管理学院",
        "保卫处"
      ],
      collegeFilterOptions: [
        "全部学院",
        "信息技术学院",
        "治安学院",
        "交通管理学院",
        "保卫处"
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
    async loadApplications() {
      try {
        const userCollege = this.currentUser && this.currentUser.college ? this.currentUser.college : null;
        const result = await api_uniAdmin.getApplications({
          position: this.applicationFilters.position === "all" ? null : this.applicationFilters.position,
          college: userCollege
        });
        if (result && result.code === 0) {
          this.applications = result.data || [];
        } else {
          common_vendor.index.showToast({
            title: "获取申请数据失败",
            icon: "none"
          });
          this.applications = [];
        }
      } catch (error) {
        console.error("获取申请数据失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
        this.applications = [];
      }
    },
    async loadAccounts() {
      try {
        const result = await api_uniAdmin.getAccounts({
          role: this.accountFilters.role === "all" ? null : this.accountFilters.role,
          college: this.accountFilters.college === "all" ? null : this.accountFilters.college
        });
        if (result && result.code === 0) {
          this.accounts = result.data || [];
        } else {
          common_vendor.index.showToast({
            title: "获取账号数据失败",
            icon: "none"
          });
          this.accounts = [];
        }
      } catch (error) {
        console.error("获取账号数据失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
        this.accounts = [];
      }
    },
    resetApplicationFilters() {
      this.applicationFilters = { position: "all" };
      this.loadApplications();
    },
    resetAccountFilters() {
      const defaultCollege = this.currentUser && this.currentUser.college ? this.currentUser.college : "all";
      const defaultCollegeIndex = defaultCollege === "all" ? 0 : this.collegeFilterOptions.findIndex((college) => college === defaultCollege);
      this.accountFilters = {
        role: "all",
        college: defaultCollege,
        roleIndex: 0,
        collegeIndex: defaultCollegeIndex !== -1 ? defaultCollegeIndex : 0
      };
      this.loadAccounts();
    },
    async approveApplication(application) {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认操作",
          content: `确定要通过 ${application.real_name} 的审批人申请吗？`
        });
        if (res.confirm) {
          const result = await api_uniAdmin.processApplication({
            application_id: application.application_id,
            action: "approve"
          });
          if (result && result.code === 0) {
            common_vendor.index.showToast({
              title: "已通过申请",
              icon: "success"
            });
            this.loadApplications();
            this.loadStats();
          } else {
            common_vendor.index.showToast({
              title: "操作失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("审批申请失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    },
    async rejectApplication(application) {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认操作",
          content: `确定要拒绝 ${application.real_name} 的审批人申请吗？`
        });
        if (res.confirm) {
          const result = await api_uniAdmin.processApplication({
            application_id: application.application_id,
            action: "reject"
          });
          if (result && result.code === 0) {
            common_vendor.index.showToast({
              title: "已拒绝申请",
              icon: "success"
            });
            this.loadApplications();
            this.loadStats();
          } else {
            common_vendor.index.showToast({
              title: "操作失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("拒绝申请失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
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
    async deleteAccount(account) {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认删除",
          content: `确定要删除 ${account.real_name} 的账号吗？此操作不可恢复！`
        });
        if (res.confirm) {
          const result = await api_uniAdmin.deleteAccount({
            user_id: account.user_id
          });
          if (result && result.code === 0) {
            common_vendor.index.showToast({
              title: "账号已删除",
              icon: "success"
            });
            this.loadAccounts();
            this.loadStats();
          } else {
            common_vendor.index.showToast({
              title: "删除失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("删除账号失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
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
    async createAccount() {
      if (!this.newAccount.username || !this.newAccount.password || !this.newAccount.real_name || !this.newAccount.phone || !this.newAccount.college) {
        common_vendor.index.showToast({ title: "请填写所有必填字段", icon: "none" });
        return;
      }
      try {
        const result = await api_uniAdmin.createAccount({
          username: this.newAccount.username,
          password: this.newAccount.password,
          real_name: this.newAccount.real_name,
          phone: this.newAccount.phone,
          college: this.newAccount.college,
          position: this.newAccount.position,
          role: "admin"
          // 默认创建后台账号
        });
        if (result && result.code === 0) {
          common_vendor.index.showToast({
            title: "后台账号创建成功",
            icon: "success"
          });
          this.closeCreateModal();
          this.loadAccounts();
          this.loadStats();
        } else {
          common_vendor.index.showToast({
            title: result.message || "创建失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("创建账号失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    },
    async loadStats() {
      try {
        const result = await api_uniAdmin.getManagerStats({
          college: this.selectedCollege === "全部学院" ? null : this.selectedCollege
        });
        if (result && result.code === 0) {
          this.approverCount = result.data.approverCount || 0;
          this.pendingApplicationCount = result.data.pendingApplications || 0;
        } else {
          common_vendor.index.showToast({
            title: "获取统计数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("获取统计数据失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    },
    async getCurrentUserInfo() {
      try {
        const currentUser = common_vendor.index.getStorageSync("currentUser");
        if (currentUser) {
          this.currentUser = currentUser;
          if (currentUser.college) {
            const collegeIndex = this.collegeOptions.findIndex((college) => college === currentUser.college);
            if (collegeIndex !== -1) {
              this.selectedCollege = currentUser.college;
              this.selectedCollegeIndex = collegeIndex;
              this.accountFilters.college = currentUser.college;
              const filterIndex = this.collegeFilterOptions.findIndex((college) => college === currentUser.college);
              if (filterIndex !== -1) {
                this.accountFilters.collegeIndex = filterIndex;
              }
            }
          }
        }
      } catch (error) {
        console.error("获取当前用户信息失败:", error);
      }
    },
    onLoad() {
      this.getCurrentUserInfo();
      this.loadAccounts();
      this.loadStats();
    }
  }
};
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
    h: common_vendor.o((...args) => $options.showCreateModal && $options.showCreateModal(...args)),
    i: common_vendor.o((...args) => $options.showPendingApplications && $options.showPendingApplications(...args)),
    j: common_vendor.t($options.getRoleText($data.accountFilters.role)),
    k: $data.roleOptions,
    l: $data.accountFilters.roleIndex,
    m: common_vendor.o((...args) => $options.onRoleChange && $options.onRoleChange(...args)),
    n: common_vendor.t($data.accountFilters.college === "all" ? "全部学院" : $data.accountFilters.college),
    o: $data.collegeFilterOptions,
    p: $data.accountFilters.collegeIndex,
    q: common_vendor.o((...args) => $options.onCollegeFilterChange && $options.onCollegeFilterChange(...args)),
    r: common_vendor.o((...args) => $options.loadAccounts && $options.loadAccounts(...args)),
    s: common_vendor.o((...args) => $options.resetAccountFilters && $options.resetAccountFilters(...args)),
    t: $data.accounts.length === 0
  }, $data.accounts.length === 0 ? {} : {
    v: common_vendor.f($data.accounts, (account, k0, i0) => {
      return {
        a: common_vendor.t(account.user_id),
        b: common_vendor.t(account.real_name),
        c: common_vendor.t(account.phone),
        d: common_vendor.t(account.college || "-"),
        e: common_vendor.t($options.getPositionText(account.position)),
        f: common_vendor.t($options.getRoleText(account.role)),
        g: common_vendor.n(account.role),
        h: common_vendor.o(($event) => $options.editAccount(account), account.user_id),
        i: common_vendor.o(($event) => $options.deleteAccount(account), account.user_id),
        j: account.user_id
      };
    })
  }, {
    w: $data.showCreateAccountModal
  }, $data.showCreateAccountModal ? {
    x: common_vendor.o((...args) => $options.closeCreateModal && $options.closeCreateModal(...args)),
    y: $data.newAccount.username,
    z: common_vendor.o(($event) => $data.newAccount.username = $event.detail.value),
    A: $data.newAccount.password,
    B: common_vendor.o(($event) => $data.newAccount.password = $event.detail.value),
    C: $data.newAccount.phone,
    D: common_vendor.o(($event) => $data.newAccount.phone = $event.detail.value),
    E: common_vendor.t($data.newAccount.college || "请选择学院/部门"),
    F: $data.collegeOptions,
    G: $data.newAccount.collegeIndex,
    H: common_vendor.o((...args) => $options.onNewAccountCollegeChange && $options.onNewAccountCollegeChange(...args)),
    I: common_vendor.t($options.getPositionText($data.newAccount.position)),
    J: $data.positionOptions,
    K: $data.newAccount.positionIndex,
    L: common_vendor.o((...args) => $options.onNewAccountPositionChange && $options.onNewAccountPositionChange(...args)),
    M: common_vendor.o((...args) => $options.closeCreateModal && $options.closeCreateModal(...args)),
    N: common_vendor.o((...args) => $options.createAccount && $options.createAccount(...args))
  } : {}, {
    O: $data.showApplicationsModal
  }, $data.showApplicationsModal ? common_vendor.e({
    P: common_vendor.o((...args) => $options.closeApplicationsModal && $options.closeApplicationsModal(...args)),
    Q: $data.applications.length === 0
  }, $data.applications.length === 0 ? {} : {
    R: common_vendor.f($data.applications, (application, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(application.real_name),
        b: common_vendor.t(application.phone),
        c: common_vendor.t(application.college),
        d: common_vendor.t($options.getPositionText(application.position)),
        e: common_vendor.t($options.formatDate(application.created_at)),
        f: application.status === "pending"
      }, application.status === "pending" ? {
        g: common_vendor.o(($event) => $options.approveApplication(application), application.application_id)
      } : {}, {
        h: application.status === "pending"
      }, application.status === "pending" ? {
        i: common_vendor.o(($event) => $options.rejectApplication(application), application.application_id)
      } : {}, {
        j: application.status !== "pending"
      }, application.status !== "pending" ? {
        k: common_vendor.o(($event) => $options.viewApplicationDetails(application), application.application_id)
      } : {}, {
        l: application.application_id
      });
    })
  }, {
    S: common_vendor.o((...args) => $options.closeApplicationsModal && $options.closeApplicationsModal(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d2d38065"]]);
exports.MiniProgramPage = MiniProgramPage;
