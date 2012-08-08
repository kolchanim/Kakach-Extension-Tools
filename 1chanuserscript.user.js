// ==UserScript==
// @name 1chan Extension Tools
// @author postman ayakudere
// @version 0.1
// @icon http://1chan.ru/ico/favicons/1chan.ru.gif
// @downloadURL https://github.com/postmanlololol/1chan-Extension-Tools/blob/master/1chanuserscript.user.js
// @include http://1chan.ru/news/*
// ==/UserScript==

    var comments = document.getElementsByClassName("b-comment");
    var table = {}
    for(var i=0; i<comments.length; i++)
    {
        current_post = comments[i].id.slice(8)
        refs = comments[i].getElementsByClassName("js-cross-link")
        for(var j=0; j<refs.length; j++)
        {
            ref = refs[j].name.slice(5)
            if(typeof(table[ref]) != 'undefined')
                table[ref].push(current_post)
            else
                table[ref] = [current_post]
        }
    }
    for(post_num in table)
    {
        container = document.createElement("div")
        container.id = "answers_"+post_num
        container.style.color = 'gray'
        container.appendChild(document.createElement('p'))
        container = container.lastChild
        container.style.margin = '0px'
        container.style.padding = '4px'
        container.style.fontSize = '0.8em'
        container.textContent = "Ответы: "
        for(post_ref in table[post_num])
        {
            link = document.createElement("a")
            link.className = "js-cross-link"
            link.href = document.URL + '#'+table[post_num][post_ref] 
            link.name = "news/"+table[post_num][post_ref]
            link.textContent = ">>"+table[post_num][post_ref]
            link.style.fontSize = '1em'
            container.appendChild(link)
            container.innerHTML += '; '
        }
        comment = document.getElementById("comment_"+post_num)
        if(comment)
            comment.appendChild(container.parentNode)
    }