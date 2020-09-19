# edit-mention
> If you're looking for a complete solution，It is recommended that you can try to use the [draft-js](https://github.com/facebook/draft-js) and its plug-in system [draft-js-plugins](https://github.com/draft-js-plugins/draft-js-plugins)(about mention module).]
## 总体设计

![整体架构图](./overall-structural-design.png)

## 标签插入整体思路

![整体思路图](./overall_thinking.jpg)

## 模块一： mention-pop 组件
> 提示弹出框选取组件
- [ ] 原生DOM实现
- [ ] 生成Vue组件，React组件，WebComponent组件
最终都是构造一个弹出框实例对象用于渲染及与mention-tag模块进行通信 (通过render函数或者写一套JSX直接转换)

## 模块二： mention-tag 模块
> 输入区标签插入控制模块
### mention taget
- [x] 适配可编辑元素(contenteditable=true)
- [ ] 适配HTMLTextAreaElement，HTMLInputElement封装元素(由于使用shadowdom封装无法获取到selection和Range只能通过Dom元素暴露的属性及方法进行操作setSelectionRange)
### mention tag
- [x] 生成/插入 可直接删除的标签
- [x] 通过 contenteditable 生成可直接删除的标签
- [x] 通过 img 的 alt 模拟可直接删除的标签
- [ ] 通过 img 的 background-img（dataurl，SVG-text，CSS Houdini-paint） 模拟可直接删除的标签
- [ ] 通过 canvas 生成图片标签 模拟可直接删除的标签
- [ ] 标签可配置化(可选择标签 是否 可直接删除等)

## DOC
