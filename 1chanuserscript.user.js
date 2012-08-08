// ==UserScript==
// @name 1chan Extension Tools
// @author postman, ayakudere
// @version 0.2
// @icon http://1chan.ru/ico/favicons/1chan.ru.gif
// @downloadURL https://github.com/postmanlololol/1chan-Extension-Tools/blob/master/1chanuserscript.user.js
// @include http://1chan.ru/news/*
// ==/UserScript==

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
    }
    
    function addTextToForm(text) {
      document.getElementById("comment_form_text").value += text;
    };
    
    function createSmile(name, ext) {
      var image = document.createElement("img");
      var link  = document.createElement("a");
      link.href = "#";
      link.onclick = function() {
        addTextToForm(":" + name + ":");
        return false;
      };
      image.src = "http://1chan.ru/img/" + name + ext;
      link.appendChild(image);
      return link;
    }
    
    function createSmilePanel() {
      var container = document.createElement("div");
      var gifSmileList = [ "coolface", "desu", "nyan", "sobak", "trollface"];
      var pngSmileList = ["awesome", "ffuu", "okay", "rage"];
      for(var i in gifSmileList) {
        container.appendChild(createSmile(gifSmileList[i], ".gif"));
      }
      for(var i in pngSmileList) {
        container.appendChild(createSmile(pngSmileList[i], ".png"));
      }
      document.getElementById("comment_form").insertBefore(container, document.getElementsByClassName("b-comment-form")[0]);
    }
    
    createRepliesMap();
    createSmilePanel();