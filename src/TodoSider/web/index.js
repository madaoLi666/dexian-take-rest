(function () {

  var _STATUS0 = "NOSTART";
  var _STATUS1 = "PENDING";
  var _STATUS2 = "FINISHED";

  var _STATUS0_LIST = "_NOSTART_LIST";
  var _STATUS1_LIST = "_PENDING_LIST";
  var _STATUS2_LIST = "_FINISHED_LIST";

  var _STATUS_LIST = [_STATUS0, _STATUS1, _STATUS2];


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

  /** Render */
  function renderer(methodStr, itemDataList) {
    const dom = itemDataList.map((item) => {
      const { _date, _author = "", _title, _description = "" } = item;
      const template = `
        <div class="content-item">
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
      return template;
    });
    document.getElementById("content").innerHTML = dom.join("");
    return dom;
  }

  /** State Management */
  var State = (function () {
    /**
     * Class state
     * @param {_STATUS0|_STATUS1|_STATUS2} activeItem 
     * @param {Array<ItemData>} noStartList 
     * @param {Array<ItemData>} pendingList 
     * @param {Array<ItemData>} finishedList 
     */
    function State(activeItem, noStartList, pendingList, finishedList) {
      this._activeItem = activeItem || _STATUS0;
      this[_STATUS0_LIST] = noStartList || [];
      this[_STATUS1_LIST] = pendingList || [];
      this[_STATUS2_LIST] = finishedList || [];
      let _self = this;
      commonFunc.arrayListener(this[_STATUS0_LIST], renderer);
      Object.defineProperty(this, "activeItem", {
        get: function () {
          return _self["_activeItem"];
        },
        set: function (value) {
          renderer("", this[`_${value}_LIST`]);
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
      this.sort();
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
    const state = new State();
    const stateActiveFunc = commonFunc.bind(state.active, state);
    headerItemEventInitialize(stateActiveFunc);
    const stateCreateFunc = commonFunc.bind(state.create, state);
    formInputEventInitialize(stateCreateFunc);
  }

  init();

})();