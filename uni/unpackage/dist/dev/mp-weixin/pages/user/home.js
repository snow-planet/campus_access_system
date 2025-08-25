"use strict";
const common_vendor = require("../../common/vendor.js");
const PersonalForm = () => "./form.js";
const GroupForm = () => "./group.js";
const _sfc_main = {
  data() {
    return {
      activeTab: "notice",
      // 模拟公告数据
      announcements: [
        {
          id: 1,
          type: "重要通知",
          content: "校园出入管理系统将于本周六进行升级维护，届时系统将暂停服务2小时。",
          time: "2023-10-15",
          important: true
        },
        {
          id: 2,
          type: "规则更新",
          content: "为进一步加强校园安全管理，即日起所有预约需提前至少2小时提交。",
          time: "2023-10-10",
          important: false
        },
        {
          id: 3,
          type: "温馨提示",
          content: "请师生们合理安排预约时间，避免高峰期系统拥堵。",
          time: "2023-10-05",
          important: false
        }
      ]
    };
  },
  methods: {
    // 返回首页
    logout() {
      common_vendor.index.navigateBack();
    },
    // 查看公告详情
    viewAnnouncement(item) {
      common_vendor.index.showModal({
        title: item.type,
        content: item.content,
        showCancel: false,
        confirmText: "知道了"
      });
    }
  },
  components: {
    "personal-form": PersonalForm,
    "group-form": GroupForm
  }
};
if (!Array) {
  const _component_personal_form = common_vendor.resolveComponent("personal-form");
  const _component_group_form = common_vendor.resolveComponent("group-form");
  (_component_personal_form + _component_group_form)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.logout && $options.logout(...args)),
    b: common_vendor.n($data.activeTab === "notice" ? "tab-button-active" : ""),
    c: common_vendor.o(($event) => $data.activeTab = "notice"),
    d: common_vendor.n($data.activeTab === "personal" ? "tab-button-active" : ""),
    e: common_vendor.o(($event) => $data.activeTab = "personal"),
    f: common_vendor.n($data.activeTab === "group" ? "tab-button-active" : ""),
    g: common_vendor.o(($event) => $data.activeTab = "group"),
    h: $data.activeTab === "notice"
  }, $data.activeTab === "notice" ? common_vendor.e({
    i: $data.announcements.length > 0
  }, $data.announcements.length > 0 ? {
    j: common_vendor.f($data.announcements, (item, index, i0) => {
      return {
        a: common_vendor.t(item.type),
        b: common_vendor.n(item.important ? "important" : ""),
        c: common_vendor.t(item.time),
        d: common_vendor.t(item.content),
        e: index,
        f: common_vendor.o(($event) => $options.viewAnnouncement(item), index)
      };
    })
  } : {}) : {}, {
    k: $data.activeTab === "personal"
  }, $data.activeTab === "personal" ? {} : {}, {
    l: $data.activeTab === "group"
  }, $data.activeTab === "group" ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f834fd70"]]);
wx.createPage(MiniProgramPage);
