<template>
  <div class="at-popover-list-container" v-show="isShow">
    <ul class="at-popover-list">
      <li
        class="at-line"
        v-for="(item,index) in showList"
        :key="index"
        :class="{'active':selectIndex===index}"
        @click="emitInsert(item)"
      >
        <img class="img" :src="item.headUrl||defaultAvatar" alt="头像" />
        <span class="name">{{item.name}}</span>
      </li>
    </ul>
    <i class="at-arrow"></i>
  </div>
</template>

<script>
export default {
  name: "AtPopoverList",
  data() {
    return {
      visible: false,
      list: [],
      showList: [],
      defaultAvatar: "",
      selectIndex: 0
    };
  },
  computed: {
    isShow() {
      return this.visible && this.showList.length > 0;
    }
  },
  methods: {
    show() {
      this.visible = true;
      this.listScrollToView();
    },
    hide() {
      this.visible = false;
    },
    search(e) {
      this.selectIndex = 0;
      let {
        inputData,
        cursorPosition,
        betweenMarkAndCaretStr,
        beforeCaretStr
      } = e.detail;
      // console.log('inputData=---------------------', inputData)
      // console.log('cursorPosition=----------------', cursorPosition)
      // console.log('beforeCaretStr=----------------', beforeCaretStr)
      // console.log('betweenMarkAndCaretStr=--------', betweenMarkAndCaretStr)
      let hasAT = beforeCaretStr.includes("@") || inputData === "@";
      let shouldShowAndSearch = hasAT;
      let showHide = !hasAT && this.visible === true;
      if (shouldShowAndSearch) {
        this.show();
        this.showList = this.searchList(betweenMarkAndCaretStr, this.list);
        this.$nextTick(() => {
          let dom = this.getElement();
          let arrowOffset = 15 + 8;
          dom.style.top =
            cursorPosition.y - dom.offsetHeight - arrowOffset + "px";
          dom.style.left = cursorPosition.x - dom.offsetWidth / 2 + "px";
        });
      } else if (showHide) {
        this.hide();
      }
    },
    searchList(searchParams, list) {
      // dosomthing
      return list;
    },
    getElement() {
      return this.$el;
    },
    listScrollToView() {
      this.$nextTick(() => {
        let currentItem = document.querySelector(
          ".at-popover-list .at-line.active"
        );
        // currentItem && currentItem.scrollIntoView(true)
        // currentItem && currentItem.scrollIntoView(false)
        currentItem &&
          currentItem.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "nearest"
          });
      });
    },
    customEmit(event, data) {
      let e = new CustomEvent(`@DT::${event}`, { detail: data });
      this.getElement().dispatchEvent(e);
    },
    emitInsert(item) {
      this.customEmit("insert", { tagText: item.showText, tagid: item.id });
    },
    selectUp() {
      let isTop = this.selectIndex === 0;
      if (isTop) {
        this.selectIndex = this.showList.length - 1;
      } else {
        this.selectIndex--;
      }
      this.listScrollToView();
    },
    selectDown() {
      let isBottom = this.selectIndex === this.showList.length - 1;
      if (isBottom) {
        this.selectIndex = 0;
      } else {
        this.selectIndex++;
      }
      this.listScrollToView();
    },
    enterInsert() {
      if (this.isShow) {
        let item = this.getSelectedInfo();
        this.customEmit("insert", { tagText: item.showText, tagid: item.id });
      }
    }
  },
  mounted() {
    let selectWrap = e => {
      let { inputData, event } = e.detail;
      if (this.isShow) {
        event.preventDefault();
        switch (inputData) {
          case "ArrowUp":
            this.selectUp();
            break;
          case "ArrowDown":
            this.selectDown();
            break;
          case "Enter":
            this.enterInsert();
            break;
        }
      }
    };
    this.getElement().addEventListener("@DT::search", this.search.bind(this));
    this.getElement().addEventListener("@DT::selectUp", selectWrap);
    this.getElement().addEventListener("@DT::selectDown", selectWrap);
    this.getElement().addEventListener("@DT::enter", selectWrap);
  }
};
</script>

<style lang="less" scoped>
.at-popover-list-container {
  padding-right: 0;
  background-color: white;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.1));
  border: 1px solid #ebeef5;

  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  .at-popover-list {
    width: 180px;
    max-height: 300px;
    overflow: auto;
    overflow: overlay;
    .at-line {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 5px 10px 5px 5px;
    }
    .at-line.active {
      background-color: #eee;
    }
    .img {
      width: 25px;
      height: 25px;
    }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 5px;
    }
  }
  .at-arrow {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translate(-50%, 50%);
    width: 0;
    height: 0;
    overflow: hidden;
    border: 15px solid transparent;
    border-top-color: white;
  }
}
</style>
