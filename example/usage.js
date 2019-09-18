// 默认头像设置 base64
let DefaultAvatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

import Vue from 'vue'
// 用于生成组件实例
import AtPropoverList from '../mention-pop/test/at-popover-list.vue'
import MentionTag from '../mention-tag/src/mention-tag'

export default function atInit(target, componentThis) {
    let instance = new (Vue.extend(AtPropoverList))({
        data: {
            list: ['asd', 'bsd', 'qwe'],
            defaultAvatar: DefaultAvatar
        }
    })
    document.body.appendChild(instance.$mount().$el)
    console.log('------------AT挂载成功')
    let at = new MentionTag({
        MarkChar: '@',
        tagClass: 'iyow-at-user',
        targetNode: target,
        customInsertFunc: (target, tag) => {
            let AtMentionNodes = target.querySelectorAll('.iyow-at-user')
            // 永远往前插入
            if (AtMentionNodes.length) {
                AtMentionNodes[AtMentionNodes.length - 1].insertAdjacentElement('afterend', tag)
                tag.insertAdjacentText('beforebegin', ' ')
            } else {
                target.insertAdjacentElement('afterbegin', tag)
                tag.insertAdjacentText('beforebegin', ' ')
                tag.insertAdjacentText('afterend', ' ')
            }
            // target.focus()
        },
        beforeInsertEvent: function ({
            tagid
        }) {
            let flag = this.target.innerHTML.includes(`data-tagid="${tagid}"`)
            flag && componentThis.$message({
                type: 'warning',
                message: '请勿重复选择哦'
            })
            return !flag
        },
        PopoverInstance: instance
    })
    at.bindEvent()
    return at
}