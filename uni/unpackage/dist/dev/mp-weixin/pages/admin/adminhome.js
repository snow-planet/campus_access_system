"use strict";
const common_vendor = require("../../common/vendor.js");
const api_uniAdmin = require("../../api/uniAdmin.js");
const AuditManagement = () => "./aud2.js";
const AccountManagement = () => "./mgr2.js";
const NotificationManagement = () => "./not2.js";
const DataScreen = () => "./screen2.js";
const _sfc_main = {
  data() {
    return {
      // 当前用户信息
      currentUser: {
        real_name: "加载中...",
        role: "",
        department: "",
        username: "",
        user_id: null
      },
      // 加载状态
      isLoading: true,
      // 菜单项
      menuItems: [
        { key: "approval", title: "审批信息管理", icon: "审" },
        { key: "account", title: "审批账号管理", icon: "号" },
        { key: "notification", title: "通知管理", icon: "告" },
        { key: "dashboard", title: "数据看板", icon: "图" }
      ],
      // 当前激活的菜单
      activeMenu: "approval",
      drawerVisible: false
    };
  },
  components: {
    "audit-management": AuditManagement,
    "account-management": AccountManagement,
    "notification-management": NotificationManagement,
    "data-screen": DataScreen
  },
  methods: {
    // 获取用户信息
    async loadUserInfo() {
      try {
        this.isLoading = true;
        const userId = common_vendor.index.getStorageSync("user_id");
        if (!userId) {
          common_vendor.index.showToast({
            title: "用户信息丢失，请重新登录",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/admin/login"
            });
          }, 1500);
          return;
        }
        const result = await api_uniAdmin.getUserInfo(userId);
        if (result && result.code === 0) {
          this.currentUser = {
            real_name: result.data.real_name || "管理员",
            role: result.data.role || "管理员",
            department: result.data.department || result.data.college || "管理部门",
            username: result.data.username || "",
            user_id: result.data.user_id || userId
          };
          common_vendor.index.setStorageSync("currentUser", this.currentUser);
        } else {
          const localUser = common_vendor.index.getStorageSync("currentUser");
          if (localUser) {
            this.currentUser = localUser;
          } else {
            common_vendor.index.showToast({
              title: "获取用户信息失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        const localUser = common_vendor.index.getStorageSync("currentUser");
        if (localUser) {
          this.currentUser = localUser;
        } else {
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "none"
          });
        }
      } finally {
        this.isLoading = false;
      }
    },
    // 获取当前模块名称
    getCurrentModuleName() {
      const currentItem = this.menuItems.find((item) => item.key === this.activeMenu);
      return currentItem ? currentItem.title : "后台管理";
    },
    // 切换菜单
    switchMenu(menuKey) {
      if (menuKey === "dashboard") {
        common_vendor.index.navigateTo({
          url: "/pages/admin/screen"
        });
      } else {
        this.activeMenu = menuKey;
      }
      this.drawerVisible = false;
    },
    // 切换侧边栏显示
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible;
    },
    // 退出登录
    logout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("currentUser");
            common_vendor.index.removeStorageSync("user_id");
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/admin/login"
              });
            }, 1e3);
          }
        }
      });
    }
  },
  onLoad() {
    this.loadUserInfo();
  },
  onShow() {
  }
};
if (!Array) {
  const _component_audit_management = common_vendor.resolveComponent("audit-management");
  const _component_account_management = common_vendor.resolveComponent("account-management");
  const _component_notification_management = common_vendor.resolveComponent("notification-management");
  const _component_data_screen = common_vendor.resolveComponent("data-screen");
  (_component_audit_management + _component_account_management + _component_notification_management + _component_data_screen)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.getCurrentModuleName()),
    b: common_vendor.o((...args) => $options.logout && $options.logout(...args)),
    c: common_vendor.f($data.menuItems, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.icon)
      }, $data.drawerVisible ? {
        b: common_vendor.t(item.title)
      } : {}, {
        c: item.key,
        d: common_vendor.n({
          active: $data.activeMenu === item.key
        }),
        e: common_vendor.o(($event) => $options.switchMenu(item.key), item.key)
      });
    }),
    d: $data.drawerVisible,
    e: common_vendor.t($data.drawerVisible ? "点击收起菜单" : " ←展开"),
    f: common_vendor.o((...args) => $options.toggleDrawer && $options.toggleDrawer(...args)),
    g: $data.drawerVisible
  }, $data.drawerVisible ? common_vendor.e({
    h: $data.isLoading
  }, $data.isLoading ? {} : {
    i: common_vendor.t($data.currentUser.username),
    j: common_vendor.t($data.currentUser.college || $data.currentUser.department)
  }) : {}, {
    k: common_vendor.n({
      "sidebar-collapsed": !$data.drawerVisible
    }),
    l: $data.activeMenu === "approval"
  }, $data.activeMenu === "approval" ? {} : {}, {
    m: $data.activeMenu === "account"
  }, $data.activeMenu === "account" ? {} : {}, {
    n: $data.activeMenu === "notification"
  }, $data.activeMenu === "notification" ? {} : {}, {
    o: $data.activeMenu === "dashboard"
  }, $data.activeMenu === "dashboard" ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-88518aad"]]);
wx.createPage(MiniProgramPage);
