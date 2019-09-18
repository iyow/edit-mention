// <!-- beforebegin -->
// <p>
// <!-- afterbegin -->
// foo
// <!-- beforeend -->
// </p>
// <!-- afterend -->
function showAtListDom(list, pos) {
    let domContainer = document.getElementById('pop-list-xx001')

    if (!domContainer) {
        console.log('-------------', domContainer, pos)

        domContainer = document.createElement('div')
        domContainer.style.position = 'absolute'
        domContainer.id = 'pop-list-xx001'
        domContainer.style.cssText = `position:absolute;width:200px;height:300px;background-color:tomato;color:yellowgreen;overflow:auto;`
        domContainer.style.top = pos.y - 300 + 'px'
        domContainer.style.left = pos.x + 'px'
        domContainer.innerHTML = list.map(l => `<span>${l.showName}</span>`).join()
        document.body.appendChild(domContainer)
    } else {
        console.log('-------------', domContainer, pos)
        domContainer.style.top = pos.y - 300 + 'px'
        domContainer.style.left = pos.x + 'px'
        domContainer.innerHTML = list.map(l => `<span>${l.showName}</span>`).join()
    }

    return domContainer
}