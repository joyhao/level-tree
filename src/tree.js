class Tree {
  #selector = null;
  #params = null;
  #root = null;
  data = {};
  ids = [];
  nodes = {};
  #level = 0; // 总层级
  constructor(selector, params) {
    this.#selector = selector;
    this.#params = params;
    this.init();
  }
  init() {
    this.#root = this.#query();
    this.data = this.#getData();
    this.#render();
  }
  /**
   *
   * @param {*} arr // 每次递归的数组
   * @param {*} level //当前层级
   * @param {*} tml   // 存总的html
   * @param {*} html  存每次循环的html
   * @param {*} path  上一次索引path
   * @returns
   */
  #transform(arr = this.data, level = 1, path = "", tml = "", html = "") {
    this.#level = level; // 总层级
    arr.forEach((item, index) => {
      //--- 设置属性 start
      item.$fullPath = ""; // 初始化$fullPath
      item.$level = level; // 当前层级
      item.$index = index; // 当前层级的第几个元素
      item.$half = false; // 是否是半选
      item.$fullPath += `${path}[${index}]`;
      // --- end
      const child = item?.children;
      if (child?.length > 0) {
        html = this.#transform(child, level + 1, `${item.$fullPath}.children`);
      } else {
        html = "";
      }

      tml += this.#tml(item, html);
    });
    return tml;
  }
  #render() {
    this.#root.innerHTML = this.#transform();
    this.#on(this.#root, "click");
  }
  #getData() {
    const data = this.#params?.data?.[0]?.children;
    if (data) {
      return this.#params.data;
    }
    throw "数据结构不对";
  }
  #query() {
    if (!this.#selector) return document.querySelector("body");
    if (typeof this.#selector === "string")
      return document.querySelector(this.#selector);
    return this.#selector;
  }
  #tml(item, html) {
    return `<ul class="nodes level-${item.$level} ${this.#initNear(item)}">
    <li class="node">
      <div class="content" ${this.#initContent(item)}>
        ${this.#initExpand(item)}
        ${this.#initCheckBox(item)}
        <label  for="checkbox-${item.id}"> ${item.label} </label>
      </div>

      ${html}

    </li>
  </ul>`;
  }

  // 是否渲染嵌套勾选
  #initNear(item) {
    if (item.$level === 1) {
      return `${this.#params.near ? "near" : ""}`;
    }
    return "";
  }

  // 初始化渲染设置属性
  #initContent(item, attr = "") {
    if (this.#params.expand >= item.$level) {
      item["expand"] = true;
    }
    Object.keys(item).forEach((k) => {
      if (typeof item[k] === "boolean" && item[k]) {
        attr += `${k} `;
      }
    });
    return attr;
  }
  // 初始化渲染展开按钮
  #initExpand(item) {
    return `<button 
      event="expand"   
      class="expand" 
      id="expand-${item.id}"  
      data-full-path="${item.$fullPath}" 
      ${item.children?.length ? "data-has-node" : ""}
    >
    </button>`;
  }
  // 初始化渲染勾选按钮
  #initCheckBox(item) {
    return `<button 
        event="checked"
        class="checkbox" 
        id="checkbox-${item.id}"
        data-full-path="${item.$fullPath}" 
        ${item.children?.length ? "data-has-node" : ""}
      >
      </button>
    `;
  }

  //--- 事件
  #on(observer, eventType) {
    observer.addEventListener(
      eventType,
      (e) => {
        const target = e.target || e.srcElement; //target就是当前对象
        const eventId = target.getAttribute("event");
        switch (eventId) {
          case "expand":
            this.#expand(target, eventId);
            break;
          case "checked":
            this.#checked(target, eventId);
            break;
          default:
            break;
        }
      },
      false
    );
  }

  #expand(target, eventId) {
    const parent = target.parentNode;
    const fullPath = target.dataset["fullPath"];
    const fn = new Function(`return this.data${fullPath}`).bind(this)(); // 代替eval
    fn[eventId] = !fn[eventId];

    if (fn[eventId]) {
      parent.setAttribute(eventId, "");
    } else {
      parent.removeAttribute(eventId);
    }
    return {
      target,
      parent,
      fullPath,
      fn,
      val: fn[eventId],
    };
  }
  #checked(target, eventId) {
    const { parent, fullPath, fn, val } = this.#expand(target, eventId);
    this.#filter(fn);
    return;
    // 勾选嵌套问题
    if (this.#params.near) {
      return;
    }
    const p = parent.parentNode;
    const child = fn.children;
    if (child.length <= 0) {
      return;
      //  fn.$half = true;
      // p.setAttribute("half", "");
    } else {
      // fn.$half = false;
      // p.removeAttribute("half");
    }
    // 修改数据的状态
    // fn.children = child.map((item) => {
    //   item.checked = val;
    //   return item;
    // });
    // console.log(fn);
    // 修改dom 状态
    // if (val) {
    //   p.setAttribute(eventId, "");
    // } else {
    //   p.removeAttribute(eventId);
    // }
    // const cb = Array.from(parent.parentNode.querySelectorAll("ul .checkbox"));
    // cb.forEach((ele) => {
    //   if (val) {
    //     ele.setAttribute(eventId, "");
    //   } else {
    //     ele.removeAttribute(eventId);
    //   }
    // });
  }
  // 获取勾选的阶段
  #filter(item) {
    if (item.checked) {
      this.nodes[item.id] = item;
    } else {
      delete this.nodes[item.id];
    }
  }
  // 暴露外面使用
  getNodes() {
    return {
      nodes: this.nodes,
      ids: Object.keys(this.nodes).filter((k) => this.nodes[k].id),
    };
  }
}
