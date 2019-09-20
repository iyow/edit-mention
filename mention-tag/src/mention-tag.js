// 初始化浏览器检测
let browserTypeCheck = (function () {
    let match = navigator.userAgent.match(/msie|firefox|chrome|safari|opera/ig)
    let browser = match ? match[0] : 'other'
    return browser.toLocaleLowerCase()
}())

class MentionTag {
    constructor({
        MarkChar = '',
        tagClass = '',
        targetNode,
        customInsertFunc,
        PopoverInstance,
        beforeInsertEvent = _ => true
    }) {
        // 操作监听的目标节点
        this.target = targetNode
        // 插入tag的 class
        this.tagClass = tagClass
        // 特殊字符标记
        this.MarkChar = MarkChar
        // 触发特殊字符标记 记录 光标位置
        this.cursorPos = {
            x: 0,
            y: 0
        }
        // 自定义插入位置  默认在光标出插入
        this.customInsertFunc = customInsertFunc
        // 触发插入事件时的  前置钩子 可以用于阻止插入
        this.beforeInsertEvent = beforeInsertEvent
        // 1.弹出框实例  用于  触发通信  显示show/隐藏hide 搜索search 以及自定义触发上下选择和回车选择  该实例需要提供这三个接口
        // console.log(this.PopoverInstance)
        // this.PopoverInstance.isShow()  判断是否显示函数
        // this.PopoverInstance.show()  控制显示逻辑函数
        // this.PopoverInstance.hide()  控制隐藏逻辑函数
        // this.PopoverInstance.getElement()  获取dom节点 触发自定义事件
        // 2.PopoverInstance自定义事件 
        //   - 进行监听的自定义事件
        //      - @MT::search   在输入框输入 MarkChar后 表示开始触发 search 并将搜索相关数据通知给外部
        //      - @MT::selectUp   弹出框实例显示情况下触发，在输入框输入向上箭头
        //      - @MT::selectDown   弹出框实例显示情况下触发，在输入框输入向上箭头
        //      - @MT::enter   弹出框实例显示情况下触发，在输入框输入回车
        //   - 自行触发的自定义事件
        //      - @MT::insert  弹出框实例  通知 插件内部 需要插入 标签 ，
        //            参数： tagText插入标签的显示文字，tagid插入标签的自定义属性用于存储数据, insertCustomPositionFun 自定义插入位置,默认光背位置插入无光标插入末尾
        this.PopoverInstance = PopoverInstance
        this._init()
    }
    _init() { }
    _destroy() {
        this.target.removeEventListener('input', this.inputEvent)
        this.target.removeEventListener('keyup', this.keyupEvent)
        this.target.removeEventListener('keydown', this.keydownEvent)
        this.target.removeEventListener('click', this.emitSearch)
        this.PopoverInstance.getElement().removeEventListener('@DT::insert', this.insertEvent)
    }
    bindEvent() {
        this.target.addEventListener('input', this.inputEvent)
        this.target.addEventListener('keyup', this.keyupEvent)
        this.target.addEventListener('keydown', this.keydownEvent)
        this.target.addEventListener('click', this.emitSearch)
        this.PopoverInstance.getElement().addEventListener('@DT::insert', this.insertEvent)
    }

    // ----------Dom事件回调----------START
    inputEvent = function (e) {
        let inputData = e.data
        let isMarkChar = e.data === this.MarkChar
        let hasMarkChar = this.target.innerHTML.includes(this.MarkChar)
        if (hasMarkChar || e.inputType === 'deleteContentBackward') {
            isMarkChar && this.setCursorPosition()
            this.emitSearch({
                inputData
            })
        }
    }.bind(this)
    keyupEvent = function (e) {
        // 左右移动需要监听  keyup  若监听keydown  截取的字符串片段是 光标移动之前的
        // 37左-38上-39右-40下
        if (e.keyCode === 37 || e.keyCode === 39) {
            let hasMarkChar = this.target.innerHTML.includes(this.MarkChar)
            hasMarkChar && this.emitSearch({
                inputData: e.key
            })
        }
    }.bind(this)
    keydownEvent = function (e) {
        // 上下需要监听keydown 防止多行上下移动
        if (this.PopoverInstance.isShow()) {
            e.preventDefault()
            switch (e.keyCode) {
                case 13:
                    this.emitEvent('enter', {
                        inputData: e.key,
                        event: e
                    })
                    break
                case 38:
                    this.emitEvent('selectUp', {
                        inputData: e.key,
                        event: e
                    })
                    break
                case 40:
                    this.emitEvent('selectDown', {
                        inputData: e.key,
                        event: e
                    })
                    break
            }
        }
    }.bind(this)
    insertEvent = function (e) {
        let data = e.detail
        if (this.beforeInsertEvent(data)) {
            // 触发删除 光标前替换字符
            this.deleteSearchPlaceHolder()
            this.insert(data)
        } else {
            this.target.focus()
        }
    }.bind(this)
    emitSearch = function (data = {}) {
        // 当前输入的字符
        let {
            inputData = ''
        } = data
        let selection = window.getSelection()
        // 光标前所有字符
        let beforeCaretStr = ''
        // 光标和@之间的字符
        let betweenMarkAndCaretStr = ''
        if (selection.anchorNode.data) {
            // 通用的方式实现 --- 通过光标的 offset @位置  截取 计算
            // 注意 此处由于之前  插入输入@字符时 会对 节点进行TextNode的截断所以用此种方式简化实现
            // 获取光标前所有字符串，应该使用focusOffset 光标焦点处
            // 但输入时 锚点(anchor)和焦点(focus)是在同一个位置
            beforeCaretStr = selection.anchorNode.data.slice(0, selection.anchorOffset)
            // 截取@后面的字符传
            betweenMarkAndCaretStr = selection.anchorNode.data.includes('@') && selection.anchorNode.data.slice(selection.anchorNode.data.lastIndexOf('@') + 1, selection.anchorOffset)
        }
        this.emitEvent('search', {
            inputData,
            cursorPosition: this.cursorPos,
            betweenMarkAndCaretStr,
            beforeCaretStr
        })
        return {
            beforeCaretStr,
            betweenMarkAndCaretStr
        }
    }.bind(this)
    // ----------Dom事件回调----------END

