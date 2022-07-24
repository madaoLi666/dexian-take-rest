(function () {

  var _STATUS0 = "NOSTART";
  var _STATUS1 = "PENDING";
  var _STATUS2 = "FINISHED";

  var _STATUS0_LIST = "_NOSTART_LIST";
  var _STATUS1_LIST = "_PENDING_LIST";
  var _STATUS2_LIST = "_FINISHED_LIST";

  var _STATUS_LIST = [_STATUS0, _STATUS1, _STATUS2];

  var nonClosedElementType = ['input', 'br'];

  var commonFunc = {
    bind: function (func, _this) {
      if (Object.prototype.toString.call(func) !== "[object Function]") {
        console.error("bind: support function only");
        return;
      }
      return function () {
        func.apply(_this, arguments);
      }
    },
    arrayListener: function (targetArr, cb) {
      if (Object.prototype.toString.call(targetArr) !== "[object Array]") {
        console.error("arrayListener: targetArr should be an array");
        return;
      }
      if (Object.prototype.toString.call(cb) !== "[object Function]") {
        console.error("arrayListener: cb should be a function");
        return;
      }
      const arrProto = Array.prototype;
      const newArrProto = Object.create(arrProto);
      ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function (methodStr) {
        let method = newArrProto[methodStr];
        newArrProto[methodStr] = function () {
          cb && cb(methodStr, this);
          return method.apply(this, arguments);
        }
      });
      targetArr.__proto__ = newArrProto;
    }
  }

  function createElement(tagName, configs, children) {
    const element = document.createElement(tagName);
    const props = {};
    if (configs) {
      for (let key in configs) {
        if (key === "class") {
          element.classList.add(configs[key]);
        } else {
          element[key] = configs[key];
        }
      }
    }
    const childrensLen = arguments.length - 2;
    let childrenArray = null;
    if (childrensLen === 1) {
      if (typeof children === "string") {
        element.appendChild(new Text(children));
      } else {
        element.appendChild(children);
      }
    } else {
      // childrenArray = new Array(childrensLen);
      for (let i = 0; i < childrensLen; i++) {
        element.appendChild(arguments[i + 2]);
      }
      // element.appendChild(childrenArray);
    }
    return element;
  }

  /** State Management */
  var State = (function () {
    /**
     * Class state
     * @param {_STATUS0|_STATUS1|_STATUS2} activeItem 
     * @param {Array<ItemData>} noStartList 
     * @param {Array<ItemData>} pendingList 
     * @param {Array<ItemData>} finishedList 
     * @param {HTMLElement} contentDOM
     */
    function State({ activeItem, noStartList, pendingList, finishedList, contentDom }) {
      this._activeItem = activeItem || _STATUS0;
      this[_STATUS0_LIST] = noStartList || [];
      this[_STATUS1_LIST] = pendingList || [];
      this[_STATUS2_LIST] = finishedList || [];
      this._contentDom = contentDom;
      let _self = this;
      this.render = commonFunc.bind(this.render, this);
      commonFunc.arrayListener(this[_STATUS0_LIST], _self.render);
      commonFunc.arrayListener(this[_STATUS1_LIST], _self.render);
      commonFunc.arrayListener(this[_STATUS2_LIST], _self.render);
      Object.defineProperty(this, "activeItem", {
        get: function () {
          return _self["_activeItem"];
        },
        set: function (value) {
          _self.render("", this[`_${value}_LIST`], value);
          _self["_activeItem"] = value;
        }
      })
    }

    State.prototype.sort = function (listKey) {
      if (listKey && this[listKey]) {
        this[listKey].sort(function (a, b) {
          return a - b;
        });
        return;
      }
      this.sort(_STATUS0_LIST);
      this.sort(_STATUS1_LIST);
      this.sort(_STATUS2_LIST);
    }

    /**
     * 
     * @param {ItemData} item 
     */
    State.prototype.push = function (itemData) {
      const status = itemData.getState();
      const listKey = "_" + status + "_LIST";
      this[listKey].push(itemData);
      this.sort(listKey);
      return;
    }

    /**
     * 
     * @param {object} data 
     * @returns {void}
     */
    State.prototype.create = function (data) {
      const { date = new Date(), author, title, description, status = this._activeItem } = data;
      console.log(this);
      let itemData = new ItemData(date, author, title, description, status);
      this.push(itemData);
      return;
    }

    /**
     * 
     * @param {_STATUS0|_STATUS1|_STATUS2} selected 
     */
    State.prototype.active = function (selected) {
      if (!_STATUS_LIST.includes(selected)) {
        this.activeItem = _STATUS0;
      } else {
        this.activeItem = selected;
      }
    }

    State.prototype.render = function (methodStr, itemDataList, value) {
      if (itemDataList.length === 0) {
        this._contentDom.innerHTML = null;
        return;
      }
      if (this._activeItem !== itemDataList[0]._status) {
        // no need to render
        return;
      }
      let _self = this;
      const doms = itemDataList.map((item) => {
        const { _date, _author = "", _title, _description = "", _status } = item;
        const id = _date.getTime();

        function start() {
          _self.move(item, _STATUS0, _STATUS1);
        }

        function finish() {
          _self.move(item, _STATUS0, _STATUS2);
        }

        function del() {
          _self.del(item);
        }

        function getActionList(status) {
          if (status === _STATUS0) {
            return createElement("div", { class: "content-item-status-action-select" },
              createElement("div", { onclick: start }, "Start"),
              createElement("div", { onclick: finish }, "Finish"),
              createElement("div", { onclick: del }, "Delete")
            );
          }
          if (status === _STATUS1) {
            return createElement("div", { class: "content-item-status-action-select" },
              createElement("div", null, "Finish"),
              createElement("div", null, "Delete")
            );
          }
          if (status === _STATUS2) {
            return createElement("div", { class: "content-item-status-action-select" },
              createElement("div", { onclick: internalFunc }, "Start"),
              createElement("div", null, "Finish"),
              createElement("div", null, "Delete")
            );
          }
        }

        const template = createElement("div", { class: "content-item", id: id },
          createElement("div", { class: "content-item-line-one" },
            createElement("div", { class: "content-item-title" },
              createElement("span", null,
                createElement("b", null, _title))),
            createElement("div", { class: "content-item-author" },
              createElement("span", null, _author)),
            createElement("div", { class: "content-item-status-action" },
              getActionList(_status)
            )
          ),
          createElement("div", { class: "content-item-description" },
            createElement("span", null, _description)
          ),
          createElement("div", { class: "content-item-date" },
            createElement("span", null, `${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate() + 1}`)
          ),
        );
        return template;
      });
      if (doms.length !== 0) {
        _self._contentDom.innerHTML = null;
        doms.forEach(function (dom) {
          _self._contentDom.appendChild(dom);
        })
      }

      return doms;
    }

    // We indentify the item with date
    State.prototype.move = function (item, from, to) {
      const fromListKey = "_" + from + "_LIST";
      const toListKey = "_" + to + "_LIST";
      console.log(toListKey);
      let index = -1;
      for (let i = 0; i < this[fromListKey].length; i++) {
        if (this[fromListKey][i]._date === item._date) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        this[fromListKey].splice(index, 1);
        item._status = to;
        this[toListKey].push(item);
        this.sort(toListKey);
      }
      
    }

    State.prototype.del = function (item) {

    }

    return State;
  })();

  /** Item Data */
  var ItemData = (function () {
    /**
      * 
      * @param {string|GMT} date 
      * @param {string} author 
      * @param {string} title 
      * @param {string} description 
      * @param {"NO STARTED"|"PENDING"|"FINISHED"} status 
      */
    function ItemData(date, author, title, description, status) {
      if (!title) {
        throw new Error("ItemData construction: title is necessery");
      }
      this._date = date || new Date();
      this._author = author;
      this._title = title;
      this._description = description;
      if (!_STATUS_LIST.includes(status)) {
        this._status = _STATUS0;
      } else {
        this._status = status;
      }
    }

    ItemData.prototype.getState = function () {
      return this._status;
    }

    return ItemData;
  })();

  /** UI Implement */
  var ItemStyle = (function () {
    function ItemStyle() {
      this._id = null;
    }

    return ItemStyle;
  })();

  var TodoItem = (function () {
    /**
     * @param {} data
     * @param {} style
     */
    function TodoItem(data, style) {
      this._data = new ItemData();
      this._style = new ItemStyle();
    }

    return TodoItem;
  })();

  /** Initialize the dom event listener */
  function headerItemEventInitialize(onSelected) {
    var headerItems = document.getElementsByClassName("header-item");
    for (let i = 0; i < headerItems.length; i++) {
      headerItems[i].addEventListener("click", function (e) {
        // reset their style to normal
        for (let j = 0; j < headerItems.length; j++) {
          headerItems[j].className = "header-item";
        }
        // Set active item
        e.target.className += " header-item-active";
        // need to do the enhancement later
        onSelected(_STATUS_LIST[i]);
      })
    }
  }

  /**
   * 
   * @param {function} onBlur 
   */
  function formInputEventInitialize(onBlur) {
    var formInput = document.getElementById("form-input");
    formInput.addEventListener("blur", function (e) {
      if (e.target.value) {
        onBlur({ title: e.target.value });
        e.target.value = "";
      }
    })
  }

  function init() {
    const contentDom = document.getElementById("content");
    const state = new State({ contentDom });
    const stateActiveFunc = commonFunc.bind(state.active, state);
    headerItemEventInitialize(stateActiveFunc);
    const stateCreateFunc = commonFunc.bind(state.create, state);
    formInputEventInitialize(stateCreateFunc);
  }

  init();

})();