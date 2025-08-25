"use strict";
const common_vendor = require("../../common/vendor.js");
const AuditManagement = () => "./aud2.js";
const AccountManagement = () => "./mgr2.js";
const NotificationManagement = () => "./not2.js";
const DataScreen = () => "./screen2.js";
const _sfc_main = {
  data() {
    return {
      // 当前用户信息
      currentUser: {
        real_name: "管理员",
        role: "超级管理员",
        department: "信息技术中心",
        username: "admin"
      },
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
      common_vendor.index.removeStorageSync("currentUser");
      common_vendor.index.reLaunch({
        url: "/pages/admin/login"
      });
    }
  },
  onLoad() {
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
  }, $data.drawerVisible ? {
    h: common_vendor.t($data.currentUser.real_name),
    i: common_vendor.t($data.currentUser.department)
  } : {}, {
    j: common_vendor.n({
      "sidebar-collapsed": !$data.drawerVisible
    }),
    k: $data.activeMenu === "approval"
  }, $data.activeMenu === "approval" ? {} : {}, {
    l: $data.activeMenu === "account"
  }, $data.activeMenu === "account" ? {} : {}, {
    m: $data.activeMenu === "notification"
  }, $data.activeMenu === "notification" ? {} : {}, {
    n: $data.activeMenu === "dashboard"
  }, $data.activeMenu === "dashboard" ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-88518aad"]]);
wx.createPage(MiniProgramPage);