    emitEvent(name, detail = {}) {
        let event = new CustomEvent(`@MT::${name}`, {
            'detail': Object.assign(detail, {
                instanceThis: this
            })
        })
        this.PopoverInstance.getElement().dispatchEvent(event)
    }
    // 删除 用于搜索的 部分字符
    deleteSearchPlaceHolder() {
        let selection = window.getSelection()
        let searchNode = selection.anchorNode
        let searchRange = new Range()
        searchRange.setStart(searchNode, searchNode.textContent.lastIndexOf('@'))
        searchRange.setEnd(searchNode, searchNode.textContent.length)
        searchRange.deleteContents()
    }
    // 直接在光标处或者自定义位置插入不可删除节点
    insert(params) {
        // 触发隐藏PopoverList
        this.PopoverInstance.hide()
        let {
            tagText = '',
            tagid = '',
            insertCustomPositionFun = this.customInsertFunc
        } = params
        let tag = MentionTag.canDelTagGenerator({
            tagText: ` ${this.MarkChar}${tagText} `,
            tagid,
            tagClass: this.tagClass
        })

        if (insertCustomPositionFun) {
            // 插入自定义位置
            insertCustomPositionFun(this.target, tag)
        } else {
            // 插入当前位置  若 光标不再当前输入区 往输入区末尾插入  Todo此处可保存下 光标位置 在光标出插入
            let selection = window.getSelection()
            let anchorNode = selection.anchorNode
            let isFocus = anchorNode === this.target || anchorNode.parentNode === this.target
            // 前后需要空格断开否则会有问题
            let tagHtml = ` ${tag.outerHTML} `
            isFocus ? document.execCommand('insertHTML', false, tagHtml) : (this.target.innerHTML = this.target.innerHTML + tagHtml)

            // 此处为 document.execCommand 实现
            // 同样可以使用 Range 选区实现
            // 当前位置插入
            // let selection = window.getSelection()
            // let range = new Range()
            // range.setStart(selection.anchorNode, selection.anchorOffset)
            // range.collapse()
            // range.insertNode(tag)
            // tag.insertAdjacentText('beforebegin', ' ')
            // tag.insertAdjacentText('afterend', ' ')
        }
        this.target.focus()
    }
    // 进行TextNode截断及获取位置
    setCursorPosition() {
        let selection = window.getSelection()
        let range = new Range()
        let positionHold = document.createElement('i')
        // 注意节点内需要有一个文字节点 否则获取不到位置
        positionHold.appendChild(document.createTextNode(' '))
        range.setStart(selection.anchorNode, selection.anchorOffset)
        range.setEnd(selection.focusNode, selection.focusOffset)
        range.insertNode(positionHold)
        let cursorPos = positionHold.getBoundingClientRect()
        this.cursorPos = cursorPos
        range.selectNode(positionHold)
        range.deleteContents()
        // 还可以通过Range实现
        // range = document.createRange();
        // range.selectNode(document.getElementsByTagName("div").item(0));
        // rect = range.getBoundingClientRect();
        return cursorPos
    }
    // 不可删除标签 生成器
    static canDelTagGenerator = (function () {
        let tagGenerator = null
        let tag = ''
        switch (browserTypeCheck) {
            // 谷歌 可以直接用  contentEditable=false 的任意标签
            // 不过 连续多个 不可删除标签在一起  删除是会有问题(被一次性全删除)
            // 需要在 标签两边 插入  一个 文字或控制的节点
            case 'chrome':
                tagGenerator = ({
                    tagText,
                    tagid,
                    tagClass = 'at-mention',
                    cssText
                }) => {
                    tag = document.createElement('span')
                    tag.setAttribute('data-tagid', tagid || tagText)
                    tag.className = tagClass || 'at-mention'
                    tag.style.cssText = cssText
                    tag.innerHTML = tagText
                    tag.contentEditable = false
                    return tag
                }
                break
            // 火狐 用  contentEditable=false 无法删除
            // 使用  img 配合 alt 巧妙实现
            default:
                tagGenerator = ({
                    tagText,
                    tagid,
                    tagClass = 'at-mention',
                    cssText
                }) => {
                    tag = document.createElement('img')
                    tag.setAttribute('data-tagid', tagid || tagText)
                    tag.className = tagClass
                    tag.style.cssText = cssText
                    tag.alt = tagText
                    return tag
                }
                break
        }
        return tagGenerator
    }())
}
// 例如自定义往前插入
// customInsertFunc: (target, tag) => {
//     let AtMentionNodes = target.querySelectorAll('.mx-at-user')
//     // 永远往前插入
//     // 每个标签都有空text节点 分割开来 ---- 也可使用控制字符或者零宽字符
//     if (AtMentionNodes.length) {
//       AtMentionNodes[AtMentionNodes.length - 1].insertAdjacentElement('afterend', tag)
//       tag.insertAdjacentText('beforebegin', ' ')
//     } else {
//     // 插入第一个标签的时候 在该标签前后插入text节点 防止 有些浏览器下 光标不可用
//       target.insertAdjacentElement('afterbegin', tag)
//       tag.insertAdjacentText('beforebegin', ' ')
//       tag.insertAdjacentText('afterend', ' ')
//     }
//     target.focus()
//   }

export default MentionTag