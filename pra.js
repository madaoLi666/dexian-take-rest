var _title = 1;
var _author = "author";
var _description = "desc";
var _date = new Date();
var html = `<div class="content-item">
  <div class="content-item-line-one">
    <div class="content-item-title">
      <span><b>${_title}</b></span>
    </div>
    <div class="content-item-author">
      <span>${_author}</span>
    </div>
    <div class="content-item-status-action">
      <div class="content-item-status-action-select">
        <div>Start</div>
        <div>Finish</div>
        <div>Delete</div>
      </div>
    </div>
  </div>
  <div class="content-item-description">
    <span>${_description}</span>
  </div>
  <div class="content-item-date">
    <span>${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate() + 1}</span>
  </div>
</div>
`;


function detectStartElement(str) {
  const reg = /\<(?<ele>[a-zA-Z]+)\s+(?<propeties>.*)\>/;
  const match = str.match(reg);
  if (match && match.length) {
    if (match.index !== 0) {
      console.error("JSX is wrong format");
      return;
    }
    let p = {};
    match.groups.propeties.split(" ").forEach(function (propety) {
      let [key, value] = propety.split("=");
      p[key] = value;
    })
    return {
      dom: match[0],
      ele: match.groups.ele,
      propeties: p,
      position: 0
    };
  }
  return "";
}

function detectEndElement(str, startInfo) {
  // const reg = /[.\n]*\<\/(?<ele>[a-zA-Z]+)\>/;
  // 最外层 应该在字符串结尾
  const outEnclosedReg = new RegExp("\<\/" + startInfo.ele + "+?\>\n?$");
  // 临近
  const adjoiningEclosedReg = new RegExp("[.\n]*" + "[\<" + startInfo.ele + "\s+.*\>[\n.]*\<\/" + startInfo.ele + "\>]*" + "\<\/" + startInfo.ele + "\>");
  const reg = /\<\/[a-zA-Z]+?\>\n?$/;
  const match = str.match(reg);
  // console.log(match);
  if (match && match.length && match.length !== 0) {
    return {
      dom: match[0],
      // ele: match.groups.ele,
      position: match.index
    };
  }
  return "";
}

function split(str) {
  let start = detectStartElement(str);
  if (!start) {
    return false;
  }
  let end = detectEndElement(str, start);
  if (!end) {
    return false;
  }
  // console.log(start);
  // console.log(end);
}

function jsx_parse(str) {
  let restHtml = str;
  split(restHtml);
}


jsx_parse(html);

let startInfo = {
  ele: "div"
};
// const adjoiningEclosedReg = new RegExp("[.\n]*" + "[\<" + startInfo.ele + "\s+.*\>[\n.]*\<\/" + startInfo.ele + "\>]*" + "\<\/" + startInfo.ele + "\>");
const adjoiningEclosedReg = new RegExp("(?<=[\<(\S)\>.*\<\/\1\>]+)\<\/div\>");
var t = `<i>1</i><i>1</a></div>`;

console.log(t.match(adjoiningEclosedReg));
console.log(t.length);
