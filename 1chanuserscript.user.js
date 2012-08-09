// ==UserScript==
// @name 1chan Extension Tools
// @author postman, ayakudere
// @version 0.3.3
// @icon http://1chan.ru/ico/favicons/1chan.ru.gif
// @downloadURL https://github.com/postmanlololol/1chan-Extension-Tools/raw/master/1chanuserscript.user.js
// @include http://1chan.ru/news/*
// ==/UserScript==

// Globals
var formTextarea; 

if(navigator.appName == "Opera")
    document.addEventListener('DOMContentLoaded', function() {
    createRepliesMap();
    createSmilePanel();
    createMarkupPanel();
    formTextarea = document.getElementById("comment_form_text");
    })

// Replies map
function createRepliesMap() {
    
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
            container.innerHTML += ', '
        }
        container.innerHTML = container.innerHTML.substring(0, container.innerHTML.length-2)
        comment = document.getElementById("comment_"+post_num)
        if(comment)
            comment.appendChild(container.parentNode)
  }
}
  
// Smile panel
function addTextToForm(text) {
    formTextarea.value += text;
};

function createSmile(name, ext) {
  
    var image = document.createElement("img");
    var link = document.createElement("a");
  
    link.href = "#";
    link.onclick = function() {
        addTextToForm(":" + name + ":");
        return false;
    };
    link.title = name;
    image.src = "http://1chan.ru/img/" + name + ext;
    image.style.padding = "5px 3px 2px 3px";
    link.style.outline  = "none";
    link.appendChild(image);
    return link;
}

function createSmilePanel() {
  
    var container = document.createElement("div");
    var gifSmileList = [ "coolface", "desu", "nyan", "sobak", "trollface"];
    var pngSmileList = ["awesome", "ffuu", "okay", "rage"];
    
    for(var i in gifSmileList) 
    {
        container.appendChild(createSmile(gifSmileList[i], ".gif"));
    }
    for(var i in pngSmileList) 
    {
        container.appendChild(createSmile(pngSmileList[i], ".png"));
    }
    container.style.margin = "10px";
    container.style.paddingLeft = "8px";
    container.style.border = "1px solid #CCCCCC";
    container.style.borderRadius = "5px 5px 5px 5px"
    document.getElementById("comment_form").insertBefore(container, document.getElementsByClassName("b-comment-form")[0]);
}

// Markup panel
function getSelectionText(node) {
    var start = node.selectionStart;
    var end = node.selectionEnd;
    return node.value.substring(start, end);
}

function wrapText(text, wrapper) {
    return wrapper + text + wrapper;
}

function createButton(value, onclick) {
    var button   = document.createElement("input");
    button.type  = "button";
    button.value = value;
    button.onclick = onclick;
    return button;
}

function wrapImageLink(link) {
    if (!link) 
    {
        return "";
    } else if (/rghost/.test(link)) 
    {
        return "[:" + /(\d+)\D*$/.exec(link)[1] + ":]";
    } else 
    {
        return "[" + link + "]";
    }
}

function imgClick() {
  
    var link = getSelectionText(formTextarea);
  
    if (link.length > 0) 
    {
        var formText = formTextarea.value;
        formTextarea.value  = formText.slice(0, formTextarea.selectionStart) +
                            wrapImageLink(link) +
                            formText.slice(formTextarea.selectionEnd);
    } else 
    {
        formTextarea.value += wrapImageLink(prompt('Ссылка на изображение:'));
    }
}

function quoteClick() {
  
    var text = getSelectionText(formTextarea);
  
    if (text.length > 0) 
    {
        var formText = formTextarea.value;
        var lines = text.split("\n");
        for(var i in lines)
        {
            lines[i] = ">>" + lines[i].trim() + "<<";
        }
        formTextarea.value = formText.slice(0, formTextarea.selectionStart) +
                            lines.join("\n") +
                            formText.slice(formTextarea.selectionEnd);
    } else 
    {
        text = getSelection().getRangeAt(0).toString();
        var lines = text.split("\n");
        for(var i in lines) 
        {
            lines[i] = ">" + lines[i].trim();
        }
        formTextarea.value += lines.join("\n");
    }
}

function bigBoldClick() {
  
    var text = getSelectionText(formTextarea);
    var lines = text.split("\n");
    const stars = "\n********************************************";
  
    if (text.length > 0) 
    {
        for(var i in lines) 
        {
            if (lines[i] !== "") 
                lines[i] += stars;
        }
        var formText = formTextarea.value;
        formTextarea.value = formText.slice(0, formTextarea.selectionStart) +
                            lines.join("\n") +
                            formText.slice(formTextarea.selectionEnd); 
    } else 
    {
    formTextarea.value += stars;
    }
}

function createMarkupPanel() {
  
    var container = document.createElement("div");
    var markup = {
        "B": ["**", "Жирный"],
        "I": ["*", "Наклонный"],
        "C": ["`", "Моноширный"],
        "S": ["%%", "Спойлер"]
    };
    var imgButton = createButton("img", imgClick);
    var quoteButton = createButton(">", quoteClick);
    var bigBoldButton = createButton("BB", bigBoldClick);
  
    container.appendChild(imgButton);
    container.appendChild(quoteButton);
    container.appendChild(bigBoldButton);
  
    for(var k in markup)
    {
        var newButton = createButton(k, function() {
        var text = getSelectionText(formTextarea);
        var formText = formTextarea.value;
        formTextarea.value  = formText.slice(0, formTextarea.selectionStart) +
                                wrapText(text, markup[this.value][0]) +
                                formText.slice(formTextarea.selectionEnd);
        });
        container.appendChild(newButton);
    }
    container.style.paddingTop = "4px";
    document.getElementsByClassName("b-comment-form")[0].appendChild(container);
}

// Main 
if(navigator.appName != "Opera")
{   
    createRepliesMap();
    createSmilePanel();
    createMarkupPanel();
    formTextarea = document.getElementById("comment_form_text");
}
